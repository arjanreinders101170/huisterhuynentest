/* ═══ Groeiplan naar 10.000 bezoekers per maand ═══
 *
 * Eén bron voor de cijfers achter het doel: de mijlpalen, de kanaalmix die
 * samen 10.000 bezoekers oplevert, en wat elk budgetscenario koopt. De admin
 * leest hieruit, zodat het scherm en het plan nooit uit elkaar lopen.
 *
 * Alle bedragen zijn exclusief btw en gebaseerd op Nederlandse markttarieven
 * voor 2026. Alle bezoekersaantallen zijn maandcijfers.
 */

/* ── Het doel ────────────────────────────────────────────────────────────── */

export const DOEL_BEZOEKERS = 10_000;

/* ── Mijlpalen ───────────────────────────────────────────────────────────── */

export interface Mijlpaal {
  id: string;
  periode: string;
  /** Eerste maand van de fase, als YYYY-MM — waarmee de admin bepaalt waar we staan. */
  vanaf: string;
  doel: number;
  titel: string;
  waarom: string;
  /** Wat er in deze fase moet gebeuren om het volgende doel te halen. */
  hefbomen: string[];
}

export const MIJLPALEN: Mijlpaal[] = [
  {
    id: "fundament",
    periode: "sep – dec 2026",
    vanaf: "2026-09",
    doel: 400,
    titel: "Fundament",
    waarom:
      "De site staat nog vrijwel volledig op pagina 4 en verder. Deze fase gaat niet over verkeer, maar over posities: herbouwde landingspagina's, 24 artikelen erbij en een geverifieerd bedrijfsprofiel. Verkeer volgt met 3 tot 6 maanden vertraging.",
    hefbomen: [
      "Drie P0-landingspagina's herbouwd (wellness, romantiek, jacuzzi)",
      "24 artikelen erbij — 6 per maand",
      "Google Bedrijfsprofiel geverifieerd, wekelijkse posts",
      "Gratis vermeldingen: VVV Drenthe, Visit Drenthe, ANWB, Tripadvisor",
      "GA4 live en aan Search Console gekoppeld",
      "Interieurfotografie — nodig voor élk kanaal hierna",
    ],
  },
  {
    id: "opening",
    periode: "jan – mrt 2027",
    vanaf: "2027-01",
    doel: 1_200,
    titel: "Opening",
    waarom:
      "De opening is het enige moment waarop de pers uit zichzelf wil schrijven. Tegelijk gaan de eerste advertenties aan: op merknaam en op de drie commerciële clusters waar de organische positie nog te laag is om te oogsten.",
    hefbomen: [
      "Persbericht naar RTV Drenthe, Dagblad van het Noorden, Asser Courant",
      "Google Ads aan op merk + jacuzzi/wellness/romantisch",
      "Pinterest-account met seizoenspins — goedkoopste bereik in de reiscategorie",
      "Natuurhuisje en Airbnb live als vindkanaal (niet als hoofdkanaal)",
      "Eerste echte reviews verzamelen — vanaf 5 stuks komen sterren in Google",
    ],
  },
  {
    id: "opbouw",
    periode: "apr – dec 2027",
    vanaf: "2027-04",
    doel: 3_500,
    titel: "Opbouw",
    waarom:
      "De artikelen uit 2026 beginnen te rijpen: een artikel bereikt zijn volle verkeer pas na 6 tot 12 maanden. Dit is de fase waarin het volume gaat tellen en waarin duidelijk wordt welke advertenties hun geld waard zijn.",
    hefbomen: [
      "Contentvolume vasthouden: 6 artikelen per maand, nu op de rijpe clusters",
      "Advertentiebudget verschuiven naar wat aantoonbaar boekingen oplevert",
      "Duitse set compleet — Duitsland is de tweede markt voor Drenthe",
      "Linkbuilding: 2 kwaliteitsverwijzingen per maand",
      "Reviewvliegwiel automatisch: verzoek 3 dagen na vertrek",
    ],
  },
  {
    id: "schaal",
    periode: "jan – jun 2028",
    vanaf: "2028-01",
    doel: 7_000,
    titel: "Schaal",
    waarom:
      "Rond 100 rijpe artikelen kantelt het: de site wordt door Google als autoriteit op Drenthe-natuur behandeld en nieuwe artikelen ranken binnen weken in plaats van maanden.",
    hefbomen: [
      "Ruim 100 rijpe artikelen — het kantelpunt voor onderwerpautoriteit",
      "Pinterest op volume: 15 pins per week, seizoensgebonden",
      "E-maillijst boven 1.500 — eigen kanaal, geen algoritme",
      "Digital PR: één verhaal per kwartaal dat landelijk oppikbaar is",
    ],
  },
  {
    id: "doel",
    periode: "jul – dec 2028",
    vanaf: "2028-07",
    doel: 10_000,
    titel: "10.000 bezoekers",
    waarom:
      "Het doel is bereikt met een kanaalmix waarin geen enkel kanaal onmisbaar is. Vanaf hier stuurt u niet meer op volume maar op opbrengst per bezoeker: prijs omhoog, en het overschot aan vraag gebruiken om de beste weken te vullen.",
    hefbomen: [
      "Van bezetting sturen naar prijs sturen — vraag boven capaciteit is prijsmacht",
      "Advertentiebudget terugschroeven waar organisch het heeft overgenomen",
      "Basis voor uitbreiding: een derde lodge start niet meer bij nul",
    ],
  },
];

