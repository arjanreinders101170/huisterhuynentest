/* ══════════════════════════════════════════════════════════════════════
   MyTourist — PMS-adapter
   ──────────────────────────────────────────────────────────────────────
   De website praat nooit rechtstreeks met MyTourist: alles loopt via dit
   ene contract. In de mock-up draait de mock-implementatie, die zich
   precies zo gedraagt als de echte koppeling straks. Live gaan is dan
   één regel: exporteer httpMyTourist() in plaats van mockMyTourist.

       Wad & Weids (Next.js)
              │  MyTouristClient      ← dit bestand
              ▼
       MyTourist PMS  →  beschikbaarheid · tarieven · reserveringen

   Wat waar hoort:
     • Beschikbaarheid en tarieven      → altijd live, nooit in de build
     • Woninggegevens (naam, capaciteit)→ nachtelijke sync naar de site
     • Reserveringen                    → schrijven via createBooking()
     • Content (teksten, fotografie)    → blijft bij Wad & Weids zelf
   ══════════════════════════════════════════════════════════════════════ */
import { PROPERTIES } from "./content";
import { addDays, iso, nightsBetween } from "./format";
import type {
  AvailabilityDay, BookingConfirmation, BookingRequest, Property,
  Quote, QuoteInput, QuoteLine, SearchFilters, SearchResult,
} from "./types";

export interface MyTouristClient {
  /** Alle woningen, of de woningen van één bestemming. */
  listProperties(destination?: string): Promise<Property[]>;
  getProperty(slug: string): Promise<Property | null>;
  /** Kalender per nacht: vrij/bezet, prijs en aankomstregels. */
  getAvailability(propertyId: string, from: string, nights: number): Promise<AvailabilityDay[]>;
  /** Volledige prijsopbouw voor een concrete periode. */
  quote(input: QuoteInput): Promise<Quote>;
  /** Zoeken met filters; het PMS levert alleen wat in de periode vrij is. */
  search(filters: SearchFilters): Promise<SearchResult>;
  /** Reservering wegschrijven. Geeft het MyTourist-reserveringsnummer terug. */
  createBooking(request: BookingRequest): Promise<BookingConfirmation>;
}

/* ── Deterministische "PMS-data" ──────────────────────────────────────
   Dezelfde datum geeft altijd hetzelfde antwoord, zodat server en client
   niet uit elkaar lopen en de mock-up er bij elke demo hetzelfde uitziet. */
function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

/** Seizoensfactor zoals MyTourist die per periode kent. */
function seasonFactor(date: Date): number {
  const m = date.getMonth();
  if (m === 6 || m === 7) return 1.32;            // juli, augustus
  if (m === 4 || m === 5 || m === 8) return 1.14; // mei, juni, september
  if (m === 3 || m === 9) return 1.0;             // april, oktober
  return 0.86;                                     // laagseizoen
}

function weekendFactor(date: Date): number {
  const d = date.getDay();
  return d === 5 || d === 6 ? 1.18 : 1;
}

function dayFor(property: Property, date: string): AvailabilityDay {
  const d = new Date(date + "T12:00:00");
  const h = hash(property.id + date);
  const rate = Math.round((property.priceFrom * seasonFactor(d) * weekendFactor(d)) / 5) * 5;
  return {
    date,
    /* Hoe hoger het seizoen, hoe voller de kalender — net als in het echt. */
    available: h > (seasonFactor(d) > 1.2 ? 0.42 : 0.2),
    rate,
    arrivalAllowed: seasonFactor(d) > 1.2 ? [5, 1].includes(d.getDay()) : true,
    minNights: seasonFactor(d) > 1.2 ? Math.max(property.minNights, 3) : property.minNights,
  };
}

/* ── Prijsopbouw ─────────────────────────────────────────────────────
   Exact de regels die de gast in de boekingsmodule ziet. Live komt deze
   berekening uit MyTourist; hier is het dezelfde vorm, zodat de module
   niet hoeft te veranderen. */
