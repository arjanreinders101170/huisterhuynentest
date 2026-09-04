-- De twee lodgepagina's: /lodge-de-heide en /lodge-de-eik (o26-5, o26-6)
--
-- Er was tot nu toe geen enkele pagina per lodge. Dat is een SEO-gat — long
-- tail als "huisje met sauna en hottub" of "vakantiehuisje zeijen" had nergens
-- een bestemming — maar vooral een gat in de funnel: de bezoeker sprong van een
-- themapagina rechtstreeks naar een aanvraagformulier waarin de lodgekeuze de
-- eerste vraag was. Er was geen stap waarin hij een lodge kóós, terwijl kiezen
-- precies de stap is die twijfel omzet in commitment.
--
-- De pagina's staan ook in src/lib/landing-seed.ts en worden zonder deze
-- migratie al geserveerd: de route valt terug op de seed zolang er geen rij in
-- de database staat. Deze migratie zet ze er alsnog in, zodat ze in de admin te
-- bewerken zijn zoals alle andere landingspagina's. Bewust géén "Importeer
-- standaardpagina's": die knop upsert álle pagina's en overschrijft ook wat er
-- elders met de hand is aangepast.
--
-- Idempotent: on conflict do nothing, dus opnieuw draaien verandert niets en
-- een pagina die in de admin is herschreven blijft ongemoeid.

