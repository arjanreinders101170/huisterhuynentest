/* Geldigheid van een verstuurde offerte.
 *
 * Een offerte blokkeert de agenda niet — pas een bevestiging doet dat. Zonder
 * einddatum blijft een aanbod dus eeuwig open staan zonder dat iemand weet of
 * de gast nog komt. Daarom krijgt elke offerte een vervaldatum: daarna gaat de
 * aanvraag naar 'verlopen'. De bevestigingslink werkt daarna nog een paar
 * coulancedagen door (zie OFFER_GRACE_DAYS), zodat een late 'ja' niet op een
 * doodlopende pagina eindigt. */

/** Standaard bedenktijd in dagen, gerekend vanaf de dag van versturen. */
export const OFFER_VALID_DAYS = 7;

/** Aantal dagen vóór de vervaldatum dat de gast een herinnering krijgt. */
export const OFFER_REMINDER_DAYS_BEFORE = 2;

/**
 * Coulancedagen ná de vervaldatum waarin de bevestigingslink blijft werken.
 *
 * Een harde deadline kost boekingen: wie op dag 8 alsnog ja wil zeggen, kwam
 * vroeger op een doodlopende pagina. De offerte blokkeert de agenda toch niet,
 * dus dat aanbod nog even open houden kost niets — de dubbelboekingscheck bij
 * het bevestigen vangt af of de datums intussen vergeven zijn. In admin staat
 * de aanvraag ondertussen gewoon op 'verlopen'.
 */
export const OFFER_GRACE_DAYS = 2;

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

/** Laatste dag waarop een verlopen aanbod nog bevestigd mag worden. */
export function graceEndDate(expiry: string): string {
  return addDaysISO(expiry, OFFER_GRACE_DAYS);
}

/** Zit vandaag ná de vervaldatum, maar nog binnen de coulanceperiode? */
export function withinGrace(expiry: string, from: string = todayISO()): boolean {
  return from > expiry && from <= graceEndDate(expiry);
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
