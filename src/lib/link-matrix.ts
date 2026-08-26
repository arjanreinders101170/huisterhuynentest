/* Interne linkmatrix — hub-and-spoke in plaats van iedereen-linkt-naar-iedereen.
 *
 * Uitgangspunt (deel 9 van seo-cro-revenue-plan-2027.md): de pagina's die
 * Google echt waardeert zijn de informatieve pagina's — /hunebedden-drenthe
 * (568 vertoningen, positie 13), /heide-drenthe (261, positie 9,7) en de blogs
 * op positie 8–10. Die pagina's zijn de *donoren*; de commerciële pagina's zijn
 * de *ontvangers*. Tot nu toe gaven de donoren hun autoriteit alleen generiek
 * door, via hetzelfde footerblok dat op elke pagina staat. Een link die overal
 * staat telt nauwelijks; een link die contextueel in de tekst staat telt wél.
 *
 * Waarom dit in code staat en niet (alleen) in de content: de teksten van de
 * blogs staan in de database, niet in deze repo, en wijken voor de oudere
 * artikelen af van de seed. Een migratie die in de lopende tekst zoekt en
 * vervangt, raakt die artikelen niet. Deze matrix is daarom de bron van
 * waarheid: bij het renderen wordt elke link één keer in de juiste alinea
 * gezet (`na` + `zin`), en wat niet geplaatst kan worden — omdat de tekst
 * inmiddels anders luidt of het artikel niet uit de seed komt — valt terug op
 * een klein "lees verder"-blok onder het artikel. Zo staat de link er altijd,
 * ook nadat iemand de tekst in de admin heeft herschreven.
 *
 * Ankerteksten zijn beschrijvend en bevatten het zoekwoord van de doelpagina.
 * Nooit "lees meer" of "klik hier".
 *
 * Wat er uit deel 9 nog niet in staat: de rijen die /lodge-de-heide of
 * /lodge-de-eik als bron of doel hebben. Die pagina's bestaan nog niet (week
 * 7–8). Waar zo'n pagina het doel was, wijst de link zolang naar
 * /luxe-lodge-drenthe — zodra de lodgepagina's live staan is dat hier één
 * regel per link. De rij /lodge-de-heide → /lodge-de-eik en de rij
 * /vakantiehuis-met-hottub-drenthe → beide lodgepagina's wachten daar
 * helemaal op; een link naar een pagina die 404 geeft is erger dan geen link.
 *
 * De homepage staat niet in deze tabel: die is geen template maar handmatige
 * JSX. De drie links daar (naar de P0-pagina's) staan in src/app/page.tsx.
 */

export interface MatrixLink {
  /** Doelpad — altijd intern, altijd met leading slash. */
  href: string;
  /** Ankertekst: beschrijvend, met het zoekwoord van de doelpagina. */
  anchor: string;
  /** Fragment uit de bestaande tekst; de zin komt achter de eerste alinea die
   *  dit fragment bevat. Ontbreekt het fragment (of is de tekst inmiddels
   *  herschreven), dan valt de link terug op het "lees verder"-blok. */
  na?: string;
  /** De zin waarin de link landt. {link} wordt de ankertekst als link. */
  zin?: string;
  /** Waarom deze link bestaat — bronpositie, thematische brug. */
  reden: string;
}

/** Bronpad → uitgaande contextuele links. Maximaal twee per pagina: meer
 *  verdunt precies het signaal dat we willen versterken. */
