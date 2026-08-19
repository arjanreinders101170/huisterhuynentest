/* ═══ Van bezetting naar bezoekers ═══
 *
 * Eén bron voor de cijfers achter het doel. Het doel is niet een
 * bezoekersaantal maar **maximale bezetting het hele jaar door**; het
 * bezoekersaantal is daarvan een afgeleide. Die volgorde staat hier expliciet
 * in de code, omdat het omdraaien ervan de duurste fout in dit vak is: sturen
 * op verkeer levert verkeer op, niet per se nachten.
 *
 * De keten: bezetting → nachten → boekingen → boekingen uit eigen kanalen →
 * bezoekers. Elke stap heeft zijn eigen aanname, en die staan hieronder los
 * zodat ze één voor één door eigen cijfers vervangen kunnen worden zodra GA4
 * en de herkomstmeting data hebben.
 *
 * Bedragen zijn exclusief btw, gebaseerd op Nederlandse markttarieven 2026.
 */

/* ── Het doel ────────────────────────────────────────────────────────────── */

/** Realistisch maximum voor twee lodges. Boven de 75% verkoopt u structureel
 *  gaten van één of twee nachten, en dat kost meer aan schoonmaak en gedoe
 *  dan het oplevert. */
export const BEZETTINGSDOEL = 0.70;

/** 2 lodges × 365 nachten. */
export const NACHTEN_BESCHIKBAAR = 730;

/* ── Het maandmodel ──────────────────────────────────────────────────────── */

export interface MaandDoel {
  maand: string;
  /** Nachten die beide lodges samen in deze maand te vergeven hebben. */
  beschikbaar: number;
  /** Nagestreefde bezetting in deze maand. Niet elke maand is te vullen. */
  bezetting: number;
  /** Gemiddelde verblijfsduur — laag seizoen weekend, hoogseizoen week. */
  verblijfsduur: number;
  /** Aandeel boekingen dat via de eigen site komt in plaats van een boekingssite. */
  eigenKanalen: number;
  /** Sessie → boeking. Laag in november, hoog in augustus: dezelfde pagina,
   *  ander koopmoment. */
  conversie: number;
}

export const MAANDMODEL: MaandDoel[] = [
  { maand: "januari",   beschikbaar: 62, bezetting: 0.50, verblijfsduur: 2.5, eigenKanalen: 0.35, conversie: 0.010 },
  { maand: "februari",  beschikbaar: 56, bezetting: 0.60, verblijfsduur: 2.5, eigenKanalen: 0.35, conversie: 0.012 },
  { maand: "maart",     beschikbaar: 62, bezetting: 0.55, verblijfsduur: 2.5, eigenKanalen: 0.35, conversie: 0.010 },
  { maand: "april",     beschikbaar: 60, bezetting: 0.72, verblijfsduur: 3.5, eigenKanalen: 0.55, conversie: 0.020 },
  { maand: "mei",       beschikbaar: 62, bezetting: 0.82, verblijfsduur: 3.5, eigenKanalen: 0.55, conversie: 0.020 },
  { maand: "juni",      beschikbaar: 60, bezetting: 0.78, verblijfsduur: 3.5, eigenKanalen: 0.55, conversie: 0.020 },
  { maand: "juli",      beschikbaar: 62, bezetting: 0.92, verblijfsduur: 6.0, eigenKanalen: 0.65, conversie: 0.028 },
  { maand: "augustus",  beschikbaar: 62, bezetting: 0.95, verblijfsduur: 6.0, eigenKanalen: 0.65, conversie: 0.028 },
  { maand: "september", beschikbaar: 60, bezetting: 0.80, verblijfsduur: 3.5, eigenKanalen: 0.55, conversie: 0.020 },
  { maand: "oktober",   beschikbaar: 62, bezetting: 0.68, verblijfsduur: 3.5, eigenKanalen: 0.55, conversie: 0.018 },
  { maand: "november",  beschikbaar: 60, bezetting: 0.50, verblijfsduur: 2.5, eigenKanalen: 0.35, conversie: 0.010 },
  { maand: "december",  beschikbaar: 62, bezetting: 0.58, verblijfsduur: 2.5, eigenKanalen: 0.35, conversie: 0.012 },
];

