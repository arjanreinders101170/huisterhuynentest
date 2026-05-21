import type { Metadata } from "next";

const SITE_URL = "https://www.huisterhuynen.nl";

export const metadata: Metadata = {
  title: "Fietsen & Wandelen in Drenthe — Omgeving Zeijen",
  description:
    "Ontdek de mooiste fietsroutes en wandelroutes in Drenthe vanuit Huis ter Huynen in Zeijen. 1.000+ km fietspaden, knooppuntennet en Nationaal Park Drentsche Aa op 15 minuten.",
  keywords: [
    "fietsvakantie Drenthe",
    "fietsen Drenthe",
    "fietsroutes Drenthe",
    "knooppuntennet Drenthe",
    "wandelen Drenthe",
    "wandelroutes Drenthe",
    "activiteiten Drenthe",
    "Nationaal Park Drentsche Aa",
    "Hondsrug fietsroute",
    "fietsen Zeijen",
    "Drenthe natuur",
    "hunebedenroute Drenthe",
  ],
  alternates: {
    canonical: `${SITE_URL}/omgeving`,
  },
  openGraph: {
    title: "Fietsen & Wandelen in Drenthe — Omgeving Huis ter Huynen",
    description:
      "Fietsroutes, wandelroutes en activiteiten rondom Zeijen. Stap buiten en het Drentse landschap ligt voor u.",
    url: `${SITE_URL}/omgeving`,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/wandel_drenthe.jpg`,
        width: 1200,
        height: 630,
        alt: "Wandel- en fietspaden door de Drentse heide rondom Zeijen",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fietsen & Wandelen in Drenthe — Huis ter Huynen",
    description:
      "1.000+ km fietspaden en wandelroutes direct voor de deur in Zeijen, Drenthe.",
    images: [`${SITE_URL}/wandel_drenthe.jpg`],
  },
};

const schemas = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Omgeving & Activiteiten", item: `${SITE_URL}/omgeving` },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Fietsroutes in Drenthe vanuit Zeijen",
    description:
      "De mooiste fietsroutes in Drenthe, te starten vanuit of dichtbij Huis ter Huynen in Zeijen.",
    numberOfItems: 6,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        item: {
          "@type": "TouristAttraction",
          name: "Norgeroute vanuit Zeijen",
          description: "18 km makkelijke fietsroute direct vanuit de lodge door het Drentse esdorpenlandschap.",
          address: { "@type": "PostalAddress", addressLocality: "Zeijen", addressRegion: "Drenthe", addressCountry: "NL" },
        },
      },
      {
        "@type": "ListItem",
        position: 2,
        item: {
          "@type": "TouristAttraction",
          name: "Hondsrug Fietsroute",
          description: "45 km fietsroute over de stuwwal van de Hondsrug — bos, heide en esdorpen.",
          address: { "@type": "PostalAddress", addressRegion: "Drenthe", addressCountry: "NL" },
        },
      },
      {
        "@type": "ListItem",
        position: 3,
        item: {
          "@type": "TouristAttraction",
          name: "Hunebedenroute",
          description: "55 km fietsroute langs de bekendste hunebedden van Drenthe, van Zeijen tot Borger.",
          address: { "@type": "PostalAddress", addressRegion: "Drenthe", addressCountry: "NL" },
        },
      },
      {
        "@type": "ListItem",
        position: 4,
        item: {
          "@type": "TouristAttraction",
          name: "Drentsche Aa Route",
          description: "35 km natuurfietsroute langs het Nationaal Park Drentsche Aa.",
          address: { "@type": "PostalAddress", addressRegion: "Drenthe", addressCountry: "NL" },
        },
      },
      {
        "@type": "ListItem",
        position: 5,
        item: {
          "@type": "TouristAttraction",
          name: "Esdorpenroute Grolloo–Rolde",
          description: "25 km culturele fietsroute langs de meest authentieke esdorpen van Drenthe.",
          address: { "@type": "PostalAddress", addressRegion: "Drenthe", addressCountry: "NL" },
        },
      },
      {
        "@type": "ListItem",
        position: 6,
        item: {
          "@type": "TouristAttraction",
          name: "MTB Zeijerwiek",
          description: "15 km mountainbikeroute door het bosgebied van het Zeijerwiek.",
          address: { "@type": "PostalAddress", addressLocality: "Zeijen", addressRegion: "Drenthe", addressCountry: "NL" },
        },
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is Drenthe geschikt voor een fietsvakantie?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Zeker. Drenthe heeft meer dan 1.000 km aan gemarkeerde fietspaden en een uitgebreid knooppuntennet waarmee u zelf routes kunt samenstellen. Het landschap is vlak tot licht heuvelachtig, ideaal voor elk niveau.",
        },
      },
      {
        "@type": "Question",
        name: "Kan ik mijn fiets meenemen naar de lodge?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ja, u kunt uw eigen fiets meenemen. Er is overdekte stallingmogelijkheid op het terrein van Huis ter Huynen.",
        },
      },
      {
        "@type": "Question",
        name: "Zijn er e-bikes te huur in de omgeving van Zeijen?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Ja, in Assen (20 min) zijn meerdere fietsverhuurbedrijven waar u (e-)bikes kunt huren. Bezorging op locatie is op aanvraag mogelijk.",
        },
      },
      {
        "@type": "Question",
        name: "Welke wandelroutes starten direct bij de lodge?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "De Veentjesroute Zeijen (7,5 km) start direct bij de lodge. Ook het Zeijerwiek en de Zeijerstrubben liggen op loopafstand. Er zijn 13+ gemarkeerde routes binnen 15 minuten.",
        },
      },
      {
        "@type": "Question",
        name: "Hoe ver is Huis ter Huynen van Nationaal Park Drentsche Aa?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Het Nationaal Park Drentsche Aa grenst bijna aan Zeijen. Op de fiets bent u er in 10–15 minuten.",
        },
      },
    ],
  },
];

export default function OmgevingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      {children}
    </>
  );
}
