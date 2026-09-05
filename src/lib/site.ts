/** Canonical site origin — single source of truth for absolute URLs in
 *  metadata, canonicals and JSON-LD. Always the www host. */
export const SITE_URL = "https://www.huisterhuynen.nl";

/**
 * Serialiseert JSON-LD voor plaatsing in een <script>-blok.
 *
 * JSON.stringify escapet `<` niet, dus een waarde die "</script>" bevat breekt
 * uit het scriptblok en de rest wordt als HTML uitgevoerd. Vandaag vullen
 * alleen ingelogde admins deze velden (blogtitels, landingspagina's), dus er
 * is nu geen exploiteerbaar pad — maar het is een sink die op scherp staat
 * voor de dag dat er bezoekersinvoer in een schema belandt, bijvoorbeeld
 * reviews in een aggregateRating.
 *
 * \u2028 en \u2029 zijn geldig in JSON maar niet in JavaScript-broncode, en
 * breken de parser wanneer de browser dit blok leest.
 */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/** Images in /public usable as hero/OG images for landing pages and blog posts. */
export const PUBLIC_IMAGES = [
  "/lodge-heide.jpg", "/lodge-eik.jpg", "/heide1.jpg", "/heide2.jpg", "/heide3.jpg",
  "/wandel_drenthe.jpg", "/welness_drenthe.jpg", "/museum_drenthe.jpg", "/rent_a_bike.jpg",
  "/borrel1.jpg", "/late_check_out.jpg",
];

/** Absolute OG/social-image URL voor een blogartikel. Staat er een eigen foto in
 *  og_image, dan wint die; anders wordt per artikel een eigen kaart gegenereerd
 *  (/api/og/blog) in plaats van voor elk artikel dezelfde lodge-heide.jpg. */
export function blogOgImageUrl(post: { slug: string; og_image?: string | null }): string {
  return post.og_image
    ? `${SITE_URL}${post.og_image}`
    : `${SITE_URL}/api/og/blog?slug=${encodeURIComponent(post.slug)}`;
}

/** Absolute OG/social-image URL voor een landingspagina. Zelfde regel als bij de
 *  blogs: een eigen foto in og_image wint, anders een gegenereerde kaart met de
 *  eigen H1. Bewust géén terugval op hero_image of lodge-heide.jpg — die foto's
 *  worden door meerdere pagina's gedeeld en leveren identieke previews op. */
export function landingOgImageUrl(rec: { slug: string; og_image?: string | null }): string {
  return rec.og_image
    ? `${SITE_URL}${rec.og_image}`
    : `${SITE_URL}/api/og/landing?slug=${encodeURIComponent(rec.slug)}`;
}

/** Starting price per night (both lodges). Single source for copy + Offer schema. */
export const PRICE_FROM_EUR = 165;
export const PRICE_FROM_LABEL = "Vanaf €165 per nacht";

/** Curated landing pages for footer / internal-linking blocks (short labels). */
export const LANDING_NAV: { label: string; href: string }[] = [
  { label: "Vakantiehuis met hottub", href: "/vakantiehuis-met-hottub-drenthe" },
  { label: "Luxe lodge Drenthe", href: "/luxe-lodge-drenthe" },
  { label: "Romantisch weekend weg", href: "/romantisch-weekend-weg-drenthe" },
  { label: "Wellness huis Drenthe", href: "/wellness-vakantie-drenthe" },
  { label: "Vakantiehuis bij Assen", href: "/vakantiehuis-assen" },
  { label: "Vakantiehuis bij Norg", href: "/vakantiehuis-norg" },
  { label: "Overnachten bij Veenhuizen", href: "/overnachten-veenhuizen" },
  { label: "Bijzonder overnachten", href: "/bijzonder-overnachten-drenthe" },
  { label: "Vakantiehuis met hond", href: "/vakantiehuis-drenthe-met-hond" },
  { label: "Hunebedden Drenthe", href: "/hunebedden-drenthe" },
  { label: "Paarse heide Drenthe", href: "/heide-drenthe" },
  { label: "Wandelroutes Drenthe", href: "/wandelroutes-drenthe" },
  { label: "Fietsen in Drenthe", href: "/fietsen-in-drenthe" },
  { label: "Fochteloërveen", href: "/fochteloerveen-drenthe" },
];