function buildQuote(property: Property, input: QuoteInput): Quote {
  const nights = nightsBetween(input.arrival, input.departure);
  const guests = Math.min(Math.max(1, input.guests), property.guests);
  const lines: QuoteLine[] = [];

  const days: AvailabilityDay[] = [];
  for (let i = 0; i < nights; i++) days.push(dayFor(property, addDays(input.arrival, i)));

  const stay = days.reduce((sum, d) => sum + d.rate, 0);
  const averageRate = nights ? Math.round(stay / nights) : property.priceFrom;

  let available = nights > 0 && days.every((d) => d.available);
  let reason: string | undefined;
  if (nights === 0) { available = false; reason = "Kies een aankomst- en vertrekdatum."; }
  else if (!days.every((d) => d.available)) reason = "Deze periode is deels bezet. Bekijk de kalender voor vrije data.";
  else if (nights < (days[0]?.minNights ?? property.minNights)) {
    available = false;
    reason = `In deze periode geldt een minimum van ${days[0]?.minNights ?? property.minNights} nachten.`;
  } else if (!days[0]?.arrivalAllowed) {
    available = false;
    reason = "In het hoogseizoen kun je aankomen op maandag of vrijdag.";
  }

  if (nights > 0) {
    lines.push({
      label: `${averageRate.toLocaleString("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })} × ${nights} ${nights === 1 ? "nacht" : "nachten"}`,
      detail: "Dynamisch tarief per nacht",
      amount: stay,
      kind: "stay",
    });
  }

  /* Langer blijven wordt goedkoper — een van de knoppen waar MyTourist
     op stuurt en die de site dus moet kunnen tonen. */
  if (nights >= 7) {
    lines.push({ label: "Weekkorting", detail: "10% vanaf zeven nachten", amount: -Math.round(stay * 0.1), kind: "discount" });
  }

  lines.push({ label: "Eindschoonmaak", amount: property.cleaningFee, kind: "fee" });
  lines.push({
    label: "Toeristenbelasting",
    detail: `${guests} × ${nights} × € ${property.touristTaxPerPersonPerNight.toFixed(2).replace(".", ",")}`,
    amount: Math.round(property.touristTaxPerPersonPerNight * guests * nights * 100) / 100,
    kind: "tax",
  });

  for (const key of input.extras ?? []) {
    const extra = property.extras.find((e) => e.key === key);
    if (!extra) continue;
    const amount =
      extra.unit === "night" ? extra.price * nights : extra.unit === "person" ? extra.price * guests : extra.price;
    lines.push({ label: extra.label, detail: extra.unit === "night" ? `per nacht` : extra.unit === "person" ? "per persoon" : "eenmalig", amount, kind: "extra" });
  }

  const total = Math.round(lines.reduce((sum, l) => sum + l.amount, 0) * 100) / 100;

  return {
    propertyId: property.id,
    arrival: input.arrival,
    departure: input.departure,
    nights,
    guests,
    averageRate,
    lines,
    total,
    deposit: Math.round(total * 0.3),
    currency: "EUR",
    available,
    reason,
  };
}

/* ── Mock-implementatie ─────────────────────────────────────────────── */
export const mockMyTourist: MyTouristClient = {
  async listProperties(destination) {
    return destination ? PROPERTIES.filter((p) => p.destination === destination) : PROPERTIES;
  },

  async getProperty(slug) {
    return PROPERTIES.find((p) => p.slug === slug) ?? null;
  },

  async getAvailability(propertyId, from, nights) {
    const property = PROPERTIES.find((p) => p.id === propertyId);
    if (!property) return [];
    return Array.from({ length: nights }, (_, i) => dayFor(property, addDays(from, i)));
  },

  async quote(input) {
    const property = PROPERTIES.find((p) => p.id === input.propertyId);
    if (!property) throw new Error(`Onbekende woning: ${input.propertyId}`);
    return buildQuote(property, input);
  },

  async search(filters) {
    const result = searchProperties(PROPERTIES, filters);
    return { properties: result, total: result.length, appliedFilters: countFilters(filters) };
  },

  async createBooking(request) {
    const quote = await mockMyTourist.quote(request);
    return {
      reference: `WW-${new Date().getFullYear()}-${String(Math.abs(Math.round(hash(request.propertyId + request.arrival) * 9999))).padStart(4, "0")}`,
      status: quote.available ? "option" : "failed",
      quote,
      paymentUrl: quote.available ? "/wad-weids/boeking/betalen" : undefined,
    };
  },
};

/* ── Filteren en sorteren ────────────────────────────────────────────
   Staat los van de client, zodat de zoekpagina er direct mee kan werken
   én de echte koppeling dezelfde volgorde kan aanhouden. */
