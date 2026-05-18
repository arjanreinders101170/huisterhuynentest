import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { buildHostKnowledge, PROFILE_HINTS_NL, PROFILE_HINTS_DE } from "@/data/host-knowledge";
import { lodgeName } from "@/data/lodge";

export const runtime = "nodejs";

/* ═══ COST CAP ═══
 * Per-stay daily quota tracked in-memory. State resets on cold start
 * (acceptable: worst case a guest gets a few extra free calls per deploy).
 * For longer-lived enforcement, swap this for a Supabase counter. */
const QUOTA_PER_STAY_PER_DAY = 30;
const stayUsage = new Map<string, { count: number; resetAt: number }>();

function checkStayQuota(stayId: string): { ok: boolean; remaining: number } {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const entry = stayUsage.get(stayId);
  if (!entry || now > entry.resetAt) {
    stayUsage.set(stayId, { count: 1, resetAt: now + dayMs });
    return { ok: true, remaining: QUOTA_PER_STAY_PER_DAY - 1 };
  }
  if (entry.count >= QUOTA_PER_STAY_PER_DAY) {
    return { ok: false, remaining: 0 };
  }
  entry.count++;
  return { ok: true, remaining: QUOTA_PER_STAY_PER_DAY - entry.count };
}

/* In-memory cache of validated stay tokens — avoid hammering Supabase
 * on every chat message. TTL 5 min. */
const stayCache = new Map<string, { stay: StayInfo; cachedAt: number }>();
const STAY_CACHE_TTL = 5 * 60 * 1000;

type StayInfo = {
  id: string;
  lodge: string;
  lodgeNaam: string;
  check_in: string;
  check_out: string;
  naam: string;
};

async function lookupStay(token: string): Promise<StayInfo | null> {
  const cached = stayCache.get(token);
  if (cached && Date.now() - cached.cachedAt < STAY_CACHE_TTL) {
    return cached.stay;
  }
  try {
    const { data: stay } = await getSupabase()
      .from("stays")
      .select("*")
      .eq("token", token)
      .single();
    if (!stay) return null;
    const checkOut = new Date(stay.check_out);
    checkOut.setHours(23, 59, 59);
    if (Date.now() > checkOut.getTime()) return null;
    const { data: guest } = await getSupabase()
      .from("guests")
      .select("naam")
      .eq("id", stay.guest_id)
      .single();
    const info: StayInfo = {
      id: stay.id,
      lodge: stay.lodge,
      lodgeNaam: lodgeName(stay.lodge),
      check_in: stay.check_in,
      check_out: stay.check_out,
      naam: guest?.naam || "",
    };
    stayCache.set(token, { stay: info, cachedAt: Date.now() });
    return info;
  } catch {
    return null;
  }
}

