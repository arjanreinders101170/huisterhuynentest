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
  pushConsentUpdate(normalized);
}

export function getConsentSnapshot(): ConsentSnapshot {
  const { state } = readConsent();
  return { statistics: state.statistics, marketing: state.marketing };
}

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

function pushConsentUpdate(state: ConsentState): void {
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({
    event: "consent_update",
    consent: {
      ad_storage: state.marketing ? "granted" : "denied",
      ad_user_data: state.marketing ? "granted" : "denied",
      ad_personalization: state.marketing ? "granted" : "denied",
      analytics_storage: state.statistics ? "granted" : "denied",
      functionality_storage: "granted",
      security_storage: "granted",
    },
  });
}

/* Inline snippet — must run before GTM loads so default-deny is in place
 * before any tag would otherwise fire. Loaded with strategy="beforeInteractive". */
export const CONSENT_DEFAULT_DENY_SNIPPET = `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('consent','default',{
    ad_storage:'denied', ad_user_data:'denied', ad_personalization:'denied',
    analytics_storage:'denied', functionality_storage:'granted',
    security_storage:'granted', wait_for_update:500,
    region:['NL','DE','EEA']
  });
`;
