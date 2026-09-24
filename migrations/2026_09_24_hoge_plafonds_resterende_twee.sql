-- De laatste twee pagina's met "hoge plafonds".
--
-- 2026_09_23 haalde de claim weg bij lodge-de-eik, maar deed niets op
-- luxe-lodge-drenthe en bijzonder-overnachten-drenthe. Die twee updates
-- zochten de hele zin inclusief het gedachtestreepje:
--
--   'Lodge De Eik — hoge plafonds, authentieke uitstraling, ...'
--
-- De where-voorwaarde matchte wel (de rijen kwamen terug in de controle),
-- dus de tekst bevat "hoge plafonds"; alleen vond replace() de zin niet.
-- Dan wijkt er een teken af van wat de migratie van 21 september erin
-- zette — vrijwel zeker dat streepje, dat bij een bewerking in de admin
-- een en-streepje of een koppelteken geworden kan zijn.
--
-- Deze versie hangt daar niet meer van af: het zoekpatroon is
-- "hoge plafonds, " en bestaat alleen uit kleine letters, een komma en een
-- spatie. Wat eromheen staat doet er niet toe.
--
-- Weglaten in plaats van vervangen. Op beide pagina's staat De Eik twee
-- keer in de opsomming, en de andere regel noemt de buitensauna al:
--
--   "Lodge De Eik — authentieke uitstraling, buitenkeuken met BBQ en
--    eigen hottub."
--   "Lodge De Eik — buitenkeuken met BBQ en eigen hottub onder de eiken."
--
-- Idempotent: een tweede keer draaien vindt niets meer.

begin;

update landing_pages
   set sections = replace(sections::text, 'hoge plafonds, ', '')::jsonb,
       updated_at = now()
 where slug in ('luxe-lodge-drenthe', 'bijzonder-overnachten-drenthe')
   and sections::text like '%hoge plafonds, %';

commit;

-- Controle: hoort nul rijen te geven, over de hele tabel.
select slug,
       substring(sections::text from '.{0,60}hoge plafonds.{0,60}') as rest
  from landing_pages
 where hero_sub ilike '%hoge plafonds%'
    or intro    ilike '%hoge plafonds%'
    or faq      ilike '%hoge plafonds%'
    or sections::text ilike '%hoge plafonds%';
