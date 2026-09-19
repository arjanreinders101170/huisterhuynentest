-- Openingsdatum verschuift van 1 januari 2027 naar 1 april 2027.
--
-- De datum stond op twee plekken: in de code (teksten op de homepage, de
-- Duitse pagina, de landingspagina's, de blog-CTA, de nieuwsbriefmail en
-- BOOKINGS_OPEN_FROM in src/data/lodge.ts) en in de database, in de tekst van
-- twee blogartikelen. De code is in dezelfde wijziging aangepast; deze
-- migratie doet de database.
--
-- Twee artikelen noemen de datum voluit:
--
--   herfst-in-drenthe-heide      — "vanaf 1 januari 2027 openen onze lodges"
--   zomerupdate-oplevering-lodges — de eerlijke update over de vertraagde
--                                   oplevering. Dat artikel zei dat 1 januari
--                                   niet gehaald wordt en dat de nieuwe datum
--                                   nog volgt. Die datum is er nu, dus noemt
--                                   het artikel hem ook: 1 april 2027.
--
-- Werkt met replace() op de exacte zinnen in plaats van een volledige
-- overschrijving, zodat tekst die intussen in de admin is bijgewerkt niet
-- verloren gaat.
--
-- Idempotent: na één keer draaien komen de oude zinnen niet meer voor en
-- verandert een tweede run niets (de where-clausule raakt dan geen rij meer).

-- ── 1. herfst-in-drenthe-heide ────────────────────────────────────────────
update blog_posts
   set inhoud = replace(
         replace(
           inhoud,
           'want vanaf 1 januari 2027 openen onze twee lodges',
           'want vanaf 1 april 2027 openen onze twee lodges'),
         'De lodges openen op 1 januari 2027.',
         'De lodges openen op 1 april 2027.'),
       updated_at = now()
 where inhoud like '%1 januari 2027%';

-- ── 2. zomerupdate-oplevering-lodges — intro ──────────────────────────────
update blog_posts
   set intro = replace(
         intro,
         'de oplevering loopt vertraging op, waardoor de lodges helaas nog niet vanaf 1 januari beschikbaar zijn.',
         'de oplevering loopt vertraging op, waardoor de lodges later opengaan dan gepland. De nieuwe openingsdatum is 1 april 2027.'),
       updated_at = now()
 where intro like '%nog niet vanaf 1 januari beschikbaar%';

-- ── 3. zomerupdate-oplevering-lodges — de tekst zelf ──────────────────────
update blog_posts
   set inhoud = replace(
         replace(
           replace(
             replace(
               inhoud,
               'De planning was helder. De lodges zouden worden opgeleverd zodat Lodge De Heide en Lodge De Eik vanaf 1 januari beschikbaar zouden zijn voor gasten. Die datum staat al maanden in onze communicatie, in de nieuwsbrief en op de site.',
               'De planning was helder. De lodges zouden worden opgeleverd zodat Lodge De Heide en Lodge De Eik aan het begin van het nieuwe jaar beschikbaar zouden zijn voor gasten. Die datum stond maandenlang in onze communicatie, in de nieuwsbrief en op de site.'),
             'Die datum halen we niet. De oplevering heeft meer tijd nodig dan gepland, en daarmee schuift ook het moment op waarop wij de eerste gasten kunnen ontvangen. De lodges zijn dus helaas nog niet vanaf 1 januari beschikbaar.',
             'Die datum halen we niet. De oplevering heeft meer tijd nodig dan gepland, en daarmee schuift ook het moment op waarop wij de eerste gasten kunnen ontvangen. De nieuwe openingsdatum is 1 april 2027, en dat is de datum die vanaf nu overal op de site staat.'),
           'Vooral dit: reken voor je plannen in de eerste weken van het nieuwe jaar nog niet op ons. Heb je al een aanvraag gedaan of sta je op de lijst voor de opening, dan nemen we persoonlijk contact met je op zodra de nieuwe datum vaststaat — je hoeft daar zelf niets voor te doen.',
           'Vooral dit: reken voor je plannen in de eerste maanden van het nieuwe jaar nog niet op ons. Wij ontvangen onze eerste gasten vanaf 1 april 2027. Heb je al een aanvraag gedaan of sta je op de lijst voor de opening, dan nemen we persoonlijk contact met je op om je datum om te zetten — je hoeft daar zelf niets voor te doen.'),
         'Zodra de nieuwe openingsdatum definitief is, hoor je het. Niet via een omweg, maar direct: nieuwsbrief-abonnees krijgen als eersten bericht, met de datum, de tarieven en het vroegboekvoordeel dat we voor die groep achterhouden. Dat voordeel blijft gewoon staan — de vertraging gaat niet ten koste van de mensen die vanaf het begin meekijken.',
         'De nieuwe datum staat vast, en de rest volgt op dezelfde manier: niet via een omweg, maar direct. Nieuwsbrief-abonnees krijgen als eersten bericht, met de tarieven en het vroegboekvoordeel dat we voor die groep achterhouden. Dat voordeel blijft gewoon staan — de vertraging gaat niet ten koste van de mensen die vanaf het begin meekijken.'),
       updated_at = now()
 where slug = 'zomerupdate-oplevering-lodges';

-- ── 4. Vangnet: meld wat er eventueel blijft staan ────────────────────────
-- Draai dit na de migratie handmatig. Levert het rijen op, dan staat de oude
-- datum nog ergens in tekst die hierboven niet letterlijk voorkwam.
--
--   select slug, titel
--     from blog_posts
--    where inhoud ilike '%1 januari%' or intro ilike '%1 januari%';
--
--   select slug
--     from landing_pages
--    where intro ilike '%1 januari%' or cta_body ilike '%1 januari%'
--       or sections::text ilike '%1 januari%';