export function searchProperties(properties: Property[], f: SearchFilters): Property[] {
  let list = properties.filter((p) => {
    if (f.destination && p.destination !== f.destination) return false;
    if (f.guests && p.guests < f.guests) return false;
    if (f.bedrooms && p.bedrooms < f.bedrooms) return false;
    if (f.maxPrice && p.priceFrom > f.maxPrice) return false;
    if (f.amenities?.length && !f.amenities.every((a) => p.amenities.includes(a))) return false;
    return true;
  });

  /* Periode gekozen? Dan valt alles af wat in die nachten niet vrij is —
     precies wat MyTourist straks zelf doet. */
  if (f.arrival && f.departure) {
    const nights = nightsBetween(f.arrival, f.departure);
    list = list.filter((p) =>
      Array.from({ length: nights }, (_, i) => dayFor(p, addDays(f.arrival!, i))).every((d) => d.available)
    );
  }

  const sorted = [...list];
  switch (f.sort) {
    case "prijs-op": sorted.sort((a, b) => a.priceFrom - b.priceFrom); break;
    case "prijs-af": sorted.sort((a, b) => b.priceFrom - a.priceFrom); break;
    case "personen": sorted.sort((a, b) => b.guests - a.guests); break;
    default: break; // "aanbevolen" = de volgorde van de collectie
  }
  return sorted;
}

export function countFilters(f: SearchFilters): number {
  return (
    (f.destination ? 1 : 0) + (f.guests ? 1 : 0) + (f.bedrooms ? 1 : 0) +
    (f.maxPrice ? 1 : 0) + (f.arrival && f.departure ? 1 : 0) + (f.amenities?.length ?? 0)
  );
}

/* Beschikbaarheid en prijs voor de kalender in de boekingsmodule.
   Synchroon, omdat de mock-up hem tijdens het klikken opnieuw tekent. */
export function calendarMonth(property: Property, year: number, month: number): AvailabilityDay[] {
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return Array.from({ length: days }, (_, i) =>
    dayFor(property, iso(new Date(Date.UTC(year, month, i + 1))))
  );
}

export function quoteFor(property: Property, input: QuoteInput): Quote {
  return buildQuote(property, input);
}

export function availabilityFor(property: Property, from: string, nights: number): AvailabilityDay[] {
  return Array.from({ length: nights }, (_, i) => dayFor(property, addDays(from, i)));
}

/* ── Echte koppeling (nog niet aangesloten) ──────────────────────────
   De endpoints hieronder zijn de plek waar de MyTourist-API landt. Zolang
   de omgevingsvariabelen ontbreken blijft de site de mock gebruiken, zodat
   een demo nooit stukloopt op een PMS-storing.

     MYTOURIST_API_URL   basis-url van de API
     MYTOURIST_API_KEY   servertoken — nooit in de browser

   Aandachtspunten voor de bouw:
     • beschikbaarheid en prijzen niet cachen (of maximaal 60 seconden)
     • woningkenmerken 's nachts synchroniseren naar de eigen database
     • webhook van MyTourist gebruiken om een boeking direct te verversen
     • bij een storing: laatst bekende prijzen tonen, boeken uitzetten  */
export function httpMyTourist(config: { baseUrl: string; apiKey: string }): MyTouristClient {
  const call = async <T>(path: string, init?: RequestInit): Promise<T> => {
    const res = await fetch(`${config.baseUrl}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.apiKey}`, ...init?.headers },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`MyTourist ${path}: ${res.status}`);
    return res.json() as Promise<T>;
  };

  return {
    listProperties: (destination) =>
      call<Property[]>(`/properties${destination ? `?destination=${destination}` : ""}`),
    getProperty: (slug) => call<Property | null>(`/properties/${slug}`),
    getAvailability: (propertyId, from, nights) =>
      call<AvailabilityDay[]>(`/properties/${propertyId}/availability?from=${from}&nights=${nights}`),
    quote: (input) => call<Quote>(`/quotes`, { method: "POST", body: JSON.stringify(input) }),
    search: (filters) => call<SearchResult>(`/search`, { method: "POST", body: JSON.stringify(filters) }),
    createBooking: (request) => call<BookingConfirmation>(`/bookings`, { method: "POST", body: JSON.stringify(request) }),
  };
}

/** De client die de site gebruikt. Eén regel om live te gaan. */
export const myTourist: MyTouristClient = mockMyTourist;