export interface MaandUitkomst extends MaandDoel {
  nachten: number;
  boekingen: number;
  eigenBoekingen: number;
  bezoekers: number;
}

/** Rekent één maand door van bezetting naar benodigde bezoekers. */
export function rekenMaand(doel: MaandDoel): MaandUitkomst {
  const nachten = Math.round(doel.beschikbaar * doel.bezetting);
  const boekingen = Math.round(nachten / doel.verblijfsduur);
  const eigenBoekingen = Math.round(boekingen * doel.eigenKanalen);
  return {
    ...doel,
    nachten,
    boekingen,
    eigenBoekingen,
    bezoekers: Math.round(eigenBoekingen / doel.conversie),
  };
}

export const MAANDEN: MaandUitkomst[] = MAANDMODEL.map(rekenMaand);

export const JAAR = {
  nachten:        MAANDEN.reduce((s, m) => s + m.nachten, 0),
  boekingen:      MAANDEN.reduce((s, m) => s + m.boekingen, 0),
  eigenBoekingen: MAANDEN.reduce((s, m) => s + m.eigenBoekingen, 0),
  bezoekers:      MAANDEN.reduce((s, m) => s + m.bezoekers, 0),
};

export const GEMIDDELDE_VERBLIJFSDUUR = JAAR.nachten / JAAR.boekingen;
export const BEZOEKERS_PER_MAAND_MINIMAAL = Math.round(JAAR.bezoekers / 12);

/**
 * Het bezoekersdoel per jaar.
 *
 * Het model zegt dat er ± 4.500 bezoekers per jaar nodig zijn. Daar zit geen
 * enkele marge in, en drie dingen vragen om marge: de conversie begint lager
 * zolang er geen reviews en geen interieurbeeld zijn, verkeer valt nooit
 * precies in de maanden waarin u het nodig heeft, en bezoek dat vandaag niet
 * boekt bouwt wel de e-maillijst waarmee u volgend jaar de lage maanden vult.
 * Ruim twee keer de minimale behoefte is een verdedigbaar doel — en dat is
 * precies 10.000 per jaar.
 */
export const DOEL_BEZOEKERS_JAAR = 10_000;
export const DOEL_BEZOEKERS_MAAND = Math.round(DOEL_BEZOEKERS_JAAR / 12);

/**
 * 10.000 per máánd blijft bestaan, maar als ander doel: het koopt geen
 * bezetting (die zit dan allang aan het plafond) maar prijsmacht en
 * uitbreidingsruimte. Pas relevant zodra 70% structureel gehaald wordt.
 */
export const STRETCH_BEZOEKERS_MAAND = 10_000;

/* ── De harde randvoorwaarde: doordeweeks ────────────────────────────────── */

/** Vrijdag, zaterdag en zondag, voor twee lodges, het hele jaar. */
export const WEEKENDNACHTEN = 3 * 52 * 2;
export const DOORDEWEEKSE_NACHTEN = NACHTEN_BESCHIKBAAR - WEEKENDNACHTEN;

/** Wat er doordeweeks verkocht moet worden als de weekenden voor 90% vollopen. */
export const DOORDEWEEKS_NODIG = JAAR.nachten - Math.round(WEEKENDNACHTEN * 0.90);
export const DOORDEWEEKSE_BEZETTING_NODIG = DOORDEWEEKS_NODIG / DOORDEWEEKSE_NACHTEN;
/** Waar u op uitkomt als u uitsluitend weekenden verkoopt. */
export const WEEKENDPLAFOND = WEEKENDNACHTEN / NACHTEN_BESCHIKBAAR;


/* ── De ondergrens: dekking van de vaste lasten ──────────────────────────── */

/** Opgave eigenaar, 19 augustus 2026. */
export const VASTE_LASTEN = {
  financieringPerMaand: 2_000,
  parkkostenPerJaar: 3_500,
};
export const VASTE_LASTEN_PER_JAAR =
  VASTE_LASTEN.financieringPerMaand * 12 + VASTE_LASTEN.parkkostenPerJaar;
export const VASTE_LASTEN_PER_MAAND = Math.round(VASTE_LASTEN_PER_JAAR / 12);