/* ── De kanaalmix bij 10.000 ─────────────────────────────────────────────── */

export interface KanaalDoel {
  /** Sluit aan op de kanaalnamen in src/lib/attributie.ts waar dat kan. */
  id: string;
  label: string;
  bezoekers: number;
  /** Wat dit kanaal structureel per maand kost als het eenmaal draait. */
  kostenPerMaand: number;
  toelichting: string;
}

export const KANAALMIX: KanaalDoel[] = [
  {
    id: "organisch-informatief",
    label: "Organisch — natuur & regio",
    bezoekers: 3_800,
    kostenPerMaand: 0,
    toelichting:
      "Artikelen over heide, hunebedden, fietsen, wandelen. Boekt niet direct, maar levert het volume en de autoriteit waar de commerciële pagina's op meeliften. Al betaald op het moment dat het artikel geschreven is.",
  },
  {
    id: "organisch-commercieel",
    label: "Organisch — commercieel",
    bezoekers: 1_600,
    kostenPerMaand: 0,
    toelichting:
      "Jacuzzi, wellness, romantisch weekend, luxe lodge, locatiepagina's. Twaalf tot vijftien pagina's in de top 10. Dit is het verkeer dat boekt.",
  },
  {
    id: "betaald-google",
    label: "Google Ads",
    bezoekers: 1_100,
    kostenPerMaand: 800,
    toelichting:
      "Koopt precies de posities die organisch nog niet bereikt zijn. Stopt zodra u stopt met betalen — daarom een aanvulling en nooit het fundament.",
  },
  {
    id: "google-bedrijfsprofiel",
    label: "Google Bedrijfsprofiel",
    bezoekers: 900,
    kostenPerMaand: 0,
    toelichting:
      "Maps en het lokale blok. Gratis, maar vraagt onderhoud: foto's, posts en vooral reviews. Voor accommodaties het hoogst renderende gratis kanaal dat er is.",
  },
  {
    id: "betaald-meta",
    label: "Meta Ads",
    bezoekers: 900,
    kostenPerMaand: 400,
    toelichting:
      "Bereik en herhaalbezoek, niet directe vraag. Sterkst als retargeting op bezoekers die de beschikbaarheid bekeken maar niet aanvroegen.",
  },
  {
    id: "pinterest",
    label: "Pinterest",
    bezoekers: 700,
    kostenPerMaand: 30,
    toelichting:
      "Onderschat kanaal voor natuur- en interieurbeeld. Pins blijven jaren verkeer leveren en de doelgroep (vrouwen 25–55, oriënterend op weekendjes weg) is precies de onze.",
  },
  {
    id: "verwijzing",
    label: "Vermeldingen, gidsen & pers",
    bezoekers: 400,
    kostenPerMaand: 100,
    toelichting:
      "VVV, Visit Drenthe, ANWB, wandel- en fietssites, reisblogs. Levert bescheiden verkeer maar bouwt de autoriteit waar alle organische posities op steunen.",
  },
  {
    id: "social",
    label: "Instagram & Facebook organisch",
    bezoekers: 300,
    kostenPerMaand: 0,
    toelichting:
      "Vooral bindend voor mensen die al van u weten. Reken hier niet op nieuwe vraag.",
  },
  {
    id: "e-mail",
    label: "E-mail",
    bezoekers: 250,
    kostenPerMaand: 25,
    toelichting:
      "Het enige kanaal dat u zelf bezit. Bij 1.500 abonnees en één mailing per maand is dit ook het kanaal met de hoogste conversie per bezoeker.",
  },
  {
    id: "direct",
    label: "Direct & merk",
    bezoekers: 250,
    kostenPerMaand: 0,
    toelichting:
      "Mensen die de naam intypen. Groeit vanzelf mee met alle andere kanalen — een graadmeter, geen stuurknop.",
  },
];

