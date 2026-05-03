import { NextRequest, NextResponse } from "next/server";

/* ========= CONFIG ========= */
const ZEIJEN = { lat: 53.05, lng: 6.55 };

const places = [
  {
    name: "Herberg van Loon",
    type: "eten",
    distance: 6,
    description: "Gezellige Drentse keuken met lokale sfeer",
  },
  {
    name: "Jufferen Lunsingh",
    type: "eten",
    distance: 8,
    description: "Bijzonder restaurant voor een avond uit",
  },
  {
    name: "Dwingelderveld",
    type: "natuur",
    distance: 10,
    description: "Groot natuurgebied met heide en wandelroutes",
  },
  {
    name: "Drentsche Aa",
    type: "natuur",
    distance: 7,
    description: "Prachtig gebied voor wandelen en fietsen",
  },
  {
    name: "Speelbos Grolloo",
    type: "kinderen",
    distance: 9,
    description: "Leuke plek voor kinderen in de natuur",
  },
];

/* ========= HELPERS ========= */
function detectIntent(text: string) {
  const t = text.toLowerCase();

  if (t.includes("eten") || t.includes("restaurant")) return "eten";
  if (t.includes("wandel") || t.includes("natuur")) return "natuur";
  if (t.includes("kind")) return "kinderen";
  if (t.includes("weer")) return "weer";
  if (t.includes("wellness") || t.includes("sauna")) return "wellness";

  return "general";
}

function getTimeContext() {
  const hour = new Date().getHours();

  if (hour < 11) return "ochtend";
  if (hour > 18) return "avond";

  return "dag";
}

function getPlaces(intent: string) {
  return places.filter((p) => p.type === intent && p.distance <= 10);
}

function formatPlaces(list: any[]) {
  if (!list.length) {
    return "Binnen 10 km van Zeijen heb ik hier geen goede tips voor 🌿";
  }

  return (
    list
      .map(
        (p) =>
          `• ${p.name} (${p.distance} km)\n  ${p.description}`
      )
      .join("\n\n")
  );
}

/* ========= API ========= */
export async function POST(request: NextRequest) {
  const { messages } = await request.json();
  const apiKey = process.env.OPENAI_API_KEY;

  const lastMsg =
    messages[messages.length - 1]?.content?.toLowerCase() || "";

  const intent = detectIntent(lastMsg);
  const time = getTimeContext();

  /* ========= LOCAL INTELLIGENCE (BELANGRIJK) ========= */

  if (intent !== "general" && intent !== "weer") {
    const results = getPlaces(intent);

    let intro = "";

    if (intent === "eten" && time === "avond") {
      intro = "Goede keuze voor vanavond 🌙\n\n";
    }

    if (intent === "natuur" && time === "ochtend") {
      intro = "Perfect om de dag mee te starten 🌿\n\n";
    }

    return NextResponse.json({
      reply: intro + formatPlaces(results),
    });
  }

  /* ========= WEER (SIMPEL) ========= */
  if (intent === "weer") {
    return NextResponse.json({
      reply:
        "Vandaag is het rustig weer in de omgeving van Zeijen 🌤️\nPerfect voor een wandeling of fietstocht door de natuur.",
    });
  }

  /* ========= FALLBACK ZONDER API ========= */
  if (!apiKey) {
    return NextResponse.json({
      reply:
        "Waar heb je zin in? 🌿\nIk help je graag met restaurants, wandelingen of activiteiten in de buurt.",
    });
  }

  /* ========= AI (ALLEEN ALS NODIG) ========= */
  try {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          max_tokens: 200,
          messages: [
            {
              role: "system",
              content: `
Je bent Huynen Host, een luxe digitale conciërge in Zeijen (Drenthe).

BELANGRIJK:
- Je geeft alleen tips binnen 10 km van Zeijen
- Je verzint geen locaties
- Je bent warm, persoonlijk en kort (max 2-3 zinnen)

Context:
- Chalet in de natuur
- Rust, bos, ontspanning

Gedrag:
- Denk als een host, niet als AI
              `,
            },
            ...messages,
          ],
        }),
      }
    );

    const data = await response.json();

    const reply =
      data.choices?.[0]?.message?.content ||
      "Even geen antwoord beschikbaar.";

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { reply: "Even geen verbinding. Probeer straks opnieuw." },
      { status: 500 }
    );
  }
}