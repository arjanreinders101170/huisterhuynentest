import Script from "next/script";
import { CONSENT_DEFAULT_DENY_SNIPPET, consentReplaySnippet } from "@/lib/tracking/consent";

const CONSENT_VERSION = process.env.NEXT_PUBLIC_CONSENT_VERSION ?? "1";

/* ═══ Consent Mode v2 — bootstrap ═══
 * Stond eerder binnenin <GTM />, waardoor de default-deny alléén meeging als
 * NEXT_PUBLIC_GTM_ID gezet was. Sinds de Google Ads-tag rechtstreeks laadt
 * (los van GTM) moet deze bootstrap er altijd zijn: hij definieert de globale
 * gtag()-functie en zet elke opslagcategorie op 'denied' vóórdat welke
 * Google-tag dan ook een cookie kan zetten.
 *
 * Beide scripts draaien met strategy="beforeInteractive", dus ze staan
 * gegarandeerd vóór de gtag.js- en gtm.js-loaders (afterInteractive) in de
 * uitvoervolgorde.
 */
export function ConsentBootstrap() {
  return (
    <>
      {/* Default-deny — moet draaien vóór elke Google-loader */}
      <Script id="consent-default" strategy="beforeInteractive">
        {CONSENT_DEFAULT_DENY_SNIPPET}
      </Script>
      {/* Opgeslagen keuze meteen terugspelen, zodat het wait_for_update-venster
          niet verloopt terwijl React nog aan het hydrateren is */}
      <Script id="consent-replay" strategy="beforeInteractive">
        {consentReplaySnippet(CONSENT_VERSION)}
      </Script>
    </>
  );
}
