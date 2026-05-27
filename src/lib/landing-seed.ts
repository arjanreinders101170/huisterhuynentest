/* Bundled default content for the SEO landing pages.
 * This is the single source of truth for the pages until they are imported
 * into the `landing_pages` table (admin → Landingspagina's → Importeer).
 * The dynamic route falls back to these records so pages never 404, even
 * before the migration has run. Once a slug exists in the database, the
 * database version takes over.
 */

export interface LandingSectionData {
  eyebrow?: string;
  heading: string;
  body: string[];
  bullets?: string[];
}

export interface LandingPageRecord {
  slug: string;
  breadcrumb: string;
  eyebrow: string;
  h1: string;
  hero_sub: string;
  hero_image: string;
  hero_image_alt: string;
  price_from: string;
  intro: string;
  sections: LandingSectionData[];
  faq: string; // "Vraag :: Antwoord" per regel
  related: string; // "Label :: /pad" per regel
  cta_title: string;
  cta_body: string;
  meta_title: string;
  meta_description: string;
  og_image: string;
  gepubliceerd?: boolean;
  sort_order?: number;
}

const PRICE = "Vanaf €165 per nacht";

export const SEED_LANDING_PAGES: LandingPageRecord[] = [
  {
    slug: "vakantiehuis-met-hottub-drenthe",
    breadcrumb: "Vakantiehuis met hottub Drenthe",
    eyebrow: "Privé hottub · Zeijen · Drenthe",
    h1: "Vakantiehuis met privé-hottub in Drenthe",
    hero_sub:
      "Twee luxe lodges op de Drentse heide bij Zeijen, elk met een eigen hottub op het terras. Wandel vanuit de deur de natuur in en keer terug naar warm, bruisend water onder de sterren.",
    hero_image: "/lodge-heide.jpg",
    hero_image_alt:
      "Vakantiehuis met privé-hottub op het terras van Lodge De Heide, omgeven door de Drentse heide in Zeijen",
    price_from: PRICE,
    intro:
      "Een vakantiehuis met hottub in Drenthe is meer dan een extraatje — het is het moment waarop een weekend echt tot rust komt. Bij Huis ter Huynen heeft elke lodge een eigen privé-hottub, volledig afgeschermd en het hele jaar door op temperatuur. Geen gedeelde wellness, geen buren: alleen u, het bruisende water en het uitzicht over heide en bos.",
    sections: [
      {
        eyebrow: "De ervaring",
        heading: "Een privé-hottub onder de Drentse sterren",
        body: [
          "Stel u voor: na een dag wandelen over het Ballooërveld of fietsen langs de Drentsche Aa stapt u in uw eigen hottub. Het water is 38 °C, de lucht ruikt naar dennen en in de verte zoemen de laatste bijen boven de heide. Drenthe is de stilste provincie van Nederland — en juist die stilte maakt een privé-hottub hier zo bijzonder.",
          "Beide lodges hebben hun hottub op een afgeschermd terras met uitzicht op de natuur. Overdag een verfrissende duik na het sporten, 's avonds een glas wijn met zicht op de sterrenhemel. Omdat Drenthe nauwelijks lichtvervuiling kent, ziet u hier meer sterren dan vrijwel waar dan ook in het land.",
        ],
      },
      {
        eyebrow: "De accommodaties",
        heading: "Twee lodges, elk met eigen hottub",
        body: [
          "Huis ter Huynen telt twee volledig privé lodges voor maximaal vier personen. Beide zijn ingericht met oog voor comfort, met een volledig uitgeruste keuken, fijne bedden en een eigen buitenruimte met hottub.",
        ],
        bullets: [
          "Lodge De Heide — luxe lodge met sauna, privé-hottub en panoramisch uitzicht over het bos.",
          "Lodge De Eik — ruime lodge onder de eiken met buitenkeuken, BBQ en eigen hottub.",
          "Beide: gratis WiFi, EV-laadpaal op het terrein en volledige privacy.",
          "Honden zijn in overleg welkom, zodat ook uw viervoeter mee kan op pad.",
        ],
      },
      {
        eyebrow: "Waarom hier",
        heading: "Wat een vakantiehuis met hottub écht ontspannend maakt",
        body: [
          "Een hottub is pas echt ontspannend als hij privé is. Geen wachttijden, geen onbekenden, geen openingstijden — u bepaalt zelf wanneer u erin gaat. Daarom kiezen koppels en kleine gezelschappen die rust zoeken steeds vaker voor een vrijstaand vakantiehuis met eigen hottub in plaats van een hotel met wellnessafdeling.",
          "De combinatie van warm water, natuur en stilte werkt aantoonbaar herstellend. Het is de ideale uitvalsbasis voor een romantisch weekend, een verjaardag of gewoon een paar dagen volledig afschakelen — op nog geen 20 minuten van Assen, maar gevoelsmatig mijlenver van de drukte.",
        ],
      },
      {
        eyebrow: "De omgeving",
        heading: "Heide, bos en beekdal vanuit de deur",
        body: [
          "Vanuit de lodge wandelt u zo de Zeijerstrubben en het Zeijerwiek in. Het Nationaal Park Drentsche Aa ligt op een kwartier, het Ballooërveld met zijn schaapskudde op twaalf minuten en er lopen meer dan 1.000 km fietspaden door de omgeving. Eerst de natuur in, daarna de hottub — dat is het ritme van een verblijf bij Huis ter Huynen.",
        ],
      },
    ],
    faq: [
      "Heeft elke lodge een eigen privé-hottub? :: Ja. Zowel Lodge De Heide als Lodge De Eik heeft een eigen, afgeschermde hottub op het terras. U deelt hem met niemand buiten uw eigen gezelschap.",
      "Is de hottub het hele jaar door beschikbaar? :: Ja, de hottub is 24/7 beschikbaar en staat standaard ingesteld op 38 °C — ook in de winter, wanneer een hottub in de besneeuwde natuur op zijn allermooist is.",
      "Voor hoeveel personen is het vakantiehuis geschikt? :: Elke lodge is geschikt voor maximaal vier personen. Ideaal voor koppels, een klein gezin of twee stellen die samen weg willen.",
      "Hoe ver ligt het vakantiehuis van Assen? :: Huis ter Huynen ligt in Zeijen, op ongeveer 20 minuten rijden van Assen en op een kwartier van het Nationaal Park Drentsche Aa.",
    ].join("\n"),
    related: [
      "Luxe lodge in Drenthe :: /luxe-lodge-drenthe",
      "Romantisch weekend weg Drenthe :: /romantisch-weekend-weg-drenthe",
      "Fietsen & wandelen in de omgeving :: /omgeving",
    ].join("\n"),
    cta_title: "Boek uw vakantiehuis met hottub in Drenthe",
    cta_body:
      "De lodges zijn al boekbaar voor 2027. Bekijk de beschikbare data of stel uw vraag rechtstreeks — wij reageren binnen 24 uur persoonlijk.",
    meta_title: "Vakantiehuis met Hottub in Drenthe | Privé Lodge bij Zeijen",
    meta_description:
      "Luxe vakantiehuis met privé-hottub in Drenthe. Twee lodges op de heide bij Zeijen, 20 min van Assen. Eigen hottub 24/7, wandelen & fietsen vanuit de deur.",
    og_image: "/lodge-heide.jpg",
    sort_order: 1,
  },
  {
    slug: "luxe-lodge-drenthe",
    breadcrumb: "Luxe lodge Drenthe",
    eyebrow: "Boutique lodge · Zeijen · Drenthe",
    h1: "Luxe lodge in Drenthe",
    hero_sub:
      "Twee boutique lodges midden in de Drentse natuur. Stijlvol ingericht, volledig privé en voorzien van sauna, hottub en alle comfort voor een verblijf dat klopt tot in het detail.",
    hero_image: "/lodge-eik.jpg",
    hero_image_alt:
      "Luxe lodge De Eik onder de eiken bij Zeijen in Drenthe, met buitenkeuken en eigen terras",
    price_from: PRICE,
    intro:
      "Een luxe lodge in Drenthe draait niet om overdaad, maar om de juiste dingen perfect voor elkaar hebben: een goed bed, warme materialen, echte privacy en de natuur die direct buiten begint. Huis ter Huynen biedt twee zorgvuldig ingerichte lodges op de heide bij Zeijen — geen hotel, maar een eigen plek waar u zich meteen thuis voelt.",
    sections: [
      {
        eyebrow: "Positionering",
        heading: "Luxe is rust, ruimte en privacy",
        body: [
          "Bij echte luxe gaat het niet om hoeveel er is, maar om wat ontbreekt: geen buren, geen geluid, geen haast. Onze lodges staan vrij in het landschap, elk met een eigen terras en uitzicht over heide of bos. U deelt niets met andere gasten. Dat gevoel van een plek helemaal voor uzelf is wat een verblijf hier onderscheidt van een gemiddeld vakantiehuis of hotel.",
          "Tegelijk ontbreekt het u aan niets. Een privé-hottub op het terras, een volledig uitgeruste keuken, snelle WiFi en een EV-laadpaal op het terrein — alles is geregeld zodat u zich kunt richten op wat u kwam doen: niets.",
        ],
      },
      {
        eyebrow: "De accommodaties",
        heading: "Twee lodges met elk een eigen karakter",
        body: [
          "Beide lodges bieden plaats aan vier personen en zijn met dezelfde zorg ingericht, maar elk heeft zijn eigen sfeer.",
        ],
        bullets: [
          "Lodge De Heide — eigen sauna, privé-hottub en panoramisch uitzicht over het bos.",
          "Lodge De Eik — hoge plafonds, authentieke uitstraling, buitenkeuken met BBQ en eigen hottub.",
          "Volledig uitgeruste keuken, fijne bedden en een privé-terras in beide lodges.",
          "Gratis WiFi, EV-laadpaal en persoonlijk contact met de gastheer voor en tijdens uw verblijf.",
        ],
      },
      {
        eyebrow: "Voor wie",
        heading: "Voor wie zoekt naar kwaliteit boven kwantiteit",
        body: [
          "Een luxe lodge in Drenthe is ideaal voor koppels die er even helemaal tussenuit willen, voor een klein gezin dat de natuur in wil, of voor wie een bijzondere gelegenheid wil vieren zonder de drukte van een resort. De schaal is bewust klein: twee lodges, persoonlijke aandacht, geen anonieme receptie.",
          "Wie luxe vooral als beleving ziet — een warme sauna na een boswandeling, koken met streekproducten, een avond bij het vuur — voelt zich hier thuis. Het comfort is er, maar de natuur en de rust voeren de boventoon.",
        ],
      },
      {
        eyebrow: "De ligging",
        heading: "Midden in het mooiste deel van Drenthe",
        body: [
          "Zeijen is een van de fraaiste brinkdorpen van Drenthe. Het Nationaal Park Drentsche Aa ligt op een kwartier, de paarse heide van het Ballooërveld vlakbij en Assen bereikt u in twintig minuten. U zit dus afgelegen genoeg voor volledige rust, maar dicht genoeg bij cultuur, restaurants en wellness voor een gevarieerd verblijf.",
        ],
      },
    ],
    faq: [
      "Wat maakt deze lodges 'luxe'? :: De combinatie van volledige privacy, een eigen hottub (en sauna in De Heide), hoogwaardige inrichting, een volledig uitgeruste keuken en persoonlijke service. Geen gedeelde voorzieningen, geen massatoerisme.",
      "Hoeveel lodges zijn er en hoe groot zijn ze? :: Er zijn twee vrijstaande lodges, De Heide en De Eik, elk geschikt voor maximaal vier personen. Beide zijn volledig privé.",
      "Kan ik de lodge het hele jaar boeken? :: Ja, Huis ter Huynen is het hele jaar door te boeken. Elk seizoen heeft zijn eigen charme, van bloeiende heide in de zomer tot stille, besneeuwde bossen in de winter.",
      "Kan ik direct boeken zonder tussenpersoon? :: Ja. U boekt rechtstreeks bij Huis ter Huynen via de website of WhatsApp — persoonlijk en zonder commissie van een tussenpartij.",
    ].join("\n"),
    related: [
      "Vakantiehuis met hottub Drenthe :: /vakantiehuis-met-hottub-drenthe",
      "Romantisch weekend weg Drenthe :: /romantisch-weekend-weg-drenthe",
      "Omgeving & activiteiten :: /omgeving",
    ].join("\n"),
    cta_title: "Ervaar een luxe lodge in Drenthe",
    cta_body:
      "De lodges zijn al boekbaar voor 2027. Bekijk de beschikbaarheid of stel uw vraag — wij reageren binnen 24 uur persoonlijk.",
    meta_title: "Luxe Lodge in Drenthe | Boutique Verblijf met Hottub bij Zeijen",
    meta_description:
      "Luxe boutique lodge in Drenthe, op de heide bij Zeijen. Twee volledig privé lodges met hottub en sauna, 20 min van Assen. Rust, ruimte en comfort. Boek direct.",
    og_image: "/lodge-eik.jpg",
    sort_order: 2,
  },
  {
    slug: "romantisch-weekend-weg-drenthe",
    breadcrumb: "Romantisch weekend weg Drenthe",
    eyebrow: "Voor koppels · Zeijen · Drenthe",
    h1: "Romantisch weekend weg in Drenthe",
    hero_sub:
      "Geen agenda, geen drukte — alleen jullie samen, de heide voor de deur en een privé-hottub onder de sterren. Een romantisch weekend in Drenthe op zijn mooist.",
    hero_image: "/heide1.jpg",
    hero_image_alt:
      "Paarse bloeiende heide bij zonsondergang in Drenthe, ideaal decor voor een romantisch weekend weg",
    price_from: PRICE,
    intro:
      "Een romantisch weekend weg draait om tijd voor elkaar, zonder afleiding. Drenthe is daar als geen ander op gemaakt: de stilste provincie van Nederland, met eindeloze natuur en weinig toeristen. Bij Huis ter Huynen verblijft u in een volledig privé lodge met eigen hottub — de ideale plek om samen volledig af te schakelen.",
    sections: [
      {
        eyebrow: "Waarom Drenthe",
        heading: "De rust die een romantisch weekend nodig heeft",
        body: [
          "Romantiek heeft ruimte en rust nodig. Drenthe biedt allebei in overvloed: geen files, geen massa's, wel uitgestrekte heide, oude strubbenbossen en het kronkelende beekdal van de Drentsche Aa. Hier hoort u 's ochtends alleen vogels en 's avonds niets dan de wind. Precies die stilte maakt een weekend met z'n tweeën zo bijzonder.",
          "En toch hoeft u niets te missen: een goed restaurant, een wellnessdag of een cultureel uitje in Assen zijn allemaal binnen handbereik. U kiest zelf of u de lodge nauwelijks verlaat of er juist op uittrekt.",
        ],
      },
      {
        eyebrow: "Ideeën",
        heading: "Zo maakt u het weekend onvergetelijk",
        body: [
          "Een romantisch weekend in Drenthe is wat u er samen van maakt. Een paar ideeën die het verblijf compleet maken:",
        ],
        bullets: [
          "Zonsondergang op de heide, gevolgd door de hottub onder de sterrenhemel.",
          "Een kaarsdiner op uw eigen terras, met streekproducten uit de regio.",
          "Samen fietsen door de esdorpen richting Norg en de Drentsche Aa.",
          "Een wellnessdag in de omgeving en daarna ontspannen in uw eigen sauna (Lodge De Heide).",
          "Een doe-niets-dag: ochtendkoffie in bad, een boek en geen enkele verplichting.",
        ],
      },
      {
        eyebrow: "De accommodatie",
        heading: "Een privé lodge met hottub voor twee",
        body: [
          "Beide lodges zijn volledig privé en perfect voor een koppel: een eigen terras, een privé-hottub op 38 °C en een sfeervol interieur waarin u zich meteen thuis voelt. Geen receptie, geen mede-gasten — alleen jullie samen.",
          "Vier u een jubileum, verjaardag of gewoon elkaar? Laat het ons weten bij de boeking, dan zorgen we waar mogelijk voor een persoonlijk welkom.",
        ],
      },
      {
        eyebrow: "Praktisch",
        heading: "Ideaal te combineren met de rest van Drenthe",
        body: [
          "Huis ter Huynen ligt in Zeijen, op twintig minuten van Assen en een kwartier van het Nationaal Park Drentsche Aa. Daardoor combineert u rust met bereikbaarheid: een romantisch diner, een museumbezoek of een wellnessmiddag zijn zo geregeld, en daarna keert u terug naar uw eigen stille plek op de heide.",
        ],
      },
    ],
    faq: [
      "Is de lodge geschikt voor een romantisch weekend met z'n tweeën? :: Zeker. Beide lodges zijn volledig privé, met een eigen hottub op het terras en een sfeervol interieur — ideaal voor koppels die rust en privacy zoeken.",
      "Wanneer is de mooiste tijd voor een romantisch weekend in Drenthe? :: Elk seizoen heeft zijn charme: de paarse heide in augustus en september, de herfstkleuren in oktober, of juist de stille, besneeuwde winter waarin de hottub op zijn mooist is.",
      "Kunnen we een bijzondere gelegenheid vieren? :: Ja, vermeld het bij uw boeking. Waar mogelijk verzorgen we een persoonlijk welkom om jullie verjaardag, jubileum of verrassing extra bijzonder te maken.",
      "Hoe boeken we het romantisch weekend? :: U boekt rechtstreeks bij Huis ter Huynen via de website of WhatsApp. Wij reageren binnen 24 uur met een persoonlijk voorstel — zonder tussenpersoon.",
    ].join("\n"),
    related: [
      "Vakantiehuis met hottub Drenthe :: /vakantiehuis-met-hottub-drenthe",
      "Luxe lodge in Drenthe :: /luxe-lodge-drenthe",
      "Wat te doen in de omgeving :: /omgeving",
    ].join("\n"),
    cta_title: "Plan jullie romantisch weekend in Drenthe",
    cta_body:
      "De lodges zijn al boekbaar voor 2027. Bekijk de beschikbaarheid of stel jullie vraag — wij reageren binnen 24 uur persoonlijk.",
    meta_title: "Romantisch Weekend Weg in Drenthe | Privé Lodge met Hottub",
    meta_description:
      "Romantisch weekend weg in Drenthe? Verblijf in een privé lodge met hottub op de heide bij Zeijen. Rust, natuur en privacy voor koppels. Boek direct, 20 min van Assen.",
    og_image: "/heide1.jpg",
    sort_order: 3,
  },
  {
    slug: "wellness-vakantie-drenthe",
    breadcrumb: "Wellness vakantie Drenthe",
    eyebrow: "Wellness & rust · Zeijen · Drenthe",
    h1: "Wellness vakantie in Drenthe",
    hero_sub:
      "Een privé-hottub op het terras, een eigen sauna en de stilste natuur van Nederland om u heen. Bij Huis ter Huynen is wellness geen afdeling, maar de hele ervaring.",
    hero_image: "/welness_drenthe.jpg",
    hero_image_alt:
      "Buitensauna en wellness in een bosrijke omgeving in Drenthe, bij Huis ter Huynen in Zeijen",
    price_from: PRICE,
    intro:
      "Een wellness vakantie in Drenthe gaat verder dan een uurtje sauna. Hier is de natuur zelf de bron van rust: stilteregio's, eindeloze heide en bossen waar u niemand tegenkomt. Bij Huis ter Huynen combineert u die rust met echte luxe — een privé-hottub, een eigen sauna in Lodge De Heide en alle comfort om volledig tot uzelf te komen.",
    sections: [
      {
        eyebrow: "Het idee",
        heading: "Natuur als medicijn, comfort als basis",
        body: [
          "Onderzoek laat keer op keer zien dat tijd in een stille, groene omgeving stress meetbaar verlaagt. Drenthe is daar de ideale plek voor: het is officieel de stilste provincie van Nederland, met beschermde stilteregio's en weinig lichtvervuiling. Een wandeling door de Zeijerstrubben of langs de Drentsche Aa doet wat geen behandeling kan.",
          "Bij Huis ter Huynen voegt u daar het comfort aan toe dat een wellness vakantie compleet maakt: warm, bruisend water in uw privé-hottub, een sauna die alleen van u is, en een lodge waar u zich meteen ontspant. Geen gedeelde ruimtes, geen drukte — wellness op uw eigen tempo.",
        ],
      },
      {
        eyebrow: "Wat u krijgt",
        heading: "Privé-wellness in uw eigen lodge",
        body: [
          "U hoeft de deur niet uit voor uw wellnessmoment. Beide lodges hebben een eigen hottub; Lodge De Heide heeft daarnaast een privé-sauna.",
        ],
        bullets: [
          "Privé-hottub op het terras, 24/7 beschikbaar op 38 °C.",
          "Eigen sauna in Lodge De Heide — geen reservering, geen mede-gasten.",
          "Volledige privacy: uw terras kijkt uit op natuur, niet op buren.",
          "Wandel- en fietsroutes vanuit de deur voor 'forest bathing' en beweging.",
          "Wellnesscentra en spa's in de regio (Assen, Hof van Saksen) voor een dag extra verwennerij.",
        ],
      },
      {
        eyebrow: "Een dag",
        heading: "Zo ziet een wellnessdag eruit",
        body: [
          "Begin de dag met een stille ochtendwandeling over de heide, als de dauw er nog ligt. Terug bij de lodge een uitgebreid ontbijt op het terras, daarna de sauna in. 's Middags een fietstocht door de esdorpen of een bezoek aan een wellnesscentrum in de buurt. En als de avond valt: de hottub in, met zicht op een sterrenhemel die u in de stad nooit ziet.",
          "Dat ritme — bewegen, opwarmen, afkoelen, niets moeten — is precies waarvoor een wellness vakantie bedoeld is. In Drenthe komt het vanzelf.",
        ],
      },
      {
        eyebrow: "De omgeving",
        heading: "Stilte, heide en water binnen handbereik",
        body: [
          "Het Nationaal Park Drentsche Aa ligt op een kwartier, het Ballooërveld met zijn paarse heide vlakbij en Assen — met wellnesscentra, restaurants en het Drents Museum — op twintig minuten. U bepaalt zelf hoeveel u onderneemt en hoeveel u gewoon stil zit.",
        ],
      },
    ],
    faq: [
      "Heeft de lodge een eigen sauna? :: Lodge De Heide beschikt over een eigen privé-sauna. Beide lodges hebben een privé-hottub op het terras, 24/7 beschikbaar.",
      "Is dit geschikt voor een wellnessweekend met z'n tweeën? :: Zeker. De lodges zijn volledig privé en ideaal voor koppels die rust en verwennerij zoeken, zonder de drukte van een groot wellnessresort.",
      "Zijn er ook wellnesscentra in de omgeving? :: Ja. In Assen (20 min) en de wijdere regio vindt u verschillende wellnesscentra en spa's, zoals Spa Hof van Saksen, voor een dag extra verwennerij.",
      "Wat is de beste periode voor een wellness vakantie in Drenthe? :: Elk seizoen werkt: de paarse heide in de nazomer, de herfstkleuren, of juist de winter, wanneer de hottub in de besneeuwde stilte op zijn mooist is.",
    ].join("\n"),
    related: [
      "Vakantiehuis met hottub Drenthe :: /vakantiehuis-met-hottub-drenthe",
      "Luxe lodge in Drenthe :: /luxe-lodge-drenthe",
      "Romantisch weekend weg Drenthe :: /romantisch-weekend-weg-drenthe",
    ].join("\n"),
    cta_title: "Boek uw wellness vakantie in Drenthe",
    cta_body:
      "De lodges zijn al boekbaar voor 2027. Bekijk de beschikbaarheid of stel uw vraag — wij reageren binnen 24 uur persoonlijk.",
    meta_title: "Wellness Vakantie in Drenthe | Lodge met Hottub & Sauna",
    meta_description:
      "Wellness vakantie in Drenthe: privé lodge met eigen hottub en sauna op de heide bij Zeijen. Stilte, natuur en comfort, 20 min van Assen. Vanaf €165 per nacht.",
    og_image: "/welness_drenthe.jpg",
    sort_order: 4,
  },
  {
    slug: "vakantiehuis-assen",
    breadcrumb: "Vakantiehuis bij Assen",
    eyebrow: "Lodge in Zeijen · 20 min van Assen",
    h1: "Vakantiehuis bij Assen",
    hero_sub:
      "Een luxe lodge met privé-hottub in het rustige Zeijen, op twintig minuten van Assen. De stad binnen handbereik, de Drentse natuur direct voor de deur.",
    hero_image: "/lodge-heide.jpg",
    hero_image_alt: "Luxe lodge op de Drentse heide bij Zeijen, op twintig minuten van Assen",
    price_from: PRICE,
    intro:
      "Op zoek naar een vakantiehuis bij Assen? Huis ter Huynen ligt in Zeijen, een van de mooiste brinkdorpen van Drenthe, op slechts twintig minuten van het centrum van Assen. U combineert zo het beste van twee werelden: de rust en natuur van het Drentse platteland, met de stad, het Drents Museum en het TT-circuit op korte afstand.",
    sections: [
      {
        eyebrow: "De ligging",
        heading: "Rust in Zeijen, de stad dichtbij",
        body: [
          "Assen is een prettige, overzichtelijke stad met een rijk cultureel aanbod, maar overnachten doet u het fijnst net buiten de drukte. Vanuit de lodge in Zeijen bent u in twintig minuten in het centrum, terwijl u 's ochtends wakker wordt met uitzicht op heide en bos. Geen parkeerstress, geen stadsgeluiden — wel alle voorzieningen binnen handbereik.",
          "Dat maakt Huis ter Huynen een ideale uitvalsbasis voor wie Assen en omgeving wil ontdekken én echt wil ontspannen. Een privé-hottub op het terras zorgt ervoor dat elke dag eindigt in volledige rust.",
        ],
      },
      {
        eyebrow: "Wat te doen",
        heading: "Assen en omgeving ontdekken",
        body: [
          "Assen biedt voor elk type bezoeker iets. Een greep uit de mogelijkheden vanuit uw vakantiehuis:",
        ],
        bullets: [
          "Drents Museum — internationaal gewaardeerd, met archeologie en kunst.",
          "TT Circuit Assen — de 'Cathedral of Speed', met de TT als hoogtepunt in de zomer.",
          "Het Asserbos en de gezellige binnenstad met terrassen en winkels.",
          "Nationaal Park Drentsche Aa, dat tot vlak bij Assen reikt.",
          "Wellnesscentra en restaurants in en rond de stad.",
        ],
      },
      {
        eyebrow: "De accommodatie",
        heading: "Twee luxe lodges met privé-hottub",
        body: [
          "Huis ter Huynen heeft twee volledig privé lodges voor maximaal vier personen, elk met een eigen hottub op het terras. Lodge De Heide heeft bovendien een eigen sauna; Lodge De Eik een buitenkeuken met BBQ. Beide bieden een volledig uitgeruste keuken, gratis WiFi en een EV-laadpaal op het terrein.",
          "U boekt rechtstreeks, zonder tussenpersoon — persoonlijk geregeld door de gastheer.",
        ],
      },
      {
        eyebrow: "Natuur",
        heading: "De heide begint bij de voordeur",
        body: [
          "Anders dan een hotel in de stad ligt uw vakantiehuis hier midden in de natuur. Wandelroutes starten direct bij de lodge, het Ballooërveld met zijn schaapskudde ligt op twaalf minuten en er lopen meer dan 1.000 km fietspaden door de regio. Overdag de stad of de natuur in, 's avonds terug naar uw eigen stille plek.",
        ],
      },
    ],
    faq: [
      "Hoe ver is het vakantiehuis van Assen? :: Huis ter Huynen ligt in Zeijen, op ongeveer 20 minuten rijden van het centrum van Assen.",
      "Is dit een geschikte uitvalsbasis voor de TT Assen? :: Ja. Het TT Circuit ligt op korte rijafstand, terwijl u in alle rust overnacht buiten de drukte van het evenement. Boek wel ruim op tijd, want het TT-weekend is populair.",
      "Hoeveel personen kunnen er verblijven? :: Elke lodge is geschikt voor maximaal vier personen. Er zijn twee lodges, dus samen tot acht personen in twee aparte accommodaties.",
      "Kan ik direct boeken zonder Booking.com? :: Ja, u boekt rechtstreeks bij Huis ter Huynen via de website of WhatsApp — persoonlijk en zonder commissie van een tussenpartij.",
    ].join("\n"),
    related: [
      "Vakantiehuis met hottub Drenthe :: /vakantiehuis-met-hottub-drenthe",
      "Vakantiehuis bij Norg :: /vakantiehuis-norg",
      "Omgeving & activiteiten :: /omgeving",
    ].join("\n"),
    cta_title: "Boek uw vakantiehuis bij Assen",
    cta_body:
      "De lodges zijn al boekbaar voor 2027. Bekijk de beschikbaarheid of stel uw vraag — wij reageren binnen 24 uur persoonlijk.",
    meta_title: "Vakantiehuis bij Assen | Luxe Lodge met Hottub in Zeijen",
    meta_description:
      "Vakantiehuis bij Assen? Luxe lodge met privé-hottub in Zeijen, 20 min van het centrum en het TT Circuit. Rust, natuur en de stad dichtbij. Vanaf €165 per nacht.",
    og_image: "/lodge-heide.jpg",
    sort_order: 5,
  },
  {
    slug: "vakantiehuis-norg",
    breadcrumb: "Vakantiehuis bij Norg",
    eyebrow: "Lodge in Zeijen · vlak bij Norg",
    h1: "Vakantiehuis bij Norg",
    hero_sub:
      "Een luxe lodge met privé-hottub in Zeijen, op een steenworp van het brinkdorp Norg. Bos, heide en stille fietspaden beginnen direct voor de deur.",
    hero_image: "/wandel_drenthe.jpg",
    hero_image_alt: "Wandel- en fietspad door de Drentse natuur tussen Zeijen en Norg",
    price_from: PRICE,
    intro:
      "Wie een vakantiehuis bij Norg zoekt, zoekt rust, bos en authentiek Drenthe. Huis ter Huynen ligt in het naburige Zeijen, op slechts een paar minuten van Norg, midden in een van de mooiste gebieden van de provincie. Twee privé lodges met eigen hottub vormen de perfecte uitvalsbasis voor wie de natuur rond Norg wil ontdekken.",
    sections: [
      {
        eyebrow: "De ligging",
        heading: "Tussen Zeijen en Norg, midden in het groen",
        body: [
          "Norg is een sfeervol brinkdorp met een rijke geschiedenis, gezellige terrassen rond de brink en uitgestrekte bos- en heidegebieden eromheen. Vanuit de lodge in Zeijen fietst u er zo naartoe — de Norgeroute van 18 km start letterlijk bij de voordeur en voert door esdorpen en stille zandpaden richting Norg.",
          "Het gebied staat bekend om zijn rust en ruimte. U logeert hier net buiten de bekende toeristische drukte, met natuur die nog echt van uzelf voelt.",
        ],
      },
      {
        eyebrow: "Wat te doen",
        heading: "Natuur en dorpsleven rond Norg",
        body: ["Rond Norg is van alles te beleven voor wie van buiten zijn houdt:"],
        bullets: [
          "De Norgeroute (18 km) — fietsen door esdorpen, direct vanaf de lodge.",
          "Het Norgerholt, een van de oudste eikenbossen van Nederland.",
          "Uitgestrekte heidevelden, waaronder het Oosterveld.",
          "De gezellige brink van Norg met terrassen en restaurants.",
          "Wandelroutes door bos en over de heide voor elk niveau.",
        ],
      },
      {
        eyebrow: "De accommodatie",
        heading: "Twee privé lodges met hottub",
        body: [
          "Huis ter Huynen biedt twee volledig privé lodges voor maximaal vier personen, elk met een eigen hottub op het terras. Lodge De Heide heeft een eigen sauna, Lodge De Eik een buitenkeuken met BBQ. Beide zijn voorzien van een volledige keuken, gratis WiFi en een EV-laadpaal.",
          "Na een dag fietsen of wandelen rond Norg keert u terug naar uw eigen stille plek — en de hottub staat klaar.",
        ],
      },
      {
        eyebrow: "Praktisch",
        heading: "Rustig gelegen, toch centraal",
        body: [
          "Naast Norg liggen ook Assen (20 min), het Nationaal Park Drentsche Aa (15 min) en het Ballooërveld (12 min) binnen handbereik. U zit dus afgelegen genoeg voor volledige rust, maar centraal genoeg om heel Noord-Drenthe te ontdekken.",
        ],
      },
    ],
    faq: [
      "Hoe ver ligt het vakantiehuis van Norg? :: Huis ter Huynen ligt in Zeijen, op enkele minuten rijden en een korte fietstocht van Norg. De Norgeroute start direct bij de lodge.",
      "Is de omgeving geschikt voor fietsen en wandelen? :: Zeker. Rond Norg en Zeijen liggen talloze fiets- en wandelroutes, waaronder de Norgeroute en routes door het Norgerholt en de heidevelden. Er lopen meer dan 1.000 km fietspaden door de regio.",
      "Voor hoeveel personen is de lodge geschikt? :: Elke lodge biedt plaats aan maximaal vier personen. Er zijn twee aparte lodges beschikbaar.",
      "Kan ik direct en zonder tussenpersoon boeken? :: Ja, u boekt rechtstreeks bij Huis ter Huynen via de website of WhatsApp, persoonlijk en zonder commissie.",
    ].join("\n"),
    related: [
      "Vakantiehuis met hottub Drenthe :: /vakantiehuis-met-hottub-drenthe",
      "Vakantiehuis bij Assen :: /vakantiehuis-assen",
      "Fietsen & wandelen in de omgeving :: /omgeving",
    ].join("\n"),
    cta_title: "Boek uw vakantiehuis bij Norg",
    cta_body:
      "De lodges zijn al boekbaar voor 2027. Bekijk de beschikbaarheid of stel uw vraag — wij reageren binnen 24 uur persoonlijk.",
    meta_title: "Vakantiehuis bij Norg | Luxe Lodge met Hottub in Zeijen",
    meta_description:
      "Vakantiehuis bij Norg? Luxe lodge met privé-hottub in Zeijen, vlak bij Norg. Bos, heide en fietsroutes voor de deur. Boek direct, vanaf €165 per nacht.",
    og_image: "/wandel_drenthe.jpg",
    sort_order: 6,
  },
  {
    slug: "overnachten-veenhuizen",
    breadcrumb: "Overnachten bij Veenhuizen",
    eyebrow: "Lodge in Zeijen · vlak bij Veenhuizen",
    h1: "Overnachten bij Veenhuizen",
    hero_sub:
      "Bezoek het UNESCO-werelderfgoed Veenhuizen en overnacht in een luxe lodge met privé-hottub in het nabijgelegen Zeijen. Cultuur en geschiedenis overdag, rust en natuur 's avonds.",
    hero_image: "/heide3.jpg",
    hero_image_alt: "Drents heidelandschap nabij Zeijen, op korte rijafstand van Veenhuizen",
    price_from: PRICE,
    intro:
      "Veenhuizen is een van de meest bijzondere plekken van Drenthe: een voormalige kolonie van weldadigheid, nu UNESCO-werelderfgoed, met het Gevangenismuseum als publiekstrekker. Wie hier op bezoek komt, overnacht het mooist in alle rust net buiten het dorp. Huis ter Huynen in Zeijen ligt op korte rijafstand en biedt twee luxe lodges met privé-hottub.",
    sections: [
      {
        eyebrow: "De bestemming",
        heading: "Veenhuizen: werelderfgoed met een verhaal",
        body: [
          "Veenhuizen werd in de negentiende eeuw gesticht als 'kolonie van weldadigheid' en draagt die geschiedenis nog overal met zich mee: statige gestichten, strenge lanen en gebouwen met opschriften die tot nadenken stemmen. Sinds 2021 is het samen met de andere Koloniën van Weldadigheid UNESCO-werelderfgoed.",
          "Het Gevangenismuseum vertelt het verhaal van misdaad en straf door de eeuwen heen en is een aanrader voor jong en oud. Rondom het dorp liggen daarnaast bossen en natuurgebieden die uitnodigen tot een wandeling.",
        ],
      },
      {
        eyebrow: "Wat te doen",
        heading: "Een dag in en rond Veenhuizen",
        body: ["Een bezoek aan Veenhuizen combineert u gemakkelijk met de natuur en cultuur van Noord-Drenthe:"],
        bullets: [
          "Het Nationaal Gevangenismuseum in de oude gestichten.",
          "Een wandeling door het historische dorp en langs de kolonielanen.",
          "Het Fochteloërveen, een uitgestrekt hoogveengebied met kraanvogels, vlakbij.",
          "Fietsroutes door de bossen en velden rond Veenhuizen.",
          "Lokale horeca in karakteristieke, historische panden.",
        ],
      },
      {
        eyebrow: "De accommodatie",
        heading: "Luxe overnachten in Zeijen",
        body: [
          "Na een dag vol indrukken keert u terug naar Huis ter Huynen in Zeijen. Twee volledig privé lodges voor maximaal vier personen staan voor u klaar, elk met een eigen hottub op het terras. Lodge De Heide heeft een eigen sauna, Lodge De Eik een buitenkeuken met BBQ — beide met volledige keuken, gratis WiFi en een EV-laadpaal.",
          "De combinatie van een indrukwekkend cultureel uitstapje en een rustige, luxe overnachting in de natuur maakt uw verblijf compleet.",
        ],
      },
      {
        eyebrow: "Praktisch",
        heading: "Centraal in Noord-Drenthe",
        body: [
          "Vanuit Zeijen ligt niet alleen Veenhuizen binnen handbereik, maar ook Assen (20 min), Norg, het Nationaal Park Drentsche Aa en de paarse heide van het Ballooërveld. Een ideale uitvalsbasis om de geschiedenis én de natuur van Drenthe te combineren.",
        ],
      },
    ],
    faq: [
      "Hoe ver ligt de lodge van Veenhuizen? :: Huis ter Huynen ligt in Zeijen, op korte rijafstand van Veenhuizen — ideaal om het Gevangenismuseum en het UNESCO-dorp te bezoeken en daarna in de natuur te overnachten.",
      "Is Veenhuizen de moeite waard voor een dagje uit? :: Zeker. Het Nationaal Gevangenismuseum en het historische, als UNESCO-werelderfgoed erkende dorp zijn boeiend voor zowel volwassenen als kinderen, en goed te combineren met natuur in de omgeving.",
      "Hoeveel personen kunnen er overnachten? :: Elke lodge is geschikt voor maximaal vier personen. Er zijn twee aparte, volledig privé lodges.",
      "Kan ik rechtstreeks boeken? :: Ja, u boekt direct bij Huis ter Huynen via de website of WhatsApp, persoonlijk en zonder tussenpersoon.",
    ].join("\n"),
    related: [
      "Vakantiehuis met hottub Drenthe :: /vakantiehuis-met-hottub-drenthe",
      "Vakantiehuis bij Norg :: /vakantiehuis-norg",
      "Omgeving & activiteiten :: /omgeving",
    ].join("\n"),
    cta_title: "Boek uw verblijf bij Veenhuizen",
    cta_body:
      "De lodges zijn al boekbaar voor 2027. Bekijk de beschikbaarheid of stel uw vraag — wij reageren binnen 24 uur persoonlijk.",
    meta_title: "Overnachten bij Veenhuizen | Luxe Lodge met Hottub in Zeijen",
    meta_description:
      "Overnachten bij Veenhuizen? Bezoek het UNESCO-dorp en Gevangenismuseum en verblijf in een luxe lodge met hottub in Zeijen. Boek direct, vanaf €165 per nacht.",
    og_image: "/heide3.jpg",
    sort_order: 7,
  },
];

export const SEED_BY_SLUG: Record<string, LandingPageRecord> = Object.fromEntries(
  SEED_LANDING_PAGES.map((p) => [p.slug, p]),
);
