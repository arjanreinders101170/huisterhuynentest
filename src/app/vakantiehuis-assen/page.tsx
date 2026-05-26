import type { Metadata } from "next";
import { SITE_URL, PRICE_FROM_LABEL } from "@/lib/site";
import { LandingTemplate, landingSchemas, type LandingConfig } from "@/components/LandingTemplate";

const config: LandingConfig = {
  slug: "vakantiehuis-assen",
  breadcrumb: "Vakantiehuis bij Assen",
  eyebrow: "Lodge in Zeijen · 20 min van Assen",
  h1: "Vakantiehuis bij Assen",
  heroSub:
    "Een luxe lodge met privé-hottub in het rustige Zeijen, op twintig minuten van Assen. De stad binnen handbereik, de Drentse natuur direct voor de deur.",
  heroImage: "/lodge-heide.jpg",
  heroImageAlt:
    "Luxe lodge op de Drentse heide bij Zeijen, op twintig minuten van Assen",
  priceFrom: PRICE_FROM_LABEL,
  intro:
    "Op zoek naar een vakantiehuis bij Assen? Huis ter Huynen ligt in Zeijen, een van de mooiste brinkdorpen van Drenthe, op slechts twintig minuten van het centrum van Assen. U combineert zo het beste van twee werelden: de rust en natuur van het Drentse platteland, met de stad, het Drents Museum en het TT-circuit op korte afstand.",
  sections: [
    {
      eyebrow: "De ligging",
      heading: "Rust in Zeijen, de stad dichtbij",
      body: [
        "Assen is een prettige, overzichtelijke stad met een rijk cultureel aanbod, maar overnachten doet u het fijnst net buiten de drukte. Vanuit de lodge in Zeijen bent u in twintig minuten in het centrum, terwijl u 's ochtends wakker wordt met uitzicht op heide en bos. Geen parkeerstress, geen stadsgeluiden — wel alle voorzieningen binnen handbereik.",
        "Dat maakt Huis ter Huynen een ideale uitvalsbasis voor wie Assen en omgeving wil ontdekken én echt wil ontspannen. Een privé-hottub op het terras zorgt ervoor dat elke dag eindigt in volledige rust.",
      ],
    },
    {
      eyebrow: "Wat te doen",
      heading: "Assen en omgeving ontdekken",
      body: [
        "Assen biedt voor elk type bezoeker iets. Een greep uit de mogelijkheden vanuit uw vakantiehuis:",
      ],
      bullets: [
        "Drents Museum — internationaal gewaardeerd, met archeologie en kunst.",
        "TT Circuit Assen — de 'Cathedral of Speed', met de TT als hoogtepunt in de zomer.",
        "Het Asserbos en de gezellige binnenstad met terrassen en winkels.",
        "Nationaal Park Drentsche Aa, dat tot vlak bij Assen reikt.",
        "Wellnesscentra en restaurants in en rond de stad.",
      ],
    },
    {
      eyebrow: "De accommodatie",
      heading: "Twee luxe lodges met privé-hottub",
      body: [
        "Huis ter Huynen heeft twee volledig privé lodges voor maximaal vier personen, elk met een eigen hottub op het terras. Lodge De Heide heeft bovendien een eigen sauna; Lodge De Eik een buitenkeuken met BBQ. Beide bieden een volledig uitgeruste keuken, gratis WiFi en een EV-laadpaal op het terrein.",
        "U boekt rechtstreeks, zonder tussenpersoon — persoonlijk geregeld door de gastheer.",
      ],
    },
    {
      eyebrow: "Natuur",
      heading: "De heide begint bij de voordeur",
      body: [
        "Anders dan een hotel in de stad ligt uw vakantiehuis hier midden in de natuur. Wandelroutes starten direct bij de lodge, het Ballooërveld met zijn schaapskudde ligt op twaalf minuten en er lopen meer dan 1.000 km fietspaden door de regio. Overdag de stad of de natuur in, 's avonds terug naar uw eigen stille plek.",
      ],
    },
  ],
  faq: [
    {
      q: "Hoe ver is het vakantiehuis van Assen?",
      a: "Huis ter Huynen ligt in Zeijen, op ongeveer 20 minuten rijden van het centrum van Assen.",
    },
    {
      q: "Is dit een geschikte uitvalsbasis voor de TT Assen?",
      a: "Ja. Het TT Circuit ligt op korte rijafstand, terwijl u in alle rust overnacht buiten de drukte van het evenement. Boek wel ruim op tijd, want het TT-weekend is populair.",
    },
    {
      q: "Hoeveel personen kunnen er verblijven?",
      a: "Elke lodge is geschikt voor maximaal vier personen. Er zijn twee lodges, dus samen tot acht personen in twee aparte accommodaties.",
    },
    {
      q: "Kan ik direct boeken zonder Booking.com?",
      a: "Ja, u boekt rechtstreeks bij Huis ter Huynen via de website of WhatsApp — persoonlijk en zonder commissie van een tussenpartij.",
    },
  ],
  related: [
    { label: "Vakantiehuis met hottub Drenthe", href: "/vakantiehuis-met-hottub-drenthe" },
    { label: "Vakantiehuis bij Norg", href: "/vakantiehuis-norg" },
    { label: "Omgeving & activiteiten", href: "/omgeving" },
  ],
  ctaTitle: "Boek uw vakantiehuis bij Assen",
  ctaBody:
    "De lodges zijn al boekbaar voor 2027. Bekijk de beschikbaarheid of stel uw vraag — wij reageren binnen 24 uur persoonlijk.",
};

export const metadata: Metadata = {
  title: "Vakantiehuis bij Assen | Luxe Lodge met Hottub in Zeijen",
  description:
    "Vakantiehuis bij Assen? Luxe lodge met privé-hottub in Zeijen, 20 min van het centrum en het TT Circuit. Rust, natuur en de stad dichtbij. Vanaf €165 per nacht.",
  alternates: { canonical: `${SITE_URL}/${config.slug}` },
  openGraph: {
    title: "Vakantiehuis bij Assen – Huis ter Huynen",
    description:
      "Luxe lodge met hottub in Zeijen, op 20 minuten van Assen. Natuur voor de deur, stad binnen handbereik.",
    url: `${SITE_URL}/${config.slug}`,
    type: "website",
    images: [{ url: `${SITE_URL}/lodge-heide.jpg`, width: 1200, height: 630, alt: config.heroImageAlt }],
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
