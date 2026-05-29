import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { esc } from "@/lib/email";
import { generateInvoicePdf } from "@/lib/invoice";
import { findOrCreateRelation, pushInvoice } from "@/lib/eboekhouden";
import { sendCapi, buildUser } from "@/lib/tracking/capi";

export const runtime = "nodejs";

const OWNER_EMAIL = process.env.OWNER_EMAIL || "arjan@vvrvastgoedbv.nl";
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

    // Fetch booking voor idempotency-check en bedragcontrole
    const { data: bestaandeBoeking } = await getSupabase()
      .from("bookings")
      .select("id, status, prijs")
      .eq("id", bookingId)
      .single();

    if (!bestaandeBoeking) {
      console.warn(`Mollie webhook: bookingId ${bookingId} niet gevonden (payment ${paymentId})`);
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

    // Idempotency: al verwerkt → stuur 200 zodat Mollie niet opnieuw probeert
    if (bestaandeBoeking.status === bookingStatus) {
      console.log(`Mollie webhook: ${paymentId} al verwerkt voor booking ${bookingId}, skip`);
      return NextResponse.json({ received: true });
    }

    // Bedragcontrole: betaald bedrag moet overeenkomen met verwacht bedrag
    if (bookingStatus === "betaald" && bestaandeBoeking.prijs) {
      const betaaldBedrag = parseFloat(payment.amount?.value || "0");
      if (betaaldBedrag < bestaandeBoeking.prijs - 0.01) {
        console.error(
          `Mollie webhook: bedragmismatch voor booking ${bookingId} — ` +
          `verwacht €${bestaandeBoeking.prijs}, ontvangen €${betaaldBedrag} (payment ${paymentId})`
        );
        return NextResponse.json({ received: true });
      }
    }

    // Update booking status
    await getSupabase().from("bookings").update({
      status: bookingStatus,
      mollie_payment_id: paymentId,
      updated_at: new Date().toISOString(),
    }).eq("id", bookingId);

    // Send confirmation emails only when paid
    if (bookingStatus === "betaald" && meta.gastEmail) {
      // Shared invoice variables
      const amountValue = parseFloat(payment.amount?.value || "0");
      const productId = meta.productId || "";
      const factuurnummer = `HTH-${new Date().getFullYear()}-${bookingId.slice(-8).toUpperCase()}`;
      const factuurdatum = new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
      const product = payment.description?.replace("Huis ter Huynen — ", "") || "Bestelling";

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

      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey) {
        try {
          const { Resend } = await import("resend");
          const resend = new Resend(resendKey);

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

      // ═══ META CAPI — server-of-record Purchase event ═══
      // Fires once per paid booking. Same event_id as the browser
      // InitiateCheckout is used so Meta dedups the funnel correctly.
      try {
        const { data: bookingRow } = await getSupabase()
          .from("bookings")
          .select("metadata")
          .eq("id", bookingId)
          .single();
        const meta_event_id =
          (bookingRow?.metadata as Record<string, unknown> | null)?.meta_event_id as string | undefined ??
          `purchase-${bookingId}`;
        const fbp = (bookingRow?.metadata as Record<string, unknown> | null)?.fbp as string | undefined;
        const fbc = (bookingRow?.metadata as Record<string, unknown> | null)?.fbc as string | undefined;
        const anonymous_id = (bookingRow?.metadata as Record<string, unknown> | null)?.anonymous_id as string | undefined;

        const [firstName, ...rest] = (meta.gastNaam || "").trim().split(/\s+/);
        const lastName = rest.join(" ") || undefined;

        await sendCapi([{
          event_name: "Purchase",
          event_time: Math.floor(Date.now() / 1000),
          event_id: meta_event_id,
          event_source_url: `https://www.huisterhuynen.nl/betaald?booking=${bookingId}`,
          action_source: "website",
          user_data: buildUser({
            email: meta.gastEmail,
            firstName: firstName || undefined,
            lastName,
            country: "NL",
            externalId: anonymous_id,
            fbp,
            fbc,
          }),
          custom_data: {
            currency: "EUR",
            value: amountValue,
            content_type: "product",
            content_ids: [productId || "concierge"],
            content_name: product,
            num_items: 1,
            order_id: bookingId,
          },
        }]);
      } catch (e) {
        console.error("[CAPI Purchase] failed:", e);
      }

      // ═══ SAVE INVOICE TO DB + PUSH TO E-BOEKHOUDEN ═══
      try {
        const amountExcl = Math.round(prijsExcl * 100) / 100;
        const vatAmount = Math.round((amountValue - prijsExcl) * 100) / 100;

        // Save invoice record — unique constraint op booking_id vangt webhook-retries op
        const { error: invoiceInsertError } = await getSupabase().from("invoices").insert({
          booking_id: bookingId,
          invoice_number: factuurnummer,
          mollie_payment_id: paymentId,
          amount_excl: amountExcl,
          vat_amount: vatAmount,
          amount_total: amountValue,
          status: "created",
          pushed_to_accounting: false,
        });

        // 23505 = unique_violation: factuur bestaat al, idempotency-check heeft dit gemist
        if (invoiceInsertError?.code === "23505") {
          console.log(`Mollie webhook: factuur voor booking ${bookingId} bestaat al, skip accounting push`);
          return NextResponse.json({ received: true });
        }
        if (invoiceInsertError) throw invoiceInsertError;

        // Push to e-Boekhouden if configured
        if (process.env.EBOEKHOUDEN_API_TOKEN && meta.gastEmail) {
          // Get product grootboek code
          let grootboekCode = "8020"; // Default: Omzet Huis ter Huynen
          try {
            const { data: prod } = await getSupabase()
              .from("products")
              .select("grootboek_code")
              .eq("id", productId)
              .single();
            if (prod?.grootboek_code) grootboekCode = prod.grootboek_code;
          } catch {}

          // Find or create debiteur
          const relationId = await findOrCreateRelation(
            meta.gastNaam || "Gast",
            meta.gastEmail,
          );

          if (relationId) {
            const accountingRef = await pushInvoice({
              invoiceNumber: factuurnummer,
              relationId,
              description: `Huis ter Huynen — ${product}`,
              lines: [{
                description: product,
                amountExcl: amountExcl,
                btwPercentage: btwPct,
                grootboekCode,
              }],
            });

            if (accountingRef) {
              await getSupabase().from("invoices").update({
                pushed_to_accounting: true,
                accounting_reference: accountingRef,
                status: "synced",
              }).eq("invoice_number", factuurnummer);
            }
          }
        }
      } catch (e) {
        console.error("Invoice/accounting sync failed:", e);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Mollie webhook error:", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
