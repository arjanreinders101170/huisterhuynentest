import type { Metadata } from "next";

const SITE = "https://www.huisterhuynen.nl";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description: "Datenschutzerklärung von Huis ter Huynen gemäß DSGVO — wie wir personenbezogene Daten verarbeiten.",
  alternates: {
    canonical: `${SITE}/datenschutz`,
    languages: {
      nl: `${SITE}/privacy`,
      de: `${SITE}/datenschutz`,
      "x-default": `${SITE}/privacy`,
    },
  },
};

export default function DatenschutzLayout({ children }: { children: React.ReactNode }) {
  return children;
}