insert into landing_pages (
  slug, breadcrumb, eyebrow, h1, hero_sub, hero_image, hero_image_alt, hero_focus,
  price_from, intro, sections, faq, related, cta_title, cta_body, meta_title,
  meta_description, og_image, key_facts, updated_at, gepubliceerd, sort_order
) values
  (
    'lodge-de-heide',
    'Lodge De Heide',
    'Lodge De Heide · Zeijen · 4 personen',
    'Lodge De Heide — met eigen sauna en hottub op de heide',
    'De enige van de twee met een eigen sauna. Panoramisch uitzicht over heide en bos, een hottub op het terras die het hele jaar op 38 °C staat, en verder niemand in zicht.',
    '/lodge-heide.jpg',
    'Lodge De Heide met privé-hottub op het terras en panoramisch uitzicht over de Drentse heide bij Zeijen',
    '',
    'Vanaf €165 per nacht',
    'Van de twee lodges op het terrein is De Heide degene met de sauna. Dat is niet een extraatje bij de rest — het is de reden dat mensen deze lodge kiezen. U stookt hem op wanneer u wilt, zonder tijdslot en zonder mede-gasten, en stapt daarna het terras op waar de hottub al warm staat. Ervoor ligt de heide, en verder niets.',
    '[{"eyebrow":"De inventaris","heading":"Wat er in de lodge zit","body":["Een lodgepagina zonder concrete inventaris is een foto met een prijs eronder. Daarom hieronder wat er werkelijk in staat, zodat u niet hoeft te mailen om te weten of u een koffiezetapparaat moet meenemen."],"bullets":["Twee slaapplekken-indelingen: een tweepersoonsbed en een tweede kamer, samen tot vier personen.","Volledig uitgeruste keuken: oven, kookplaat, koelkast, vaatwasser, servies en pannen.","Eigen sauna binnen, te gebruiken wanneer u wilt — geen reservering, geen tijdslot.","Privé-hottub op het afgeschermde terras, het hele jaar door op 38 °C.","Gratis snel WiFi, gratis parkeren op eigen terrein en een gratis EV-laadpaal.","Digitale sloten: inchecken kan tot middernacht zonder dat iemand op u wacht."]},{"eyebrow":"Het onderscheid","heading":"De sauna en de hottub","body":["De hottub staat op beide terrassen; de sauna staat alleen hier. Dat verschil is groter dan het klinkt. Een hottub is een avondding — u gaat erin als het donker wordt en de dag klaar is. Een sauna is een ochtendding, of een middagding op een dag waarop het regent en u toch binnen blijft. Samen maken ze van een weekend iets dat niet van het weer afhangt.","Beide zijn volledig privé. Er is op het terrein geen gedeelde wellnessruimte, geen balie waar u langs moet en geen ander gezelschap dat op zijn beurt wacht. Wie hier de sauna aanzet, zet hem aan voor zichzelf.","De hottub hoeft u niet op te warmen: het water staat 24 uur per dag op 38 °C, ook in januari. Juist in de winter, met damp boven het water en kaal bos eromheen, is dat het moment waar gasten achteraf over vertellen."]},{"eyebrow":"Voor wie","heading":"Voor wie deze lodge is","body":["De Heide is in de eerste plaats een lodge voor twee. Een stel dat een weekend wil waarin niets moet, waar de sauna en het water het programma zijn en de heide het uitzicht. Voor een [romantisch weekend weg in Drenthe](/romantisch-weekend-weg-drenthe) is dit de lodge die het dichtst bij die belofte komt.","Met vier kan ook: twee stellen, of twee ouders met twee kinderen die groot genoeg zijn om hun eigen kamer te willen. Wilt u vooral samen koken en buiten eten met een groter gezelschap, dan is De Eik de betere keuze — daar staat de buitenkeuken."]},{"eyebrow":"Buiten","heading":"Het uitzicht en het terras","body":["Het terras kijkt uit op heide en bos, niet op de andere lodge. Dat is bij het plaatsen zo bedacht: de twee huizen staan op ruime afstand van elkaar en met de terrassen van elkaar af. U ziet vanaf uw eigen stoel geen ander gebouw.","Vanaf de deur loopt u de Zeijerstrubben in, een oud strubbenbos met kromgegroeide eiken. Het Ballooërveld met zijn schaapskudde ligt op twaalf minuten, het Nationaal Park Drentsche Aa op een kwartier. In augustus kleurt de [paarse heide](/heide-drenthe) het hele gebied — dan is dit uitzicht op zijn mooist."]},{"eyebrow":"Praktisch","heading":"Prijzen en beschikbaarheid","body":["De prijs begint bij €165 per nacht voor de hele lodge, niet per persoon. In de schoolvakanties, rond feestdagen en in het hoogseizoen ligt hij hoger. Bovenop de nachtprijs komen schoonmaakkosten en toeristenbelasting van de gemeente Tynaarlo; boekingskosten rekenen wij niet, omdat u rechtstreeks bij de eigenaar boekt.","Losse nachten verhuren wij niet. Er zijn twee wisseldagen — maandag en vrijdag — en daarmee drie vormen:"],"table":{"head":["Vorm","Aankomst","Vertrek","Nachten"],"rows":[["Weekend","Vrijdag","Zondag","2"],["Midweek","Maandag","Vrijdag","4"],["Week","Maandag","Zondag","6"]],"note":"U geeft uw datums door en krijgt binnen 24 uur een persoonlijk voorstel met de volledige prijsopbouw: nachtprijs, schoonmaak en toeristenbelasting als aparte regels."}},{"eyebrow":"De keuze","heading":"De Heide of De Eik?","body":["Kort: De Heide heeft de sauna en het uitzicht, De Eik heeft de buitenkeuken en de BBQ. Verder zijn ze gelijkwaardig — beide voor vier personen, beide met een eigen hottub, beide volledig privé en op hetzelfde terrein.","Gaat het u om wellness en om avonden binnen, dan is deze pagina de juiste. Gaat het u om buiten koken, lange tafels en een BBQ die de hele avond aan staat, [vergelijk dan met De Eik](/lodge-de-eik)."]}]'::jsonb,
    'Is de sauna privé? :: Ja, de sauna zit binnen in Lodge De Heide en is uitsluitend voor de gasten van deze lodge. Geen reservering, geen tijdslot, geen mede-gasten — er is op het terrein geen gedeelde wellnessruimte.
Heeft De Eik ook een sauna? :: Nee. De sauna is het onderscheid van De Heide. Lodge De Eik heeft in plaats daarvan een buitenkeuken met BBQ onder de eiken. Beide lodges hebben wel een eigen hottub op het terras.
Is de hottub het hele jaar warm? :: Ja, 24 uur per dag op 38 °C, ook in de winter. U hoeft niets op te warmen of aan te zetten.
Voor hoeveel personen is Lodge De Heide? :: Maximaal vier. De lodge is ingericht voor een stel of voor vier personen in twee slaapkamers.
Wat kost een verblijf in Lodge De Heide? :: Vanaf €165 per nacht voor de hele lodge, bij minimaal twee nachten. Schoonmaakkosten en toeristenbelasting komen daar nog bij; boekingskosten niet, omdat u rechtstreeks boekt.
Kan ik alleen deze lodge boeken? :: Ja. U kiest de lodge bij uw aanvraag en die keuze staat al voorgeselecteerd als u vanaf deze pagina naar de beschikbaarheid gaat.
Mag mijn hond mee? :: In overleg. Een hond kost €25 per verblijf; vermeld het even in uw bericht, dan stemmen wij het af.',
    'Lodge De Eik :: /lodge-de-eik
Wellness huisje Drenthe :: /wellness-vakantie-drenthe
Romantisch weekend weg Drenthe :: /romantisch-weekend-weg-drenthe
Paarse heide Drenthe :: /heide-drenthe',
    'Bekijk beschikbaarheid voor De Heide',
    'Uw keuze staat al klaar in het formulier. Geef uw datums door en u krijgt binnen 24 uur een persoonlijk voorstel met de volledige prijsopbouw.',
    'Lodge De Heide | Vakantiehuisje met Sauna & Hottub in Zeijen',
    'Lodge De Heide: vakantiehuisje voor 4 in Zeijen met eigen sauna, privé-hottub op het terras en uitzicht over de heide. Direct bij de eigenaar. Vanaf €165 p.n.',
    '',
    'Voor :: Maximaal 4 personen
Wellness :: Eigen sauna én hottub
Uitzicht :: Heide en bos, geen buren
Verblijf :: Weekend, midweek of week',
    '2026-09-04'::timestamptz,
    true,
    19
  ),
  (
    'lodge-de-eik',
    'Lodge De Eik',
    'Lodge De Eik · Zeijen · 4 personen',
    'Lodge De Eik — onder de eiken, met buitenkeuken en hottub',
    'De ruimste van de twee, met hoge plafonds en een buitenkeuken met BBQ onder oude eiken. Een hottub op het eigen terras, en een keuken waar u de hele avond buiten kunt blijven.',
    '/lodge-eik.jpg',
    'Lodge De Eik in Zeijen onder oude eiken, met buitenkeuken, BBQ en privé-hottub op het terras',
    '',
    'Vanaf €165 per nacht',
    'De Eik is het huis waar u buiten kookt. Onder de oude eiken staat een buitenkeuken met BBQ, met de tafel ernaast en de hottub op hetzelfde terras — een vakantiehuisje in Zeijen waar de avond buiten begint en daar ook eindigt. Binnen: hoge plafonds, ruimte voor vier en niets dat aan een vakantiepark doet denken.',
    '[{"eyebrow":"De inventaris","heading":"Wat er in de lodge zit","body":["De Eik is de ruimste van de twee. Dat merkt u vooral aan de hoogte: het is een omgebouwd gebouw met hoge plafonds, en dat maakt een verblijf met vier mensen aanzienlijk minder krap dan de vierkante meters doen vermoeden."],"bullets":["Ruimte voor maximaal vier personen, verdeeld over twee slaapplekken.","Volledig uitgeruste binnenkeuken: oven, kookplaat, koelkast, vaatwasser, servies en pannen.","Buitenkeuken met BBQ onder de eiken, met de eettafel op hetzelfde terras.","Privé-hottub op het terras, het hele jaar door op 38 °C.","Gratis snel WiFi, gratis parkeren op eigen terrein en een gratis EV-laadpaal.","Digitale sloten: inchecken kan tot middernacht zonder dat iemand op u wacht."]},{"eyebrow":"Het onderscheid","heading":"De buitenkeuken en de BBQ","body":["Buiten koken is iets anders dan een BBQ op het gras zetten. Hier staat een echte buitenkeuken: werkblad, BBQ en de ruimte om alles klaar te maken zonder tien keer naar binnen te lopen. Dat verandert hoe een avond verloopt — u staat niet om beurten binnen te koken terwijl de rest buiten zit, u bent er gewoon allemaal.","De eiken erboven doen de rest. Ze houden de middagzon eruit, waardoor het terras ook in juli bruikbaar blijft, en ze maken het geluid zachter dan u van een terras gewend bent. Als het eten op is, staat de hottub op twee meter.","Wat hier niet staat is een sauna. Die zit in de andere lodge, en dat is een eerlijk verschil in plaats van een omissie: [vergelijk met De Heide](/lodge-de-heide) als wellness voor u zwaarder weegt dan buiten koken."]},{"eyebrow":"Voor wie","heading":"Voor wie deze lodge is","body":["De Eik is de lodge voor gezelschappen die samen willen eten. Twee stellen die om beurten koken, een gezin met kinderen die de hele dag buiten zijn, of vier vrienden die vooral een lange tafel en een BBQ nodig hebben.","Ook met z''n tweeën werkt hij, en dan vooral in het voor- en naseizoen: de ruimte is dan luxe in plaats van overmaat. Zoekt u een weekend dat om wellness draait, dan is De Heide met haar sauna de betere keuze."]},{"eyebrow":"De ligging","heading":"Onder de eiken in Zeijen","body":["Zeijen is een van de brinkdorpen van Drenthe: een kerk, een brink, en daaromheen vrijwel meteen het veld. De lodge staat aan de rand daarvan, met de eiken eromheen en de Zeijerstrubben op loopafstand. Het centrum van Assen ligt op twintig minuten, wat ver genoeg is om er ''s avonds niets van te merken.","Vanaf de deur beginnen de wandelroutes; er lopen meer dan 1.000 kilometer fietspaden door de omgeving en de e-bike laadt u op de laadpaal op het terrein. Wie hier komt voor de streek zelf, vindt de routes op onze pagina''s over [wandelroutes in Drenthe](/wandelroutes-drenthe) en [fietsen in Drenthe](/fietsen-in-drenthe)."]},{"eyebrow":"Praktisch","heading":"Prijzen en beschikbaarheid","body":["De prijs begint bij €165 per nacht voor de hele lodge, niet per persoon. In de schoolvakanties, rond feestdagen en in het hoogseizoen ligt hij hoger. Bovenop de nachtprijs komen schoonmaakkosten en toeristenbelasting van de gemeente Tynaarlo; boekingskosten rekenen wij niet, omdat u rechtstreeks bij de eigenaar boekt.","Losse nachten verhuren wij niet. Er zijn twee wisseldagen — maandag en vrijdag — en daarmee drie vormen:"],"table":{"head":["Vorm","Aankomst","Vertrek","Nachten"],"rows":[["Weekend","Vrijdag","Zondag","2"],["Midweek","Maandag","Vrijdag","4"],["Week","Maandag","Zondag","6"]],"note":"U geeft uw datums door en krijgt binnen 24 uur een persoonlijk voorstel met de volledige prijsopbouw: nachtprijs, schoonmaak en toeristenbelasting als aparte regels."}},{"eyebrow":"De keuze","heading":"De Eik of De Heide?","body":["Kort: De Eik heeft de buitenkeuken en de ruimte, De Heide heeft de sauna en het panoramisch uitzicht. Verder zijn ze gelijkwaardig — beide voor vier personen, beide met een eigen hottub, beide volledig privé en op hetzelfde terrein.","Weet u het nog niet, kies dan op wat u ''s avonds wilt doen. Buiten eten met de BBQ aan: De Eik. De sauna in en daarna het water: De Heide."]}]'::jsonb,
    'Wat is er zo anders aan De Eik? :: De buitenkeuken met BBQ onder de eiken, en de ruimte: hoge plafonds en de ruimste van de twee lodges. Lodge De Heide heeft in plaats daarvan een eigen sauna en panoramisch uitzicht.
Zit er een sauna in Lodge De Eik? :: Nee. De sauna zit in Lodge De Heide. De Eik heeft wel dezelfde privé-hottub op het terras, het hele jaar door op 38 °C.
Kan ik het hele jaar buiten koken? :: De buitenkeuken staat onder de eiken en is het hele jaar te gebruiken; in de zomer houden de bomen de middagzon eruit. Voor slecht weer is er de volledig uitgeruste keuken binnen.
Voor hoeveel personen is Lodge De Eik? :: Maximaal vier, verdeeld over twee slaapplekken.
Hoe ver is het naar Assen? :: Zeijen ligt op ongeveer twintig minuten rijden van het centrum van Assen, en op korte afstand van het TT Circuit.
Wat kost een verblijf in Lodge De Eik? :: Vanaf €165 per nacht voor de hele lodge, bij minimaal twee nachten. Schoonmaakkosten en toeristenbelasting komen daar nog bij; boekingskosten niet, omdat u rechtstreeks boekt.
Mag mijn hond mee? :: In overleg. Een hond kost €25 per verblijf; vermeld het even in uw bericht, dan stemmen wij het af.',
    'Lodge De Heide :: /lodge-de-heide
Vakantiehuis bij Assen :: /vakantiehuis-assen
Vakantiehuis met hottub Drenthe :: /vakantiehuis-met-hottub-drenthe
Fietsen in Drenthe :: /fietsen-in-drenthe',
    'Bekijk beschikbaarheid voor De Eik',
    'Uw keuze staat al klaar in het formulier. Geef uw datums door en u krijgt binnen 24 uur een persoonlijk voorstel met de volledige prijsopbouw.',
    'Lodge De Eik | Vakantiehuisje met Hottub en Buitenkeuken, Zeijen',
    'Lodge De Eik: vakantiehuisje voor 4 in Zeijen met buitenkeuken, BBQ en privé-hottub op het terras. Onder de eiken, 20 min van Assen. Vanaf €165 per nacht.',
    '',
    'Voor :: Maximaal 4 personen
Buiten :: Buitenkeuken met BBQ
Ligging :: Zeijen, 20 min van Assen
Verblijf :: Weekend, midweek of week',
    '2026-09-04'::timestamptz,
    true,
    20
  )
