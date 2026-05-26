import type { Metadata } from "next";
import { SITE_URL, PRICE_FROM_LABEL } from "@/lib/site";
import { LandingTemplate, landingSchemas, type LandingConfig } from "@/components/LandingTemplate";

const config: LandingConfig = {
  slug: "romantisch-weekend-weg-drenthe",
  breadcrumb: "Romantisch weekend weg Drenthe",
  eyebrow: "Voor koppels · Zeijen · Drenthe",
  h1: "Romantisch weekend weg in Drenthe",
  heroSub:
    "Geen agenda, geen drukte — alleen jullie samen, de heide voor de deur en een privé-hottub onder de sterren. Een romantisch weekend in Drenthe op zijn mooist.",
  heroImage: "/heide1.jpg",
  heroImageAlt:
    "Paarse bloeiende heide bij zonsondergang in Drenthe, ideaal decor voor een romantisch weekend weg",
  priceFrom: PRICE_FROM_LABEL,
  intro:
    "Een romantisch weekend weg draait om tijd voor elkaar, zonder afleiding. Drenthe is daar als geen ander op gemaakt: de stilste provincie van Nederland, met eindeloze natuur en weinig toeristen. Bij Huis ter Huynen verblijft u in een volledig privé lodge met eigen hottub — de ideale plek om samen volledig af te schakelen.",
  sections: [
    {
      eyebrow: "Waarom Drenthe",
      heading: "De rust die een romantisch weekend nodig heeft",
      body: [
        "Romantiek heeft ruimte en rust nodig. Drenthe biedt allebei in overvloed: geen files, geen massa's, wel uitgestrekte heide, oude strubbenbossen en het kronkelende beekdal van de Drentsche Aa. Hier hoort u 's ochtends alleen vogels en 's avonds niets dan de wind. Precies die stilte maakt een weekend met z'n tweeën zo bijzonder.",
        "En toch hoeft u niets te missen: een goed restaurant, een wellnessdag of een cultureel uitje in Assen zijn allemaal binnen handbereik. U kiest zelf of u de lodge nauwelijks verlaat of er juist op uittrekt.",
      ],
    },
    {
      eyebrow: "Ideeën",
      heading: "Zo maakt u het weekend onvergetelijk",
      body: [
        "Een romantisch weekend in Drenthe is wat u er samen van maakt. Een paar ideeën die het verblijf compleet maken:",
      ],
      bullets: [
        "Zonsondergang op de heide, gevolgd door de hottub onder de sterrenhemel.",
        "Een kaarsdiner op uw eigen terras, met streekproducten uit de regio.",
        "Samen fietsen door de esdorpen richting Norg en de Drentsche Aa.",
        "Een wellnessdag in de omgeving en daarna ontspannen in uw eigen sauna (Lodge De Heide).",
        "Een doe-niets-dag: ochtendkoffie in bad, een boek en geen enkele verplichting.",
      ],
    },
    {
      eyebrow: "De accommodatie",
      heading: "Een privé lodge met hottub voor twee",
      body: [
        "Beide lodges zijn volledig privé en perfect voor een koppel: een eigen terras, een privé-hottub op 38 °C en een sfeervol interieur waarin u zich meteen thuis voelt. Geen receptie, geen mede-gasten — alleen jullie samen.",
        "Vier u een jubileum, verjaardag of gewoon elkaar? Laat het ons weten bij de boeking, dan zorgen we waar mogelijk voor een persoonlijk welkom.",
      ],
    },
    {
      eyebrow: "Praktisch",
      heading: "Ideaal te combineren met de rest van Drenthe",
      body: [
        "Huis ter Huynen ligt in Zeijen, op twintig minuten van Assen en een kwartier van het Nationaal Park Drentsche Aa. Daardoor combineert u rust met bereikbaarheid: een romantisch diner, een museumbezoek of een wellnessmiddag zijn zo geregeld, en daarna keert u terug naar uw eigen stille plek op de heide.",
      ],
    },
  ],
  faq: [
    {
      q: "Is de lodge geschikt voor een romantisch weekend met z'n tweeën?",
      a: "Zeker. Beide lodges zijn volledig privé, met een eigen hottub op het terras en een sfeervol interieur — ideaal voor koppels die rust en privacy zoeken.",
    },
    {
      q: "Wanneer is de mooiste tijd voor een romantisch weekend in Drenthe?",
      a: "Elk seizoen heeft zijn charme: de paarse heide in augustus en september, de herfstkleuren in oktober, of juist de stille, besneeuwde winter waarin de hottub op zijn mooist is.",
    },
    {
      q: "Kunnen we een bijzondere gelegenheid vieren?",
      a: "Ja, vermeld het bij uw boeking. Waar mogelijk verzorgen we een persoonlijk welkom om jullie verjaardag, jubileum of verrassing extra bijzonder te maken.",
    },
    {
      q: "Hoe boeken we het romantisch weekend?",
      a: "U boekt rechtstreeks bij Huis ter Huynen via de website of WhatsApp. Wij reageren binnen 24 uur met een persoonlijk voorstel — zonder tussenpersoon.",
    },
  ],
  related: [
    { label: "Vakantiehuis met hottub Drenthe", href: "/vakantiehuis-met-hottub-drenthe" },
    { label: "Luxe lodge in Drenthe", href: "/luxe-lodge-drenthe" },
    { label: "Wat te doen in de omgeving", href: "/omgeving" },
  ],
  ctaTitle: "Plan jullie romantisch weekend in Drenthe",
  ctaBody:
    "De lodges zijn al boekbaar voor 2027. Bekijk de beschikbaarheid of stel jullie vraag — wij reageren binnen 24 uur persoonlijk.",
};

export const metadata: Metadata = {
  title: "Romantisch Weekend Weg in Drenthe | Privé Lodge met Hottub",
  description:
    "Romantisch weekend weg in Drenthe? Verblijf in een privé lodge met hottub op de heide bij Zeijen. Rust, natuur en privacy voor koppels. Boek direct, 20 min van Assen.",
  alternates: { canonical: `${SITE_URL}/${config.slug}` },
  openGraph: {
    title: "Romantisch Weekend Weg in Drenthe – Huis ter Huynen",
    description:
      "Een privé lodge met hottub op de Drentse heide. Ideaal voor een romantisch weekend met z'n tweeën.",
    url: `${SITE_URL}/${config.slug}`,
    type: "website",
    images: [{ url: `${SITE_URL}/heide1.jpg`, width: 1200, height: 630, alt: config.heroImageAlt }],
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