/* ═══ Interne linkstructuur: hub-and-spoke ═══
 *
 * Tot nu toe stond LANDING_NAV integraal in de footer van élke pagina: veertien
 * links, overal dezelfde. Daarmee ontvangt iedere pagina evenveel interne
 * links en springt er dus geen enkele uit — precies de gelijkmatige verdeling
 * rond positie 49 die in de GSC-analyse zichtbaar is.
 *
 * Daarom hieronder een indeling in donoren en ontvangers. Informatieve
 * pagina's (heide, hunebedden, wandelen, fietsen) trekken het verkeer en geven
 * hun autoriteit gericht door aan de commerciële pagina's die moeten
 * converteren. Commerciële pagina's linken vooral naar elkaar en naar de twee
 * informatieve hubs die hun onderwerp ondersteunen.
 *
 * De sets zijn bewust klein: zes links is de bovengrens. Een link die overal
 * staat, telt nauwelijks; het gaat om de paar die er contextueel toe doen.
 */

/** Landingspagina's die een aanvraag moeten opleveren — de ontvangers. */
export const COMMERCIELE_SLUGS = [
  "vakantiehuis-met-hottub-drenthe",
  "wellness-vakantie-drenthe",
  "romantisch-weekend-weg-drenthe",
  "luxe-lodge-drenthe",
  "vakantiehuis-assen",
  "vakantiehuis-norg",
  "overnachten-veenhuizen",
  "bijzonder-overnachten-drenthe",
  "vakantiehuis-drenthe-met-hond",
] as const;

/** Landingspagina's over de omgeving — de donoren. */
export const INFORMATIEVE_SLUGS = [
  "hunebedden-drenthe",
  "heide-drenthe",
  "wandelroutes-drenthe",
  "fietsen-in-drenthe",
  "fochteloerveen-drenthe",
] as const;

/** Type pagina waarvoor een footerset gekozen wordt. */
export type PaginaType = "home" | "commercieel" | "informatief" | "blog" | "de";