on conflict (slug) do nothing;

-- ═══ De laatste vijf links uit de interne linkmatrix ═══
--
-- Deel 9 van seo-cro-revenue-plan-2027.md. Deze vijf konden in
-- 2026_09_03_interne_linkmatrix.sql nog niet: ze wijzen naar de lodgepagina's,
-- en die bestonden toen niet. Zonder deze updates staan ze alleen in de seed en
-- dus niet op de live pagina's, want de database wint van de seed.
--
-- Eén afwijking van de matrix. Die schrijft voor /hunebedden-drenthe de
-- ankertekst "Lodge De Heide, op 15 minuten" voor, maar dezelfde pagina zegt op
-- vier plaatsen dat hunebed D5 op vijf minuten (twee kilometer) ligt. Een anker
-- dat de eigen pagina tegenspreekt is erger dan een anker dat afwijkt van het
-- plan, dus hier staat "op vijf minuten".

update landing_pages
   set sections = replace(sections::text, 'Het verschil tussen de twee zit in de wellness, en daar zijn we eerlijk over: de sauna zit in Lodge De Heide.', 'Het verschil tussen de twee zit in de wellness, en daar zijn we eerlijk over: de sauna zit in [Lodge De Heide, met eigen sauna](/lodge-de-heide).')::jsonb,
       updated_at = now()
 where slug = 'wellness-vakantie-drenthe'
   and position('Het verschil tussen de twee zit in de wellness, en daar zijn we eerlijk over: de sauna zit in Lodge De Heide.' in sections::text) > 0;

