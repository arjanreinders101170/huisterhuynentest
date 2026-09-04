/* ══════════════════════════════════════════════════════════════════════
   WAD & WEIDS — datamodel
   ──────────────────────────────────────────────────────────────────────
   Dit is het contract tussen de website en het PMS. Alles wat de bezoeker
   ziet komt uit deze types; geen enkele pagina bevat een hardgecodeerde
   woning. Een woning toevoegen = één record erbij, geen ontwerpwerk.

   Herkomst per veld staat erbij:
     [PMS]     leeft in MyTourist en wordt gesynchroniseerd
     [LIVE]    wordt per verzoek bij MyTourist opgehaald (nooit gecachet)
     [CONTENT] leeft in de redactieomgeving van Wad & Weids zelf
   ══════════════════════════════════════════════════════════════════════ */

/** Voorziening met vaste sleutel, zodat filters en iconen niet op tekst hoeven te matchen. */
export type AmenityKey =
  | "sauna" | "jacuzzi" | "haard" | "buitendouche" | "terras" | "tuin"
  | "wifi" | "vaatwasser" | "wasmachine" | "vloerverwarming" | "smart-tv"
  | "laadpaal" | "parkeren" | "fietsen" | "bbq" | "keuken"
  | "huisdieren" | "kindvriendelijk" | "rolstoel" | "aan-het-water"
  | "nabij-strand" | "in-natuur" | "uitzicht";

export type AmenityGroup = "buiten" | "binnen" | "comfort" | "locatie" | "praktisch";

export interface Amenity {
  key: AmenityKey;
  label: string;
  group: AmenityGroup;
  /** Verschijnt als filterknop op de zoekpagina. */
  filter?: boolean;
}

export interface Destination {
  slug: string;               // [CONTENT]
  name: string;               // [CONTENT]
  region: string;             // [CONTENT] — provincie of gebied
  intro: string;              // [CONTENT]
  description: string;        // [CONTENT]
  image: string;              // [CONTENT]
  /** Bepaalt de grootte van de tegel in de bestemmingengrid. */
  tile?: "wide" | "tall" | "normal";
}

export interface PropertyImage {
  src: string;                // [CONTENT]
  alt: string;                // [CONTENT]
}

export interface Property {
  id: string;                 // [PMS] MyTourist property-id — de sleutel voor alle live calls
  slug: string;               // [CONTENT] url van de detailpagina
  name: string;               // [PMS]
  tagline: string;            // [CONTENT] één regel op de kaart
  place: string;              // [PMS]
  destination: string;        // [CONTENT] slug van de bestemming
  guests: number;             // [PMS]
  bedrooms: number;           // [PMS]
  bathrooms: number;          // [PMS]
  size: number;               // [PMS] woonoppervlak in m²
  /** Vanafprijs per nacht in euro's. [PMS] — indicatie; de echte prijs komt per datum uit quote(). */
  priceFrom: number;
  /** Vaste kosten die MyTourist per boeking meerekent. [PMS] */
  cleaningFee: number;
  touristTaxPerPersonPerNight: number;
  minNights: number;          // [PMS]
  amenities: AmenityKey[];    // [PMS]
  description: string[];      // [CONTENT] alinea's
  highlights: string[];       // [CONTENT] drie tot vijf korte punten
  images: PropertyImage[];    // [CONTENT]
  /** Optionele extra's die de gast in de boekingsmodule kan bijboeken. [PMS] */
  extras: BookingExtra[];
  /** Labeltje op de kaart, bijvoorbeeld "Nieuw" of "Aan het wad". [CONTENT] */
  badge?: string;
  coordinates?: { lat: number; lon: number };
}

export interface BookingExtra {
  key: string;
  label: string;
  description: string;
  price: number;
  /** eenmalig, per nacht of per persoon */
  unit: "once" | "night" | "person";
}

/* ── Beschikbaarheid en prijs — altijd live uit MyTourist ─────────── */

export interface AvailabilityDay {
  date: string;               // [LIVE] ISO, yyyy-mm-dd
  available: boolean;         // [LIVE]
  /** Prijs voor die nacht; dynamisch per seizoen, weekend en bezetting. */
  rate: number;               // [LIVE]
  /** Aankomst mogelijk op deze dag (MyTourist kent aankomstdagen per seizoen). */
  arrivalAllowed: boolean;    // [LIVE]
  minNights: number;          // [LIVE]
}

export interface QuoteInput {
  propertyId: string;
  arrival: string;            // yyyy-mm-dd
  departure: string;          // yyyy-mm-dd
  guests: number;
  extras?: string[];
}

export interface QuoteLine {
  label: string;
  detail?: string;
  amount: number;
  kind: "stay" | "fee" | "tax" | "extra" | "discount";
}

export interface Quote {
  propertyId: string;
  arrival: string;
  departure: string;
  nights: number;
  guests: number;
  /** Gemiddelde nachtprijs over de gekozen periode. */
  averageRate: number;
  lines: QuoteLine[];
  total: number;
  /** Aanbetaling die MyTourist bij bevestiging int. */
  deposit: number;
  currency: "EUR";
  available: boolean;
  /** Reden als het niet boekbaar is: te kort, geen aankomstdag, bezet. */
  reason?: string;
}

export interface SearchFilters {
  destination?: string;
  arrival?: string;
  departure?: string;
  guests?: number;
  bedrooms?: number;
  maxPrice?: number;
  amenities?: AmenityKey[];
  sort?: "aanbevolen" | "prijs-op" | "prijs-af" | "personen";
}

export interface SearchResult {
  properties: Property[];
  total: number;
  /** Wat de gebruiker heeft weggefilterd, voor de "wis filters"-knop. */
  appliedFilters: number;
}

export interface BookingRequest extends QuoteInput {
  guest: { firstName: string; lastName: string; email: string; phone?: string };
  notes?: string;
}

export interface BookingConfirmation {
  /** Reserveringsnummer zoals MyTourist het teruggeeft. */
  reference: string;
  status: "option" | "confirmed" | "failed";
  quote: Quote;
  paymentUrl?: string;
}
