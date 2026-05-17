/* ═══ Meta Pixel + Conversions API event types ═══
 * Canonical shape for every event that travels through window.dataLayer.
 * Pixel tags (in GTM) and the CAPI server route both read from this shape,
 * so adding a field here = it's available everywhere.
 */

export type Currency = "EUR";
export type LodgeId = "lodge_1" | "lodge_2";
export type Locale = "nl" | "de";

export type ConsentCategory = "functional" | "statistics" | "marketing";
export type ConsentState = Record<ConsentCategory, boolean>;

export interface ConsentSnapshot {
  statistics: boolean;
  marketing: boolean;
}

export interface PageContext {
  path: string;
  title: string;
  locale: Locale;
}

export interface UserContext {
  /* raw values — server hashes them before forwarding to Meta */
  em?: string;
  ph?: string;
  fn?: string;
  ln?: string;
  country?: "NL" | "DE";
  external_id?: string;
}

export interface BaseEvent {
  event: string;
  event_id: string;
  event_time: number;
  page: PageContext;
  consent_snapshot: ConsentSnapshot;
  user?: UserContext;
}

export interface EcommerceData {
  content_type?: "lodge" | "product";
  content_ids?: string[];
  content_name?: string;
  content_category?: string;
  currency?: Currency;
  value?: number;
  num_items?: number;
  transaction_id?: string;
}

export interface BookingData {
  check_in: string;
  check_out: string;
  lodge: LodgeId;
  nights: number;
  guests?: number;
  total?: number;
}

export interface ContactData {
  method: "whatsapp" | "phone" | "email";
  destination: string;
  label?: string;
}

export interface OutboundData {
  url: string;
  lodge?: string | null;
}

export interface LeadData {
  form: string;
  value?: number;
}

export interface SubscriptionData {
  source: string;
}

export type TrackingEvent = BaseEvent & {
  ecommerce?: EcommerceData;
  booking?: BookingData;
  contact?: ContactData;
  outbound?: OutboundData;
  lead?: LeadData;
  subscription?: SubscriptionData;
};
