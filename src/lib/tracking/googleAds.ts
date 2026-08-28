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

/* Verbeterde conversies: standaard uit. Aanzetten heeft alleen zin als de
 * instelling óók in Google Ads aanstaat (Doelen → Instellingen → Verbeterde
 * conversies → "Verbeterde conversies voor leads", methode Google-tag), en de
 * privacyverklaring het delen van een gehasht e-mailadres met Google noemt.
 * Beide staan beschreven in ANALYTICS_SETUP.md. */
const ENHANCED = process.env.NEXT_PUBLIC_GOOGLE_ADS_ENHANCED === "1";

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

/* Google's normalisatie voor een e-mailadres vóór het hashen: spaties eraf,
 * alles naar kleine letters. Hoofdletters of een spatie die de gast in het
 * formulier plakte, leveren anders een hash die nooit matcht. */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/* SHA-256 in hex via Web Crypto. Bewust niet lib/tracking/hash.ts: dat draait
 * op node:crypto en is server-only. crypto.subtle bestaat alleen in een secure
 * context (https, of localhost); ontbreekt het, dan gaat de conversie zonder
 * e-mailadres weg — nooit in platte tekst. */
async function sha256Hex(value: string): Promise<string | null> {
  const subtle = typeof crypto !== "undefined" ? crypto.subtle : undefined;
  if (!subtle) return null;
  const bytes = new TextEncoder().encode(value);
  const digest = await subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function conversionParams(payload: TrackingEvent): Record<string, unknown> {
  const params: Record<string, unknown> = {
    send_to: `${ADS_ID}/${CONVERSION_LABELS[payload.event]!.trim()}`,
    /* Dedupliceert dubbele vuringen van dezelfde aanvraag/betaling: een
     * herlaadde bedanktpagina telt dan niet als tweede conversie. */
    transaction_id: payload.event_id,
  };
  /* Alleen een échte waarde meesturen. De aanvraagformulieren zonder prijs
   * (RequestForm, RequestFormDE) zetten value op 0, en een conversie van €0
   * vertelt "Conversiewaarde maximaliseren" dat die aanvraag niets waard is.
   * Laten we het veld weg, dan gebruikt Ads de standaardwaarde die bij de
   * conversieactie staat ingesteld. */
  const value = payload.ecommerce?.value;
  if (typeof value === "number" && value > 0) {
    params.value = value;
    params.currency = payload.ecommerce?.currency ?? "EUR";
  }
  return params;
}

export function fireGoogleAdsConversion(payload: TrackingEvent): void {
  const label = CONVERSION_LABELS[payload.event]?.trim();
  if (!label) return;
  if (!payload.consent_snapshot.marketing) return;

  const gtag = ensureGtag();
  if (!gtag) return;

  const params = conversionParams(payload);
  const email = payload.user?.em;

  if (!ENHANCED || !email) {
    gtag("event", "conversion", params);
    return;
  }

  /* Verbeterde conversies: het gehashte e-mailadres moet vóór het
   * conversie-event bekend zijn, dus de vuring hangt aan de hash. Hashen kost
   * een fractie van een milliseconde en gebeurt op de bedanktpagina of direct
   * na een verzonden formulier — de bezoeker navigeert daar niet meteen weg.
   * Mislukt het hashen, dan gaat de conversie alsnog weg, alleen zonder
   * e-mailadres: een gemeten conversie zonder match is beter dan geen. */
  sha256Hex(normalizeEmail(email))
    .then((hash) => {
      if (hash) gtag("set", "user_data", { sha256_email_address: hash });
      gtag("event", "conversion", params);
    })
    .catch(() => {
      gtag("event", "conversion", params);
    });
}
