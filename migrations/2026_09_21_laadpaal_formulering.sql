-- Eén formulering voor de laadpaal: "Er is een laadpaal aanwezig bij de lodge."
--
-- De site zei het op drie manieren: "Bij de lodge staat een laadpaal voor
-- elektrische auto's", "een EV-laadpaal op het terrein" en "de laadpaal op het
-- terrein". Dat leest als drie verschillende voorzieningen. Het is er één, en
-- hij staat bij de lodge.
--
--   landing_pages  lodge-de-heide, lodge-de-eik   (de zin met de kosten)
--   landing_pages  luxe-lodge-drenthe             ("op het terrein")
--   landing_pages  fietsen-in-drenthe             (de tegenstelling fiets/auto)
--   blog_posts     prive-lodge-boeken-nederland-kosten
--
-- De kostenzin blijft staan: het laden zelf is niet inbegrepen. Dat is een
-- aparte mededeling en die verandert hier niet.
--
-- De FAQ-pagina staat in code en is in dezelfde wijziging aangepast.
--
-- VOLGORDE: deze migratie is bestand tegen het wel of niet gedraaid hebben van
-- 2026_09_21_ebike_aan_buitenstopcontact.sql. Voor fietsen-in-drenthe staan
-- hieronder beide formuleringen die daar in omloop kunnen zijn, elk met
-- dezelfde uitkomst. Draai gerust in willekeurige volgorde.
--
-- Idempotent: elke update heeft de zoekzin in de where-clausule staan.

-- ── 1. De zin met de kosten (lodge-de-heide, lodge-de-eik) ────────────────
update landing_pages
   set sections = replace(
         sections::text,
         'Bij de lodge staat een laadpaal voor elektrische auto''s; het laden zelf is niet inbegrepen.',
         'Er is een laadpaal aanwezig bij de lodge; het laden zelf is niet inbegrepen.'
       )::jsonb,
       updated_at = now()
 where sections::text like '%Bij de lodge staat een laadpaal voor elektrische auto''s%';

-- ── 2. "op het terrein" → "bij de lodge" (luxe-lodge-drenthe) ─────────────
update landing_pages
   set sections = replace(
         sections::text,
         'snelle WiFi en een EV-laadpaal op het terrein',
         'snelle WiFi en een laadpaal bij de lodge'
       )::jsonb,
       updated_at = now()
 where sections::text like '%snelle WiFi en een EV-laadpaal op het terrein%';

-- ── 3a. fietsen-in-drenthe — als de e-bike-migratie AL is gedraaid ────────
update landing_pages
   set sections = replace(
         sections::text,
         'Uw e-bike laadt u ''s avonds op aan een buitenstopcontact bij de lodge; de laadpaal op het terrein is voor elektrische auto''s.',
         'Uw e-bike laadt u ''s avonds op aan een buitenstopcontact; de laadpaal bij de lodge is voor elektrische auto''s.'
       )::jsonb,
       updated_at = now()
 where slug = 'fietsen-in-drenthe'
   and sections::text like '%de laadpaal op het terrein is voor elektrische auto''s%';

-- ── 3b. fietsen-in-drenthe — als die NOG NIET is gedraaid ─────────────────
update landing_pages
   set sections = replace(
         sections::text,
         'Uw e-bike laadt u ''s avonds gewoon bij de lodge op; auto''s kunnen terecht bij de EV-laadpaal op het terrein.',
         'Uw e-bike laadt u ''s avonds op aan een buitenstopcontact; de laadpaal bij de lodge is voor elektrische auto''s.'
       )::jsonb,
       updated_at = now()
 where slug = 'fietsen-in-drenthe'
   and sections::text like '%auto''s kunnen terecht bij de EV-laadpaal op het terrein%';

-- ── 4. prive-lodge-boeken-nederland-kosten ────────────────────────────────
update blog_posts
   set inhoud = replace(
         inhoud,
         'Bij de lodge staat een laadpaal voor elektrische auto''s; het laden zelf is niet inbegrepen.',
         'Er is een laadpaal aanwezig bij de lodge; het laden zelf is niet inbegrepen.'),
       updated_at = now()
 where inhoud like '%Bij de lodge staat een laadpaal voor elektrische auto''s%';

-- ── 5. Controle na afloop ─────────────────────────────────────────────────
-- Alle drie horen nul rijen te geven.
--
--   select slug from landing_pages
--    where sections::text ilike '%laadpaal op het terrein%'
--       or sections::text ilike '%EV-laadpaal op het terrein%'
--       or sections::text ilike '%staat een laadpaal%';
--
--   select slug, titel from blog_posts
--    where inhoud ilike '%staat een laadpaal%'
--       or inhoud ilike '%laadpaal op het terrein%';
--
-- En de gewenste formulering moet er juist wél staan (verwacht: 3 rijen):
--
--   select slug from landing_pages
--    where sections::text ilike '%Er is een laadpaal aanwezig bij de lodge%'
--       or sections::text ilike '%een laadpaal bij de lodge%';
