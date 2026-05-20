import Script from "next/script";
import { CONSENT_DEFAULT_DENY_SNIPPET, consentReplaySnippet } from "@/lib/tracking/consent";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const SGTM = process.env.NEXT_PUBLIC_SGTM_URL;
const CONSENT_VERSION = process.env.NEXT_PUBLIC_CONSENT_VERSION ?? "1";

function gtmSrc(): string {
  if (SGTM) return `${SGTM}/gtm.js?id=${GTM_ID}`;
  return `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
}

function noscriptSrc(): string {
  if (SGTM) return `${SGTM}/ns.html?id=${GTM_ID}`;
  return `https://www.googletagmanager.com/ns.html?id=${GTM_ID}`;
}

export function GTM() {
  if (!GTM_ID) return null;
  const src = gtmSrc();
  return (
    <>
      {/* Consent Mode v2 default-deny — must run before gtm.js */}
      <Script id="consent-default" strategy="beforeInteractive">
        {CONSENT_DEFAULT_DENY_SNIPPET}
      </Script>
      {/* Replay stored consent immediately so GTM doesn't time out waiting for React */}
      <Script id="consent-replay" strategy="beforeInteractive">
        {consentReplaySnippet(CONSENT_VERSION)}
      </Script>
      {/* GTM loader */}
      <Script id="gtm-init" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='${src}'+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
      </Script>
    </>
  );
}

export function GTMNoscript() {
  if (!GTM_ID) return null;
  return (
    <noscript>
      <iframe
        src={noscriptSrc()}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
}
