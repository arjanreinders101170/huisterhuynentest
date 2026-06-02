import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { esc, lodgePhoto, welcomeEmail, thankYouEmail, lateCheckoutEmail } from "@/lib/email";
import { APP_URL_FALLBACK, lodgeName } from "@/data/lodge";
import { GOOGLE_REVIEW_URL } from "@/lib/google-reviews";

export async function handleStaysGet(table: string): Promise<NextResponse | null> {
  if (table !== "stays") return null;
  const { data: staysRaw } = await getSupabase()
    .from("stays")
    .select("*")
    .order("check_in", { ascending: false })
    .limit(50);
  const staysList = staysRaw || [];
  const guestIds = [...new Set(staysList.map((s: { guest_id: string }) => s.guest_id).filter(Boolean))];
  let guestLookup: Record<string, { naam: string; email: string }> = {};
  if (guestIds.length > 0) {
    const { data: guestsData } = await getSupabase().from("guests").select("id, naam, email").in("id", guestIds);
    if (guestsData) {
      guestLookup = Object.fromEntries(guestsData.map((g: { id: string; naam: string; email: string }) => [g.id, { naam: g.naam, email: g.email }]));
    }
  }
  const enriched = staysList.map((s: { guest_id: string }) => ({ ...s, guests: guestLookup[s.guest_id] || null }));
  return NextResponse.json({ data: enriched });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function handleStaysPost(action: string, body: Record<string, unknown>, _request: NextRequest): Promise<NextResponse | null> {
  switch (action) {
    case "create_stay": {
      const { naam, email, lodge, check_in, check_out } = body;
      if (!naam || !email || !lodge || !check_in || !check_out) {
        return NextResponse.json({ error: "Alle velden zijn verplicht" }, { status: 400 });
      }
      let guestId = null;
      try {
        const { data } = await getSupabase().rpc("upsert_guest", { p_naam: naam, p_email: email });
        guestId = data;
      } catch {
        const { data: existing } = await getSupabase().from("guests").select("id").eq("email", email).single();
        if (existing) {
          guestId = existing.id;
        } else {
          const { data: created } = await getSupabase().from("guests").insert({ naam, email, profiel: "gast" }).select("id").single();
          guestId = created?.id;
        }
      }
      if (!guestId) {
        return NextResponse.json({ error: "Kon gast niet aanmaken" }, { status: 500 });
      }
      const { randomBytes, randomInt } = await import("crypto");
      const token = randomBytes(24).toString("hex");
      const door_code = String(randomInt(1000, 9999));
      const { error } = await getSupabase().from("stays").insert({
        guest_id: guestId, lodge, check_in, check_out, token, door_code,
        status: "gepland", welcome_sent: false,
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }
    case "send_welcome": {
      const stayId = body.id;
      if (!stayId) return NextResponse.json({ error: "Stay ID verplicht" }, { status: 400 });

      const { data: stay, error: stayErr } = await getSupabase().from("stays").select("*").eq("id", stayId).single();
      if (stayErr || !stay) return NextResponse.json({ error: "Verblijf niet gevonden" }, { status: 404 });

      const { data: guest } = await getSupabase().from("guests").select("naam, email").eq("id", stay.guest_id).single();
      if (!guest || !guest.email) return NextResponse.json({ error: "Gast niet gevonden of geen emailadres" }, { status: 404 });

      const resendKey = process.env.RESEND_API_KEY;
      if (!resendKey) return NextResponse.json({ error: "Resend niet geconfigureerd" }, { status: 500 });

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || APP_URL_FALLBACK;
      const baseUrl = new URL(appUrl).origin;
      const lodgeNaam = lodgeName(stay.lodge);
      const { url: photoUrl } = lodgePhoto(baseUrl, stay.lodge);
      const checkInDate = new Date(stay.check_in).toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });
      const checkOutDate = new Date(stay.check_out).toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });
      const appLink = `${appUrl}?s=${stay.token}`;
      const firstName = esc((guest.naam || "").split(" ")[0] || guest.naam || "");

      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);

      await resend.emails.send({
        from: "Huis ter Huynen <lodge@huisterhuynen.nl>",
        to: [guest.email],
        subject: `Jouw gast-app staat klaar — ${checkInDate}`,
        html: welcomeEmail({
          firstName, lodgeNaam: esc(lodgeNaam), photoUrl,
          checkInDate, checkOutDate, appLink, doorCode: String(stay.door_code),
        }),
      });

      await getSupabase().from("stays").update({
        welcome_sent: true, welcome_sent_at: new Date().toISOString(),
      }).eq("id", stayId);

      return NextResponse.json({ success: true });
    }
    case "get_stay_link": {
      const stayId = body.id;
      if (!stayId) return NextResponse.json({ error: "Stay ID verplicht" }, { status: 400 });

      const { data: stay } = await getSupabase().from("stays").select("token, status, check_out").eq("id", stayId).single();
      if (!stay) return NextResponse.json({ error: "Verblijf niet gevonden" }, { status: 404 });
      if (stay.status === "vertrokken") return NextResponse.json({ error: "Verblijf afgesloten" }, { status: 400 });
      const checkOut = new Date(stay.check_out);
      checkOut.setHours(23, 59, 59);
      if (Date.now() > checkOut.getTime()) return NextResponse.json({ error: "Verblijf verlopen" }, { status: 400 });

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || APP_URL_FALLBACK;
      return NextResponse.json({ link: `${appUrl}?s=${stay.token}` });
    }
    case "rotate_stay_token": {
      const stayId = body.id;
      if (!stayId) return NextResponse.json({ error: "Stay ID verplicht" }, { status: 400 });

      const { data: stay } = await getSupabase().from("stays").select("status, check_out").eq("id", stayId).single();
      if (!stay) return NextResponse.json({ error: "Verblijf niet gevonden" }, { status: 404 });
      if (stay.status === "vertrokken") return NextResponse.json({ error: "Verblijf afgesloten" }, { status: 400 });
      const checkOut = new Date(stay.check_out);
      checkOut.setHours(23, 59, 59);
      if (Date.now() > checkOut.getTime()) return NextResponse.json({ error: "Verblijf verlopen" }, { status: 400 });

      const { randomBytes } = await import("crypto");
      const newToken = randomBytes(24).toString("hex");
      const { error } = await getSupabase().from("stays").update({ token: newToken }).eq("id", stayId);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || APP_URL_FALLBACK;
      return NextResponse.json({ success: true, link: `${appUrl}?s=${newToken}` });
    }
    case "send_late_checkout": {
      // Manual override — same dedup guard as the evening cron to prevent double-sends.
      const stayId = body.id;
      if (!stayId) return NextResponse.json({ error: "Stay ID verplicht" }, { status: 400 });

      const { data: stay } = await getSupabase().from("stays").select("*").eq("id", stayId).single();
      if (!stay) return NextResponse.json({ error: "Verblijf niet gevonden" }, { status: 404 });

      const { data: guest } = await getSupabase().from("guests").select("naam, email").eq("id", stay.guest_id).single();
      if (!guest?.email) return NextResponse.json({ error: "Geen emailadres" }, { status: 404 });

      const resendKey = process.env.RESEND_API_KEY;
      if (!resendKey) return NextResponse.json({ error: "Resend niet geconfigureerd" }, { status: 500 });

      const { data: existing } = await getSupabase()
        .from("bookings").select("id")
        .eq("product", "late-checkout-email")
        .filter("metadata->>stay_id", "eq", stayId)
        .limit(1);
      if (existing && existing.length > 0) return NextResponse.json({ success: true, alreadySent: true });

      const appUrlLc = process.env.NEXT_PUBLIC_APP_URL || APP_URL_FALLBACK;
      const appLinkLc = `${appUrlLc}?s=${stay.token}`;
      const baseUrlLc = new URL(appUrlLc).origin;
      const lodgeNaamLc = lodgeName(stay.lodge);
      const photoLc = stay.lodge === "lodge_1" ? `${baseUrlLc}/lodge-heide.jpg` : `${baseUrlLc}/lodge-eik.jpg`;
      const firstName = esc((guest.naam || "").split(" ")[0] || guest.naam || "");

      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);

      await resend.emails.send({
        from: "Huis ter Huynen <lodge@huisterhuynen.nl>",
        to: [guest.email],
        subject: "Nog één nacht — tot morgen 11:00",
        html: lateCheckoutEmail({
          firstName, lodgeNaam: esc(lodgeNaamLc), photoUrl: photoLc, appLink: appLinkLc,
        }),
      });

      await getSupabase().from("bookings").insert({
        guest_id: stay.guest_id, product: "late-checkout-email", prijs: 0, status: "betaald",
        metadata: { type: "late-checkout", stay_id: stayId, sent_at: new Date().toISOString(), source: "admin" },
      });

      return NextResponse.json({ success: true });
    }
    case "send_thankyou": {
      const stayId = body.id;
      if (!stayId) return NextResponse.json({ error: "Stay ID verplicht" }, { status: 400 });

      const { data: stay } = await getSupabase().from("stays").select("*").eq("id", stayId).single();
      if (!stay) return NextResponse.json({ error: "Verblijf niet gevonden" }, { status: 404 });

      const { data: guest } = await getSupabase().from("guests").select("naam, email").eq("id", stay.guest_id).single();
      if (!guest?.email) return NextResponse.json({ error: "Geen emailadres" }, { status: 404 });

      const resendKey = process.env.RESEND_API_KEY;
      if (!resendKey) return NextResponse.json({ error: "Resend niet geconfigureerd" }, { status: 500 });

      const appUrlTy = process.env.NEXT_PUBLIC_APP_URL || APP_URL_FALLBACK;
      const baseUrlTy = new URL(appUrlTy).origin;
      const firstName = esc((guest.naam || "").split(" ")[0] || guest.naam || "");
      const { url: photoUrlTy } = lodgePhoto(baseUrlTy, stay.lodge);

      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);

      await resend.emails.send({
        from: "Huis ter Huynen <lodge@huisterhuynen.nl>",
        to: [guest.email],
        subject: "Bedankt voor je bezoek — Huis ter Huynen",
        html: thankYouEmail({ firstName, photoUrl: photoUrlTy, reviewLink: GOOGLE_REVIEW_URL }),
      });

      await getSupabase().from("stays").update({ status: "vertrokken" }).eq("id", stayId);

      return NextResponse.json({ success: true });
    }
    default:
      return null;
  }
}