export const LINK_MATRIX: Record<string, MatrixLink[]> = {
  /* ── De donoren: informatief → commercieel ─────────────────────────── */

  "/hunebedden-drenthe": [
    {
      href: "/wellness-vakantie-drenthe",
      anchor: "een wellness huisje op de heide",
      na: "Lodge De Heide heeft daarnaast een eigen sauna",
      zin: "Wie daarvoor komt, zoekt in feite {link}: sauna en jacuzzi voor u alleen, zonder gedeelde spa.",
      reden: "Grootste zichtbaarheid van de site (568 vertoningen, positie 13) naar de grootste maar slechtst presterende commerciële pagina.",
    },
    {
      href: "/luxe-lodge-drenthe",
      anchor: "de luxe lodge op vijf minuten van hunebed D5",
      na: "twee volledig privé lodges voor maximaal vier personen",
      zin: "Hoe die lodges zijn ingedeeld en afgewerkt, leest u op de pagina over {link}.",
      reden: "Nabijheid is de natuurlijke aanleiding. Wijst zolang naar /luxe-lodge-drenthe; wordt /lodge-de-heide zodra die pagina bestaat.",
    },
  ],

  "/heide-drenthe": [
    {
      href: "/romantisch-weekend-weg-drenthe",
      anchor: "een romantisch weekend tijdens de heidebloei",
      na: "vormen de perfecte basis voor een paar dagen heide kijken",
      zin: "Komt u met z'n tweeën, dan wordt dat vanzelf {link}.",
      reden: "Beste positie van de site (9,7) plus seizoensintentie — de heidebloei valt samen met de sterkste weekendvraag.",
    },
    {
      href: "/vakantiehuis-met-hottub-drenthe",
      anchor: "vakantiehuis met privé-jacuzzi aan de heide",
      na: "stapt u in het warme water van de hottub",
      zin: "Beide lodges zijn in de kern een {link}: het water staat het hele jaar op 38 °C.",
      reden: "Donor met de beste positie naar de pagina met de grootste vraagcluster (jacuzzi, 754 vertoningen).",
    },
  ],

  "/blog/kanovaren-drentsche-aa": [
    {
      href: "/wellness-vakantie-drenthe",
      anchor: "de sauna in na een dag op het water",
      na: "perfect om spieren te ontspannen",
      zin: "En wil je {link}: die zit in Lodge De Heide.",
      reden: "Positie 9,8 met 93 vertoningen. Natuurlijke thematische brug: peddelen, spieren, warmte.",
    },
  ],

  "/blog/een-dag-in-norg": [
    {
      href: "/vakantiehuis-norg",
      anchor: "overnachten vlak bij Norg",
      na: "allebei met een eigen terras en hottub",
      zin: "Alles over {link} — afstanden, wandelingen vanaf de deur en de lodges zelf — staat op één pagina bij elkaar.",
      reden: "Positie 9,4. Lokale relevantie: het artikel gaat over het dorp waar de landingspagina op mikt.",
    },
  ],

  "/blog/wilde-dieren-spotten-in-het-drents-friese-wold": [
    {
      href: "/wandelroutes-drenthe",
      anchor: "wandelroutes waar je ze ziet",
      reden: "Hoogste CTR van de site (11,1% op positie 8,4). Artikel staat niet in de seed, dus de link landt in het lees-verder-blok.",
    },
  ],

  "/blog/mooie-fietsroutes-rondom-zeijen": [
    {
      href: "/vakantiehuis-assen",
      anchor: "een vakantiehuis bij Assen als uitvalsbasis",
      reden: "Positie 7,8. Versterkt de best winbare commerciële pagina. Artikel staat niet in de seed, dus de link landt in het lees-verder-blok.",
    },
  ],

  "/blog/prive-lodge-boeken-nederland-kosten": [
    {
      href: "/vakantiehuis-met-hottub-drenthe",
      anchor: "wat een lodge met jacuzzi bij ons kost",
      na: "nieuwsbrief-abonnees krijgen als eerste bericht",
      zin: "Wil je nu al weten {link}: op die pagina staat de vanafprijs per nacht.",
      reden: "Positie 6,4 op een prijszoekopdracht — late funnel en daarmee het sterkste conversiesignaal van de site.",
    },
  ],

  "/blog/drentsche-aa-beekdallandschap": [
    {
      href: "/wandelroutes-drenthe",
      anchor: "wandelen langs de Drentsche Aa",
      na: "Na een dag wandelen of fietsen langs de beek",
      zin: "Onze eigen selectie routes voor {link} staat op een aparte pagina.",
      reden: "Positie 12,6. Thematisch identiek aan de H2 over de Drentsche Aa op de wandelpagina.",
    },
  ],

  "/blog/e-bike-huren-in-drenthe": [
    {
      href: "/fietsen-in-drenthe",
      anchor: "fietsroutes vanuit Zeijen",
      na: "op het terrein een laadpaal aanwezig",
      zin: "De mooiste {link} hebben we op een aparte pagina uitgeschreven, inclusief afstanden en knooppunten.",
      reden: "Positie 12,7 met 51 vertoningen; dezelfde bezoeker, één stap verder in de reis.",
    },
  ],

  /* ── Tussen de commerciële pagina's ────────────────────────────────── */

  "/wellness-vakantie-drenthe": [
    {
      href: "/vakantiehuis-met-hottub-drenthe",
      anchor: "vakantiehuis met privé-jacuzzi",
      na: "u kunt binnen tien minuten in de jacuzzi liggen",
      zin: "Zoekt u vooral een {link}, dan staan de details over het water op die pagina.",
      reden: "P0 → P0: dezelfde bezoeker, ander zoekwoord.",
    },
    {
      href: "/luxe-lodge-drenthe",
      anchor: "de lodge met eigen sauna",
      na: "de sauna zit in Lodge De Heide",
      zin: "Wat u daar verder aan uitrusting en afwerking treft, staat op de pagina over {link}.",
      reden: "Wijst zolang naar /luxe-lodge-drenthe; wordt /lodge-de-heide zodra die pagina bestaat.",
    },
  ],

  "/romantisch-weekend-weg-drenthe": [
    {
      href: "/vakantiehuis-met-hottub-drenthe",
      anchor: "de jacuzzi op het terras",
      na: "die staat al aan, 24/7 op 38 °C",
      zin: "Alles over {link} — afmetingen, onderhoud en het uitzicht erbij — staat op een eigen pagina.",
      reden: "P0 → P0, met de sterkste vraagterm van de site als anker.",
    },
  ],

  "/vakantiehuis-assen": [
    {
      href: "/luxe-lodge-drenthe",
      anchor: "onze ruimste lodge",
      na: "Lodge De Eik een buitenkeuken met BBQ",
      zin: "Hoe {link} is ingedeeld, ziet u op de pagina over de luxe lodges.",
      reden: "Wijst zolang naar /luxe-lodge-drenthe; wordt /lodge-de-eik zodra die pagina bestaat.",
    },
  ],
};

