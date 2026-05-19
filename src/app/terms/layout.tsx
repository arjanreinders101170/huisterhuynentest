import type { Metadata } from "next";

const SITE = "https://www.huisterhuynen.nl";

export const metadata: Metadata = {
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
