-- Herkomst van een aanvraag vastleggen.
--
-- Aanleiding: het groeiplan naar 10.000 bezoekers zet marketingbudget in op
-- meerdere kanalen tegelijk (Google Ads, Meta, gidsen, e-mail). Zonder
-- herkomst per aanvraag is achteraf niet te zeggen welke euro een boeking
-- opleverde — en dan wordt budget verdeeld op gevoel.
--
-- GA4 meet sessies, maar de boeking ontstaat hier. Deze kolommen verbinden
-- die twee: elke aanvraag draagt het kanaal waaruit hij kwam.

alter table booking_requests
  add column if not exists utm_source       text,
  add column if not exists utm_medium       text,
  add column if not exists utm_campaign     text,
  add column if not exists utm_term         text,
  add column if not exists utm_content      text,
  add column if not exists referrer         text,
  add column if not exists landing_page     text,
  add column if not exists kanaal           text,
  add column if not exists eerste_kanaal    text,
  add column if not exists eerste_bezoek_op timestamptz;

comment on column booking_requests.kanaal is
  'Afgeleid kanaal van de laatste klik vóór de aanvraag. Zie src/lib/attributie.ts.';
comment on column booking_requests.eerste_kanaal is
  'Kanaal waarin deze bezoeker ons voor het eerst vond. Wijkt vaak af van kanaal.';
comment on column booking_requests.landing_page is
  'De pagina waarop de bezoeker binnenkwam — laat zien welke landingspagina de aanvraag droeg.';
comment on column booking_requests.eerste_bezoek_op is
  'Eerste contactmoment. Het verschil met created_at is de beslistijd van de gast.';

-- Rapportage draait altijd op kanaal × periode.
create index if not exists booking_requests_kanaal_idx
  on booking_requests (kanaal, created_at desc)
  where kanaal is not null;

create index if not exists booking_requests_campagne_idx
  on booking_requests (utm_campaign, created_at desc)
  where utm_campaign is not null;
