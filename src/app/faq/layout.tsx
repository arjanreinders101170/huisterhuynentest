import type { Metadata } from "next";

const SITE_URL = "https://www.huisterhuynen.nl";

export const metadata: Metadata = {
  title: "Veelgestelde vragen (FAQ)",
  description:
    "Antwoorden op de meest gestelde vragen over Huis ter Huynen: inchecken, huisdieren, hottub, parkeren, EV-laadpaal, annulering en meer.",
  alternates: {
    canonical: `${SITE_URL}/faq`,
  },
  openGraph: {
    title: "FAQ – Huis ter Huynen",
    description:
      "Alles wat u wilt weten over uw verblijf in onze lodges op de Drentse heide bij Zeijen.",
    url: `${SITE_URL}/faq`,
    type: "website",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Mag ik een hond meenemen?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ja, honden zijn van harte welkom! Er worden vaste extra schoonmaakkosten van €25 in rekening gebracht. Vermeld uw huisdier bij de reservering. De gast is aansprakelijk voor eventuele schade veroorzaakt door huisdieren.",
      },
    },
    {
      "@type": "Question",
      name: "Hoe laat kan ik inchecken en uitchecken?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Inchecken kan tussen 15:00 en 21:00 uur. Late check-in is mogelijk zonder extra kosten — de accommodatie is voorzien van digitale sloten die toegankelijk zijn tot middernacht. Uitchecken is uiterlijk om 11:00 uur. Een late check-out (tot 13:00 uur) is op aanvraag mogelijk voor €25, afhankelijk van beschikbaarheid.",
      },
    },
    {
      "@type": "Question",
      name: "Is de hottub altijd beschikbaar?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ja, de privé hottub is 24/7 beschikbaar voor de gasten van de lodge. De temperatuur staat standaard ingesteld op 38°C.",
      },
    },
    {
      "@type": "Question",
      name: "Is er parkeerplaats bij de lodge?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ja, er is gratis parkeergelegenheid op eigen terrein direct naast de lodge.",
      },
    },
    {
      "@type": "Question",
      name: "Is er een EV-laadpaal aanwezig?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ja, op het terrein staat een laadpaal voor elektrische voertuigen. Gebruik hiervan is gratis voor gasten.",
      },
    },
    {
      "@type": "Question",
      name: "Wat zijn de annuleringsvoorwaarden?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Meer dan 60 dagen vóór aankomst: 100% restitutie (minus €25 administratiekosten). 30–60 dagen: 70%. 14–30 dagen: 50%. 7–14 dagen: 25%. Minder dan 7 dagen of no-show: geen restitutie. Annulering dient schriftelijk per e-mail te worden gedaan.",
      },
    },
    {
      "@type": "Question",
      name: "Is er WiFi beschikbaar?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ja, er is gratis snel WiFi beschikbaar in de gehele lodge.",
      },
    },
    {
      "@type": "Question",
      name: "Is de lodge het hele jaar open?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Ja, Huis ter Huynen is het hele jaar door te boeken. Elk seizoen heeft zijn eigen charme — van bloeiende heidevelden in de zomer tot stille besneeuwde bossen in de winter.",
      },
    },
    {
      "@type": "Question",
      name: "Zijn er extra kosten bovenop de verblijfsprijs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "De totaalprijs bestaat uit de verblijfskosten, schoonmaakkosten en toeristenbelasting (conform gemeente Tynaarlo). Optioneel: huisdier €25, late check-out €25, wijziging boeking €25.",
      },
    },
    {
      "@type": "Question",
      name: "Hoe werkt het boekingsproces?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Stuur uw gewenste datums en het aantal gasten via e-mail of WhatsApp. Wij reageren binnen 24 uur met een persoonlijk voorstel. Na akkoord ontvangt u een boekingsbevestiging. Bij boeking betaalt u 30% aanbetaling, het resterende bedrag uiterlijk 30 dagen vóór aankomst.",
      },
    },
  ],
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}
