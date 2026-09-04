import type { Metadata } from "next";

const SITE = "https://www.huisterhuynen.nl";

export const metadata: Metadata = {
  // Rechtspagina's horen wel op de site, niet in de zoekresultaten: ze trekken
  // geen bezoekers die iets willen boeken en verdunnen wel het beeld dat Google
  // van de site heeft. follow blijft aan, zodat de links vanaf deze pagina's
  // gewoon meetellen. Ze staan hierom ook niet meer in de sitemap.
  robots: { index: false, follow: true },
  title: "Algemene Voorwaarden",
  description: "Algemene voorwaarden van Huis ter Huynen voor directe boekingen en verblijven.",
  alternates: {
    canonical: `${SITE}/terms`,
    languages: {
      nl: `${SITE}/terms`,
      de: `${SITE}/agb`,
      "x-default": `${SITE}/terms`,
    },
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
