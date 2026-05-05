import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { esc } from "@/lib/email";
import { bookingSchema } from "@/lib/schemas";

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
  <title>${LODGE_NAME}</title>
</head>
<body style="margin:0;padding:0;background-color:#EAE3D2;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#EAE3D2;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
        <!-- Logo -->
        <tr><td align="center" style="padding:0 0 24px;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:bold;color:#52502E;letter-spacing:2px;">
              HUIS TER HUYNEN
            </td></tr>
            <tr><td align="center" style="padding-top:6px;">
              <table role="presentation" cellpadding="0" cellspacing="0"><tr>
                <td style="width:28px;height:1px;background-color:#B49A5E;"></td>
                <td style="padding:0 10px;font-family:Arial,sans-serif;font-size:9px;color:#B49A5E;letter-spacing:3px;text-transform:uppercase;">Boutique Lodge</td>
                <td style="width:28px;height:1px;background-color:#B49A5E;"></td>
              </tr></table>
            </td></tr>
          </table>
        </td></tr>
        <!-- Content card -->
        <tr><td>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FDFBF6;border:1px solid #E0D8C8;border-radius:12px;">
            <!-- Gold top accent -->
            <tr><td style="height:4px;background-color:#B49A5E;border-radius:12px 12px 0 0;font-size:0;line-height:0;">&nbsp;</td></tr>
            <tr><td style="padding:28px 28px 24px;">
              ${content}
            </td></tr>
          </table>
        </td></tr>
        <!-- Footer -->
        <tr><td align="center" style="padding:24px 0 0;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="width:40px;height:1px;background-color:#B49A5E;opacity:0.4;"></td>
          </tr></table>
          <p style="margin:12px 0 0;font-family:Arial,sans-serif;font-size:11px;color:#8A7D6A;">
            ${LODGE_NAME} &middot; Zuiderstraat 6 &middot; Zeijen, Drenthe
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

/* ═══ OWNER EMAIL ═══ */
function ownerEmailHtml(product: string, prijs: string, gastNaam: string, gastEmail: string, datum: string): string {
  return emailWrap(`
    <h1 style="margin:0 0 4px;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:bold;color:#2A2418;">
      Nieuwe boeking
    </h1>
    <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:13px;color:#8A7D6A;">
      ${datum} &middot; via de conci&euml;rge app
    </p>

    <!-- Product block -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F1E8;border-radius:8px;margin-bottom:24px;">
      <tr><td style="padding:18px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-family:Arial,sans-serif;font-size:10px;color:#8A7D6A;text-transform:uppercase;letter-spacing:1px;padding-bottom:8px;" colspan="2">Product</td>
          </tr>
          <tr>
            <td style="font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:bold;color:#2A2418;">${product}</td>
            <td align="right" style="font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:bold;color:#2F4F3E;">${prijs}</td>
          </tr>
        </table>
      </td></tr>
    </table>

    <!-- Guest details -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:14px;">
      <tr>
        <td style="padding:12px 0;color:#8A7D6A;border-bottom:1px solid #E0D8C8;width:110px;">Gastnaam</td>
        <td style="padding:12px 0;color:#2A2418;font-weight:bold;border-bottom:1px solid #E0D8C8;">${gastNaam}</td>
      </tr>
      <tr>
        <td style="padding:12px 0;color:#8A7D6A;border-bottom:1px solid #E0D8C8;">E-mail</td>
        <td style="padding:12px 0;border-bottom:1px solid #E0D8C8;"><a href="mailto:${gastEmail}" style="color:#2F4F3E;text-decoration:none;font-weight:bold;">${gastEmail}</a></td>
      </tr>
      <tr>
        <td style="padding:12px 0;color:#8A7D6A;">Datum</td>
        <td style="padding:12px 0;color:#2A2418;">${datum}</td>
      </tr>
    </table>

    <!-- Action banner -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
      <tr><td style="padding:16px 18px;background-color:#F9F4E8;border-left:3px solid #B49A5E;border-radius:0 8px 8px 0;">
        <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#2A2418;line-height:1.5;">
          <strong>Actie nodig:</strong> Neem contact op met de gast om de boeking te bevestigen.
        </p>
      </td></tr>
    </table>

    <!-- CTA button -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
      <tr><td align="center">
        <a href="mailto:${gastEmail}?subject=Bevestiging%20${encodeURIComponent(product)}%20-%20${LODGE_NAME}&body=Hoi%20${encodeURIComponent(gastNaam)}%2C%0A%0ABedankt%20voor%20je%20boeking!%20We%20bevestigen%20hierbij%20je%20aanvraag%20voor%20${encodeURIComponent(product)}.%0A%0AMet%20vriendelijke%20groet%2C%0AHuis%20ter%20Huynen"
          style="display:inline-block;padding:14px 32px;background-color:#2F4F3E;color:#ffffff;text-decoration:none;border-radius:8px;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">
          Beantwoord gast &rarr;
        </a>
      </td></tr>
    </table>
  `);
}

