/** Canonical site origin — single source of truth for absolute URLs in
 *  metadata, canonicals and JSON-LD. Always the www host. */
export const SITE_URL = "https://www.huisterhuynen.nl";

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
];
