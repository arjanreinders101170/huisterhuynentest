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
 *
 * Consent: gated op de categorie `marketing`, net als de Meta Pixel. Consent
 * Mode v2 staat standaard op denied, dus zonder toestemming wordt er hooguit
 * een cookieloze, gemodelleerde conversie geteld.
 */

import type { TrackingEvent } from "./types";

export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() || "AW-18397549973";

/* Canoniek eventnaam → ruwe env-waarde. NEXT_PUBLIC_* wordt tijdens de build
 * letterlijk vervangen, dus deze verwijzingen moeten statisch blijven staan.
 * Lead en Purchase zijn de biedbare conversies; InitiateCheckout, Contact en
 * Subscribe horen in Ads op *secundair*, anders telt dezelfde aanvraag dubbel
 * en stuurt de biedstrategie op de verkeerde stap. */
const RAW_LABELS: Record<string, string | undefined> = {
  Lead: process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL,
  Purchase: process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL,
  Subscribe: process.env.NEXT_PUBLIC_GOOGLE_ADS_SUBSCRIBE_LABEL,
  InitiateCheckout: process.env.NEXT_PUBLIC_GOOGLE_ADS_CHECKOUT_LABEL,
  Contact: process.env.NEXT_PUBLIC_GOOGLE_ADS_CONTACT_LABEL,
};

/* Verbeterde conversies: standaard uit. Aanzetten heeft alleen zin als de
 * instelling óók in Google Ads aanstaat (Doelen → Instellingen → Verbeterde
 * conversies → "Verbeterde conversies voor leads", methode Google-tag), en de
 * privacyverklaring het delen van een gehasht e-mailadres met Google noemt.
 * Beide staan beschreven in GOOGLE_ADS_SETUP.md. */
const ENHANCED = process.env.NEXT_PUBLIC_GOOGLE_ADS_ENHANCED === "1";

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
function ensureGtag(): ((...args: unknown[]) => void) | null {
  if (typeof window === "undefined") return null;
  if (typeof window.gtag !== "function") {
    window.dataLayer = window.dataLayer ?? [];
    window.gtag = (...args: unknown[]) => {
      window.dataLayer.push(args as unknown as Record<string, unknown>);
    };
  }
  return window.gtag!;
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

function conversionParams(payload: TrackingEvent, label: string): Record<string, unknown> {
  const params: Record<string, unknown> = {
    send_to: `${GOOGLE_ADS_ID}/${label}`,
    /* Voorkomt dubbeltellen als dezelfde pagina opnieuw geladen wordt: Google
     * Ads ontdubbelt op transaction_id. Purchase heeft er zelf een, de rest
     * valt terug op het event_id dat ook Meta/CAPI gebruikt. */
    transaction_id: payload.ecommerce?.transaction_id ?? payload.event_id,
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
  const label = LABELS[payload.event];
  if (!label) return;

  /* Advertentiecookies vallen onder de marketing-categorie, net als de Meta
   * Pixel. Zonder toestemming staat ad_storage via Consent Mode v2 al op
   * 'denied'; deze check voorkomt dat we de call überhaupt doen. */
  if (!payload.consent_snapshot.marketing) return;

  const gtag = ensureGtag();
  if (!gtag) return;

  const params = conversionParams(payload, label);
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
