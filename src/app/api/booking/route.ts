import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { product, naam, datum } = await request.json();
  const mollieKey = process.env.MOLLIE_API_KEY;

  if (mollieKey) {
    // Mollie betaling starten
    try {
      const prices: Record<string, string> = {
        Fietsverhuur: "12.50",
        "Wellness arrangement": "65.00",
        "Ontbijt op bed": "17.50",
        "Late check-out": "25.00",
      };

      const response = await fetch("https://api.mollie.com/v2/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mollieKey}`,
        },
        body: JSON.stringify({
          amount: {
            currency: "EUR",
            value: prices[product] || "0.00",
          },
          description: `${product} – Huis ter Huynen`,
          redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://app.huisterhuynen.nl"}/reserveren?success=true`,
          metadata: { product, naam, datum },
        }),
      });

      const data = await response.json();

      if (data._links?.checkout?.href) {
        return NextResponse.json({
          success: true,
          redirect: data._links.checkout.href,
        });
      }
    } catch {
      // Fallback naar formulier-modus
    }
  }

  // Geen Mollie: simpele bevestiging
  // In productie zou je hier een e-mail sturen of database-entry maken
  console.log(`Boeking ontvangen: ${product} voor ${naam} op ${datum}`);

  return NextResponse.json({
    success: true,
    message: `${product} is geboekt voor ${naam} op ${datum}. We nemen contact op ter bevestiging.`,
  });
}
