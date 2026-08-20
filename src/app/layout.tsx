import type { Metadata, Viewport } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { ConsentBanner } from "@/components/tracking/ConsentBanner";
import { GTM, GTMNoscript } from "@/components/tracking/GTM";
import { MetaPixel } from "@/components/tracking/MetaPixel";
import { RouteChangePixel } from "@/components/tracking/RouteChangePixel";
import { TrackingListeners } from "@/components/tracking/TrackingListeners";
import { PRICE_FROM_EUR } from "@/lib/site";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-dm-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-playfair",
});

const SITE_URL = "https://www.huisterhuynen.nl";
const OG_IMAGE = `${SITE_URL}/lodge-heide.jpg`;

export const metadata: Metadata = {
  // Merknaam voorop: de merkcluster staat gemiddeld op positie 15,3 — Google heeft
  // "Huis ter Huynen" nog niet als entiteit vastgelegd, en de homepage is de plek
  // om dat te repareren. "Lodge Drenthe" stond er eerst voorop, goed voor 27
  // vertoningen in de hele dataset; "jacuzzi" (754) verving "hottub" (249) en
  // "twee lodges" is de differentiator die geen enkele concurrent kan claimen.
  title: {
    default: "Huis ter Huynen | Twee Lodges met Privé Jacuzzi op de Drentse Heide",
    template: "%s – Huis ter Huynen",
  },
  description:
    "Twee vrijstaande lodges op de Drentse heide bij Zeijen, elk met privé jacuzzi en terras. Geen receptie, geen buren, geen gedeelde wellness. Vanaf €165 per nacht.",
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
  // "index, follow" is het minimum; de rest bepaalt hoe rijk de SERP-snippet
  // mag zijn. Zonder max-image-preview:large houdt Google het bij een
  // duimnageltje of helemaal geen afbeelding — en juist bij Discover en bij
  // de visuele resultaten is die grote preview het verschil in CTR.
  // max-snippet:-1 haalt de limiet van de tekstsnippet eraf, zodat een
  // volledig antwoord uit de pagina getoond mag worden.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: SITE_URL,
    siteName: "Huis ter Huynen",
    title: "Huis ter Huynen | Twee Lodges met Privé Jacuzzi op de Drentse Heide",
    description:
      "Twee vrijstaande lodges op de Drentse heide bij Zeijen, elk met privé jacuzzi en terras. Geen receptie, geen buren, geen gedeelde wellness. Vanaf €165 per nacht.",
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
    title: "Huis ter Huynen | Twee Lodges met Privé Jacuzzi op de Drentse Heide",
    description:
      "Twee vrijstaande lodges op de Drentse heide bij Zeijen, elk met privé jacuzzi en terras. Geen receptie, geen buren, geen gedeelde wellness. Vanaf €165 per nacht.",
    images: [OG_IMAGE],
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      nl: SITE_URL,
      de: `${SITE_URL}/de`,
      "x-default": SITE_URL,
    },
    // Feedlezers en automatiseringen zoeken de feed via deze link in de <head>.
    types: {
      "application/rss+xml": `${SITE_URL}/blog/rss.xml`,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
    streetAddress: "Zuiderstraat 6 p",
    postalCode: "9491 TH",
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
  currenciesAccepted: "EUR",
  // priceRange "€€€" zegt Google niets over de echte prijs; de vanafprijs stond
  // wel in de tekst maar nergens machineleesbaar, wat prijs-rich-results
  // blokkeert. De Offer maakt de vanafprijs per nacht expliciet, met de
  // UnitPriceSpecification voor de eenheid (één nacht, minimaal twee nachten).
  makesOffer: {
    "@type": "Offer",
    name: "Overnachting in een privé lodge met jacuzzi",
    description:
      "Vanafprijs per nacht voor een van beide lodges, bij een verblijf van minimaal twee nachten.",
    price: PRICE_FROM_EUR,
    priceCurrency: "EUR",
    availability: "https://schema.org/InStock",
    url: `${SITE_URL}/#reserveren`,
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: PRICE_FROM_EUR,
      priceCurrency: "EUR",
      minPrice: PRICE_FROM_EUR,
      unitCode: "DAY",
      unitText: "nacht",
      referenceQuantity: {
        "@type": "QuantitativeValue",
        value: 1,
        unitCode: "DAY",
        unitText: "nacht",
      },
      valueAddedTaxIncluded: true,
    },
    eligibleQuantity: {
      "@type": "QuantitativeValue",
      minValue: 2,
      unitCode: "DAY",
      unitText: "nachten",
    },
    seller: { "@type": "LodgingBusiness", name: "Huis ter Huynen", url: SITE_URL },
  },
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
  checkInTime: "T15:00:00",
  checkOutTime: "T11:00:00",
  petsAllowed: true,
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "00:00",
    closes: "23:59",
  },
  hasMap: "https://maps.google.com/?q=Zeijen,Drenthe",
  keywords:
    "lodge Drenthe, vakantiewoning Drenthe, hottub Drenthe, chalet Drenthe, romantisch weekend, wandelen heide, fietsen Drenthe, Assen vakantie",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${dmSans.variable} ${playfair.variable}`}>
      <head>
        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* LCP hero preload — ensures fetchpriority=high reaches the browser early */}
        {/* eslint-disable-next-line @next/next/no-head-element */}
        <link
          rel="preload"
          as="image"
          href="/_next/image?url=%2Flodge-heide.jpg&w=828&q=45"
        />

        {/* Tracking — preconnect saves ~150ms TLS handshake on first event */}
        <link rel="preconnect" href="https://connect.facebook.net" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />

        {/* Geo */}
        <meta name="geo.region" content="NL-DR" />
        <meta name="geo.placename" content="Zeijen, Drenthe" />
        <meta name="geo.position" content="53.0167;6.5667" />
        <meta name="ICBM" content="53.0167, 6.5667" />

        {/* PWA — iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Huynen" />
        <link rel="apple-touch-icon" href="/icon-192.png" />

        {/* GTM — Consent Mode v2 default-deny + loader */}
        <GTM />
      </head>
      <body style={{ background: "#EAE3D2", margin: 0, fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}>
        <GTMNoscript />
        <MetaPixel />
        <RouteChangePixel />
        <TrackingListeners />
        {children}
        <StickyMobileCTA />
        <ConsentBanner />
      </body>
    </html>
  );
}
