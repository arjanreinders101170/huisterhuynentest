-- "Hottub" wordt het enige woord voor het bad — op de hele site.
--
-- Op 18 augustus is /vakantiehuis-met-hottub-drenthe juist naar "jacuzzi"
-- omgeschreven (migrations/2026_08_18_lp3_jacuzzi.sql): dat woord levert 754
-- vertoningen op tegen 249 voor "hottub". Die keuze is op verzoek van de
-- eigenaar teruggedraaid — één term door de hele site, en dat is "hottub".
-- Twee woorden door elkaar leest voor een gast als twee verschillende
-- voorzieningen, dus dit is bewust een alles-of-niets-wijziging.
--
-- De seed in src/lib/landing-seed.ts en de metadata in src/app/layout.tsx zijn
-- gelijk bijgewerkt; deze migratie doet hetzelfde voor de rijen die al in de
-- database staan (de database wint van de seed). Bewust géén "Importeer
-- standaardpagina's": die knop upsert álle landingspagina's en overschrijft ook
-- handmatige aanpassingen elders.
--
-- Idempotent: replace() op tekst die het woord niet meer bevat verandert niets,
-- dus opnieuw draaien is veilig. Alleen rijen die het woord echt bevatten
-- krijgen een nieuwe updated_at, zodat de lastmod in de sitemap niet onnodig
-- verspringt.

-- 1. Landingspagina's: alle tekstvelden plus de secties (jsonb).
update landing_pages set
  breadcrumb       = replace(replace(breadcrumb,       'Jacuzzi', 'Hottub'), 'jacuzzi', 'hottub'),
  eyebrow          = replace(replace(eyebrow,          'Jacuzzi', 'Hottub'), 'jacuzzi', 'hottub'),
  h1               = replace(replace(h1,               'Jacuzzi', 'Hottub'), 'jacuzzi', 'hottub'),
  hero_sub         = replace(replace(hero_sub,         'Jacuzzi', 'Hottub'), 'jacuzzi', 'hottub'),
  hero_image_alt   = replace(replace(hero_image_alt,   'Jacuzzi', 'Hottub'), 'jacuzzi', 'hottub'),
  intro            = replace(replace(intro,            'Jacuzzi', 'Hottub'), 'jacuzzi', 'hottub'),
  faq              = replace(replace(faq,              'Jacuzzi', 'Hottub'), 'jacuzzi', 'hottub'),
  related          = replace(replace(related,          'Jacuzzi', 'Hottub'), 'jacuzzi', 'hottub'),
  cta_title        = replace(replace(cta_title,        'Jacuzzi', 'Hottub'), 'jacuzzi', 'hottub'),
  cta_body         = replace(replace(cta_body,         'Jacuzzi', 'Hottub'), 'jacuzzi', 'hottub'),
  meta_title       = replace(replace(meta_title,       'Jacuzzi', 'Hottub'), 'jacuzzi', 'hottub'),
  meta_description = replace(replace(meta_description, 'Jacuzzi', 'Hottub'), 'jacuzzi', 'hottub'),
  -- sections is jsonb; over de tekstrepresentatie vervangen en terugcasten.
  sections   = replace(replace(sections::text, 'Jacuzzi', 'Hottub'), 'jacuzzi', 'hottub')::jsonb,
  updated_at = now()
where concat_ws(' ', breadcrumb, eyebrow, h1, hero_sub, hero_image_alt, intro,
                faq, related, cta_title, cta_body, meta_title, meta_description,
                sections::text) ilike '%jacuzzi%';

-- 2. Blogartikelen: titel, intro en de inhoud zelf.
update blog_posts set
  titel      = replace(replace(titel,  'Jacuzzi', 'Hottub'), 'jacuzzi', 'hottub'),
  intro      = replace(replace(intro,  'Jacuzzi', 'Hottub'), 'jacuzzi', 'hottub'),
  inhoud     = replace(replace(inhoud, 'Jacuzzi', 'Hottub'), 'jacuzzi', 'hottub'),
  updated_at = now()
where concat_ws(' ', titel, intro, inhoud) ilike '%jacuzzi%';

-- 3. Twee zinnen die na een woordvervanging onzin worden: ze gingen juist over
--    het verschil tussen de twee woorden. Zelfde tekst als in de seed.
update landing_pages
   set intro = replace(
         intro,
         'op 38 °C en van niemand anders. Of u het nu een hottub of een hottub noemt — het is dezelfde privébadkuip in de buitenlucht. Geen gedeelde wellness',
         'op 38 °C en van niemand anders. Geen gedeelde wellness'),
       updated_at = now()
 where slug = 'vakantiehuis-met-hottub-drenthe'
   and intro like '%een hottub of een hottub noemt%';

update landing_pages
   set faq = replace(
         faq,
         'Wat is het verschil tussen een hottub en een hottub? :: In de praktijk niets: beide woorden worden gebruikt voor een bad met warm, bruisend water in de buitenlucht. Bij Huis ter Huynen staat bij elke lodge zo''n bad op het eigen terras, met massagestralen en verwarmd water.',
         'Wat voor bad is de hottub precies? :: Een buitenbad met warm, bruisend water en massagestralen, ingebouwd op uw eigen terras. Het water staat het hele jaar op 38 °C, dus u hoeft niets op te warmen of aan te zetten — u stapt erin wanneer u wilt.'),
       updated_at = now()
 where slug = 'vakantiehuis-met-hottub-drenthe'
   and faq like '%verschil tussen een hottub en een hottub%';

-- 4. De meta title zei na de vervanging twee keer hetzelfde woord.
update landing_pages
   set meta_title = 'Vakantiehuis met Hottub in Drenthe | Privé Lodge bij Zeijen',
       updated_at = now()
 where slug = 'vakantiehuis-met-hottub-drenthe'
   and meta_title = 'Vakantiehuis met Hottub Drenthe | Privé Hottub bij Elke Lodge';
