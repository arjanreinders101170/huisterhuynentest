-- De e-bike laadt op aan een buitenstopcontact, niet aan de laadpaal.
--
-- Bij het rechtzetten van de laadpaal ("laden is niet inbegrepen") bleven drie
-- zinnen staan die de e-bike aan diezelfde laadpaal hingen. Dat klopt niet: de
-- laadpaal is voor elektrische auto's, een e-bike gaat aan een buitenstopcontact
-- bij de lodge. Laat je die zinnen staan, dan leest een gast alsnog dat het
-- opladen van de fiets aan de laadpaal gebeurt — met de kostenzin ernaast.
--
--   landing_pages  fietsen-in-drenthe
--   landing_pages  lodge-de-eik
--   blog_posts     e-bike-huren-in-drenthe
--
-- Werkt met replace() op de exacte zinnen, zodat tekst die intussen in de admin
-- is bijgewerkt niet wordt overschreven.
--
-- Idempotent: na één keer draaien komen de oude zinnen niet meer voor.

-- ── 1. fietsen-in-drenthe ─────────────────────────────────────────────────
update landing_pages
   set sections = replace(
         sections::text,
         'Uw e-bike laadt u ''s avonds gewoon bij de lodge op; auto''s kunnen terecht bij de EV-laadpaal op het terrein.',
         'Uw e-bike laadt u ''s avonds op aan een buitenstopcontact bij de lodge; de laadpaal op het terrein is voor elektrische auto''s.'
       )::jsonb,
       updated_at = now()
 where slug = 'fietsen-in-drenthe'
   and sections::text like '%auto''s kunnen terecht bij de EV-laadpaal%';

-- ── 2. lodge-de-eik ───────────────────────────────────────────────────────
update landing_pages
   set sections = replace(
         sections::text,
         'de e-bike laadt u op de laadpaal op het terrein.',
         'de e-bike laadt u op aan een buitenstopcontact bij de lodge.'
       )::jsonb,
       updated_at = now()
 where slug = 'lodge-de-eik'
   and sections::text like '%de e-bike laadt u op de laadpaal op het terrein%';

-- ── 3. e-bike-huren-in-drenthe ────────────────────────────────────────────
update blog_posts
   set inhoud = replace(
         inhoud,
         'Bij Huis ter Huynen is er op het terrein een laadpaal aanwezig, wat het opladen van een (e-)fiets eenvoudig maakt.',
         'Bij Huis ter Huynen laadt u een (e-)fiets eenvoudig op aan een buitenstopcontact bij de lodge.'),
       updated_at = now()
 where inhoud like '%een laadpaal aanwezig, wat het opladen van een (e-)fiets%';

-- ── 4. Controle na afloop ─────────────────────────────────────────────────
-- Hoort nul rijen terug te geven: nergens mag de fiets nog aan de laadpaal.
--
--   select slug from landing_pages
--    where sections::text ~* '(e-bike|\(e-\)fiets|fiets)[^.]{0,60}laadpaal'
--       or sections::text ~* 'laadpaal[^.]{0,60}(e-bike|\(e-\)fiets)';
--
--   select slug, titel from blog_posts
--    where inhoud ~* '(e-bike|\(e-\)fiets)[^.]{0,60}laadpaal'
--       or inhoud ~* 'laadpaal[^.]{0,60}(e-bike|\(e-\)fiets)';
