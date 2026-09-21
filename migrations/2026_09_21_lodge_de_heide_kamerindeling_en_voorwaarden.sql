-- Kamerindeling, praktische informatie, huisregels en annuleren op
-- /lodge-de-heide.
--
-- De pagina beschreef de lodge wel, maar liet vier dingen ongezegd die een
-- gast juist vóór het boeken zoekt: hoe de kamers zijn ingedeeld, hoe laat
-- in- en uitchecken kan, wat de huisregels zijn en wat er gebeurt bij
-- annuleren. Dat laatste stond alleen in de algemene voorwaarden, drie klikken
-- verderop.
--
-- Alle waarden zijn gecontroleerd tegen wat de site elders al zegt en komen
-- exact overeen:
--
--   inchecken 15:00-21:00      -> /faq ("Inchecken kan tussen 15:00 en 21:00")
--   uitchecken 11:00           -> checkOutTime in de JSON-LD
--   verhuurperiodes            -> VERBLIJFSVORMEN in lib/stay-dates.ts
--   huisdieren EUR 25          -> fee-sjabloon 'Huisdier' (migratie 2026_05_15)
--   annuleringsstaffel         -> artikel 4.1 van /terms
--   omboeken + EUR 25          -> artikel 4.3 van /terms
--
-- De wijzigingsvergoeding van EUR 25 bij omboeken staat er bewust bij; die
-- stond wel in de voorwaarden maar niet in de samenvatting, en een kostenpost
-- weglaten uit een samenvatting is misleidend.
--
-- Bewust ongemoeid: elke uitspraak over de sauna. Die vraag staat open en
-- hoort in een eigen wijziging.
--
-- De JSON hieronder is gegenereerd uit src/lib/landing-seed.ts, zodat de
-- database en de seed niet uit elkaar kunnen lopen. Wie de secties aanpast,
-- genereert deze migratie opnieuw in plaats van de JSON met de hand bij te
-- werken.
--
-- Idempotent: draait deze migratie opnieuw, dan staat dezelfde inhoud er al.
--
-- BIJGEWERKT 21 september: de blokken gebruiken nu kaarten, label/waarde-regels
-- en een pictogramrij in plaats van tabellen en opsommingen, conform het
-- aangeleverde ontwerp. Elk item heeft een eigen pictogram; een onbekende
-- naam levert géén icoon op in plaats van een willekeurig symbool.

