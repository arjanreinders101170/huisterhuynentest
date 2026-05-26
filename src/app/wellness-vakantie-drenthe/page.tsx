import type { Metadata } from "next";
import { SITE_URL, PRICE_FROM_LABEL } from "@/lib/site";
import { LandingTemplate, landingSchemas, type LandingConfig } from "@/components/LandingTemplate";

const config: LandingConfig = {
  slug: "wellness-vakantie-drenthe",
  breadcrumb: "Wellness vakantie Drenthe",
  eyebrow: "Wellness & rust · Zeijen · Drenthe",
  h1: "Wellness vakantie in Drenthe",
  heroSub:
    "Een privé-hottub op het terras, een eigen sauna en de stilste natuur van Nederland om u heen. Bij Huis ter Huynen is wellness geen afdeling, maar de hele ervaring.",
  heroImage: "/welness_drenthe.jpg",
  heroImageAlt:
    "Buitensauna en wellness in een bosrijke omgeving in Drenthe, bij Huis ter Huynen in Zeijen",
  priceFrom: PRICE_FROM_LABEL,
  intro:
    "Een wellness vakantie in Drenthe gaat verder dan een uurtje sauna. Hier is de natuur zelf de bron van rust: stilteregio's, eindeloze heide en bossen waar u niemand tegenkomt. Bij Huis ter Huynen combineert u die rust met echte luxe — een privé-hottub, een eigen sauna in Lodge De Heide en alle comfort om volledig tot uzelf te komen.",
  sections: [
    {
      eyebrow: "Het idee",
      heading: "Natuur als medicijn, comfort als basis",
      body: [
        "Onderzoek laat keer op keer zien dat tijd in een stille, groene omgeving stress meetbaar verlaagt. Drenthe is daar de ideale plek voor: het is officieel de stilste provincie van Nederland, met beschermde stilteregio's en weinig lichtvervuiling. Een wandeling door de Zeijerstrubben of langs de Drentsche Aa doet wat geen behandeling kan.",
        "Bij Huis ter Huynen voegt u daar het comfort aan toe dat een wellness vakantie compleet maakt: warm, bruisend water in uw privé-hottub, een sauna die alleen van u is, en een lodge waar u zich meteen ontspant. Geen gedeelde ruimtes, geen drukte — wellness op uw eigen tempo.",
      ],
    },
    {
      eyebrow: "Wat u krijgt",
      heading: "Privé-wellness in uw eigen lodge",
      body: [
        "U hoeft de deur niet uit voor uw wellnessmoment. Beide lodges hebben een eigen hottub; Lodge De Heide heeft daarnaast een privé-sauna.",
      ],
      bullets: [
        "Privé-hottub op het terras, 24/7 beschikbaar op 38 °C.",
        "Eigen sauna in Lodge De Heide — geen reservering, geen mede-gasten.",
        "Volledige privacy: uw terras kijkt uit op natuur, niet op buren.",
        "Wandel- en fietsroutes vanuit de deur voor 'forest bathing' en beweging.",
        "Wellnesscentra en spa's in de regio (Assen, Hof van Saksen) voor een dag extra verwennerij.",
      ],
    },
    {
      eyebrow: "Een dag",
      heading: "Zo ziet een wellnessdag eruit",
      body: [
        "Begin de dag met een stille ochtendwandeling over de heide, als de dauw er nog ligt. Terug bij de lodge een uitgebreid ontbijt op het terras, daarna de sauna in. 's Middags een fietstocht door de esdorpen of een bezoek aan een wellnesscentrum in de buurt. En als de avond valt: de hottub in, met zicht op een sterrenhemel die u in de stad nooit ziet.",
        "Dat ritme — bewegen, opwarmen, afkoelen, niets moeten — is precies waarvoor een wellness vakantie bedoeld is. In Drenthe komt het vanzelf.",
      ],
    },
    {
      eyebrow: "De omgeving",
      heading: "Stilte, heide en water binnen handbereik",
      body: [
        "Het Nationaal Park Drentsche Aa ligt op een kwartier, het Ballooërveld met zijn paarse heide vlakbij en Assen — met wellnesscentra, restaurants en het Drents Museum — op twintig minuten. U bepaalt zelf hoeveel u onderneemt en hoeveel u gewoon stil zit.",
      ],
    },
  ],
  faq: [
    {
      q: "Heeft de lodge een eigen sauna?",
      a: "Lodge De Heide beschikt over een eigen privé-sauna. Beide lodges hebben een privé-hottub op het terras, 24/7 beschikbaar.",
    },
    {
      q: "Is dit geschikt voor een wellnessweekend met z'n tweeën?",
      a: "Zeker. De lodges zijn volledig privé en ideaal voor koppels die rust en verwennerij zoeken, zonder de drukte van een groot wellnessresort.",
    },
    {
      q: "Zijn er ook wellnesscentra in de omgeving?",
      a: "Ja. In Assen (20 min) en de wijdere regio vindt u verschillende wellnesscentra en spa's, zoals Spa Hof van Saksen, voor een dag extra verwennerij.",
    },
    {
      q: "Wat is de beste periode voor een wellness vakantie in Drenthe?",
      a: "Elk seizoen werkt: de paarse heide in de nazomer, de herfstkleuren, of juist de winter, wanneer de hottub in de besneeuwde stilte op zijn mooist is.",
    },
  ],
  related: [
    { label: "Vakantiehuis met hottub Drenthe", href: "/vakantiehuis-met-hottub-drenthe" },
    { label: "Luxe lodge in Drenthe", href: "/luxe-lodge-drenthe" },
    { label: "Romantisch weekend weg Drenthe", href: "/romantisch-weekend-weg-drenthe" },
  ],
  ctaTitle: "Boek uw wellness vakantie in Drenthe",
  ctaBody:
    "De lodges zijn al boekbaar voor 2027. Bekijk de beschikbaarheid of stel uw vraag — wij reageren binnen 24 uur persoonlijk.",
};

export const metadata: Metadata = {
  title: "Wellness Vakantie in Drenthe | Lodge met Hottub & Sauna",
  description:
    "Wellness vakantie in Drenthe: privé lodge met eigen hottub en sauna op de heide bij Zeijen. Stilte, natuur en comfort, 20 min van Assen. Vanaf €165 per nacht.",
  alternates: { canonical: `${SITE_URL}/${config.slug}` },
  openGraph: {
    title: "Wellness Vakantie in Drenthe – Huis ter Huynen",
    description:
      "Privé lodge met hottub en sauna op de Drentse heide. Wellness in de stilste natuur van Nederland.",
    url: `${SITE_URL}/${config.slug}`,
    type: "website",
    images: [{ url: `${SITE_URL}/welness_drenthe.jpg`, width: 1200, height: 630, alt: config.heroImageAlt }],
  },
};

export default function Page() {
  const schemas = landingSchemas(config);
  return (
    <>
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <LandingTemplate config={config} />
    </>
  );
}