/**
 * Stroom en water worden op de meter afgerekend en zijn dus een variabele
 * kostenpost per verhuurde nacht, geen vaste last. Sterk seizoensgebonden: een
 * jacuzzi op temperatuur houden kost in januari een veelvoud van juli, en de
 * lodge moet er in de winter bovendien warm bij.  [AANNAME]
 */
export const ENERGIE_PER_NACHT: Record<number, number> = {
  1: 28, 2: 28, 3: 24, 4: 18, 5: 14, 6: 12,
  7: 12, 8: 12, 9: 14, 10: 20, 11: 26, 12: 28,
};

export const SCHOONMAAK = { doorberekend: 75, kostprijs: 55 };

/**
 * Tarieven zoals de prijsmotor ze berekent (pricing_config + sync-pricing).
 * Basisprijs € 165, toeslagen uit DEFAULT_SURCHARGES in TarievenTab.
 * Per nacht wint de duurste periode.
 */
export const BASISPRIJS = 165;
export const TOESLAGEN: { label: string; pct: number }[] = [
  { label: "Doordeweeks, laagseizoen", pct: 0 },
  { label: "Weekend (vr t/m zo)", pct: 15 },
  { label: "Feestdag NL of DE", pct: 15 },
  { label: "Schoolvakantie DE (NI/NW)", pct: 20 },
  { label: "Schoolvakantie NL", pct: 25 },
  { label: "TT Assen", pct: 50 },
];
export const nachtprijs = (pct: number) => Math.round(BASISPRIJS * (1 + pct / 100));

/**
 * Break-even, doorgerekend op de kalender van 2027 — zie analyse/break-even.py.
 *
 * Gerekend in verkoopbare blokken (weekend vr+za, midweek di t/m do,
 * vakantieweek zeven nachten) en niet in losse nachten, want die bestaan niet.
 * Elke maand draagt zichzelf: november is niet op te halen met de opbrengst van
 * augustus, want de financieringslasten lopen door.
 */
export const BREAKEVEN = {
  bezetting: 0.22,
  nachtenPerMaand: 13,
  boekingenPerMaand: 5.6,
  nachtenPerJaar: 160,
  boekingenPerJaar: 67,
  omzetPerJaar: 32_126,
  gemiddeldTarief: 201,
  bezoekersPerMaand: 164,
};

/**
 * Het plafond dat de blokstructuur zelf oplegt.
 *
 * Als u uitsluitend hele weekenden, midweken en vakantieweken verkoopt, komt u
 * niet verder dan 500 van de 730 nachten. De rest zijn losse zondag- en
 * maandagnachten die tussen twee boekingen in vallen. 70% halen betekent dus
 * per definitie ook die restnachten verkopen — met flexibele aankomstdagen en
 * een last-minute-kanaal.
 */
export const BLOKPLAFOND = { nachten: 500, bezetting: 500 / 730 };

export interface LadderTrede {
  bezetting: number;
  nachten: number;
  boekingen: number;
  adr: number;
  omzet: number;
  energie: number;
  /** Verblijfsomzet minus energie plus schoonmaakmarge, minus de vaste lasten. */
  resultaat: number;
}

export const LADDER: LadderTrede[] = [
  { bezetting: 0.22, nachten: 162, boekingen: 64,  adr: 205, omzet: 33_280, energie: 2_880, resultaat: 4_180 },
  { bezetting: 0.30, nachten: 220, boekingen: 93,  adr: 201, omzet: 44_286, energie: 4_048, resultaat: 14_598 },
  { bezetting: 0.41, nachten: 296, boekingen: 126, adr: 198, omzet: 58_575, energie: 5_532, resultaat: 28_063 },
  { bezetting: 0.50, nachten: 365, boekingen: 149, adr: 192, omzet: 69_960, energie: 7_278, resultaat: 38_162 },
  { bezetting: 0.60, nachten: 440, boekingen: 174, adr: 187, omzet: 82_335, energie: 8_304, resultaat: 50_011 },
  { bezetting: 0.68, nachten: 500, boekingen: 194, adr: 184, omzet: 92_235, energie: 9_792, resultaat: 58_823 },
];

