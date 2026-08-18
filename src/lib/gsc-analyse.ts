/* ═══ Analyse van Search Console-data ═══
 * Dezelfde clustering, boekingsintentie en winbaarheid als in
 * seo-cro-revenue-plan-2027.md (en analyse/gsc-analyse.py). Die regels staan
 * hier één keer, zodat de maandcijfers in de admin over de tijd vergelijkbaar
 * blijven en niet uiteenlopen met het rapport.
 */

export type Cluster =
  | "Merk" | "Hottub/Jacuzzi" | "Wellness/Sauna" | "Romantiek/Koppels"
  | "Weekendje weg" | "Luxe/Lodge/Boutique" | "Bijzonder overnachten"
  | "Locatie" | "Hond" | "Duitsland" | "Heide" | "Hunebedden"
  | "Natuur & activiteiten" | "Concurrent" | "Overig";

export interface GscRij {
  sleutel: string;
  klikken: number;
  vertoningen: number;
  positie: number;
}

const MERK = [
  "huis ter huynen", "huisterhuynen", "huynen", "huis ter zeijen",
  "landgoed de huynen", "de huynen", "huinen", "huijen", "heinen", "arjan reinders",
  "zuiderstraat 6 zeijen",
];

const CONCURRENT = [
  "drents genieten", "wellness suites de heide", "drentse liefde", "kleen resorts",
  "pureluxe", "luxerij ruinen", "hof van saksen", "huttenheugte", "erfgoedlogies termunten",
  "buitengoed drentse vennen", "heleen", "boetiekhotel het huis", "boutique hotel het huis",
  "huis met de vazen", "mooi twente lodges", "hoyde lodge", "gut hohne", "stuga norg",
  "golf lodge assen", "huis ter heide", "love nest drenthe", "secret room drenthe",
  "thermen drenthe", "zuiderweg 21", "minister cremerstraat",
  "wellness hotel & golf resort", "winterwoods", "vakantiepark huis ter heide",
];

/** Volgorde is bepalend: de eerste match wint. Merk en concurrent gaan voor. */
export function bepaalCluster(zoekopdracht: string): Cluster {
  const s = zoekopdracht.toLowerCase();
  if (MERK.some(m => s.includes(m))) return "Merk";
  if (CONCURRENT.some(c => s.includes(c))) return "Concurrent";
  if (/hond|huisdier|omheinde tuin/.test(s)) return "Hond";
  if (/jacuzzi|hottub|hot tub|bubbelbad|whirlpool|drenthse/.test(s)) return "Hottub/Jacuzzi";
  if (/wellness|welness|sauna|spa\b|thermen/.test(s)) return "Wellness/Sauna";
  if (/romantisch|romantische|bruidssuite|love nest|twee personen|vriendinnen/.test(s)) return "Romantiek/Koppels";
  if (/weekend/.test(s)) return "Weekendje weg";
  if (/bijzonder|uniek|origineel/.test(s)) return "Bijzonder overnachten";
  if (/luxe|luxus|boutique|boetiek|lodge/.test(s)) return "Luxe/Lodge/Boutique";
  if (/hunebed/.test(s)) return "Hunebedden";
  if (/heide|heidebloei/.test(s)) return "Heide";
  if (/fiets|wandel|kano|vlonder|veentjes|hondsrug|brinkdorp|drentsche aa|drentse aa/.test(s)) return "Natuur & activiteiten";
  if (/ferienhaus|ferienwohnung|niederlande|privat|urlaub|wochenende|nähe|holland/.test(s)) return "Duitsland";
  if (/assen|norg|veenhuizen|zeijen|drenthe/.test(s)) return "Locatie";
  return "Overig";
}

