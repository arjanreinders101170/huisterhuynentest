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


/* ═══ De drie boekingsvormen ═══════════════════════════════════════════════
 *
 * Losse dagen worden niet verhuurd. Elke wisseldag kost een schoonmaakbeurt
 * en maakt de kalender lastig planbaar, dus er zijn twee vaste wisseldagen —
 * maandag en vrijdag — en daarmee precies drie vormen:
 *
 *   Midweek   maandag → vrijdag    4 nachten (ma, di, wo, do)
 *   Weekend   vrijdag → zondag     2 nachten (vr, za)
 *   Week      maandag → zondag     6 nachten (midweek + weekend aaneen)
 *
 * Midweek en weekend sluiten exact op elkaar aan. Per week van zeven nachten
 * valt alleen de zondagnacht buiten de vormen, dus het theoretische plafond
 * ligt op 6/7 = 85,5% bezetting — ruim boven het doel van 70%.
 */

export type Verblijfsvorm = "midweek" | "weekend" | "week";

interface VormRegel {
  /** Weekdag van aankomst, 0 = zondag … 6 = zaterdag (Date#getDay). */
  aankomst: number;
  vertrek: number;
  nachten: number;
  labelNl: string;
  labelDe: string;
}

export const VERBLIJFSVORMEN: Record<Verblijfsvorm, VormRegel> = {
  midweek: { aankomst: 1, vertrek: 5, nachten: 4, labelNl: "Midweek (ma – vr)", labelDe: "Kurzwoche (Mo – Fr)" },
  weekend: { aankomst: 5, vertrek: 0, nachten: 2, labelNl: "Weekend (vr – zo)", labelDe: "Wochenende (Fr – So)" },
  week:    { aankomst: 1, vertrek: 0, nachten: 6, labelNl: "Week (ma – zo)",    labelDe: "Woche (Mo – So)" },
};

/** Weekdag van een ISO-datum, zonder tijdzone-verschuiving. */
export function weekdag(iso: string): number {
  return new Date(`${iso}T00:00:00Z`).getUTCDay();
}

/** Welke vorm past bij deze datums? null als het geen geldige combinatie is. */
export function bepaalVerblijfsvorm(checkIn: string, checkOut: string): Verblijfsvorm | null {
  const nachten = nightsBetween(checkIn, checkOut);
  const aan = weekdag(checkIn);
  const uit = weekdag(checkOut);
  for (const [naam, regel] of Object.entries(VERBLIJFSVORMEN) as [Verblijfsvorm, VormRegel][]) {
    if (regel.nachten === nachten && regel.aankomst === aan && regel.vertrek === uit) return naam;
  }
  return null;
}

/** Mag er op deze dag worden aangekomen? Alleen maandag en vrijdag. */
export function isAankomstdag(iso: string): boolean {
  const d = weekdag(iso);
  return d === 1 || d === 5;
}

/** De geldige vertrekdatums bij een gekozen aankomstdatum, vroegste eerst. */
export function vertrekdatumsVoor(checkIn: string): { datum: string; vorm: Verblijfsvorm }[] {
  const aan = weekdag(checkIn);
  const uit: { datum: string; vorm: Verblijfsvorm }[] = [];
  for (const [naam, regel] of Object.entries(VERBLIJFSVORMEN) as [Verblijfsvorm, VormRegel][]) {
    if (regel.aankomst !== aan) continue;
    uit.push({ datum: voegDagenToe(checkIn, regel.nachten), vorm: naam });
  }
  return uit.sort((a, b) => a.datum.localeCompare(b.datum));
}

function voegDagenToe(iso: string, dagen: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dagen);
  return d.toISOString().slice(0, 10);
}

export function vormLabel(vorm: Verblijfsvorm, locale: Locale = "nl"): string {
  const r = VERBLIJFSVORMEN[vorm];
  return locale === "de" ? r.labelDe : r.labelNl;
}

export const MESSAGES_VORM = {
  nl: {
    aankomstdag: "Aankomst is op maandag of vrijdag. Kies een van die dagen.",
    geenVorm: "We verhuren in drie vormen: midweek (ma – vr), weekend (vr – zo) of een hele week (ma – zo). Kies een van die combinaties.",
  },
  de: {
    aankomstdag: "Anreise ist montags oder freitags. Bitte wähle einen dieser Tage.",
    geenVorm: "Wir vermieten in drei Formen: Kurzwoche (Mo – Fr), Wochenende (Fr – So) oder eine ganze Woche (Mo – So). Bitte wähle eine davon.",
  },
} as const;

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
  opts?: { locale?: Locale; minNights?: number; vormen?: boolean },
): StayDateCheck {
  const locale = opts?.locale ?? "nl";
  const m = MESSAGES[locale];
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

  // Standaard aan. Uit te zetten voor de admin, die een handmatige boeking
  // buiten de vaste vormen moet kunnen vastleggen.
  if (opts?.vormen !== false) {
    const v = MESSAGES_VORM[locale];
    if (!isAankomstdag(checkIn)) return { ok: false, error: v.aankomstdag };
    if (!bepaalVerblijfsvorm(checkIn, checkOut)) return { ok: false, error: v.geenVorm };
  }

  return { ok: true, nights };
}