/** De winterstraf: lage maanden zijn moeilijker te verkopen én duurder te leveren. */
export const WINTERSTRAF = {
  novemberTarief: 190, novemberEnergie: 26, novemberNetto: 164,
  augustusTarief: 206, augustusEnergie: 12, augustusNetto: 194,
};

/* ── Mijlpalen ───────────────────────────────────────────────────────────── */

export interface Mijlpaal {
  id: string;
  periode: string;
  /** Eerste maand van de fase, als YYYY-MM. */
  vanaf: string;
  /** Bezoekers per maand die bij deze fase horen. */
  doel: number;
  /** Bezetting die in deze fase gehaald moet worden; null vóór de opening. */
  bezetting: number | null;
  titel: string;
  waarom: string;
  hefbomen: string[];
}

export const MIJLPALEN: Mijlpaal[] = [
  {
    id: "fundament",
    periode: "sep – dec 2026",
    vanaf: "2026-09",
    doel: 400,
    bezetting: null,
    titel: "Fundament",
    waarom:
      "De site staat nog vrijwel volledig op pagina 4 en verder, en er is nog niets te verhuren. Deze fase gaat niet over verkeer en niet over bezetting, maar over posities en over meten. Interieurbeeld ontbreekt nog — de lodges zijn niet opgeleverd — dus draait het beeldwerk op natuur en buitenaanzicht.",
    hefbomen: [
      "Drie P0-landingspagina's herbouwd (wellness, romantiek, jacuzzi)",
      "24 artikelen erbij — 6 per maand",
      "Google Bedrijfsprofiel geverifieerd, wekelijkse posts",
      "Gratis vermeldingen: VVV Drenthe, Visit Drenthe, ANWB, Tripadvisor",
      "GA4 live — anders blijft de conversie een aanname",
      "Fotograaf vastgelegd en shotlist klaar voor februari",
    ],
  },
  {
    id: "opening",
    periode: "jan – jun 2027",
    vanaf: "2027-01",
    doel: 700,
    bezetting: 0.45,
    titel: "Opening",
    waarom:
      "Het eerste halfjaar is geen bezettingsjaar maar een bewijsjaar: u heeft geen reviews, geen interieurbeeld tot februari en geen conversiecijfers. 45% over deze zes maanden is een goede uitkomst. Wat hier gebouwd wordt — reviews, beeld, e-maillijst — bepaalt of 70% daarna haalbaar is.",
    hefbomen: [
      "Interieur- & sfeerfotografie in februari, video in maart",
      "Reviewvliegwiel vanaf de eerste gast — onder de 10 reviews zit de bezetting vast",
      "Natuurhuisje in maart, Airbnb in april: bereik in de maanden die u zelf niet vult",
      "Prijzen en beschikbaarheid zichtbaar zonder formulier",
      "E-maillijst opbouwen — het enige kanaal waarmee u een specifieke week kunt vullen",
    ],
  },
  {
    id: "opniveau",
    periode: "jul 2027 – jun 2028",
    vanaf: "2027-07",
    doel: 1_000,
    bezetting: 0.62,
    titel: "Op niveau",
    waarom:
      "Het eerste volledige jaar met beeld, reviews en meetbare conversie. 62% is de tussenstap naar 70%: de weekenden lopen vol, de zomer loopt vol, en het verschil zit volledig in doordeweeks en in november tot maart.",
    hefbomen: [
      "Doordeweekse proposities: wellness-midweek, thuiswerkweek, hondvriendelijk",
      "Minimumverblijf-regels die geen onverkoopbare gaten achterlaten",
      "Advertenties uitsluitend op de lage maanden en de resterende gaten",
      "Duitse set compleet — Duitsland vult juist de Nederlandse dalmaanden",
      "Conversie meten en verbeteren; elke tiende procent scheelt bezoekers",
    ],
  },
  {
    id: "maximaal",
    periode: "vanaf jul 2028",
    vanaf: "2028-07",
    doel: 1_500,
    bezetting: 0.70,
    titel: "Maximale bezetting",
    waarom:
      "70% over een heel jaar met twee lodges is het praktische maximum. Wat daarboven ligt bestaat uit losse nachten tussen boekingen in, en die kosten meer aan schoonmaak en planning dan ze opleveren.",
    hefbomen: [
      "Last-minute-kanaal via de e-maillijst voor de laatste gaten",
      "Vaste gasten: terugkeerpercentage is goedkoper dan elke advertentie",
      "Van bezetting sturen naar prijs sturen — het volgende doel is opbrengst per nacht",
    ],
  },
  {
    id: "prijsmacht",
    periode: "2029 en verder",
    vanaf: "2029-01",
    doel: STRETCH_BEZOEKERS_MAAND,
    bezetting: 0.70,
    titel: "Prijsmacht (optioneel)",
    waarom:
      "Pas hier is 10.000 bezoekers per máánd zinvol. Die kopen geen bezetting meer — die zit aan het plafond — maar overvraag, en overvraag is prijsmacht. Van € 210 naar € 260 gemiddeld is bij 512 nachten € 25.600 extra per jaar, zonder één extra nacht. Alleen doen als er ook een derde lodge of een tweede product komt.",
    hefbomen: [
      "Ruim 100 rijpe artikelen — het kantelpunt voor onderwerpautoriteit",
      "Pinterest en Meta op volume met eigen video",
      "Uitbreiding: een derde lodge start niet meer bij nul",
    ],
  },
];

