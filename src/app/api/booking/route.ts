import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

const OWNER_EMAIL = "arjan@vvrvastgoedbv.nl";
const LODGE_NAME = "Huis ter Huynen";

function ownerEmailHtml(product: string, prijs: string, gastNaam: string, gastEmail: string, datum: string): string {
  return `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#EAE3D2;font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="max-width:500px;margin:0 auto;padding:32px 24px;">
  <div style="text-align:center;margin-bottom:28px;">
    <div style="font-family:Georgia,serif;font-size:20px;font-weight:600;color:#52502E;">HUIS TER HUYNEN</div>
    <div style="font-size:9px;color:#B49A5E;letter-spacing:.2em;text-transform:uppercase;margin-top:4px;">Boutique Lodge · Zeijen</div>
  </div>
  <div style="background:#FDFBF6;border-radius:16px;border:1px solid #E0D8C8;padding:28px 24px;">
    <div style="font-family:Georgia,serif;font-size:22px;font-weight:600;color:#2A2418;margin-bottom:4px;">Nieuwe boeking</div>
    <div style="font-size:13px;color:#8A7D6A;margin-bottom:24px;">${datum} · via de conciërge app</div>
    <div style="background:rgba(47,79,62,.05);border-radius:12px;padding:16px 18px;margin-bottom:20px;">
      <div style="font-size:11px;color:#8A7D6A;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px;">Product</div>
      <div style="font-family:Georgia,serif;font-size:18px;font-weight:600;color:#2A2418;display:inline;">${product}</div>
      <div style="font-size:18px;font-weight:600;color:#2F4F3E;float:right;">${prijs}</div>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:10px 0;color:#8A7D6A;border-bottom:1px solid #E0D8C8;width:120px;">Gastnaam</td><td style="padding:10px 0;color:#2A2418;font-weight:500;border-bottom:1px solid #E0D8C8;">${gastNaam}</td></tr>
      <tr><td style="padding:10px 0;color:#8A7D6A;border-bottom:1px solid #E0D8C8;">E-mail</td><td style="padding:10px 0;border-bottom:1px solid #E0D8C8;"><a href="mailto:${gastEmail}" style="color:#2F4F3E;">${gastEmail}</a></td></tr>
      <tr><td style="padding:10px 0;color:#8A7D6A;">Datum</td><td style="padding:10px 0;color:#2A2418;">${datum}</td></tr>
    </table>
    <div style="margin-top:20px;padding:14px 16px;background:rgba(180,154,94,.1);border-radius:10px;border-left:3px solid #B49A5E;">
      <div style="font-size:13px;color:#2A2418;line-height:1.5;"><strong>Actie nodig:</strong> Neem contact op met de gast.</div>
    </div>
    <div style="text-align:center;margin-top:24px;">
      <a href="mailto:${gastEmail}?subject=Bevestiging%20${encodeURIComponent(product)}%20-%20${LODGE_NAME}" style="display:inline-block;padding:12px 28px;background:#2F4F3E;color:#fff;text-decoration:none;border-radius:12px;font-size:14px;">Beantwoord gast</a>
    </div>
  </div>
</div></body></html>`;
}

