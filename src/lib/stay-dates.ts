import { BOOKINGS_OPEN_FROM } from "@/data/lodge";

/* Eén bron van waarheid voor de datumregels van een aanvraag.
 * Gebruikt door de aanvraagformulieren (NL/DE) én door de API-routes, zodat
 * de client-check en de server-check niet uit elkaar kunnen lopen. De server
 * is de enige die telt — de formuliercheck is er voor de melding. */

export const MIN_NIGHTS = 2;

export type Locale = "nl" | "de";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Vroegst aanvraagbare aankomstdatum: vandaag of de opening, wat later is. */
export function earliestStayDate(): string {
  const today = toISO(new Date());
  return today < BOOKINGS_OPEN_FROM ? BOOKINGS_OPEN_FROM : today;
}

/** True zolang de opening nog niet is aangebroken. */
export function bookingsNotYetOpen(): boolean {
  return toISO(new Date()) < BOOKINGS_OPEN_FROM;
}

export function formatOpeningDate(locale: Locale = "nl"): string {
  return new Date(`${BOOKINGS_OPEN_FROM}T00:00:00`).toLocaleDateString(
    locale === "de" ? "de-DE" : "nl-NL",
    { day: "numeric", month: "long", year: "numeric" },
  );
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  return Math.round(
    (Date.parse(`${checkOut}T00:00:00Z`) - Date.parse(`${checkIn}T00:00:00Z`)) / 86400000,
  );
}

const MESSAGES = {
  nl: {
    missing: "Kies een aankomst- en vertrekdatum.",
    format: "Ongeldige datum.",
    tooEarly: (d: string) => `We nemen aanvragen aan vanaf ${d}. Kies een aankomstdatum vanaf die dag.`,
    inPast: "Die datum is al geweest. Kies een aankomstdatum in de toekomst.",
    order: "De vertrekdatum moet ná de aankomstdatum liggen.",
    minNights: `Een verblijf duurt minimaal ${MIN_NIGHTS} nachten.`,
  },
  de: {
    missing: "Bitte wähle ein An- und Abreisedatum.",
    format: "Ungültiges Datum.",
    tooEarly: (d: string) => `Wir nehmen Anfragen ab dem ${d} an. Bitte wähle ein Anreisedatum ab diesem Tag.`,
    inPast: "Dieses Datum liegt in der Vergangenheit. Bitte wähle ein Anreisedatum in der Zukunft.",
    order: "Das Abreisedatum muss nach dem Anreisedatum liegen.",
    minNights: `Ein Aufenthalt dauert mindestens ${MIN_NIGHTS} Nächte.`,
  },
} as const;

export type StayDateCheck =
  | { ok: true; nights: number }
  | { ok: false; error: string };

/**
 * Controleert de datums van een aanvraag: formaat, openingsdatum,
 * volgorde en minimum aantal nachten.
 */
export function checkStayDates(
  checkIn: string | null | undefined,
  checkOut: string | null | undefined,
  opts?: { locale?: Locale; minNights?: number },
): StayDateCheck {
  const m = MESSAGES[opts?.locale ?? "nl"];
  const minNights = opts?.minNights ?? MIN_NIGHTS;

  if (!checkIn || !checkOut) return { ok: false, error: m.missing };
  if (!ISO_DATE.test(checkIn) || !ISO_DATE.test(checkOut)) return { ok: false, error: m.format };

  const earliest = earliestStayDate();
  if (checkIn < earliest) {
    return {
      ok: false,
      error: bookingsNotYetOpen() ? m.tooEarly(formatOpeningDate(opts?.locale ?? "nl")) : m.inPast,
    };
  }

  const nights = nightsBetween(checkIn, checkOut);
  if (nights < 1) return { ok: false, error: m.order };
  if (nights < minNights) return { ok: false, error: m.minNights };

  return { ok: true, nights };
}