/** De fase waar een maand (YYYY-MM) in valt. */
export function mijlpaalVoor(maand: string): Mijlpaal {
  let gevonden = MIJLPALEN[0];
  for (const m of MIJLPALEN) {
    if (maand >= m.vanaf) gevonden = m;
  }
  return gevonden;
}

/* ── Wat de bezetting werkelijk bepaalt ──────────────────────────────────── */

export interface Hefboom {
  id: string;
  titel: string;
  effect: string;
  toelichting: string;
  /** Ruwe rangorde van impact op de jaarbezetting. */
  impact: "hoog" | "middel";
}

/**
 * De volgorde hieronder is de kern van het advies. Meer bezoekers staat
 * bewust onderaan: bij 512 nachten is verkeer niet de beperkende factor.
 */
export const BEZETTINGSHEFBOMEN: Hefboom[] = [
  {
    id: "doordeweeks",
    titel: "Doordeweekse nachten verkopen",
    effect: `${Math.round(WEEKENDPLAFOND * 100)}% → 70% jaarbezetting`,
    impact: "hoog",
    toelichting:
      `Verkoopt u alleen weekenden, dan is uw plafond ${Math.round(WEEKENDPLAFOND * 100)}% — vrijdag, zaterdag en zondag zijn nu eenmaal drie van de zeven dagen. Voor 70% moeten er ${DOORDEWEEKS_NODIG} doordeweekse nachten per jaar verkocht worden, oftewel ${Math.round(DOORDEWEEKSE_BEZETTING_NODIG * 100)}% doordeweekse bezetting. Dat is een ander publiek dan het weekendpubliek: 55-plussers, thuiswerkers, hondenbezitters, mensen zonder schoolgaande kinderen. Andere boodschap, ander tarief, andere kanalen.`,
  },
  {
    id: "conversie",
    titel: "Conversie verhogen",
    effect: "halveert het benodigde verkeer",
    impact: "hoog",
    toelichting:
      "Van 1,0% naar 2,0% conversie halveert het aantal bezoekers dat u nodig heeft — dat is goedkoper dan het verkeer verdubbelen. De vier grootste hefbomen: interieurbeeld, prijs en beschikbaarheid zichtbaar zonder formulier, reviews, en reactiesnelheid op een aanvraag.",
  },
  {
    id: "reviews",
    titel: "Reviews verzamelen",
    effect: "tilt élk kanaal tegelijk op",
    impact: "hoog",
    toelichting:
      "Onder de tien reviews zit de bezetting structureel vast: het raakt de positie in Google, de klikkans in de zoekresultaten, de conversie op de site én de rangschikking op Natuurhuisje en Airbnb. Automatisch verzoek drie dagen na vertrek, geen uitzonderingen.",
  },
  {
    id: "lage-maanden",
    titel: "De lage maanden verkopen",
    effect: "november t/m maart",
    impact: "hoog",
    toelichting:
      "Vijf maanden dragen 165 van de 512 nachten. Daar wordt de jaarbezetting gewonnen of verloren, en niet in augustus — augustus loopt vanzelf vol. Dit is een product- en prijsvraagstuk: winterproposities, langere verblijven belonen, en advertentiebudget dat juist híer staat.",
  },
  {
    id: "gaten",
    titel: "Gaten in de kalender voorkomen",
    effect: "5 – 8% bezetting",
    impact: "middel",
    toelichting:
      "Een boeking van vrijdag tot maandag laat vier nachten over die niemand los koopt. Minimumverblijf-regels, flexibele aankomstdagen en een last-minute-kanaal via de e-maillijst maken het verschil tussen 62% en 70%.",
  },
  {
    id: "boekingssites",
    titel: "Boekingssites voor restcapaciteit",
    effect: "vult wat u zelf niet vult",
    impact: "middel",
    toelichting:
      "15 tot 18% commissie is een prima prijs voor een nacht die anders leeg blijft, en een slechte prijs voor een nacht die u zelf ook had verkocht. Blokkeer de weken waarop u zelf vraag heeft, zet de rest erop.",
  },
  {
    id: "verkeer",
    titel: "Meer bezoekers",
    effect: `${BEZOEKERS_PER_MAAND_MINIMAAL}/mnd is al genoeg`,
    impact: "middel",
    toelichting:
      `Bewust onderaan. Het model vraagt ${JAAR.bezoekers.toLocaleString("nl-NL")} bezoekers per jaar — ${BEZOEKERS_PER_MAAND_MINIMAAL} per maand — om 70% te halen. Verkeer is bij twee lodges niet de beperkende factor; de zes punten hierboven zijn dat wel. Het bezoekersdoel van 10.000 per jaar is er om marge te hebben, niet omdat het nodig is.`,
  },
];


