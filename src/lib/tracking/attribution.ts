/* ═══ Campagne-attributie — client only ═══
 *
 * Waarom dit bestaat: zodra er marketingbudget wordt uitgegeven, moet per
 * kanaal aantoonbaar zijn wat het oplevert. GA4 meet sessies, maar de
 * boeking ontstaat in onze eigen database — en die wist tot nu toe niet
 * waar de gast vandaan kwam. Deze module plakt de herkomst aan de aanvraag.
 *
 * Er worden twee momenten bewaard:
 *   • eerste bezoek  — hoe iemand ons voor het eerst vond (wat we betaald
 *     hebben om te bereiken; wordt nooit overschreven)
 *   • laatste bezoek — de klik vlak vóór de aanvraag (wat de boeking
 *     afmaakte; wordt vervangen zodra er een nieuwe herkomst is)
 *
 * Alleen een écht nieuwe herkomst overschrijft het laatste bezoek. Klikken
 * binnen de site laten de attributie ongemoeid — anders zou elke interne
 * navigatie de bron op "direct" zetten.
 */

const FIRST_KEY = "hth-attr-first";
const LAST_KEY = "hth-attr-last";
const MAX_LEN = 200;

export interface AttributieTouch {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  /** Klik-ID's: bewijzen dat een bezoek uit een betaalde advertentie kwam. */
  gclid?: string;
  fbclid?: string;
  /** De verwijzende site, zonder pad — alleen het domein. */
  referrer?: string;
  /** De pagina waarop iemand binnenkwam. */
  landing_page?: string;
  /** ISO-datum van dit contactmoment. */
  op?: string;
}

export interface Attributie {
  eerste?: AttributieTouch;
  laatste?: AttributieTouch;
}

function knip(waarde: string | null | undefined): string | undefined {
  if (!waarde) return undefined;
  const schoon = waarde.trim().slice(0, MAX_LEN);
  return schoon.length > 0 ? schoon : undefined;
}

function lees(key: string): AttributieTouch | undefined {
  try {
    const ruw = localStorage.getItem(key);
    if (!ruw) return undefined;
    const parsed = JSON.parse(ruw) as unknown;
    if (parsed && typeof parsed === "object") return parsed as AttributieTouch;
  } catch { /* geen storage of onleesbare inhoud */ }
  return undefined;
}

function schrijf(key: string, touch: AttributieTouch): void {
  try { localStorage.setItem(key, JSON.stringify(touch)); } catch { /* storage vol of geblokkeerd */ }
}

/** Het verwijzende domein, of undefined als de bezoeker van onze eigen site komt. */
function externeVerwijzer(): string | undefined {
  const ruw = document.referrer;
  if (!ruw) return undefined;
  try {
    const url = new URL(ruw);
    if (url.hostname === location.hostname) return undefined;
    return knip(url.hostname.replace(/^www\./, ""));
  } catch { return undefined; }
}

/** Leest de herkomst uit de huidige URL en de referrer. */
function huidigeTouch(): AttributieTouch {
  const q = new URLSearchParams(location.search);
  return {
    utm_source: knip(q.get("utm_source")),
    utm_medium: knip(q.get("utm_medium")),
    utm_campaign: knip(q.get("utm_campaign")),
    utm_term: knip(q.get("utm_term")),
    utm_content: knip(q.get("utm_content")),
    gclid: knip(q.get("gclid")),
    fbclid: knip(q.get("fbclid")),
    referrer: externeVerwijzer(),
    landing_page: knip(location.pathname),
    op: new Date().toISOString(),
  };
}

/** Een touch telt als nieuwe herkomst zodra er een campagne of externe verwijzer in zit. */
function isNieuweHerkomst(touch: AttributieTouch): boolean {
  return Boolean(
    touch.utm_source || touch.utm_medium || touch.utm_campaign ||
    touch.gclid || touch.fbclid || touch.referrer,
  );
}

/**
 * Leg de herkomst van dit bezoek vast. Aanroepen bij het laden van de pagina.
 * Idempotent: tweemaal aanroepen op dezelfde URL verandert niets.
 */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  const touch = huidigeTouch();
  const nieuw = isNieuweHerkomst(touch);

  if (!lees(FIRST_KEY)) {
    // Eerste keer hier: leg vast hoe deze bezoeker ons vond, ook als dat
    // "direct" was — anders mist elke latere boeking zijn beginpunt.
    schrijf(FIRST_KEY, touch);
    schrijf(LAST_KEY, touch);
    return;
  }
  if (nieuw) schrijf(LAST_KEY, touch);
}

/** De opgeslagen herkomst, om mee te sturen bij een aanvraag. */
export function getAttribution(): Attributie | undefined {
  if (typeof window === "undefined") return undefined;
  const eerste = lees(FIRST_KEY);
  const laatste = lees(LAST_KEY);
  if (!eerste && !laatste) return undefined;
  return { eerste, laatste };
}
