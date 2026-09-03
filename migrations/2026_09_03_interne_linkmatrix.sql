-- Interne linkmatrix: contextuele links in de lopende tekst
--
-- Deel 9 van seo-cro-revenue-plan-2027.md: de pagina's die Google waardeert
-- (/hunebedden-drenthe op positie 13 met 568 vertoningen, /heide-drenthe op
-- 9,7, en de blogs op positie 6–10) gaven hun autoriteit tot nu toe alleen
-- generiek door via het footerblok. Deze migratie zet de donorlinks uit de
-- matrix in de zin waar ze thuishoren, met de ankertekst uit het plan.
--
-- De syntaxis [tekst](/pad) wordt sinds src/lib/tekst.tsx door de landings-
-- en blogrenderer omgezet naar een echte link; zonder die code blijft dit
-- letterlijke tekst op de pagina. Deze migratie hoort dus bij die release.
--
-- Idempotent en veilig: elke update grijpt alleen aan zolang de oorspronkelijke
-- zin nog letterlijk in de tekst staat. Is een pagina in de admin herschreven,
-- dan gebeurt er niets en blijft die versie ongemoeid. De seeds in
-- src/lib/landing-seed.ts en src/lib/blog-seed.ts zijn gelijk bijgewerkt.
--
-- Twee donorlinks uit de matrix zitten hier bewust niet in: beide wijzen naar
-- /lodge-de-heide en /lodge-de-eik, en die pagina's bestaan nog niet (taken
-- o26-5 en o26-6). Ze horen bij de release waarin die pagina's live gaan.

-- ═══ Landingspagina's: donorlinks en links tussen commerciële pagina's ═══

update landing_pages
   set sections = replace(sections::text, 'Twee volledig privé lodges, elk met een eigen hottub op het terras, vormen de perfecte basis voor een paar dagen heide kijken.', 'Twee volledig privé lodges, elk met een eigen hottub op het terras, vormen de perfecte basis voor een paar dagen heide kijken — een [vakantiehuis met privé-jacuzzi aan de heide](/vakantiehuis-met-hottub-drenthe) in de meest letterlijke zin.')::jsonb,
       updated_at = now()
 where slug = 'heide-drenthe'
   and position('Twee volledig privé lodges, elk met een eigen hottub op het terras, vormen de perfecte basis voor een paar dagen heide kijken.' in sections::text) > 0;

update landing_pages
   set sections = replace(sections::text, 'Dat contrast — een dag in de uitgestrekte natuur, een avond in volledige privacy — is precies waarom gasten hier graag terugkomen.', 'Dat contrast — een dag in de uitgestrekte natuur, een avond in volledige privacy — is precies waarom gasten hier graag terugkomen. Komt u met z''n tweeën, dan is dit het seizoen voor [een romantisch weekend tijdens de heidebloei](/romantisch-weekend-weg-drenthe).')::jsonb,
       updated_at = now()
 where slug = 'heide-drenthe'
   and position('Dat contrast — een dag in de uitgestrekte natuur, een avond in volledige privacy — is precies waarom gasten hier graag terugkomen.' in sections::text) > 0;

update landing_pages
   set sections = replace(sections::text, 'Lodge De Heide heeft daarnaast een eigen sauna en panoramisch uitzicht over het bos; Lodge De Eik een buitenkeuken met BBQ onder de eiken.', 'Lodge De Heide heeft daarnaast een eigen sauna en panoramisch uitzicht over het bos — in de praktijk [een wellness huisje op de heide](/wellness-vakantie-drenthe); Lodge De Eik een buitenkeuken met BBQ onder de eiken.')::jsonb,
       updated_at = now()
 where slug = 'hunebedden-drenthe'
   and position('Lodge De Heide heeft daarnaast een eigen sauna en panoramisch uitzicht over het bos; Lodge De Eik een buitenkeuken met BBQ onder de eiken.' in sections::text) > 0;

