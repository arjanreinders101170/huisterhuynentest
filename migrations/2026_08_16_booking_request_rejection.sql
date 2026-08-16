-- Afwijzen van een aanvraag vastleggen
-- Doel: bij een afwijzing wordt de gast per e-mail geïnformeerd met een door de
-- host geschreven tekst. Die tekst en het moment van afwijzen leggen we vast,
-- zodat achteraf te zien is wát er is gecommuniceerd en wanneer.

alter table booking_requests add column if not exists afwijs_reden text;
alter table booking_requests add column if not exists afgewezen_op timestamptz;

-- De oorspronkelijke status-constraint kende de betaalstatussen nog niet,
-- terwijl send_payment_link die wel wegschrijft. Constraint hier compleet maken.
alter table booking_requests drop constraint if exists booking_requests_status_check;
alter table booking_requests add constraint booking_requests_status_check
  check (status in (
    'nieuw',
    'in_behandeling',
    'offerte_verstuurd',
    'bevestigd',
    'afgewezen',
    'aanbetaling_verstuurd',
    'aanbetaling_betaald',
    'restbetaling_verstuurd',
    'volledig_betaald'
  ));
