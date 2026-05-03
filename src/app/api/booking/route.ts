import { NextRequest, NextResponse } from "next/server";

/*
 * Booking API — handles upsell orders and sends email notification
 * 
 * Requires: RESEND_API_KEY in environment variables
 * Without key: booking is confirmed client-side but no email sent
 * 
 * Sign up free at https://resend.com (100 emails/day)
 */

const OWNER_EMAIL = "arjan@vvrvastgoedbv.nl";
const LODGE_NAME = "Huis ter Huynen";

function buildEmailHtml(product: string, prijs: string, gastNaam: string, gastEmail: string, datum: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#EAE3D2;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:500px;margin:0 auto;padding:32px 24px;">
    
    <!-- Header -->
    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-family:Georgia,serif;font-size:20px;font-weight:600;color:#52502E;letter-spacing:.03em;">
        HUIS TER HUYNEN
      </div>
      <div style="font-size:9px;color:#B49A5E;letter-spacing:.2em;text-transform:uppercase;margin-top:4px;">
        Boutique Lodge · Zeijen
      </div>
    </div>

    <!-- Card -->
    <div style="background:#FDFBF6;border-radius:16px;border:1px solid #E0D8C8;padding:28px 24px;box-shadow:0 2px 12px rgba(47,79,62,.06);">
      
      <div style="font-family:Georgia,serif;font-size:22px;font-weight:600;color:#2A2418;margin-bottom:4px;">
        Nieuwe boeking
      </div>
      <div style="font-size:13px;color:#8A7D6A;margin-bottom:24px;">
        ${datum} · via de conciërge app
      </div>

      <!-- Product -->
      <div style="background:rgba(47,79,62,.05);border-radius:12px;padding:16px 18px;margin-bottom:20px;">
        <div style="font-size:11px;color:#8A7D6A;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px;">Product</div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div style="font-family:Georgia,serif;font-size:18px;font-weight:600;color:#2A2418;">${product}</div>
          <div style="font-size:18px;font-weight:600;color:#2F4F3E;">${prijs}</div>
        </div>
      </div>

      <!-- Guest details -->
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr>
          <td style="padding:10px 0;color:#8A7D6A;border-bottom:1px solid #E0D8C8;width:120px;">Gastnaam</td>
          <td style="padding:10px 0;color:#2A2418;font-weight:500;border-bottom:1px solid #E0D8C8;">${gastNaam}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#8A7D6A;border-bottom:1px solid #E0D8C8;">E-mail gast</td>
          <td style="padding:10px 0;border-bottom:1px solid #E0D8C8;">
            <a href="mailto:${gastEmail}" style="color:#2F4F3E;text-decoration:none;">${gastEmail}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#8A7D6A;">Datum</td>
          <td style="padding:10px 0;color:#2A2418;">${datum}</td>
        </tr>
      </table>

      <!-- Action needed -->
      <div style="margin-top:20px;padding:14px 16px;background:rgba(180,154,94,.1);border-radius:10px;border-left:3px solid #B49A5E;">
        <div style="font-size:13px;color:#2A2418;line-height:1.5;">
          <strong>Actie nodig:</strong> Neem contact op met de gast om de boeking te bevestigen en eventuele betaling te regelen.
        </div>
      </div>

      <!-- Reply button -->
      <div style="text-align:center;margin-top:24px;">
        <a href="mailto:${gastEmail}?subject=Bevestiging%20${encodeURIComponent(product)}%20-%20${LODGE_NAME}&body=Hoi%20${encodeURIComponent(gastNaam)}%2C%0A%0ABedankt%20voor%20je%20boeking!%20..." 
           style="display:inline-block;padding:12px 28px;background:#2F4F3E;color:#fff;text-decoration:none;border-radius:12px;font-size:14px;font-weight:500;">
          Beantwoord gast
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:24px;">
      <div style="width:40px;height:1px;background:#B49A5E;opacity:.4;margin:0 auto 12px;"></div>
      <div style="font-size:11px;color:#8A7D6A;">
        Verzonden via de ${LODGE_NAME} conciërge app
      </div>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const { product, prijs, gastNaam, gastEmail, datum } = await request.json();

    if (!product || !gastNaam || !gastEmail) {
      return NextResponse.json(
        { error: "Product, gastnaam en e-mail zijn verplicht" },
        { status: 400 }
      );
    }

    const bookingDate = datum || new Date().toLocaleDateString("nl-NL", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
    const bookingPrijs = prijs || "Prijs op aanvraag";

    // Try to send email via Resend
    const resendKey = process.env.RESEND_API_KEY;

    if (resendKey) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);

        await resend.emails.send({
          from: `${LODGE_NAME} <onboarding@resend.dev>`,
          to: [OWNER_EMAIL],
          subject: `Nieuwe boeking: ${product} — ${gastNaam}`,
          html: buildEmailHtml(product, bookingPrijs, gastNaam, gastEmail, bookingDate),
          replyTo: gastEmail,
        });

        return NextResponse.json({
          success: true,
          emailSent: true,
          message: "Boeking ontvangen en bevestigingsmail verstuurd.",
        });
      } catch (emailErr) {
        // Email failed but booking still recorded
        console.error("Email sending failed:", emailErr);
        return NextResponse.json({
          success: true,
          emailSent: false,
          message: "Boeking ontvangen. E-mail kon niet verstuurd worden.",
        });
      }
    }

    // No Resend key — log to console as fallback
    console.log(`[BOOKING] ${product} | ${gastNaam} | ${gastEmail} | ${bookingPrijs} | ${bookingDate}`);

    return NextResponse.json({
      success: true,
      emailSent: false,
      message: "Boeking ontvangen.",
    });
  } catch {
    return NextResponse.json(
      { error: "Er ging iets mis bij het verwerken van de boeking" },
      { status: 500 }
    );
  }
}
