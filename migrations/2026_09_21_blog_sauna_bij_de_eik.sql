-- De sauna verhuist ook in het blog van De Heide naar De Eik.
--
-- Hoort bij 2026_09_21_sauna_van_de_heide_naar_de_eik.sql, dat de
-- landingspagina's doet. Eén artikel noemt expliciet welke lodge de sauna
-- heeft: het prijsartikel, in de opsomming van wat er zonder toeslag bij zit.
--
-- Werkt met replace() op de exacte zinsnede, zodat tekst die intussen in de
-- admin is bijgewerkt niet verloren gaat.
--
-- Idempotent: na één keer draaien komt de oude zinsnede niet meer voor.

update blog_posts
   set inhoud = replace(inhoud, 'de sauna in Lodge De Heide', 'de buitensauna bij Lodge De Eik'),
       updated_at = now()
 where inhoud like '%de sauna in Lodge De Heide%';

-- Controle: hoort nul rijen te geven.
--
--   select slug from blog_posts where inhoud like '%sauna in Lodge De Heide%';
