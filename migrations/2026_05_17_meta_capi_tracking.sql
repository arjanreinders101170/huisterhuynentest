-- Meta Pixel + Conversions API tracking columns
-- Doel: deduplicatie tussen browser- en server-events overleeft een tab-close.
-- We slaan event_id + fbp/fbc/anonymous_id op bij de aanvraag, zodat de
-- Mollie webhook (server-of-record voor Purchase) hetzelfde event_id kan
-- terugsturen naar Meta CAPI.

alter table booking_requests
  add column if not exists meta_event_id text,
  add column if not exists anonymous_id  text,
  add column if not exists fbp           text,
  add column if not exists fbc           text;

create index if not exists booking_requests_meta_event_id_idx
  on booking_requests (meta_event_id)
  where meta_event_id is not null;

comment on column booking_requests.meta_event_id is
  'UUID gegenereerd in browser bij InitiateCheckout. Wordt door /api/mollie/webhook hergebruikt voor Purchase CAPI deduplicatie.';
comment on column booking_requests.anonymous_id is
  'Client-side persistent UUID (localStorage). Wordt als external_id naar Meta gestuurd voor cross-device matching.';
comment on column booking_requests.fbp is
  'Facebook browser ID cookie (_fbp). Hashed niet — gaat raw naar Meta CAPI.';
comment on column booking_requests.fbc is
  'Facebook click ID cookie (_fbc). Hashed niet — gaat raw naar Meta CAPI.';

-- bookings.metadata is reeds jsonb; daar slaan we hetzelfde op zonder kolomwijziging.
