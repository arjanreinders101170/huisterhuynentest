/* Permanente 301-redirects — één bron van waarheid.
 *
 * `next.config.ts` maakt hier de daadwerkelijke 301's van. Daarnaast filteren
 * de sitemap, het blogoverzicht en de landingsroute deze paden weg, zodat een
 * samengevoegde URL nergens meer geïndexeerd of intern gelinkt wordt: een
 * pagina die 301 teruggeeft maar wél in de sitemap staat, blijft anders
 * gecrawld worden en houdt de kannibalisatie in stand.
 */

export interface SeoRedirect {
  /** Bronpad, zonder domein, met leading slash. */
  from: string;
  /** Doelpad. */
  to: string;
  /** Waarom deze redirect bestaat — voor wie hier over een jaar naar kijkt. */
  reden: string;
}

export const SEO_REDIRECTS: SeoRedirect[] = [
  {
    from: "/landing",
    to: "/",
    reden: "Oude generieke landingsroute, vervangen door de homepage.",
  },
  {
    from: "/wellness-vakantie-drenthe-ontspannen-in-een-luxe-vakantiehuis-met-hottub",
    to: "/wellness-vakantie-drenthe",
    reden: "Te lange slug, samengevoegd met de wellness-landingspagina.",
  },
  {
    from: "/blog/vakantiehuis-met-prive-hottub-in-drenthe-pure-luxe-rust-en-beleving",
    to: "/vakantiehuis-met-hottub-drenthe",
    reden:
      "Kannibalisatie: blog 53 vertoningen op positie 60,9 tegen de landingspagina met 914 op 49,1 — zelfde intentie, zelfde zoekwoord.",
  },
  {
    from: "/blog/wellness-in-drenthe",
    to: "/wellness-vakantie-drenthe",
    reden:
      "Kannibalisatie: blog 7 vertoningen op positie 63,7 tegen de landingspagina met 1.526 op 62,6. Inhoud is overgezet naar de landingspagina.",
  },
  {
    from: "/wandelen-drentsche-aa",
    to: "/wandelroutes-drenthe",
    reden:
      "Twee landingspagina's voor één intentie (37 vertoningen op positie 42,2). De Drentsche Aa-inhoud staat nu als eigen H2 op /wandelroutes-drenthe.",
  },
];

const BLOG_PREFIX = "/blog/";

/** Blogslugs die niet meer geserveerd of geïndexeerd worden. */
export const REDIRECTED_BLOG_SLUGS = new Set(
  SEO_REDIRECTS.filter((r) => r.from.startsWith(BLOG_PREFIX)).map((r) =>
    r.from.slice(BLOG_PREFIX.length),
  ),
);

/** Landingsslugs (zonder leading slash) die niet meer geserveerd worden. */
export const REDIRECTED_LANDING_SLUGS = new Set(
  SEO_REDIRECTS.filter((r) => !r.from.startsWith(BLOG_PREFIX)).map((r) => r.from.slice(1)),
);
