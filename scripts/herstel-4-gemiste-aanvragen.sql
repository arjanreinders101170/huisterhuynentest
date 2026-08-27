-- De vier gemiste aanvragen terugzetten
--
-- Gevonden op 27 augustus 2026 met scripts/herstel-gemiste-aanvragen.sql:
-- vier gasten met een contactmoment maar zonder aanvraag in de database.
-- Oorzaak: migrations/2026_08_19_aanvraag_attributie.sql was niet gedraaid,
-- waardoor de insert faalde op tien ontbrekende kolommen.
--
--   Kira   kira.groenland@gmail.com      27 aug 13:59   nooit een aanvraag
--   Daan   daan.langenkamp95@gmail.com   25 aug 14:20   nooit een aanvraag
--   Paul   paul.devries87@gmail.com      23 aug 04:59   nooit een aanvraag
--   toine  ajorbarnhoorn@hotmail.com     19 aug 18:05   wél één van 18 aug
--
-- Het moment waarop dit brak is hiermee precies te dateren: de laatste
-- geslaagde aanvraag is van 18 augustus 19:41, de eerste gemiste van
-- 19 augustus 18:05. Daartussen ging de attributie-code live.
--
-- ── Zo gebruik je dit ──
--
-- Zoek per gast de mail op in lodge@huisterhuynen.nl, onderwerp
-- "Reserveringsaanvraag: Lodge <naam> — <gast>". Vul in het `mail`-blok in
-- wat daarin staat. Naam, e-mailadres en het tijdstip staan al goed: die
-- komen uit de database. Draai daarna het blok van die gast.
--
-- Haal de /* */ eromheen weg voor de gasten die je herstelt.
--
-- created_at is bewust het oorspronkelijke contactmoment en niet nu: zo zie
-- je in de admin hoe lang deze gast al wacht.


-- ═══ 1. Kira — kira.groenland@gmail.com — aanvraag van 27 aug 13:59 ═══
--
-- INGEVULD uit de bevestigingsmail in Resend (27 aug, 7 uur voor terugvinden).
-- Klaar om te draaien. De not-exists onderaan maakt het onschadelijk om het
-- per ongeluk twee keer te doen.

with mail as (
  select date '2027-01-15'  as check_in,
         date '2027-01-17'  as check_out,
         'lodge_1'::text    as lodge,          -- De Heide
         2                  as personen,
         false              as huisdieren,
         372.90::numeric    as prijs,
         'Ik wil de 25ste verjaardag van mijn vriend komen vieren en ben benieuwd of de lodge beschikbaar is.'::text as bericht
)
insert into booking_requests (
  bron, guest_id, gast_naam, gast_email, lodge, check_in, check_out,
  nachten, personen, huisdieren, bericht, voorgestelde_prijs,
  voorgestelde_prijs_label, status, created_at, confirm_token
)
select 'homepage', g.id, 'Kira', 'kira.groenland@gmail.com',
       m.lodge, m.check_in, m.check_out, (m.check_out - m.check_in),
       m.personen, m.huisdieren,
       m.bericht || E'\n\n[Hersteld uit de bevestigingsmail — de aanvraag zelf was niet opgeslagen]',
       m.prijs, '2 nachten',
       'nieuw', timestamptz '2026-08-27 13:59:33+00',
       md5(random()::text) || md5(random()::text)
from guests g, mail m
where lower(g.email) = lower('kira.groenland@gmail.com')
  and not exists (
    select 1 from booking_requests br
    where lower(br.gast_email) = lower('kira.groenland@gmail.com')
      and br.check_in = m.check_in
  );


-- ═══ 2. Daan — daan.langenkamp95@gmail.com — aanvraag van 25 aug 14:20 ═══
--
-- INGEVULD uit de eigenaarsmail in Resend. Daan gaf geen bericht mee.
--
-- ⚠️ LET OP: dezelfde lodge en dezelfde nachten als Kira (blok 1).
-- De Heide, 15 t/m 17 januari 2027. Beide aanvragen kunnen niet doorgaan.
-- Daan vroeg twee dagen eerder dan Kira.

