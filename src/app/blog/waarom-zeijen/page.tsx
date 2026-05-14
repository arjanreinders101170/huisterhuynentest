import Link from "next/link";
import { Metadata } from "next";
import { NewsletterForm } from "@/components/NewsletterForm";

export const metadata: Metadata = {
  title: "Waarom ik koos voor Zeijen — het verhaal achter Huis ter Huynen",
  description:
    "Hoe een Facebook-advertentie leidde tot de aankoop van twee lodges in Drenthe. Het persoonlijke verhaal van Arjan Reinders over passie, twijfel en de keuze voor Zeijen.",
  alternates: { canonical: "https://huisterhuynen.nl/blog/waarom-zeijen" },
  openGraph: {
    title: "Waarom ik koos voor Zeijen — het verhaal achter Huis ter Huynen",
    description:
      "Hoe een Facebook-advertentie leidde tot de aankoop van twee lodges in Drenthe. Het persoonlijke verhaal over passie, twijfel en de keuze voor Zeijen.",
    url: "https://huisterhuynen.nl/blog/waarom-zeijen",
    type: "article",
    publishedTime: "2026-05-14",
    authors: ["Arjan Reinders"],
  },
};

const T = {
  bg: "#EAE3D2",
  card: "#FDFBF6",
  green: "#2F4F3E",
  text: "#2A2418",
  muted: "#8A7D6A",
  gold: "#B49A5E",
  border: "#E0D8C8",
  serif: "Georgia, 'Times New Roman', serif",
  sans: "var(--font-dm-sans), system-ui, sans-serif",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Waarom ik koos voor Zeijen — het verhaal achter Huis ter Huynen",
  description:
    "Hoe een Facebook-advertentie leidde tot de aankoop van twee lodges in Drenthe.",
  author: { "@type": "Person", name: "Arjan Reinders" },
  datePublished: "2026-05-14",
  publisher: {
    "@type": "Organization",
    name: "Huis ter Huynen",
    url: "https://huisterhuynen.nl",
  },
  mainEntityOfPage: "https://huisterhuynen.nl/blog/waarom-zeijen",
};

function H2({ children }: { children: string }) {
  return (
    <h2 style={{
      fontFamily: T.serif, fontSize: "clamp(20px, 2.5vw, 24px)",
      color: T.text, margin: "48px 0 16px", fontWeight: 700, lineHeight: 1.3,
    }}>
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: T.sans, fontSize: 16, color: T.text,
      lineHeight: 1.85, margin: "0 0 20px", fontWeight: 300,
    }}>
      {children}
    </p>
  );
}

