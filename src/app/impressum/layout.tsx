import type { Metadata } from "next";

const SITE = "https://www.huisterhuynen.nl";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Anbieterkennzeichnung gemäß § 5 TMG für Huis ter Huynen.",
  alternates: {
    canonical: `${SITE}/impressum`,
  },
};

export default function ImpressumLayout({ children }: { children: React.ReactNode }) {
  return children;
}
