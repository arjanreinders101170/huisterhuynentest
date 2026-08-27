import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getProduct, calcFietsTotal } from "@/lib/products";
import { checkoutSchema, fietsMetadataSchema } from "@/lib/schemas";
import { esc } from "@/lib/email";

const OWNER_EMAIL = process.env.OWNER_EMAIL || "arjan@vvrvastgoedbv.nl";
const LODGE_NAME = "Huis ter Huynen";

async function sendFallbackNotification(productName: string, amount: number, gastNaam: string, gastEmail: string) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(resendKey);
    const prijs = `€ ${amount.toFixed(2)}`;
    const datum = new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    await Promise.all([
      resend.emails.send({
        from: `${LODGE_NAME} <lodge@huisterhuynen.nl>`,
        to: [OWNER_EMAIL],
        subject: `Nieuwe boeking: ${productName} — ${esc(gastNaam)}`,
        html: `<p>Nieuwe boeking ontvangen op ${datum}.</p><p><strong>Product:</strong> ${esc(productName)}</p><p><strong>Prijs:</strong> ${prijs}</p><p><strong>Gast:</strong> ${esc(gastNaam)} &lt;<a href="mailto:${esc(gastEmail)}">${esc(gastEmail)}</a>&gt;</p>`,
        replyTo: gastEmail,
      }),
      resend.emails.send({
        from: `${LODGE_NAME} <lodge@huisterhuynen.nl>`,
        to: [gastEmail],
        subject: `Bedankt voor je aanvraag — ${LODGE_NAME}`,
        html: `<p>Hallo ${esc(gastNaam)},</p><p>Bedankt voor je aanvraag voor <strong>${esc(productName)}</strong> (${prijs}). We nemen binnenkort contact met je op.</p><p>Met vriendelijke groet,<br/>${LODGE_NAME}</p>`,
      }),
    ]);
  } catch (e) { console.error("Fallback notification email failed:", e); }
}

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    let body;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Ongeldige request" }, { status: 400 });
    }

    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Ongeldige invoer" }, { status: 400 });
    }

    const { productId, gastNaam, gastEmail, metadata, _meta } = parsed.data;

    /* Meta CAPI signals — stored in bookings.metadata so the Mollie webhook
     * can later fire a deduplicated Purchase event with the same event_id. */
    const fbp = request.cookies.get("_fbp")?.value;
    const fbc = request.cookies.get("_fbc")?.value;
    const trackingMeta = {
      meta_event_id: _meta?.event_id,
      anonymous_id: _meta?.anonymous_id,
      fbp,
      fbc,
    };

    // Server-side price determination — client cannot set amount
    let amount: number;
    let productName: string;

    if (productId === "fiets") {
      // Dynamic pricing for bike rental — invoer echt valideren, niet casten.
      const fiets = fietsMetadataSchema.safeParse(metadata);
      if (!fiets.success) {
        return NextResponse.json({ error: "Fietskeuze en dagen zijn verplicht" }, { status: 400 });
      }
      const { fietsen, dagen } = fiets.data;
      amount = await calcFietsTotal(fietsen, dagen);
      productName = "Fietsverhuur";
      if (amount <= 0) {
        return NextResponse.json({ error: "Selecteer minimaal één fiets" }, { status: 400 });
      }
    } else {
      // Fixed-price product
      const product = await getProduct(productId);
      if (!product) {
        return NextResponse.json({ error: "Onbekend product" }, { status: 400 });
      }
      amount = product.prijs;
      productName = product.naam;
    }

    /* Laatste zeef vóór er een betaallink ontstaat. Geen enkel product bij
     * ons kost minder dan een euro, dus een lager bedrag betekent altijd dat
     * er iets mis is met de invoer — ongeacht via welk pad. */
    if (!Number.isFinite(amount) || amount < 1) {
      return NextResponse.json({ error: "Ongeldig bedrag" }, { status: 400 });
    }

    const mollieKey = process.env.MOLLIE_API_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://huisterhuynen.nl";

    // Upsert guest
    let guestId = null;
    try {
      const { data } = await getSupabase().rpc("upsert_guest", {
        p_naam: gastNaam,
        p_email: gastEmail,
      });
      guestId = data;
    } catch (e) { console.error("Guest upsert:", e); }

    /* Create booking with status "pending"
     *
     * De fout hier moet uitgelezen worden. Supabase geeft een geweigerde
     * insert terug als waarde en niet als exception, dus de try/catch
     * eromheen ving hem niet: bookingId bleef stil op null, waarna de
     * betaling alsnog naar Mollie ging met een lege bookingId in de
     * metadata. De gast betaalt dan, maar de webhook heeft niets om de
     * betaling aan te koppelen. */
    let bookingId = null;
    try {
      const { data, error } = await getSupabase().from("bookings").insert({
        guest_id: guestId,
        product: productName,
        prijs: amount,
        status: "nieuw",
        metadata: { ...(metadata || {}), ...trackingMeta },
      }).select("id").single();
      if (error) console.error("[checkout] booking insert geweigerd:", error.message, error.code);
      bookingId = data?.id;
    } catch (e) { console.error("[checkout] booking insert wierp:", e); }

    /* Zonder boekingsrij is de betaling straks niet te herleiden. De gast
     * mag daar niet op stranden, dus de betaling gaat door — maar dan moet
     * de eigenaar het wél weten, want alleen de mail legt deze bestelling
     * dan nog vast. */
    if (!bookingId) {
      console.error(`[checkout] GEEN boekingsrij voor ${productName} (${gastEmail}) — betaling wordt niet automatisch gekoppeld`);
      await sendFallbackNotification(productName, amount, gastNaam, gastEmail);
    }

    if (!mollieKey) {
      // No Mollie key — fallback to email-only booking
      await sendFallbackNotification(productName, amount, gastNaam, gastEmail);
      return NextResponse.json({
        success: true,
        fallback: true,
        message: "Boeking ontvangen. Betaling wordt per e-mail afgehandeld.",
      });
    }

    // Create Mollie payment
    const mollieResponse = await fetch("https://api.mollie.com/v2/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${mollieKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: {
          currency: "EUR",
          value: amount.toFixed(2),
        },
        description: `Huis ter Huynen — ${productName}`,
        redirectUrl: `${appUrl}/betaald?product=${encodeURIComponent(productName)}&booking=${bookingId || ""}`,
        webhookUrl: `${appUrl}/api/mollie/webhook`,
        metadata: {
          bookingId: bookingId || "",
          productId,
          gastNaam,
          gastEmail,
        },
      }),
    });

    if (!mollieResponse.ok) {
      const err = await mollieResponse.json().catch(() => ({}));
      console.error("Mollie error:", err);
      // Fallback to email
      await sendFallbackNotification(productName, amount, gastNaam, gastEmail);
      return NextResponse.json({
        success: true,
        fallback: true,
        message: "Boeking ontvangen. Betaling wordt per e-mail afgehandeld.",
      });
    }

    const payment = await mollieResponse.json();

    // Store Mollie payment ID on booking
    if (bookingId) {
      try {
        await getSupabase().from("bookings").update({
          metadata: { ...(metadata || {}), ...trackingMeta, molliePaymentId: payment.id },
        }).eq("id", bookingId);
      } catch {}
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: payment._links?.checkout?.href || null,
      paymentId: payment.id,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Betaling kon niet worden aangemaakt" }, { status: 500 });
  }
}
