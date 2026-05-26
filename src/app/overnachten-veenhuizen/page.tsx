import type { Metadata } from "next";
import { SITE_URL, PRICE_FROM_LABEL } from "@/lib/site";
import { LandingTemplate, landingSchemas, type LandingConfig } from "@/components/LandingTemplate";

const config: LandingConfig = {
  slug: "overnachten-veenhuizen",
  breadcrumb: "Overnachten bij Veenhuizen",
  eyebrow: "Lodge in Zeijen · vlak bij Veenhuizen",
  h1: "Overnachten bij Veenhuizen",
  heroSub:
    "Bezoek het UNESCO-werelderfgoed Veenhuizen en overnacht in een luxe lodge met privé-hottub in het nabijgelegen Zeijen. Cultuur en geschiedenis overdag, rust en natuur 's avonds.",
  heroImage: "/heide3.jpg",
  heroImageAlt:
    "Drents heidelandschap nabij Zeijen, op korte rijafstand van Veenhuizen",
  priceFrom: PRICE_FROM_LABEL,
  intro:
    "Veenhuizen is een van de meest bijzondere plekken van Drenthe: een voormalige kolonie van weldadigheid, nu UNESCO-werelderfgoed, met het Gevangenismuseum als publiekstrekker. Wie hier op bezoek komt, overnacht het mooist in alle rust net buiten het dorp. Huis ter Huynen in Zeijen ligt op korte rijafstand en biedt twee luxe lodges met privé-hottub.",
  sections: [
    {
      eyebrow: "De bestemming",
      heading: "Veenhuizen: werelderfgoed met een verhaal",
      body: [
        "Veenhuizen werd in de negentiende eeuw gesticht als 'kolonie van weldadigheid' en draagt die geschiedenis nog overal met zich mee: statige gestichten, strenge lanen en gebouwen met opschriften die tot nadenken stemmen. Sinds 2021 is het samen met de andere Koloniën van Weldadigheid UNESCO-werelderfgoed.",
        "Het Gevangenismuseum vertelt het verhaal van misdaad en straf door de eeuwen heen en is een aanrader voor jong en oud. Rondom het dorp liggen daarnaast bossen en natuurgebieden die uitnodigen tot een wandeling.",
      ],
    },
    {
      eyebrow: "Wat te doen",
      heading: "Een dag in en rond Veenhuizen",
      body: [
        "Een bezoek aan Veenhuizen combineert u gemakkelijk met de natuur en cultuur van Noord-Drenthe:",
      ],
      bullets: [
        "Het Nationaal Gevangenismuseum in de oude gestichten.",
        "Een wandeling door het historische dorp en langs de kolonielanen.",
        "Het Fochteloërveen, een uitgestrekt hoogveengebied met kraanvogels, vlakbij.",
        "Fietsroutes door de bossen en velden rond Veenhuizen.",
        "Lokale horeca in karakteristieke, historische panden.",
      ],
    },
    {
      eyebrow: "De accommodatie",
      heading: "Luxe overnachten in Zeijen",
      body: [
        "Na een dag vol indrukken keert u terug naar Huis ter Huynen in Zeijen. Twee volledig privé lodges voor maximaal vier personen staan voor u klaar, elk met een eigen hottub op het terras. Lodge De Heide heeft een eigen sauna, Lodge De Eik een buitenkeuken met BBQ — beide met volledige keuken, gratis WiFi en een EV-laadpaal.",
        "De combinatie van een indrukwekkend cultureel uitstapje en een rustige, luxe overnachting in de natuur maakt uw verblijf compleet.",
      ],
    },
    {
      eyebrow: "Praktisch",
      heading: "Centraal in Noord-Drenthe",
      body: [
        "Vanuit Zeijen ligt niet alleen Veenhuizen binnen handbereik, maar ook Assen (20 min), Norg, het Nationaal Park Drentsche Aa en de paarse heide van het Ballooërveld. Een ideale uitvalsbasis om de geschiedenis én de natuur van Drenthe te combineren.",
      ],
    },
  ],
  faq: [
    {
      q: "Hoe ver ligt de lodge van Veenhuizen?",
      a: "Huis ter Huynen ligt in Zeijen, op korte rijafstand van Veenhuizen — ideaal om het Gevangenismuseum en het UNESCO-dorp te bezoeken en daarna in de natuur te overnachten.",
    },
    {
      q: "Is Veenhuizen de moeite waard voor een dagje uit?",
      a: "Zeker. Het Nationaal Gevangenismuseum en het historische, als UNESCO-werelderfgoed erkende dorp zijn boeiend voor zowel volwassenen als kinderen, en goed te combineren met natuur in de omgeving.",
    },
    {
      q: "Hoeveel personen kunnen er overnachten?",
      a: "Elke lodge is geschikt voor maximaal vier personen. Er zijn twee aparte, volledig privé lodges.",
    },
    {
      q: "Kan ik rechtstreeks boeken?",
      a: "Ja, u boekt direct bij Huis ter Huynen via de website of WhatsApp, persoonlijk en zonder tussenpersoon.",
    },
  ],
  related: [
    { label: "Vakantiehuis met hottub Drenthe", href: "/vakantiehuis-met-hottub-drenthe" },
    { label: "Vakantiehuis bij Norg", href: "/vakantiehuis-norg" },
    { label: "Omgeving & activiteiten", href: "/omgeving" },
  ],
  ctaTitle: "Boek uw verblijf bij Veenhuizen",
  ctaBody:
    "De lodges zijn al boekbaar voor 2027. Bekijk de beschikbaarheid of stel uw vraag — wij reageren binnen 24 uur persoonlijk.",
};

export const metadata: Metadata = {
  title: "Overnachten bij Veenhuizen | Luxe Lodge met Hottub in Zeijen",
  description:
    "Overnachten bij Veenhuizen? Bezoek het UNESCO-dorp en Gevangenismuseum en verblijf in een luxe lodge met hottub in Zeijen. Boek direct, vanaf €165 per nacht.",
  alternates: { canonical: `${SITE_URL}/${config.slug}` },
  openGraph: {
    title: "Overnachten bij Veenhuizen – Huis ter Huynen",
    description:
      "Luxe lodge met hottub in Zeijen, op korte afstand van UNESCO-werelderfgoed Veenhuizen.",
    url: `${SITE_URL}/${config.slug}`,
    type: "website",
    images: [{ url: `${SITE_URL}/heide3.jpg`, width: 1200, height: 630, alt: config.heroImageAlt }],
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
