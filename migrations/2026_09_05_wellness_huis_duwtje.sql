-- "wellness huis drenthe" het laatste stukje naar de top 20 duwen (s26-12, vervolg)
--
-- In de septemberanalyse is "wellness huis drenthe" (82 vertoningen) 7,8
-- posities gestegen en staat daarmee net buiten de top 20 — de enige term in
-- de wellnesscluster die beweegt. De pagina die ervoor moet ranken,
-- /wellness-vakantie-drenthe, praat echter overal over een "huisje": het losse
-- woord "huis" stond alleen in de bijzin "u huurt een vrijstaand huis".
--
-- Deze migratie zet "wellness huis" op de plekken die tellen — feitenstrip,
-- hero, intro, twee sectiekoppen, twee FAQ-vragen, CTA en meta description —
-- zonder "huisje" uit de H1, de title of de breadcrumb te halen: dat is met
-- 128 vertoningen de grotere term en die mag niet inleveren.
--
-- Nieuw is verder een vergelijkingssectie met tabel (wellness huis versus
-- wellnesshotel versus dagspa). Dat is de afweging achter de zoekopdracht en
-- stond nergens op de site; hij komt als tweede sectie te staan, direct na
-- "Het verschil".
--
-- Tot slot de ankerteksten. Elke interne link naar deze pagina zei "wellness
-- huisje" of "wellness vakantie"; het losse woord kwam in geen enkel anker
-- voor. Drie ankers gaan om, waaronder de contextlink op /hunebedden-drenthe —
-- met 568 vertoningen op positie 13 de sterkste donorpagina van de site.
--
-- Dezelfde wijzigingen staan in src/lib/landing-seed.ts (de seed) en in
-- src/lib/site.ts (het footerlabel). Deze migratie doet hetzelfde voor de
-- rijen die al in de database staan — de database wint van de seed. Bewust
-- géén "Importeer standaardpagina's": die knop upsert álle landingspagina's
-- en overschrijft ook handmatige aanpassingen elders.
--
-- Idempotent: elke update heeft een where-clausule die controleert of de
-- wijziging er al in zit, dus opnieuw draaien verandert niets.

-- 1. Hero, intro, feitenstrip, CTA en meta van de wellnesspagina.
update landing_pages set
  hero_sub         = 'Geen gedeelde spa, geen openingstijden, geen onbekenden in bad. U huurt een heel wellness huis voor uzelf op de heide bij Zeijen, met een eigen hottub op het terras en een sauna die alleen van u is.',
  hero_image_alt   = 'Wellness huis in Drenthe: Lodge De Eik met privé-hottub op het terras, omringd door bos bij Zeijen',
  intro            = 'Een wellness huisje in Drenthe is iets anders dan een wellnesshotel met een dagkaart. Hier is er geen balie, geen tijdslot en geen gedeelde sauna: u huurt een heel wellness huis op de heide bij Zeijen, met een hottub op uw eigen terras die het hele jaar op 38 °C staat. Lodge De Heide heeft daarnaast een eigen sauna. Er staan maar twee huizen op het terrein, dus wie u tegenkomt bepaalt u zelf.',
  key_facts        = 'Wat u huurt :: Een heel wellness huis, privé
Wellness :: Eigen sauna (De Heide) en hottub
Tijdslot :: Geen — 24/7 op 38 °C
Waar :: Op de heide bij Zeijen, 20 min van Assen',
  cta_title        = 'Boek uw eigen wellness huis in Drenthe',
  meta_description = 'Een heel wellness huis in Drenthe voor u alleen: sauna en hottub zonder tijdslot of mede-gasten. Twee vrijstaande huisjes op de heide bij Zeijen. Vanaf €165 p.n.',
  updated_at       = now()
 where slug = 'wellness-vakantie-drenthe'
   and hero_sub is distinct from 'Geen gedeelde spa, geen openingstijden, geen onbekenden in bad. U huurt een heel wellness huis voor uzelf op de heide bij Zeijen, met een eigen hottub op het terras en een sauna die alleen van u is.';

-- 2. Twee sectiekoppen: "privé wellness" was een categorie, geen belofte.
update landing_pages set
  sections   = replace(
                 replace(sections::text,
                   'Privé wellness: geen openingstijden, geen onbekenden',
                   'Een heel wellness huis voor uzelf: geen openingstijden, geen onbekenden'),
                 'Wat er in het huisje zit: sauna, hottub en een terras dat niemand inkijkt',
                 'Wat er in het wellness huis zit: sauna, hottub en een terras dat niemand inkijkt')::jsonb,
  updated_at = now()
 where slug = 'wellness-vakantie-drenthe'
   and sections::text like '%Privé wellness: geen openingstijden%';