function guestEmailHtml(product: string, prijs: string, gastNaam: string): string {
  return `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#EAE3D2;font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="max-width:500px;margin:0 auto;padding:32px 24px;">
  <div style="text-align:center;margin-bottom:28px;">
    <div style="font-family:Georgia,serif;font-size:20px;font-weight:600;color:#52502E;">HUIS TER HUYNEN</div>
    <div style="font-size:9px;color:#B49A5E;letter-spacing:.2em;text-transform:uppercase;margin-top:4px;">Boutique Lodge · Zeijen</div>
  </div>
  <div style="background:#FDFBF6;border-radius:16px;border:1px solid #E0D8C8;padding:28px 24px;">
    <div style="font-family:Georgia,serif;font-size:24px;font-weight:600;color:#2A2418;margin-bottom:8px;">
      Bedankt, ${gastNaam} 🌿
    </div>
    <p style="font-size:15px;color:#8A7D6A;line-height:1.6;margin:0 0 20px;">
      We hebben je aanvraag ontvangen en gaan er direct mee aan de slag.
    </p>
    <div style="background:rgba(47,79,62,.05);border-radius:12px;padding:16px 18px;margin-bottom:20px;">
      <div style="font-size:11px;color:#8A7D6A;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px;">Je aanvraag</div>
      <div style="font-family:Georgia,serif;font-size:18px;font-weight:600;color:#2A2418;display:inline;">${product}</div>
      <div style="font-size:18px;font-weight:600;color:#2F4F3E;float:right;">${prijs}</div>
    </div>
    <div style="padding:16px 18px;background:rgba(180,154,94,.08);border-radius:12px;">
      <div style="font-size:14px;color:#2A2418;line-height:1.6;">
        <strong style="color:#2F4F3E;">Wat kun je verwachten?</strong><br>
        We nemen binnen enkele uren persoonlijk contact met je op om alles te bevestigen.
      </div>
    </div>
    <p style="font-size:12px;color:#8A7D6A;margin:20px 0 0;line-height:1.5;">
      Vragen? Bel of WhatsApp ons gerust op +31 6 12 34 56 78
    </p>
  </div>
  <div style="text-align:center;margin-top:24px;">
    <div style="width:40px;height:1px;background:#B49A5E;opacity:.4;margin:0 auto 12px;"></div>
    <div style="font-size:11px;color:#8A7D6A;">${LODGE_NAME} · Zuiderstraat 6 · Zeijen, Drenthe</div>
  </div>
</div></body></html>`;
}

export async function POST(request: NextRequest) {
  try {
    let body;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Ongeldige request" }, { status: 400 });
    }

    const { product, prijs, gastNaam, gastEmail, datum, metadata } = body;

    if (!product || !gastNaam || !gastEmail) {
      return NextResponse.json({ error: "Product, naam en e-mail zijn verplicht" }, { status: 400 });
    }

    const bookingDate = datum || new Date().toLocaleDateString("nl-NL", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
    const bookingPrijs = prijs || "Prijs op aanvraag";

    // 1. Upsert guest in Supabase
    let guestId = null;
    try {
      const { data } = await getSupabase().rpc("upsert_guest", {
        p_naam: gastNaam,
        p_email: gastEmail,
      });
      guestId = data;
    } catch (e) {
      console.error("Guest upsert failed:", e);
    }

    // 2. Insert booking
    try {
      await getSupabase().from("bookings").insert({
        guest_id: guestId,
        product,
        prijs: parseFloat(String(bookingPrijs).replace(/[^0-9.,]/g, "").replace(",", ".")) || null,
        status: "nieuw",
        metadata: metadata || {},
      });
    } catch (e) {
      console.error("Booking insert failed:", e);
    }

    // 3. Send emails via Resend
    const resendKey = process.env.RESEND_API_KEY;

    if (resendKey) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);

        // Email to owner
        await resend.emails.send({
          from: `${LODGE_NAME} <lodge@huisterhuynen.nl>`,
          to: [OWNER_EMAIL],
          subject: `Nieuwe boeking: ${product} — ${gastNaam}`,
          html: ownerEmailHtml(product, bookingPrijs, gastNaam, gastEmail, bookingDate),
          replyTo: gastEmail,
        });

        // Confirmation email to guest
        await resend.emails.send({
          from: `${LODGE_NAME} <lodge@huisterhuynen.nl>`,
          to: [gastEmail],
          subject: `Bedankt voor je aanvraag — ${LODGE_NAME}`,
          html: guestEmailHtml(product, bookingPrijs, gastNaam),
        });

        return NextResponse.json({ success: true, emailSent: true });
      } catch (e) {
        console.error("Email failed:", e);
        return NextResponse.json({ success: true, emailSent: false });
      }
    }

    // No Resend key — booking saved in DB, no email
    console.log(`[BOOKING] ${product} | ${gastNaam} | ${gastEmail} | ${bookingPrijs}`);
    return NextResponse.json({ success: true, emailSent: false });
  } catch {
    return NextResponse.json({ error: "Kon boeking niet verwerken" }, { status: 500 });
  }
}
