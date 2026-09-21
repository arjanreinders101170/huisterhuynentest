-- Specificaties op /lodge-de-heide: personen, slaapkamers, badkamer, oppervlak.
--
-- De pagina noemde het aantal personen wel (in de eyebrow en in de FAQ) en de
-- slaapkamers alleen terloops in een opsomming ("een tweepersoonsbed en een
-- tweede kamer"). Het aantal badkamers en het oppervlak stonden nergens — niet
-- op de pagina, niet in de seed, nergens in de repo.
--
-- Dat zijn precies de vier gegevens die een bezoeker het eerst zoekt en die een
-- zoekmachine of AI-systeem letterlijk kan overnemen. Ze staan nu in de
-- feitenbalk bovenaan de pagina, waar ze zonder lezen te vinden zijn.
--
-- De waarden komen van de eigenaar (21 september 2026):
--   4 personen · 2 slaapkamers · 1 badkamer · 60 m²
--
-- Twee slaapkamers stond trouwens al in de eigen FAQ van de pagina
-- ("ingericht voor een stel of voor vier personen in twee slaapkamers"), dus
-- dat bevestigt elkaar.
--
-- Bewust ongemoeid gelaten: elke uitspraak over de sauna. De vraag bij welke
-- lodge die hoort, staat open en raakt de hele site — H1, intro, een complete
-- sectie, beide lodgepagina's, de Duitse site, het schema en de blog. Die
-- correctie hoort in een eigen migratie, niet als bijvangst hiervan.
--
-- Idempotent: draait deze migratie opnieuw, dan staat dezelfde waarde er al.

update landing_pages
   set key_facts = 'Personen :: Maximaal 4
Slaapkamers :: 2
Badkamer :: 1
Oppervlakte :: 60 m²
Wellness :: Eigen sauna én hottub
Uitzicht :: Heide en bos, geen buren
Verblijf :: Weekend, midweek of week',
       updated_at = now()
 where slug = 'lodge-de-heide';

-- Controle na afloop: hoort zeven regels terug te geven.
--
--   select slug, key_facts from landing_pages where slug = 'lodge-de-heide';
