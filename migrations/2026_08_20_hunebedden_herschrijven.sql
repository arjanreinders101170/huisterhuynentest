-- /hunebedden-drenthe volledig herschreven.
--
-- Waarom: dit is met 568 vertoningen op positie 13 de best presterende pagina
-- van de site, en tegelijk de pagina waar de meeste winst ligt. "hunebedden
-- drenthe" is een informatieve zoekopdracht; de pagina beantwoordde die niet
-- en bevatte bovendien twee feitfouten:
--
--   1. "Drenthe telt 54 van de 54 Nederlandse hunebedden" — het zijn er 52;
--      de andere twee liggen in Groningen (Noordlaren en Heveskesklooster).
--   2. "de dichtstbijzijnde hunebedden (D9-D14 bij Anloo) in minder dan tien
--      minuten" — Anloo ligt op circa 25 minuten, en D9 ligt bij Annen. Het
--      werkelijk dichtstbijzijnde hunebed is D5, twee kilometer verderop aan
--      de weg van Zeijen naar Peest. Dat is precies het argument dat geen
--      enkele concurrent kan overnemen, en het stond nergens op de pagina.
--
-- Verder: hero was een foto van het Gevangenismuseum in Veenhuizen met als
-- alt-tekst "Hunebed in het Drentse landschap". Die foto stond ook als
-- og_image ingesteld, dus elke deelbare preview van de hunebeddenpagina
-- toonde een gevangenis. heide2.jpg toont wél een hunebed.
--
-- Twee nieuwe kolommen:
--   key_facts  — "Label :: Waarde" per regel, de feitenstrip onder de hero.
--   about      — het onderwerp van de pagina voor de structured data.
--
-- De seed in src/lib/landing-seed.ts is gelijk bijgewerkt; deze migratie doet
-- hetzelfde voor de rij die al in de database staat (de database wint van de
-- seed). Bewust géén "Importeer standaardpagina's": die knop upsert álle
-- landingspagina's en overschrijft ook handmatige aanpassingen elders.

alter table landing_pages add column if not exists key_facts text not null default '';
alter table landing_pages add column if not exists about jsonb;
alter table landing_pages add column if not exists hero_focus text not null default '';

comment on column landing_pages.key_facts is
  'Feitenstrip onder de hero: "Label :: Waarde" per regel. Leeg = blok verbergen.';
comment on column landing_pages.about is
  'Onderwerp van de pagina los van de accommodatie; voedt about in de JSON-LD.';
comment on column landing_pages.hero_focus is
  'CSS object-position voor de hero, bijv. "28% 72%". Leeg = "center 45%".';