update landing_pages
   set sections = replace(sections::text, 'Lodge De Heide — luxe lodge met sauna, privé-hottub en panoramisch uitzicht over het bos.', '[Lodge De Heide](/lodge-de-heide) — luxe lodge met sauna, privé-hottub en panoramisch uitzicht over het bos.')::jsonb,
       updated_at = now()
 where slug = 'vakantiehuis-met-hottub-drenthe'
   and position('Lodge De Heide — luxe lodge met sauna, privé-hottub en panoramisch uitzicht over het bos.' in sections::text) > 0;

update landing_pages
   set sections = replace(sections::text, 'Lodge De Eik — ruime lodge onder de eiken met buitenkeuken, BBQ en eigen hottub.', '[Lodge De Eik](/lodge-de-eik) — ruime lodge onder de eiken met buitenkeuken, BBQ en eigen hottub.')::jsonb,
       updated_at = now()
 where slug = 'vakantiehuis-met-hottub-drenthe'
   and position('Lodge De Eik — ruime lodge onder de eiken met buitenkeuken, BBQ en eigen hottub.' in sections::text) > 0;

update landing_pages
   set sections = replace(sections::text, 'Lodge De Heide heeft bovendien een eigen sauna; Lodge De Eik een buitenkeuken met BBQ.', 'Lodge De Heide heeft bovendien een eigen sauna; [onze ruimste lodge](/lodge-de-eik), De Eik, een buitenkeuken met BBQ.')::jsonb,
       updated_at = now()
 where slug = 'vakantiehuis-assen'
   and position('Lodge De Heide heeft bovendien een eigen sauna; Lodge De Eik een buitenkeuken met BBQ.' in sections::text) > 0;

update landing_pages
   set sections = replace(sections::text, 'Geen receptie, geen gedeelde wellness, geen buren.', 'Geen receptie, geen gedeelde wellness, geen buren — en met [Lodge De Heide, op vijf minuten](/lodge-de-heide) van hunebed D5 slaapt u dichter bij de stenen dan waar ook.')::jsonb,
       updated_at = now()
 where slug = 'hunebedden-drenthe'
   and position('Geen receptie, geen gedeelde wellness, geen buren.' in sections::text) > 0;
