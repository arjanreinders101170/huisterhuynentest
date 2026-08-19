import { getSupabase } from "@/lib/supabase";
import { LODGE_NAMES } from "@/data/lodge";

/* Beschikbaarheid van een lodge, uit twee bronnen tegelijk:
 * de externe agenda (Booking.com) en de eigen bevestigde reserveringen.
 *
 * Een verstuurde offerte blokkeert bewust niets — pas een bevestiging telt.
 * Daardoor kunnen twee gasten tegelijk een aanbod voor dezelfde nachten
 * hebben. Wie het eerst bevestigt heeft de plek; de tweede loopt hier tegen
 * een conflict aan in plaats van in een dubbele boeking te belanden. */

export type Period = { start: string; end: string; bron?: string };

/** Statussen die de agenda daadwerkelijk dichtzetten. */
export const BLOCKING_STATUSES = [
  "bevestigd",
  "aanbetaling_verstuurd",
  "aanbetaling_betaald",
  "restbetaling_verstuurd",
  "volledig_betaald",
] as const;

/* Capability-URL's: het token ín de URL is het enige bewijs van toegang tot
 * de Booking.com-agenda. Ze stonden hier als hardcoded fallback, en daarmee
 * in de git-historie van elke clone, fork en CI-run. Alleen env-vars nu — een
 * ontbrekende waarde levert een lege agenda op, geen stille terugval. */
const ICAL_URLS: Record<string, string | undefined> = {
  lodge_1: process.env.ICAL_LODGE_1,
  lodge_2: process.env.ICAL_LODGE_2,
};

/* Bewust losgekoppeld van ICAL_URLS: of een lodge bestaat is een andere vraag
 * dan of we zijn externe agenda kunnen ophalen. Zonder die scheiding zou een
 * niet-ingevulde ICAL_LODGE_1 de beschikbaarheidskalender met een 400
 * afserveren, terwijl we prima kunnen terugvallen op onze eigen
 * bevestigde reserveringen. */
export function isKnownLodge(lodge: string): boolean {
  return Object.prototype.hasOwnProperty.call(LODGE_NAMES, lodge);
}

function formatDate(raw: string): string {
  const d = raw.replace(/[TZ].*/, "").replace(/-/g, "");
  return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
}

export function parseICS(ics: string): Period[] {
  const events: Period[] = [];
  const lines = ics.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  let inEvent = false;
  let start = "";
  let end = "";
  for (const line of lines) {
    if (line.trim() === "BEGIN:VEVENT") { inEvent = true; start = ""; end = ""; }
    else if (line.trim() === "END:VEVENT") {
      if (start && end) events.push({ start: formatDate(start), end: formatDate(end), bron: "agenda" });
      inEvent = false;
    } else if (inEvent) {
      const [key, ...rest] = line.split(":");
      const val = rest.join(":");
      if (key.startsWith("DTSTART")) start = val;
      else if (key.startsWith("DTEND")) end = val;
    }
  }
  return events;
}

/** Nachten overlappen elkaar; check-out en check-in op dezelfde dag mag. */
export function overlaps(a: Period, b: Period): boolean {
  return a.start < b.end && b.start < a.end;
}

/** Externe agenda. Faalt deze, dan geven we dat door in plaats van te doen alsof alles vrij is. */
export async function fetchIcalPeriods(lodge: string): Promise<{ periods: Period[]; ok: boolean }> {
  const url = ICAL_URLS[lodge];
  if (!url) return { periods: [], ok: false };
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "HuisTermHuynen-Calendar/1.0" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { periods: parseICS(await res.text()), ok: true };
  } catch (e) {
    console.error("iCal fetch error voor", lodge, e);
    return { periods: [], ok: false };
  }
}

/** Eigen bevestigde en betaalde reserveringen. */
export async function confirmedPeriods(lodge: string, excludeRequestId?: string): Promise<Period[]> {
  let query = getSupabase()
    .from("booking_requests")
    .select("id, check_in, check_out, gast_naam")
    .eq("lodge", lodge)
    .in("status", BLOCKING_STATUSES as unknown as string[])
    .not("check_in", "is", null)
    .not("check_out", "is", null);
  if (excludeRequestId) query = query.neq("id", excludeRequestId);

  const { data } = await query;
  return (data || []).map((r: { check_in: string; check_out: string; gast_naam: string | null }) => ({
    start: r.check_in,
    end: r.check_out,
    bron: r.gast_naam ? `reservering ${r.gast_naam}` : "reservering",
  }));
}

export type ConflictResult = {
  /** De eerste overlappende periode, of null als de datums vrij zijn. */
  conflict: Period | null;
  /** False als de externe agenda niet bereikbaar was — dan is dit oordeel onvolledig. */
  icalOk: boolean;
};

/** Zijn deze datums nog vrij voor deze lodge? */
export async function findConflict(opts: {
  lodge: string;
  checkIn: string;
  checkOut: string;
  excludeRequestId?: string;
}): Promise<ConflictResult> {
  const wanted: Period = { start: opts.checkIn, end: opts.checkOut };

  const [ical, confirmed] = await Promise.all([
    fetchIcalPeriods(opts.lodge),
    confirmedPeriods(opts.lodge, opts.excludeRequestId),
  ]);

  const conflict = [...confirmed, ...ical.periods].find(p => overlaps(wanted, p)) ?? null;
  return { conflict, icalOk: ical.ok };
}

export type OpenOffer = {
  id: string;
  gast_naam: string | null;
  gast_email: string | null;
  guest_id: string | null;
  lodge: string | null;
  check_in: string | null;
  check_out: string | null;
};

/**
 * Andere openstaande offertes die met deze periode overlappen.
 * `sameLodgeOnly: false` vindt ook alternatieven in de andere lodge — handig
 * wanneer een gast twee aanbiedingen kreeg en er één accepteert.
 */
export async function openOffersOverlapping(opts: {
  checkIn: string;
  checkOut: string;
  lodge?: string | null;
  excludeRequestId?: string;
}): Promise<OpenOffer[]> {
  let query = getSupabase()
    .from("booking_requests")
    .select("id, gast_naam, gast_email, guest_id, lodge, check_in, check_out")
    .eq("status", "offerte_verstuurd")
    .not("check_in", "is", null)
    .not("check_out", "is", null);
  if (opts.lodge) query = query.eq("lodge", opts.lodge);
  if (opts.excludeRequestId) query = query.neq("id", opts.excludeRequestId);

  const { data } = await query;
  const wanted: Period = { start: opts.checkIn, end: opts.checkOut };
  return (data || []).filter((r: OpenOffer) =>
    r.check_in && r.check_out && overlaps(wanted, { start: r.check_in, end: r.check_out }),
  );
}
