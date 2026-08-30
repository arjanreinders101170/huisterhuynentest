import Script from "next/script";

/* ═══ Google Ads (gtag.js) ═══
 * De tag die Google Ads teruggaf bij het aanmaken van de advertentie. Het ID
 * staat hier als default zodat de tag ook zonder extra Vercel-variabele meegaat;
 * een ingevulde NEXT_PUBLIC_GOOGLE_ADS_ID overschrijft hem. Een lege variabele
 * telt bewust niet als "uit" — .env.local.example wordt gekopieerd met lege
 * waarden, en dat mag de tag niet stilletjes uitzetten.
 *
 * Consent: de tag laadt onvoorwaardelijk, net als GTM, maar <ConsentBootstrap />
 * heeft ad_storage / ad_user_data / ad_personalization dan al op 'denied' gezet.
 * gtag.js zet dus geen advertentiecookie tot de bezoeker in de cookiebanner op
 * marketing klikt; die klik stuurt via applyConsentToDataLayer() een
 * consent-update en pas dán begint het meten. Dat is meteen wat Google Ads als
 * Consent Mode v2 verwacht voor conversiemodellering.
 *
 * Let op: dit is alleen de basistag (remarketing + pagina's). De conversies
 * zelf vuren via pushEvent() → fireGoogleAdsConversion() in
 * src/lib/tracking/googleAds.ts, zodra daar een conversielabel is ingevuld.
 * Zie GOOGLE_ADS_SETUP.md voor waar dat label vandaan komt.
 */
import { GOOGLE_ADS_ID } from "@/lib/tracking/googleAds";

export function GoogleAds() {
  return (
    <>
      <Script
        id="google-ads-src"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
      />
      <Script id="google-ads-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GOOGLE_ADS_ID}');`}
      </Script>
    </>
  );
}
