/* ═══ Google Ads conversies (gtag.js) — client only ═══
 * Zelfde patroon als ga4.ts: elk event loopt via pushEvent(), en hier wordt
 * bepaald of er ook een conversie naar Google Ads moet.
 *
 * De basistag (src/components/tracking/GoogleAds.tsx) meet alleen pageviews en
 * remarketing. Een conversie vraagt om een conversielabel uit Google Ads
 * (Doelen → Conversies → conversieactie → tag instellen). Dat label ziet eruit
 * als "AbC-D_efGhIjK" en hoort bij één conversieactie. Zet het in de bijbehorende
 * NEXT_PUBLIC_GOOGLE_ADS_LABEL_*-variabele en het event vuurt vanzelf mee.
 *
 * Zonder label is dit bestand een stille no-op — precies zoals het nu draait.
 *
 * Consent: gated op de categorie `marketing`, net als de Meta Pixel. Consent
 * Mode v2 staat standaard op denied (CONSENT_DEFAULT_DENY_SNIPPET), dus zonder
 * toestemming wordt er hooguit een cookieloze, gemodelleerde conversie geteld.
 */

import type { TrackingEvent } from "./types";

const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() || "AW-18397549973";

/* Canonieke eventnaam → conversielabel. Next inlinet NEXT_PUBLIC_*-variabelen
 * alleen bij letterlijke member-access, dus deze uitgeschreven vorm is nodig. */
const CONVERSION_LABELS: Record<string, string | undefined> = {
  Lead: process.env.NEXT_PUBLIC_GOOGLE_ADS_LABEL_LEAD,
  Purchase: process.env.NEXT_PUBLIC_GOOGLE_ADS_LABEL_PURCHASE,
  InitiateCheckout: process.env.NEXT_PUBLIC_GOOGLE_ADS_LABEL_CHECKOUT,
  Contact: process.env.NEXT_PUBLIC_GOOGLE_ADS_LABEL_CONTACT,
};

/* gtag() wordt normaal al globaal gezet door het consent-default-deny-snippet
 * en door GoogleAds.tsx. Valt dat weg, dan is een push naar de dataLayer in
 * gtag-Arguments-formaat gelijkwaardig: gtag.js leest die queue alsnog uit. */
function ensureGtag(): ((...args: unknown[]) => void) | null {
  if (typeof window === "undefined") return null;
  if (typeof window.gtag === "function") return window.gtag;
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = (...args: unknown[]) => {
    window.dataLayer.push(args as unknown as Record<string, unknown>);
  };
  return window.gtag;
}

export function fireGoogleAdsConversion(payload: TrackingEvent): void {
  const label = CONVERSION_LABELS[payload.event]?.trim();
  if (!label) return;
  if (!payload.consent_snapshot.marketing) return;

  const gtag = ensureGtag();
  if (!gtag) return;

  const params: Record<string, unknown> = {
    send_to: `${ADS_ID}/${label}`,
    /* Dedupliceert dubbele vuringen van dezelfde aanvraag/betaling: een
     * herlaadde bedanktpagina telt dan niet als tweede conversie. */
    transaction_id: payload.event_id,
  };
  if (payload.ecommerce?.value !== undefined) {
    params.value = payload.ecommerce.value;
    params.currency = payload.ecommerce.currency ?? "EUR";
  }

  gtag("event", "conversion", params);
}
