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
 * Let op: dit is alleen de basistag (remarketing + pagina's). Een conversie
 * meten vraagt daarnaast om een conversielabel uit Google Ads
 * (gtag('event','conversion',{send_to:'AW-…/…'})); dat label is er nog niet.
 */
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID?.trim() || "AW-18397549973";

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
