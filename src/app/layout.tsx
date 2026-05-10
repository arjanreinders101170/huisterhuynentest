import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = "https://huisterhuynen.nl";
const OG_IMAGE = `${SITE_URL}/lodge-heide.jpg`;

export const metadata: Metadata = {
  title: {
    default: "Lodge Drenthe | Vakantiewoning met Hottub bij Assen – Huis ter Huynen",
    template: "%s – Huis ter Huynen",
  },
  description:
    "Romantisch weekend weg in Drenthe? Huis ter Huynen biedt 2 luxe lodges op de heide bij Zeijen, 20 min van Assen. Privé hottub, wandelen & fietsen vanuit de deur. Gezellig & sfeervol – boek uw vakantie chalet!",
  keywords: [
    "lodge Drenthe",
    "vakantiewoning Drenthe",
    "chalet Drenthe",
    "hottub Drenthe",
    "weekend weg Drenthe",
    "romantisch weekend Drenthe",
    "vakantie Drenthe",
    "wandelen Drenthe",
    "heide Drenthe",
    "fietsen Drenthe",
    "Assen omgeving vakantie",
    "gezellige vakantiewoning",
    "boutique lodge Zeijen",
    "Huis ter Huynen",
  ],
  authors: [{ name: "Huis ter Huynen" }],
  creator: "Huis ter Huynen",
  publisher: "Huis ter Huynen",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: SITE_URL,
    siteName: "Huis ter Huynen",
    title: "Lodge Drenthe | Vakantiewoning met Hottub bij Assen – Huis ter Huynen",
    description:
      "Romantisch weekend weg in Drenthe? 2 luxe lodges op de heide bij Zeijen, 20 min van Assen. Privé hottub, wandelen & fietsen vanuit de deur. Gezellig & sfeervol.",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Boutique Lodge De Heide – Huis ter Huynen, Drenthe",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lodge Drenthe | Vakantiewoning met Hottub bij Assen – Huis ter Huynen",
    description:
      "Romantisch weekend weg in Drenthe? 2 luxe lodges op de heide bij Zeijen, 20 min van Assen. Privé hottub, wandelen & fietsen vanuit de deur.",
    images: [OG_IMAGE],
  },
  alternates: {
    canonical: SITE_URL,
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#EAE3D2",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  name: "Huis ter Huynen",
  description:
    "Twee luxe boutique lodges op de Drentse heide bij Zeijen. Privé hottub, sauna, wandelen en fietsen vanuit de deur. 20 minuten van Assen.",
  url: SITE_URL,
  telephone: "+31642568603",
  email: "lodge@huisterhuynen.nl",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Zeijen",
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
  starRating: { "@type": "Rating", ratingValue: "5" },
  amenityFeature: [
    { "@type": "LocationFeatureSpecification", name: "Privé hottub", value: true },
    { "@type": "LocationFeatureSpecification", name: "Sauna", value: true },
    { "@type": "LocationFeatureSpecification", name: "Gratis WiFi", value: true },
    { "@type": "LocationFeatureSpecification", name: "EV laadpaal", value: true },
    { "@type": "LocationFeatureSpecification", name: "Privé terras", value: true },
    { "@type": "LocationFeatureSpecification", name: "Volledig uitgeruste keuken", value: true },
  ],
  containsPlace: [
    {
      "@type": "Accommodation",
      name: "De Heide",
      description:
        "Luxe lodge op de Drentse heide voor 4 personen. Eigen sauna, privé hottub en panoramisch uitzicht over het bos.",
      occupancy: { "@type": "QuantitativeValue", maxValue: 4 },
      amenityFeature: [
        { "@type": "LocationFeatureSpecification", name: "Privé hottub", value: true },
        { "@type": "LocationFeatureSpecification", name: "Sauna", value: true },
      ],
    },
    {
      "@type": "Accommodation",
      name: "De Eik",
      description:
        "Ruime lodge onder de eiken voor 4 personen. Hoge plafonds, volledige keuken en buitenkeuken met BBQ.",
      occupancy: { "@type": "QuantitativeValue", maxValue: 4 },
      amenityFeature: [
        { "@type": "LocationFeatureSpecification", name: "Privé hottub", value: true },
        { "@type": "LocationFeatureSpecification", name: "Buitenkeuken & BBQ", value: true },
      ],
    },
  ],
  hasMap: "https://maps.google.com/?q=Zeijen,Drenthe",
  keywords:
    "lodge Drenthe, vakantiewoning Drenthe, hottub Drenthe, chalet Drenthe, romantisch weekend, wandelen heide, fietsen Drenthe, Assen vakantie",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <head>
        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* PWA — iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Huynen" />
        <link rel="apple-touch-icon" href="/icon-192.png" />

        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body style={{ background: "#EAE3D2", margin: 0, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
