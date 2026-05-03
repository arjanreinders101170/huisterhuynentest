import { NextRequest, NextResponse } from "next/server";

/*
 * Mollie Checkout — uses REST API directly (no SDK)
 * This avoids serverless function size limits on Vercel.
 * 
 * Requires: MOLLIE_API_KEY in environment variables
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

    // Create payment via Mollie REST API
    const mollieResponse = await fetch("https://api.mollie.com/v2/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${mollieKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
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
      }),
    });

    if (!mollieResponse.ok) {
      const err = await mollieResponse.json();
      console.error("Mollie error:", err);
      // Fallback to email booking
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

    const payment = await mollieResponse.json();

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
      checkoutUrl: payment._links?.checkout?.href || null,
      paymentId: payment.id,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Betaling kon niet worden aangemaakt" },
      { status: 500 }
    );
  }
}