/* Blogslugs die live anders heten dan in de matrix. De oude artikelen dragen
 * nog hun oorspronkelijke, lange slug; de matrix gebruikt de korte, leesbare
 * variant als sleutel. */
const SLUG_ALIASSEN: Record<string, string> = {
  "/blog/mooie-fietsroutes-rondom-zeijen-ontdek-het-mooiste-van-drenthe-op-de-fiets":
    "/blog/mooie-fietsroutes-rondom-zeijen",
};

/** Uitgaande contextuele links voor een pad ("/heide-drenthe", "/blog/x"). */
export function matrixLinksVoor(pad: string): MatrixLink[] {
  const genormaliseerd = pad.length > 1 ? pad.replace(/\/+$/, "") : pad;
  const sleutel = SLUG_ALIASSEN[genormaliseerd] ?? genormaliseerd;
  return LINK_MATRIX[sleutel] ?? [];
}

export interface MatrixResultaat {
  /** De alinea's, met de geplaatste links erin verwerkt. */
  blokken: string[];
  /** Links die geen plek in de tekst vonden — die horen in het lees-verder-blok. */
  rest: MatrixLink[];
}

/** Zet elke matrixlink één keer in de tekst: achter de eerste alinea die het
 *  `na`-fragment bevat. Staat de link er al (handmatig in de content gezet),
 *  dan blijft die staan en doet deze functie niets. Per alinea hoogstens één
 *  toegevoegde zin. */
export function pasMatrixToe(blokken: string[], links: MatrixLink[]): MatrixResultaat {
  if (links.length === 0) return { blokken, rest: [] };

  const uit = [...blokken];
  const gevuld = new Set<number>();
  const rest: MatrixLink[] = [];

  for (const link of links) {
    const alAanwezig = uit.some((b) => b.includes(`](${link.href})`));
    if (alAanwezig) continue;

    if (!link.na || !link.zin) {
      rest.push(link);
      continue;
    }

    const i = uit.findIndex(
      (b, idx) => !gevuld.has(idx) && !b.trimStart().startsWith("#") && b.includes(link.na!),
    );
    if (i === -1) {
      rest.push(link);
      continue;
    }

    const zin = link.zin.replace("{link}", `[${link.anchor}](${link.href})`);
    uit[i] = `${uit[i].trimEnd()} ${zin}`;
    gevuld.add(i);
  }

  return { blokken: uit, rest };
}