update landing_pages
   set sections = replace(sections::text, 'U komt aan, u zet uw tas neer en u kunt binnen tien minuten in de jacuzzi liggen.', 'U komt aan, u zet uw tas neer en u kunt binnen tien minuten in de jacuzzi liggen. Gaat het u vooral om dat water, dan leest u op de pagina over ons [vakantiehuis met privé-jacuzzi](/vakantiehuis-met-hottub-drenthe) hoe het per lodge is opgesteld.')::jsonb,
       updated_at = now()
 where slug = 'wellness-vakantie-drenthe'
   and position('U komt aan, u zet uw tas neer en u kunt binnen tien minuten in de jacuzzi liggen.' in sections::text) > 0;

update landing_pages
   set sections = replace(sections::text, 'Dat is het beeld dat mensen zich van dit weekend herinneren, en het is precies waarom een privé-jacuzzi meer doet dan een wellnessabonnement.', 'Dat is het beeld dat mensen zich van dit weekend herinneren, en het is precies waarom een privé-jacuzzi meer doet dan een wellnessabonnement. Hoe [de jacuzzi op het terras](/vakantiehuis-met-hottub-drenthe) er per lodge bij staat, ziet u op de jacuzzipagina.')::jsonb,
       updated_at = now()
 where slug = 'romantisch-weekend-weg-drenthe'
   and position('Dat is het beeld dat mensen zich van dit weekend herinneren, en het is precies waarom een privé-jacuzzi meer doet dan een wellnessabonnement.' in sections::text) > 0;

-- ═══ Blogs: de best rankende artikelen geven door aan de commerciële pagina's ═══

update blog_posts
   set inhoud = replace(inhoud, 'perfect om spieren te ontspannen en de dag op het water rustig te laten landen, met uitzicht op het bos in plaats van op een drukke parkeerplaats.', 'perfect om spieren te ontspannen en de dag op het water rustig te laten landen, met uitzicht op het bos in plaats van op een drukke parkeerplaats. Lodge De Heide heeft daarnaast een eigen sauna: [de sauna in na een dag op het water](/wellness-vakantie-drenthe) is precies waar een wellnessverblijf voor bedoeld is.')
 where slug = 'kanovaren-drentsche-aa'
   and position('perfect om spieren te ontspannen en de dag op het water rustig te laten landen, met uitzicht op het bos in plaats van op een drukke parkeerplaats.' in inhoud) > 0;

update blog_posts
   set inhoud = replace(inhoud, 'Huis ter Huynen biedt hier twee volledig privé lodges, Lodge De Heide en Lodge De Eik, allebei met een eigen terras en hottub. Na een dag wandelen rond Norg', 'Huis ter Huynen biedt hier twee volledig privé lodges, Lodge De Heide en Lodge De Eik, allebei met een eigen terras en hottub — [overnachten vlak bij Norg](/vakantiehuis-norg), zonder in het dorp zelf te zitten. Na een dag wandelen rond Norg')
 where slug = 'een-dag-in-norg'
   and position('Huis ter Huynen biedt hier twee volledig privé lodges, Lodge De Heide en Lodge De Eik, allebei met een eigen terras en hottub. Na een dag wandelen rond Norg' in inhoud) > 0;

update blog_posts
   set inhoud = replace(inhoud, 'Wie nieuwsgierig is naar de exacte tarieven, kan zich gratis aanmelden voor de nieuwsbrief', 'Wie wil zien [wat een lodge met jacuzzi bij ons kost](/vakantiehuis-met-hottub-drenthe), vindt daar de opzet en de vanafprijs van beide lodges terug. Wie de exacte tarieven per datum wil weten, kan zich gratis aanmelden voor de nieuwsbrief')
 where slug = 'prive-lodge-boeken-nederland-kosten'
   and position('Wie nieuwsgierig is naar de exacte tarieven, kan zich gratis aanmelden voor de nieuwsbrief' in inhoud) > 0;

