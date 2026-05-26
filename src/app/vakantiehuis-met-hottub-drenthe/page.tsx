import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { LandingTemplate, landingSchemas, type LandingConfig } from "@/components/LandingTemplate";

const config: LandingConfig = {
  slug: "vakantiehuis-met-hottub-drenthe",
  breadcrumb: "Vakantiehuis met hottub Drenthe",
  eyebrow: "Privé hottub · Zeijen · Drenthe",
  h1: "Vakantiehuis met privé-hottub in Drenthe",
  heroSub:
    "Twee luxe lodges op de Drentse heide bij Zeijen, elk met een eigen hottub op het terras. Wandel vanuit de deur de natuur in en keer terug naar warm, bruisend water onder de sterren.",
  heroImage: "/lodge-heide.jpg",
  heroImageAlt:
    "Vakantiehuis met privé-hottub op het terras van Lodge De Heide, omgeven door de Drentse heide in Zeijen",
  intro:
    "Een vakantiehuis met hottub in Drenthe is meer dan een extraatje — het is het moment waarop een weekend echt tot rust komt. Bij Huis ter Huynen heeft elke lodge een eigen privé-hottub, volledig afgeschermd en het hele jaar door op temperatuur. Geen gedeelde wellness, geen buren: alleen u, het bruisende water en het uitzicht over heide en bos.",
  sections: [
    {
      eyebrow: "De ervaring",
      heading: "Een privé-hottub onder de Drentse sterren",
      body: [
        "Stel u voor: na een dag wandelen over het Ballooërveld of fietsen langs de Drentsche Aa stapt u in uw eigen hottub. Het water is 38 °C, de lucht ruikt naar dennen en in de verte zoemen de laatste bijen boven de heide. Drenthe is de stilste provincie van Nederland — en juist die stilte maakt een privé-hottub hier zo bijzonder.",
        "Beide lodges hebben hun hottub op een afgeschermd terras met uitzicht op de natuur. Overdag een verfrissende duik na het sporten, 's avonds een glas wijn met zicht op de sterrenhemel. Omdat Drenthe nauwelijks lichtvervuiling kent, ziet u hier meer sterren dan vrijwel waar dan ook in het land.",
      ],
    },
    {
      eyebrow: "De accommodaties",
      heading: "Twee lodges, elk met eigen hottub",
      body: [
        "Huis ter Huynen telt twee volledig privé lodges voor maximaal vier personen. Beide zijn ingericht met oog voor comfort, met een volledig uitgeruste keuken, fijne bedden en een eigen buitenruimte met hottub.",
      ],
      bullets: [
        "Lodge De Heide — luxe lodge met sauna, privé-hottub en panoramisch uitzicht over het bos.",
        "Lodge De Eik — ruime lodge onder de eiken met buitenkeuken, BBQ en eigen hottub.",
        "Beide: gratis WiFi, EV-laadpaal op het terrein en volledige privacy.",
        "Honden zijn in overleg welkom, zodat ook uw viervoeter mee kan op pad.",
      ],
    },
    {
      eyebrow: "Waarom hier",
      heading: "Wat een vakantiehuis met hottub écht ontspannend maakt",
      body: [
        "Een hottub is pas echt ontspannend als hij privé is. Geen wachttijden, geen onbekenden, geen openingstijden — u bepaalt zelf wanneer u erin gaat. Daarom kiezen koppels en kleine gezelschappen die rust zoeken steeds vaker voor een vrijstaand vakantiehuis met eigen hottub in plaats van een hotel met wellnessafdeling.",
        "De combinatie van warm water, natuur en stilte werkt aantoonbaar herstellend. Het is de ideale uitvalsbasis voor een romantisch weekend, een verjaardag of gewoon een paar dagen volledig afschakelen — op nog geen 20 minuten van Assen, maar gevoelsmatig mijlenver van de drukte.",
      ],
    },
    {
      eyebrow: "De omgeving",
      heading: "Heide, bos en beekdal vanuit de deur",
      body: [
        "Vanuit de lodge wandelt u zo de Zeijerstrubben en het Zeijerwiek in. Het Nationaal Park Drentsche Aa ligt op een kwartier, het Ballooërveld met zijn schaapskudde op twaalf minuten en er lopen meer dan 1.000 km fietspaden door de omgeving. Eerst de natuur in, daarna de hottub — dat is het ritme van een verblijf bij Huis ter Huynen.",
      ],
    },
  ],
  faq: [
    {
      q: "Heeft elke lodge een eigen privé-hottub?",
      a: "Ja. Zowel Lodge De Heide als Lodge De Eik heeft een eigen, afgeschermde hottub op het terras. U deelt hem met niemand buiten uw eigen gezelschap.",
    },
    {
      q: "Is de hottub het hele jaar door beschikbaar?",
      a: "Ja, de hottub is 24/7 beschikbaar en staat standaard ingesteld op 38 °C — ook in de winter, wanneer een hottub in de besneeuwde natuur op zijn allermooist is.",
    },
    {
      q: "Voor hoeveel personen is het vakantiehuis geschikt?",
      a: "Elke lodge is geschikt voor maximaal vier personen. Ideaal voor koppels, een klein gezin of twee stellen die samen weg willen.",
    },
    {
      q: "Hoe ver ligt het vakantiehuis van Assen?",
      a: "Huis ter Huynen ligt in Zeijen, op ongeveer 20 minuten rijden van Assen en op een kwartier van het Nationaal Park Drentsche Aa.",
    },
  ],
  related: [
    { label: "Luxe lodge in Drenthe", href: "/luxe-lodge-drenthe" },
    { label: "Romantisch weekend weg Drenthe", href: "/romantisch-weekend-weg-drenthe" },
    { label: "Fietsen & wandelen in de omgeving", href: "/omgeving" },
  ],
  ctaTitle: "Boek uw vakantiehuis met hottub in Drenthe",
  ctaBody:
    "De lodges zijn al boekbaar voor 2027. Bekijk de beschikbare data of stel uw vraag rechtstreeks — wij reageren binnen 24 uur persoonlijk.",
};

export const metadata: Metadata = {
  title: "Vakantiehuis met Hottub in Drenthe | Privé Lodge bij Zeijen",
  description:
    "Luxe vakantiehuis met privé-hottub in Drenthe. Twee lodges op de heide bij Zeijen, 20 min van Assen. Eigen hottub 24/7, wandelen & fietsen vanuit de deur.",
  alternates: { canonical: `${SITE_URL}/${config.slug}` },
  openGraph: {
    title: "Vakantiehuis met Hottub in Drenthe – Huis ter Huynen",
    description:
      "Twee luxe lodges met privé-hottub op de Drentse heide bij Zeijen. Boek direct, zonder tussenpersoon.",
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
