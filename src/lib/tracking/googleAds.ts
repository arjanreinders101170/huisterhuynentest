/* ═══ Google Ads-conversies (gtag.js) — client only ═══
 * Zelfde patroon als ga4.ts: elk event loopt via pushEvent(), die hier de
 * conversie afvuurt. Geen GTM-tag nodig — de basistag uit
 * <GoogleAds /> laadt gtag.js al.
 *
 * Opt-in per conversieactie via een environment variable met het
 * conversielabel. Zonder label is dit een stille no-op: de basistag blijft
 * remarketing meten, er wordt alleen geen conversie geteld.
 *
 * Waar haal je een label vandaan? Google Ads → Doelen → Conversies → je
 * conversieactie → Tag instellen → "De tag zelf installeren". In het
 * gebeurtenis-snippet staat:
 *
 *   gtag('event', 'conversion', {'send_to': 'AW-18397549973/AbC-D_efGhIjKl'});
 *                                            └─ ID ──────┘ └── label ────┘
 *
 * Het stuk ná de schuine streep is de waarde van de variabele. Plak je per
 * ongeluk de hele send_to-string, dan knipt normalizeLabel() het label er
 * alsnog uit — zie GOOGLE_ADS_SETUP.md voor het volledige recept.
 */

import type { TrackingEvent } from "./types";

export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() || "AW-18397549973";

/* Canoniek eventnaam → ruwe env-waarde. NEXT_PUBLIC_* wordt tijdens de build
 * letterlijk vervangen, dus deze verwijzingen moeten statisch blijven staan. */
const RAW_LABELS: Record<string, string | undefined> = {
  Lead: process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL,
  Purchase: process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL,
  Subscribe: process.env.NEXT_PUBLIC_GOOGLE_ADS_SUBSCRIBE_LABEL,
};

/* Accepteert zowel het kale label als een geplakt 'AW-123/label' of het hele
 * send_to-fragment inclusief aanhalingstekens. Levert "" bij onbruikbare input. */
function normalizeLabel(raw: string | undefined): string {
  if (!raw) return "";
  let v = raw.trim().replace(/^['"]|['"]$/g, "").trim();
  if (v.includes("/")) v = v.slice(v.lastIndexOf("/") + 1).trim();
  /* Een los AW-ID zonder label is geen conversie — negeren i.p.v. een
   * kapotte send_to versturen. */
  if (!v || /^AW-/i.test(v)) return "";
  return v;
}

/* Al genormaliseerd bij module-load: de labels veranderen niet tijdens runtime. */
const LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(RAW_LABELS)
    .map(([event, raw]) => [event, normalizeLabel(raw)])
    .filter(([, label]) => label !== ""),
);

/* De basistag definieert gtag zelf, maar kan later laden dan het eerste event
 * (strategy="afterInteractive"). Een shim op dezelfde dataLayer bewaart de
 * aanroep dan tot gtag.js hem oppikt — identiek aan ensureGa4Loaded(). */
function ensureGtag(): boolean {
  if (typeof window === "undefined") return false;
  if (typeof window.gtag !== "function") {
    window.dataLayer = window.dataLayer ?? [];
    window.gtag = (...args: unknown[]) => {
      window.dataLayer.push(args as unknown as Record<string, unknown>);
    };
  }
  return true;
}

export function fireGoogleAdsConversion(payload: TrackingEvent): void {
  const label = LABELS[payload.event];
  if (!label) return;

  /* Advertentiecookies vallen onder de marketing-categorie, net als de Meta
   * Pixel. Zonder toestemming staat ad_storage via Consent Mode v2 al op
   * 'denied'; deze check voorkomt dat we de call überhaupt doen. */
  if (!payload.consent_snapshot.marketing) return;
  if (!ensureGtag()) return;

  const params: Record<string, unknown> = {
    send_to: `${GOOGLE_ADS_ID}/${label}`,
    /* Voorkomt dubbeltellen als dezelfde pagina opnieuw geladen wordt: Google
     * Ads ontdubbelt op transaction_id. Purchase heeft er zelf een, de rest
     * valt terug op het event_id dat ook Meta/CAPI gebruikt. */
    transaction_id: payload.ecommerce?.transaction_id ?? payload.event_id,
  };

  if (payload.ecommerce?.value !== undefined) params.value = payload.ecommerce.value;
  if (payload.ecommerce?.currency) params.currency = payload.ecommerce.currency;

  window.gtag!("event", "conversion", params);
}
