import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Huis ter Huynen | Luxe Boutique Lodges met Hottub in Drenthe",
  description: "Verblijf in een van de twee privé lodges van Huis ter Huynen in Zeijen, Drenthe. Volledig privé, eigen hottub, direct aan wandelroutes. Ideaal voor een romantisch of gezinsweekend midden in de natuur.",
  manifest: "/manifest.json",
  openGraph: {
    title: "Huis ter Huynen | Luxe Boutique Lodges in Drenthe",
    description: "Twee unieke privé lodges met hottub midden in het Drentse landschap. Wandel vanuit de deur, geniet van heide en bos.",
    url: "https://www.huisterhuynen.nl",
    siteName: "Huis ter Huynen",
    images: [
      {
        url: "https://www.huisterhuynen.nl/heide1.jpg",
        width: 1200,
        height: 630,
        alt: "Huis ter Huynen — Boutique Lodges Zeijen Drenthe",
      },
    ],
    locale: "nl_NL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Huis ter Huynen | Luxe Lodges met Hottub in Drenthe",
    description: "Twee unieke privé lodges met hottub midden in het Drentse landschap.",
    images: ["https://www.huisterhuynen.nl/heide1.jpg"],
  },
  alternates: {
    canonical: "https://www.huisterhuynen.nl",
  },
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
  "name": "Huis ter Huynen",
  "description": "Twee unieke boutique lodges met privé-hottub midden in het Drentse landschap. Volledig privé, direct aan wandelroutes.",
  "url": "https://www.huisterhuynen.nl",
  "telephone": "+31642568603",
  "email": "lodge@huisterhuynen.nl",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Zuiderstraat 6",
    "addressLocality": "Zeijen",
    "postalCode": "9491 EC",
    "addressRegion": "Drenthe",
    "addressCountry": "NL",
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 53.0501366,
    "longitude": 6.5169678,
  },
  "image": "https://www.huisterhuynen.nl/heide1.jpg",
  "priceRange": "€€€",
  "amenityFeature": [
    { "@type": "LocationFeatureSpecification", "name": "Privé hottub", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "EV laadpaal", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Volledige privacy", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Gratis parkeren", "value": true },
  ],
  "containsPlace": [
    {
      "@type": "LodgingBusiness",
      "name": "Lodge De Eik",
      "description": "Sfeervolle lodge voor vier personen met privé-hottub, omgeven door eeuwenoude eiken.",
      "occupancy": { "@type": "QuantitativeValue", "maxValue": 4 },
    },
    {
      "@type": "LodgingBusiness",
      "name": "Lodge De Heide",
      "description": "Ruime lodge voor vier personen met privé-hottub en uitzicht over de Drentse heide.",
      "occupancy": { "@type": "QuantitativeValue", "maxValue": 4 },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <head>
        {/* PWA — iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Huynen" />
        <link rel="apple-touch-icon" href="/icon-192.png" />

        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body style={{ background: "#EAE3D2", margin: 0, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
