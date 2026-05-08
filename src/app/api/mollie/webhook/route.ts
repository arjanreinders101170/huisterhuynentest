import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getSupabase } from "@/lib/supabase";
import { esc } from "@/lib/email";
import { generateInvoicePdf } from "@/lib/invoice";
import { findOrCreateRelation, pushInvoice } from "@/lib/eboekhouden";

export const runtime = "nodejs";

const OWNER_EMAIL = "arjan@vvrvastgoedbv.nl";
const BRAND = "Huis ter Huynen";

const LODGE_LABEL: Record<string, string> = {
  lodge_1: "Boomhut Lodge",
  lodge_2: "Schaapskooi Lodge",
};

function lodgeNaamFor(lodge: string | null | undefined): string {
  if (lodge && LODGE_LABEL[lodge]) return LODGE_LABEL[lodge];
  return "";
}

/**
 * Verify Mollie webhook signature.
 *
 * Mollie's standard signature scheme uses an `X-Mollie-Signature` header
 * containing an HMAC-SHA256 of the raw body, hex-encoded, with a shared secret
 * configured per webhook endpoint. Some integrations use the `Authorization`
 * header for the same purpose. We accept either, since Mollie has migrated the
 * exact header name across versions.
 *
 * Returns:
 *  - "ok" when the signature is valid
 *  - "missing" when no secret is configured (we cannot verify, fall through)
 *  - "invalid" when a secret is configured but the signature does not match
 *  - "absent" when a secret is configured but no signature header was sent
 */
function verifySignature(
  rawBody: string,
  request: NextRequest,
): "ok" | "missing" | "invalid" | "absent" {
  const secret = process.env.MOLLIE_WEBHOOK_SECRET;
  if (!secret) return "missing";

  const headerCandidates = [
    request.headers.get("x-mollie-signature"),
    request.headers.get("authorization"),
  ];
  const provided = headerCandidates
    .map((h) => h?.replace(/^Bearer\s+/i, "").trim() || "")
    .find((h) => h.length > 0);

  if (!provided) return "absent";

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");

  // timingSafeEqual requires equal-length buffers
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(provided, "utf8");
  if (a.length !== b.length) return "invalid";
  try {
    return timingSafeEqual(a, b) ? "ok" : "invalid";
  } catch {
    return "invalid";
  }
}

