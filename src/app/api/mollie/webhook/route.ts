import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { esc, lodgeEmail, infoBlock, detailsBlock, checklist, calloutBlock, termsFooter } from "@/lib/email";
import { APP_URL_FALLBACK } from "@/data/lodge";
import { generateInvoicePdf } from "@/lib/invoice";
import { findOrCreateRelation, pushInvoice } from "@/lib/eboekhouden";
import { sendCapi, buildUser } from "@/lib/tracking/capi";

export const runtime = "nodejs";

const OWNER_EMAIL = process.env.OWNER_EMAIL || "arjan@vvrvastgoedbv.nl";
const LODGE_NAME = "Huis ter Huynen";

/* Terugvaltarief wanneer noch de betaling noch het product een btw-percentage
 * aanlevert. Het logiestarief zelf staat in LOGIES_BTW_PCT (src/data/lodge.ts)
 * en wordt door de betaallink meegestuurd; deze waarde geldt alleen voor
 * betalingen die helemaal niets meegeven. */
const STANDAARD_BTW_PCT = 21;

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

    /* Sync de gekoppelde aanvraag bij aanbetaling/restbetaling-links uit de
     * admin. Een restbetaling mag de aanvraag alleen op 'volledig_betaald'
     * zetten als de aanbetaling er daadwerkelijk is: een gast die een oude
     * betaallink bewaart kan anders de 70% voldoen terwijl de 30% nog
     * openstaat, en dan zegt het dashboard dat alles binnen is. */
    let aanbetalingOntbreekt = false;
    if (bookingStatus === "betaald" && meta.bookingRequestId && meta.betaalfase) {
      try {
        if (meta.betaalfase === "aanbetaling") {
          await getSupabase().from("booking_requests").update({
            status: "aanbetaling_betaald",
          }).eq("id", meta.bookingRequestId);
        } else {
          // Het geld zelf is de harde bron: een betaalde bookings-rij voor de
          // aanbetaling van dezelfde aanvraag. De aanvraagstatus geldt als
          // tweede signaal, voor het geval de JSON-filter niets teruggeeft.
          const { data: aanbetaling } = await getSupabase()
            .from("bookings")
            .select("id")
            .eq("metadata->>bookingRequestId", meta.bookingRequestId)
            .eq("metadata->>betaalfase", "aanbetaling")
            .eq("status", "betaald")
            .limit(1);

          const { data: aanvraag } = await getSupabase()
            .from("booking_requests")
            .select("status")
            .eq("id", meta.bookingRequestId)
            .single();

          const statusZegtBetaald = ["aanbetaling_betaald", "restbetaling_verstuurd", "volledig_betaald"]
            .includes(aanvraag?.status ?? "");

          if ((aanbetaling?.length ?? 0) > 0 || statusZegtBetaald) {
            await getSupabase().from("booking_requests").update({
              status: "volledig_betaald",
            }).eq("id", meta.bookingRequestId);
          } else {
            // Niet op 'volledig_betaald' zetten. De betaling zelf staat al in
            // bookings, dus het geld is geregistreerd; de aanvraag blijft
            // zichtbaar als openstaand tot de aanbetaling alsnog binnen is.
            aanbetalingOntbreekt = true;
            console.error(
              `Mollie webhook: restbetaling binnen voor aanvraag ${meta.bookingRequestId} ` +
              `terwijl de aanbetaling niet als betaald bekend staat (status ${aanvraag?.status ?? "onbekend"}, ` +
              `payment ${paymentId}) — status niet op volledig_betaald gezet`
            );
          }
        }
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

      /* BTW-tarief bepalen, in volgorde van betrouwbaarheid:
       *   1. wat de betaling zelf meegaf — betaallinks voor een verblijf
       *      sturen het logiestarief expliciet mee;
       *   2. het tarief van het product, bij een losse bestelling via
       *      /api/checkout;
       *   3. het algemene tarief, als geen van beide iets oplevert.
       *
       * Voorheen stond hier alleen stap 2, met een kale 21 als beginwaarde en
       * een lege catch eromheen. Bij elke betaallink mislukte die lookup — die
       * stuurt geen productId mee — en bleef de 21 stil staan. Het bedrag
       * klopte, maar niemand had het gekozen en een fout was onzichtbaar. */
      const btwUitMetadata = Number(meta.btwPct);
      const btwUitMetadataGeldig = Number.isFinite(btwUitMetadata) && btwUitMetadata >= 0 && btwUitMetadata <= 100;
      let btwPct = btwUitMetadataGeldig ? btwUitMetadata : STANDAARD_BTW_PCT;

      if (!btwUitMetadataGeldig && productId) {
        const { data: productData, error: productError } = await getSupabase()
          .from("products")
          .select("btw_percentage")
          .eq("id", productId)
          .maybeSingle();
        if (productError) {
          console.error(
            `Mollie webhook: btw-tarief van product ${productId} niet op te halen ` +
            `(${productError.message}) — ${STANDAARD_BTW_PCT}% aangehouden voor payment ${paymentId}`
          );
        } else if (productData?.btw_percentage != null) {
          btwPct = productData.btw_percentage;
        } else {
          console.warn(
            `Mollie webhook: product ${productId} heeft geen btw_percentage — ` +
            `${STANDAARD_BTW_PCT}% aangehouden voor payment ${paymentId}`
          );
        }
      }

      /* Toeristenbelasting valt buiten de BTW en hoort op een eigen regel met
       * eigen grootboek (8040). De betaallink geeft mee welk deel bij deze
       * termijn hoort. Ontbreekt dat — losse producten via /api/checkout, of
       * betalingen van vóór deze wijziging — dan blijft het één regel zoals
       * voorheen en verandert er niets aan de factuur. */
      const toeristenbelasting = Math.min(
        Math.max(parseFloat(String(meta.toeristenbelasting ?? "0")) || 0, 0),
        amountValue,
      );
      const logiesIncl = Math.round((amountValue - toeristenbelasting) * 100) / 100;

      /* De gast betaalt een brutobedrag, dus de BTW wordt daaruit teruggerekend
       * en het excl-bedrag is de rest. Andersom — excl afronden en er daarna
       * BTW over rekenen — komt bij sommige bedragen een cent naast het
       * betaalde bedrag uit, en dan sluit de factuur niet aan op de bank. */
      const logiesBtw = Math.round(logiesIncl * (btwPct / (100 + btwPct)) * 100) / 100;
      const logiesExcl = Math.round((logiesIncl - logiesBtw) * 100) / 100;

      const factuurRegels = [
        { omschrijving: product, aantal: 1, prijsExcl: logiesExcl, btwPercentage: btwPct, btwBedrag: logiesBtw },
        ...(toeristenbelasting > 0
          ? [{ omschrijving: "Toeristenbelasting", aantal: 1, prijsExcl: toeristenbelasting, btwPercentage: 0, btwBedrag: 0 }]
          : []),
      ];

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
                ...(aanbetalingOntbreekt ? [calloutBlock(
                  "Let op: aanbetaling staat nog open",
                  "Deze restbetaling is binnen, maar van de aanbetaling is geen betaling bekend. De aanvraag is daarom niet op &lsquo;volledig betaald&rsquo; gezet &mdash; controleer of de 30% alsnog voldaan moet worden.",
                )] : []),
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
              items: factuurRegels,
            });
          } catch (e) {
            console.error("Invoice generation failed:", e);
          }

          /* Een termijnbetaling van een verblijf is iets anders dan een losse
           * bestelling: bij een aanbetaling moet de gast weten dat de 70% nog
           * komt, en bij de restbetaling dat hij klaar is. Zonder betaalfase
           * (losse producten via /api/checkout) blijft de oude tekst staan. */
          const fase = meta.betaalfase === "aanbetaling" || meta.betaalfase === "restbetaling"
            ? meta.betaalfase
            : null;
          const bedankt = fase === "aanbetaling"
            ? `Bedankt, ${naam}! Je aanbetaling is binnen. De restbetaling van 70% volgt uiterlijk 30 dagen voor aankomst — daarvoor krijg je op tijd een nieuwe betaallink.`
            : fase === "restbetaling"
              ? `Bedankt, ${naam}! Je verblijf is hiermee volledig betaald.`
              : `Bedankt, ${naam}! Je betaling is succesvol verwerkt.`;
          const bedanktLijst = fase === "aanbetaling"
            ? ["Aanbetaling verwerkt", "Je reservering staat vast", "De restbetaling volgt uiterlijk 30 dagen voor aankomst"]
            : fase === "restbetaling"
              ? ["Restbetaling verwerkt", "Je verblijf is volledig betaald", "Je gast-app volgt enkele dagen voor aankomst"]
              : ["Betaling verwerkt", "We regelen alles voor je", "Vragen? We helpen graag"];

          // Confirmation to guest (with invoice attachment)
          await resend.emails.send({
            from: `${LODGE_NAME} <lodge@huisterhuynen.nl>`,
            to: [meta.gastEmail],
            subject: `Betaling bevestigd — ${LODGE_NAME}`,
            ...(invoicePdf ? { attachments: [{ filename: `factuur-${factuurnummer}.pdf`, content: invoicePdf }] } : {}),
            html: lodgeEmail({
              title: "Betaling ontvangen",
              intro: `${bedankt}${invoicePdf ? " Je factuur vind je in de bijlage." : ""}`,
              blocks: [
                infoBlock(fase ? "Je verblijf" : "Je bestelling", esc(product), `<span style="color:#2E7D32;">${prijs}</span>`),
                checklist(bedanktLijst),
              ],
              footer: termsFooter(new URL(process.env.NEXT_PUBLIC_APP_URL || APP_URL_FALLBACK).origin),
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
        const amountExcl = Math.round((logiesExcl + toeristenbelasting) * 100) / 100;
        const vatAmount = logiesBtw;

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
              lines: [
                { description: product, amountExcl: logiesExcl, btwPercentage: btwPct, grootboekCode, amountIncl: logiesIncl },
                ...(toeristenbelasting > 0
                  ? [{ description: "Toeristenbelasting", amountExcl: toeristenbelasting, btwPercentage: 0, grootboekCode: "8040", amountIncl: toeristenbelasting }]
                  : []),
              ],
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