with mail as (
  select date '2027-01-15'  as check_in,
         date '2027-01-17'  as check_out,
         'lodge_1'::text    as lodge,          -- De Heide
         2                  as personen,
         false              as huisdieren,
         372.90::numeric    as prijs
)
insert into booking_requests (
  bron, guest_id, gast_naam, gast_email, lodge, check_in, check_out,
  nachten, personen, huisdieren, bericht, voorgestelde_prijs,
  voorgestelde_prijs_label, status, created_at, confirm_token
)
select 'homepage', g.id, 'Daan', 'daan.langenkamp95@gmail.com',
       m.lodge, m.check_in, m.check_out, (m.check_out - m.check_in),
       m.personen, m.huisdieren,
       '[Hersteld uit de eigenaarsmail — de aanvraag zelf was niet opgeslagen. Gast gaf geen bericht mee.]',
       m.prijs, '2 nachten',
       'nieuw', timestamptz '2026-08-25 14:20:35+00',
       md5(random()::text) || md5(random()::text)
from guests g, mail m
where lower(g.email) = lower('daan.langenkamp95@gmail.com')
  and not exists (
    select 1 from booking_requests br
    where lower(br.gast_email) = lower('daan.langenkamp95@gmail.com')
      and br.check_in = m.check_in
  );


-- ═══ 3. Paul — paul.devries87@gmail.com — aanvraag van 23 aug 04:59 ═══
/*
with mail as (
  select date   '2026-__-__' as check_in,
         date   '2026-__-__' as check_out,
         'lodge_1'::text     as lodge,
         2                   as personen,
         false               as huisdieren,
         null::text          as bericht
)
insert into booking_requests (
  bron, guest_id, gast_naam, gast_email, lodge, check_in, check_out,
  nachten, personen, huisdieren, bericht, status, created_at, confirm_token
)
select 'homepage', g.id, 'Paul', 'paul.devries87@gmail.com',
       m.lodge, m.check_in, m.check_out, (m.check_out - m.check_in),
       m.personen, m.huisdieren,
       coalesce(m.bericht || E'\n\n', '') || '[Hersteld uit e-mail — aanvraag was niet opgeslagen]',
       'nieuw', timestamptz '2026-08-23 04:59:00+00',
       md5(random()::text) || md5(random()::text)
from guests g, mail m
where lower(g.email) = lower('paul.devries87@gmail.com');
*/


-- ═══ 4. toine — ajorbarnhoorn@hotmail.com — aanvraag van 19 aug 18:05 ═══
--
-- Let op: van Toine staat er al een aanvraag van 18 augustus in de database
-- (die van 4 – 7 feb, inmiddels verlopen). Deze is een tweede poging, een dag
-- later. Hij heeft het dus twee keer geprobeerd — de moeite waard om even te
-- bellen in plaats van te mailen.
/*
with mail as (
  select date   '2026-__-__' as check_in,
         date   '2026-__-__' as check_out,
         'lodge_1'::text     as lodge,
         2                   as personen,
         false               as huisdieren,
         null::text          as bericht
)
insert into booking_requests (
  bron, guest_id, gast_naam, gast_email, lodge, check_in, check_out,
  nachten, personen, huisdieren, bericht, status, created_at, confirm_token
)
select 'homepage', g.id, 'toine', 'ajorbarnhoorn@hotmail.com',
       m.lodge, m.check_in, m.check_out, (m.check_out - m.check_in),
       m.personen, m.huisdieren,
       coalesce(m.bericht || E'\n\n', '') || '[Hersteld uit e-mail — aanvraag was niet opgeslagen]',
       'nieuw', timestamptz '2026-08-19 18:05:00+00',
       md5(random()::text) || md5(random()::text)
from guests g, mail m
where lower(g.email) = lower('ajorbarnhoorn@hotmail.com');
*/


-- ═══ Controle achteraf ═══
--
-- Verwacht: vier rijen met status 'nieuw'. Ze horen in de Aanvragen-tab
-- onder "Actie nodig" te staan.

select created_at, bron, status, gast_naam, gast_email, check_in, check_out, nachten
from booking_requests
where created_at >= date '2026-08-19'
order by created_at desc;