const NAV_LABEL: Record<string, string> = Object.fromEntries(
  LANDING_NAV.map((l) => [l.href.replace(/^\//, ""), l.label]),
);

function nav(slug: string): { label: string; href: string } {
  return { label: NAV_LABEL[slug] ?? slug, href: `/${slug}` };
}

/** Zes footerlinks per paginatype. De drie P0-pagina's (hottub, wellness,
 *  romantisch) staan overal waar het past: dat zijn de pagina's die het
 *  omzetdoel dragen. */
const FOOTER_SETS: Record<Exclude<PaginaType, "de">, string[]> = {
  // De homepage is de sterkste pagina van de site en duwt door naar de
  // commerciële pagina's, niet naar de omgevingsverhalen.
  home: [
    "vakantiehuis-met-hottub-drenthe",
    "wellness-vakantie-drenthe",
    "romantisch-weekend-weg-drenthe",
    "luxe-lodge-drenthe",
    "vakantiehuis-assen",
    "bijzonder-overnachten-drenthe",
  ],
  // Een commerciële pagina linkt naar de vier andere commerciële pagina's die
  // een andere intentie bedienen (dus geen kannibalisatie) plus de twee
  // omgevingspagina's die de streek verkopen.
  commercieel: [
    "vakantiehuis-met-hottub-drenthe",
    "wellness-vakantie-drenthe",
    "romantisch-weekend-weg-drenthe",
    "vakantiehuis-assen",
    "heide-drenthe",
    "wandelroutes-drenthe",
  ],
  // De donoren: alles wat hier staat is een ontvanger. Geen links naar andere
  // informatieve pagina's — die hebben de autoriteit niet nodig.
  informatief: [
    "vakantiehuis-met-hottub-drenthe",
    "wellness-vakantie-drenthe",
    "romantisch-weekend-weg-drenthe",
    "luxe-lodge-drenthe",
    "vakantiehuis-assen",
    "bijzonder-overnachten-drenthe",
  ],
  // Blogs halen de hoogste CTR van de site (3,31% tegen 0,25%) en gaven tot nu
  // toe niets door: geen enkele blog linkte naar een commerciële pagina.
  blog: [
    "vakantiehuis-met-hottub-drenthe",
    "wellness-vakantie-drenthe",
    "romantisch-weekend-weg-drenthe",
    "vakantiehuis-assen",
    "vakantiehuis-norg",
    "heide-drenthe",
  ],
};

/** Duitstalige pagina's linken naar Duitstalige pagina's. Tot nu toe kreeg een
 *  Duitse bezoeker veertien Nederlandse links in de footer. */
const FOOTER_DE: { label: string; href: string }[] = [
  { label: "Ferienhaus mit Whirlpool", href: "/de/ferienhaus-mit-whirlpool-drenthe" },
  { label: "Luxus-Lodge Drenthe", href: "/de/luxus-lodge-drenthe" },
  { label: "Wellness-Urlaub Drenthe", href: "/de/wellness-urlaub-drenthe" },
  { label: "Romantisches Wochenende", href: "/de/romantisches-wochenende-drenthe" },
];

/** Het paginatype van een landingsslug. */
export function paginaTypeVoorSlug(slug: string): PaginaType {
  if (slug.startsWith("de/")) return "de";
  return (INFORMATIEVE_SLUGS as readonly string[]).includes(slug) ? "informatief" : "commercieel";
}

/** De footerlinks voor een paginatype, zonder de pagina zelf. Maximaal zes. */
export function footerLinks(type: PaginaType, huidigeSlug?: string): { label: string; href: string }[] {
  if (type === "de") return FOOTER_DE.filter((l) => l.href !== `/${huidigeSlug}`);
  return FOOTER_SETS[type]
    .filter((s) => s !== huidigeSlug)
    .slice(0, 6)
    .map(nav);
}

/* ═══ Contextuele CTA's ═══
 *
 * Elke CTA op een landingspagina sprong naar /#reserveren: dezelfde generieke
 * boekingssectie, zonder enig spoor van de pagina waar de bezoeker vandaan
 * kwam. Hij verliest daarmee zijn context én de hele opbouw van de pagina die
 * hem net overtuigd had.
 *
 * Let op de vorm van de URL. In het plan staat /#reserveren?van=wellness, maar
 * alles achter een # is fragment: die parameters komen nooit in de query
 * terecht en zijn in de browser niet uit te lezen. De query moet dus vóór het
 * anker staan: /?van=wellness&lodge=heide#reserveren.
 */

/** Lodge zoals hij in de URL staat. RequestForm vertaalt naar lodge_1/lodge_2. */
export type LodgeParam = "heide" | "eik";

export interface ReserveerContext {
  /** Waarde van ?van= — kort, leesbaar en stabiel (niet de hele slug). */
  van: string;
  /** Zin die in de boekingssectie bevestigt wat de bezoeker aanvraagt. */
  regel: string;
  /** Alleen voorselecteren waar er een inhoudelijke reden voor is: een pagina
   *  over sauna en wellness hoort bij De Heide, een pagina die op ruimte
   *  verkoopt bij De Eik. Zonder reden geen voorselectie — dan is de keuze
   *  van de bezoeker zelf het eerlijkste startpunt. */
  lodge?: LodgeParam;
}

export const RESERVEER_CONTEXT: Record<string, ReserveerContext> = {
  "vakantiehuis-met-hottub-drenthe": {
    van: "hottub",
    regel: "U bekijkt beschikbaarheid voor een lodge met een eigen hottub op het terras.",
  },
  "wellness-vakantie-drenthe": {
    van: "wellness",
    lodge: "heide",
    regel: "U bekijkt beschikbaarheid voor een wellnessverblijf in Lodge De Heide, met eigen sauna en hottub.",
  },
  "romantisch-weekend-weg-drenthe": {
    van: "romantisch",
    lodge: "heide",
    regel: "U bekijkt beschikbaarheid voor een romantisch weekend in Lodge De Heide, met sauna en panoramisch uitzicht.",
  },
  "luxe-lodge-drenthe": {
    van: "luxe",
    regel: "U bekijkt beschikbaarheid voor een luxe lodge op de heide bij Zeijen.",
  },
  "vakantiehuis-assen": {
    van: "assen",
    lodge: "eik",
    regel: "U bekijkt beschikbaarheid voor een vakantiehuis bij Assen — Lodge De Eik, de ruimste van de twee.",
  },
  "vakantiehuis-norg": {
    van: "norg",
    regel: "U bekijkt beschikbaarheid voor een vakantiehuis bij Norg.",
  },
  "overnachten-veenhuizen": {
    van: "veenhuizen",
    regel: "U bekijkt beschikbaarheid voor een overnachting op een kwartier van Veenhuizen.",
  },
  "bijzonder-overnachten-drenthe": {
    van: "bijzonder",
    regel: "U bekijkt beschikbaarheid voor een bijzondere overnachting midden in de Drentse natuur.",
  },
  "vakantiehuis-drenthe-met-hond": {
    van: "hond",
    regel: "U bekijkt beschikbaarheid voor een verblijf met uw hond. Vermeld het even in uw bericht, dan stemmen wij het af.",
  },
  "hunebedden-drenthe": {
    van: "hunebedden",
    regel: "U bekijkt beschikbaarheid voor een verblijf op vijf minuten van hunebed D5.",
  },
  "heide-drenthe": {
    van: "heide",
    regel: "U bekijkt beschikbaarheid voor een verblijf op loopafstand van de bloeiende heide.",
  },
  "wandelroutes-drenthe": {
    van: "wandelen",
    regel: "U bekijkt beschikbaarheid voor een wandelweekend met de routes vanaf de deur.",
  },
  "fietsen-in-drenthe": {
    van: "fietsen",
    regel: "U bekijkt beschikbaarheid voor een fietsverblijf, met huurfietsen op het terrein.",
  },
  "fochteloerveen-drenthe": {
    van: "fochteloerveen",
    regel: "U bekijkt beschikbaarheid voor een verblijf op twintig minuten van het Fochteloërveen.",
  },
  // De lodgepagina's zijn de enige plek waar de bezoeker écht één lodge kiest.
  // Daar is voorselecteren geen aanname maar zijn eigen keuze doorgeven.
  "lodge-de-heide": {
    van: "de-heide",
    lodge: "heide",
    regel: "U bekijkt beschikbaarheid voor Lodge De Heide, met eigen sauna en uitzicht over de heide.",
  },
  "lodge-de-eik": {
    van: "de-eik",
    lodge: "eik",
    regel: "U bekijkt beschikbaarheid voor Lodge De Eik, met buitenkeuken en BBQ onder de eiken.",
  },
};

const CONTEXT_OP_VAN: Record<string, ReserveerContext> = Object.fromEntries(
  Object.values(RESERVEER_CONTEXT).map((c) => [c.van, c]),
);

/** De bevestigende regel bij een ?van=-waarde, of niets bij een onbekende. */
export function reserveerContextVoorVan(van: string | null | undefined): ReserveerContext | null {
  if (!van) return null;
  return CONTEXT_OP_VAN[van] ?? null;
}

/** CTA-doel voor een landingspagina: de boekingssectie mét context.
 *  Duitstalige pagina's houden hun eigen formulier op /de. */
export function reserveerHref(slug?: string): string {
  if (slug?.startsWith("de/")) return "/de#verfugbarkeit";
  const ctx = slug ? RESERVEER_CONTEXT[slug] : undefined;
  if (!ctx) return "/#reserveren";
  const q = new URLSearchParams({ van: ctx.van });
  if (ctx.lodge) q.set("lodge", ctx.lodge);
  return `/?${q.toString()}#reserveren`;
}

/* ═══ De twee lodges ═══
 *
 * Tot nu toe was er geen enkele stap waarin de bezoeker een lódge koos. Hij
 * sprong van een themapagina ("wellness", "romantisch") rechtstreeks naar een
 * aanvraagformulier — terwijl kiezen precies de stap is die twijfel omzet in
 * commitment. Deze twee records voeden zowel het keuzeblok op de commerciële
 * pagina's als de verwijzingen tussen de lodgepagina's onderling.
 *
 * Het onderscheid is bewust hard: De Heide heeft de sauna en het uitzicht, De
 * Eik de buitenkeuken en de BBQ. Twee lodges die hetzelfde beloven zijn geen
 * keuze maar ruis — en op paginaniveau precies het kannibalisatieprobleem dat
 * de site al heeft.
 */
export interface LodgePagina {
  /** Waarde van ?lodge= in de boekingsflow. */
  param: LodgeParam;
  naam: string;
  slug: string;
  /** De ene zin die deze lodge van de andere onderscheidt. */
  onderscheid: string;
  kenmerken: string[];
  afbeelding: string;
  alt: string;
}

export const LODGE_PAGINAS: LodgePagina[] = [
  {
    param: "heide",
    naam: "Lodge De Heide",
    slug: "lodge-de-heide",
    onderscheid: "De enige met een eigen sauna, en met panoramisch uitzicht over heide en bos.",
    kenmerken: ["Eigen sauna", "Panoramisch uitzicht", "Privé-hottub op het terras"],
    afbeelding: "/lodge-heide.jpg",
    alt: "Lodge De Heide met privé-hottub op het terras en uitzicht over de Drentse heide",
  },
  {
    param: "eik",
    naam: "Lodge De Eik",
    slug: "lodge-de-eik",
    onderscheid: "De ruimste van de twee, met een buitenkeuken en BBQ onder de eiken.",
    kenmerken: ["Buitenkeuken & BBQ", "Hoge plafonds", "Privé-hottub op het terras"],
    afbeelding: "/lodge-eik.jpg",
    alt: "Lodge De Eik onder de eiken met buitenkeuken, BBQ en eigen terras",
  },
];

export const LODGE_OP_SLUG: Record<string, LodgePagina> = Object.fromEntries(
  LODGE_PAGINAS.map((l) => [l.slug, l]),
);

/** Pagina's die het lodgekeuzeblok tonen: de drie P0-pagina's plus de twee
 *  lodgepagina's zelf, waar het blok de vergelijking met de andere lodge is.
 *  Bewust niet overal — op een pagina over hunebedden of fietsroutes is de
 *  bezoeker nog niet aan kiezen toe. */
const LODGEKEUZE_SLUGS = new Set([
  "vakantiehuis-met-hottub-drenthe",
  "wellness-vakantie-drenthe",
  "romantisch-weekend-weg-drenthe",
  "lodge-de-heide",
  "lodge-de-eik",
]);

/** De lodges die op deze pagina te kiezen zijn, of een lege lijst. Op een
 *  lodgepagina staat alleen de ándere lodge in het blok: die pagina gaat al
 *  over de ene, en "vergelijk met De Eik" is daar de zinvolle stap. */
export function lodgekeuzeVoorSlug(slug: string): LodgePagina[] {
  if (!LODGEKEUZE_SLUGS.has(slug)) return [];
  return LODGE_PAGINAS.filter((l) => l.slug !== slug);
}