/* ── De kanaalmix ────────────────────────────────────────────────────────── */

export interface KanaalDoel {
  /** Sluit aan op de kanaalnamen in src/lib/attributie.ts waar dat kan. */
  id: string;
  label: string;
  /** Aandeel in het totale verkeer. Als verhouding en niet als absoluut getal,
   *  zodat dezelfde mix klopt bij 800 én bij 10.000 bezoekers per maand. */
  aandeel: number;
  /** Vaste maandkosten van dit kanaal bij het scenario Bezetting. */
  kostenPerMaand: number;
  toelichting: string;
}

export const KANAALMIX: KanaalDoel[] = [
  { id: "organisch-informatief", label: "Organisch — natuur & regio", aandeel: 0.37, kostenPerMaand: 0,
    toelichting: "Heide, hunebedden, fietsen, wandelen. Boekt zelf nauwelijks, maar levert het volume en de autoriteit waar de commerciële pagina's op meeliften. /heide-drenthe bewijst dat dit werkt." },
  { id: "organisch-commercieel", label: "Organisch — commercieel", aandeel: 0.16, kostenPerMaand: 0,
    toelichting: "Jacuzzi, wellness, romantiek, luxe, locatie. Dít is het verkeer dat boekt — en het converteert twee tot drie keer beter dan de natuurpagina's." },
  { id: "betaald-google", label: "Google Ads", aandeel: 0.11, kostenPerMaand: 100,
    toelichting: "Bij het scenario Bezetting staat dit budget alleen op november t/m maart en op doordeweekse gaten. In augustus adverteren voor een lodge die toch vol zit, is weggegooid geld." },
  { id: "google-bedrijfsprofiel", label: "Google Bedrijfsprofiel", aandeel: 0.09, kostenPerMaand: 0,
    toelichting: "Maps en het lokale blok. Gratis, maar vraagt onderhoud — vooral reviews. Voor accommodaties het hoogst renderende gratis kanaal dat bestaat." },
  { id: "betaald-meta", label: "Meta Ads", aandeel: 0.09, kostenPerMaand: 50,
    toelichting: "Retargeting op wie de beschikbaarheid bekeek maar niet aanvroeg, en koud bereik in de dalmaanden. Niet het hele jaar door." },
  { id: "pinterest", label: "Pinterest", aandeel: 0.07, kostenPerMaand: 15,
    toelichting: "Onderschat kanaal voor natuur- en interieurbeeld. Pins leveren jaren verkeer en de doelgroep — oriënterend op een weekend weg — is exact de onze." },
  { id: "verwijzing", label: "Vermeldingen, gidsen & pers", aandeel: 0.04, kostenPerMaand: 0,
    toelichting: "VVV, Visit Drenthe, ANWB, wandel- en fietssites, reisblogs. Bescheiden verkeer, maar het bouwt de autoriteit waar élke organische positie op steunt." },
  { id: "social", label: "Instagram & Facebook organisch", aandeel: 0.03, kostenPerMaand: 0,
    toelichting: "Bindt wie u al kent. Reken hier niet op nieuwe vraag." },
  { id: "e-mail", label: "E-mail", aandeel: 0.02, kostenPerMaand: 10,
    toelichting: "Klein in verkeer, groot in waarde: het enige kanaal waarmee u gericht één specifieke week kunt vullen. Onmisbaar voor de laatste gaten in de kalender." },
  { id: "direct", label: "Direct & merk", aandeel: 0.02, kostenPerMaand: 0,
    toelichting: "Mensen die de naam intypen. Een graadmeter, geen stuurknop." },
];

