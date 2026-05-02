import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { messages } = await request.json();
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // Fallback: gebruik hardcoded antwoorden als er geen API key is
    const fallbacks: Record<string, string> = {
      wandel: "Het Dwingelderveld is prachtig! Slechts 10 minuten rijden. Ook het Ommetje Zeijen (5 min) is een aanrader voor een korte wandeling 🌿",
      restaurant: "Herberg van Loon is een favoriet bij onze gasten — heerlijke Drentse keuken. Jufferen Lunsingh in Rolde is ook een aanrader voor een bijzonder diner 🍽️",
      kinder: "Speelbos Grolloo is geweldig voor kinderen! En het Wildlands Adventure Zoo in Emmen is ook een leuk dagje uit 👧",
      weer: "Het is vandaag zonnig, 18°C. Perfect weer voor een wandeling over het Dwingelderveld of een fietstocht door de Drentsche Aa ☀️",
      wellness: "Sauna Drenthe is een heerlijke dagbesteding. We kunnen ook een massage aan huis regelen — vraag gerust naar de mogelijkheden 💆",
      default: "Leuke vraag! Ik raad het Dwingelderveld aan voor natuur, Herberg van Loon voor eten, en voor cultuur zijn de hunebedden een must. Wat spreekt je aan?",
    };

    const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
    let reply = fallbacks.default;
    if (lastMsg.includes("wandel") || lastMsg.includes("natuur")) reply = fallbacks.wandel;
    else if (lastMsg.includes("eten") || lastMsg.includes("restaurant")) reply = fallbacks.restaurant;
    else if (lastMsg.includes("kind")) reply = fallbacks.kinder;
    else if (lastMsg.includes("weer")) reply = fallbacks.weer;
    else if (lastMsg.includes("wellness") || lastMsg.includes("sauna")) reply = fallbacks.wellness;

    return NextResponse.json({ reply });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 300,
        messages: [
          {
            role: "system",
            content:
              "Je bent Huynen Host, de digitale conciërge van Huis ter Huynen – Boutique Lodge in Zeijen, Drenthe. Geef warme, persoonlijke tips over wandelen (Dwingelderveld, Drentsche Aa, Ballooërveld), fietsen, restaurants (Herberg van Loon, Jufferen Lunsingh), cultuur (hunebedden, Drents Museum), wellness en activiteiten. Max 3 zinnen. Correct Nederlands.",
          },
          ...messages,
        ],
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Even geen antwoord beschikbaar.";

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ reply: "Even geen verbinding. Probeer straks opnieuw." }, { status: 500 });
  }
}
