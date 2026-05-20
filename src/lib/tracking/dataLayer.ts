/* ═══ DataLayer helpers — client only ═══
 * Every browser event flows through pushEvent(). Each event gets a UUID
 * event_id that the server-side CAPI call reuses for deduplication.
 */

import type { BaseEvent, Locale, TrackingEvent } from "./types";
import { getConsentSnapshot } from "./consent";

const ANON_KEY = "hth-aid";
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
let _pixelInitialPageViewDone = false;

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

export function initMetaPixel(): void {
  if (!PIXEL_ID || typeof window === "undefined") return;
  if (typeof window.fbq === "function") return;

  /* Standard Meta Pixel base code — queues calls until fbevents.js loads. */
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
  /* Standard pattern: fire PageView immediately after init so the initial
   * page load is always tracked, regardless of React effect order. */
  window.fbq("track", "PageView");
}

function firePixelEvent(payload: TrackingEvent): void {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  if (!payload.consent_snapshot.marketing) return;
  /* Skip PageView on initial load — initMetaPixel() already fires it as part
   * of the standard init+PageView pattern. Subsequent route-change PageViews
   * (path changed) still go through here. */
  if (payload.event === "PageView" && !_pixelInitialPageViewDone) {
    _pixelInitialPageViewDone = true;
    return;
  }

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
