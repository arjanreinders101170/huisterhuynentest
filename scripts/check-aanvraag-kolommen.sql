-- Welke kolommen mist booking_requests?
--
-- Plak dit in de SQL Editor van het Supabase-dashboard en klik Run.
-- Geen installatie nodig, en het verandert niets aan je data.
--
-- Aanleiding: een aanvraag via de website hoogde de gastenteller op maar
-- leverde geen rij in booking_requests. /api/reservering schrijft naast de
-- aanvraag ook tracking- en herkomstkolommen weg. Ontbreekt er één, dan
-- weigert PostgREST de hele rij en verdwijnt de aanvraag geruisloos.
--
-- Deze query zet de kolommen die de code wegschrijft naast de kolommen die
-- de database daadwerkelijk heeft. Elke regel in de uitslag is een ontbrekende
-- kolom, met de migratie die hem hoort aan te maken.

select
  verwacht.kolom,
  verwacht.migratie
from (values
  -- migrations/2026_05_15_unified_booking_requests.sql
  ('bron',                     '2026_05_15_unified_booking_requests.sql'),
  ('guest_id',                 '2026_05_15_unified_booking_requests.sql'),
  ('gast_naam',                '2026_05_15_unified_booking_requests.sql'),
  ('gast_email',               '2026_05_15_unified_booking_requests.sql'),
  ('lodge',                    '2026_05_15_unified_booking_requests.sql'),
  ('check_in',                 '2026_05_15_unified_booking_requests.sql'),
  ('check_out',                '2026_05_15_unified_booking_requests.sql'),
  ('nachten',                  '2026_05_15_unified_booking_requests.sql'),
  ('personen',                 '2026_05_15_unified_booking_requests.sql'),
  ('huisdieren',               '2026_05_15_unified_booking_requests.sql'),
  ('bericht',                  '2026_05_15_unified_booking_requests.sql'),
  ('periode_tekst',            '2026_05_15_unified_booking_requests.sql'),
  ('voorgestelde_prijs',       '2026_05_15_unified_booking_requests.sql'),
  ('voorgestelde_prijs_label', '2026_05_15_unified_booking_requests.sql'),
  ('promo_code',               '2026_05_15_unified_booking_requests.sql'),
  ('status',                   '2026_05_15_unified_booking_requests.sql'),
  ('confirm_token',            '2026_05_15_unified_booking_requests.sql'),
  -- migrations/2026_05_17_meta_capi_tracking.sql
  ('meta_event_id',            '2026_05_17_meta_capi_tracking.sql'),
  ('anonymous_id',             '2026_05_17_meta_capi_tracking.sql'),
  ('fbp',                      '2026_05_17_meta_capi_tracking.sql'),
  ('fbc',                      '2026_05_17_meta_capi_tracking.sql'),
  -- migrations/2026_08_19_aanvraag_attributie.sql
  ('utm_source',               '2026_08_19_aanvraag_attributie.sql'),
  ('utm_medium',               '2026_08_19_aanvraag_attributie.sql'),
  ('utm_campaign',             '2026_08_19_aanvraag_attributie.sql'),
  ('utm_term',                 '2026_08_19_aanvraag_attributie.sql'),
  ('utm_content',              '2026_08_19_aanvraag_attributie.sql'),
  ('referrer',                 '2026_08_19_aanvraag_attributie.sql'),
  ('landing_page',             '2026_08_19_aanvraag_attributie.sql'),
  ('kanaal',                   '2026_08_19_aanvraag_attributie.sql'),
  ('eerste_kanaal',            '2026_08_19_aanvraag_attributie.sql'),
  ('eerste_bezoek_op',         '2026_08_19_aanvraag_attributie.sql')
) as verwacht(kolom, migratie)
where not exists (
  select 1
  from information_schema.columns c
  where c.table_schema = 'public'
    and c.table_name   = 'booking_requests'
    and c.column_name  = verwacht.kolom
)
order by verwacht.migratie, verwacht.kolom;

-- Geen rijen terug? Dan zijn alle kolommen aanwezig en ligt de oorzaak niet
-- in het schema. Kijk dan naar de twee queries hieronder, en anders in de
-- Vercel-logs naar "[booking_requests] insert failed".


-- ── 2. Staan 'homepage' en 'nieuw' de constraints toe? ──
--
-- De insert zet bron='homepage' en status='nieuw'. Is een van die constraints
-- ooit met de hand aangepast, dan weigert de database de rij ook.

select conname as constraint_naam,
       pg_get_constraintdef(oid) as definitie
from pg_constraint
where conrelid = 'public.booking_requests'::regclass
  and contype = 'c'
order by conname;


-- ── 3. Wanneer kwam de laatste aanvraag binnen? ──
--
-- Stopt de reeks rond de datum van een migratie, dan is dat het moment
-- waarop dit stuk brak.

select created_at, bron, status, gast_naam
from booking_requests
order by created_at desc
limit 10;