update blog_posts
   set inhoud = replace(inhoud, 'Na een dag wandelen of fietsen langs de beek is er weinig fijner dan terugkomen op je eigen plek', 'Na een dag [wandelen langs de Drentsche Aa](/wandelroutes-drenthe) of fietsen langs de beek is er weinig fijner dan terugkomen op je eigen plek')
 where slug = 'drentsche-aa-beekdallandschap'
   and position('Na een dag wandelen of fietsen langs de beek is er weinig fijner dan terugkomen op je eigen plek' in inhoud) > 0;

update blog_posts
   set inhoud = replace(inhoud, 'Na een dag fietsen is het terras met hottub van Lodge De Heide of Lodge De Eik de ideale plek om moe maar voldaan terug te keren.', 'De mooiste [fietsroutes vanuit Zeijen](/fietsen-in-drenthe) staan bij elkaar op onze fietspagina. Na een dag fietsen is het terras met hottub van Lodge De Heide of Lodge De Eik de ideale plek om moe maar voldaan terug te keren.')
 where slug = 'e-bike-huren-in-drenthe'
   and position('Na een dag fietsen is het terras met hottub van Lodge De Heide of Lodge De Eik de ideale plek om moe maar voldaan terug te keren.' in inhoud) > 0;

-- Deze twee artikelen staan alleen in de database en niet in blog-seed.ts; hun
-- lopende tekst is in de repo niet bekend. Daarom geen ingreep midden in de
-- tekst maar een slotalinea erachter, met dezelfde ankertekst uit de matrix.

update blog_posts
   set inhoud = inhoud || chr(10) || chr(10) || '## Wild spotten dichter bij huis

Voor reeën, buizerds en met wat geluk een vos hoef je niet per se naar het Drents-Friese Wold. Rond Zeijen liggen [wandelroutes waar je ze ziet](/wandelroutes-drenthe): het Zeijerveld in de vroege ochtend, de Zeijerstrubben aan het eind van de middag. Huis ter Huynen ligt er middenin, met twee volledig privé lodges en een terras dat uitkijkt op bos in plaats van op andere gasten.'
 where slug = 'wilde-dieren-spotten-in-het-drents-friese-wold'
   and position('](/wandelroutes-drenthe)' in inhoud) = 0;

update blog_posts
   set inhoud = inhoud || chr(10) || chr(10) || '## Een uitvalsbasis midden in het fietsgebied

Wie deze routes vanaf de deur wil rijden, zit goed in [een vakantiehuis bij Assen als uitvalsbasis](/vakantiehuis-assen): Zeijen ligt op twintig minuten van de stad en midden in het knooppuntennetwerk. Bij Huis ter Huynen staan twee privé lodges met een laadpaal op het terrein, zodat een e-bike ''s nachts weer vol staat.'
 where slug = 'mooie-fietsroutes-rondom-zeijen-ontdek-het-mooiste-van-drenthe-op-de-fiets'
   and position('](/vakantiehuis-assen)' in inhoud) = 0;

-- ═══ "Ontdek ook": van maximaal acht naar vier gerichte verwijzingen ═══
--
-- Samen met het oude footerblok van dertien links kreeg elke landingspagina
-- meer dan twintig generieke interne links. De renderer toont er nu vier; deze
-- update zorgt dat de opgeslagen inhoud daarmee overeenkomt en dat die vier de
-- commerciële ontvangers zijn in plaats van vier andere omgevingspagina's.
--
-- Twee verwijzingen staan er bewust in om een gat te dichten dat de nieuwe
-- footerindeling maakt: /fochteloerveen-drenthe en /vakantiehuis-drenthe-met-hond
-- komen in geen enkele footerset voor en zouden anders helemaal geen interne
-- link meer krijgen. Ze staan nu op de pagina waar ze inhoudelijk thuishoren.
--
-- Strengere voorwaarde dan bij de tekstupdates hierboven: alleen als de hele
-- lijst nog letterlijk de oude is. Wie in de admin zelf verwijzingen heeft
-- gekozen, houdt die.

update landing_pages
   set related = 'Luxe lodge in Drenthe :: /luxe-lodge-drenthe
