/* ═══ Herkomst van een aanvraag bepalen — server ═══
 *
 * De browser stuurt ruwe signalen mee (utm-parameters, klik-ID's, het
 * verwijzende domein). Het kanaal leiden we hier af en niet in de browser:
 * zo staat er in de database één vocabulaire, ook als er later een formulier
 * bijkomt dat het net anders zou labelen.
 */

export type Kanaal =
  | "betaald-google"
  | "betaald-meta"
  | "betaald-overig"
  | "google-bedrijfsprofiel"
  | "organisch-zoek"
  | "social"
  | "e-mail"
  | "boekingssite"
  | "vermelding"
  | "verwijzing"
  | "direct";

export const KANAAL_LABEL: Record<Kanaal, string> = {
  "betaald-google":        "Google Ads",
  "betaald-meta":          "Meta Ads",
  "betaald-overig":        "Betaald (overig)",
  "google-bedrijfsprofiel": "Google Bedrijfsprofiel",
  "organisch-zoek":        "Organisch zoeken",
  "social":                "Social",
  "e-mail":                "E-mail",
  "boekingssite":          "Boekingssite",
  "vermelding":            "Vermelding / gids",
  "verwijzing":            "Verwijzing",
  "direct":                "Direct",
};

export interface AttributieTouch {
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  gclid?: string | null;
  fbclid?: string | null;
  referrer?: string | null;
  landing_page?: string | null;
  op?: string | null;
}

export interface Attributie {
  eerste?: AttributieTouch | null;
  laatste?: AttributieTouch | null;
}

const BETAALDE_MEDIA = new Set(["cpc", "ppc", "paid", "paidsearch", "paid_search", "paid-social", "paidsocial", "display", "cpm"]);
const SOCIALE_MEDIA = new Set(["social", "social-organic", "socialmedia"]);
const EMAIL_MEDIA = new Set(["email", "e-mail", "mail", "nieuwsbrief", "newsletter"]);

const ZOEKMACHINES = ["google.", "bing.", "duckduckgo.", "ecosia.", "yahoo.", "startpagina.", "search.brave", "yandex."];
const SOCIALE_SITES = ["facebook.", "instagram.", "pinterest.", "linkedin.", "tiktok.", "youtube.", "t.co", "x.com", "reddit."];
const BOEKINGSSITES = ["natuurhuisje.", "airbnb.", "booking.com", "belvilla.", "micazu.", "vakantiehuizen", "bungalowspecials", "roompot."];
const VERMELDINGEN = ["vvvdrenthe.", "visitdrenthe.", "drenthe.nl", "anwb.", "tripadvisor.", "wandelknooppunt.", "fietsknooppunt.", "nederlandbloeit", "google.com/maps", "business.site"];

function norm(waarde: string | null | undefined): string {
  return (waarde ?? "").trim().toLowerCase();
}

function bevat(domein: string, lijst: string[]): boolean {
  return lijst.some((fragment) => domein.includes(fragment));
}

/**
 * Leidt het kanaal af uit één contactmoment.
 *
 * Volgorde is bewust: klik-ID's en utm-parameters winnen altijd van de
 * referrer. Een advertentieklik komt via google.nl binnen en zou anders als
 * organisch verkeer geboekt worden — precies de fout die een budget
 * onbeoordeelbaar maakt.
 */
export function bepaalKanaal(touch: AttributieTouch | null | undefined): Kanaal {
  if (!touch) return "direct";

  const source = norm(touch.utm_source);
  const medium = norm(touch.utm_medium);
  const referrer = norm(touch.referrer);

  // 1. Bewijs van een betaalde klik.
  if (touch.gclid) return "betaald-google";
  if (touch.fbclid) return "betaald-meta";
  if (BETAALDE_MEDIA.has(medium)) {
    if (source.includes("google")) return "betaald-google";
    if (source.includes("facebook") || source.includes("instagram") || source.includes("meta")) return "betaald-meta";
    return "betaald-overig";
  }

  // 2. Handmatig getagde kanalen.
  if (EMAIL_MEDIA.has(medium)) return "e-mail";
  if (SOCIALE_MEDIA.has(medium)) return "social";
  if (source === "gbp" || source.includes("bedrijfsprofiel") || source.includes("business-profile")) {
    return "google-bedrijfsprofiel";
  }

  // 3. Afleiden uit het verwijzende domein.
  if (referrer) {
    if (bevat(referrer, VERMELDINGEN)) {
      return referrer.includes("google") ? "google-bedrijfsprofiel" : "vermelding";
    }
    if (bevat(referrer, BOEKINGSSITES)) return "boekingssite";
    if (bevat(referrer, SOCIALE_SITES)) return "social";
    if (bevat(referrer, ZOEKMACHINES)) return "organisch-zoek";
    return "verwijzing";
  }

  // 4. Een utm-bron zonder herkenbaar medium is nog altijd géén direct verkeer.
  if (source) return "verwijzing";

  return "direct";
}

const MAX_LEN = 200;
function knip(waarde: string | null | undefined): string | null {
  if (typeof waarde !== "string") return null;
  const schoon = waarde.trim().slice(0, MAX_LEN);
  return schoon.length > 0 ? schoon : null;
}

/** Alleen een geldige tijdstempel mag naar een timestamptz-kolom. */
function isoDatum(waarde: string | null | undefined): string | null {
  if (typeof waarde !== "string") return null;
  const t = Date.parse(waarde);
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}

/**
 * Zet de meegestuurde attributie om in databasekolommen.
 *
 * De campagnevelden komen van het laatste contactmoment — dat is de klik die
 * de aanvraag opleverde. Het eerste kanaal bewaren we apart, omdat de eerste
 * kennismaking vaak in een ander kanaal is betaald dan de laatste klik.
 */
export function attributieKolommen(attr: Attributie | null | undefined): Record<string, string | null> {
  const laatste = attr?.laatste ?? null;
  const eerste = attr?.eerste ?? null;

  return {
    utm_source:      knip(laatste?.utm_source),
    utm_medium:      knip(laatste?.utm_medium),
    utm_campaign:    knip(laatste?.utm_campaign),
    utm_term:        knip(laatste?.utm_term),
    utm_content:     knip(laatste?.utm_content),
    referrer:        knip(laatste?.referrer),
    landing_page:    knip(eerste?.landing_page ?? laatste?.landing_page),
    kanaal:          bepaalKanaal(laatste),
    eerste_kanaal:   bepaalKanaal(eerste),
    eerste_bezoek_op: isoDatum(eerste?.op),
  };
}
