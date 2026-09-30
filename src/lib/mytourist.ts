import { LODGE_NAMES } from "@/data/lodge";

/* ═══ MyTourist — beschikbaarheid en prijs, alleen lezen ═══
 *
 * MyTourist is de reserveringsadministratie; deze module vraagt er per lodge
 * op of een periode vrij is en wat die kost. Uitsluitend GET /availability:
 * er wordt niets geschreven, niets bewaard en niets herrekend. Het bedrag gaat
 * door zoals MyTourist het gaf.
 *
 * Overgenomen uit de koppeling die op wad-weids.eu al draait
 * (lib/mytourist/*, geverifieerd tegen de echte API op 15 en 20 september
 * 2026). Daar staat ook de volledige API-naslag:
 * docs/integrations/mytourist-api.md in die repository.
 *
 * Drie uitkomsten, meer niet: beschikbaar, niet beschikbaar, onbekend. Alles
 * wat misgaat — geen token, een fout bij MyTourist, een onleesbaar antwoord,
 * de rate limit — wordt "onbekend", en dan valt het formulier terug op wat het
 * altijd deed. Nooit "vrij" gokken.
 *
 * Het token (MYTOURIST_API_TOKEN) staat alleen in de omgeving van de server,
 * wordt nergens gelogd en gaat nooit terug naar de browser. */

export type Aanbod =
  | { status: "available"; totalPrice: string; nights: number }
  | { status: "unavailable" }
  | { status: "unknown" };

/* GEVERIFIEERD — de roomtypes van Huynen Lodges. 65582603121 is De Heide
 * (tegen de API getest), 65582603122 is De Eik (door Arjan bevestigd op
 * 30-09-2026). Geen geheim: beide staan ook in de openbare URL van de Booking
 * Engine. Via de omgeving te overschrijven. */
const ROOMTYPES: Record<string, string> = {
  lodge_1: process.env.MYTOURIST_ROOMTYPE_LODGE_1?.trim() || "65582603121",
  lodge_2: process.env.MYTOURIST_ROOMTYPE_LODGE_2?.trim() || "65582603122",
};

/* GEVERIFIEERD — deze host antwoordt; de documentatie noemt daarnaast
 * app.mytourist.com, die niet getest is. */
const DEFAULT_BASE_URL = "https://app.mytourist.cloud/api/v1";

/* Kort genoeg om het formulier niet te laten hangen: na deze tijd valt het
 * terug op het oude gedrag. */
const TIMEOUT_MS = 5_000;

/* OFFICIEEL — tien requests per tien seconden. Eén check kost er twee (één per
 * lodge). Bij overschrijding wordt niet gewacht maar "onbekend" teruggegeven.
 * Telt per serverinstantie; de CDN-cache in de route vangt herhaalde vragen
 * voor dezelfde datums op. */
const LIMIT = 10;
const WINDOW_MS = 10_000;
const recent: number[] = [];

function withinRateLimit(now: number): boolean {
  while (recent.length > 0 && now - recent[0] >= WINDOW_MS) recent.shift();
  if (recent.length >= LIMIT) return false;
  recent.push(now);
  return true;
}

type Json = Record<string, unknown>;

