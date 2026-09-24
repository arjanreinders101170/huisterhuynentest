-- Kortere hero-koppen op /lodge-de-heide en /lodge-de-eik.
--
-- Beide koppen waren geschreven als een opsomming van alles wat de lodge te
-- bieden heeft. Op het formaat van de themapagina's (tot 48px) liep dat over
-- drie regels, en dan staat er boven de vouw niets anders meer dan die kop:
-- de subtekst, de twee knoppen en de prijs vielen eronder weg.
--
--   De Heide: "Lodge De Heide — privé-hottub en panoramisch uitzicht op de heide"
--   De Eik:   "Lodge De Eik — met eigen buitensauna, buitenkeuken en hottub"
--
-- "Panoramisch uitzicht op de heide" herhaalde bovendien de naam van de lodge
-- die twee woorden eerder al in dezelfde zin stond. Wat de lodge verder heeft
-- staat een paar centimeter lager al in de feitenbalk en in de secties — de
-- kop hoeft dat niet vooruit te vertellen.
--
-- De zoektermen blijven staan: de lodgenaam, "privé-hottub" bij De Heide en
-- "buitensauna" plus "buitenkeuken" bij De Eik. Alleen de vulling is weg.
--
-- Het formaat zelf is in de code aangepast (LandingTemplate, heroCompact):
-- op de twee lodgepagina's gaat de kop van 48px naar 34px. Dat hoort daar en
-- niet hier — het is een rendervraag, geen inhoud.
--
-- Idempotent: draait deze migratie opnieuw, dan staat dezelfde tekst er al.

update landing_pages
   set h1 = 'Lodge De Heide — privé-hottub en vrij uitzicht',
       hero_sub = 'De enige van de twee met vrij uitzicht over heide en bos. Een hottub op het terras, het hele jaar op 38 °C, en geen enkel gebouw in zicht.',
       updated_at = now()
 where slug = 'lodge-de-heide';

update landing_pages
   set h1 = 'Lodge De Eik — buitensauna, buitenkeuken en hottub',
       hero_sub = 'De enige van de twee met een eigen buitensauna. Een buitenkeuken met BBQ onder oude eiken, en een hottub op het eigen terras.',
       updated_at = now()
 where slug = 'lodge-de-eik';

-- Controle na afloop: twee regels, beide koppen onder de vijftig tekens.
--
--   select slug, h1, length(h1) from landing_pages
--    where slug in ('lodge-de-heide', 'lodge-de-eik');