/** Boekingsnabijheid 1–5 en winbaarheid 0–1 per cluster. Zie deel 2 van het rapport. */
export const CLUSTER_PROFIEL: Record<Cluster, { boeking: number; winbaarheid: number; commercieel: boolean }> = {
  "Merk":                  { boeking: 5, winbaarheid: 1.00, commercieel: true  },
  "Hottub/Jacuzzi":        { boeking: 5, winbaarheid: 0.45, commercieel: true  },
  "Romantiek/Koppels":     { boeking: 5, winbaarheid: 0.50, commercieel: true  },
  "Wellness/Sauna":        { boeking: 4, winbaarheid: 0.45, commercieel: true  },
  "Luxe/Lodge/Boutique":   { boeking: 4, winbaarheid: 0.40, commercieel: true  },
  "Bijzonder overnachten": { boeking: 4, winbaarheid: 0.30, commercieel: true  },
  "Locatie":               { boeking: 4, winbaarheid: 0.80, commercieel: true  },
  "Duitsland":             { boeking: 4, winbaarheid: 0.75, commercieel: true  },
  "Hond":                  { boeking: 4, winbaarheid: 0.50, commercieel: true  },
  "Weekendje weg":         { boeking: 3, winbaarheid: 0.15, commercieel: true  },
  "Heide":                 { boeking: 2, winbaarheid: 0.70, commercieel: false },
  "Concurrent":            { boeking: 2, winbaarheid: 0.10, commercieel: false },
  "Hunebedden":            { boeking: 1, winbaarheid: 0.60, commercieel: false },
  "Natuur & activiteiten": { boeking: 1, winbaarheid: 0.65, commercieel: false },
  "Overig":                { boeking: 1, winbaarheid: 0.30, commercieel: false },
};

export function isMerk(zoekopdracht: string): boolean {
  return bepaalCluster(zoekopdracht) === "Merk";
}

export interface ClusterCijfers {
  cluster: Cluster;
  queries: number;
  klikken: number;
  vertoningen: number;
  positie: number;      // gewogen op vertoningen
  boeking: number;
  winbaarheid: number;
}

/** Vertoningsgewogen gemiddelde positie: een term met 300 vertoningen telt
 *  zwaarder dan een met 3. Een ongewogen gemiddelde zou de ruis laten winnen. */
function gewogenPositie(rijen: GscRij[]): number {
  const totaal = rijen.reduce((s, r) => s + r.vertoningen, 0);
  if (totaal === 0) return 0;
  return Math.round((rijen.reduce((s, r) => s + r.positie * r.vertoningen, 0) / totaal) * 10) / 10;
}

export function clusterCijfers(rijen: GscRij[]): ClusterCijfers[] {
  const perCluster = new Map<Cluster, GscRij[]>();
  for (const r of rijen) {
    const c = bepaalCluster(r.sleutel);
    const lijst = perCluster.get(c);
    if (lijst) lijst.push(r); else perCluster.set(c, [r]);
  }

  return [...perCluster.entries()]
    .map(([cluster, lijst]) => ({
      cluster,
      queries: lijst.length,
      klikken: lijst.reduce((s, r) => s + r.klikken, 0),
      vertoningen: lijst.reduce((s, r) => s + r.vertoningen, 0),
      positie: gewogenPositie(lijst),
      boeking: CLUSTER_PROFIEL[cluster].boeking,
      winbaarheid: CLUSTER_PROFIEL[cluster].winbaarheid,
    }))
    .sort((a, b) => b.vertoningen - a.vertoningen);
}

export interface Totalen {
  queries: number;
  klikken: number;
  vertoningen: number;
  ctr: number;
  positie: number;
  merkKlikken: number;
  nietMerkKlikken: number;
  commercieleVertoningen: number;
}

export function totalen(rijen: GscRij[]): Totalen {
  const klikken = rijen.reduce((s, r) => s + r.klikken, 0);
  const vertoningen = rijen.reduce((s, r) => s + r.vertoningen, 0);
  const merkKlikken = rijen.filter(r => isMerk(r.sleutel)).reduce((s, r) => s + r.klikken, 0);
  const commercieleVertoningen = rijen
    .filter(r => CLUSTER_PROFIEL[bepaalCluster(r.sleutel)].commercieel)
    .reduce((s, r) => s + r.vertoningen, 0);

  return {
    queries: rijen.length,
    klikken,
    vertoningen,
    ctr: vertoningen === 0 ? 0 : Math.round((klikken / vertoningen) * 10000) / 100,
    positie: gewogenPositie(rijen),
    merkKlikken,
    nietMerkKlikken: klikken - merkKlikken,
    commercieleVertoningen,
  };
}

/* ── Kansen ─────────────────────────────────────────────────────────────── */

export type KansSoort = "nieuw_in_top20" | "bijna_binnen_bereik" | "veel_vertoningen_geen_klik" | "gedaald";

export interface Kans {
  soort: KansSoort;
  sleutel: string;
  cluster: Cluster;
  vertoningen: number;
  positie: number;
  vorigePositie?: number;
  toelichting: string;
}

