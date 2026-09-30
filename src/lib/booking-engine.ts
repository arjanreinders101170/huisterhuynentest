/* ═══ De MyTourist Booking Engine ═══
 *
 * Waar "Direct boeken" naartoe gaat. De URL is publiek en bevat geen token.
 *
 * De parameters komen uit een URL die MyTourist zelf genereerde nadat Arjan
 * daar 7 tot 11 juni 2027 had gekozen (dezelfde bron als op wad-weids.eu):
 *
 *   https://huynen-lodges.w.mytourist.cloud/nl/availability
 *     ?checkin=20270607&checkout=20270611&i=null
 *     &w=06558-85141-35952&rt=65582603121-65582603122
 *
 * `w`, `rt` en `i` gaan letterlijk mee; hun betekenis staat niet vast, dus er
 * wordt niets weggelaten of bijverzonnen. `rt` noemt beide lodges: de gast
 * ziet ze bij MyTourist allebei, met de gekozen periode al ingevuld. Het
 * aantal personen heeft geen parameter en kiest de gast daar zelf. */

const ORIGIN = "https://huynen-lodges.w.mytourist.cloud";
const VAST: [string, string][] = [
  ["i", "null"],
  ["w", "06558-85141-35952"],
  ["rt", "65582603121-65582603122"],
];

export function bookingEngineUrl(locale: "nl" | "de", checkIn: string, checkOut: string): string {
  const query = new URLSearchParams({
    checkin: checkIn.replaceAll("-", ""),
    checkout: checkOut.replaceAll("-", ""),
  });
  for (const [naam, waarde] of VAST) query.append(naam, waarde);
  return `${ORIGIN}/${locale}/availability?${query.toString()}`;
}

/** Wat /api/aanbod per lodge teruggeeft. Zelfde vorm als Aanbod in lib/mytourist.ts. */
export type AanbodView =
  | { status: "available"; totalPrice: string; nights: number }
  | { status: "unavailable" }
  | { status: "unknown" };

/**
 * Prijs en beschikbaarheid uit MyTourist voor beide lodges, of null als dat
 * niet lukte. null betekent: het formulier doet wat het altijd deed.
 */
export async function haalAanbod(checkIn: string, checkOut: string): Promise<Record<string, AanbodView> | null> {
  try {
    const r = await fetch(`/api/aanbod?checkIn=${checkIn}&checkOut=${checkOut}`);
    if (!r.ok) return null;
    const data = await r.json();
    return data && typeof data.lodges === "object" ? data.lodges : null;
  } catch {
    return null;
  }
}

export function isBookingEngineUrl(href: string): boolean {
  return href.startsWith(`${ORIGIN}/`);
}

/**
 * Het bedrag van MyTourist, leesbaar gemaakt zonder het te veranderen.
 * `759` wordt `€ 759,00`, `500.6` wordt `€ 500,60`. Een bedrag met meer dan
 * twee decimalen of met onduidelijke scheidingstekens wordt niet afgerond en
 * niet herschreven: liever een lelijk bedrag dan een onjuist bedrag.
 */
export function toonBedrag(waarde: string, locale: "nl" | "de"): string {
  const bedrag = waarde.trim();
  if (/^\d+(?:\.\d{1,2})?$/.test(bedrag)) {
    const opgemaakt = new Intl.NumberFormat(locale === "de" ? "de-DE" : "nl-NL", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(bedrag));
    return `€ ${opgemaakt}`;
  }
  return /^[\d.,]+$/.test(bedrag) ? `€ ${bedrag}` : bedrag;
}
