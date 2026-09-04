import { PRICE_FROM_EUR } from "@/lib/site";
import type { InhoudDeel } from "@/lib/blog-inhoud";

/* ═══ De CTA's onder en in een blogartikel ═══
 *
 * Blogs halen de hoogste CTR van de site — 3,31% tegen 0,25% voor de
 * commerciële pagina's — en gaven tot voor kort vrijwel niets door. Ze zijn
 * daarmee het best presterende kanaal én de grootste lek.
 *
 * Standaard is de CTA de nieuwsbriefwerving: bij een artikel over
 * wandelroutes is inschrijven de enige stap die past. Bij een paar artikelen
 * past die stap juist niet. Wie zoekt op wat een privé lodge kost, staat aan
 * het eind van de funnel en is de sterkste bezoeker die de site organisch
 * binnenkrijgt (dat artikel staat op positie 6,4 op een prijszoekopdracht).
 * Die bezoeker een nieuwsbrief aanbieden is een stap terug vragen.
 *
 * Deze definities staan in een eigen module omdat drie plekken ze nodig
 * hebben: het blok onder het artikel, het blok halverwege de tekst, en de
 * sticky balk op mobiel — die laatste hangt in de root-layout en kan dus niets
 * van de artikelpagina meekrijgen.
 */
export interface BlogCta {
  eyebrow: string;
  tekst: string;
  knop: string;
  href: string;
  /** Kortere variant voor het blok halverwege het artikel. Zonder dit veld zou
   *  daar letterlijk dezelfde alinea staan als onderaan — twee keer hetzelfde
   *  in één artikel leest als een advertentie die zichzelf herhaalt. */
  halverwege?: string;
}

export const STANDAARD_BLOG_CTA: BlogCta = {
  eyebrow: "Opening 1 januari 2027",
  tekst:
    "De lodges zijn beschikbaar vanaf 1 januari 2027. Schrijf je in voor de nieuwsbrief en ontvang als eerste de vroegboekkorting.",
  knop: "Schrijf me in →",
  href: "/#nieuwsbrief",
};

const CTA_PER_ARTIKEL: Record<string, BlogCta> = {
  "prive-lodge-boeken-nederland-kosten": {
    eyebrow: `Vanaf €${PRICE_FROM_EUR} per nacht`,
    tekst:
      `Twee volledig privé lodges met eigen hottub, vanaf €${PRICE_FROM_EUR} per nacht bij minimaal twee ` +
      "nachten, rechtstreeks geboekt en dus zonder boekingskosten. Geef je data door en je krijgt binnen " +
      "24 uur een persoonlijk voorstel met de volledige prijsopbouw.",
    halverwege:
      `Bij ons begint de nachtprijs bij €${PRICE_FROM_EUR} voor de hele lodge, bij minimaal twee nachten — ` +
      "zonder boekingskosten, omdat je rechtstreeks boekt.",
    knop: "Bekijk beschikbaarheid →",
    href: "/#reserveren",
  },
  "wellnessweekend-drenthe": {
    eyebrow: `Vanaf €${PRICE_FROM_EUR} per nacht`,
    tekst:
      "Zo'n weekend begint bij een huis waar de sauna en de hottub van jou alleen zijn. Beide lodges staan " +
      "vrij op de heide bij Zeijen, met een hottub op het eigen terras die het hele jaar op 38 °C staat.",
    halverwege:
      "Zo'n weekend staat of valt bij het huis: een eigen sauna en een hottub die van jou alleen zijn, " +
      "in plaats van een tijdslot in een resort.",
    knop: "Bekijk de wellness huisjes →",
    href: "/wellness-vakantie-drenthe",
  },
};

export function blogCta(slug: string): BlogCta {
  return CTA_PER_ARTIKEL[slug] ?? STANDAARD_BLOG_CTA;
}

/* De CTA halverwege het artikel.
 *
 * Eén CTA onderaan bereikt alleen de lezer die het hele stuk uitleest; bij een
 * artikel van tien minuten is dat een minderheid. Halverwege staat er daarom
 * een tweede, bewust smaller: één zin en een link, geen tweede blok dat er als
 * advertentie uitziet.
 *
 * Bij de nieuwsbrief-CTA slaan we hem over. Twee keer om hetzelfde e-mailadres
 * vragen in één artikel is zeuren, en de middenpositie is te waardevol om aan
 * de zwakste stap te geven: daar staat dan de lodgekeuze. */
export function blogCtaHalverwege(slug: string): { tekst: string; knop: string; href: string } {
  const eigen = CTA_PER_ARTIKEL[slug];
  if (eigen) return { tekst: eigen.halverwege ?? eigen.tekst, knop: eigen.knop, href: eigen.href };
  return {
    tekst:
      "Twee volledig privé lodges op de heide bij Zeijen, elk met een eigen hottub op het terras. " +
      "De Heide heeft een sauna, De Eik een buitenkeuken met BBQ.",
    knop: "Bekijk de twee lodges →",
    href: "/vakantiehuis-met-hottub-drenthe",
  };
}

/* Wat de sticky balk op mobiel doet bij een blogartikel.
 *
 * De balk hangt in de root-layout en krijgt van de artikelpagina niets mee; het
 * pad is daar de enige bron. Heeft een artikel een eigen commerciële CTA, dan
 * volgt de balk die. Anders blijft de balk staan waar hij overal staat — naar
 * de beschikbaarheid, niet naar de nieuwsbrief: een balk die de hele pagina
 * meescrollt hoort de sterkste stap aan te bieden, niet de zwakste. */
export function stickyBlogCta(slug: string): { knop: string; href: string } | null {
  const eigen = CTA_PER_ARTIKEL[slug];
  return eigen ? { knop: eigen.knop, href: eigen.href } : null;
}

/** Waar de CTA halverwege terechtkomt: vóór de kop die het dichtst bij het
 *  midden ligt. Middenin een sectie zou hij de lezer uit een lopend betoog
 *  trekken; op een kopgrens is hij een natuurlijke adempauze.
 *
 *  Bij korte artikelen gebeurt er niets: onder de acht blokken staat het blok
 *  onder het artikel al binnen een schermlengte, en dan zijn twee CTA's dicht
 *  op elkaar eerder een reden om weg te klikken dan om te klikken. Staat er
 *  geen enkele kop na het begin, dan ook niet — dan is er geen grens om op te
 *  landen. */
export function ctaPositieHalverwege(delen: InhoudDeel[]): number | null {
  if (delen.length < 8) return null;
  const midden = Math.floor(delen.length / 2);
  let beste: number | null = null;
  delen.forEach((deel, i) => {
    if (deel.soort !== "kop" || i === 0) return;
    if (beste === null || Math.abs(i - midden) < Math.abs(beste - midden)) beste = i;
  });
  return beste;
}
