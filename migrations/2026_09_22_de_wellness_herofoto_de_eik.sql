-- De Duitse wellnesspagina toonde de verkeerde lodge in de hero.
--
-- /de/wellness-urlaub-drenthe had /lodge-heide.jpg als herofoto, terwijl de
-- alt-tekst eronder "Lodge De Eik mit privatem Whirlpool und eigener
-- Fasssauna im Freien" zegt. De alt-tekst is op 21 september meeverhuisd met
-- de sauna, de foto niet — dus stond er een beschrijving van De Eik onder een
-- foto van De Heide.
--
-- Het is bovendien de pagina over wellness, en de sauna staat bij De Eik: die
-- lodge hoort hier in beeld. De Nederlandse tegenhanger
-- (/wellness-vakantie-drenthe) gebruikt /lodge-eik.jpg al; hiermee staan de
-- twee taalversies weer gelijk.
--
-- De og_image van deze pagina is leeg en wordt daarom door /api/og/landing
-- gegenereerd; die hoeft dus niet mee te veranderen.
--
-- Idempotent: draait deze migratie opnieuw, dan staat dezelfde waarde er al.

update landing_pages
   set hero_image = '/lodge-eik.jpg',
       updated_at = now()
 where slug = 'de/wellness-urlaub-drenthe';

-- Controle na afloop: hoort /lodge-eik.jpg terug te geven, met een alt-tekst
-- die over dezelfde lodge gaat.
--
--   select slug, hero_image, hero_image_alt from landing_pages
--    where slug = 'de/wellness-urlaub-drenthe';
