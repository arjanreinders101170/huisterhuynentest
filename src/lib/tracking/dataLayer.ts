/* ═══ DataLayer helpers — client only ═══
 * Every browser event flows through pushEvent(). Each event gets a UUID
 * event_id that the server-side CAPI call reuses for deduplication.
 */

import type { BaseEvent, Locale, TrackingEvent } from "./types";
import { getConsentSnapshot } from "./consent";

const ANON_KEY = "hth-aid";

export function newEventId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  /* RFC4122 v4 fallback for very old browsers (browserslist allows none, but defensive). */
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getAnonymousId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(ANON_KEY);
  if (!id) {
    id = newEventId();
    localStorage.setItem(ANON_KEY, id);
  }
  return id;
}

function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "nl";
  const lang = (navigator.language || "nl").toLowerCase();
  return lang.startsWith("de") ? "de" : "nl";
}

export function baseEnvelope(eventName: string): Pick<BaseEvent, "event" | "event_id" | "event_time" | "page" | "consent_snapshot" | "user"> {
  return {
    event: eventName,
    event_id: newEventId(),
    event_time: Math.floor(Date.now() / 1000),
    page: {
      path: typeof location !== "undefined" ? location.pathname + location.search : "/",
      title: typeof document !== "undefined" ? document.title : "",
      locale: detectLocale(),
    },
    consent_snapshot: getConsentSnapshot(),
    user: { external_id: getAnonymousId() },
  };
}

export function pushEvent(payload: TrackingEvent): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload as unknown as Record<string, unknown>);

  /* Mirror to server-side CAPI for events that need it.
   * Pixel itself is fired by GTM listening to the same dataLayer.push. */
  if (shouldMirrorToCapi(payload)) {
    fireCapi(payload);
  }
}

const CAPI_EVENTS = new Set([
  "PageView",
  "ViewContent",
  "LodgeView",
  "AvailabilityCheck",
  "InitiateCheckout",
  "Purchase",
  "Contact",
  "Lead",
  "BookingComRedirect",
  "Subscribe",
]);

function shouldMirrorToCapi(payload: TrackingEvent): boolean {
  if (!CAPI_EVENTS.has(payload.event)) return false;
  if (!payload.consent_snapshot.marketing) return false;
  return true;
}

function fireCapi(payload: TrackingEvent): void {
  try {
    const body = JSON.stringify(payload);
    /* sendBeacon is fire-and-forget and survives unload — ideal for outbound clicks. */
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      const ok = navigator.sendBeacon("/api/meta/capi", blob);
      if (ok) return;
    }
    void fetch("/api/meta/capi", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    /* swallow — tracking must never break the app */
  }
}
