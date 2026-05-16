import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { APP_URL_FALLBACK, lodgeName } from "@/data/lodge";
import { esc, welcomeEmail, lateCheckoutEmail, thankYouEmail, followUpEmail, lodgePhoto } from "@/lib/email";

export const runtime = "nodejs";

function localDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// GET — called by Vercel Cron. ?type=morning (09:00) or ?type=evening (20:00)
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const type = request.nextUrl.searchParams.get("type") ?? "morning";
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return NextResponse.json({ error: "Resend niet geconfigureerd" }, { status: 500 });

  const { Resend } = await import("resend");
  const resend = new Resend(resendKey);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || APP_URL_FALLBACK;
  const baseUrl = new URL(appUrl).origin;

  const results: Record<string, number> = {};

  try {
    if (type === "morning") {
      // ── 1. Welcome emails — 3 days before check-in ──
      const inThreeDays = new Date();
      inThreeDays.setDate(inThreeDays.getDate() + 3);

      const { data: welcomeStays } = await getSupabase()
        .from("stays")
        .select("*")
        .eq("check_in", localDate(inThreeDays))
        .eq("welcome_sent", false);

      let welcomeSent = 0;
      for (const stay of welcomeStays ?? []) {
        const { data: guest } = await getSupabase()
          .from("guests").select("naam, email").eq("id", stay.guest_id).single();
        if (!guest?.email) continue;

        const lodgeNaam = lodgeName(stay.lodge);
        const photo = stay.lodge === "lodge_1" ? `${baseUrl}/lodge-heide.jpg` : `${baseUrl}/lodge-eik.jpg`;
        const checkInDate = new Date(stay.check_in).toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });
        const checkOutDate = new Date(stay.check_out).toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });
        const firstName = esc((guest.naam || "").split(" ")[0] || guest.naam || "");

        try {
          await resend.emails.send({
            from: "Huis ter Huynen <lodge@huisterhuynen.nl>",
            to: [guest.email],
            subject: `Jouw gast-app staat klaar — ${checkInDate}`,
            html: welcomeEmail({
              firstName,
              lodgeNaam: esc(lodgeNaam),
              photoUrl: photo,
              checkInDate,
              checkOutDate,
              appLink: `${appUrl}?s=${stay.token}`,
              doorCode: String(stay.door_code),
            }),
          });
          await getSupabase().from("stays")
            .update({ welcome_sent: true, welcome_sent_at: new Date().toISOString() })
            .eq("id", stay.id);
          welcomeSent++;
        } catch (e) {
          console.error("Welcome cron failed for stay", stay.id, e);
        }
      }
      results.welcome = welcomeSent;

      // ── 2. Thankyou emails — check_out was yesterday, not yet vertrokken ──
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { data: thankyouStays } = await getSupabase()
        .from("stays")
        .select("*")
        .eq("check_out", localDate(yesterday))
        .neq("status", "vertrokken");

      let thankYouSent = 0;
      for (const stay of thankyouStays ?? []) {
        const { data: guest } = await getSupabase()
          .from("guests").select("naam, email").eq("id", stay.guest_id).single();
        if (!guest?.email) continue;

        const firstName = esc((guest.naam || "").split(" ")[0] || guest.naam || "");
        const { url: thankPhoto } = lodgePhoto(baseUrl, stay.lodge);

        try {
          await resend.emails.send({
            from: "Huis ter Huynen <lodge@huisterhuynen.nl>",
            to: [guest.email],
            subject: "Bedankt voor je bezoek — Huis ter Huynen",
            html: thankYouEmail({ firstName, photoUrl: thankPhoto, reviewLink: appUrl }),
          });
          await getSupabase().from("stays").update({ status: "vertrokken" }).eq("id", stay.id);
          thankYouSent++;
        } catch (e) {
          console.error("Thankyou cron failed for stay", stay.id, e);
        }
      }
      results.thankyou = thankYouSent;

      // ── 3. Follow-up emails — 14+ days since visit, not yet ontvangen ──
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 14);

      const { data: followupGuests } = await getSupabase()
        .from("guests")
        .select("id, naam, email, laatste_bezoek")
        .lt("laatste_bezoek", cutoff.toISOString())
        .order("laatste_bezoek", { ascending: false })
        .limit(20);

      let followupSent = 0;
      for (const fg of followupGuests ?? []) {
        if (!fg.email) continue;
        const { data: existing } = await getSupabase()
          .from("bookings").select("id")
          .eq("guest_id", fg.id).eq("product", "follow-up-email").limit(1);
        if (existing && existing.length > 0) continue;

        // Look up de laatste lodge zodat de foto klopt; fallback naar lodge_1
        const { data: lastStay } = await getSupabase()
          .from("stays").select("lodge").eq("guest_id", fg.id)
          .order("check_out", { ascending: false }).limit(1).maybeSingle();
        const { url: followPhoto } = lodgePhoto(baseUrl, lastStay?.lodge || "lodge_1");
        const followFirstName = esc((fg.naam || "").split(" ")[0] || fg.naam || "");

        try {
          await resend.emails.send({
            from: "Huis ter Huynen <lodge@huisterhuynen.nl>",
            to: [fg.email],
            subject: "Hoe was je verblijf? — Huis ter Huynen",
            html: followUpEmail({ firstName: followFirstName, photoUrl: followPhoto, reviewLink: appUrl, bookLink: appUrl }),
          });
          await getSupabase().from("bookings").insert({
            guest_id: fg.id, product: "follow-up-email", prijs: 0, status: "betaald",
            metadata: { type: "follow-up", sent_at: new Date().toISOString() },
          });
          followupSent++;
        } catch (e) {
          console.error("Follow-up cron failed for guest", fg.id, e);
        }
      }
      results.followup = followupSent;
    }

    if (type === "evening") {
      // ── Late checkout emails — check_out is tomorrow, not yet verstuurd ──
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: lcStays } = await getSupabase()
        .from("stays")
        .select("*")
        .eq("check_out", localDate(tomorrow));

      let lcSent = 0;
      for (const stay of lcStays ?? []) {
        const { data: guest } = await getSupabase()
          .from("guests").select("naam, email").eq("id", stay.guest_id).single();
        if (!guest?.email) continue;

        // Prevent double-send per stay
        const { data: existing } = await getSupabase()
          .from("bookings").select("id")
          .eq("product", "late-checkout-email")
          .filter("metadata->>stay_id", "eq", stay.id)
          .limit(1);
        if (existing && existing.length > 0) continue;

        const lodgeNaam = lodgeName(stay.lodge);
        const photo = stay.lodge === "lodge_1" ? `${baseUrl}/lodge-heide.jpg` : `${baseUrl}/lodge-eik.jpg`;
        const firstName = esc((guest.naam || "").split(" ")[0] || guest.naam || "");

        try {
          await resend.emails.send({
            from: "Huis ter Huynen <lodge@huisterhuynen.nl>",
            to: [guest.email],
            subject: "Nog één nacht — tot morgen 11:00",
            html: lateCheckoutEmail({
              firstName,
              lodgeNaam: esc(lodgeNaam),
              photoUrl: photo,
              appLink: `${appUrl}?s=${stay.token}`,
            }),
          });
          await getSupabase().from("bookings").insert({
            guest_id: stay.guest_id, product: "late-checkout-email", prijs: 0, status: "betaald",
            metadata: { type: "late-checkout", stay_id: stay.id, sent_at: new Date().toISOString() },
          });
          lcSent++;
        } catch (e) {
          console.error("Late checkout cron failed for stay", stay.id, e);
        }
      }
      results.late_checkout = lcSent;
    }

    return NextResponse.json({ ok: true, type, results });
  } catch (err) {
    console.error("Email cron error:", err);
    return NextResponse.json({ error: "Cron mislukt" }, { status: 500 });
  }
}

