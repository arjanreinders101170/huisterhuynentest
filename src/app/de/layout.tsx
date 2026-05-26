import type { Metadata } from "next";

const SITE = "https://www.huisterhuynen.nl";
const OG_IMAGE = `${SITE}/lodge-heide.jpg`;

export const metadata: Metadata = {
  title: {
    default: "Exklusive Wellness Lodges in Drenthe | Huis ter Huynen",
    template: "%s – Huis ter Huynen",
  },
  description:
    "Genießen Sie Ruhe, Natur und exklusiven Wellnesskomfort in Drenthe. Private Lodges mit Sauna und Hot Tub – perfekt für eine entspannte Auszeit in den Niederlanden.",
  keywords: [
    "Wellness Lodge Niederlande",
    "Luxus Ferienhaus Holland",
    "Ferienhaus mit Sauna Niederlande",
    "Wellness Wochenende Holland",
    "Boutique Lodge Drenthe",
    "Hot Tub Ferienhaus Niederlande",
    "Luxus Lodge Natur",
    "Wellnessurlaub Niederlande",
    "Ferienhaus Drenthe",
    "Hütte mit Whirlpool Niederlande",
    "Huis ter Huynen",
  ],
  authors: [{ name: "Huis ter Huynen" }],
  creator: "Huis ter Huynen",
  publisher: "Huis ter Huynen",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "de_DE",
    alternateLocale: ["nl_NL"],
    url: `${SITE}/de`,
    siteName: "Huis ter Huynen",
    title: "Exklusive Wellness Lodges in Drenthe | Huis ter Huynen",
    description:
      "Private Sauna, Hot Tub und absolute Ruhe — Ihr luxuriöser Rückzugsort in den Niederlanden. Zwei Boutique Lodges auf der Drentse Heide bei Zeijen.",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Boutique Lodge De Heide — Huis ter Huynen, Drenthe",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Exklusive Wellness Lodges in Drenthe | Huis ter Huynen",
    description:
      "Private Sauna, Hot Tub und absolute Ruhe — Ihr luxuriöser Rückzugsort in den Niederlanden.",
    images: [OG_IMAGE],
  },
  alternates: {
    canonical: `${SITE}/de`,
    languages: {
      nl: `${SITE}/`,
      de: `${SITE}/de`,
      "x-default": `${SITE}/`,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  inLanguage: "de",
  name: "Huis ter Huynen",
  description:
    "Zwei exklusive Boutique Wellness Lodges auf der Drentse Heide bei Zeijen. Private Sauna, Hot Tub, Wandern und Radfahren direkt vor der Tür. 20 Minuten von Assen entfernt.",
  url: `${SITE}/de`,
  telephone: "+31642568603",
  email: "lodge@huisterhuynen.nl",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Zuiderstraat 6",
    postalCode: "9491 EC",
    addressLocality: "Zeijen",
    addressRegion: "Drenthe",
    addressCountry: "NL",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 53.0167,
    longitude: 6.5667,
  },
  image: [OG_IMAGE],
  priceRange: "€€€",
  amenityFeature: [
    { "@type": "LocationFeatureSpecification", name: "Privater Hot Tub", value: true },
    { "@type": "LocationFeatureSpecification", name: "Sauna", value: true },
    { "@type": "LocationFeatureSpecification", name: "Kostenloses WLAN", value: true },
    { "@type": "LocationFeatureSpecification", name: "E-Ladestation", value: true },
    { "@type": "LocationFeatureSpecification", name: "Private Terrasse", value: true },
    { "@type": "LocationFeatureSpecification", name: "Voll ausgestattete Küche", value: true },
  ],
  containsPlace: [
    {
      "@type": "Accommodation",
      name: "De Heide",
      inLanguage: "de",
      description:
        "Luxuriöse Lodge auf der Drentse Heide für vier Personen. Eigene Sauna, privater Hot Tub und Panoramablick über den Wald.",
      occupancy: { "@type": "QuantitativeValue", maxValue: 4 },
      amenityFeature: [
        { "@type": "LocationFeatureSpecification", name: "Privater Hot Tub", value: true },
        { "@type": "LocationFeatureSpecification", name: "Sauna", value: true },
      ],
    },
    {
      "@type": "Accommodation",
      name: "De Eik",
      inLanguage: "de",
      description:
        "Geräumige Lodge unter Eichen für vier Personen. Hohe Decken, voll ausgestattete Küche und Außenküche mit Grill.",
      occupancy: { "@type": "QuantitativeValue", maxValue: 4 },
      amenityFeature: [
        { "@type": "LocationFeatureSpecification", name: "Privater Hot Tub", value: true },
        { "@type": "LocationFeatureSpecification", name: "Außenküche & Grill", value: true },
      ],
    },
  ],
  hasMap: "https://maps.google.com/?q=Zeijen,Drenthe",
  keywords:
    "Wellness Lodge Drenthe, Luxus Ferienhaus Niederlande, Hot Tub Ferienhaus, Boutique Lodge Holland, Sauna Wochenende, Wandern Heide, Radfahren Drenthe",
};

export default function DeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