-- Het eyebrow van diezelfde sectie loopt mee met de kop.
update landing_pages set
  sections   = replace(sections::text, '"eyebrow":"In het huisje"', '"eyebrow":"In het huis"')::jsonb,
  updated_at = now()
 where slug = 'wellness-vakantie-drenthe'
   and sections::text like '%"eyebrow":"In het huisje"%';

-- 3. De vergelijkingstabel als tweede sectie, direct na "Het verschil".
update landing_pages set
  sections   = jsonb_insert(sections, '{1}', '{"eyebrow":"De vergelijking","heading":"Wellness huis, wellnesshotel of dagspa: wat u waar krijgt","body":["Wie in Drenthe naar wellness zoekt, kiest in de praktijk uit drie dingen: een dagkaart bij een spa, een kamer in een wellnesshotel, of een eigen wellness huis waarin de sauna en de hottub bij het verblijf horen. Per persoon per dag schelen die drie minder dan u zou denken. Het verschil zit in wat u ervoor terugkrijgt."],"table":{"head":["Waarop u let","Eigen wellness huis","Wellnesshotel","Dagspa"],"rows":[["Wie deelt het water","Niemand, alleen uw gezelschap","Alle hotelgasten","Alle bezoekers van die dag"],["Openingstijden","Geen, 24/7 op 38 °C","Meestal tot 21 of 22 uur","Dagdeel of dagkaart"],["Reserveren per sessie","Nee","Vaak wel voor de privésauna","Ja"],["Badkleding","Uw eigen keuze","Huisregels van het hotel","Huisregels van het complex"],["''s Avonds laat nog het water in","Ja, zonder aankleden of rijden","Als de afdeling nog open is","Nee, dan bent u al thuis"]],"note":"Zo staat het bij Huis ter Huynen. Bij andere aanbieders kan het per huis of hotel verschillen — vraag vooral na of de sauna daar privé is of gedeeld."}}'::jsonb),
  updated_at = now()
 where slug = 'wellness-vakantie-drenthe'
   and sections::text not like '%Waarop u let%';

-- 4. Twee FAQ-vragen erbij, bovenaan. Ze voeden ook de FAQPage-structured data.
update landing_pages set
  faq        = 'Wat is een wellness huis precies? :: Een vrijstaand vakantiehuis waarin de wellness zelf zit: bij ons een hottub op het eigen terras en, in Lodge De Heide, een eigen sauna. U huurt het hele huis, dus er is geen gedeelde ruimte, geen balie en geen tijdslot — het water is van u zolang u er bent.
Wat kost een wellness huis in Drenthe? :: Bij ons vanaf €165 per nacht voor de hele lodge, niet per persoon, bij minimaal twee nachten. Schoonmaakkosten en toeristenbelasting komen daarbij; boekingskosten niet, omdat u rechtstreeks bij de eigenaar boekt.' || chr(10) || faq,
  updated_at = now()
 where slug = 'wellness-vakantie-drenthe'
   and faq not like '%Wat is een wellness huis precies?%';

-- 5. Ankerteksten van de interne links naar deze pagina.
update landing_pages set
  related    = replace(related,
                 'Wellness vakantie Drenthe :: /wellness-vakantie-drenthe',
                 'Wellness huis met sauna :: /wellness-vakantie-drenthe'),
  updated_at = now()
 where related like '%Wellness vakantie Drenthe :: /wellness-vakantie-drenthe%';

update landing_pages set
  related    = replace(related,
                 'Wellness huisje Drenthe :: /wellness-vakantie-drenthe',
                 'Wellness huis in Drenthe :: /wellness-vakantie-drenthe'),
  updated_at = now()
 where slug = 'wandelroutes-drenthe'
   and related like '%Wellness huisje Drenthe :: /wellness-vakantie-drenthe%';

-- De contextlink op de hunebeddenpagina: de sterkste donor van de site.
update landing_pages set
  sections   = replace(sections::text,
                 '[een wellness huisje op de heide](/wellness-vakantie-drenthe)',
                 '[een wellness huis op de heide](/wellness-vakantie-drenthe)')::jsonb,
  updated_at = now()
 where slug = 'hunebedden-drenthe'
   and sections::text like '%[een wellness huisje op de heide](/wellness-vakantie-drenthe)%';