function isObject(value: unknown): value is Json {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function idOf(entry: Json, keys: string[]): string | null {
  for (const key of keys) {
    const value = entry[key];
    if (typeof value === "string" && value !== "") return value;
    if (typeof value === "number") return String(value);
  }
  return null;
}

/* OPEN — de omhullende structuur rond het roomtype-object is niet vastgelegd,
 * alleen de velden erin. Daarom tolerant zoeken. */
function collectRoomtypes(payload: unknown): Json[] {
  if (Array.isArray(payload)) return payload.filter(isObject);
  if (!isObject(payload)) return [];
  for (const key of ["roomtypes", "availability", "data", "results"]) {
    const value = payload[key];
    if (Array.isArray(value)) return value.filter(isObject);
  }
  if (idOf(payload, ["roomtype_id", "id"]) !== null && Array.isArray(payload.rates)) return [payload];
  return [];
}

function rateAvailableOf(rate: Json): boolean | null {
  const value = rate.rate_available ?? rate.rateAvailable;
  return typeof value === "boolean" ? value : null;
}

/** Het bedrag zoals MyTourist het levert. Geen berekening. */
function priceOf(rate: Json): string | null {
  const value = rate.total_price ?? rate.totalPrice;
  if (typeof value === "string" && value.trim() !== "") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

/**
 * Het antwoord versmallen tot één van de drie uitkomsten.
 *
 * GEVERIFIEERD — een lodge heeft meerdere rates (Weekend, Midweek, Week) en
 * MyTourist markeert per periode precies één ervan met rate_available: true.
 * Die wordt gelezen. Staan er meerdere tegelijk op beschikbaar, dan wordt er
 * niet gegokt maar "onbekend" teruggegeven.
 */
export function narrowAanbod(payload: unknown, roomtypeId: string, nights: number): Aanbod {
  const roomtype = collectRoomtypes(payload).find(r => idOf(r, ["roomtype_id", "id"]) === roomtypeId);
  if (!roomtype) return { status: "unknown" };

  const rates = Array.isArray(roomtype.rates) ? roomtype.rates.filter(isObject) : [];
  if (rates.length === 0 || rates.some(r => rateAvailableOf(r) === null)) return { status: "unknown" };

  const beschikbaar = rates.filter(r => rateAvailableOf(r) === true);
  if (beschikbaar.length === 0) return { status: "unavailable" };
  if (beschikbaar.length > 1) return { status: "unknown" };

  /* rooms_available: 0 wint van rate_available: true. */
  const rooms = roomtype.rooms_available ?? roomtype.roomsAvailable;
  if (typeof rooms === "number" && rooms <= 0) return { status: "unavailable" };

  const totalPrice = priceOf(beschikbaar[0]);
  if (totalPrice === null) return { status: "unknown" };
  return { status: "available", totalPrice, nights };
}

async function vraagLodge(opts: {
  token: string;
  baseUrl: string;
  roomtypeId: string;
  checkIn: string;
  checkOut: string;
  nights: number;
}): Promise<Aanbod> {
  if (!withinRateLimit(Date.now())) return { status: "unknown" };

  const url = new URL(`${opts.baseUrl}/availability`);
  url.searchParams.set("arrival", opts.checkIn);
  url.searchParams.set("departure", opts.checkOut);
  url.searchParams.set("roomtype_id", opts.roomtypeId);

  try {
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { Authorization: `Bearer ${opts.token}`, Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error(`[mytourist] HTTP ${res.status} voor roomtype ${opts.roomtypeId}`);
      return { status: "unknown" };
    }
    return narrowAanbod(await res.json(), opts.roomtypeId, opts.nights);
  } catch (e) {
    console.error(`[mytourist] verzoek mislukt voor roomtype ${opts.roomtypeId}:`, (e as Error)?.name);
    return { status: "unknown" };
  }
}

/** Aanbod van beide lodges voor één periode. Datums moeten al gevalideerd zijn. */
export async function aanbodVoorLodges(opts: {
  checkIn: string;
  checkOut: string;
  nights: number;
}): Promise<Record<string, Aanbod>> {
  const lodges = Object.keys(LODGE_NAMES);
  const token = process.env.MYTOURIST_API_TOKEN?.trim();
  if (!token) {
    return Object.fromEntries(lodges.map(l => [l, { status: "unknown" } as Aanbod]));
  }
  const baseUrl = (process.env.MYTOURIST_API_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(/\/+$/, "");

  const uitkomsten = await Promise.all(
    lodges.map(async lodge => {
      const roomtypeId = ROOMTYPES[lodge];
      const aanbod: Aanbod = roomtypeId
        ? await vraagLodge({ token, baseUrl, roomtypeId, ...opts })
        : { status: "unknown" };
      return [lodge, aanbod] as const;
    }),
  );
  return Object.fromEntries(uitkomsten);
}