update landing_pages set
  breadcrumb       = 'Hunebedden Drenthe',
  eyebrow          = '52 hunebedden · Zeijen · Drenthe',
  h1               = 'Hunebedden in Drenthe: alle 52 op een rij',
  hero_sub         = 'Drenthe telt 52 van de 54 Nederlandse hunebedden. Hieronder waar ze liggen, welke de moeite waard zijn en wat een bezoek kost — plus twee lodges op vijf minuten van hunebed D5 bij Zeijen.',
  hero_image       = '/heide2.jpg',
  hero_image_alt   = 'Hunebed op een zandvlakte tussen bloeiende heide en berken in Drenthe, bij zonsopkomst',
  hero_focus       = '28% 72%',
  intro            = 'Nergens in Nederland liggen zoveel hunebedden als in Drenthe: 52 van de 54. Ze zijn zo''n 5.000 jaar oud, vrij toegankelijk en liggen verspreid van Steenbergen in het noordwesten tot Emmen in het zuidoosten. Deze pagina zet op een rij hoeveel er zijn, waar ze liggen, welke u gezien moet hebben en wat u praktisch moet weten — geschreven vanuit Zeijen, waar hunebed D5 op twee kilometer van de deur ligt.',
  key_facts        = concat_ws(chr(10),
    'Aantal in Drenthe :: 52 van de 54 in Nederland',
    'Ouderdom :: Circa 5.000 jaar (3400–3100 v.Chr.)',
    'Toegang :: Gratis, het hele jaar door',
    'Dichtstbij de lodge :: D5 Zeijen — 5 minuten'
  ),
  about            = '{"name":"Hunebedden in Drenthe","type":"TouristAttraction","description":"De 52 megalietgraven van de trechterbekercultuur in de provincie Drenthe, gebouwd tussen 3400 en 3100 v.Chr.","url":"https://nl.wikipedia.org/wiki/Hunebed"}'::jsonb,
  sections         = '[
  {
    "eyebrow": "Het aantal",
    "heading": "Hoeveel hunebedden heeft Drenthe?",
    "body": [
      "Drenthe telt 52 hunebedden. Nederland heeft er 54 in totaal: de overige twee liggen in Groningen, bij Noordlaren (G1) en bij Heveskesklooster (G5). Ruim negentig procent van alle Nederlandse megalietgraven ligt dus in één provincie — en dat is geen toeval, want alleen hier liet het landijs de zwerfkeien achter waarmee ze gebouwd konden worden.",
      "De Drentse hunebedden dragen nummers van D1 tot en met D54, wat verwarrend genoeg 54 nummers zijn voor 52 monumenten. Archeoloog Albert Egges van Giffen nummerde ze in de jaren twintig van west naar oost, en twee nummers vielen later af: D33 is verdwenen en D48 bleek bij nader onderzoek helemaal geen hunebed te zijn. De nummering is sindsdien bewust niet hernummerd, zodat oudere opgravingsverslagen bruikbaar blijven.",
      "Het zwaartepunt ligt op de Hondsrug, tussen Anloo en Emmen. Maar ook Noord-Drenthe heeft er een reeks — en daar staat het rustigste deel van de verzameling, zonder bezoekerscentrum, zonder parkeerplaats en meestal zonder andere bezoekers."
    ]
  },
  {
    "eyebrow": "In de buurt",
    "heading": "Welke hunebedden liggen het dichtst bij Zeijen?",
    "body": [
      "Het dichtstbijzijnde hunebed is D5, aan de weg van Zeijen naar Peest, tegenover natuurgebied de Zeijerstrubben. Vanaf de lodge is dat vijf minuten fietsen. D5 ligt in een laagte, is vanaf de weg nauwelijks te zien en heeft geen parkeerterrein of informatiezuil — u staat er meestal alleen. Vlak ernaast ligt het Noordse Veld, met celtic fields en grafheuvels een van de rijkste archeologische landschappen van Drenthe.",
      "Vanaf Zeijen liggen de meeste andere hunebedden binnen een halfuur rijden. Deze tabel geeft de reistijd met de auto en waarom het betreffende hunebed het bezoek waard is."
    ],
    "table": {
      "head": [
        "Hunebed",
        "Plaats",
        "Vanaf Zeijen",
        "Waarom erheen"
      ],
      "rows": [
        [
          "D5",
          "Zeijen",
          "± 5 min",
          "Het dichtstbijzijnde hunebed. Geen parkeerplaats, geen drukte — naast het Noordse Veld."
        ],
        [
          "D2",
          "Westervelde",
          "± 15 min",
          "Klein en rustig gelegen aan de rand van het dorp, te combineren met Norg."
        ],
        [
          "D6",
          "Tynaarlo",
          "± 15 min",
          "Een van de weinige hunebedden waarvan alle dekstenen nog op hun plaats liggen."
        ],
        [
          "D10",
          "Gasteren",
          "± 20 min",
          "Bescheiden restant in een weids, open landschap bij de Drentsche Aa."
        ],
        [
          "D8",
          "Anloo",
          "± 25 min",
          "Bij het brinkdorp Anloo, goed te combineren met een wandeling door het beekdal."
        ],
        [
          "D17 en D18",
          "Rolde",
          "± 25 min",
          "Twee hunebedden pal naast de middeleeuwse kerk — nergens staan ze zo in het dorp."
        ],
        [
          "D27",
          "Borger",
          "± 35 min",
          "Het grootste hunebed van Nederland (22,6 m), naast het Hunebedcentrum."
        ],
        [
          "D53 en D54",
          "Havelte",
          "± 50 min",
          "D53 is met bijna 18 meter het op één na grootste van het land."
        ]
      ],
      "note": "Reistijden bij benadering, met de auto vanaf Zeijen. D5 en D2 zijn ook prima met de fiets te doen."
    }
  },
  {
    "eyebrow": "De hoogtepunten",
    "heading": "De mooiste en grootste hunebedden van Drenthe",
    "body": [
      "Welk hunebed het mooiste is, hangt af van wat u zoekt: het grootste, het gaafste of het stilste. Deze vijf dekken alle drie."
    ],
    "bullets": [
      "D27 in Borger — het grootste van Nederland: 22,6 meter, negen dekstenen, en de zwaarste steen die ooit in een Nederlands hunebed is gebruikt (naar schatting 20 ton).",
      "D53 bij Havelte — met bijna achttien meter het op één na grootste, en dankzij de open ligging op de Havelterberg het fotogeniekste bij laagstaande zon.",
      "D6 bij Tynaarlo — een van de weinige hunebedden waarvan alle dekstenen nog liggen zoals ze vijfduizend jaar geleden zijn neergelegd.",
      "D17 en D18 in Rolde — twee hunebedden pal naast de middeleeuwse dorpskerk, het duidelijkste bewijs dat deze plekken millennia lang bijzonder zijn gebleven.",
      "D5 bij Zeijen — geen record, wel de rust: geen bordjes, geen parkeerterrein, en op een doordeweekse ochtend meestal geen mens."
    ]
  },
  {
    "eyebrow": "Praktisch",
    "heading": "Hunebedden bezoeken: gratis, jaarrond, zonder openingstijden",
    "body": [
      "Een bezoek aan de hunebedden zelf kost niets. Ze liggen in het open landschap, in bermen, bossen en heidevelden, en zijn het hele jaar door vrij toegankelijk — er is geen kaartverkoop, geen hek en geen sluitingstijd. Alleen het Hunebedcentrum in Borger is een museum met entree.",
      "Wel gelden er ongeschreven regels. Hunebedden zijn rijksmonumenten: klimmen wordt afgeraden, want de stenen liggen los op elkaar en het schuren zet zich af op het monument. Honden mogen mee, maar in de omliggende natuurgebieden geldt vrijwel overal een aanlijnplicht. Parkeren kan bij de bekendere hunebedden op een aangelegde plek; bij de kleinere, zoals D5, is het een berm en niets meer."
    ],
    "bullets": [
      "Toegang tot de hunebedden zelf: gratis, het hele jaar, dag en nacht.",
      "Hunebedcentrum Borger: circa € 14,50 voor volwassenen en € 7,50 voor kinderen van 4 t/m 11 jaar; met Museumkaart gratis. Controleer de actuele tarieven en openingstijden vooraf.",
      "Beste moment: vroege ochtend of het laatste uur voor zonsondergang — dan geeft strijklicht de stenen reliëf en is het stil.",
      "Met kinderen: het buitenterrein van het Hunebedcentrum en de goed bereikbare hunebedden bij Rolde en Borger werken het beste.",
      "Stevige schoenen zijn genoeg; de meeste hunebedden liggen op enkele tientallen meters van de weg."
    ]
  },
  {
    "eyebrow": "De route",
    "heading": "De Hunebed Highway en een fietsroute vanaf Zeijen",
    "body": [
      "De N34 tussen Emmen en Groningen draagt de bijnaam Hunebed Highway: de weg volgt de Hondsrug en komt langs het grootste deel van de Drentse hunebedden. Wie ze in één dag wil zien, rijdt de N34 van zuid naar noord en pikt onderweg Borger, Drouwen, Eext en Anloo mee — met het Hunebedcentrum halverwege als natuurlijke lunchstop.",
      "Vanaf Zeijen is er ook een rustiger variant op de fiets. Via het Noordse Veld naar D5, door de Zeijerstrubben naar Ubbena, en verder over het knooppuntennetwerk richting Tynaarlo (D6) — een rondje van ongeveer 35 kilometer over vrijwel volledig autoluwe paden. Wie meer wil, rijdt door naar Rolde en het Ballooërveld en komt uit op zo''n 55 kilometer."
    ]
  },
  {
    "eyebrow": "De geschiedenis",
    "heading": "Wie bouwde de hunebedden, en hoe?",
    "body": [
      "De hunebedden zijn gebouwd tussen 3400 en 3100 v.Chr. door de trechterbekercultuur, genoemd naar het aardewerk dat in de grafkamers is teruggevonden. Ze dienden als collectieve graven: in één hunebed zijn resten van tientallen tot honderden mensen aangetroffen, samen met potten, bijlen en sieraden.",
      "De stenen zijn geen gehouwen blokken maar zwerfkeien, tijdens de voorlaatste ijstijd vanuit Scandinavië meegevoerd door het landijs en achtergelaten op het Drents plateau. Precies dáárom liggen de Nederlandse hunebedden vrijwel allemaal in Drenthe: verder zuidelijk kwam het ijs niet, en dus lag daar het bouwmateriaal niet.",
      "De naam heeft niets met de Hunnen te maken. ''Hune'' is een oud woord voor reus — de middeleeuwse verklaring voor stenen die te zwaar leken om door mensen verplaatst te zijn. Hoe het wél is gedaan, met glijbanen van hout, hefbomen en veel mankracht, is nog altijd deels reconstructie."
    ]
  },
  {
    "eyebrow": "De accommodatie",
    "heading": "Slapen bij de hunebedden: twee lodges in Zeijen",
    "body": [
      "In een hunebed slapen kan niet — het zijn rijksmonumenten. Ernaast wonen kan wel. Huis ter Huynen ligt in Zeijen, twee kilometer van hunebed D5, en telt twee volledig privé lodges voor maximaal vier personen, elk met een eigen hottub op het terras.",
      "Lodge De Heide heeft daarnaast een eigen sauna en panoramisch uitzicht over het bos; Lodge De Eik een buitenkeuken met BBQ onder de eiken. Beide hebben een volledig uitgeruste keuken, gratis wifi en een laadpaal op het terrein. Geen receptie, geen gedeelde wellness, geen buren.",
      "U boekt rechtstreeks bij de eigenaar: geen tussenpartij, geen boekingskosten, en direct contact met de gastheer over de beste route langs de hunebedden."
    ]
  },
  {
    "eyebrow": "De omgeving",
    "heading": "Meer dan hunebedden: prehistorie rond Zeijen",
    "body": [
      "De hunebedden zijn het zichtbaarste, maar niet het enige spoor uit de prehistorie. Direct naast D5 ligt het Noordse Veld: een heideveld met grafheuvels en celtic fields — de rechthoekige akkertjes van de ijzertijd, die u pas ziet als u weet waar u op moet letten. Archeologisch is dit een van de best bewaarde landschappen van de provincie.",
      "Verder in de omgeving geven het Drents Museum in Assen (20 minuten, met het Meisje van Yde) en het Hunebedcentrum in Borger de context bij wat u in het veld ziet staan. En wie na twee dagen prehistorie toe is aan gewoon buiten zijn: het Ballooërveld ligt op twaalf minuten, het Nationaal Park Drentsche Aa op een kwartier, en er lopen meer dan 1.000 kilometer fietspaden door de omgeving."
    ]
  }
]'::jsonb,
  faq              = concat_ws(chr(10),
    'Hoeveel hunebedden heeft Drenthe? :: Drenthe telt 52 hunebedden, van de 54 die Nederland in totaal heeft. De andere twee liggen in Groningen, bij Noordlaren en Heveskesklooster. De Drentse exemplaren zijn genummerd van D1 tot en met D54; D33 is verdwenen en D48 bleek geen hunebed, waardoor 54 nummers 52 monumenten aanduiden.',
    'Waar liggen de hunebedden in Drenthe? :: Ze liggen verspreid over de hele provincie, van Steenbergen en Westervelde in het noordwesten tot Emmen in het zuidoosten. Het zwaartepunt ligt op de Hondsrug, langs de N34 tussen Anloo en Emmen. Het dichtstbijzijnde hunebed bij Zeijen is D5, aan de weg naar Peest.',
    'Wat is het grootste hunebed van Nederland? :: Dat is D27 in Borger: 22,6 meter lang, met negen dekstenen en de zwaarste steen die ooit in een Nederlands hunebed is gebruikt (naar schatting 20 ton). Op nummer twee staat D53 bij Havelte, met bijna achttien meter.',
    'Wat is het mooiste hunebed van Drenthe? :: Dat hangt af van wat u zoekt. D27 in Borger is het grootste en het best toegelicht, D6 bij Tynaarlo het gaafste — daar liggen alle dekstenen nog op hun oorspronkelijke plaats — en D5 bij Zeijen het stilste: geen parkeerplaats, geen bordjes, meestal geen mens.',
    'Kun je in een hunebed slapen? :: Nee. Hunebedden zijn rijksmonumenten en er mag niet in worden overnacht of geklommen. Wél kunt u ernaast slapen: Huis ter Huynen in Zeijen ligt op twee kilometer van hunebed D5, met twee privé lodges met eigen hottub op het terras.',
    'Kost een bezoek aan de hunebedden geld? :: Nee. De hunebedden liggen in het open landschap en zijn het hele jaar door gratis en zonder openingstijden te bezoeken. Alleen het Hunebedcentrum in Borger is een museum met entree: circa € 14,50 voor volwassenen en € 7,50 voor kinderen van 4 t/m 11 jaar, gratis met Museumkaart. Controleer de actuele tarieven vooraf.',
    'Hoe oud zijn de hunebedden? :: Ongeveer 5.000 jaar. Ze zijn gebouwd tussen 3400 en 3100 v.Chr. en daarmee de oudste bovengrondse monumenten van Nederland — ouder dan de piramide van Cheops en dan het stenen Stonehenge.',
    'Wie hebben de hunebedden gebouwd? :: De trechterbekercultuur, genoemd naar het aardewerk uit de grafkamers. Niet de Hunnen en niet reuzen: ''hune'' is een oud woord voor reus, de middeleeuwse verklaring voor stenen die te zwaar leken om door mensen verplaatst te zijn. De stenen zelf zijn zwerfkeien die het landijs in de voorlaatste ijstijd vanuit Scandinavië heeft achtergelaten.',
    'Wat is de Hunebed Highway? :: De bijnaam van de N34 tussen Emmen en Groningen. De weg volgt de Hondsrug en komt langs het grootste deel van de Drentse hunebedden, met het Hunebedcentrum in Borger ongeveer halverwege. Een dagtocht van zuid naar noord doet de meeste bekende exemplaren aan.',
    'Zijn de hunebedden geschikt voor kinderen? :: Ja. Ze liggen in de open lucht, kosten niets en zijn met een korte wandeling te bereiken. Klimmen wordt afgeraden omdat de stenen los op elkaar liggen. Met kinderen werken het buitenterrein van het Hunebedcentrum in Borger en de goed bereikbare hunebedden bij Rolde het beste.',
    'Mag mijn hond mee naar de hunebedden? :: Ja, de hunebedden liggen in vrij toegankelijk landschap. Houd er wel rekening mee dat in de omliggende natuurgebieden vrijwel overal een aanlijnplicht geldt. Bij Huis ter Huynen zijn honden in overleg welkom.',
    'Hoe ver liggen de hunebedden vanaf Huis ter Huynen? :: Hunebed D5 ligt op twee kilometer — vijf minuten fietsen. D2 bij Westervelde en D6 bij Tynaarlo liggen op een kwartier rijden, Anloo en Rolde op circa 25 minuten en het Hunebedcentrum met D27 in Borger op ongeveer 35 minuten.'
  ),
  related          = concat_ws(chr(10),
    'Luxe lodge in Drenthe :: /luxe-lodge-drenthe',
    'Vakantiehuis met jacuzzi Drenthe :: /vakantiehuis-met-hottub-drenthe',
    'Bijzonder overnachten Drenthe :: /bijzonder-overnachten-drenthe',
    'Vakantiehuis bij Assen :: /vakantiehuis-assen',
    'Fietsen in Drenthe :: /fietsen-in-drenthe',
    'Wandelroutes in Drenthe :: /wandelroutes-drenthe',
    'Overnachten bij Veenhuizen :: /overnachten-veenhuizen',
    'Omgeving & activiteiten :: /omgeving'
  ),
  cta_title        = 'Overnacht op vijf minuten van hunebed D5',
  cta_body         = 'Twee privé lodges met eigen hottub op de heide bij Zeijen, met het dichtstbijzijnde hunebed van Drenthe op fietsafstand. Al boekbaar voor 2027 — wij reageren binnen 24 uur persoonlijk.',
  meta_title       = 'Hunebedden Drenthe: alle 52 op een rij + de mooiste routes',
  meta_description = 'Drenthe telt 52 van de 54 Nederlandse hunebedden. Waar ze liggen, welke de mooiste zijn en wat een bezoek kost. Plus overnachten op 5 minuten van hunebed D5.',
  og_image         = '',
  updated_at       = '2026-08-20'::timestamptz
where slug = 'hunebedden-drenthe';

-- Interne links naar de hunebeddenpagina. Tot nu toe kwam die pagina alleen
-- via de footer en de homepage-navigatie binnen — dezelfde generieke lijst die
-- op elke pagina staat en dus geen enkel onderwerp benadrukt. Drie
-- inhoudelijk verwante pagina's linken er nu contextueel naartoe.
--
-- Idempotent: de link wordt alleen toegevoegd als hij er nog niet staat.

update landing_pages
set related = concat_ws(chr(10), related, 'Hunebedden in Drenthe :: /hunebedden-drenthe'),
    updated_at = now()
where slug in ('heide-drenthe', 'wandelroutes-drenthe', 'bijzonder-overnachten-drenthe')
  and related not like '%/hunebedden-drenthe%';
