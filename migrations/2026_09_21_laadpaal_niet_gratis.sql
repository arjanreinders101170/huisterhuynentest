-- Laden aan de laadpaal is niet inbegrepen.
--
-- De site zei op meerdere plekken "een gratis EV-laadpaal" en in de FAQ
-- "Gebruik hiervan is gratis voor gasten." Dat klopt niet. De laadpaal staat
-- bij de lodge en gasten mogen hem gebruiken, maar de stroom zit niet bij de
-- huur in. Een onjuiste "gratis"-belofte is precies het soort detail waarop
-- een gast bij aankomst terecht terugkomt.
--
-- De teksten in de code (FAQ-pagina, landingspagina's) zijn in dezelfde
-- wijziging aangepast. Deze migratie doet de database: één blogartikel noemde
-- het laden bij de inbegrepen posten.
--
--   prive-lodge-boeken-nederland-kosten
--
-- Let op de volgorde in de herschreven zin: "gratis" slaat nu alleen nog op
-- wifi en parkeren, en de laadpaal staat in een eigen zin met de uitzondering
-- erbij. Zo valt het woord "gratis" niet meer per ongeluk op het laden.
--
-- Idempotent: na één keer draaien komt de oude zin niet meer voor.

update blog_posts
   set inhoud = replace(
         inhoud,
         'gratis wifi, parkeren op eigen terrein en het gebruik van de laadpaal voor een elektrische auto.',
         'gratis wifi en parkeren op eigen terrein. Bij de lodge staat een laadpaal voor elektrische auto''s; het laden zelf is niet inbegrepen.'),
       updated_at = now()
 where inhoud like '%het gebruik van de laadpaal voor een elektrische auto%';

-- ── Controle na afloop ────────────────────────────────────────────────────
-- Hoort nul rijen terug te geven.
--
--   select slug, titel
--     from blog_posts
--    where inhoud ilike '%gratis%laadpaal%'
--       or inhoud ilike '%laadpaal%gratis%';
--
-- En voor de landingspagina's (die via de sauna-migratie zijn bijgewerkt):
--
--   select slug from landing_pages
--    where sections::text ilike '%gratis EV-laadpaal%';
