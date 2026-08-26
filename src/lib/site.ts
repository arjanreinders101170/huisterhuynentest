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

/** De rol van een landingspagina in de interne linkmatrix.
 *  - `informatief`: pagina's die op zoekopdrachten zonder koopintentie ranken
 *    (hunebedden, heide, routes). Dit zijn de donoren: hun autoriteit moet
 *    naar de commerciële pagina's stromen.
 *  - `commercieel`: de pagina's waar een aanvraag vandaan moet komen. */
export type LandingRol = "commercieel" | "informatief";

/** Curated landing pages for footer / internal-linking blocks (short labels). */
export const LANDING_NAV: { label: string; href: string; rol: LandingRol }[] = [
  { label: "Vakantiehuis met hottub", href: "/vakantiehuis-met-hottub-drenthe", rol: "commercieel" },
  { label: "Luxe lodge Drenthe", href: "/luxe-lodge-drenthe", rol: "commercieel" },
  { label: "Romantisch weekend weg", href: "/romantisch-weekend-weg-drenthe", rol: "commercieel" },
  { label: "Wellness vakantie", href: "/wellness-vakantie-drenthe", rol: "commercieel" },
  { label: "Vakantiehuis bij Assen", href: "/vakantiehuis-assen", rol: "commercieel" },
  { label: "Vakantiehuis bij Norg", href: "/vakantiehuis-norg", rol: "commercieel" },
  { label: "Overnachten bij Veenhuizen", href: "/overnachten-veenhuizen", rol: "commercieel" },
  { label: "Bijzonder overnachten", href: "/bijzonder-overnachten-drenthe", rol: "commercieel" },
  { label: "Vakantiehuis met hond", href: "/vakantiehuis-drenthe-met-hond", rol: "commercieel" },
  { label: "Hunebedden Drenthe", href: "/hunebedden-drenthe", rol: "informatief" },
  { label: "Paarse heide Drenthe", href: "/heide-drenthe", rol: "informatief" },
  { label: "Wandelroutes Drenthe", href: "/wandelroutes-drenthe", rol: "informatief" },
  { label: "Fietsen in Drenthe", href: "/fietsen-in-drenthe", rol: "informatief" },
  { label: "Fochteloërveen", href: "/fochteloerveen-drenthe", rol: "informatief" },
];

/** De Duitse landingspagina's. Stonden niet in LANDING_NAV, waardoor een
 *  bezoeker van /de/* onderaan dertien Nederlandstalige links kreeg. */
export const LANDING_NAV_DE: { label: string; href: string }[] = [
  { label: "Ferienhaus mit Whirlpool", href: "/de/ferienhaus-mit-whirlpool-drenthe" },
  { label: "Luxus-Lodge Drenthe", href: "/de/luxus-lodge-drenthe" },
  { label: "Wellness-Urlaub Drenthe", href: "/de/wellness-urlaub-drenthe" },
  { label: "Romantisches Wochenende", href: "/de/romantisches-wochenende-drenthe" },
];

/** Waar een pagina zich in de site bevindt, voor het footerblok. */
export type FooterVariant = "home" | "commercieel" | "informatief" | "de";

/** Maximaal aantal landingspaginalinks in het footerblok.
 *
 *  Waarom zes en niet dertien: het blok toonde op élke pagina álle
 *  landingspagina's. Iedere pagina ontving daardoor evenveel interne links en
 *  sprong er dus geen enkele uit — precies de gelijkmatige positie-49-verdeling
 *  die in de SEO-analyse zichtbaar was. Een link die overal staat telt
 *  nauwelijks mee; zes gerichte links per paginatype wel. */
export const FOOTER_LINK_MAX = 6;

/** De drie P0-pagina's: hier moet de interne linkwaarde naartoe. */
const P0 = [
  "/wellness-vakantie-drenthe",
  "/romantisch-weekend-weg-drenthe",
  "/vakantiehuis-met-hottub-drenthe",
];

/** Per paginatype een eigen set. Bewust verschillend: als elk type dezelfde
 *  zes toont, is het opnieuw één blok dat overal hetzelfde zegt. */
const FOOTER_SETS: Record<Exclude<FooterVariant, "de">, string[]> = {
  // De homepage is de sterkste pagina van de site (positie 8,5): die duwt de
  // drie P0-pagina's plus de drie commerciële pagina's die daarna aan de beurt
  // zijn.
  home: [...P0, "/luxe-lodge-drenthe", "/vakantiehuis-assen", "/bijzonder-overnachten-drenthe"],
  // Donoren geven hun autoriteit door aan commerciële pagina's — de P0-drie
  // plus de drie plaatsgebonden pagina's, die het dichtst bij de intentie van
  // een bezoeker in de omgeving liggen.
  informatief: [...P0, "/vakantiehuis-assen", "/vakantiehuis-norg", "/overnachten-veenhuizen"],
  // Commerciële pagina's linken naar de informatieve cluster (die zichtbaarheid
  // heeft en er nieuwe bezoekers mee binnenhaalt) en naar de P0-pagina's.
  commercieel: ["/hunebedden-drenthe", "/heide-drenthe", "/wandelroutes-drenthe", ...P0],
};

/** Het footerblok voor een paginatype: hoogstens zes links, zonder de pagina
 *  waar de bezoeker al is. */
export function footerLandingLinks(
  variant: FooterVariant,
  huidigPad?: string,
): { label: string; href: string }[] {
  if (variant === "de") {
    return LANDING_NAV_DE.filter((l) => l.href !== huidigPad).slice(0, FOOTER_LINK_MAX);
  }
  const labels = new Map(LANDING_NAV.map((l) => [l.href, l.label]));
  return FOOTER_SETS[variant]
    .filter((href) => href !== huidigPad)
    .slice(0, FOOTER_LINK_MAX)
    .map((href) => ({ href, label: labels.get(href) ?? href }));
}

/** De rol van een landingsslug; onbekende slugs behandelen we als commercieel,
 *  want een nieuwe pagina is vaker een aanbod dan een gids. */
export function landingRol(slug: string): LandingRol {
  return LANDING_NAV.find((l) => l.href === `/${slug}`)?.rol ?? "commercieel";
}
