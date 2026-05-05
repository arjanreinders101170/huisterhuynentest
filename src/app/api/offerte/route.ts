import { esc } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

const LODGE_NAME = "Huis ter Huynen";

function emailWrap(content: string): string {
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

function offerteEmailHtml(gastNaam: string, van: string, tot: string, personen: number, prijsVerblijf: string, toeristenbelasting: string, schoonmaak: string, totaal: string, bericht: string, aanvraagId: string, appUrl: string, confirmToken: string): string {
  return emailWrap(`
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center" style="padding:0 0 20px;"><span style="font-size:22px;color:#B49A5E;letter-spacing:8px;">◆</span></td></tr>
    </table>

    <h1 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:bold;color:#2A2418;text-align:center;">
      Persoonlijk aanbod
    </h1>
    <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:15px;color:#8A7D6A;text-align:center;">
      Speciaal voor ${gastNaam || "jou"}
    </p>
    <p style="margin:0 0 28px;font-family:Arial,sans-serif;font-size:12px;color:#B49A5E;text-align:center;letter-spacing:1px;text-transform:uppercase;">
      Exclusief &middot; Beste prijs garantie
    </p>

    <!-- Period -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F1E8;border-radius:8px;margin-bottom:24px;">
      <tr><td style="padding:18px 20px;" align="center">
        <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:10px;color:#8A7D6A;text-transform:uppercase;letter-spacing:1px;">Je verblijf</p>
        <p style="margin:0 0 4px;font-family:Georgia,'Times New Roman',serif;font-size:18px;color:#2A2418;font-weight:bold;">${van} t/m ${tot}</p>
        <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#2F4F3E;font-weight:bold;">${personen} ${personen === 1 ? "persoon" : "personen"}</p>
      </td></tr>
    </table>

    <!-- Price breakdown -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:14px;margin-bottom:4px;">
      <tr>
        <td style="padding:14px 0;color:#2A2418;border-bottom:1px solid #E0D8C8;">Verblijf</td>
        <td align="right" style="padding:14px 0;color:#2A2418;font-weight:bold;border-bottom:1px solid #E0D8C8;">&euro; ${prijsVerblijf}</td>
      </tr>
      <tr>
        <td style="padding:14px 0;color:#2A2418;border-bottom:1px solid #E0D8C8;">Toeristenbelasting</td>
        <td align="right" style="padding:14px 0;color:#2A2418;font-weight:bold;border-bottom:1px solid #E0D8C8;">&euro; ${toeristenbelasting}</td>
      </tr>
      <tr>
        <td style="padding:14px 0;color:#2A2418;border-bottom:1px solid #E0D8C8;">Eindschoonmaak</td>
        <td align="right" style="padding:14px 0;color:#2A2418;font-weight:bold;border-bottom:1px solid #E0D8C8;">&euro; ${schoonmaak}</td>
      </tr>
    </table>

    <!-- Total -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;margin-bottom:24px;">
      <tr>
        <td style="padding:16px 0;font-size:18px;font-weight:bold;color:#2A2418;">Totaal</td>
        <td align="right" style="padding:16px 0;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:bold;color:#2F4F3E;">&euro; ${totaal}</td>
      </tr>
    </table>

    ${bericht ? `
    <!-- Personal message -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr><td style="padding:18px 20px;background-color:#F9F4E8;border-radius:8px;">
        <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:10px;color:#8A7D6A;text-transform:uppercase;letter-spacing:1px;">Persoonlijk bericht</p>
        <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:#2A2418;line-height:1.6;">${bericht}</p>
      </td></tr>
    </table>
    ` : ""}

    <!-- Trust badges -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr><td style="padding:3px 0;font-family:Arial,sans-serif;font-size:13px;color:#2F4F3E;line-height:1.4;">&#10003;&ensp;Beste prijs garantie &mdash; altijd scherper dan boekingssites</td></tr>
      <tr><td style="padding:3px 0;font-family:Arial,sans-serif;font-size:13px;color:#2F4F3E;line-height:1.4;">&#10003;&ensp;Persoonlijk afgestemd op jouw verblijf</td></tr>
      <tr><td style="padding:3px 0;font-family:Arial,sans-serif;font-size:13px;color:#2F4F3E;line-height:1.4;">&#10003;&ensp;Geen verplichting &mdash; neem rustig de tijd</td></tr>
    </table>

    <!-- CTA — bulletproof button -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr><td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="background-color:#2F4F3E;border-radius:10px;">
              <a href="${appUrl}/bevestig?id=${aanvraagId}&t=${confirmToken}"
                style="display:block;padding:18px 48px;color:#ffffff;text-decoration:none;font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:bold;border-radius:10px;">
                Bevestig reservering &#8594;
              </a>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>

    <!-- Contact -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E0D8C8;">
      <tr><td style="padding:16px 0 0;">
        <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#8A7D6A;">
          Vragen? WhatsApp ons op <a href="tel:+31642568603" style="color:#2F4F3E;text-decoration:none;font-weight:bold;">+31 6 42568603</a>
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

    // Admin auth check
    const adminSecret = process.env.ADMIN_SECRET;
    if (adminSecret && body.adminSecret !== adminSecret) {
      return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
    }

    const { aanvraagId, gastEmail, gastNaam, van, tot, personen, prijsVerblijf, toeristenbelasting, schoonmaak, bericht } = body;

    if (!gastEmail || !prijsVerblijf) {
      return NextResponse.json({ error: "E-mail en prijs zijn verplicht" }, { status: 400 });
    }

    const verblijf = parseFloat(prijsVerblijf) || 0;
    const belasting = parseFloat(toeristenbelasting) || 0;
    const cleaning = parseFloat(schoonmaak) || 0;
    const totaal = (verblijf + belasting + cleaning).toFixed(2);

    // Generate confirm token for secure bevestig link
    const { randomBytes } = await import("crypto");
    const confirmToken = randomBytes(32).toString("hex");

    // Update aanvraag status in database
    if (aanvraagId) {
      try {
        await getSupabase().from("terugkeer_aanvragen").update({
          status: "offerte_verstuurd",
          offerte_bedrag: parseFloat(totaal),
          confirm_token: confirmToken,
          updated_at: new Date().toISOString(),
        }).eq("id", aanvraagId);
      } catch (e) { console.error("Update failed:", e); }
    }

    // Send offerte email to guest
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return NextResponse.json({ error: "E-mail niet geconfigureerd" }, { status: 500 });
    }

    const { Resend } = await import("resend");
    const resend = new Resend(resendKey);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://huisterhuynentest.vercel.app";

    await resend.emails.send({
      from: `${LODGE_NAME} <lodge@huisterhuynen.nl>`,
      to: [gastEmail],
      subject: `Persoonlijk aanbod — ${LODGE_NAME}`,
      html: offerteEmailHtml(
        esc(gastNaam || ""), esc(van || ""), esc(tot || ""),
        personen || 2,
        verblijf.toFixed(2), belasting.toFixed(2), cleaning.toFixed(2), totaal,
        esc(bericht || ""), aanvraagId || "", appUrl, confirmToken,
      ),
      replyTo: "lodge@huisterhuynen.nl",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Offerte error:", err);
    return NextResponse.json({ error: "Kon offerte niet versturen" }, { status: 500 });
  }
}
