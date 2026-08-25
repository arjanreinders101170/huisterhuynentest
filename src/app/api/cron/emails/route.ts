import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { logSentEmail } from "@/lib/mail-log";
import { APP_URL_FALLBACK, lodgeName } from "@/data/lodge";
import {
  esc, welcomeEmail, lateCheckoutEmail, thankYouEmail, followUpEmail, lodgePhoto,
  offerReminderEmail, offerExpiredEmail, expiredOffersSummaryEmail, type ExpiredSummaryRow,
} from "@/lib/email";
import { GOOGLE_REVIEW_URL } from "@/lib/google-reviews";
import {
  todayISO, addDaysISO, daysBetweenISO, formatDateNl, graceEndDate,
  OFFER_REMINDER_DAYS_BEFORE,
} from "@/lib/offer-expiry";

export const runtime = "nodejs";

const OWNER_EMAIL = process.env.OWNER_EMAIL || "arjan@vvrvastgoedbv.nl";

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
            html: thankYouEmail({ firstName, photoUrl: thankPhoto, reviewLink: GOOGLE_REVIEW_URL }),
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
      let followupLogFailed = 0;
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
            html: followUpEmail({ firstName: followFirstName, photoUrl: followPhoto, reviewLink: GOOGLE_REVIEW_URL, bookLink: `${baseUrl}/#reserveren` }),
          });
          const gelogd = await logSentEmail("follow-up-email", fg.id, {
            type: "follow-up", sent_at: new Date().toISOString(),
          });
          if (!gelogd) followupLogFailed++;
          followupSent++;
        } catch (e) {
          console.error("Follow-up cron failed for guest", fg.id, e);
        }
      }
      results.followup = followupSent;
      results.followup_log_mislukt = followupLogFailed;

      /* ── 4. Offertes: herinneren en laten vervallen ──
       * Een offerte blokkeert de agenda niet, dus zonder einddatum blijft
       * onduidelijk of de gast nog komt. Twee dagen voor de vervaldatum één
       * herinnering, daarna vervalt het aanbod en gaan de datums weer vrij. */
      const today = todayISO();

      const { data: openOffers } = await getSupabase()
        .from("booking_requests")
        .select("*")
        .eq("status", "offerte_verstuurd")
        .not("offerte_vervalt_op", "is", null);

      const offerContext = (req: {
        lodge: string | null; check_in: string | null; check_out: string | null;
        periode_tekst: string | null; gast_naam: string | null; totaal: number | null;
      }) => {
        const lodgeNaam = lodgeName(req.lodge || "lodge_1");
        const { url } = lodgePhoto(baseUrl, req.lodge);
        const fmt = (iso: string | null) => iso
          ? new Date(iso).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })
          : "";
        const van = req.check_in ? fmt(req.check_in) : (req.periode_tekst?.split("—")[0]?.trim() || "");
        const tot = req.check_out ? fmt(req.check_out) : (req.periode_tekst?.split("—")[1]?.trim() || "");
        return {
          lodgeNaam,
          photoUrl: url,
          periodeLabel: van && tot ? `${van} t/m ${tot}` : (req.periode_tekst || ""),
          firstName: esc((req.gast_naam || "").split(" ")[0] || ""),
          totaal: req.totaal != null ? Number(req.totaal) : null,
        };
      };

      let reminderSent = 0;
      let expiredCount = 0;
      const expiredRows: ExpiredSummaryRow[] = [];

      for (const req of openOffers ?? []) {
        const expiry: string = req.offerte_vervalt_op;
        const ctx = offerContext(req);

        // Verlopen: vervaldatum ligt achter ons.
        if (expiry < today) {
          const { error: updErr } = await getSupabase().from("booking_requests").update({
            status: "verlopen",
            verlopen_op: new Date().toISOString(),
          }).eq("id", req.id).eq("status", "offerte_verstuurd");
          if (updErr) {
            console.error("Offerte laten vervallen faalde voor", req.id, updErr.message);
            continue;
          }
          expiredCount++;
          expiredRows.push({
            gastNaam: req.gast_naam || "Onbekend",
            gastEmail: req.gast_email || "",
            periodeLabel: ctx.periodeLabel,
            lodgeNaam: ctx.lodgeNaam,
            totaal: ctx.totaal,
          });
          if (!req.gast_email) continue;
          /* Laatste kans: de link blijft nog een paar coulancedagen werken.
           * Zonder token (offertes van vóór de confirm-links) valt de mail
           * terug op de open uitnodiging om te reageren. */
          const coulanceTot = graceEndDate(expiry);
          try {
            await resend.emails.send({
              from: "Huis ter Huynen <lodge@huisterhuynen.nl>",
              to: [req.gast_email],
              subject: req.confirm_token
                ? "Nog één kans op je aanbod — Huis ter Huynen"
                : "Je aanbod is verlopen — Huis ter Huynen",
              replyTo: "lodge@huisterhuynen.nl",
              html: offerExpiredEmail({
                ...ctx,
                geldigTot: formatDateNl(expiry),
                siteUrl: baseUrl,
                confirmUrl: req.confirm_token
                  ? `${baseUrl}/bevestig?id=${req.id}&t=${req.confirm_token}`
                  : null,
                coulanceTot: formatDateNl(coulanceTot),
              }),
            });
          } catch (e) {
            console.error("Vervalmail faalde voor", req.id, e);
          }
          continue;
        }

        /* Herinnering: vanaf de herinneringsdag, en maar één keer.
         *
         * Niet `today === reminderDay`: die exacte match sloeg de herinnering
         * stilletjes over zodra de dag ertussenuit viel. Dat gebeurde bij elke
         * korte offerte — is de vervaldatum gecapt op de dag vóór aankomst,
         * dan ligt de herinneringsdag al in het verleden op het moment van
         * versturen — en ook bij één gemiste cronrun. `herinnering_verstuurd_op`
         * bewaakt dat het bij één mail blijft; het verlopen-blok hierboven
         * garandeert dat we hier alleen komen zolang het aanbod nog loopt. */
        const reminderDay = addDaysISO(expiry, -OFFER_REMINDER_DAYS_BEFORE);
        if (today >= reminderDay && !req.herinnering_verstuurd_op && req.gast_email && req.confirm_token) {
          try {
            await resend.emails.send({
              from: "Huis ter Huynen <lodge@huisterhuynen.nl>",
              to: [req.gast_email],
              subject: "Je persoonlijke aanbod staat nog klaar — Huis ter Huynen",
              replyTo: "lodge@huisterhuynen.nl",
              html: offerReminderEmail({
                ...ctx,
                geldigTot: formatDateNl(expiry),
                confirmUrl: `${baseUrl}/bevestig?id=${req.id}&t=${req.confirm_token}`,
                dagenResterend: daysBetweenISO(today, expiry),
              }),
            });
            await getSupabase().from("booking_requests")
              .update({ herinnering_verstuurd_op: new Date().toISOString() })
              .eq("id", req.id);
            reminderSent++;
          } catch (e) {
            console.error("Herinneringsmail faalde voor", req.id, e);
          }
        }
      }

      // Eén verzamelmail naar de host, alleen als er echt iets verliep.
      if (expiredRows.length > 0) {
        try {
          await resend.emails.send({
            from: "Huis ter Huynen <lodge@huisterhuynen.nl>",
            to: [OWNER_EMAIL],
            subject: expiredRows.length === 1
              ? "Aanbod verlopen — 1 aanvraag"
              : `Aanbiedingen verlopen — ${expiredRows.length} aanvragen`,
            html: expiredOffersSummaryEmail(expiredRows),
          });
        } catch (e) {
          console.error("Verzamelmail verlopen offertes faalde:", e);
        }
      }

      results.offerteHerinnering = reminderSent;
      results.offerteVerlopen = expiredCount;
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
      let lcLogFailed = 0;
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
          const lcGelogd = await logSentEmail("late-checkout-email", stay.guest_id, {
            type: "late-checkout", stay_id: stay.id, sent_at: new Date().toISOString(),
          });
          if (!lcGelogd) lcLogFailed++;
          lcSent++;
        } catch (e) {
          console.error("Late checkout cron failed for stay", stay.id, e);
        }
      }
      results.late_checkout = lcSent;
      results.late_checkout_log_mislukt = lcLogFailed;
    }

    return NextResponse.json({ ok: true, type, results });
  } catch (err) {
    console.error("Email cron error:", err);
    return NextResponse.json({ error: "Cron mislukt" }, { status: 500 });
  }
}

