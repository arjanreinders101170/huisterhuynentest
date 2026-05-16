import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { APP_URL_FALLBACK, lodgeName } from "@/data/lodge";
import { esc, welcomeEmail, lateCheckoutEmail } from "@/lib/email";

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

        try {
          await resend.emails.send({
            from: "Huis ter Huynen <lodge@huisterhuynen.nl>",
            to: [guest.email],
            subject: "Bedankt voor je bezoek — Huis ter Huynen",
            html: thankyouHtml(esc(guest.naam || ""), appUrl),
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

        try {
          await resend.emails.send({
            from: "Huis ter Huynen <lodge@huisterhuynen.nl>",
            to: [fg.email],
            subject: "Hoe was je verblijf? — Huis ter Huynen",
            html: followupHtml(esc(fg.naam || ""), appUrl),
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

// ═══ EMAIL TEMPLATES ═══

function thankyouHtml(naam: string, appUrl: string): string {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:#EAE3D2;font-family:Georgia,'Times New Roman',serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#EAE3D2;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">
  <tr><td align="center" style="padding:0 0 20px;">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td align="center" style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:bold;color:#52502E;letter-spacing:2px;">HUIS TER HUYNEN</td>
    </tr><tr><td align="center" style="padding-top:6px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td style="width:28px;height:1px;background-color:#B49A5E;"></td>
      <td style="padding:0 10px;font-family:Arial,sans-serif;font-size:9px;color:#B49A5E;letter-spacing:3px;text-transform:uppercase;">Boutique Lodge</td>
      <td style="width:28px;height:1px;background-color:#B49A5E;"></td>
    </tr></table></td></tr></table>
  </td></tr>
  <tr><td>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FDFBF6;border:1px solid #E0D8C8;border-radius:12px;overflow:hidden;">
    <tr><td style="padding:0;font-size:0;line-height:0;">
      <img src="https://www.huisterhuynen.nl/heide3.jpg" alt="Drentse heide" width="520" style="display:block;width:100%;height:auto;" />
    </td></tr>
    <tr><td style="padding:32px 32px 28px;">
      <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:bold;color:#2A2418;line-height:1.3;">
        Tot snel, ${naam}
      </h1>
      <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:15px;color:#8A7D6A;line-height:1.7;">
        De heide kleurt, het bos ruist, en de hottub dampt zachtjes in de ochtendlucht. Zo gaat het hier elke dag verder &mdash; ook als je er even niet bent.
      </p>
      <p style="margin:0 0 28px;font-family:Arial,sans-serif;font-size:15px;color:#8A7D6A;line-height:1.7;">
        We hopen dat Drenthe je goed heeft gedaan. Mocht je ooit terug willen &mdash; je bent altijd welkom.
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr><td style="padding:20px;background-color:#F5F1E8;border-radius:8px;">
          <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#2F4F3E;">Vertel ons hoe het was</p>
          <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:13px;color:#8A7D6A;line-height:1.5;">
            Jouw ervaring helpt andere gasten en helpt ons om het nóg beter te maken.
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="background-color:#2F4F3E;border-radius:8px;">
              <a href="${appUrl}" style="display:block;padding:12px 28px;color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">
                Review achterlaten
              </a>
            </td></tr>
          </table>
        </td></tr>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E0D8C8;">
      <tr><td style="padding:20px 0 0;">
        <p style="margin:0 0 4px;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#2A2418;font-weight:bold;">Het Huynen team</p>
        <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#8A7D6A;">Zuiderstraat 6 &middot; Zeijen, Drenthe</p>
        <p style="margin:8px 0 0;font-family:Arial,sans-serif;font-size:13px;color:#8A7D6A;">
          WhatsApp ons op <a href="tel:+31642568603" style="color:#2F4F3E;font-weight:bold;text-decoration:none;">+31 6 42568603</a>
        </p>
      </td></tr>
      </table>
    </td></tr>
    </table>
  </td></tr>
  <tr><td align="center" style="padding:24px 0 0;">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:40px;height:1px;background-color:#B49A5E;"></td></tr></table>
    <p style="margin:12px 0 0;font-family:Arial,sans-serif;font-size:11px;color:#8A7D6A;">Huis ter Huynen &middot; Zuiderstraat 6 &middot; Zeijen, Drenthe</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

function followupHtml(naam: string, appUrl: string): string {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:#EAE3D2;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#EAE3D2;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
        <tr><td align="center" style="padding:0 0 24px;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:bold;color:#52502E;letter-spacing:2px;">HUIS TER HUYNEN</td></tr>
            <tr><td align="center" style="padding-top:6px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
              <td style="width:28px;height:1px;background-color:#B49A5E;"></td>
              <td style="padding:0 10px;font-family:Arial,sans-serif;font-size:9px;color:#B49A5E;letter-spacing:3px;text-transform:uppercase;">Boutique Lodge</td>
              <td style="width:28px;height:1px;background-color:#B49A5E;"></td>
            </tr></table></td></tr>
          </table>
        </td></tr>
        <tr><td>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FDFBF6;border:1px solid #E0D8C8;border-radius:12px;">
            <tr><td style="height:4px;background-color:#B49A5E;border-radius:12px 12px 0 0;font-size:0;line-height:0;">&nbsp;</td></tr>
            <tr><td style="padding:28px 28px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr><td align="center" style="padding:0 0 20px;"><span style="font-size:22px;color:#B49A5E;letter-spacing:8px;">&#9679; &#9679; &#9679;</span></td></tr>
              </table>
              <h1 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:bold;color:#2A2418;text-align:center;">
                Hoe kijk je terug?
              </h1>
              <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:15px;color:#8A7D6A;line-height:1.6;text-align:center;">
                ${naam ? `Hoi ${naam}, het` : "Het"} is alweer even geleden dat je bij ons was. We hopen dat je genoten hebt van Drenthe!
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr><td style="padding:20px;background-color:#F5F1E8;border-radius:8px;">
                  <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#2F4F3E;">Vertel ons hoe het was</p>
                  <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:13px;color:#8A7D6A;line-height:1.5;">
                    Jouw ervaring helpt andere gasten en helpt ons om het nóg beter te maken.
                  </p>
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr><td align="center" style="background-color:#2F4F3E;border-radius:8px;">
                      <a href="${appUrl}" style="display:block;padding:12px 28px;color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">
                        Review achterlaten
                      </a>
                    </td></tr>
                  </table>
                </td></tr>
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr><td style="padding:20px;background-color:#F9F4E8;border-radius:8px;text-align:center;">
                  <p style="margin:0 0 4px;font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:bold;color:#2A2418;">Kom nog eens terug</p>
                  <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:13px;color:#8A7D6A;line-height:1.5;">
                    Als terugkerende gast ontvang je altijd een persoonlijk aanbod — scherper dan op boekingssites.
                  </p>
                  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                    <tr><td align="center" style="border:2px solid #2F4F3E;border-radius:8px;">
                      <a href="${appUrl}" style="display:block;padding:12px 28px;color:#2F4F3E;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">
                        Bekijk beschikbaarheid
                      </a>
                    </td></tr>
                  </table>
                </td></tr>
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E0D8C8;">
                <tr><td style="padding:16px 0 0;">
                  <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#8A7D6A;text-align:center;line-height:1.5;">
                    WhatsApp ons op <a href="tel:+31642568603" style="color:#2F4F3E;text-decoration:none;font-weight:bold;">+31 6 42568603</a>
                  </p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </td></tr>
        <tr><td align="center" style="padding:24px 0 0;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:40px;height:1px;background-color:#B49A5E;"></td></tr></table>
          <p style="margin:12px 0 0;font-family:Arial,sans-serif;font-size:11px;color:#8A7D6A;">Huis ter Huynen &middot; Zuiderstraat 6 &middot; Zeijen, Drenthe</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
