import type { Metadata } from "next";
import { SITE_URL, PRICE_FROM_LABEL } from "@/lib/site";
import { LandingTemplate, landingSchemas, type LandingConfig } from "@/components/LandingTemplate";

const config: LandingConfig = {
  slug: "vakantiehuis-norg",
  breadcrumb: "Vakantiehuis bij Norg",
  eyebrow: "Lodge in Zeijen · vlak bij Norg",
  h1: "Vakantiehuis bij Norg",
  heroSub:
    "Een luxe lodge met privé-hottub in Zeijen, op een steenworp van het brinkdorp Norg. Bos, heide en stille fietspaden beginnen direct voor de deur.",
  heroImage: "/wandel_drenthe.jpg",
  heroImageAlt:
    "Wandel- en fietspad door de Drentse natuur tussen Zeijen en Norg",
  priceFrom: PRICE_FROM_LABEL,
  intro:
    "Wie een vakantiehuis bij Norg zoekt, zoekt rust, bos en authentiek Drenthe. Huis ter Huynen ligt in het naburige Zeijen, op slechts een paar minuten van Norg, midden in een van de mooiste gebieden van de provincie. Twee privé lodges met eigen hottub vormen de perfecte uitvalsbasis voor wie de natuur rond Norg wil ontdekken.",
  sections: [
    {
      eyebrow: "De ligging",
      heading: "Tussen Zeijen en Norg, midden in het groen",
      body: [
        "Norg is een sfeervol brinkdorp met een rijke geschiedenis, gezellige terrassen rond de brink en uitgestrekte bos- en heidegebieden eromheen. Vanuit de lodge in Zeijen fietst u er zo naartoe — de Norgeroute van 18 km start letterlijk bij de voordeur en voert door esdorpen en stille zandpaden richting Norg.",
        "Het gebied staat bekend om zijn rust en ruimte. U logeert hier net buiten de bekende toeristische drukte, met natuur die nog echt van uzelf voelt.",
      ],
    },
    {
      eyebrow: "Wat te doen",
      heading: "Natuur en dorpsleven rond Norg",
      body: [
        "Rond Norg is van alles te beleven voor wie van buiten zijn houdt:",
      ],
      bullets: [
        "De Norgeroute (18 km) — fietsen door esdorpen, direct vanaf de lodge.",
        "Het Norgerholt, een van de oudste eikenbossen van Nederland.",
        "Uitgestrekte heidevelden, waaronder het Oosterveld.",
        "De gezellige brink van Norg met terrassen en restaurants.",
        "Wandelroutes door bos en over de heide voor elk niveau.",
      ],
    },
    {
      eyebrow: "De accommodatie",
      heading: "Twee privé lodges met hottub",
      body: [
        "Huis ter Huynen biedt twee volledig privé lodges voor maximaal vier personen, elk met een eigen hottub op het terras. Lodge De Heide heeft een eigen sauna, Lodge De Eik een buitenkeuken met BBQ. Beide zijn voorzien van een volledige keuken, gratis WiFi en een EV-laadpaal.",
        "Na een dag fietsen of wandelen rond Norg keert u terug naar uw eigen stille plek — en de hottub staat klaar.",
      ],
    },
    {
      eyebrow: "Praktisch",
      heading: "Rustig gelegen, toch centraal",
      body: [
        "Naast Norg liggen ook Assen (20 min), het Nationaal Park Drentsche Aa (15 min) en het Ballooërveld (12 min) binnen handbereik. U zit dus afgelegen genoeg voor volledige rust, maar centraal genoeg om heel Noord-Drenthe te ontdekken.",
      ],
    },
  ],
  faq: [
    {
      q: "Hoe ver ligt het vakantiehuis van Norg?",
      a: "Huis ter Huynen ligt in Zeijen, op enkele minuten rijden en een korte fietstocht van Norg. De Norgeroute start direct bij de lodge.",
    },
    {
      q: "Is de omgeving geschikt voor fietsen en wandelen?",
      a: "Zeker. Rond Norg en Zeijen liggen talloze fiets- en wandelroutes, waaronder de Norgeroute en routes door het Norgerholt en de heidevelden. Er lopen meer dan 1.000 km fietspaden door de regio.",
    },
    {
      q: "Voor hoeveel personen is de lodge geschikt?",
      a: "Elke lodge biedt plaats aan maximaal vier personen. Er zijn twee aparte lodges beschikbaar.",
    },
    {
      q: "Kan ik direct en zonder tussenpersoon boeken?",
      a: "Ja, u boekt rechtstreeks bij Huis ter Huynen via de website of WhatsApp, persoonlijk en zonder commissie.",
    },
  ],
  related: [
    { label: "Vakantiehuis met hottub Drenthe", href: "/vakantiehuis-met-hottub-drenthe" },
    { label: "Vakantiehuis bij Assen", href: "/vakantiehuis-assen" },
    { label: "Fietsen & wandelen in de omgeving", href: "/omgeving" },
  ],
  ctaTitle: "Boek uw vakantiehuis bij Norg",
  ctaBody:
    "De lodges zijn al boekbaar voor 2027. Bekijk de beschikbaarheid of stel uw vraag — wij reageren binnen 24 uur persoonlijk.",
};

export const metadata: Metadata = {
  title: "Vakantiehuis bij Norg | Luxe Lodge met Hottub in Zeijen",
  description:
    "Vakantiehuis bij Norg? Luxe lodge met privé-hottub in Zeijen, vlak bij Norg. Bos, heide en fietsroutes voor de deur. Boek direct, vanaf €165 per nacht.",
  alternates: { canonical: `${SITE_URL}/${config.slug}` },
  openGraph: {
    title: "Vakantiehuis bij Norg – Huis ter Huynen",
    description:
      "Luxe lodge met hottub in Zeijen, vlak bij Norg. Bos en heide direct voor de deur.",
    url: `${SITE_URL}/${config.slug}`,
    type: "website",
    images: [{ url: `${SITE_URL}/wandel_drenthe.jpg`, width: 1200, height: 630, alt: config.heroImageAlt }],
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
