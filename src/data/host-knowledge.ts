/* ═══ HUYNEN HOST — KENNISBANK ═══
 * Compacte string-versies van categories.ts data die in de OpenAI system
 * prompt landen. Doel: model krijgt grounded feiten (naam, afstand, prijs,
 * kerntags) zonder dat we hele beschrijvingen meesturen.
 *
 * Token-budget: streef naar < 800 tokens totale knowledge per call.
 */

import { DATA } from "./categories";
import { DATA_DE } from "@/i18n/categories-de";
import type { Category } from "./tokens";

type Lang = "nl" | "de";

function compactItem(item: Category["items"][number], lang: Lang): string {
  const parts: string[] = [item.naam];
  const meta: string[] = [];
  if (item.afstand) meta.push(item.afstand);
  if (item.prijs) meta.push(item.prijs);
  if (item.lengte) meta.push(item.lengte);
  if (item.moeilijkheid) meta.push(item.moeilijkheid);
  if (meta.length) parts.push(`(${meta.join(" · ")})`);

  // Pick the first 2 tags + a 60-char crop of the description as the "why"
  const tags = (item.tags || []).slice(0, 2).join(", ");
  const why = (item.beschrijving || "").split(/[.!?]/)[0].trim().slice(0, 80);
  const trail = tags || why;
  if (trail) parts.push(`— ${trail}`);

  // Light language hint for translations (most data is NL, DE is mostly translated)
  void lang;
  return parts.join(" ");
}

function compactCategory(key: string, cat: Category, lang: Lang): string {
  // Cap at 6 items per category to keep prompt budget tight
  const top = cat.items.slice(0, 6);
  const lines = top.map(i => `- ${compactItem(i, lang)}`).join("\n");
  return `${cat.title.toUpperCase()}\n${lines}`;
}

const HEADER_NL = `LODGE-FEITEN:
- Adres: Zuiderstraat 6, Zeijen (Drenthe). A28 afslag Zeijen.
- Twee lodges: Boomhut Lodge en Schaapskooi Lodge.
- Check-in 15:00, check-out 11:00. Late check-out tot 15:00 op aanvraag (€25).
- Honden welkom (€25 schoonmaak). Laadpaal op terrein.
- Wifi: HuynenGast / HuynenGast2024.
- Contact: WhatsApp +31 6 42568603.`;

const HEADER_DE = `LODGE-FAKTEN:
- Adresse: Zuiderstraat 6, Zeijen (Drenthe). A28 Ausfahrt Zeijen.
- Zwei Lodges: Boomhut Lodge und Schaapskooi Lodge.
- Check-in 15:00, Check-out 11:00. Späterer Check-out bis 15:00 auf Anfrage (€25).
- Hunde willkommen (€25 Reinigung). Ladesäule vor Ort.
- WLAN: HuynenGast / HuynenGast2024.
- Kontakt: WhatsApp +31 6 42568603.`;

export function buildHostKnowledge(lang: Lang): string {
  const data = lang === "de" ? DATA_DE : DATA;
  const header = lang === "de" ? HEADER_DE : HEADER_NL;
  const order: Array<keyof typeof data> = ["natuur", "eten", "actief", "kinderen", "cultuur", "ontspanning"];
  const sections = order
    .filter(k => data[k as string])
    .map(k => compactCategory(k as string, data[k as string], lang))
    .join("\n\n");
  return `${header}\n\n${sections}`;
}

/* Profile-aware tone hints — keep ≤ 1 line each */
export const PROFILE_HINTS_NL: Record<string, string> = {
  stel:   "Stel zonder kinderen — accentueer romantiek, rust, fine dining, wellness, haardvuur.",
  gezin:  "Gezin met kinderen — accentueer veiligheid, leeftijdsindicaties, gratis opties, indoor bij regen.",
  actief: "Sportief — accentueer afstanden, MTB, kano, fietsroutes, knelpunten en duur.",
  rust:   "Zoekt rust — accentueer stilte, lege paden, vroege ochtenden, sauna's, geen drukte.",
};
export const PROFILE_HINTS_DE: Record<string, string> = {
  stel:   "Paar ohne Kinder — Romantik, Ruhe, Fine Dining, Wellness, Kaminfeuer betonen.",
  gezin:  "Familie mit Kindern — Sicherheit, Altersangaben, kostenlose Optionen, indoor bei Regen.",
  actief: "Sportlich — Distanzen, MTB, Kanu, Radrouten, Strecken und Dauer betonen.",
  rust:   "Sucht Ruhe — Stille, leere Pfade, früher Morgen, Saunen, keine Menschenmassen.",
};
