import type { Metadata } from "next";

const SITE = "https://www.huisterhuynen.nl";

export const metadata: Metadata = {
  title: "Allgemeine Geschäftsbedingungen",
  description: "AGB von Huis ter Huynen für Direktbuchungen und Aufenthalte.",
  alternates: {
    canonical: `${SITE}/agb`,
    languages: {
      nl: `${SITE}/terms`,
      de: `${SITE}/agb`,
      "x-default": `${SITE}/terms`,
    },
  },
};

export default function AgbLayout({ children }: { children: React.ReactNode }) {
  return children;
}
