import type { Metadata } from "next";

const SITE = "https://www.huisterhuynen.nl";

export const metadata: Metadata = {
  title: "Privacybeleid",
  description: "Privacybeleid van Huis ter Huynen — hoe wij persoonsgegevens verwerken conform de AVG.",
  alternates: {
    canonical: `${SITE}/privacy`,
    languages: {
      nl: `${SITE}/privacy`,
      de: `${SITE}/datenschutz`,
      "x-default": `${SITE}/privacy`,
    },
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
