/* ═══ STATIC LODGE CONSTANTS ═══
 * Values that don't rotate per stay (wifi, address, phone).
 * Door codes and stay tokens DO rotate — see stays table.
 */
export const WIFI_SSID = "HuynenGast";
/* Het wifi-wachtwoord staat bewust NIET hier: dit bestand wordt ook door
 * client-componenten geïmporteerd, en alles wat hier staat komt in de
 * publieke bundle terecht. Zie src/lib/wifi.ts (server-only). */

export const ADDRESS_STREET = "Zuiderstraat 6 p";
export const ADDRESS_CITY = "Zeijen";
export const ADDRESS_REGION = "Drenthe";

/* Coordinaten van de lodge (Zuiderstraat 6 p, Zeijen), WGS84.
 * Gebruikt door de schema.org LocalBusiness-geo, de geo/ICBM meta-tags,
 * de Maps-routelink op /welkom en de weer-API. Stonden eerder op drie
 * plekken met drie verschillende (foute) waardes — altijd hiervandaan
 * importeren, nooit opnieuw hardcoden.
 *
 * Door de eigenaar bevestigd als de exacte plek: aan de straat staat het bord
 * met de aanwijzing naar het park, dus dit punt is meteen het aankomstpunt en
 * er hoeft geen apart toegangspunt te komen. Niet "corrigeren" naar een adres-
 * of dorpscoördinaat — die zaten er 5 tot 6 km naast. */
export const LODGE_LAT = 53.050119;
export const LODGE_LON = 6.517024;

export const PHONE_RAW = "+31642568603";
export const PHONE_DISPLAY = "+31 6 42568603";

export const APP_URL_FALLBACK = "https://huisterhuynen.nl/concierge";

/* Lodge identifiers used in DB (stays.lodge column) and the canonical
 * customer-facing names. Always import from here — never hardcode. */
export type LodgeId = "lodge_1" | "lodge_2";
export const LODGE_NAMES: Record<LodgeId, string> = {
  lodge_1: "De Heide",
  lodge_2: "De Eik",
};
export function lodgeName(id: string): string {
  return LODGE_NAMES[id as LodgeId] || "Lodge";
}

/* BTW-tarief voor logies, in procenten.
 *
 * Tot en met 2025 gold het verlaagde tarief van 9%. Per 1 januari 2026 is dat
 * voor logies vervallen: overnachtingen in hotels, pensions, vakantiewoningen,
 * B&B's en stacaravans vallen sindsdien onder het algemene tarief. Alleen
 * kampeerplaatsen houden 9%, en die verhuren wij niet.
 *
 * Let op bij een wijziging: het moment van de overnáchting bepaalt het tarief,
 * niet het moment van betalen of factureren. Een aanbetaling die nu binnenkomt
 * voor een verblijf onder een ander tarief hoort dus tegen dát tarief. */
export const LOGIES_BTW_PCT = 21;

/* Telefoonnummer, één keer.
 *
 * Stond als los stuk tekst in de JSON-LD én verstopt in de wa.me-URL's in de
 * footers. Daardoor was het nummer wel machineleesbaar en wel aanklikbaar,
 * maar nergens leesbaar — en dat is precies wat een citatie of een
 * bedrijfsvermelding overneemt. E164 voor schema en href, DISPLAY voor wat de
 * bezoeker ziet. */
export const LODGE_PHONE_E164 = "+31642568603";
/* Zelfde groepering als op de rechtspagina's en in de mails — NAP-consistentie
 * is het hele punt van deze constante, dus niet hier een andere spatiëring. */
export const LODGE_PHONE_DISPLAY = "+31 6 42568603";
/** Zelfde nummer, in de vorm die wa.me verwacht (geen plus, geen spaties). */
export const LODGE_WHATSAPP_URL = `https://wa.me/${LODGE_PHONE_E164.replace(/\D/g, "")}`;

/* Max guests per lodge. Both lodges sleep 4. */
export const MAX_GUESTS_PER_LODGE = 4;

/* Earliest date guests can request via website/app booking flow.
 * Used by both BookingCalendar (homepage) and Terugkomen (in-app) so the
 * two stay aligned. Update here when the season opens.
 *
 * Dit is tevens de openingsdatum die overal op de site wordt getoond
 * ("Opening 1 april 2027"). Wijzigt de datum, pas dan ook de teksten aan
 * die hem voluit noemen. */
export const BOOKINGS_OPEN_FROM = "2027-04-01";