export const KANAALMIX_TOTAAL = KANAALMIX.reduce((som, k) => som + k.bezoekers, 0);
export const KANAALMIX_KOSTEN = KANAALMIX.reduce((som, k) => som + k.kostenPerMaand, 0);

/* ── Budgetscenario's ────────────────────────────────────────────────────── */

export interface BudgetPost {
  label: string;
  /** Bedrag per maand bij doorlopende posten, totaalbedrag bij eenmalige. */
  bedrag: number;
  wat: string;
}

export interface Scenario {
  id: "zuinig" | "doelgericht" | "versnellen";
  naam: string;
  perMaand: number;
  /** Looptijd waarover het scenario wordt beoordeeld. */
  maanden: number;
  eenmalig: number;
  /** Verwachte bezoekers per maand aan het einde van de looptijd. */
  uitkomst: [number, number];
  doelGehaald: boolean;
  posten: BudgetPost[];
  eenmaligePosten: BudgetPost[];
  oordeel: string;
}

/* Eenmalige investeringen zijn in alle scenario's dezelfde noodzaak, alleen in
 * verschillende mate. Fotografie staat overal in: zonder interieurbeeld werkt
 * geen enkel kanaal, betaald of organisch. */
const FOTO: BudgetPost = { label: "Interieur- & sfeerfotografie", bedrag: 900, wat: "Halve dag, beide lodges, inclusief bewerking. De grootste conversieblokker die er nu is." };
const VIDEO: BudgetPost = { label: "Korte video's / drone", bedrag: 600, wat: "Vijf clips voor Pinterest, Instagram en de landingspagina's." };
const VERTALING: BudgetPost = { label: "Duitse vertaling door native", bedrag: 450, wat: "Tien pagina's. De huidige Duitse set is te dun om te ranken." };
const PERSKIT: BudgetPost = { label: "Persbericht & persfoto's", bedrag: 250, wat: "Voor de opening — het enige moment waarop regionale media uit zichzelf schrijven." };

