-- De Eik heeft geen hoge plafonds, en beide lodges hebben vloerverwarming
-- en airco.
--
-- De eigenaar corrigeerde de claim: De Eik is wél de ruimste van de twee,
-- maar niet door de hoogte. Die zin stond op vier pagina's — de lodgepagina
-- zelf (in de ondertitel, de intro, een hele alinea die erop was gebouwd en
-- een veelgestelde vraag) plus twee opsommingen op /luxe-lodge-drenthe en
-- /bijzonder-overnachten-drenthe.
--
-- Wat er wél is en nergens stond: beide lodges zijn all-electric met
-- vloerverwarming en airco. De voorzieningenkaart zei alleen "Verwarming",
-- en dat verkoopt het comfort niet dat het is.
--
-- Dezelfde wijziging staat in src/lib/landing-seed.ts. Die seed wordt alleen
-- geserveerd zolang een slug nog géén rij in landing_pages heeft; deze vier
-- hebben die sinds 2026_09_04_lodgepaginas.sql wél, dus zonder deze migratie
-- verandert er op de site niets.
--
-- Bewust replace() op de tekst in plaats van de hele sections-kolom
-- overschrijven: die kolom kan in de admin met de hand zijn bijgewerkt, en
-- een volledige vervanging gooit dat weg. Idempotent — een tweede keer
-- draaien vindt niets meer om te vervangen.

begin;

-- ── 1. De ondertitel van de lodgepagina ──────────────────────────────
update landing_pages
   set hero_sub = replace(
         hero_sub,
         'eigen buitensauna. Hoge plafonds, ruimte voor vier en een buitenkeuken',
         'eigen buitensauna. Ruimte voor vier en een buitenkeuken'),
       updated_at = now()
 where slug = 'lodge-de-eik'
   and hero_sub like '%Hoge plafonds%';

-- ── 2. De intro: de plafonds eruit, het comfort erin ─────────────────
update landing_pages
   set intro = replace(
         intro,
         'Binnen: hoge plafonds, ruimte voor vier en niets dat aan een vakantiepark doet denken.',
         'Binnen: ruimte voor vier, vloerverwarming en airco, en niets dat aan een vakantiepark doet denken.'),
       updated_at = now()
 where slug = 'lodge-de-eik'
   and intro like '%hoge plafonds%';

-- ── 3. De alinea die volledig op de hoogte leunde ────────────────────
-- "Dat merkt u vooral aan de hoogte" kan niet blijven staan zonder de
-- plafonds. De Eik ís de ruimste van de twee; dat komt hier van de
-- buitenkeuken en het terras, die in de praktijk een tweede woonkamer zijn.
update landing_pages
   set sections = replace(
         sections::text,
         'De Eik is de ruimste van de twee. Dat merkt u vooral aan de hoogte: het is een omgebouwd gebouw met hoge plafonds, en dat maakt een verblijf',
         'De Eik is de ruimste van de twee. Dat merkt u vooral buiten: de buitenkeuken en het terras onder de eiken zijn hier een tweede woonkamer, en dat maakt een verblijf')::jsonb,
       updated_at = now()
 where slug = 'lodge-de-eik'
   and sections::text like '%hoge plafonds%';

-- ── 4. De veelgestelde vraag ─────────────────────────────────────────
update landing_pages
   set faq = replace(
         faq,
         'plus de ruimte: hoge plafonds en de ruimste van de twee lodges.',
         'plus de ruimte: het is de ruimste van de twee lodges.'),
       updated_at = now()
 where slug = 'lodge-de-eik'
   and faq like '%hoge plafonds%';

-- ── 5. De twee opsommingen op andere landingspagina's ────────────────
update landing_pages
   set sections = replace(
         sections::text,
         'Lodge De Eik — hoge plafonds, authentieke uitstraling, buitenkeuken met BBQ en eigen hottub.',
         'Lodge De Eik — authentieke uitstraling, eigen buitensauna, buitenkeuken met BBQ en eigen hottub.')::jsonb,
       updated_at = now()
 where slug = 'luxe-lodge-drenthe'
   and sections::text like '%hoge plafonds%';

update landing_pages
   set sections = replace(
         sections::text,
         'Lodge De Eik — hoge plafonds, buitenkeuken met BBQ en eigen hottub onder de eiken.',
         'Lodge De Eik — eigen buitensauna, buitenkeuken met BBQ en eigen hottub onder de eiken.')::jsonb,
       updated_at = now()
 where slug = 'bijzonder-overnachten-drenthe'
   and sections::text like '%hoge plafonds%';

-- ── 6. Vloerverwarming en airco in de voorzieningenkaart ─────────────
-- Eén regel "Verwarming" wordt twee: wat voor verwarming het is, en dat er
-- ook gekoeld kan worden. In beide lodges gelijk, dus beide rijen.
update landing_pages
   set sections = replace(
         sections::text,
         '{"icon": "verwarming", "tekst": "Verwarming"}',
         '{"icon": "vloerverwarming", "tekst": "Vloerverwarming"}, {"icon": "airco", "tekst": "Airconditioning"}')::jsonb,
       updated_at = now()
 where slug in ('lodge-de-heide', 'lodge-de-eik')
   and sections::text like '%"tekst": "Verwarming"%';

commit;

-- Controle achteraf; hoort nul rijen op te leveren.
--   select slug from landing_pages
--    where hero_sub ilike '%hoge plafonds%'
--       or intro ilike '%hoge plafonds%'
--       or faq ilike '%hoge plafonds%'
--       or sections::text ilike '%hoge plafonds%';
