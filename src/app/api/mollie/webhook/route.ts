import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { esc, lodgeEmail, infoBlock, detailsBlock, checklist } from "@/lib/email";
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

    // Sync de gekoppelde aanvraag bij aanbetaling/restbetaling-links uit de admin
    if (bookingStatus === "betaald" && meta.bookingRequestId && meta.betaalfase) {
      try {
        await getSupabase().from("booking_requests").update({
          status: meta.betaalfase === "aanbetaling" ? "aanbetaling_betaald" : "volledig_betaald",
        }).eq("id", meta.bookingRequestId);
      } catch (e) {
        console.error("booking_request betaalfase-sync mislukt:", e);
      }
    }

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
            html: lodgeEmail({
              title: "Betaling ontvangen",
              intro: `Via iDEAL &middot; ${esc(new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" }))}`,
              blocks: [
                infoBlock("Betaald product", esc(product), `<span style="color:#2E7D32;">${prijs}</span>`),
                detailsBlock("Gast", [
                  { label: "Naam", value: naam },
                  { label: "E-mail", value: esc(meta.gastEmail), href: `mailto:${esc(meta.gastEmail)}` },
                ]),
              ],
              footer: `Reageer rechtstreeks naar de gast: <a href="mailto:${esc(meta.gastEmail)}" style="color:#2F4F3E;font-weight:bold;text-decoration:none;">${esc(meta.gastEmail)}</a>`,
            }),
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
            html: lodgeEmail({
              title: "Betaling ontvangen",
              intro: `Bedankt, ${naam}! Je betaling is succesvol verwerkt.${invoicePdf ? " Je factuur vind je in de bijlage." : ""}`,
              blocks: [
                infoBlock("Je bestelling", esc(product), `<span style="color:#2E7D32;">${prijs}</span>`),
                checklist([
                  "Betaling verwerkt",
                  "We regelen alles voor je",
                  "Vragen? We helpen graag",
                ]),
              ],
            }),
          });
        } catch (e) {
          console.error("Webhook email failed:", e);
        }
      }

      // ═══ META CAPI — server-of-record Purchase event ═══
      // Fires once per paid booking. Same event_id as the browser
      // InitiateCheckout is used so Meta dedups the funnel correctly.
      // Bij een aanbetaling (30%) slaan we Purchase over om dubbeltelling te
      // voorkomen; de restbetaling (laatste fase) telt als de echte conversie.
      if (meta.betaalfase !== "aanbetaling") try {
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