export async function POST(request: NextRequest) {
  let rawBody = "";
  try {
    // Raw body capture — Mollie sends form-encoded body
    rawBody = await request.text();
    const params = new URLSearchParams(rawBody);
    const paymentId = params.get("id");

    if (!paymentId) {
      return NextResponse.json({ error: "No payment ID" }, { status: 400 });
    }

    const mollieKey = process.env.MOLLIE_API_KEY;
    if (!mollieKey) {
      return NextResponse.json({ error: "Mollie not configured" }, { status: 500 });
    }

    // Signature verification (graceful — never block Mollie retries)
    const sigResult = verifySignature(rawBody, request);
    const signatureValid = sigResult === "ok" || sigResult === "missing";

    // Fetch payment status from Mollie (verify-by-API is the primary trust signal)
    const mollieResponse = await fetch(`https://api.mollie.com/v2/payments/${paymentId}`, {
      headers: { "Authorization": `Bearer ${mollieKey}` },
    });

    if (!mollieResponse.ok) {
      console.error("Mollie webhook fetch failed:", mollieResponse.status);
      return NextResponse.json({ error: "Could not fetch payment" }, { status: 500 });
    }

    const payment = await mollieResponse.json();
    const status: string = payment.status; // paid, failed, canceled, expired, pending
    const meta = payment.metadata || {};
    const bookingId: string | undefined = meta.bookingId;

    // Idempotency log — UNIQUE (payment_id, payment_status) catches replays.
    // We log every webhook hit (including signature failures) for forensics.
    try {
      const { error: insertErr } = await getSupabase()
        .from("mollie_webhook_events")
        .insert({
          payment_id: paymentId,
          payment_status: status,
          booking_id: bookingId || null,
          signature_valid: signatureValid,
          processed: false,
          raw_body: rawBody,
        });
      if (insertErr) {
        // PostgreSQL UNIQUE violation = code 23505 → replay
        const code = (insertErr as { code?: string }).code;
        if (code === "23505") {
          return NextResponse.json({ received: true, replay: true });
        }
        // Any other DB error: log and bail safely (Mollie will retry)
        console.error("mollie_webhook_events insert failed:", insertErr);
        return NextResponse.json({ received: true });
      }
    } catch (e) {
      console.error("mollie_webhook_events insert threw:", e);
      return NextResponse.json({ received: true });
    }

    // Bad signature → log only, no state change. Return 200 OK so Mollie
    // does not retry forever.
    if (sigResult === "invalid" || sigResult === "absent") {
      console.warn(`Mollie webhook signature ${sigResult} for payment ${paymentId}`);
      return NextResponse.json({ received: true });
    }

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

    // Atomic UPDATE: only transition status="nieuw" forward. Replays or
    // out-of-order webhooks find no row and do nothing.
    const { data: updatedBooking, error: updateErr } = await getSupabase()
      .from("bookings")
      .update({
        status: bookingStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId)
      .eq("status", "nieuw")
      .select("id, lodge, metadata")
      .maybeSingle();

    if (updateErr) {
      console.error("Booking status update failed:", updateErr);
      return NextResponse.json({ received: true });
    }

    // Booking already processed (or unknown) — leave processed=false and stop.
    if (!updatedBooking) {
      return NextResponse.json({ received: true });
    }

    // Side-effects only fire on successful "nieuw" → "betaald" transition.
    if (bookingStatus === "betaald" && meta.gastEmail) {
      const lodge = (updatedBooking.lodge as string | null) || (meta.lodge as string | null) || null;
      const lodgeNaam = lodgeNaamFor(lodge);
      const subjectSuffix = lodgeNaam ? ` — ${lodgeNaam}` : "";

      const amountValue = parseFloat(payment.amount?.value || "0");
      const productId = meta.productId || "";
      const factuurnummer = `HTH-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      const factuurdatum = new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
      const product = payment.description?.replace(`${BRAND} — `, "") || "Bestelling";

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

      // ── Invoice idempotency ────────────────────────────────────────
      // Insert invoice first so we can attach the PDF + push to e-Boekhouden
      // exactly once. uq_invoice_booking guards against double-inserts on retry.
      const amountExcl = Math.round(prijsExcl * 100) / 100;
      const vatAmount = Math.round((amountValue - prijsExcl) * 100) / 100;

      let invoiceFreshlyCreated = false;
      try {
        const { error: invInsertErr } = await getSupabase().from("invoices").insert({
          booking_id: bookingId,
          invoice_number: factuurnummer,
          amount_excl: amountExcl,
          vat_amount: vatAmount,
          amount_total: amountValue,
          status: "created",
          pushed_to_accounting: false,
          lodge,
        });
        if (invInsertErr) {
          const code = (invInsertErr as { code?: string }).code;
          if (code !== "23505") {
            console.error("Invoice insert failed:", invInsertErr);
          }
          // Replay or retry: invoice already exists. Continue with emails so
          // first-time email failures still get a recovery attempt.
        } else {
          invoiceFreshlyCreated = true;
        }
      } catch (e) {
        console.error("Invoice insert threw:", e);
      }

      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey) {
        try {
          const { Resend } = await import("resend");
          const resend = new Resend(resendKey);

          const prijs = `€ ${payment.amount?.value || "0.00"}`;
          const naam = esc(meta.gastNaam || "Gast");

          // Email to owner
          await resend.emails.send({
            from: `${BRAND} <lodge@huisterhuynen.nl>`,
            to: [OWNER_EMAIL],
            subject: `Betaling ontvangen: ${product} — ${naam}${subjectSuffix}`,
            html: `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#EAE3D2;font-family:Georgia,serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EAE3D2;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
<tr><td align="center" style="padding:0 0 24px;font-size:22px;font-weight:bold;color:#52502E;letter-spacing:2px;">HUIS TER HUYNEN</td></tr>
<tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FDFBF6;border:1px solid #E0D8C8;border-radius:12px;">
<tr><td style="height:4px;background:#2E7D32;border-radius:12px 12px 0 0;">&nbsp;</td></tr>
<tr><td style="padding:28px;">
<h1 style="margin:0 0 8px;font-size:24px;color:#2A2418;">Betaling ontvangen &#10003;</h1>
<p style="margin:0 0 20px;font-size:13px;color:#8A7D6A;">Via iDEAL — ${new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}${lodgeNaam ? ` &middot; ${esc(lodgeNaam)}` : ""}</p>
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
                omschrijving: payment.description?.replace(`${BRAND} — `, "") || "Bestelling",
                aantal: 1,
                prijsExcl: Math.round(prijsExcl * 100) / 100,
                btwPercentage: btwPct,
              }],
              opmerkingen: lodgeNaam ? `Verblijf: ${lodgeNaam}` : undefined,
            });
          } catch (e) {
            console.error("Invoice generation failed:", e);
          }

          // Confirmation to guest (with invoice attachment)
          await resend.emails.send({
            from: `${BRAND} <lodge@huisterhuynen.nl>`,
            to: [meta.gastEmail],
            subject: `Betaling bevestigd — ${BRAND}${subjectSuffix}`,
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
<p style="font-size:22px;color:#B49A5E;letter-spacing:8px;margin:0 0 16px;">&#9670;</p>
<h1 style="margin:0 0 8px;font-size:26px;color:#2A2418;">Betaling ontvangen</h1>
<p style="margin:0 0 24px;font-size:15px;color:#8A7D6A;line-height:1.6;">Bedankt, ${naam}! Je betaling is succesvol verwerkt.${lodgeNaam ? `<br/><span style="font-size:13px;">${esc(lodgeNaam)}</span>` : ""}</p>
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
<tr><td align="center" style="padding:24px 0 0;font-size:11px;color:#8A7D6A;">${BRAND} &middot; Zuiderstraat 6 &middot; Zeijen, Drenthe</td></tr>
</table></td></tr></table></body></html>`,
          });
        } catch (e) {
          console.error("Webhook email failed:", e);
        }
      }

      // ═══ PUSH TO E-BOEKHOUDEN (only on first invoice insert) ═══
      if (invoiceFreshlyCreated && process.env.EBOEKHOUDEN_API_TOKEN && meta.gastEmail) {
        try {
          let grootboekCode = "8020"; // Default: Omzet Huis ter Huynen
          try {
            const { data: prod } = await getSupabase()
              .from("products")
              .select("grootboek_code")
              .eq("id", productId)
              .single();
            if (prod?.grootboek_code) grootboekCode = prod.grootboek_code;
          } catch {}

          const relationId = await findOrCreateRelation(
            meta.gastNaam || "Gast",
            meta.gastEmail,
          );

          if (relationId) {
            const accountingRef = await pushInvoice({
              invoiceNumber: factuurnummer,
              relationId,
              description: `${BRAND} — ${product}`,
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
        } catch (e) {
          console.error("e-Boekhouden sync failed:", e);
        }
      }
    }

    // Mark webhook event as processed (fire-and-forget log update).
    try {
      await getSupabase()
        .from("mollie_webhook_events")
        .update({ processed: true })
        .eq("payment_id", paymentId)
        .eq("payment_status", status);
    } catch {}

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Mollie webhook error:", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
