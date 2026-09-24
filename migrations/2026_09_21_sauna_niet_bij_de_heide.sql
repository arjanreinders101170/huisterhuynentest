-- De sauna hoort bij De Eik: de laatste plekken die nog iets anders beweerden.
--
-- Op 21 september is de sauna van Lodge De Heide naar Lodge De Eik verhuisd
-- (migrations/2026_09_21_sauna_van_de_heide_naar_de_eik.sql). Die migratie
-- pakte de dragende teksten: de twee lodgepagina's, de secties en de FAQ's.
-- Wat bleef staan waren de korte teksten — hero's, intro's, meta-descriptions
-- en één FAQ-antwoord — en juist die zijn het zichtbaarst: de hero leest de
-- bezoeker als eerste, de meta-description staat in de zoekresultaten.
--
-- Twee varianten van dezelfde fout:
--
--   1. De verkeerde lodge bij naam. /wellness-vakantie-drenthe zei in de intro
--      "Lodge De Heide heeft daarnaast een eigen sauna", terwijl de sectie
--      eronder op dezelfde pagina al "de sauna zit bij Lodge De Eik" zei. De
--      Duitse tegenhanger deed hetzelfde: "einer eigenen Sauna in Lodge De
--      Heide".
--
--   2. De sauna aan beide lodges toegeschreven. "Twee volledig privé lodges
--      met hottub en sauna", "Zwei Boutique Lodges ... mit Whirlpool & Sauna",
--      "een eigen hottub en sauna". Er is één sauna, en die staat buiten bij
--      De Eik. Een gast van De Heide die hierop boekt, staat bij aankomst voor
--      een lodge zonder sauna — dat is de duurste soort fout die een tekst kan
--      maken.
--
-- De regel die nu overal geldt: de hottub is van beide lodges, de buitensauna
-- is van De Eik. Waar de sauna in een paginatitel of H1 staat (de wellness-
-- pagina heet niet voor niets zo) blijft die staan: de pagina gáát over het
-- aanbod, en de tekst eronder zegt nu bij welke lodge de sauna hoort.
--
-- De meta-descriptions zijn binnen hun oude lengte gebleven, zodat ze in de
-- SERP niet alsnog afgekapt worden.
--
-- Dezelfde correcties staan in src/lib/landing-seed.ts, plus in de code die
-- niet uit de database komt: de JSON-LD van beide layouts, de Duitse
-- homepage, de omgevingspagina en de blog-CTA.
--
-- Idempotent: de replace()-regels vinden na één keer draaien niets meer, en
-- de overige velden krijgen dezelfde waarde als ze al hebben.

update landing_pages
   set hero_sub = 'Geen gedeelde spa, geen openingstijden, geen onbekenden in bad. Twee vrijstaande wellness huisjes op de heide bij Zeijen, allebei met een eigen hottub op het terras en bij Lodge De Eik een buitensauna die alleen van u is.',
       intro = 'Een wellness huisje in Drenthe is iets anders dan een wellnesshotel met een dagkaart. Hier is er geen balie, geen tijdslot en geen gedeelde sauna: u huurt een vrijstaand huis op de heide bij Zeijen, met een hottub op uw eigen terras die het hele jaar op 38 °C staat. Lodge De Eik heeft daarnaast een eigen buitensauna. Er staan maar twee huisjes op het terrein, dus wie u tegenkomt bepaalt u zelf.',
       meta_description = 'Een wellness huisje in Drenthe waar het water van u alleen is. Privé-hottub bij beide lodges, buitensauna bij De Eik, 24/7 op temperatuur. Vanaf €165 p.n.',
       updated_at = now()
 where slug = 'wellness-vakantie-drenthe';

update landing_pages
   set hero_sub = 'Twee boutique lodges midden in de Drentse natuur. Stijlvol ingericht, volledig privé, allebei met een eigen hottub en bij De Eik een buitensauna — alle comfort voor een verblijf dat klopt tot in het detail.',
       meta_description = 'Luxe boutique lodge in Drenthe, op de heide bij Zeijen. Twee volledig privé lodges met hottub, De Eik met buitensauna. 20 min van Assen. Boek direct.',
       updated_at = now()
 where slug = 'luxe-lodge-drenthe';