/* ═══ GUEST EMAIL ═══ */
function guestEmailHtml(product: string, prijs: string, gastNaam: string): string {
  return emailWrap(`
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center" style="padding:0 0 20px;">
        <span style="font-size:22px;color:#B49A5E;letter-spacing:8px;">◆</span>
      </td></tr>
    </table>

    <h1 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:bold;color:#2A2418;text-align:center;">
      Bedankt, ${gastNaam}
    </h1>
    <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:15px;color:#8A7D6A;line-height:1.6;text-align:center;">
      We hebben je aanvraag ontvangen en gaan er direct mee aan de slag.
    </p>

    <!-- Product block -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F1E8;border-radius:8px;margin-bottom:24px;">
      <tr><td style="padding:18px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-family:Arial,sans-serif;font-size:10px;color:#8A7D6A;text-transform:uppercase;letter-spacing:1px;padding-bottom:8px;" colspan="2">Je aanvraag</td>
          </tr>
          <tr>
            <td style="font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:bold;color:#2A2418;">${product}</td>
            <td align="right" style="font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:bold;color:#2F4F3E;">${prijs}</td>
          </tr>
        </table>
      </td></tr>
    </table>

    <!-- Expectation block -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr><td style="padding:18px 20px;background-color:#F9F4E8;border-radius:8px;">
        <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#2F4F3E;">
          Wat kun je verwachten?
        </p>
        <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:#2A2418;line-height:1.6;">
          We nemen binnen enkele uren persoonlijk contact met je op om alles te bevestigen.
        </p>
      </td></tr>
    </table>

    <!-- Trust badges -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr><td style="padding:6px 0;font-family:Arial,sans-serif;font-size:13px;color:#2F4F3E;">
        &#10003;&ensp;Persoonlijke service
      </td></tr>
      <tr><td style="padding:6px 0;font-family:Arial,sans-serif;font-size:13px;color:#2F4F3E;">
        &#10003;&ensp;Alles staat klaar bij aankomst
      </td></tr>
      <tr><td style="padding:6px 0;font-family:Arial,sans-serif;font-size:13px;color:#2F4F3E;">
        &#10003;&ensp;Vragen? We helpen je graag
      </td></tr>
    </table>

    <!-- Contact -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E0D8C8;">
      <tr><td style="padding:16px 0 0;">
        <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#8A7D6A;line-height:1.5;">
          Vragen? Bel of WhatsApp ons gerust op
          <a href="tel:+31642568603" style="color:#2F4F3E;text-decoration:none;font-weight:bold;">+31 6 42568603</a>
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

    const parsed = bookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Ongeldige invoer", details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { product, prijs, gastNaam, gastEmail, datum, metadata } = parsed.data;

    const bookingDate = datum || new Date().toLocaleDateString("nl-NL", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
    const bookingPrijs = prijs || "Prijs op aanvraag";

    // 1. Upsert guest
    let guestId = null;
    try {
      const { data } = await getSupabase().rpc("upsert_guest", {
        p_naam: gastNaam,
        p_email: gastEmail,
      });
      guestId = data;
    } catch (e) { console.error("Guest upsert failed:", e); }

    // 2. Insert booking
    try {
      await getSupabase().from("bookings").insert({
        guest_id: guestId,
        product,
        prijs: parseFloat(String(bookingPrijs).replace(/[^0-9.,]/g, "").replace(",", ".")) || null,
        status: "nieuw",
        metadata: metadata || {},
      });
    } catch (e) { console.error("Booking insert failed:", e); }

    // 3. Send emails
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);

        await resend.emails.send({
          from: `${LODGE_NAME} <lodge@huisterhuynen.nl>`,
          to: [OWNER_EMAIL],
          subject: `Nieuwe boeking: ${product} — ${gastNaam}`,
          html: ownerEmailHtml(esc(product), esc(bookingPrijs), esc(gastNaam), esc(gastEmail), esc(bookingDate)),
          replyTo: gastEmail,
        });

        await resend.emails.send({
          from: `${LODGE_NAME} <lodge@huisterhuynen.nl>`,
          to: [gastEmail],
          subject: `Bedankt voor je aanvraag — ${LODGE_NAME}`,
          html: guestEmailHtml(esc(product), esc(bookingPrijs), esc(gastNaam)),
        });

        return NextResponse.json({ success: true, emailSent: true });
      } catch (e) {
        console.error("Email failed:", e);
        return NextResponse.json({ success: true, emailSent: false });
      }
    }

    console.log(`[BOOKING] ${product} | ${gastNaam} | ${gastEmail} | ${bookingPrijs}`);
    return NextResponse.json({ success: true, emailSent: false });
  } catch {
    return NextResponse.json({ error: "Kon boeking niet verwerken" }, { status: 500 });
  }
}