export const KANAALMIX_KOSTEN = KANAALMIX.reduce((som, k) => som + k.kostenPerMaand, 0);
/** Het aandeel van het verkeer dat na de investering geen maandkosten meer heeft. */
export const KANAALMIX_VRIJ_AANDEEL = KANAALMIX
  .filter((k) => k.kostenPerMaand === 0)
  .reduce((som, k) => som + k.aandeel, 0);

/* ── Budgetscenario's ────────────────────────────────────────────────────── */

export interface BudgetPost {
  label: string;
  /** Bedrag per maand bij doorlopende posten, totaalbedrag bij eenmalige. */
  bedrag: number;
  wat: string;
}

export interface Scenario {
  id: "bezetting" | "zuinig" | "doelgericht" | "versnellen";
  naam: string;
  perMaand: number;
  maanden: number;
  eenmalig: number;
  /** Bezetting die dit scenario naar verwachting oplevert na de looptijd. */
  bezetting: number;
  /** Bezoekers per maand na de looptijd. */
  uitkomst: [number, number];
  advies: boolean;
  posten: BudgetPost[];
  eenmaligePosten: BudgetPost[];
  oordeel: string;
}

const FOTO: BudgetPost = { label: "Interieur- & sfeerfotografie", bedrag: 900, wat: "Februari 2027, halve dag, beide lodges, inclusief bewerking. Kan niet eerder: vóór de oplevering valt er geen interieur te fotograferen. De grootste conversiehefboom die er is." };
const VIDEO: BudgetPost = { label: "Korte video's / drone", bedrag: 600, wat: "Maart 2027, aansluitend op de fotoshoot — dezelfde styling, geen tweede reisdag. Vijf clips voor Pinterest, Instagram en de landingspagina's." };
const VERTALING: BudgetPost = { label: "Duitse vertaling door een native", bedrag: 450, wat: "Tien pagina's. Duitse gasten reizen buiten de Nederlandse schoolvakanties — precies de weken die u zelf niet vult." };
const PERSKIT: BudgetPost = { label: "Persbericht & persfoto's", bedrag: 250, wat: "Voor de opening — het enige moment waarop regionale media uit zichzelf schrijven." };