Vakantiehuis met jacuzzi Drenthe :: /vakantiehuis-met-hottub-drenthe
Bijzonder overnachten Drenthe :: /bijzonder-overnachten-drenthe
Vakantiehuis bij Assen :: /vakantiehuis-assen',
       updated_at = now()
 where slug = 'hunebedden-drenthe'
   and related = 'Luxe lodge in Drenthe :: /luxe-lodge-drenthe
Vakantiehuis met jacuzzi Drenthe :: /vakantiehuis-met-hottub-drenthe
Bijzonder overnachten Drenthe :: /bijzonder-overnachten-drenthe
Vakantiehuis bij Assen :: /vakantiehuis-assen
Fietsen in Drenthe :: /fietsen-in-drenthe
Wandelroutes in Drenthe :: /wandelroutes-drenthe
Overnachten bij Veenhuizen :: /overnachten-veenhuizen
Omgeving & activiteiten :: /omgeving';

update landing_pages
   set related = 'Vakantiehuis met jacuzzi Drenthe :: /vakantiehuis-met-hottub-drenthe
Wellness huisje Drenthe :: /wellness-vakantie-drenthe
Paarse heide Drenthe :: /heide-drenthe
Fietsen in Drenthe :: /fietsen-in-drenthe',
       updated_at = now()
 where slug = 'wandelroutes-drenthe'
   and related = 'De Drentsche Aa: het beekdallandschap :: /blog/drentsche-aa-beekdallandschap
Fietsen in Drenthe :: /fietsen-in-drenthe
Fochteloërveen :: /fochteloerveen-drenthe
Paarse heide Drenthe :: /heide-drenthe
Hunebedden in Drenthe :: /hunebedden-drenthe
Vakantiehuis in Drenthe met hond :: /vakantiehuis-drenthe-met-hond
Omgeving & activiteiten :: /omgeving';

update landing_pages
   set related = 'Vakantiehuis met jacuzzi Drenthe :: /vakantiehuis-met-hottub-drenthe
Vakantiehuis bij Assen :: /vakantiehuis-assen
Wandelroutes in Drenthe :: /wandelroutes-drenthe
Fochteloërveen :: /fochteloerveen-drenthe',
       updated_at = now()
 where slug = 'fietsen-in-drenthe'
   and related = 'Wandelroutes in Drenthe :: /wandelroutes-drenthe
Hunebedden in Drenthe :: /hunebedden-drenthe
Paarse heide Drenthe :: /heide-drenthe
Fochteloërveen :: /fochteloerveen-drenthe
Omgeving & activiteiten :: /omgeving';

update landing_pages
   set related = 'Luxe lodge in Drenthe :: /luxe-lodge-drenthe
Romantisch weekend weg Drenthe :: /romantisch-weekend-weg-drenthe
Wellness vakantie Drenthe :: /wellness-vakantie-drenthe
Paarse heide Drenthe :: /heide-drenthe',
       updated_at = now()
 where slug = 'bijzonder-overnachten-drenthe'
   and related = 'Luxe lodge in Drenthe :: /luxe-lodge-drenthe
Romantisch weekend weg Drenthe :: /romantisch-weekend-weg-drenthe
Wellness vakantie Drenthe :: /wellness-vakantie-drenthe
Paarse heide Drenthe :: /heide-drenthe
Hunebedden in Drenthe :: /hunebedden-drenthe';

update landing_pages
   set related = 'Bijzonder overnachten in Drenthe :: /bijzonder-overnachten-drenthe
Vakantiehuis met hottub Drenthe :: /vakantiehuis-met-hottub-drenthe
Hunebedden in Drenthe :: /hunebedden-drenthe
Vakantiehuis in Drenthe met hond :: /vakantiehuis-drenthe-met-hond',
       updated_at = now()
 where slug = 'heide-drenthe'
   and related = 'Bijzonder overnachten in Drenthe :: /bijzonder-overnachten-drenthe
Vakantiehuis met hottub Drenthe :: /vakantiehuis-met-hottub-drenthe
Hunebedden in Drenthe :: /hunebedden-drenthe
Omgeving & activiteiten :: /omgeving';
