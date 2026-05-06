import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { esc } from "@/lib/email";
import { generateInvoicePdf } from "@/lib/invoice";

export const runtime = "nodejs";

const OWNER_EMAIL = "arjan@vvrvastgoedbv.nl";
const LODGE_NAME = "Huis ter Huynen";

export async function POST(request: NextRequest) {
  try {
    // Mollie sends payment ID as form-encoded body
    const formData = await request.text();
    const params = new URLSearchParams(formData);
    const paymentId = params.get("id");

    if (!paymentId) {
      return NextResponse.json({ error: "No payment ID" }, { status: 400 });
    }

    const mollieKey = process.env.MOLLIE_API_KEY;
    if (!mollieKey) {
      return NextResponse.json({ error: "Mollie not configured" }, { status: 500 });
    }

    // Fetch payment status from Mollie
    const mollieResponse = await fetch(`https://api.mollie.com/v2/payments/${paymentId}`, {
      headers: { "Authorization": `Bearer ${mollieKey}` },
    });

    if (!mollieResponse.ok) {
      console.error("Mollie webhook fetch failed:", mollieResponse.status);
      return NextResponse.json({ error: "Could not fetch payment" }, { status: 500 });
    }

    const payment = await mollieResponse.json();
    const status = payment.status; // paid, failed, canceled, expired, pending
    const meta = payment.metadata || {};
    const bookingId = meta.bookingId;

    if (!bookingId) {
      console.log(`Mollie webhook: no bookingId for payment ${paymentId}, status: ${status}`);
      return NextResponse.json({ received: true });
    }

    // Map Mollie status to booking status
    let bookingStatus: string;
    switch (status) {
      case "paid":
        bookingStatus = "betaald";
        break;
      case "failed":
      case "canceled":
      case "expired":
        bookingStatus = "afgewezen";
        break;
      default:
        // pending, open — don't update yet
        return NextResponse.json({ received: true });
    }

    // Update booking status
    await getSupabase().from("bookings").update({
      status: bookingStatus,
      updated_at: new Date().toISOString(),
    }).eq("id", bookingId);

    // Send confirmation emails only when paid
    if (bookingStatus === "betaald" && meta.gastEmail) {
      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey) {
        try {
          const { Resend } = await import("resend");
          const resend = new Resend(resendKey);

          const product = esc(payment.description?.replace("Huis ter Huynen — ", "") || "Bestelling");
          const prijs = `€ ${payment.amount?.value || "0.00"}`;
          const naam = esc(meta.gastNaam || "Gast");

          // Email to owner
          await resend.emails.send({
            from: `${LODGE_NAME} <lodge@huisterhuynen.nl>`,
            to: [OWNER_EMAIL],
            subject: `Betaling ontvangen: ${product} — ${naam}`,
            html: `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#EAE3D2;font-family:Georgia,serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EAE3D2;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
<tr><td align="center" style="padding:0 0 24px;font-size:22px;font-weight:bold;color:#52502E;letter-spacing:2px;">HUIS TER HUYNEN</td></tr>
<tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FDFBF6;border:1px solid #E0D8C8;border-radius:12px;">
<tr><td style="height:4px;background:#2E7D32;border-radius:12px 12px 0 0;">&nbsp;</td></tr>
<tr><td style="padding:28px;">
<h1 style="margin:0 0 8px;font-size:24px;color:#2A2418;">Betaling ontvangen ✓</h1>
<p style="margin:0 0 20px;font-size:13px;color:#8A7D6A;">Via iDEAL — ${new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F1E8;border-radius:8px;margin-bottom:20px;">
<tr><td style="padding:18px 20px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="font-size:10px;color:#8A7D6A;text-transform:uppercase;letter-spacing:1px;padding-bottom:8px;">Betaald product</td></tr>
<tr><td style="font-size:20px;font-weight:bold;color:#2A2418;">${product}</td><td align="right" style="font-size:20px;font-weight:bold;color:#2E7D32;">${prijs}</td></tr>
</table></td></tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
<tr><td style="padding:10px 0;color:#8A7D6A;border-bottom:1px solid #E0D8C8;width:100px;">Gast</td><td style="padding:10px 0;font-weight:bold;border-bottom:1px solid #E0D8C8;">${naam}</td></tr>
<tr><td style="padding:10px 0;color:#8A7D6A;">E-mail</td><td style="padding:10px 0;"><a href="mailto:${esc(meta.gastEmail)}" style="color:#2F4F3E;">${esc(meta.gastEmail)}</a></td></tr>
</table>
</td></tr></table></td></tr>
</table></td></tr></table></body></html>`,
            replyTo: meta.gastEmail,
          });

          // Generate invoice PDF
          const amountValue = parseFloat(payment.amount?.value || "0");
          const productId = meta.productId || "";
          const factuurnummer = `HTH-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
          const factuurdatum = new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

          // Look up BTW rate from products table
          let btwPct = 21;
          try {
            const { data: productData } = await getSupabase()
              .from("products")
              .select("btw_percentage")
              .eq("id", productId)
              .single();
            if (productData?.btw_percentage !== undefined) {
              btwPct = productData.btw_percentage;
            }
          } catch {}

          const prijsExcl = amountValue / (1 + btwPct / 100);

          let invoicePdf: Buffer | null = null;
          try {
            invoicePdf = await generateInvoicePdf({
              factuurnummer,
              factuurdatum,
              gastNaam: meta.gastNaam || "Gast",
              gastEmail: meta.gastEmail || "",
              betaalmethode: "iDEAL",
              items: [{
                omschrijving: payment.description?.replace("Huis ter Huynen — ", "") || "Bestelling",
                aantal: 1,
                prijsExcl: Math.round(prijsExcl * 100) / 100,
                btwPercentage: btwPct,
              }],
            });
          } catch (e) {
            console.error("Invoice generation failed:", e);
          }

          // Confirmation to guest (with invoice attachment)
          await resend.emails.send({
            from: `${LODGE_NAME} <lodge@huisterhuynen.nl>`,
            to: [meta.gastEmail],
            subject: `Betaling bevestigd — ${LODGE_NAME}`,
            ...(invoicePdf ? { attachments: [{ filename: `factuur-${factuurnummer}.pdf`, content: invoicePdf }] } : {}),
            html: `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#EAE3D2;font-family:Georgia,serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EAE3D2;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
<tr><td align="center" style="padding:0 0 24px;font-size:22px;font-weight:bold;color:#52502E;letter-spacing:2px;">HUIS TER HUYNEN</td></tr>
<tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FDFBF6;border:1px solid #E0D8C8;border-radius:12px;">
<tr><td style="height:4px;background:#2E7D32;border-radius:12px 12px 0 0;">&nbsp;</td></tr>
<tr><td style="padding:28px;text-align:center;">
<p style="font-size:22px;color:#B49A5E;letter-spacing:8px;margin:0 0 16px;">◆</p>
<h1 style="margin:0 0 8px;font-size:26px;color:#2A2418;">Betaling ontvangen</h1>
<p style="margin:0 0 24px;font-size:15px;color:#8A7D6A;line-height:1.6;">Bedankt, ${naam}! Je betaling is succesvol verwerkt.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F1E8;border-radius:8px;margin-bottom:24px;">
<tr><td style="padding:18px 20px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="font-size:10px;color:#8A7D6A;text-transform:uppercase;letter-spacing:1px;padding-bottom:8px;">Je bestelling</td></tr>
<tr><td style="font-size:20px;font-weight:bold;color:#2A2418;">${product}</td><td align="right" style="font-size:20px;font-weight:bold;color:#2E7D32;">${prijs}</td></tr>
</table></td></tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
<tr><td style="padding:6px 0;font-size:13px;color:#2F4F3E;">&#10003; Betaling verwerkt</td></tr>
<tr><td style="padding:6px 0;font-size:13px;color:#2F4F3E;">&#10003; We regelen alles voor je</td></tr>
<tr><td style="padding:6px 0;font-size:13px;color:#2F4F3E;">&#10003; Vragen? We helpen graag</td></tr>
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E0D8C8;">
<tr><td style="padding:16px 0 0;font-size:12px;color:#8A7D6A;">WhatsApp ons op <a href="tel:+31642568603" style="color:#2F4F3E;font-weight:bold;">+31 6 42568603</a></td></tr>
</table>
</td></tr></table></td></tr>
<tr><td align="center" style="padding:24px 0 0;font-size:11px;color:#8A7D6A;">${LODGE_NAME} · Zuiderstraat 6 · Zeijen, Drenthe</td></tr>
</table></td></tr></table></body></html>`,
          });
        } catch (e) {
          console.error("Webhook email failed:", e);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Mollie webhook error:", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