update landing_pages
   set hero_sub = 'Niet zomaar een vakantiehuisje, maar een verblijf dat bijblijft. Twee boutique lodges op de Drentse heide — met privé-hottub, een buitensauna bij De Eik en een omgeving die u nergens anders vindt.',
       meta_description = 'Bijzonder overnachten in Drenthe: twee boutique lodges met privé-hottub op de heide bij Zeijen, De Eik met buitensauna. Volledig privé. Vanaf €165 per nacht.',
       updated_at = now()
 where slug = 'bijzonder-overnachten-drenthe';

update landing_pages
   set meta_description = 'Ferienhaus mit privatem Whirlpool in Drenthe (NL). Zwei Boutique Lodges auf der Heide bei Zeijen, De Eik mit Fasssauna. Ruhe, Natur und Luxus. Ab €165 pro Nacht.',
       updated_at = now()
 where slug = 'de/ferienhaus-mit-whirlpool-drenthe';

update landing_pages
   set hero_sub = 'Zwei Boutique Lodges inmitten der Drentse Natur. Stilvoll eingerichtet, vollständig privat, beide mit eigenem Whirlpool und De Eik mit Fasssauna — allem Komfort für einen Aufenthalt, der bis ins Detail stimmt.',
       meta_description = 'Luxus Boutique Lodge in Drenthe, auf der Heide bei Zeijen. Zwei vollständig private Lodges mit Whirlpool, De Eik mit Fasssauna, 20 Min. von Assen. Jetzt direkt buchen.',
       updated_at = now()
 where slug = 'de/luxus-lodge-drenthe';

update landing_pages
   set hero_sub = 'Ein privater Whirlpool auf der Terrasse, bei Lodge De Eik eine eigene Fasssauna, und die stillste Natur der Niederlande um Sie herum. Bei Huis ter Huynen ist Wellness keine Abteilung, sondern das gesamte Erlebnis.',
       intro = 'Ein Wellness Urlaub in Drenthe geht über eine Stunde Sauna hinaus. Hier ist die Natur selbst die Quelle der Ruhe: Stilleregionen, endlose Heide und Wälder, in denen Sie niemandem begegnen. Bei Huis ter Huynen verbinden Sie diese Ruhe mit echtem Luxus — einem privaten Whirlpool, einer eigenen Fasssauna im Freien bei Lodge De Eik und allem Komfort, um vollständig zu sich selbst zu finden.',
       meta_description = 'Wellness Urlaub in Drenthe: private Lodge mit eigenem Whirlpool auf der Heide bei Zeijen, De Eik mit Fasssauna. Stille, 20 Min. von Assen. Ab €165 pro Nacht.',
       updated_at = now()
 where slug = 'de/wellness-urlaub-drenthe';

-- Twee tekstvelden die verder ongemoeid blijven: één FAQ-antwoord en één
-- sectiealinea. Daar wordt alleen de betreffende zin vervangen, zodat de rest
-- van het (lange) veld niet opnieuw hoeft te worden weggeschreven.

update landing_pages
   set faq = replace(
         faq,
         'volledige privacy, een eigen hottub en sauna, een authentiek ingerichte lodge',
         'volledige privacy, een eigen hottub op het terras — bij Lodge De Eik met een buitensauna erbij — een authentiek ingerichte lodge'),
       updated_at = now()
 where slug = 'bijzonder-overnachten-drenthe'
   and faq like '%een eigen hottub en sauna%';

update landing_pages
   set sections = replace(
         sections::text,
         'warmes, sprudelndes Wasser in Ihrem privaten Whirlpool, eine Sauna, die nur Ihnen gehört, und eine Lodge',
         'warmes, sprudelndes Wasser in Ihrem privaten Whirlpool, in Lodge De Eik eine Fasssauna, die nur Ihnen gehört, und eine Lodge')::jsonb,
       updated_at = now()
 where slug = 'de/wellness-urlaub-drenthe'
   and sections::text like '%eine Sauna, die nur Ihnen gehört%';

-- Controle na afloop: hoort nul regels terug te geven.
--
--   select slug from landing_pages
--    where hero_sub || ' ' || intro || ' ' || coalesce(meta_description, '')
--          || ' ' || coalesce(faq, '') || ' ' || sections::text
--          ilike '%eigen sauna in Lodge De Heide%'
--       or hero_sub || ' ' || coalesce(meta_description, '') ilike '%hottub en sauna%'
--       or hero_sub || ' ' || coalesce(meta_description, '') ilike '%Whirlpool und Sauna%';
