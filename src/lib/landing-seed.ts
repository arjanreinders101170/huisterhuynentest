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
const PRICE_DE = "Ab €165 pro Nacht";

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
      "Paarse heide Drenthe :: /heide-drenthe",
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
    hero_image: "/lodge-eik.jpg",
    hero_image_alt:
      "Lodge De Eik met privé-hottub op het terras, omringd door bos bij Zeijen — onderdeel van een wellness vakantie in Drenthe",
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
    og_image: "/lodge-eik.jpg",
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
    slug: "bijzonder-overnachten-drenthe",
    breadcrumb: "Bijzonder overnachten Drenthe",
    eyebrow: "Uniek verblijf · Zeijen · Drenthe",
    h1: "Bijzonder overnachten in Drenthe",
    hero_sub:
      "Niet zomaar een vakantiehuisje, maar een verblijf dat bijblijft. Twee boutique lodges op de Drentse heide — met privé-hottub, sauna en een omgeving die u nergens anders vindt.",
    hero_image: "/heide2.jpg",
    hero_image_alt:
      "Bijzonder overnachten in Drenthe: Lodge De Heide van Huis ter Huynen, omringd door de Drentse natuur bij Zeijen",
    price_from: PRICE,
    intro:
      "Bijzonder overnachten in Drenthe begint met een plek die echt anders is. Huis ter Huynen biedt geen standaard vakantiehuis, maar twee zorgvuldig ingerichte boutique lodges midden in de natuur bij Zeijen. Elk met een eigen privé-hottub, volledig afgeschermd van de buitenwereld — voor een verblijf dat meer is dan een nacht weg.",
    sections: [
      {
        eyebrow: "Wat bijzonder maakt",
        heading: "Meer dan een overnachting",
        body: [
          "Een bijzonder verblijf onderscheidt zich niet door wat er allemaal in zit, maar door hoe het aanvoelt. Bij Huis ter Huynen begint dat gevoel zodra u de oprijlaan op rijdt: geen parkeerplaats vol auto's, geen receptiebalie, geen genummerde deuren. Alleen uw eigen lodge, een terras met hottub en de stilte van de Drentse heide.",
          "De lodges zijn ontworpen met oog voor authenticiteit en comfort tegelijk. Warme materialen, kwalitatieve bedden, een volledig uitgeruste keuken — en buiten begint de natuur. Dat samenspel van luxe en natuur is wat een verblijf hier echt bijzonder maakt.",
        ],
      },
      {
        eyebrow: "De accommodaties",
        heading: "Twee lodges, elk met eigen karakter",
        body: [
          "Beide lodges zijn volledig privé en geschikt voor maximaal vier personen. Ze delen dezelfde zorg voor detail, maar elk heeft zijn eigen sfeer.",
        ],
        bullets: [
          "Lodge De Heide — sauna, privé-hottub en panoramisch uitzicht over het bos.",
          "Lodge De Eik — hoge plafonds, buitenkeuken met BBQ en eigen hottub onder de eiken.",
          "Beide lodges: volledig uitgeruste keuken, comfortabele bedden en een eigen afgeschermd terras.",
          "EV-laadpaal op het terrein, gratis WiFi en persoonlijk contact met de gastheer.",
        ],
      },
      {
        eyebrow: "Voor wie",
        heading: "Bijzondere momenten verdienen een bijzondere plek",
        body: [
          "Een verjaardag, jubileum of gewoon een weekend dat er écht uitspringt — soms wil je de alledaagse setting achter je laten. Huis ter Huynen is de plek voor wie iets wil vieren zonder de anonimiteit van een hotel, of die natuur en comfort wil combineren zonder in te leveren op privacy.",
          "Meldt u bij de boeking gerust uw bijzondere gelegenheid — we zorgen waar mogelijk voor een persoonlijk welkom.",
        ],
      },
      {
        eyebrow: "De omgeving",
        heading: "Heide, bos en esdorpen voor de deur",
        body: [
          "Zeijen is een van de fraaiste brinkdorpen van Drenthe. Het Nationaal Park Drentsche Aa ligt op een kwartier, de Zeijerstrubben beginnen direct achter de lodges en er lopen meer dan 1.000 km fietspaden door de regio. Drenthe is de stilste provincie van Nederland — en juist die stilte maakt overnachten hier zo bijzonder.",
        ],
      },
    ],
    faq: [
      "Wat maakt dit overnachten 'bijzonder'? :: De combinatie van volledige privacy, een eigen hottub en sauna, een authentiek ingerichte lodge midden in de natuur en persoonlijke service. Geen massatoerisme, geen gedeelde ruimtes — een verblijf dat voelt als uw eigen plek.",
      "Kan ik een bijzondere gelegenheid vieren? :: Ja. Geef het bij de boeking aan — voor jubilea, verjaardagen of andere speciale momenten zorgen we waar mogelijk voor een persoonlijk welkom.",
      "Voor hoeveel personen zijn de lodges geschikt? :: Elke lodge biedt comfortabel plek aan maximaal vier personen. Twee aparte, volledig privé lodges zijn beschikbaar.",
      "Hoe ver is het van de bewoonde wereld? :: Dichtbij genoeg voor een restaurantbezoek of museum (Assen op 20 min), ver genoeg voor echte rust. Zeijen zelf is een rustiek brinkdorp met weinig doorgaand verkeer.",
    ].join("\n"),
    related: [
      "Luxe lodge in Drenthe :: /luxe-lodge-drenthe",
      "Romantisch weekend weg Drenthe :: /romantisch-weekend-weg-drenthe",
      "Wellness vakantie Drenthe :: /wellness-vakantie-drenthe",
      "Paarse heide Drenthe :: /heide-drenthe",
    ].join("\n"),
    cta_title: "Boek uw bijzonder verblijf in Drenthe",
    cta_body:
      "De lodges zijn al boekbaar voor 2027. Bekijk de beschikbaarheid of stel uw vraag — wij reageren binnen 24 uur persoonlijk.",
    meta_title: "Bijzonder Overnachten in Drenthe | Boutique Lodge bij Zeijen",
    meta_description:
      "Bijzonder overnachten in Drenthe: twee boutique lodges met privé-hottub en sauna op de heide bij Zeijen. Volledig privé, 20 min van Assen. Vanaf €165 per nacht.",
    og_image: "/heide2.jpg",
    sort_order: 8,
  },
  {
    slug: "vakantiehuis-drenthe-met-hond",
    breadcrumb: "Vakantiehuis Drenthe met hond",
    eyebrow: "Honden welkom · Zeijen · Drenthe",
    h1: "Vakantiehuis in Drenthe met hond",
    hero_sub:
      "Heide, bos en beekdal voor de deur — en uw hond mag gewoon mee. Bij Huis ter Huynen zijn honden in overleg welkom in onze lodges bij Zeijen.",
    hero_image: "/wandel_drenthe.jpg",
    hero_image_alt:
      "Wandelpad door de Drentse heide, perfect voor een vakantie met hond bij Zeijen",
    price_from: PRICE,
    intro:
      "Een vakantie met uw hond in Drenthe is bijna vanzelfsprekend: nergens zo veel ruimte, natuur en vrije wandelgebieden als hier. Bij Huis ter Huynen zijn honden in overleg welkom — zodat ook uw viervoeter volop kan genieten van de heide, de Zeijerstrubben en het beekdal van de Drentsche Aa.",
    sections: [
      {
        eyebrow: "Honden welkom",
        heading: "Uw hond verdient ook een vakantie",
        body: [
          "Een vakantiehuis zoeken waar uw hond echt welkom is — niet gedoogd, maar welkom — is soms een uitdaging. Bij Huis ter Huynen is de natuur zo de voordeur in dat het voor honden een paradijs is: uitgestrekte heidevelden, bospaadjes en waterrijke gebieden op loopafstand van de lodge.",
          "Honden zijn in overleg welkom. Neem gerust contact op bij uw boeking, dan stemmen we de details af. Zo kunt u met een gerust hart uw vakantie plannen.",
        ],
      },
      {
        eyebrow: "Wandelen",
        heading: "Drenthe: hondenvriendelijk paradijs",
        body: [
          "Drenthe heeft de beste wandelinfrastructuur voor honden van Nederland. Uitgestrekte gebieden zonder losloopverbod, brede onverharde paden en nauwelijks files of drukte. Vanuit de lodge bij Zeijen loopt u direct het Zeijerwiek en de Zeijerstrubben in — ruige natuur die echte vrijheid biedt.",
        ],
        bullets: [
          "Zeijerstrubben — strubbenbos op loopafstand, vrij toegankelijk.",
          "Nationaal Park Drentsche Aa — op 15 minuten, met aangelijnd-beleid op de meeste paden.",
          "Ballooërveld — heideveld met schaapskudde, op 12 minuten rijden.",
          "1.000+ km fietspaden in de regio, ook prima geschikt voor hondenwandelingen.",
        ],
      },
      {
        eyebrow: "De accommodatie",
        heading: "Een lodge met ruimte voor de hele familie",
        body: [
          "Beide lodges beschikken over een eigen afgeschermd terras en een ruime buitenruimte. Lodge De Eik heeft een volledig omheinde omgeving rondom het terras, ideaal voor kleine of actieve honden. Lodge De Heide heeft een open terras met uitzicht over het bos.",
          "Beide lodges zijn voor maximaal vier personen en ingericht met comfortabele bedden, een volledig uitgeruste keuken en een privé-hottub op het terras.",
        ],
      },
      {
        eyebrow: "Praktisch",
        heading: "Wat u moet weten over meegenomen honden",
        body: [
          "Honden zijn in overleg welkom — neem bij uw boeking contact op en geef aan hoeveel honden u meeneemt en van welk ras. We stemmen dan samen af welke lodge het beste past en welke afspraken gelden. Een kleine toeslag voor schoonmaak kan van toepassing zijn.",
        ],
      },
    ],
    faq: [
      "Zijn honden welkom in de lodge? :: Ja, honden zijn in overleg welkom. Geef bij uw boeking aan hoeveel honden u meeneemt, dan stemmen we de details af.",
      "Is de omgeving geschikt voor wandelen met een hond? :: Absoluut. Zeijen ligt midden in een van de hondvriendelijkste gebieden van Drenthe: strubbenbossen, heide en beekdalen op loopafstand. Op de meeste paden in het Nationaal Park Drentsche Aa gelden aangelijnd-regels.",
      "Is er een omheinde buitenruimte? :: Lodge De Eik heeft een omheinde buitenruimte rondom het terras. Wilt u dit specifiek, vermeld het dan bij uw boeking.",
      "Geldt er een toeslag voor honden? :: Een kleine schoonmaaktoeslag kan van toepassing zijn. Dit bespreken we bij de boeking.",
    ].join("\n"),
    related: [
      "Luxe lodge in Drenthe :: /luxe-lodge-drenthe",
      "Vakantiehuis met hottub Drenthe :: /vakantiehuis-met-hottub-drenthe",
      "Omgeving & activiteiten :: /omgeving",
    ].join("\n"),
    cta_title: "Boek uw vakantiehuis in Drenthe met hond",
    cta_body:
      "De lodges zijn al boekbaar voor 2027. Geef bij uw boeking aan dat u uw hond meeneemt — wij reageren binnen 24 uur persoonlijk.",
    meta_title: "Vakantiehuis Drenthe met Hond | Lodge met Hottub bij Zeijen",
    meta_description:
      "Vakantiehuis in Drenthe met hond? Twee lodges op de heide bij Zeijen, honden welkom in overleg. Wandelen vanuit de deur, privé-hottub. Vanaf €165 per nacht.",
    og_image: "/wandel_drenthe.jpg",
    sort_order: 9,
  },
  {
    slug: "hunebedden-drenthe",
    breadcrumb: "Hunebedden Drenthe",
    eyebrow: "Prehistorie & natuur · Zeijen · Drenthe",
    h1: "Hunebedden in Drenthe: logeren in het hart van de prehistorie",
    hero_sub:
      "Drenthe telt 54 hunebedden — meer dan de helft van alle Nederlandse megalietgraven. Overnacht in een luxe lodge bij Zeijen en ontdek de oudste monumenten van Nederland vanuit uw eigen uitvalsbasis.",
    hero_image: "/museum_drenthe.jpg",
    hero_image_alt:
      "Hunebed in het Drentse landschap, omgeven door hei en bos, nabij de Hunebed Highway N34",
    price_from: PRICE,
    intro:
      "Nergens in Nederland liggen zoveel hunebedden als in Drenthe. De 54 megalietgraven, gebouwd door de Trechterbekercultuur zo'n 5.000 jaar geleden, liggen verspreid over de provincie — langs de Hunebed Highway, in de bossen bij Emmen en rondom de stille esdorpen van Noord-Drenthe. Huis ter Huynen in Zeijen is dé uitvalsbasis om dit unieke erfgoed te verkennen.",
    sections: [
      {
        eyebrow: "Het erfgoed",
        heading: "5.000 jaar geschiedenis op loopafstand",
        body: [
          "Hunebedden zijn de oudste bovengrondse monumenten van Nederland. Ze werden gebouwd door de Trechterbekercultuur als collectieve graven — enorme keien, sommige van tientallen tonnen, nauwkeurig geplaatst zonder enig modern gereedschap. Hoe dat mogelijk was, is tot op de dag van vandaag een mysterie.",
          "Drenthe telt 54 van de 54 Nederlandse hunebedden. Ze liggen verspreid over de provincie, van Emmen in het zuiden tot Anloo en Balloo in het noorden. Vanuit de lodge bij Zeijen bereikt u de dichtstbijzijnde hunebedden in minder dan tien minuten.",
        ],
      },
      {
        eyebrow: "Hunebed Highway",
        heading: "De N34: een route door de prehistorie",
        body: [
          "De Hunebed Highway volgt de N34 dwars door Drenthe en verbindt tientallen hunebedden, musea en prehistorische vindplaatsen. Een rijkere route voor liefhebbers van geschiedenis bestaat er nauwelijks in Nederland.",
        ],
        bullets: [
          "Hunebedden D9 t/m D14 bij Anloo en Eext — op 10 tot 15 minuten van Zeijen.",
          "Drents Museum in Assen — het Meisje van Yde en andere vondsten uit de hunebedtijd.",
          "Hunebedcentrum Borger — het grootste hunebed van Nederland en een volledig museum.",
          "Nationaal Park Drentsche Aa — prehistorisch landschap met celtic fields en urnenvelden.",
        ],
      },
      {
        eyebrow: "De accommodatie",
        heading: "Luxe overnachten tussen de prehistorie",
        body: [
          "Na een dag langs de hunebedden keert u terug naar Huis ter Huynen: twee volledig privé boutique lodges met privé-hottub op het terras. Lodge De Heide heeft bovendien een eigen sauna; Lodge De Eik een buitenkeuken met BBQ. Beide zijn ingericht op comfort, privacy en de rust van de Drentse natuur.",
          "U boekt rechtstreeks bij Huis ter Huynen — persoonlijk, zonder tussenpersoon, en met directe communicatie met de gastheer.",
        ],
      },
      {
        eyebrow: "De omgeving",
        heading: "Meer dan alleen hunebedden",
        body: [
          "Zeijen is een van de mooiste brinkdorpen van Drenthe en ligt op een kwartier van het Nationaal Park Drentsche Aa. De heide van het Ballooërveld, de Zeijerstrubben en ruim 1.000 km aan fietspaden maken de omgeving rijker dan alleen prehistorie — ook voor wie niet elke dag op pad wil voor cultuur.",
        ],
      },
    ],
    faq: [
      "Hoe ver liggen de dichtstbijzijnde hunebedden? :: Vanuit de lodge in Zeijen rijdt u in minder dan tien minuten naar de hunebedden bij Anloo (D9–D14). Het Hunebedcentrum in Borger ligt op circa 30 minuten.",
      "Wat is de Hunebed Highway? :: De Hunebed Highway volgt de N34 door Drenthe en verbindt tientallen hunebedden, musea en prehistorische vindplaatsen. Een mooie dagtocht voor liefhebbers van geschiedenis.",
      "Is het Drents Museum een aanrader bij het bezoek aan hunebedden? :: Zeker. Het Drents Museum in Assen (20 min) geeft context aan de hunebedtijd, met o.a. het beroemde Meisje van Yde en vondsten uit de prehistorische nederzettingen van Drenthe.",
      "Kan ik ook met de fiets de hunebedden bereiken? :: Ja. Er zijn diverse fietsroutes vanuit Zeijen die langs hunebedden lopen. De regio beschikt over meer dan 1.000 km fietspaden, veel langs prehistorische bezienswaardigheden.",
    ].join("\n"),
    related: [
      "Bijzonder overnachten Drenthe :: /bijzonder-overnachten-drenthe",
      "Overnachten bij Veenhuizen :: /overnachten-veenhuizen",
      "Omgeving & activiteiten :: /omgeving",
    ].join("\n"),
    cta_title: "Boek uw verblijf bij de hunebedden van Drenthe",
    cta_body:
      "De lodges zijn al boekbaar voor 2027. Bekijk de beschikbaarheid of stel uw vraag — wij reageren binnen 24 uur persoonlijk.",
    meta_title: "Hunebedden Drenthe | Overnachten bij de Prehistorie in Zeijen",
    meta_description:
      "Hunebedden Drenthe ontdekken? Overnacht in een luxe lodge met hottub in Zeijen, op 10 min van de hunebedden bij Anloo. Hunebed Highway en Drents Museum dichtbij.",
    og_image: "/museum_drenthe.jpg",
    sort_order: 10,
  },
  {
    slug: "de/ferienhaus-mit-whirlpool-drenthe",
    breadcrumb: "Ferienhaus mit Whirlpool Drenthe",
    eyebrow: "Boutique Lodge · Zeijen · Drenthe",
    h1: "Ferienhaus mit Whirlpool in Drenthe",
    hero_sub:
      "Zwei exklusive Boutique Lodges inmitten der Drentse Heide — jede mit eigenem privatem Whirlpool auf der Terrasse. Ruhe, Natur und Luxus in den Niederlanden.",
    hero_image: "/lodge-heide.jpg",
    hero_image_alt:
      "Boutique Lodge De Heide von Huis ter Huynen mit privatem Whirlpool auf der Terrasse, umgeben von Heide und Wald in Zeijen, Drenthe",
    price_from: PRICE_DE,
    intro:
      "Ein Ferienhaus mit Whirlpool in Drenthe verbindet das Beste aus zwei Welten: die absolute Stille der Niederlande' ruhigsten Provinz und den Komfort eines privaten Whirlpools direkt auf Ihrer Terrasse. Bei Huis ter Huynen in Zeijen genießen Sie beides — vollständig privat, ohne geteilte Einrichtungen, das ganze Jahr über.",
    sections: [
      {
        eyebrow: "Das Erlebnis",
        heading: "Ihr privater Whirlpool unter dem Drentse Sternenhimmel",
        body: [
          "Stellen Sie sich vor: nach einem langen Wandertag durch die Zeijerstrubben oder einer Radtour entlang der Drentsche Aa sinken Sie in Ihren eigenen 38 °C warmen Whirlpool. Der Himmel über Drenthe zeigt mehr Sterne als fast jede andere Region der Niederlande — Lichtverschmutzung ist hier kaum ein Thema.",
          "Beide Lodges verfügen über einen eigenen, vollständig abgeschirmten Whirlpool auf der Terrasse. Ob morgens zur Entspannung, abends bei einem Glas Wein oder mitten im Winter im Schnee — der Whirlpool ist 24 Stunden am Tag, 365 Tage im Jahr für Sie da.",
        ],
      },
      {
        eyebrow: "Die Unterkünfte",
        heading: "Zwei Lodges mit eigenem Charakter",
        body: [
          "Beide Lodges bieten Platz für maximal vier Personen und sind mit der gleichen Sorgfalt eingerichtet — jede hat jedoch ihre eigene Atmosphäre.",
        ],
        bullets: [
          "Lodge De Heide — private Sauna, Whirlpool und Panoramablick über den Wald.",
          "Lodge De Eik — hohe Decken, authentisches Ambiente, Außenküche mit Grill und eigenem Whirlpool.",
          "Beide: voll ausgestattete Küche, komfortable Betten und private Terrasse.",
          "Kostenloses WLAN, E-Ladepunkt auf dem Gelände und persönlicher Kontakt mit dem Gastgeber.",
        ],
      },
      {
        eyebrow: "Für wen",
        heading: "Perfekt für Paare und kleine Gruppen",
        body: [
          "Ein Ferienhaus mit privatem Whirlpool in Drenthe ist ideal für Paare, die einen romantischen Kurzurlaub suchen, für kleine Familien, die die Natur erkunden möchten, oder für alle, die einfach einmal vollständig abschalten wollen — ohne die Anonymität eines Hotels.",
          "Die Kombination aus privatem Whirlpool, eigener Sauna (Lodge De Heide) und der natürlichen Umgebung schafft ein Wellness-Erlebnis, das keine öffentliche Spaanlage bieten kann.",
        ],
      },
      {
        eyebrow: "Die Lage",
        heading: "Mitten im schönsten Teil von Drenthe",
        body: [
          "Zeijen ist eines der schönsten Angerdörfer Drenthes. Der Nationalpark Drentsche Aa liegt 15 Minuten entfernt, die lila Heide des Ballooërveld ist in 12 Minuten erreichbar und Assen — mit Restaurants, Museen und Wellnesszentren — in 20 Minuten. Abgelegen genug für echte Ruhe, nah genug für ein abwechslungsreiches Urlaubsprogramm.",
        ],
      },
    ],
    faq: [
      "Hat jede Lodge einen eigenen privaten Whirlpool? :: Ja. Sowohl Lodge De Heide als auch Lodge De Eik verfügen über einen eigenen, abgeschirmten Whirlpool auf der Terrasse. Sie teilen ihn mit niemandem außer Ihrer eigenen Gruppe.",
      "Ist der Whirlpool das ganze Jahr verfügbar? :: Ja, der Whirlpool ist 24/7 verfügbar und standardmäßig auf 38 °C eingestellt — auch im Winter, wenn ein Whirlpool im verschneiten Drenthe am schönsten ist.",
      "Für wie viele Personen ist das Ferienhaus geeignet? :: Jede Lodge bietet Platz für maximal vier Personen. Ideal für Paare, eine kleine Familie oder zwei befreundete Paare.",
      "Wie weit ist es von der deutschen Grenze? :: Huis ter Huynen liegt in Zeijen, Drenthe, etwa 1,5 Stunden von der deutschen Grenze bei Nordhorn/Bentheim entfernt. Ein bequem erreichbares Reiseziel für einen Kurzurlaub aus Deutschland.",
    ].join("\n"),
    related: [
      "Luxus Lodge Drenthe :: /de/luxus-lodge-drenthe",
      "Wellness Urlaub Drenthe :: /de/wellness-urlaub-drenthe",
      "Romantisches Wochenende Drenthe :: /de/romantisches-wochenende-drenthe",
    ].join("\n"),
    cta_title: "Jetzt Ihr Ferienhaus mit Whirlpool in Drenthe buchen",
    cta_body:
      "Die Lodges sind bereits für 2027 buchbar. Prüfen Sie die Verfügbarkeit oder stellen Sie Ihre Frage — wir antworten persönlich innerhalb von 24 Stunden.",
    meta_title: "Ferienhaus mit Whirlpool in Drenthe | Private Lodge bei Zeijen",
    meta_description:
      "Ferienhaus mit privatem Whirlpool in Drenthe (NL). Zwei Boutique Lodges auf der Heide bei Zeijen, mit Whirlpool & Sauna. Ruhe, Natur und Luxus. Ab €165 pro Nacht.",
    og_image: "/lodge-heide.jpg",
    sort_order: 11,
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
  {
    slug: "heide-drenthe",
    breadcrumb: "Paarse heide Drenthe",
    eyebrow: "Heideseizoen · Zeijen · Drenthe",
    h1: "De paarse heide in Drenthe: wanneer, waar en hoe",
    hero_sub:
      "Een paar weken per jaar kleurt Drenthe diep paars-roze. Lees wanneer de heide bloeit, waar u de mooiste velden vindt rond Zeijen — en overnacht middenin het seizoen in een luxe lodge met privé-hottub.",
    hero_image: "/heide1.jpg",
    hero_image_alt:
      "Bloeiende paarse heide in Drenthe, op loopafstand van Huis ter Huynen in Zeijen",
    price_from: PRICE,
    intro:
      "Een paar weken per jaar verandert Drenthe van kleur. Vanaf half augustus tot in september kleurt de heide rond Zeijen diep paars-roze — een schouwspel waarvoor mensen uit het hele land naar het noorden trekken. Wie het wil zien, doet er goed aan het seizoen even te plannen: de bloei is kort, het mooist vroeg in de ochtend of laat op de avond, en de fraaiste velden liggen verspreid over de Zeijerstrubben, het Ballooërveld en het Dwingelderveld. Dit is uw gids voor de paarse heide in Drenthe — inclusief de plek waar u na een dag heide kijken neerstrijkt: Huis ter Huynen in Zeijen.",
    sections: [
      {
        eyebrow: "Het seizoen",
        heading: "Wanneer bloeit de heide in Drenthe?",
        body: [
          "De bloei van de heide volgt een vast ritme, maar het exacte moment verschilt elk jaar een beetje met het weer. Eerst bloeit de dopheide, die in de vochtige laagtes al in juli een zachtroze waas geeft. Daarna volgt de struikheide — de plant die Drenthe in augustus en september haar bekende paarse tapijt geeft.",
          "De piek ligt doorgaans tussen half augustus en begin september, met de laatste week van augustus vaak als absolute hoogtepunt. Daarna verschiet de kleur geleidelijk naar bruin en is het seizoen voorbij. Plant u een bezoek, dan is de tweede helft van augustus de veiligste keuze.",
        ],
        bullets: [
          "Juli: eerste dopheide bloeit in de vochtige laagtes.",
          "Half augustus – begin september: piek van de struikheide, het bekende paarse tapijt.",
          "Eind september: bloei neemt af, kleur verschiet naar bruin.",
          "Vroege ochtend of late namiddag: het mooiste licht, ook voor foto's.",
        ],
      },
      {
        eyebrow: "De beste plekken",
        heading: "Waar u de paarse heide rond Zeijen het mooiste ziet",
        body: [
          "Drenthe heeft op meerdere plekken uitgestrekte heidevelden, maar rond Zeijen liggen er een paar die u zo vanuit de lodge kunt bereiken — sommige zelfs lopend.",
        ],
        bullets: [
          "Zeijerstrubben — heide- en stuifzandgebied direct achter de lodges, klein maar authentiek en zelden druk.",
          "Ballooërveld — groot heideveld met een rondtrekkende schaapskudde, op ongeveer 12 minuten rijden.",
          "Dwingelderveld — de grootste natte heide van West-Europa, op circa 30 minuten, met uitgestrekte paarse vlakten.",
          "Drentsche Aa — beekdal met kleinschalige heide- en hooilandjes, op 15 minuten, mooi te combineren met een wandeling langs het water.",
        ],
      },
      {
        eyebrow: "Praktisch",
        heading: "Zo maakt u er het meeste van",
        body: [
          "Ga vroeg op pad: in de ochtend is het licht zachter, de paden zijn rustiger en de geur van de heide — een mengeling van honing en aarde — is op zijn sterkst. Op een doordeweekse dag heeft u de grotere velden vaak vrijwel voor uzelf.",
          "Stevige wandelschoenen zijn geen overbodige luxe; de paden zijn vaak onverhard en kunnen vochtig zijn. Neem water mee, en houd er rekening mee dat bloeiende heide veel bijen aantrekt — voor wie daar gevoelig voor is, is dat goed om te weten. Honden zijn op de meeste heidevelden welkom, vaak aangelijnd in verband met broedende vogels en grazende schapen.",
          "Een korte wandeling is al voldoende voor een indrukwekkend uitzicht, maar wie de tijd heeft, combineert een ochtend op de heide met een lange lunch en een rustige middag — precies het ritme waarvoor mensen naar Drenthe komen.",
        ],
      },
      {
        eyebrow: "Overnachten",
        heading: "Middenin het heideseizoen overnachten in Zeijen",
        body: [
          "Na een dag tussen de paarse heide is er weinig dat zo goed voelt als terugkeren naar een eigen, rustige plek. Huis ter Huynen ligt in Zeijen, met de Zeijerstrubben praktisch om de hoek en het Ballooërveld en Dwingelderveld op korte rijafstand. Twee volledig privé lodges, elk met een eigen hottub op het terras, vormen de perfecte basis voor een paar dagen heide kijken.",
          "'s Avonds, met stoffige wandelschoenen bij de deur en een glas wijn in de hand, stapt u in het warme water van de hottub terwijl de laatste kleur uit de lucht trekt boven de heide. Dat contrast — een dag in de uitgestrekte natuur, een avond in volledige privacy — is precies waarom gasten hier graag terugkomen.",
        ],
      },
    ],
    faq: [
      "Wanneer is de heide in Drenthe het mooist? :: Doorgaans tussen half augustus en begin september, met de laatste week van augustus vaak als hoogtepunt. Het exacte moment verschilt iets per jaar, afhankelijk van het weer.",
      "Waar is de heide het dichtst bij Huis ter Huynen? :: De Zeijerstrubben liggen direct achter de lodges en zijn een klein maar mooi heide- en stuifzandgebied. Voor grotere velden zijn het Ballooërveld (12 min) en het Dwingelderveld (30 min) een aanrader.",
      "Hoe lang duurt het heideseizoen? :: De volle bloei van de struikheide duurt meestal twee tot drie weken, van half augustus tot begin september. Daarvoor en daarna is er nog kleur te zien, maar minder uitgesproken.",
      "Is een bezoek aan de heide goed te combineren met een verblijf bij Huis ter Huynen? :: Zeker. De lodges liggen middenin het gebied waar de mooiste heidevelden van Noord-Drenthe te vinden zijn, en na een dag wandelen is de privé-hottub er om bij te komen.",
    ].join("\n"),
    related: [
      "Bijzonder overnachten in Drenthe :: /bijzonder-overnachten-drenthe",
      "Vakantiehuis met hottub Drenthe :: /vakantiehuis-met-hottub-drenthe",
      "Omgeving & activiteiten :: /omgeving",
    ].join("\n"),
    cta_title: "Boek uw verblijf tijdens het heideseizoen",
    cta_body:
      "De lodges zijn al boekbaar voor 2027. Bekijk de beschikbaarheid of stel uw vraag — wij reageren binnen 24 uur persoonlijk.",
    meta_title: "Paarse Heide in Drenthe | Wanneer & Waar Bloeit de Heide",
    meta_description:
      "Wanneer bloeit de heide in Drenthe? Ontdek de mooiste plekken voor de paarse heide rond Zeijen en overnacht in een luxe lodge met privé-hottub. Vanaf €165 per nacht.",
    og_image: "/heide1.jpg",
    sort_order: 12,
  },
  {
    slug: "de/luxus-lodge-drenthe",
    breadcrumb: "Luxus Lodge Drenthe",
    eyebrow: "Boutique Lodge · Zeijen · Drenthe",
    h1: "Luxus Lodge in Drenthe",
    hero_sub:
      "Zwei Boutique Lodges inmitten der Drentse Natur. Stilvoll eingerichtet, vollständig privat und mit Sauna, Whirlpool und allem Komfort für einen Aufenthalt, der bis ins Detail stimmt.",
    hero_image: "/lodge-eik.jpg",
    hero_image_alt:
      "Luxus Lodge De Eik unter den Eichen bei Zeijen in Drenthe, mit Außenküche und eigener Terrasse",
    price_from: PRICE_DE,
    intro:
      "Eine Luxus Lodge in Drenthe bedeutet nicht Überfluss, sondern die richtigen Dinge perfekt aufeinander abgestimmt: ein gutes Bett, warme Materialien, echte Privatsphäre und Natur, die direkt vor der Tür beginnt. Huis ter Huynen bietet zwei sorgfältig eingerichtete Lodges auf der Heide bei Zeijen — kein Hotel, sondern ein eigener Ort, an dem Sie sich sofort zu Hause fühlen.",
    sections: [
      {
        eyebrow: "Positionierung",
        heading: "Luxus bedeutet Ruhe, Raum und Privatsphäre",
        body: [
          "Echter Luxus zeigt sich nicht daran, wie viel da ist, sondern daran, was fehlt: keine Nachbarn, kein Lärm, keine Eile. Unsere Lodges stehen frei in der Landschaft, jede mit eigener Terrasse und Blick auf Heide oder Wald. Sie teilen sich nichts mit anderen Gästen. Genau dieses Gefühl — ein Ort ganz für sich allein — unterscheidet einen Aufenthalt hier von einem durchschnittlichen Ferienhaus oder Hotel.",
          "Gleichzeitig fehlt es an nichts. Ein privater Whirlpool auf der Terrasse, eine voll ausgestattete Küche, schnelles WLAN und ein E-Ladepunkt auf dem Gelände — alles ist organisiert, damit Sie sich auf das konzentrieren können, wofür Sie gekommen sind: nichts.",
        ],
      },
      {
        eyebrow: "Die Unterkünfte",
        heading: "Zwei Lodges mit eigenem Charakter",
        body: [
          "Beide Lodges bieten Platz für vier Personen und sind mit der gleichen Sorgfalt eingerichtet — doch jede hat ihre eigene Atmosphäre.",
        ],
        bullets: [
          "Lodge De Heide — eigene Sauna, privater Whirlpool und Panoramablick über den Wald.",
          "Lodge De Eik — hohe Decken, authentisches Ambiente, Außenküche mit Grill und eigenem Whirlpool.",
          "Voll ausgestattete Küche, hochwertige Betten und private Terrasse in beiden Lodges.",
          "Kostenloses WLAN, E-Ladepunkt und persönlicher Kontakt mit dem Gastgeber vor und während Ihres Aufenthalts.",
        ],
      },
      {
        eyebrow: "Für wen",
        heading: "Für alle, die Qualität statt Quantität suchen",
        body: [
          "Eine Luxus Lodge in Drenthe ist ideal für Paare, die einmal ganz raus wollen, für kleine Familien, die die Natur entdecken möchten, oder für alle, die einen besonderen Anlass feiern wollen — ohne den Trubel eines Resorts. Die Größe ist bewusst klein gehalten: zwei Lodges, persönliche Aufmerksamkeit, keine anonyme Rezeption.",
          "Wer Luxus vor allem als Erlebnis versteht — eine warme Sauna nach einer Wanderung, Kochen mit regionalen Produkten, ein Abend am Feuer — fühlt sich hier sofort zu Hause. Der Komfort ist da, aber Natur und Ruhe stehen im Vordergrund.",
        ],
      },
      {
        eyebrow: "Die Lage",
        heading: "Mitten im schönsten Teil von Drenthe",
        body: [
          "Zeijen ist eines der schönsten Angerdörfer Drenthes. Der Nationalpark Drentsche Aa liegt eine Viertelstunde entfernt, die lila Heide des Ballooërveld ist ganz in der Nähe, und Assen erreichen Sie in zwanzig Minuten. Sie sind also abgelegen genug für vollständige Ruhe, aber nah genug an Kultur, Restaurants und Wellness für einen abwechslungsreichen Aufenthalt.",
        ],
      },
    ],
    faq: [
      "Was macht diese Lodges zu 'Luxus'? :: Die Kombination aus vollständiger Privatsphäre, einem eigenen Whirlpool (und Sauna in De Heide), hochwertiger Einrichtung, einer voll ausgestatteten Küche und persönlichem Service. Keine geteilten Einrichtungen, kein Massentourismus.",
      "Wie viele Lodges gibt es und wie groß sind sie? :: Es gibt zwei freistehende Lodges, De Heide und De Eik, jede für maximal vier Personen geeignet. Beide sind vollständig privat.",
      "Kann ich die Lodge das ganze Jahr über buchen? :: Ja, Huis ter Huynen ist ganzjährig buchbar. Jede Jahreszeit hat ihren eigenen Reiz, von blühender Heide im Sommer bis zu stillen, verschneiten Wäldern im Winter.",
      "Wie weit ist es von der deutschen Grenze? :: Huis ter Huynen liegt in Zeijen, Drenthe, etwa 1,5 Stunden von der deutschen Grenze bei Nordhorn/Bentheim entfernt — ein bequem erreichbares Ziel für einen Kurzurlaub.",
    ].join("\n"),
    related: [
      "Ferienhaus mit Whirlpool Drenthe :: /de/ferienhaus-mit-whirlpool-drenthe",
      "Wellness Urlaub Drenthe :: /de/wellness-urlaub-drenthe",
      "Romantisches Wochenende Drenthe :: /de/romantisches-wochenende-drenthe",
    ].join("\n"),
    cta_title: "Erleben Sie eine Luxus Lodge in Drenthe",
    cta_body:
      "Die Lodges sind bereits für 2027 buchbar. Prüfen Sie die Verfügbarkeit oder stellen Sie Ihre Frage — wir antworten persönlich innerhalb von 24 Stunden.",
    meta_title: "Luxus Lodge in Drenthe | Boutique Aufenthalt mit Whirlpool bei Zeijen",
    meta_description:
      "Luxus Boutique Lodge in Drenthe, auf der Heide bei Zeijen. Zwei vollständig private Lodges mit Whirlpool und Sauna, 20 Min. von Assen. Ruhe, Raum und Komfort. Jetzt direkt buchen.",
    og_image: "/lodge-eik.jpg",
    sort_order: 13,
  },
  {
    slug: "de/wellness-urlaub-drenthe",
    breadcrumb: "Wellness Urlaub Drenthe",
    eyebrow: "Wellness & Ruhe · Zeijen · Drenthe",
    h1: "Wellness Urlaub in Drenthe",
    hero_sub:
      "Ein privater Whirlpool auf der Terrasse, eine eigene Sauna und die stillste Natur der Niederlande um Sie herum. Bei Huis ter Huynen ist Wellness keine Abteilung, sondern das gesamte Erlebnis.",
    hero_image: "/lodge-heide.jpg",
    hero_image_alt:
      "Lodge De Heide mit privatem Whirlpool und eigener Sauna, umgeben von Heide und Wald bei Zeijen in Drenthe",
    price_from: PRICE_DE,
    intro:
      "Ein Wellness Urlaub in Drenthe geht über eine Stunde Sauna hinaus. Hier ist die Natur selbst die Quelle der Ruhe: Stilleregionen, endlose Heide und Wälder, in denen Sie niemandem begegnen. Bei Huis ter Huynen verbinden Sie diese Ruhe mit echtem Luxus — einem privaten Whirlpool, einer eigenen Sauna in Lodge De Heide und allem Komfort, um vollständig zu sich selbst zu finden.",
    sections: [
      {
        eyebrow: "Die Idee",
        heading: "Natur als Medizin, Komfort als Basis",
        body: [
          "Studien zeigen immer wieder, dass Zeit in einer stillen, grünen Umgebung Stress messbar reduziert. Drenthe ist dafür der ideale Ort: offiziell die stillste Provinz der Niederlande, mit geschützten Stilleregionen und kaum Lichtverschmutzung. Ein Spaziergang durch die Zeijerstrubben oder entlang der Drentsche Aa wirkt mehr als jede Behandlung.",
          "Bei Huis ter Huynen kommt der Komfort hinzu, der einen Wellness Urlaub vollständig macht: warmes, sprudelndes Wasser in Ihrem privaten Whirlpool, eine Sauna, die nur Ihnen gehört, und eine Lodge, in der Sie sich sofort entspannen. Keine geteilten Räume, kein Trubel — Wellness in Ihrem eigenen Tempo.",
        ],
      },
      {
        eyebrow: "Was Sie bekommen",
        heading: "Privates Wellness in Ihrer eigenen Lodge",
        body: [
          "Sie müssen für Ihr Wellness-Erlebnis nicht einmal das Haus verlassen. Beide Lodges verfügen über einen eigenen Whirlpool; Lodge De Heide zusätzlich über eine private Sauna.",
        ],
        bullets: [
          "Privater Whirlpool auf der Terrasse, 24/7 verfügbar bei 38 °C.",
          "Eigene Sauna in Lodge De Heide — keine Reservierung, keine Mitgäste.",
          "Vollständige Privatsphäre: Ihre Terrasse blickt auf Natur, nicht auf Nachbarn.",
          "Wander- und Radwege direkt vor der Tür für 'Waldbaden' und Bewegung.",
          "Wellnesszentren und Spas in der Region (Assen, Hof van Saksen) für einen zusätzlichen Verwöhntag.",
        ],
      },
      {
        eyebrow: "Ein Tag",
        heading: "So sieht ein Wellnesstag aus",
        body: [
          "Beginnen Sie den Tag mit einem stillen Morgenspaziergang über die Heide, solange der Tau noch liegt. Zurück in der Lodge ein ausgiebiges Frühstück auf der Terrasse, danach in die Sauna. Nachmittags eine Radtour durch die Esdörfer oder ein Besuch in einem nahegelegenen Wellnesszentrum. Und wenn der Abend kommt: hinein in den Whirlpool, mit Blick auf einen Sternenhimmel, den Sie in der Stadt nie sehen.",
          "Dieser Rhythmus — bewegen, aufwärmen, abkühlen, nichts müssen — ist genau das, wofür ein Wellness Urlaub gedacht ist. In Drenthe stellt er sich von selbst ein.",
        ],
      },
      {
        eyebrow: "Die Umgebung",
        heading: "Stille, Heide und Wasser in Reichweite",
        body: [
          "Der Nationalpark Drentsche Aa liegt eine Viertelstunde entfernt, das Ballooërveld mit seiner lila Heide ganz in der Nähe, und Assen — mit Wellnesszentren, Restaurants und dem Drents Museum — in zwanzig Minuten. Sie entscheiden selbst, wie viel Sie unternehmen und wie viel Sie einfach nur sitzen bleiben.",
        ],
      },
    ],
    faq: [
      "Hat die Lodge eine eigene Sauna? :: Lodge De Heide verfügt über eine eigene private Sauna. Beide Lodges haben einen privaten Whirlpool auf der Terrasse, 24/7 verfügbar.",
      "Ist das für ein Wellness-Wochenende zu zweit geeignet? :: Auf jeden Fall. Die Lodges sind vollständig privat und ideal für Paare, die Ruhe und Verwöhnung suchen, ohne den Trubel eines großen Wellnessresorts.",
      "Gibt es auch Wellnesszentren in der Umgebung? :: Ja. In Assen (20 Min.) und der weiteren Region finden Sie verschiedene Wellnesszentren und Spas, etwa Spa Hof van Saksen, für einen zusätzlichen Verwöhntag.",
      "Was ist die beste Zeit für einen Wellness Urlaub in Drenthe? :: Jede Jahreszeit funktioniert: die lila Heide im Spätsommer, die Herbstfarben, oder gerade der Winter, wenn der Whirlpool in der verschneiten Stille am schönsten ist.",
    ].join("\n"),
    related: [
      "Ferienhaus mit Whirlpool Drenthe :: /de/ferienhaus-mit-whirlpool-drenthe",
      "Luxus Lodge Drenthe :: /de/luxus-lodge-drenthe",
      "Romantisches Wochenende Drenthe :: /de/romantisches-wochenende-drenthe",
    ].join("\n"),
    cta_title: "Buchen Sie Ihren Wellness Urlaub in Drenthe",
    cta_body:
      "Die Lodges sind bereits für 2027 buchbar. Prüfen Sie die Verfügbarkeit oder stellen Sie Ihre Frage — wir antworten persönlich innerhalb von 24 Stunden.",
    meta_title: "Wellness Urlaub in Drenthe | Lodge mit Whirlpool & Sauna",
    meta_description:
      "Wellness Urlaub in Drenthe: private Lodge mit eigenem Whirlpool und Sauna auf der Heide bei Zeijen. Stille, Natur und Komfort, 20 Min. von Assen. Ab €165 pro Nacht.",
    og_image: "/lodge-heide.jpg",
    sort_order: 14,
  },
  {
    slug: "de/romantisches-wochenende-drenthe",
    breadcrumb: "Romantisches Wochenende Drenthe",
    eyebrow: "Für Paare · Zeijen · Drenthe",
    h1: "Romantisches Wochenende in Drenthe",
    hero_sub:
      "Kein Programm, kein Trubel — nur Sie beide, die Heide vor der Tür und ein privater Whirlpool unter den Sternen. Ein romantisches Wochenende in Drenthe in seiner schönsten Form.",
    hero_image: "/heide3.jpg",
    hero_image_alt:
      "Abendstimmung über der blühenden Heide in Drenthe, die perfekte Kulisse für ein romantisches Wochenende",
    price_from: PRICE_DE,
    intro:
      "Ein romantisches Wochenende dreht sich um Zeit für sich, ohne Ablenkung. Drenthe ist wie geschaffen dafür: die stillste Provinz der Niederlande, mit endloser Natur und kaum Touristen. Bei Huis ter Huynen wohnen Sie in einer vollständig privaten Lodge mit eigenem Whirlpool — der ideale Ort, um gemeinsam ganz abzuschalten.",
    sections: [
      {
        eyebrow: "Warum Drenthe",
        heading: "Die Ruhe, die ein romantisches Wochenende braucht",
        body: [
          "Romantik braucht Raum und Ruhe. Drenthe bietet beides im Überfluss: keine Staus, keine Massen, dafür weite Heide, alte Strubbenwälder und das gewundene Bachtal der Drentsche Aa. Hier hören Sie morgens nur Vögel und abends nichts als den Wind. Genau diese Stille macht ein Wochenende zu zweit so besonders.",
          "Und doch müssen Sie auf nichts verzichten: ein gutes Restaurant, ein Wellnesstag oder ein kultureller Ausflug nach Assen sind alle in Reichweite. Sie entscheiden selbst, ob Sie die Lodge kaum verlassen oder doch hinausziehen.",
        ],
      },
      {
        eyebrow: "Ideen",
        heading: "So wird das Wochenende unvergesslich",
        body: [
          "Ein romantisches Wochenende in Drenthe wird durch Sie selbst gestaltet. Ein paar Ideen, die den Aufenthalt vollkommen machen:",
        ],
        bullets: [
          "Sonnenuntergang über der Heide, gefolgt vom Whirlpool unter dem Sternenhimmel.",
          "Ein Kerzenlicht-Dinner auf Ihrer eigenen Terrasse, mit regionalen Produkten.",
          "Gemeinsam Rad fahren durch die Esdörfer in Richtung Norg und der Drentsche Aa.",
          "Ein Wellnesstag in der Umgebung und danach Entspannung in Ihrer eigenen Sauna (Lodge De Heide).",
          "Ein Nichtstun-Tag: Morgenkaffee im Bad, ein Buch und keine Verpflichtungen.",
        ],
      },
      {
        eyebrow: "Die Unterkunft",
        heading: "Eine private Lodge mit Whirlpool für zwei",
        body: [
          "Beide Lodges sind vollständig privat und perfekt für ein Paar: eine eigene Terrasse, ein privater Whirlpool bei 38 °C und ein stimmungsvolles Interieur, in dem Sie sich sofort wohlfühlen. Keine Rezeption, keine Mitgäste — nur Sie beide.",
          "Feiern Sie ein Jubiläum, einen Geburtstag oder einfach sich selbst? Teilen Sie es uns bei der Buchung mit — wir sorgen, wo möglich, für einen persönlichen Empfang.",
        ],
      },
      {
        eyebrow: "Praktisch",
        heading: "Ideal kombinierbar mit dem Rest von Drenthe",
        body: [
          "Huis ter Huynen liegt in Zeijen, zwanzig Minuten von Assen und eine Viertelstunde vom Nationalpark Drentsche Aa entfernt. So verbinden Sie Ruhe mit Erreichbarkeit: ein romantisches Dinner, ein Museumsbesuch oder ein Wellness-Nachmittag sind schnell organisiert — und danach kehren Sie zurück an Ihren eigenen stillen Ort auf der Heide.",
        ],
      },
    ],
    faq: [
      "Ist die Lodge für ein romantisches Wochenende zu zweit geeignet? :: Auf jeden Fall. Beide Lodges sind vollständig privat, mit eigenem Whirlpool auf der Terrasse und stimmungsvollem Interieur — ideal für Paare, die Ruhe und Privatsphäre suchen.",
      "Wann ist die schönste Zeit für ein romantisches Wochenende in Drenthe? :: Jede Jahreszeit hat ihren Reiz: die lila Heide im August und September, die Herbstfarben im Oktober, oder der stille, verschneite Winter, in dem der Whirlpool am schönsten ist.",
      "Können wir einen besonderen Anlass feiern? :: Ja, geben Sie es bei der Buchung an. Wo möglich sorgen wir für einen persönlichen Empfang, um Ihren Geburtstag, Ihr Jubiläum oder Ihre Überraschung besonders zu machen.",
      "Wie weit ist es von der deutschen Grenze entfernt? :: Huis ter Huynen liegt in Zeijen, Drenthe, etwa 1,5 Stunden von der deutschen Grenze bei Nordhorn/Bentheim — ideal für ein Wochenende ohne lange Anfahrt.",
    ].join("\n"),
    related: [
      "Ferienhaus mit Whirlpool Drenthe :: /de/ferienhaus-mit-whirlpool-drenthe",
      "Luxus Lodge Drenthe :: /de/luxus-lodge-drenthe",
      "Wellness Urlaub Drenthe :: /de/wellness-urlaub-drenthe",
    ].join("\n"),
    cta_title: "Planen Sie Ihr romantisches Wochenende in Drenthe",
    cta_body:
      "Die Lodges sind bereits für 2027 buchbar. Prüfen Sie die Verfügbarkeit oder stellen Sie Ihre Frage — wir antworten persönlich innerhalb von 24 Stunden.",
    meta_title: "Romantisches Wochenende in Drenthe | Private Lodge mit Whirlpool",
    meta_description:
      "Romantisches Wochenende in Drenthe? Übernachten Sie in einer privaten Lodge mit Whirlpool auf der Heide bei Zeijen. Ruhe, Natur und Privatsphäre für Paare. Jetzt buchen.",
    og_image: "/heide3.jpg",
    sort_order: 15,
  },
];

export const SEED_BY_SLUG: Record<string, LandingPageRecord> = Object.fromEntries(
  SEED_LANDING_PAGES.map((p) => [p.slug, p]),
);