export const SCENARIOS: Scenario[] = [
  {
    id: "zuinig",
    naam: "Zuinig",
    perMaand: 300,
    maanden: 24,
    eenmalig: 900,
    uitkomst: [4_000, 5_000],
    doelGehaald: false,
    oordeel:
      "Haalt het doel niet, maar vult wel beide lodges. Alles wordt zelf geschreven, advertenties draaien alleen in de piekweken. Kies dit als de agenda krapper is dan de portemonnee — het kost vooral tijd.",
    eenmaligePosten: [FOTO],
    posten: [
      { label: "Google Ads (alleen piekweken)", bedrag: 150, wat: "Merknaam beschermen plus de weken vóór Valentijn, Pasen en de zomer." },
      { label: "Tooling", bedrag: 60, wat: "Positiemeting en e-mail." },
      { label: "Linkbuilding", bedrag: 50, wat: "Eén verwijzing per kwartaal." },
      { label: "Beeld & losse kosten", bedrag: 40, wat: "Stockbeeld, Pinterest-pins, kleine aanvullingen." },
    ],
  },
  {
    id: "doelgericht",
    naam: "Doelgericht",
    perMaand: 1_000,
    maanden: 24,
    eenmalig: 2_200,
    uitkomst: [8_000, 10_000],
    doelGehaald: true,
    oordeel:
      "Het advies. Haalt het doel aan de onderkant binnen twee jaar en houdt de vaste lasten laag doordat het zwaartepunt bij content ligt en niet bij advertenties. Content koopt verkeer één keer; advertenties koopt u elke maand opnieuw.",
    eenmaligePosten: [FOTO, VIDEO, VERTALING, PERSKIT],
    posten: [
      { label: "Contentproductie", bedrag: 360, wat: "Vier artikelen per maand uitbesteed, twee zelf. Rijpt door tot circa 50 bezoekers per artikel per maand." },
      { label: "Google Ads", bedrag: 300, wat: "Circa 350 klikken per maand op commerciële zoektermen." },
      { label: "Meta Ads", bedrag: 150, wat: "Retargeting plus koud bereik in Nederland en Noord-Duitsland." },
      { label: "Linkbuilding & digital PR", bedrag: 100, wat: "Twee kwaliteitsverwijzingen per maand — tilt álle pagina's op, niet één." },
      { label: "Tooling", bedrag: 60, wat: "Positiemeting, beeldbank, e-mail." },
      { label: "Pinterest Ads", bedrag: 30, wat: "Alleen in de aanloop naar de seizoenspieken." },
    ],
  },
  {
    id: "versnellen",
    naam: "Versnellen",
    perMaand: 1_875,
    maanden: 24,
    eenmalig: 3_400,
    uitkomst: [10_000, 13_000],
    doelGehaald: true,
    oordeel:
      "Haalt het doel ongeveer zes maanden eerder. Alleen verstandig zodra de attributiecijfers laten zien dat de trechter werkt — anders schaalt u iets op waarvan u nog niet weet of het boekingen oplevert.",
    eenmaligePosten: [FOTO, VIDEO, VERTALING, PERSKIT, { label: "Merkidentiteit & fotoserie per seizoen", bedrag: 1_200, wat: "Vier keer per jaar nieuw beeld — voorkomt dat de site er in november uitziet als in augustus." }],
    posten: [
      { label: "Contentproductie", bedrag: 720, wat: "Acht artikelen per maand, inclusief de Duitse set." },
      { label: "Google Ads", bedrag: 600, wat: "Volledige dekking van alle commerciële clusters." },
      { label: "Meta Ads", bedrag: 300, wat: "Bereik, retargeting en videocampagnes." },
      { label: "Linkbuilding & digital PR", bedrag: 175, wat: "Vier verwijzingen per maand plus één persverhaal per kwartaal." },
      { label: "Tooling", bedrag: 80, wat: "Volledige rank tracker en concurrentiemonitoring." },
    ],
  },
];

/** De verwachte bezoekers per maand voor de fase waar een datum in valt. */
export function mijlpaalVoor(maand: string): Mijlpaal {
  let gevonden = MIJLPALEN[0];
  for (const m of MIJLPALEN) {
    if (maand >= m.vanaf) gevonden = m;
  }
  return gevonden;
}
