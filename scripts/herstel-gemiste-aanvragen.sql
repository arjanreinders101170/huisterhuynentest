-- Gemiste aanvragen terughalen (19 augustus 2026 en later)
--
-- Aanleiding: migrations/2026_08_19_aanvraag_attributie.sql was niet gedraaid,
-- waardoor de insert in booking_requests faalde op tien ontbrekende kolommen.
-- /api/reservering schrijft de gast wég vóór de aanvraag (upsert_guest), en
-- dat deel slaagde wél. Elke verloren aanvraag heeft dus nog een rij in
-- `guests` — naam en e-mailadres zijn niet weg.
--
-- Wat er niet meer in de database staat: gewenste datums, lodge, aantal
-- personen en het bericht van de gast. Die staan alleen in de mail die naar
-- lodge@huisterhuynen.nl ging, met onderwerp
-- "Reserveringsaanvraag: Lodge <naam> — <gast>".
--
-- Werkwijze: query 2 geeft de namen en adressen van wie je kwijt bent. Zoek
-- die op in de mailbox, en zet ze met blok 3 terug in de Aanvragen-tab.
--
-- Plak dit in de SQL Editor van Supabase. Query 1 en 2 lezen alleen.


-- ── 1. Wat doet upsert_guest precies? ──
--
-- Deze functie staat niet in migrations/ maar is in het dashboard aangemaakt.
-- Query 2 leunt op laatste_bezoek; dit laat zien of die kolom bij elke
-- aanvraag wordt bijgewerkt. Zo niet, gebruik dan de variant onder query 2.

select prosrc as definitie_upsert_guest
from pg_proc
where proname = 'upsert_guest';


-- ── 2. Wie ben ik kwijt? ──
--
-- Gasten met een recent contactmoment maar zonder aanvraag van ná 19 augustus.
-- Dat zijn de aanvragen die op de ontbrekende kolommen zijn gesneuveld.

select
  g.naam,
  g.email,
  g.laatste_bezoek,
  max(br.created_at) as laatste_aanvraag_in_database
from guests g
left join booking_requests br
       on lower(br.gast_email) = lower(g.email)
group by g.id, g.naam, g.email, g.laatste_bezoek
having (max(br.created_at) is null or max(br.created_at) < date '2026-08-19')
   and g.laatste_bezoek >= date '2026-08-19'
order by g.laatste_bezoek desc;

-- Levert dit niets op terwijl je zeker weet dat er aanvragen zijn geweest,
-- dan werkt upsert_guest laatste_bezoek niet bij (zie query 1). Laat in dat
-- geval de regel `and g.laatste_bezoek >= date '2026-08-19'` weg en loop de
-- lijst met de hand na — elke gast zonder enige aanvraag is verdacht.


-- ── 3. Een teruggevonden aanvraag herstellen ──
--
-- Vul in wat in de mail staat en draai per aanvraag één keer. Let op:
-- bron blijft 'homepage' en status 'nieuw', zodat hij in de Aanvragen-tab
-- onder "Actie nodig" komt te staan — net als een verse aanvraag.
--
-- Gebruik hier NIET bron 'handmatig': die is voor blokkeringen en komt in een
-- andere groep terecht.
--
-- Het confirm_token wordt hier alvast gezet zodat de bevestigingslink werkt
-- zodra je een offerte stuurt.

/*
insert into booking_requests (
  bron, guest_id, gast_naam, gast_email,
  lodge, check_in, check_out, nachten, personen, huisdieren,
  bericht, status, created_at, confirm_token
)
select
  'homepage',
  g.id,
  'VUL NAAM IN',
  'vul@email.in',
  'lodge_1',                       -- lodge_1 = De Heide, lodge_2 = De Eik
  date '2026-09-01',               -- check_in uit de mail
  date '2026-09-03',               -- check_out uit de mail
  2,                               -- nachten
  2,                               -- personen
  false,                           -- huisdieren
  'Hersteld uit e-mail van <datum>. Oorspronkelijk bericht: ...',
  'nieuw',
  timestamptz '2026-08-20 10:00+02', -- verzendmoment van de mail
  encode(gen_random_bytes(32), 'hex')
from guests g
where lower(g.email) = lower('vul@email.in');
*/


-- ── 4. Controle achteraf ──
--
-- Na het herstellen: staan ze er, en staan ze op 'nieuw'?

select created_at, bron, status, gast_naam, gast_email, check_in, check_out
from booking_requests
where created_at >= date '2026-08-19'
order by created_at desc;
