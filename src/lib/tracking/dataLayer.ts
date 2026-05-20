/* ═══ DataLayer helpers — client only ═══
 * Every browser event flows through pushEvent(). Each event gets a UUID
 * event_id that the server-side CAPI call reuses for deduplication.
 */

import type { BaseEvent, Locale, TrackingEvent } from "./types";
import { getConsentSnapshot } from "./consent";

const ANON_KEY = "hth-aid";
const USER_CACHE_KEY = "hth-user-ctx";
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/* ── fbq types ── */
type FbqArgs = [string, ...unknown[]];
interface FbqFunction {
  (...args: FbqArgs): void;
  callMethod?: (...args: FbqArgs) => void;
  queue: FbqArgs[];
  push: FbqFunction;
  loaded: boolean;
  version: string;
}
declare global {
  interface Window {
    fbq: FbqFunction;
    _fbq?: FbqFunction;
  }
}

/* Standard Meta Pixel event names (use fbq('track',...)); rest use fbq('trackCustom',...) */
const PIXEL_STANDARD_EVENTS = new Set([
  "PageView", "ViewContent", "InitiateCheckout", "Purchase",
  "Contact", "Lead", "Subscribe",
]);

/* Sets up the fbq queue and loads fbevents.js if not already done.
 * Returns true when fbq is available (either just set up or already existed). */
function ensurePixelLoaded(): boolean {
  if (!PIXEL_ID || typeof window === "undefined") return false;
  if (typeof window.fbq === "function") return true;

  const n: FbqFunction = function (...args: FbqArgs) {
    if (n.callMethod) n.callMethod.apply(n, args);
    else n.queue.push(args);
  };
  n.push = n;
  n.loaded = true;
  n.version = "2.0";
  n.queue = [];
  if (!window._fbq) window._fbq = n;
  window.fbq = n;

  const s = document.createElement("script");
  s.async = true;
  s.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(s);

  window.fbq("init", PIXEL_ID);
  return true;
}

/* Called from MetaPixel component on consent grant — ensures pixel is loaded
 * so the first pushEvent() call doesn't have to set it up itself. */
export function initMetaPixel(): void {
  ensurePixelLoaded();
}

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

/* Persist raw user PII so later events (ViewContent, AvailabilityCheck) can
 * include name + email signals even before the user re-enters the form. */
export function saveUserCache(user: { em?: string; fn?: string; ln?: string }): void {
  if (typeof window === "undefined") return;
  try {
    const clean: Record<string, string> = {};
    if (user.em) clean.em = user.em;
    if (user.fn) clean.fn = user.fn;
    if (user.ln) clean.ln = user.ln;
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(clean));
  } catch { /* storage unavailable */ }
}

function readUserCache(): { em?: string; fn?: string; ln?: string } {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY);
    if (!raw) return {};
    const p = JSON.parse(raw);
    return {
      em: typeof p.em === "string" ? p.em : undefined,
      fn: typeof p.fn === "string" ? p.fn : undefined,
      ln: typeof p.ln === "string" ? p.ln : undefined,
    };
  } catch { return {}; }
}

function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "nl";
  const lang = (navigator.language || "nl").toLowerCase();
  return lang.startsWith("de") ? "de" : "nl";
}

export function baseEnvelope(eventName: string): Pick<BaseEvent, "event" | "event_id" | "event_time" | "page" | "consent_snapshot" | "user"> {
  const locale = detectLocale();
  const country = locale === "de" ? "DE" as const : "NL" as const;
  const cached = readUserCache();
  return {
    event: eventName,
    event_id: newEventId(),
    event_time: Math.floor(Date.now() / 1000),
    page: {
      path: typeof location !== "undefined" ? location.pathname + location.search : "/",
      title: typeof document !== "undefined" ? document.title : "",
      locale,
    },
    consent_snapshot: getConsentSnapshot(),
    user: { external_id: getAnonymousId(), country, ...cached },
  };
}

function firePixelEvent(payload: TrackingEvent): void {
  if (!payload.consent_snapshot.marketing) return;
  /* Ensure pixel is loaded — handles the case where pushEvent fires before
   * MetaPixel's useEffect has run, or when fbq was never set up at all. */
  if (!ensurePixelLoaded()) return;

  const customData = buildPixelCustomData(payload);
  const options = { eventID: payload.event_id };

  if (PIXEL_STANDARD_EVENTS.has(payload.event)) {
    window.fbq("track", payload.event, customData, options);
  } else {
    window.fbq("trackCustom", payload.event, customData, options);
  }
}

function buildPixelCustomData(payload: TrackingEvent): Record<string, unknown> {
  const d: Record<string, unknown> = {};
  if (payload.ecommerce) {
    if (payload.ecommerce.value !== undefined) d.value = payload.ecommerce.value;
    if (payload.ecommerce.currency) d.currency = payload.ecommerce.currency;
    if (payload.ecommerce.content_ids) d.content_ids = payload.ecommerce.content_ids;
    if (payload.ecommerce.content_type) d.content_type = payload.ecommerce.content_type;
    if (payload.ecommerce.content_name) d.content_name = payload.ecommerce.content_name;
    if (payload.ecommerce.num_items !== undefined) d.num_items = payload.ecommerce.num_items;
  }
  if (payload.booking) {
    d.checkin_date = payload.booking.check_in;
    d.checkout_date = payload.booking.check_out;
    d.num_nights = payload.booking.nights;
    if (payload.booking.guests !== undefined) d.num_adults = payload.booking.guests;
  }
  return d;
}

export function pushEvent(payload: TrackingEvent): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload as unknown as Record<string, unknown>);

  /* Fire browser pixel directly — no GTM tag required for deduplication. */
  firePixelEvent(payload);

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