export const SCENARIOS: Scenario[] = [
  {
    id: "bezetting",
    naam: "Bezetting",
    perMaand: 550,
    maanden: 24,
    eenmalig: 2_200,
    bezetting: 0.70,
    uitkomst: [1_200, 1_800],
    advies: true,
    oordeel:
      "Het advies, nu het doel bezetting is en niet verkeer. Het budget gaat naar wat de bezetting daadwerkelijk bepaalt: conversie, reviews, doordeweekse vraag en de vijf lage maanden. Levert ruim twee keer het verkeer dat het model vraagt, en dat is genoeg — meer bezoekers kopen geen extra nacht als de kalender al vol is.",
    eenmaligePosten: [FOTO, VIDEO, VERTALING, PERSKIT],
    posten: [
      { label: "Contentproductie", bedrag: 200, wat: "Drie artikelen per maand in plaats van zes. Genoeg voor 10.000 bezoekers per jaar; het zesde artikel voegt verkeer toe dat u niet kunt verzilveren." },
      { label: "Advertenties — alleen de lage maanden", bedrag: 150, wat: "November t/m maart en doordeweekse gaten, niet het hele jaar door. In augustus adverteren voor een lodge die toch vol zit, is weggegooid geld." },
      { label: "Conversie & beeld", bedrag: 80, wat: "Seizoensbeeld, A/B-tests op de CTA, prijs en beschikbaarheid zichtbaar maken. Van 1% naar 2% conversie halveert het benodigde verkeer." },
      { label: "Reviews & gastbeleving", bedrag: 50, wat: "Automatische reviewverzoeken en kleine attenties die reviews opleveren. Onder de tien reviews zit de bezetting vast." },
      { label: "Tooling", bedrag: 45, wat: "Positiemeting, e-mail, en een tarieven- en beschikbaarheidsoverzicht om gaten te zien vóórdat ze ontstaan." },
      { label: "Pinterest & e-mail", bedrag: 25, wat: "De e-maillijst is het enige kanaal waarmee u een specifieke week kunt vullen. Pinterest levert jarenlang verkeer voor bijna niets." },
    ],
  },
  {
    id: "zuinig",
    naam: "Zuinig",
    perMaand: 300,
    maanden: 24,
    eenmalig: 900,
    bezetting: 0.60,
    uitkomst: [700, 1_100],
    advies: false,
    oordeel:
      "Haalt de weekenden en de zomer vol, maar niet de lage maanden en niet doordeweeks — daar blijft u rond 60% steken. Alles wordt zelf geschreven en gefotografeerd. Kies dit als de agenda krapper is dan de portemonnee, en accepteer dan dat 70% niet gehaald wordt.",
    eenmaligePosten: [FOTO],
    posten: [
      { label: "Advertenties (alleen piekweken)", bedrag: 150, wat: "Merknaam beschermen plus de weken vóór Valentijn, Pasen en de zomer." },
      { label: "Tooling", bedrag: 60, wat: "Positiemeting en e-mail." },
      { label: "Reviews & gastbeleving", bedrag: 50, wat: "Het goedkoopste dat er is, en het werkt." },
      { label: "Beeld & losse kosten", bedrag: 40, wat: "Pinterest-pins, kleine aanvullingen." },
    ],
  },
  {
    id: "doelgericht",
    naam: "Doelgericht",
    perMaand: 1_000,
    maanden: 24,
    eenmalig: 2_200,
    bezetting: 0.70,
    uitkomst: [8_000, 10_000],
    advies: false,
    oordeel:
      "Bouwt 10.000 bezoekers per máánd. Dat haalt dezelfde 70% bezetting als het scenario Bezetting, voor € 10.800 meer — het verschil koopt geen nachten maar prijsmacht en uitbreidingsruimte. Alleen zinvol als er een derde lodge of een tweede product komt.",
    eenmaligePosten: [FOTO, VIDEO, VERTALING, PERSKIT],
    posten: [
      { label: "Contentproductie", bedrag: 360, wat: "Zes artikelen per maand, waarvan vier uitbesteed." },
      { label: "Google Ads", bedrag: 300, wat: "Circa 350 klikken per maand, het hele jaar door." },
      { label: "Meta Ads", bedrag: 150, wat: "Retargeting plus koud bereik in Nederland en Noord-Duitsland." },
      { label: "Linkbuilding & digital PR", bedrag: 100, wat: "Twee kwaliteitsverwijzingen per maand." },
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
    bezetting: 0.70,
    uitkomst: [10_000, 13_000],
    advies: false,
    oordeel:
      "Zelfde bezetting, nog meer verkeer, zes maanden eerder. Voor twee lodges is dit overinvesteren: de bezetting zit dan al aan het plafond en het extra verkeer is alleen te verzilveren via de prijs. Bewaar dit voor het moment dat er meer te verhuren is.",
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