export default function ArtikelWaaromZeijen() {
  return (
    <div style={{ background: T.bg, minHeight: "100vh" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <div style={{ background: T.green, padding: "72px 24px 56px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Link href="/blog" style={{
            fontFamily: T.sans, fontSize: 12, color: T.gold,
            textDecoration: "none", letterSpacing: 1, display: "inline-block", marginBottom: 28,
          }}>
            ← Blog & Verhalen
          </Link>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20 }}>
            <span style={{
              fontFamily: T.sans, fontSize: 10, fontWeight: 700, color: T.green,
              background: T.gold, padding: "3px 10px", borderRadius: 20,
              textTransform: "uppercase", letterSpacing: 1,
            }}>
              Verhaal
            </span>
            <span style={{ fontFamily: T.sans, fontSize: 12, color: "rgba(255,255,255,.5)" }}>
              Mei 2026 · 4 minuten lezen
            </span>
          </div>
          <h1 style={{
            fontFamily: T.serif, fontSize: "clamp(26px, 4vw, 40px)",
            color: "white", margin: "0 0 20px", fontWeight: 700, lineHeight: 1.2,
          }}>
            Waarom ik koos voor Zeijen — het verhaal achter mijn twee lodges bij Huis ter Huynen
          </h1>
          <p style={{
            fontFamily: T.sans, fontSize: 15, color: "rgba(255,255,255,.6)",
            fontWeight: 300, margin: 0, lineHeight: 1.7,
          }}>
            Door Arjan Reinders
          </p>
        </div>
      </div>

      {/* Gouden scheidingslijn */}
      <div style={{ height: 4, background: T.gold }} />

      {/* Artikel body */}
      <article style={{ maxWidth: 720, margin: "0 auto", padding: "56px 24px 40px" }}>

        <H2>Het begon niet met een businessplan</H2>
        <P>
          Ik ben geen hotelier. Ik zit in vastgoed, en ik weet hoe locaties werken. Maar dit
          project begon ergens anders — bij een gevoel. Het beeld van twee mensen die aankomen,
          de deur achter zich dichtdoen en eindelijk even helemaal tot rust komen.
        </P>
        <P>
          Dat beeld wilde ik werkelijkheid maken.
        </P>

        <H2>Een Facebook-advertentie die alles veranderde</H2>
        <P>
          Ik was op zoek naar een locatie in het noorden — Friesland, Groningen of Drenthe. Op
          een avond verscheen er een advertentie van de ontwikkelaar van Huis ter Huynen: een
          park van zo&apos;n 70 lodges midden in Drenthe. Niet spectaculair gepresenteerd, gewoon
          een uitnodiging om te komen kijken.
        </P>
        <P>
          Ik maakte een afspraak. Zonder hoge verwachtingen.
        </P>

        <H2>Toen ik er stond, wist ik het</H2>
        <P>
          Zeijen. Een dorp dat de meeste mensen niet kennen en dat zich ook niet opdringt.
        </P>
        <P>
          Toen ik uitstapte en om me heen keek, wist ik het eigenlijk al. Aan de ene kant de
          heide — breed en open. Aan de andere kant een lijn van bomen. Daartussenin: stilte.
          Het soort stilte dat je pas opmerkt als je er middenin staat en beseft dat je al een
          tijdje niet aan je telefoon hebt gedacht.
        </P>
        <P>
          Dit was de plek.
        </P>

        <H2>Waarom hier</H2>
        <P>
          Ik woon zelf in Friesland, een halfuur rijden van de lodges. Een bewuste keuze — ik
          wil betrokken zijn, niet op afstand beheren.
        </P>
        <P>
          Drenthe trekt al jaren toeristen, maar nooit in de aantallen die je bij de Veluwe
          ziet. De natuur hier is niet toeristisch bewerkt. De heidevelden bloeien gewoon. De
          Drentsche Aa slingert door het landschap zonder bewegwijzering. En de ligging klopt:
          Assen is twintig minuten, Groningen drie kwartier. Gasten die rust zoeken vinden die
          direct. Wie toch iets wil ondernemen, kan dat zonder urenlang te rijden.
        </P>

        <H2>De twijfels waren er. Het lef ook.</H2>
        <P>
          Het onbekende terrein was het grootste struikelblok. Vastgoed kent ik — maar gasten
          ontvangen, zorgen dat mensen zich thuis voelen in een ruimte die jij hebt gecreëerd,
          dat is kwetsbaarder.
        </P>
        <P>
          Toch ben ik gegaan. Omdat ik geloof dat aandacht terugkomt. Als je investeert in de
          details, in de sfeer, in de kleine dingen die het verschil maken — dan voelen gasten dat.
        </P>

        <H2>Twee van de 70</H2>
        <P>
          Van de 70 lodges op het park heb ik er twee aangekocht: Lodge De Heide en Lodge De Eik.
          Elk volledig privé, met een ruim terras, een hottub en directe toegang tot de natuur.
          Geen receptie. Geen gedeelde ruimtes. Je komt aan, en alles wat je nodig hebt is er al.
        </P>

        {/* Interne link naar reserveren */}
        <div style={{
          background: T.card, border: `1px solid ${T.border}`,
          borderLeft: `4px solid ${T.gold}`,
          borderRadius: "0 12px 12px 0",
          padding: "20px 24px", margin: "40px 0",
        }}>
          <div style={{
            fontFamily: T.sans, fontSize: 11, fontWeight: 700,
            color: T.gold, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6,
          }}>
            Opening 1 januari 2027
          </div>
          <p style={{ fontFamily: T.sans, fontSize: 14, color: T.text, margin: "0 0 14px", lineHeight: 1.6 }}>
            De lodges zijn beschikbaar vanaf 1 januari 2027. Schrijf je in voor de
            nieuwsbrief en ontvang als eerste de vroegboekkorting.
          </p>
          <Link href="/#nieuwsbrief" style={{
            display: "inline-block",
            fontFamily: T.sans, fontSize: 13, fontWeight: 700,
            color: T.green, textDecoration: "none",
            border: `1px solid ${T.green}`,
            padding: "8px 18px", borderRadius: 8,
          }}>
            Schrijf me in →
          </Link>
        </div>

        {/* Meta footer */}
        <div style={{
          borderTop: `1px solid ${T.border}`, paddingTop: 28, marginTop: 16,
          display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap",
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: T.green, display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: T.serif, fontSize: 16, fontWeight: 700, color: T.gold, flexShrink: 0,
          }}>
            A
          </div>
          <div>
            <div style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 600, color: T.text }}>
              Arjan Reinders
            </div>
            <div style={{ fontFamily: T.sans, fontSize: 12, color: T.muted }}>
              Eigenaar Lodge De Heide &amp; Lodge De Eik · Huis ter Huynen, Zeijen
            </div>
          </div>
        </div>
      </article>

      {/* Nieuwsbrief */}
      <div id="nieuwsbrief" style={{ background: T.green, padding: "64px 24px" }}>
        <div style={{ maxWidth: 540, margin: "0 auto", textAlign: "center" }}>
          <div style={{
            fontFamily: T.sans, fontSize: 11, fontWeight: 600,
            color: T.gold, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 14,
          }}>
            Opening 1 januari 2027
          </div>
          <h2 style={{
            fontFamily: T.serif, fontSize: "clamp(22px, 3vw, 30px)",
            color: "white", margin: "0 0 12px", fontWeight: 700,
          }}>
            Wees er als eerste bij
          </h2>
          <p style={{
            fontFamily: T.sans, fontSize: 14, color: "rgba(255,255,255,.65)",
            fontWeight: 300, margin: "0 0 28px", lineHeight: 1.7,
          }}>
            Schrijf je in en ontvang de vroegboekkorting die alleen voor inschrijvers beschikbaar is.
          </p>
          <NewsletterForm />
        </div>
      </div>
    </div>
  );
}
