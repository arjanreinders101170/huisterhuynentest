import { NextRequest, NextResponse } from "next/server";

/*
 * Mollie Checkout API
 * Creates an iDEAL payment and returns the checkout URL.
 * 
 * Requires: MOLLIE_API_KEY in environment variables
 * Get your key at https://www.mollie.com/dashboard/developers/api-keys
 */

export async function POST(request: NextRequest) {
  try {
    const { product, amount, description, gastNaam, gastEmail, metadata } = await request.json();

    if (!product || !amount || !gastEmail) {
      return NextResponse.json({ error: "Product, bedrag en e-mail zijn verplicht" }, { status: 400 });
    }

    const mollieKey = process.env.MOLLIE_API_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://huisterhuynentest.vercel.app";

    if (!mollieKey) {
      // No Mollie key — fallback to email-only booking
      // Send booking email instead
      try {
        await fetch(`${appUrl}/api/booking`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product, prijs: `€ ${amount}`, gastNaam, gastEmail }),
        });
      } catch {}
      return NextResponse.json({
        success: true,
        fallback: true,
        message: "Boeking ontvangen. Betaling wordt per e-mail afgehandeld.",
      });
    }

    // Create Mollie payment
    const { createMollieClient } = await import("@mollie/api-client");
    const mollie = createMollieClient({ apiKey: mollieKey });

    const payment = await mollie.payments.create({
      amount: {
        currency: "EUR",
        value: parseFloat(amount).toFixed(2),
      },
      description: description || `Huis ter Huynen — ${product}`,
      redirectUrl: `${appUrl}/betaald?product=${encodeURIComponent(product)}`,
      metadata: {
        product,
        gastNaam: gastNaam || "",
        gastEmail: gastEmail || "",
        ...(metadata || {}),
      },
    });

    // Also send booking email
    try {
      await fetch(`${appUrl}/api/booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product,
          prijs: `€ ${amount}`,
          gastNaam,
          gastEmail,
          datum: new Date().toLocaleDateString("nl-NL", {
            weekday: "long", day: "numeric", month: "long", year: "numeric",
          }),
        }),
      });
    } catch {}

    return NextResponse.json({
      success: true,
      checkoutUrl: payment.getCheckoutUrl(),
      paymentId: payment.id,
    });
  } catch (err) {
    console.error("Mollie error:", err);
    return NextResponse.json(
      { error: "Betaling kon niet worden aangemaakt" },
      { status: 500 }
    );
  }
}
