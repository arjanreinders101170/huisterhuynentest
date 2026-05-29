/* ═══ STATIC LODGE CONSTANTS ═══
 * Values that don't rotate per stay (wifi, address, phone).
 * Door codes and stay tokens DO rotate — see stays table.
 */
export const WIFI_SSID = "HuynenGast";
export const WIFI_PASSWORD = process.env.NEXT_PUBLIC_WIFI_PASSWORD ?? "";

export const ADDRESS_STREET = "Zuiderstraat 6";
export const ADDRESS_CITY = "Zeijen";
export const ADDRESS_REGION = "Drenthe";
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

/* Max guests per lodge. Both lodges sleep 4. */
export const MAX_GUESTS_PER_LODGE = 4;

/* Earliest date guests can request via website/app booking flow.
 * Used by both BookingCalendar (homepage) and Terugkomen (in-app) so the
 * two stay aligned. Update here when the season opens. */
export const BOOKINGS_OPEN_FROM = "2027-01-01";
