/* ═══ GA4 (gtag.js) — client only ═══
 * Mirrors the Meta Pixel approach in dataLayer.ts: every event flows through
 * pushEvent(), which fires GA4 directly (no GTM tag required). Opt-in via
 * NEXT_PUBLIC_GA4_ID — if unset this is a silent no-op.
 *
 * EITHER use this direct integration (set NEXT_PUBLIC_GA4_ID and do NOT add a
 * GA4 config tag in GTM) OR configure GA4 inside the GTM container (leave the
 * env var unset). Using both double-counts page_views.
 *
 * Consent: gated on the `statistics` category. Consent Mode v2 defaults are
 * already installed by CONSENT_DEFAULT_DENY_SNIPPET, so analytics_storage is
 * honoured regardless.
 */

import type { TrackingEvent } from "./types";

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;
let loaded = false;

/* Canonical event name → GA4 event name. Unmapped names pass through as-is. */
const GA4_EVENT_MAP: Record<string, string> = {
  ViewContent: "view_item",
  LodgeView: "select_item",
  AvailabilityCheck: "availability_check",
  InitiateCheckout: "begin_checkout",
  Lead: "generate_lead",
  Purchase: "purchase",
  Contact: "contact",
  Subscribe: "newsletter_subscribe",
  BookingComRedirect: "outbound_ota",
};

function ensureGa4Loaded(): boolean {
  if (!GA4_ID || typeof window === "undefined") return false;
  if (loaded) return typeof window.gtag === "function";

  /* gtag is normally defined by the consent default-deny snippet; define a
   * minimal shim if GA4 is used without GTM present. */
  if (typeof window.gtag !== "function") {
    window.dataLayer = window.dataLayer ?? [];
    window.gtag = (...args: unknown[]) => {
      window.dataLayer.push(args as unknown as Record<string, unknown>);
    };
  }

  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(s);

  /* Enhanced Measurement handles page_view (initial load via config, SPA
   * navigations via history events). We deliberately do NOT also send a
   * manual page_view (see fireGa4Event) to avoid double-counting. */
  window.gtag!("js", new Date());
  window.gtag!("config", GA4_ID);

  loaded = true;
  return true;
}

export function fireGa4Event(payload: TrackingEvent): void {
  if (!GA4_ID) return;
  if (!payload.consent_snapshot.statistics) return;
  if (!ensureGa4Loaded()) return;

  /* page_view is covered by the GA4 tag + Enhanced Measurement (initial via
   * config, SPA navigations via history events), so skip the canonical
   * PageView here to avoid double-counting. */
  if (payload.event === "PageView") return;

  const name = GA4_EVENT_MAP[payload.event] ?? payload.event;
  const params: Record<string, unknown> = {
    page_location: payload.page.path,
    page_title: payload.page.title,
    language: payload.page.locale,
  };

  if (payload.ecommerce) {
    const e = payload.ecommerce;
    if (e.value !== undefined) params.value = e.value;
    if (e.currency) params.currency = e.currency;
    if (e.transaction_id) params.transaction_id = e.transaction_id;
    if (e.content_ids?.length) {
      params.items = e.content_ids.map((id) => ({
        item_id: id,
        item_name: e.content_name,
        item_category: e.content_category ?? e.content_type,
      }));
    }
  }
  if (payload.booking) {
    params.checkin_date = payload.booking.check_in;
    params.checkout_date = payload.booking.check_out;
    params.num_nights = payload.booking.nights;
  }
  if (payload.contact) params.contact_method = payload.contact.method;
  if (payload.outbound) params.outbound_url = payload.outbound.url;
  if (payload.subscription) params.source = payload.subscription.source;
  if (payload.lead) params.form = payload.lead.form;

  window.gtag!("event", name, params);
}
