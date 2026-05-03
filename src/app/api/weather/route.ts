import { NextResponse } from "next/server";

export const runtime = "nodejs";

/* ═══ CACHE — avoid hammering the API ═══ */
let cache: { data: unknown; timestamp: number } | null = null;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

/* ═══ WEATHER → ICON MAPPING ═══ */
function mapIcon(owmIcon: string): string {
  if (owmIcon.startsWith("01")) return "sun";
  if (owmIcon.startsWith("02") || owmIcon.startsWith("03") || owmIcon.startsWith("04")) return "cloud";
  if (owmIcon.startsWith("09") || owmIcon.startsWith("10")) return "rain";
  if (owmIcon.startsWith("11")) return "storm";
  if (owmIcon.startsWith("13")) return "snow";
  if (owmIcon.startsWith("50")) return "mist";
  return "cloud";
}

/* ═══ WEATHER → SMART TIP ═══ */
function getTip(icon: string, temp: number): string {
  if (icon === "rain" || icon === "storm") {
    return "Regenachtig weer — ideaal voor een museum, indoor speeltuin of wellness";
  }
  if (icon === "snow") {
    return "Winters weer — warm aankleden en genieten van de Drentse stilte";
  }
  if (icon === "mist") {
    return "Mistig — mysterieuze sfeer op de heide. Neem een warme chocolademelk mee";
  }
  if (temp >= 25) {
    return "Heerlijk zomerweer — perfect voor kanoën, fietsen of een terras";
  }
  if (temp >= 18) {
    return "Lekker weer voor een wandeling of fietstocht door Drenthe";
  }
  if (temp >= 10) {
    return "Fris maar aangenaam — trek een extra laagje aan voor de wandeling";
  }
  return "Koud maar helder — de heide is prachtig in dit licht";
}

/* ═══ FALLBACK — when no API key or fetch fails ═══ */
function getFallback() {
  const month = new Date().getMonth();
  // Seasonal estimates for Drenthe
  const seasonal: Record<number, { temp: number; icon: string; desc: string }> = {
    0: { temp: 3, icon: "cloud", desc: "Bewolkt" },
    1: { temp: 4, icon: "cloud", desc: "Bewolkt" },
    2: { temp: 8, icon: "sun", desc: "Wisselvallig" },
    3: { temp: 12, icon: "sun", desc: "Zonnig" },
    4: { temp: 16, icon: "sun", desc: "Aangenaam" },
    5: { temp: 19, icon: "sun", desc: "Zomers" },
    6: { temp: 21, icon: "sun", desc: "Warm" },
    7: { temp: 21, icon: "sun", desc: "Warm" },
    8: { temp: 17, icon: "cloud", desc: "Nazomer" },
    9: { temp: 12, icon: "cloud", desc: "Herfstig" },
    10: { temp: 7, icon: "rain", desc: "Regenachtig" },
    11: { temp: 4, icon: "cloud", desc: "Koud" },
  };
  const s = seasonal[month] || seasonal[4];
  return {
    temp: s.temp,
    description: s.desc,
    icon: s.icon,
    tip: getTip(s.icon, s.temp),
    source: "estimate",
  };
}

export async function GET() {
  // Return cache if fresh
  if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
    return NextResponse.json(cache.data);
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    const fallback = getFallback();
    return NextResponse.json(fallback);
  }

  try {
    // Zeijen coordinates: 53.105, 6.506
    const r = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=53.105&lon=6.506&units=metric&lang=nl&appid=${apiKey}`,
      { next: { revalidate: 1800 } }
    );

    if (!r.ok) {
      return NextResponse.json(getFallback());
    }

    const d = await r.json();
    const icon = mapIcon(d.weather?.[0]?.icon || "03d");
    const temp = Math.round(d.main?.temp || 15);

    const result = {
      temp,
      description: d.weather?.[0]?.description || "Bewolkt",
      icon,
      tip: getTip(icon, temp),
      source: "live",
    };

    // Cache it
    cache = { data: result, timestamp: Date.now() };

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(getFallback());
  }
}
