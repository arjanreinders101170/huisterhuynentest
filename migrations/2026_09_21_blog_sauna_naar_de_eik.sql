-- De sauna hoort bij Lodge De Eik, ook in de blogartikelen.
--
-- De eerdere migratie 2026_09_21_sauna_van_de_heide_naar_de_eik.sql zette de
-- sauna om op de landingspagina's, maar raakte blog_posts niet. Drie artikelen
-- bleven daardoor zeggen dat De Heide de sauna heeft — precies de tegenstelling
-- die de rest van de site nu andersom vertelt:
--
--   prive-lodge-boeken-nederland-kosten
--   wellnessweekend-drenthe
--   kanovaren-drentsche-aa
--
-- De buitenkeuken met BBQ verhuist niet mee: die stond en staat bij De Eik.
-- De Heide houdt het vrije uitzicht over heide en bos als onderscheid.
--
-- Werkt met replace() op de exacte zinnen, zodat tekst die intussen in de admin
-- is bijgewerkt niet wordt overschreven.
--
-- Idempotent: na één keer draaien komen de oude zinnen niet meer voor.

-- ── 1. prive-lodge-boeken-nederland-kosten ────────────────────────────────
update blog_posts
   set inhoud = replace(
         inhoud,
         'Lodge De Heide heeft daarnaast een eigen sauna, Lodge De Eik een buitenkeuken met BBQ onder de eiken.',
         'Lodge De Eik heeft daarnaast een eigen buitensauna en een buitenkeuken met BBQ onder de eiken, Lodge De Heide een vrij uitzicht over heide en bos.'),
       updated_at = now()
 where inhoud like '%Lodge De Heide heeft daarnaast een eigen sauna, Lodge De Eik%';

-- ── 2. wellnessweekend-drenthe ────────────────────────────────────────────
update blog_posts
   set inhoud = replace(
         inhoud,
         'Lodge De Heide heeft daarnaast een eigen sauna en panoramisch uitzicht over het bos; Lodge De Eik heeft een buitenkeuken met BBQ onder de eiken.',
         'Lodge De Eik heeft daarnaast een eigen buitensauna en een buitenkeuken met BBQ onder de eiken; Lodge De Heide heeft panoramisch uitzicht over heide en bos.'),
       updated_at = now()
 where inhoud like '%eigen sauna en panoramisch uitzicht over het bos%';

-- ── 3. kanovaren-drentsche-aa ─────────────────────────────────────────────
update blog_posts
   set inhoud = replace(
         inhoud,
         'Lodge De Heide heeft daarnaast een eigen sauna: [de sauna in na een dag op het water]',
         'Lodge De Eik heeft daarnaast een eigen buitensauna: [de sauna in na een dag op het water]'),
       updated_at = now()
 where inhoud like '%eigen sauna: [de sauna in na een dag op het water]%';

-- ── 4. Controle na afloop ─────────────────────────────────────────────────
-- Hoort nul rijen terug te geven. Levert het wel rijen op, dan staat er nog
-- ergens een zin die de sauna aan De Heide toeschrijft.
--
--   select slug, titel
--     from blog_posts
--    where inhoud ilike '%De Heide%eigen sauna%'
--       or inhoud ilike '%sauna%Lodge De Heide%';
