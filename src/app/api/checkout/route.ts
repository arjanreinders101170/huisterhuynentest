import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getProduct, calcFietsTotal } from "@/lib/products";
import { checkoutSchema } from "@/lib/schemas";
import { esc } from "@/lib/email";

const OWNER_EMAIL = "arjan@vvrvastgoedbv.nl";
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

    const { productId, gastNaam, gastEmail, metadata } = parsed.data;

    // Server-side price determination — client cannot set amount
    let amount: number;
    let productName: string;

    if (productId === "fiets") {
      // Dynamic pricing for bike rental
      const fietsen = metadata?.fietsen as Record<string, number> | undefined;
      const dagen = metadata?.dagen as number | undefined;
      if (!fietsen || !dagen) {
        return NextResponse.json({ error: "Fietskeuze en dagen zijn verplicht" }, { status: 400 });
      }
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

    // Create booking with status "pending"
    let bookingId = null;
    try {
      const { data } = await getSupabase().from("bookings").insert({
        guest_id: guestId,
        product: productName,
        prijs: amount,
        status: "nieuw",
        metadata: metadata || {},
      }).select("id").single();
      bookingId = data?.id;
    } catch (e) { console.error("Booking insert:", e); }

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
          metadata: { ...(metadata || {}), molliePaymentId: payment.id },
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
