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

  if (!apiKey || apiKey.length < 20) {
    // Fallback: keyword-matching
    const fallbacks: Record<string, string> = {
      wandel: "Het Dwingelderveld is prachtig! Slechts 10 minuten rijden. Ook de Veentjesroute vanuit Zeijen is een aanrader 🌿",
      restaurant: "Herberg van Loon is een favoriet bij onze gasten — heerlijke Drentse keuken. Jufferen Lunsingh is top voor een bijzonder diner 🍽️",
      kinder: "Speelpark Sprookjeshof is geweldig voor kinderen! En WILDLANDS Adventure Zoo in Emmen is ook een leuk dagje uit 👧",
      weer: "Gebruik de weertips bovenaan de homepage voor actueel weer en passende suggesties ☀️",
      wellness: "LOFF Boutique Wellness in Assen is echt een aanrader. Kleinschalig, Finse sauna, sneeuwdouche 💆",
      fiets: "Drenthe is dé fietsprovincie! Huur een e-bike via 'Extra's' en ontdek het knooppuntennetwerk 🚴",
      regen: "Bij regen: Ballorig indoor speeltuin, Drents Museum, of lekker een filmje in de lodge met warme chocolademelk 🌧️",
      romantisch: "De Jufferen Lunsingh is perfect voor een romantisch diner — reserveer bij het haardvuur. Of boek een wellness arrangement via 'Extra's' 💕",
      wijn: "Café Hingstman aan de brink heeft een mooie wijnkaart. The Black Tie in Assen is top voor cocktails en borrel 🍷",
      uitje: "Kano op de Hunze is een unieke ervaring (2-3 uur). Museumdorp Orvelte is ook een leuk dagje — autovrij en vol ambachten 🛶",
      stil: "De Zeijerstrubben is het stilste bosgebied — 3 minuten rijden. Of loop de Veentjesroute vroeg in de ochtend, dan heb je het pad voor jezelf 🤫",
      kano: "Kano Zwerftocht Hunze is een aanrader — 2-3 uur varen door prachtige natuur. Start bij Breeland, 20 min rijden 🛶",
      mtb: "Drenthe Fietsverhuur heeft MTB's en organiseert clinics. Er zijn routes door het Drentsche Aa-gebied en bij Gieten 🚵",
      default: "Leuke vraag! Ik raad het Dwingelderveld aan voor natuur, Herberg van Loon voor eten, en de hunebedden voor cultuur. Wat spreekt je aan?",
    };

    const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
    let reply = fallbacks.default;
    if (lastMsg.includes("wandel") || lastMsg.includes("natuur") || lastMsg.includes("bos") || lastMsg.includes("rustig")) reply = fallbacks.wandel;
    else if (lastMsg.includes("eten") || lastMsg.includes("restaurant") || lastMsg.includes("diner") || lastMsg.includes("dineren")) reply = fallbacks.restaurant;
    else if (lastMsg.includes("kind") || lastMsg.includes("gezin") || lastMsg.includes("speel")) reply = fallbacks.kinder;
    else if (lastMsg.includes("weer") || lastMsg.includes("zon") || lastMsg.includes("temperatuur")) reply = fallbacks.weer;
    else if (lastMsg.includes("wellness") || lastMsg.includes("sauna") || lastMsg.includes("massage") || lastMsg.includes("ontspan")) reply = fallbacks.wellness;
    else if (lastMsg.includes("fiets") || lastMsg.includes("fietsen") || lastMsg.includes("e-bike") || lastMsg.includes("sportief")) reply = fallbacks.fiets;
    else if (lastMsg.includes("regen") || lastMsg.includes("binnen") || lastMsg.includes("slecht weer")) reply = fallbacks.regen;
    else if (lastMsg.includes("romantis") || lastMsg.includes("stel") || lastMsg.includes("samen")) reply = fallbacks.romantisch;
    else if (lastMsg.includes("wijn") || lastMsg.includes("borrel") || lastMsg.includes("cocktail") || lastMsg.includes("drinken")) reply = fallbacks.wijn;
    else if (lastMsg.includes("uitje") || lastMsg.includes("dagje") || lastMsg.includes("leuk") || lastMsg.includes("niets")) reply = fallbacks.uitje;
    else if (lastMsg.includes("stil") || lastMsg.includes("rust") || lastMsg.includes("boek") || lastMsg.includes("koffie")) reply = fallbacks.stil;
    else if (lastMsg.includes("kano") || lastMsg.includes("varen") || lastMsg.includes("water")) reply = fallbacks.kano;
    else if (lastMsg.includes("mtb") || lastMsg.includes("mountain") || lastMsg.includes("trail")) reply = fallbacks.mtb;

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
