-- Welke kolommen mist stays?
--
-- Plak dit in de SQL Editor van het Supabase-dashboard en klik Run.
-- Het leest alleen; er verandert niets aan je data.
--
-- Aanleiding: 2026_09_04_bedankmail_bijhouden.sql liep stuk op
-- `column "bron" does not exist`. Die kolom komt niet uit die migratie maar
-- uit 2026_08_31_booking_com_import.sql — de database liep dus achter op de
-- code. Omdat de SQL Editor het hele script in één transactie draait, werd
-- daarbij ook `bedankt_verstuurd_op` weer teruggedraaid: er was niets
-- toegevoegd, ondanks de eerste regels van het script.
--
-- Deze query zet de kolommen die de code op stays verwacht naast de kolommen
-- die de database heeft. Elke regel in de uitslag is een ontbrekende kolom,
-- met de migratie die hem hoort aan te maken. Draai die migraties in de
-- getoonde volgorde, oudste eerst.

select
  verwacht.kolom,
  verwacht.migratie
from (values
  -- migrations/2026_08_31_booking_com_import.sql
  ('bron',                      '2026_08_31_booking_com_import.sql'),
  ('extern_id',                 '2026_08_31_booking_com_import.sql'),
  ('extern_bedrag',             '2026_08_31_booking_com_import.sql'),
  ('extern_commissie',          '2026_08_31_booking_com_import.sql'),
  ('extern_valuta',             '2026_08_31_booking_com_import.sql'),
  ('geboekt_op',                '2026_08_31_booking_com_import.sql'),
  ('gast_naam',                 '2026_08_31_booking_com_import.sql'),
  ('geimporteerd_op',           '2026_08_31_booking_com_import.sql'),
  -- migrations/2026_08_31_eindfactuur_booking_com.sql
  ('personen',                  '2026_08_31_eindfactuur_booking_com.sql'),
  ('eindfactuur_regels',        '2026_08_31_eindfactuur_booking_com.sql'),
  ('eindfactuur_totaal',        '2026_08_31_eindfactuur_booking_com.sql'),
  ('eindfactuur_status',        '2026_08_31_eindfactuur_booking_com.sql'),
  ('eindfactuur_bijgewerkt_op', '2026_08_31_eindfactuur_booking_com.sql'),
  -- migrations/2026_09_04_bedankmail_bijhouden.sql
  ('bedankt_verstuurd_op',      '2026_09_04_bedankmail_bijhouden.sql')
) as verwacht(kolom, migratie)
where not exists (
  select 1
  from information_schema.columns c
  where c.table_schema = 'public'
    and c.table_name   = 'stays'
    and c.column_name  = verwacht.kolom
)
order by verwacht.migratie, verwacht.kolom;

-- Geen rijen terug? Dan is het schema bij en ligt een storing ergens anders.


-- ── 2. Wat staat er nu open aan bedankmails? ──
--
-- De ochtendcron pakt verblijven op waarvan check_out tussen zeven dagen en
-- één dag geleden ligt en waar bedankt_verstuurd_op leeg is. Een gast zonder
-- e-mailadres (Booking.com-import) blijft staan: die is alleen via het
-- extranet te bedanken.
--
-- De kolommen worden via to_jsonb(s) uitgelezen in plaats van bij naam. Dat
-- leest omslachtiger, maar houdt dit script heel op precies de database waar
-- je het voor nodig hebt: een half bijgewerkte. Bij naam zou de query stuk
-- lopen op de kolom die je aan het opzoeken bent, en dan breekt de SQL Editor
-- de rest van dit script af.

select s.id,
       s.lodge,
       s.check_out,
       s.status,
       s.guest_id
from stays s
where to_jsonb(s) ->> 'bedankt_verstuurd_op' is null
  and s.check_out >= current_date - 7
  and s.check_out <  current_date
order by s.check_out desc;


-- ── 3. Klopt de backfill? ──
--
-- Verwacht beeld na de migratie: directe verblijven met status 'vertrokken'
-- hebben een tijdstempel, Booking.com-verblijven bewust niet — die zijn nooit
-- bedankt, dus daar hoort de kolom leeg te blijven.

select coalesce(to_jsonb(s) ->> 'bron', 'direct') as bron,
       s.status,
       count(*) filter (where to_jsonb(s) ->> 'bedankt_verstuurd_op' is not null) as gemarkeerd,
       count(*) filter (where to_jsonb(s) ->> 'bedankt_verstuurd_op' is null)     as open
from stays s
group by 1, 2
order by 1, 2;