const MIN_VERTONINGEN = 10;   // daaronder is één positie verschil ruis

/**
 * Signaleert wat er deze maand is veranderd en de moeite waard is.
 *
 * Twee filters. Clusters met boekingsintentie <3 vallen af: informatieve
 * termen leveren geen boekingen op. En de merkcluster valt af, ondanks
 * boekingsintentie 5 — wie op "huis ter huynen" zoekt is al overtuigd, dus
 * een verschuiving daar is geen kans op nieuw verkeer. Merkprestatie staat
 * al los in de kopregel.
 */
export function vindKansen(nu: GscRij[], vorig: GscRij[]): Kans[] {
  const vorigeMap = new Map(vorig.map(r => [r.sleutel, r]));
  const kansen: Kans[] = [];

  for (const r of nu) {
    if (r.vertoningen < MIN_VERTONINGEN) continue;
    const cluster = bepaalCluster(r.sleutel);
    if (cluster === "Merk") continue;
    const profiel = CLUSTER_PROFIEL[cluster];
    if (profiel.boeking < 3) continue;

    const eerder = vorigeMap.get(r.sleutel);
    const basis = { sleutel: r.sleutel, cluster, vertoningen: r.vertoningen, positie: r.positie };

    if (r.positie <= 20 && (!eerder || eerder.positie > 20)) {
      kansen.push({
        ...basis, soort: "nieuw_in_top20", vorigePositie: eerder?.positie,
        toelichting: eerder
          ? `Van positie ${eerder.positie.toFixed(1)} naar ${r.positie.toFixed(1)} — nu binnen bereik van pagina 1.`
          : `Nieuw op positie ${r.positie.toFixed(1)}.`,
      });
    } else if (r.positie > 20 && r.positie <= 35 && eerder && eerder.positie - r.positie >= 5) {
      kansen.push({
        ...basis, soort: "bijna_binnen_bereik", vorigePositie: eerder.positie,
        toelichting: `${(eerder.positie - r.positie).toFixed(1)} posities gestegen. Een kleine duw brengt dit in de top 20.`,
      });
    } else if (r.klikken === 0 && r.positie <= 12) {
      kansen.push({
        ...basis, soort: "veel_vertoningen_geen_klik",
        toelichting: `Positie ${r.positie.toFixed(1)} met ${r.vertoningen} vertoningen en nul klikken — hier is de snippet het probleem, niet de ranking.`,
      });
    } else if (eerder && r.positie - eerder.positie >= 8 && eerder.positie <= 30) {
      kansen.push({
        ...basis, soort: "gedaald", vorigePositie: eerder.positie,
        toelichting: `Gezakt van ${eerder.positie.toFixed(1)} naar ${r.positie.toFixed(1)}.`,
      });
    }
  }

  // Grootste vraag eerst; dalers achteraan want dat zijn signalen, geen kansen.
  const volgorde: Record<KansSoort, number> = {
    nieuw_in_top20: 0, veel_vertoningen_geen_klik: 1, bijna_binnen_bereik: 2, gedaald: 3,
  };
  return kansen
    .sort((a, b) => volgorde[a.soort] - volgorde[b.soort] || b.vertoningen - a.vertoningen)
    .slice(0, 25);
}

/* ── Forecast ───────────────────────────────────────────────────────────── */

/** Doelen uit deel 10 van het rapport. De ijkpunten liggen op 90 en 180 dagen
 *  na de start (september 2026) en op het einde van 2027. */
export interface ForecastPunt {
  label: string;
  tot: string;            // laatste maand waarvoor dit punt geldt (YYYY-MM-01)
  vertoningen: number;
  ctr: number;
  positie: number;
}

export const FORECAST: ForecastPunt[] = [
  { label: "90 dagen",  tot: "2026-11-01", vertoningen: 5000,  ctr: 1.8, positie: 37.5 },
  { label: "180 dagen", tot: "2027-02-01", vertoningen: 10000, ctr: 2.8, positie: 25.0 },
  { label: "Eind 2027", tot: "2027-12-01", vertoningen: 21500, ctr: 3.5, positie: 15.0 },
];

export function forecastVoor(maand: string): ForecastPunt {
  return FORECAST.find(p => maand <= p.tot) ?? FORECAST[FORECAST.length - 1];
}
