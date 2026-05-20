/* ═══ Cookie consent state machine ═══
 * GDPR (NL) + TTDSG §25 (DE) compliant.
 * Three categories, functional always-on, statistics + marketing opt-in.
 * Writes to localStorage and pushes Google Consent Mode v2 signals.
 */

import type { ConsentState, ConsentSnapshot } from "./types";

const KEY = "hth-consent-v2";
const VERSION = process.env.NEXT_PUBLIC_CONSENT_VERSION ?? "1";

export const DEFAULT_CONSENT: ConsentState = {
  functional: true,
  statistics: false,
  marketing: false,
};

export function readConsent(): { state: ConsentState; decided: boolean } {
  if (typeof window === "undefined") return { state: DEFAULT_CONSENT, decided: false };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { state: DEFAULT_CONSENT, decided: false };
    const parsed = JSON.parse(raw) as { v?: string; state?: Partial<ConsentState> };
    if (parsed.v !== VERSION) return { state: DEFAULT_CONSENT, decided: false };
    return {
      state: { ...DEFAULT_CONSENT, ...(parsed.state ?? {}), functional: true },
      decided: true,
    };
  } catch {
    return { state: DEFAULT_CONSENT, decided: false };
  }
}

export function writeConsent(state: ConsentState): void {
  if (typeof window === "undefined") return;
  const normalized: ConsentState = { ...state, functional: true };
  localStorage.setItem(KEY, JSON.stringify({ v: VERSION, state: normalized, ts: Date.now() }));
  window.dispatchEvent(new CustomEvent("hth:consent-change", { detail: normalized }));
  applyConsentToDataLayer(normalized);
}

export function getConsentSnapshot(): ConsentSnapshot {
  const { state } = readConsent();
  return { statistics: state.statistics, marketing: state.marketing };
}

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function applyConsentToDataLayer(state: ConsentState): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];

  const consentValues = {
    ad_storage: state.marketing ? "granted" : "denied",
    ad_user_data: state.marketing ? "granted" : "denied",
    ad_personalization: state.marketing ? "granted" : "denied",
    analytics_storage: state.statistics ? "granted" : "denied",
    functionality_storage: "granted",
    security_storage: "granted",
  };

  /* Consent Mode v2 update — GTM only recognises consent commands pushed in
   * the gtag-Arguments format. The gtag function was defined globally by
   * CONSENT_DEFAULT_DENY_SNIPPET; we call it directly so GTM updates its
   * internal consent state and tags requiring ad_storage start firing. */
  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", consentValues);
  } else {
    /* Fallback: push the array literally — GTM iterates array-like dataLayer
     * entries and dispatches them as commands the same way Arguments objects
     * are processed. */
    window.dataLayer.push(["consent", "update", consentValues] as unknown as Record<string, unknown>);
  }

  /* Custom event so our own client-side code (e.g. pushEvent gating) can
   * react to consent changes. */
  window.dataLayer.push({ event: "consent_update", consent: consentValues });
}

/* Inline snippet — must run before GTM loads so default-deny is in place
 * before any tag would otherwise fire. Loaded with strategy="beforeInteractive". */
export const CONSENT_DEFAULT_DENY_SNIPPET = `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('consent','default',{
    ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied',
    analytics_storage:'denied', functionality_storage:'granted',
    security_storage:'granted', wait_for_update:2000,
    region:['NL','DE','EEA']
  });
`;

/* Reads stored consent from localStorage and immediately replays it as a
 * consent update so GTM sees the correct state before it finishes loading.
 * This prevents the wait_for_update window from expiring before React hydrates. */
export function consentReplaySnippet(version: string): string {
  return `(function(){
  try {
    var raw = localStorage.getItem('hth-consent-v2');
    if (!raw) return;
    var p = JSON.parse(raw);
    if (p.v !== '${version}' || !p.state) return;
    var s = p.state;
    var vals = {
      ad_storage: s.marketing ? 'granted' : 'denied',
      ad_user_data: s.marketing ? 'granted' : 'denied',
      ad_personalization: s.marketing ? 'granted' : 'denied',
      analytics_storage: s.statistics ? 'granted' : 'denied',
      functionality_storage: 'granted',
      security_storage: 'granted'
    };
    if (typeof gtag === 'function') {
      gtag('consent', 'update', vals);
    } else {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(['consent', 'update', vals]);
    }
  } catch(e) {}
})();`;
}
