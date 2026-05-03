import { NextRequest, NextResponse } from "next/server";

// Force Node.js runtime (not Edge) — avoids Vercel edge issues
export const runtime = "nodejs";

// Handle OPTIONS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(request: NextRequest) {
  // Safe JSON parsing — prevents crash on empty/malformed body
  let messages: Array<{ role: string; content: string }> = [];
  let context: string | null = null;

  try {
    const body = await request.json();
    messages = body.messages || [];
    context = body.context || null;
  } catch {
    return NextResponse.json(
      { reply: "Kon je bericht niet lezen. Probeer opnieuw." },
      { status: 400 }
    );
  }

  if (!messages.length) {
    return NextResponse.json({ reply: "Stel gerust een vraag!" });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // Fallback: keyword-matching
    const fallbacks: Record<string, string> = {
      wandel: "Het Dwingelderveld is prachtig! Slechts 10 minuten rijden. Ook de Veentjesroute vanuit Zeijen is een aanrader 🌿",
      restaurant: "Herberg van Loon is een favoriet bij onze gasten — heerlijke Drentse keuken. Jufferen Lunsingh is top voor een bijzonder diner 🍽️",
      kinder: "Speelpark Sprookjeshof is geweldig voor kinderen! En WILDLANDS Adventure Zoo in Emmen is ook een leuk dagje uit 👧",
      weer: "Gebruik de weertips bovenaan de homepage voor actueel weer en passende suggesties ☀️",
      wellness: "LOFF Boutique Wellness in Assen is echt een aanrader. Kleinschalig, Finse sauna, sneeuwdouche 💆",
      fiets: "Drenthe is dé fietsprovincie! Huur een e-bike via 'Extra boeken' en ontdek het knooppuntennetwerk 🚴",
      default: "Leuke vraag! Ik raad het Dwingelderveld aan voor natuur, Herberg van Loon voor eten, en de hunebedden voor cultuur. Wat spreekt je aan?",
    };

    const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
    let reply = fallbacks.default;
    if (lastMsg.includes("wandel") || lastMsg.includes("natuur") || lastMsg.includes("bos")) reply = fallbacks.wandel;
    else if (lastMsg.includes("eten") || lastMsg.includes("restaurant") || lastMsg.includes("diner")) reply = fallbacks.restaurant;
    else if (lastMsg.includes("kind") || lastMsg.includes("gezin") || lastMsg.includes("speel")) reply = fallbacks.kinder;
    else if (lastMsg.includes("weer") || lastMsg.includes("regen") || lastMsg.includes("zon")) reply = fallbacks.weer;
    else if (lastMsg.includes("wellness") || lastMsg.includes("sauna") || lastMsg.includes("massage")) reply = fallbacks.wellness;
    else if (lastMsg.includes("fiets") || lastMsg.includes("fietsen") || lastMsg.includes("mtb")) reply = fallbacks.fiets;

    return NextResponse.json({ reply });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

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
            content: `Je bent Huynen Host, de digitale conciërge van Huis ter Huynen – Boutique Lodge aan de Zuiderstraat 6 in Zeijen, Drenthe. Geef warme, persoonlijke tips over wandelen (Dwingelderveld, Drentsche Aa, Ballooërveld, Veentjesroute), fietsen, restaurants (Herberg van Loon, Jufferen Lunsingh, The Black Tie), cultuur (hunebedden, Drents Museum), wellness (LOFF, SpaWell) en activiteiten (kano op de Hunze). Max 3 zinnen. Correct Nederlands.${context ? ` Gastprofiel: ${context}` : ""}`,
          },
          ...messages.slice(-10), // Limit context window
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.error(`OpenAI error: ${response.status}`);
      return NextResponse.json({
        reply: "Even geen verbinding met de AI. Bekijk de tips op de homepage of probeer straks opnieuw.",
      });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Even geen antwoord beschikbaar.";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json({
      reply: "Even geen verbinding. Probeer straks opnieuw, of bekijk de tips op de homepage.",
    });
  }
}
