import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { LandingTemplate, landingSchemas, type LandingConfig } from "@/components/LandingTemplate";

const config: LandingConfig = {
  slug: "luxe-lodge-drenthe",
  breadcrumb: "Luxe lodge Drenthe",
  eyebrow: "Boutique lodge · Zeijen · Drenthe",
  h1: "Luxe lodge in Drenthe",
  heroSub:
    "Twee boutique lodges midden in de Drentse natuur. Stijlvol ingericht, volledig privé en voorzien van sauna, hottub en alle comfort voor een verblijf dat klopt tot in het detail.",
  heroImage: "/lodge-eik.jpg",
  heroImageAlt:
    "Luxe lodge De Eik onder de eiken bij Zeijen in Drenthe, met buitenkeuken en eigen terras",
  intro:
    "Een luxe lodge in Drenthe draait niet om overdaad, maar om de juiste dingen perfect voor elkaar hebben: een goed bed, warme materialen, echte privacy en de natuur die direct buiten begint. Huis ter Huynen biedt twee zorgvuldig ingerichte lodges op de heide bij Zeijen — geen hotel, maar een eigen plek waar u zich meteen thuis voelt.",
  sections: [
    {
      eyebrow: "Positionering",
      heading: "Luxe is rust, ruimte en privacy",
      body: [
        "Bij echte luxe gaat het niet om hoeveel er is, maar om wat ontbreekt: geen buren, geen geluid, geen haast. Onze lodges staan vrij in het landschap, elk met een eigen terras en uitzicht over heide of bos. U deelt niets met andere gasten. Dat gevoel van een plek helemaal voor uzelf is wat een verblijf hier onderscheidt van een gemiddeld vakantiehuis of hotel.",
        "Tegelijk ontbreekt het u aan niets. Een privé-hottub op het terras, een volledig uitgeruste keuken, snelle WiFi en een EV-laadpaal op het terrein — alles is geregeld zodat u zich kunt richten op wat u kwam doen: niets.",
      ],
    },
    {
      eyebrow: "De accommodaties",
      heading: "Twee lodges met elk een eigen karakter",
      body: [
        "Beide lodges bieden plaats aan vier personen en zijn met dezelfde zorg ingericht, maar elk heeft zijn eigen sfeer.",
      ],
      bullets: [
        "Lodge De Heide — eigen sauna, privé-hottub en panoramisch uitzicht over het bos.",
        "Lodge De Eik — hoge plafonds, authentieke uitstraling, buitenkeuken met BBQ en eigen hottub.",
        "Volledig uitgeruste keuken, fijne bedden en een privé-terras in beide lodges.",
        "Gratis WiFi, EV-laadpaal en persoonlijk contact met de gastheer voor en tijdens uw verblijf.",
      ],
    },
    {
      eyebrow: "Voor wie",
      heading: "Voor wie zoekt naar kwaliteit boven kwantiteit",
      body: [
        "Een luxe lodge in Drenthe is ideaal voor koppels die er even helemaal tussenuit willen, voor een klein gezin dat de natuur in wil, of voor wie een bijzondere gelegenheid wil vieren zonder de drukte van een resort. De schaal is bewust klein: twee lodges, persoonlijke aandacht, geen anonieme receptie.",
        "Wie luxe vooral als beleving ziet — een warme sauna na een boswandeling, koken met streekproducten, een avond bij het vuur — voelt zich hier thuis. Het comfort is er, maar de natuur en de rust voeren de boventoon.",
      ],
    },
    {
      eyebrow: "De ligging",
      heading: "Midden in het mooiste deel van Drenthe",
      body: [
        "Zeijen is een van de fraaiste brinkdorpen van Drenthe. Het Nationaal Park Drentsche Aa ligt op een kwartier, de paarse heide van het Ballooërveld vlakbij en Assen bereikt u in twintig minuten. U zit dus afgelegen genoeg voor volledige rust, maar dicht genoeg bij cultuur, restaurants en wellness voor een gevarieerd verblijf.",
      ],
    },
  ],
  faq: [
    {
      q: "Wat maakt deze lodges 'luxe'?",
      a: "De combinatie van volledige privacy, een eigen hottub (en sauna in De Heide), hoogwaardige inrichting, een volledig uitgeruste keuken en persoonlijke service. Geen gedeelde voorzieningen, geen massatoerisme.",
    },
    {
      q: "Hoeveel lodges zijn er en hoe groot zijn ze?",
      a: "Er zijn twee vrijstaande lodges, De Heide en De Eik, elk geschikt voor maximaal vier personen. Beide zijn volledig privé.",
    },
    {
      q: "Kan ik de lodge het hele jaar boeken?",
      a: "Ja, Huis ter Huynen is het hele jaar door te boeken. Elk seizoen heeft zijn eigen charme, van bloeiende heide in de zomer tot stille, besneeuwde bossen in de winter.",
    },
    {
      q: "Kan ik direct boeken zonder tussenpersoon?",
      a: "Ja. U boekt rechtstreeks bij Huis ter Huynen via de website of WhatsApp — persoonlijk en zonder commissie van een tussenpartij.",
    },
  ],
  related: [
    { label: "Vakantiehuis met hottub Drenthe", href: "/vakantiehuis-met-hottub-drenthe" },
    { label: "Romantisch weekend weg Drenthe", href: "/romantisch-weekend-weg-drenthe" },
    { label: "Omgeving & activiteiten", href: "/omgeving" },
  ],
  ctaTitle: "Ervaar een luxe lodge in Drenthe",
  ctaBody:
    "De lodges zijn al boekbaar voor 2027. Bekijk de beschikbaarheid of stel uw vraag — wij reageren binnen 24 uur persoonlijk.",
};

export const metadata: Metadata = {
  title: "Luxe Lodge in Drenthe | Boutique Verblijf met Hottub bij Zeijen",
  description:
    "Luxe boutique lodge in Drenthe, op de heide bij Zeijen. Twee volledig privé lodges met hottub en sauna, 20 min van Assen. Rust, ruimte en comfort. Boek direct.",
  alternates: { canonical: `${SITE_URL}/${config.slug}` },
  openGraph: {
    title: "Luxe Lodge in Drenthe – Huis ter Huynen",
    description:
      "Twee boutique lodges met hottub en sauna op de Drentse heide. Volledig privé, direct te boeken.",
    url: `${SITE_URL}/${config.slug}`,
    type: "website",
    images: [{ url: `${SITE_URL}/lodge-eik.jpg`, width: 1200, height: 630, alt: config.heroImageAlt }],
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
