import { esc } from "@/lib/email";
import { terugkomenSchema } from "@/lib/schemas";
import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

const OWNER_EMAIL = "arjan@vvrvastgoedbv.nl";
const LODGE_NAME = "Huis ter Huynen";

/* ═══ SHARED EMAIL WRAPPER ═══ */
function emailWrap(content: string): string {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#EAE3D2;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#EAE3D2;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
        <tr><td align="center" style="padding:0 0 24px;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:bold;color:#52502E;letter-spacing:2px;">HUIS TER HUYNEN</td></tr>
            <tr><td align="center" style="padding-top:6px;">
              <table role="presentation" cellpadding="0" cellspacing="0"><tr>
                <td style="width:28px;height:1px;background-color:#B49A5E;"></td>
                <td style="padding:0 10px;font-family:Arial,sans-serif;font-size:9px;color:#B49A5E;letter-spacing:3px;text-transform:uppercase;">Boutique Lodge</td>
                <td style="width:28px;height:1px;background-color:#B49A5E;"></td>
              </tr></table>
            </td></tr>
          </table>
        </td></tr>
        <tr><td>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FDFBF6;border:1px solid #E0D8C8;border-radius:12px;">
            <tr><td style="height:4px;background-color:#B49A5E;border-radius:12px 12px 0 0;font-size:0;line-height:0;">&nbsp;</td></tr>
            <tr><td style="padding:28px 28px 24px;">${content}</td></tr>
          </table>
        </td></tr>
        <tr><td align="center" style="padding:24px 0 0;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:40px;height:1px;background-color:#B49A5E;"></td></tr></table>
          <p style="margin:12px 0 0;font-family:Arial,sans-serif;font-size:11px;color:#8A7D6A;">${LODGE_NAME} &middot; Zuiderstraat 6 &middot; Zeijen, Drenthe</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

/* ═══ OWNER EMAIL ═══ */
function ownerEmailHtml(van: string, tot: string, email: string, naam: string, personen: number, bericht: string, aanvraagId: string, appUrl: string, adminSecret: string, lodgeHint: string): string {
  return emailWrap(`
    <h1 style="margin:0 0 4px;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:bold;color:#2A2418;">
      Terugkeer aanvraag
    </h1>
    <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:14px;color:#8A7D6A;">
      Een gast wil graag terugkomen!
    </p>

    <!-- Period block -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F1E8;border-radius:8px;margin-bottom:24px;">
      <tr><td style="padding:18px 20px;" align="center">
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr><td align="center" style="font-family:Georgia,'Times New Roman',serif;font-size:18px;color:#2A2418;font-weight:bold;">
            ${van} &mdash; ${tot}
          </td></tr>
          <tr><td align="center" style="padding-top:6px;font-family:Arial,sans-serif;font-size:13px;color:#2F4F3E;font-weight:bold;">
            ${personen} ${personen === 1 ? "persoon" : "personen"}
          </td></tr>
        </table>
      </td></tr>
    </table>

    <!-- Guest details -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:14px;">
      <tr>
        <td style="padding:12px 0;color:#8A7D6A;border-bottom:1px solid #E0D8C8;width:110px;">E-mail</td>
        <td style="padding:12px 0;border-bottom:1px solid #E0D8C8;"><a href="mailto:${email}" style="color:#2F4F3E;text-decoration:none;font-weight:bold;">${email}</a></td>
      </tr>
      ${naam ? `<tr>
        <td style="padding:12px 0;color:#8A7D6A;border-bottom:1px solid #E0D8C8;">Naam</td>
        <td style="padding:12px 0;color:#2A2418;font-weight:bold;border-bottom:1px solid #E0D8C8;">${naam}</td>
      </tr>` : ""}
      ${bericht ? `<tr>
        <td style="padding:12px 0;color:#8A7D6A;">Opmerking</td>
        <td style="padding:12px 0;color:#2A2418;">${bericht}</td>
      </tr>` : ""}
    </table>

    <!-- Action -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
      <tr><td style="padding:16px 18px;background-color:#F9F4E8;border-left:3px solid #B49A5E;border-radius:0 8px 8px 0;">
        <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#2A2418;line-height:1.5;">
          <strong>Actie:</strong> Stuur een persoonlijk aanbod naar deze gast.
        </p>
      </td></tr>
    </table>

    <!-- CTA -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
      <tr><td align="center">
        <a href="${appUrl}/offerte?id=${aanvraagId}&email=${encodeURIComponent(email)}&naam=${encodeURIComponent(naam)}&van=${encodeURIComponent(van)}&tot=${encodeURIComponent(tot)}&personen=${personen}&s=${adminSecret}${lodgeHint ? `&lodgeHint=${encodeURIComponent(lodgeHint)}` : ""}"
          style="display:inline-block;padding:14px 32px;background-color:#2F4F3E;color:#ffffff;text-decoration:none;border-radius:8px;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">
          Stuur aanbod &rarr;
        </a>
      </td></tr>
    </table>
  `);
}

/* ═══ GUEST EMAIL ═══ */
function guestEmailHtml(naam: string, van: string, tot: string): string {
  return emailWrap(`
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center" style="padding:0 0 20px;"><span style="font-size:22px;color:#B49A5E;letter-spacing:8px;">◆</span></td></tr>
    </table>

    <h1 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:bold;color:#2A2418;text-align:center;">
      Dank je wel${naam ? `, ${naam}` : ""}
    </h1>
    <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:15px;color:#8A7D6A;line-height:1.6;text-align:center;">
      Wat leuk dat je terug wilt komen! We gaan een persoonlijk aanbod voor je samenstellen.
    </p>

    <!-- Period -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F1E8;border-radius:8px;margin-bottom:24px;">
      <tr><td style="padding:18px 20px;" align="center">
        <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:10px;color:#8A7D6A;text-transform:uppercase;letter-spacing:1px;">Gewenste periode</p>
        <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:18px;color:#2A2418;font-weight:bold;">${van} &mdash; ${tot}</p>
      </td></tr>
    </table>

    <!-- Expectation -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr><td style="padding:18px 20px;background-color:#F9F4E8;border-radius:8px;">
        <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#2F4F3E;">Wat kun je verwachten?</p>
        <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:#2A2418;line-height:1.6;">
          Je ontvangt binnen 24 uur een persoonlijk aanbod per e-mail &mdash; altijd scherper dan op boekingssites.
        </p>
      </td></tr>
    </table>

    <!-- Trust badges -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr><td style="padding:6px 0;font-family:Arial,sans-serif;font-size:13px;color:#2F4F3E;">&#10003;&ensp;Beste prijs garantie</td></tr>
      <tr><td style="padding:6px 0;font-family:Arial,sans-serif;font-size:13px;color:#2F4F3E;">&#10003;&ensp;Speciaal voor terugkerende gasten</td></tr>
      <tr><td style="padding:6px 0;font-family:Arial,sans-serif;font-size:13px;color:#2F4F3E;">&#10003;&ensp;Geen verplichting</td></tr>
    </table>

    <!-- Contact -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E0D8C8;">
      <tr><td style="padding:16px 0 0;">
        <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#8A7D6A;">
          Vragen? Bel of WhatsApp ons op <a href="tel:+31642568603" style="color:#2F4F3E;text-decoration:none;font-weight:bold;">+31 6 42568603</a>
        </p>
      </td></tr>
    </table>
  `);
}

export async function POST(request: NextRequest) {
  try {
    let body;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Ongeldige request" }, { status: 400 });
    }

    const parsed = terugkomenSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Ongeldige invoer" }, { status: 400 });
    }

    const { from, to, email, name, persons, message, lodge } = parsed.data;

    let guestId = null;
    try {
      const { data } = await getSupabase().rpc("upsert_guest", { p_naam: name || "", p_email: email });
      guestId = data;
    } catch (e) { console.error("Guest upsert failed:", e); }

    let aanvraagId = "";
    try {
      const { data } = await getSupabase().from("terugkeer_aanvragen").insert({
        guest_id: guestId, van: from, tot: to,
        personen: persons || 2, bericht: message || null, status: "nieuw",
      }).select("id").single();
      aanvraagId = data?.id || "";
    } catch (e) { console.error("Terugkeer insert failed:", e); }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://huisterhuynentest.vercel.app";

    const adminSecret = process.env.ADMIN_SECRET || "";

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);

        await resend.emails.send({
          from: `${LODGE_NAME} <lodge@huisterhuynen.nl>`,
          to: [OWNER_EMAIL],
          subject: `Terugkeer aanvraag — ${name || email} · ${from} t/m ${to}`,
          html: ownerEmailHtml(esc(from), esc(to), esc(email), esc(name || ""), persons || 2, esc(message || ""), aanvraagId, appUrl, adminSecret, lodge || ""),
          replyTo: email,
        });

        await resend.emails.send({
          from: `${LODGE_NAME} <lodge@huisterhuynen.nl>`,
          to: [email],
          subject: `Je aanvraag is ontvangen — ${LODGE_NAME}`,
          html: guestEmailHtml(esc(name || ""), esc(from), esc(to)),
        });
      } catch (e) { console.error("Email failed:", e); }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Kon aanvraag niet verwerken" }, { status: 500 });
  }
}