function buildStayContext(stay: StayInfo, lang: "nl" | "de"): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkOut = new Date(stay.check_out);
  checkOut.setHours(0, 0, 0, 0);
  const nightsLeft = Math.max(0, Math.round((checkOut.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  const firstName = (stay.naam || "").split(" ")[0];
  if (lang === "de") {
    return `AKTUELLER GAST: ${firstName || "Gast"} · ${stay.lodgeNaam} · noch ${nightsLeft} Nacht(e). Heutiges Datum: ${today.toLocaleDateString("de-DE")}.`;
  }
  return `HUIDIGE GAST: ${firstName || "Gast"} · ${stay.lodgeNaam} · nog ${nightsLeft} nacht(en). Vandaag is ${today.toLocaleDateString("nl-NL")}.`;
}

const SYSTEM_PROMPT_NL = (knowledge: string, stayCtx: string | null, profileHint: string | null, weatherHint: string | null) =>
  `Je bent Huynen Host — de digitale conciërge van Huis ter Huynen in Zeijen, Drenthe. Boutique boutique-lodge.

TOON
- Warm, persoonlijk, kort. Max 3 zinnen per antwoord, tenzij om een lijst gevraagd.
- Correct Nederlands. Tutoyeren is OK. Gebruik 'jullie' wanneer het over een groep gaat.
- Eindig nooit met algemene marketingteksten of clichés.

REGELS
- Antwoord ALLEEN op vragen over Huis ter Huynen, het verblijf, Drenthe (omgeving, activiteiten, eten, cultuur, natuur, wellness), praktische zaken (check-in/out, deur, wifi, late check-out) of het weer.
- Voor andere onderwerpen (politiek, medisch advies, financieel advies, persoonlijke zaken buiten het verblijf): verontschuldig kort en verwijs naar de juiste hulp.
- Verzin geen restaurants, prijzen of afstanden. Gebruik uitsluitend de KENNIS hieronder. Als iets niet in de kennis staat: zeg eerlijk dat je het niet zeker weet en stel voor om de gastheer te WhatsAppen (+31 6 42568603).
- Voor late check-out, fietsverhuur, welkomstpakket of boodschappen verwijs naar 'Extra's' in de app.
- Voor de deur of toegangscode: verwijs naar 'Verblijf' in de app.

KENNIS
${knowledge}${stayCtx ? `\n\n${stayCtx}` : ""}${profileHint ? `\n\nPROFIEL: ${profileHint}` : ""}${weatherHint ? `\n\nWEER: ${weatherHint}` : ""}`;

const SYSTEM_PROMPT_DE = (knowledge: string, stayCtx: string | null, profileHint: string | null, weatherHint: string | null) =>
  `Du bist Huynen Host — der digitale Concierge von Huis ter Huynen in Zeijen, Drenthe. Boutique-Lodge.

TON
- Warm, persönlich, kurz. Max. 3 Sätze pro Antwort, außer eine Liste wird gewünscht.
- Korrektes Deutsch (Du-Form). Verwende „Ihr" für Gruppen.
- Beende nie mit allgemeinen Marketingfloskeln.

REGELN
- Beantworte NUR Fragen zu Huis ter Huynen, dem Aufenthalt, Drenthe (Umgebung, Aktivitäten, Essen, Kultur, Natur, Wellness), Praktisches (Check-in/out, Tür, WLAN, Late Check-out) oder Wetter.
- Bei anderen Themen (Politik, medizinischer Rat, Finanzberatung, persönliche Angelegenheiten außerhalb des Aufenthalts): entschuldige Dich kurz und verweise auf passende Hilfe.
- Erfinde keine Restaurants, Preise oder Entfernungen. Verwende ausschließlich das WISSEN unten. Wenn etwas nicht im Wissen steht: sag ehrlich, dass Du unsicher bist und schlage vor, dem Gastgeber zu schreiben (WhatsApp +31 6 42568603).
- Für Late Check-out, Fahrradverleih, Willkommenspaket oder Lebensmittel: verweise auf „Extras" in der App.
- Für Tür oder Zugangscode: verweise auf „Aufenthalt" in der App.

WISSEN
${knowledge}${stayCtx ? `\n\n${stayCtx}` : ""}${profileHint ? `\n\nPROFIL: ${profileHint}` : ""}${weatherHint ? `\n\nWETTER: ${weatherHint}` : ""}`;

/* ═══ FALLBACK ═══ — wanneer geen OpenAI key. Eenvoudige keyword-match. */
const FALLBACKS_NL: Record<string, string> = {
  wandel: "Het Dwingelderveld is prachtig (25 min) en de Veentjesroute start direct bij de lodge. 🌿",
  restaurant: "Herberg van Loon voor Drentse keuken, Jufferen Lunsingh voor fine dining, Café Hingstman om de hoek voor lunch. 🍽️",
  kinder: "Sprookjeshof (22 min) is geweldig, en bij regen is Ballorig Assen (12 min) de redder. WILDLANDS is een dagvullend uitje. 👧",
  weer: "Bekijk de weertips bovenaan de homepage — daar staan suggesties die passen bij vandaag. ☀️",
  wellness: "LOFF in Assen (kleinschalig, Finse sauna) en Wellnessresort Waterlelie in Zevenhuizen zijn aanraders. 💆",
  fiets: "Huur een e-bike via 'Extra's' in de app — Drenthe is de fietsprovincie. 🚴",
  regen: "Bij regen: Ballorig (binnen), Drents Museum of Hunebedcentrum Borger. 🌧️",
  romantisch: "Jufferen Lunsingh bij haardvuur, of een dag verwennen bij Wellnessresort Waterlelie in Zevenhuizen. 💕",
  uitje: "Kano op de Hunze (2-3 uur), Museumdorp Orvelte of een dagje WILDLANDS. 🛶",
  stil: "Zeijerstrubben (3 min) is het stilste bos hier in de buurt. 🤫",
  deur: "Open de deur via 'Verblijf' in de app — je persoonlijke toegangscode staat daar.",
  wifi: "Wifi: HuynenGast · wachtwoord: HuynenGast2024.",
  late: "Late check-out tot 15:00 (€25) — vraag aan via 'Extra's' in de app.",
  default: "Probeer iets specifieker — wandelen, eten, kinderen, wellness, fietsen? Of WhatsApp de gastheer op +31 6 42568603.",
};
const FALLBACKS_DE: Record<string, string> = {
  wandel: "Das Dwingelderveld ist wunderschön (25 Min.) und die Veentjesroute startet direkt an der Lodge. 🌿",
  restaurant: "Herberg van Loon für Drentse Küche, Jufferen Lunsingh für Fine Dining, Café Hingstman um die Ecke für den Lunch. 🍽️",
  kinder: "Sprookjeshof (22 Min.) ist toll, bei Regen rettet Ballorig Assen (12 Min.). WILDLANDS füllt einen ganzen Tag. 👧",
  weer: "Schaue die Wetter-Tipps oben auf der Startseite — Vorschläge passend zum heutigen Tag. ☀️",
  wellness: "LOFF in Assen (klein, finnische Sauna) und Wellnessresort Waterlelie in Zevenhuizen sind Empfehlungen. 💆",
  fiets: "E-Bike über 'Extras' in der App buchen — Drenthe ist die Radprovinz. 🚴",
  regen: "Bei Regen: Ballorig (drinnen), Drents Museum oder Hunebedcentrum Borger. 🌧️",
  romantisch: "Jufferen Lunsingh am Kaminfeuer, oder eine private Massage in der Lodge. 💕",
  uitje: "Kanu auf der Hunze (2-3 Std.), Museumsdorf Orvelte oder ein Tag bei WILDLANDS. 🛶",
  stil: "Zeijerstrubben (3 Min.) ist der ruhigste Wald in der Nähe. 🤫",
  deur: "Tür öffnen über 'Aufenthalt' in der App — Dein persönlicher Code steht dort.",
  wifi: "WLAN: HuynenGast · Passwort: HuynenGast2024.",
  late: "Late Check-out bis 15:00 (€25) — über 'Extras' in der App buchen.",
  default: "Etwas konkreter? Wandern, Essen, Kinder, Wellness, Rad? Oder WhatsApp den Gastgeber: +31 6 42568603.",
};

function fallbackReply(text: string, lang: "nl" | "de"): string {
  const fb = lang === "de" ? FALLBACKS_DE : FALLBACKS_NL;
  const t = text.toLowerCase();
  if (t.match(/wander|wandel|natur|bos|wald|rustig|ruhig/)) return fb.wandel;
  if (t.match(/eten|essen|restaurant|diner|abendessen|lunch/)) return fb.restaurant;
  if (t.match(/kind|gezin|familie|speel|spiel/)) return fb.kinder;
  if (t.match(/weer|wetter|zon|sonne|temperatuur/)) return fb.weer;
  if (t.match(/wellness|sauna|massage|ontspan|entspann/)) return fb.wellness;
  if (t.match(/fiets|fietsen|fahrrad|rad|bike/)) return fb.fiets;
  if (t.match(/regen|binnen|drinnen|slecht weer|schlechtes wetter/)) return fb.regen;
  if (t.match(/romantis|stel|samen|paar|romant/)) return fb.romantisch;
  if (t.match(/uitje|dagje|ausflug|leuk|niets/)) return fb.uitje;
  if (t.match(/stil|rust|ruhig|leise/)) return fb.stil;
  if (t.match(/deur|t[üu]r|toegang|zugang|code/)) return fb.deur;
  if (t.match(/wifi|wlan|internet/)) return fb.wifi;
  if (t.match(/late|sp[äa]t|check.?out|checkout/)) return fb.late;
  return fb.default;
}

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
  let messages: Array<{ role: string; content: string }> = [];
  let context: string | null = null;
  let stayToken: string | null = null;
  let lang: "nl" | "de" = "nl";
  let profile: string | null = null;

  try {
    const body = await request.json();
    messages = body.messages || [];
    context = body.context || null;
    stayToken = typeof body.stayToken === "string" && body.stayToken.length > 0 ? body.stayToken : null;
    lang = body.lang === "de" ? "de" : "nl";
    profile = typeof body.profile === "string" ? body.profile : null;
  } catch {
    return NextResponse.json(
      { reply: lang === "de" ? "Konnte Deine Nachricht nicht lesen. Versuch's nochmal." : "Kon je bericht niet lezen. Probeer opnieuw." },
      { status: 400 }
    );
  }

  if (!messages.length) {
    return NextResponse.json({ reply: lang === "de" ? "Stell ruhig eine Frage!" : "Stel gerust een vraag!" });
  }

  // Validate stay token + enforce per-stay quota (cost cap)
  let stayInfo: StayInfo | null = null;
  if (stayToken) {
    stayInfo = await lookupStay(stayToken);
    if (stayInfo) {
      const quota = checkStayQuota(stayInfo.id);
      if (!quota.ok) {
        const msg = lang === "de"
          ? "Für heute ist das Tageslimit erreicht. Morgen früh kannst Du wieder mit mir chatten — oder schreib direkt dem Gastgeber: +31 6 42568603."
          : "Voor vandaag is het daglimiet bereikt. Morgenochtend kun je weer met mij chatten — of WhatsApp direct de gastheer: +31 6 42568603.";
        return NextResponse.json({ reply: msg, quotaExceeded: true });
      }
    }
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const lastUserMsg = messages[messages.length - 1]?.content || "";

  if (!apiKey || apiKey.length < 20) {
    return NextResponse.json({ reply: fallbackReply(lastUserMsg, lang) });
  }

  const knowledge = buildHostKnowledge(lang);
  const stayCtx = stayInfo ? buildStayContext(stayInfo, lang) : null;
  const profileHint = profile && profile !== "skipped"
    ? (lang === "de" ? PROFILE_HINTS_DE[profile] : PROFILE_HINTS_NL[profile]) || null
    : null;
  // Weather hint comes from caller via `context` field (kept for backwards compat)
  const weatherHint = context && !profileHint ? context : null;

  const systemPrompt = lang === "de"
    ? SYSTEM_PROMPT_DE(knowledge, stayCtx, profileHint, weatherHint)
    : SYSTEM_PROMPT_NL(knowledge, stayCtx, profileHint, weatherHint);

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
        max_tokens: 280,
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-8), // tighter context window for cost
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.error(`OpenAI error: ${response.status}`);
      return NextResponse.json({ reply: fallbackReply(lastUserMsg, lang) });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim()
      || (lang === "de" ? "Gerade keine Antwort verfügbar." : "Even geen antwoord beschikbaar.");

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json({ reply: fallbackReply(lastUserMsg, lang) });
  }
}