update landing_pages
   set sections = '[{"eyebrow": "De inventaris", "heading": "Wat er in de lodge zit", "body": ["Een lodgepagina zonder concrete inventaris is een foto met een prijs eronder. Daarom hieronder wat er werkelijk in staat, zodat u niet hoeft te mailen om te weten of u een koffiezetapparaat moet meenemen."], "bullets": ["Twee slaapplekken-indelingen: een tweepersoonsbed en een tweede kamer, samen tot vier personen.", "Volledig uitgeruste keuken: oven, kookplaat, koelkast, vaatwasser, servies en pannen.", "Eigen sauna binnen, te gebruiken wanneer u wilt — geen reservering, geen tijdslot.", "Privé-hottub op het afgeschermde terras, het hele jaar door op 38 °C.", "Gratis snel WiFi, gratis parkeren op eigen terrein en een gratis EV-laadpaal.", "Digitale sloten: inchecken kan tot middernacht zonder dat iemand op u wacht."]}, {"heading": "Kamerindeling", "body": ["Vier personen past hier zonder te schuiven: twee slaapkamers, elk met een eigen opzet, en een woonkamer waar met z''n vieren aan tafel gegeten kan worden."], "cards": [{"titel": "Slaapkamer 1", "items": [{"icon": "bed", "tekst": "2-persoons bed 1×"}]}, {"titel": "Slaapkamer 2", "items": [{"icon": "bed", "tekst": "1-persoons bed 2×"}]}, {"titel": "Badkamer", "items": [{"icon": "douche", "tekst": "Douche 1×"}, {"icon": "toilet", "tekst": "Toilet 1×"}]}, {"titel": "Woonkamer", "items": [{"icon": "tafel", "tekst": "Eettafel met stoelen"}, {"icon": "tv", "tekst": "TV 1×"}]}, {"titel": "Keuken", "items": [{"icon": "vaatwasser", "tekst": "Afwasmachine 1×"}, {"icon": "koelkast", "tekst": "Koelkast 1×"}, {"icon": "magnetron", "tekst": "Combimagnetron 1×"}, {"icon": "fornuis", "tekst": "Fornuis 1×"}]}], "note": "De lodge is 60 m² en biedt plaats aan maximaal vier personen."}, {"eyebrow": "Het onderscheid", "heading": "De sauna en de hottub", "body": ["De hottub staat op beide terrassen; de sauna staat alleen hier. Dat verschil is groter dan het klinkt. Een hottub is een avondding — u gaat erin als het donker wordt en de dag klaar is. Een sauna is een ochtendding, of een middagding op een dag waarop het regent en u toch binnen blijft. Samen maken ze van een weekend iets dat niet van het weer afhangt.", "Beide zijn volledig privé. Er is op het terrein geen gedeelde wellnessruimte, geen balie waar u langs moet en geen ander gezelschap dat op zijn beurt wacht. Wie hier de sauna aanzet, zet hem aan voor zichzelf.", "De hottub hoeft u niet op te warmen: het water staat 24 uur per dag op 38 °C, ook in januari. Juist in de winter, met damp boven het water en kaal bos eromheen, is dat het moment waar gasten achteraf over vertellen."]}, {"eyebrow": "Voor wie", "heading": "Voor wie deze lodge is", "body": ["De Heide is in de eerste plaats een lodge voor twee. Een stel dat een weekend wil waarin niets moet, waar de sauna en het water het programma zijn en de heide het uitzicht. Voor een [romantisch weekend weg in Drenthe](/romantisch-weekend-weg-drenthe) is dit de lodge die het dichtst bij die belofte komt.", "Met vier kan ook: twee stellen, of twee ouders met twee kinderen die groot genoeg zijn om hun eigen kamer te willen. Wilt u vooral samen koken en buiten eten met een groter gezelschap, dan is De Eik de betere keuze — daar staat de buitenkeuken."]}, {"eyebrow": "Buiten", "heading": "Het uitzicht en het terras", "body": ["Het terras kijkt uit op heide en bos, niet op de andere lodge. Dat is bij het plaatsen zo bedacht: de twee huizen staan op ruime afstand van elkaar en met de terrassen van elkaar af. U ziet vanaf uw eigen stoel geen ander gebouw.", "Vanaf de deur loopt u de Zeijerstrubben in, een oud strubbenbos met kromgegroeide eiken. Het Ballooërveld met zijn schaapskudde ligt op twaalf minuten, het Nationaal Park Drentsche Aa op een kwartier. In augustus kleurt de [paarse heide](/heide-drenthe) het hele gebied — dan is dit uitzicht op zijn mooist."]}, {"eyebrow": "Praktisch", "heading": "Prijzen en beschikbaarheid", "body": ["De prijs begint bij €165 per nacht voor de hele lodge, niet per persoon. In de schoolvakanties, rond feestdagen en in het hoogseizoen ligt hij hoger. Bovenop de nachtprijs komen schoonmaakkosten en toeristenbelasting van de gemeente Tynaarlo; boekingskosten rekenen wij niet, omdat u rechtstreeks bij de eigenaar boekt.", "Losse nachten verhuren wij niet. Er zijn twee wisseldagen — maandag en vrijdag — en daarmee drie vormen:"], "table": {"head": ["Vorm", "Aankomst", "Vertrek", "Nachten"], "rows": [["Weekend", "Vrijdag", "Zondag", "2"], ["Midweek", "Maandag", "Vrijdag", "4"], ["Week", "Maandag", "Zondag", "6"]], "note": "U geeft uw datums door en krijgt binnen 24 uur een persoonlijk voorstel met de volledige prijsopbouw: nachtprijs, schoonmaak en toeristenbelasting als aparte regels."}}, {"heading": "Praktische informatie", "body": [], "rows": [{"label": "Geschikt voor", "waarde": "1 – 4 personen"}, {"label": "Verhuurperiodes", "waarde": "Midweek (ma – vr), weekend (vr – zo) of week (ma – zo)"}, {"label": "Inchecken", "waarde": "Van 15:00 tot 21:00"}, {"label": "Uitchecken", "waarde": "Uiterlijk 11:00"}], "note": "Later aankomen dan 21:00 kan zonder extra kosten: de lodge heeft digitale sloten die tot middernacht werken, en er is geen receptie waar u zich hoeft te melden."}, {"heading": "Huisregels", "body": [], "marks": [{"icon": "nietRoken", "tekst": "Niet roken binnen"}, {"icon": "huisdier", "tekst": "Huisdieren toegestaan (€25)"}, {"icon": "geenFeest", "tekst": "Geen feesten of evenementen"}], "subheading": "Aanvullende huisregels", "dots": ["Tussen 22:00 en 08:00 uur geldt de nachtrust.", "Roken mag buiten, op de daarvoor bestemde plek.", "Alleen de directe omgeving van deze accommodatie is vuurwerkvrij."]}, {"heading": "Annuleren", "body": ["De volledige voorwaarden staan in de [algemene voorwaarden](/terms); dit is de samenvatting die er voor uw boeking toe doet."], "bullets": ["Tot 60 dagen voor aankomst krijgt u alles terug, op €25 administratiekosten na.", "Tussen 60 en 30 dagen voor aankomst 70%, tussen 30 en 14 dagen 50% en tussen 14 en 7 dagen 25%.", "Binnen 7 dagen voor aankomst is er geen restitutie.", "Omboeken kan tot 30 dagen voor aankomst, na goedkeuring en afhankelijk van beschikbaarheid. Daarvoor geldt een wijzigingsvergoeding van €25."]}, {"eyebrow": "De keuze", "heading": "De Heide of De Eik?", "body": ["Kort: De Heide heeft de sauna en het uitzicht, De Eik heeft de buitenkeuken en de BBQ. Verder zijn ze gelijkwaardig — beide voor vier personen, beide met een eigen hottub, beide volledig privé en op hetzelfde terrein.", "Gaat het u om wellness en om avonden binnen, dan is deze pagina de juiste. Gaat het u om buiten koken, lange tafels en een BBQ die de hele avond aan staat, [vergelijk dan met De Eik](/lodge-de-eik)."]}]'::jsonb,
       updated_at = now()
 where slug = 'lodge-de-heide';

-- Controle: hoort 10 secties te geven.
--
--   select jsonb_array_length(sections) from landing_pages where slug = 'lodge-de-heide';
