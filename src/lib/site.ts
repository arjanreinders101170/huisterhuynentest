/** Canonical site origin — single source of truth for absolute URLs in
 *  metadata, canonicals and JSON-LD. Always the www host. */
export const SITE_URL = "https://www.huisterhuynen.nl";

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

/** Starting price per night (both lodges). Single source for copy + Offer schema. */
export const PRICE_FROM_EUR = 165;
export const PRICE_FROM_LABEL = "Vanaf €165 per nacht";

/** Curated landing pages for footer / internal-linking blocks (short labels). */
export const LANDING_NAV: { label: string; href: string }[] = [
  { label: "Vakantiehuis met hottub", href: "/vakantiehuis-met-hottub-drenthe" },
  { label: "Luxe lodge Drenthe", href: "/luxe-lodge-drenthe" },
  { label: "Romantisch weekend weg", href: "/romantisch-weekend-weg-drenthe" },
  { label: "Wellness vakantie", href: "/wellness-vakantie-drenthe" },
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
