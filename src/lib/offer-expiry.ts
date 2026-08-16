/* Geldigheid van een verstuurde offerte.
 *
 * Een offerte blokkeert de agenda niet — pas een bevestiging doet dat. Zonder
 * einddatum blijft een aanbod dus eeuwig open staan zonder dat iemand weet of
 * de gast nog komt. Daarom krijgt elke offerte een vervaldatum: daarna gaat de
 * aanvraag naar 'verlopen' en werkt de bevestigingslink niet meer. */

/** Standaard bedenktijd in dagen, gerekend vanaf de dag van versturen. */
export const OFFER_VALID_DAYS = 7;

/** Aantal dagen vóór de vervaldatum dat de gast een herinnering krijgt. */
export const OFFER_REMINDER_DAYS_BEFORE = 2;

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function addDaysISO(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return toISODate(new Date(y, m - 1, d + days));
}

export function daysBetweenISO(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000);
}

/**
 * Vervaldatum voor een offerte: geldig t/m deze dag.
 *
 * Basis is vandaag + OFFER_VALID_DAYS, maar nooit later dan de dag vóór
 * aankomst — een aanbod voor over drie dagen kan geen week bedenktijd hebben.
 * Ligt aankomst al (bijna) op de deur, dan geldt het aanbod nog vandaag.
 */
export function offerExpiryDate(checkIn?: string | null, from: string = todayISO()): string {
  const standard = addDaysISO(from, OFFER_VALID_DAYS);
  if (!checkIn) return standard;
  const dayBeforeArrival = addDaysISO(checkIn, -1);
  const capped = dayBeforeArrival < standard ? dayBeforeArrival : standard;
  return capped < from ? from : capped;
}

/** Datum waarop de herinnering hoort te gaan; null als die vóór vandaag valt. */
export function reminderDateFor(expiry: string, from: string = todayISO()): string | null {
  const reminder = addDaysISO(expiry, -OFFER_REMINDER_DAYS_BEFORE);
  return reminder <= from ? null : reminder;
}

export function formatDateNl(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("nl-NL", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

export type OfferStatus =
  | { state: "expired"; days: number }
  | { state: "today" }
  | { state: "open"; days: number };

/** Voor de admin: hoe lang staat dit aanbod nog open? */
export function offerCountdown(expiry: string, from: string = todayISO()): OfferStatus {
  const days = daysBetweenISO(from, expiry);
  if (days < 0) return { state: "expired", days: -days };
  if (days === 0) return { state: "today" };
  return { state: "open", days };
}
