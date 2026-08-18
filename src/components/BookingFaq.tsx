import Link from "next/link";
import { DirectBookingUSP } from "@/components/DirectBookingUSP";

/* ═══ Compacte FAQ direct bij het boekingsformulier ═══
 * Alleen de vragen die een aanvraag tegenhouden (kosten, annuleren,
 * betalen, hond). De volledige lijst blijft op /faq staan; deze vijf
 * staan hier zodat een twijfelaar niet eerst hoeft weg te navigeren.
 * Native <details> — geen state, dus geen extra hydration.
 */

const T = {
  card: "#FDFBF6",
  text: "#2A2418",
  muted: "#5A534C",
  gold: "#B49A5E",
  green: "#2F4F3E",
  border: "#E0D8C8",
  serif: "Georgia, 'Times New Roman', serif",
  sans: "var(--font-dm-sans), system-ui, sans-serif",
};

interface FaqItem {
  q: string;
  a: string;
}

const CONTENT: Record<"nl" | "de", { title: string; sub: string; items: FaqItem[]; moreLabel?: string; moreHref?: string; mailIntro?: string }> = {
  nl: {
    title: "Nog één vraag voordat u aanvraagt?",
    sub: "De vragen die het vaakst gesteld worden vlak vóór een reservering.",
    items: [
      {
        q: "Hoe werkt het aanvragen precies?",
        a: "U geeft uw gewenste data en het aantal gasten door via het formulier hierboven. Wij controleren de beschikbaarheid persoonlijk en sturen u binnen 24 uur een voorstel op maat. Pas ná uw akkoord is de reservering definitief — de aanvraag zelf verplicht u tot niets.",
      },
      {
        q: "Zijn er extra kosten bovenop de verblijfsprijs?",
        a: "De totaalprijs bestaat uit de verblijfskosten, schoonmaakkosten en toeristenbelasting (conform gemeente Tynaarlo). Optioneel: huisdier €25, late check-out €25, wijziging boeking €25. Omdat u direct bij ons boekt betaalt u geen commissie van een boekingssite.",
      },
      {
        q: "Wanneer betaal ik, en hoeveel?",
        a: "Bij boeking betaalt u 30% aanbetaling; het resterende bedrag uiterlijk 30 dagen vóór aankomst. Bij het aanvragen betaalt u nog niets.",
      },
      {
        q: "Kan ik kosteloos annuleren?",
        a: "Tot 60 dagen vóór aankomst krijgt u 100% terug (minus €25 administratiekosten). Daarna geldt een staffel: 30–60 dagen 70%, 14–30 dagen 50%, 7–14 dagen 25%. De volledige voorwaarden staan in de FAQ.",
      },
      {
        q: "Mag mijn hond mee?",
        a: "Ja, honden zijn van harte welkom. Er gelden vaste extra schoonmaakkosten van €25 — vermeld uw hond even bij de aanvraag.",
      },
    ],
    moreLabel: "Alle veelgestelde vragen",
    moreHref: "/faq",
  },
  de: {
    title: "Noch eine Frage vor Ihrer Anfrage?",
    sub: "Die Fragen, die kurz vor einer Reservierung am häufigsten gestellt werden.",
    items: [
      {
        q: "Wie läuft die Anfrage genau ab?",
        a: "Sie senden uns über das Formular oben Ihre Wunschdaten und die Anzahl der Gäste. Wir prüfen die Verfügbarkeit persönlich und schicken Ihnen innerhalb von 24 Stunden ein maßgeschneidertes Angebot. Erst nach Ihrer Zusage ist die Buchung verbindlich — die Anfrage selbst verpflichtet zu nichts.",
      },
      {
        q: "Gibt es Kosten zusätzlich zum Übernachtungspreis?",
        a: "Der Gesamtpreis besteht aus Übernachtung, Endreinigung und Kurtaxe (Gemeinde Tynaarlo). Optional: Hund 25 €, später Check-out 25 €, Umbuchung 25 €. Da Sie direkt bei uns buchen, zahlen Sie keine Provision einer Buchungsplattform.",
      },
      {
        q: "Wann und wie viel muss ich bezahlen?",
        a: "Bei der Buchung 30 % Anzahlung, den Restbetrag spätestens 30 Tage vor Anreise. Für die Anfrage selbst zahlen Sie noch nichts.",
      },
      {
        q: "Wie sind die Stornobedingungen?",
        a: "Bis 60 Tage vor Anreise erhalten Sie 100 % zurück (abzüglich 25 € Bearbeitungsgebühr). Danach gestaffelt: 30–60 Tage 70 %, 14–30 Tage 50 %, 7–14 Tage 25 %.",
      },
      {
        q: "Darf mein Hund mit?",
        a: "Ja, Hunde sind herzlich willkommen. Es fallen 25 € zusätzliche Reinigungskosten an — geben Sie Ihren Hund bitte bei der Anfrage an.",
      },
    ],
    mailIntro: "Ihre Frage ist nicht dabei? Schreiben Sie uns:",
  },
};

export function BookingFaq({ locale = "nl" }: { locale?: "nl" | "de" }) {
  const c = CONTENT[locale];
  return (
    <section
      className="hth-faq"
      style={{
        maxWidth: 720,
        margin: "56px auto 0",
        background: "white",
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        padding: "32px 28px 8px",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <h3 style={{ fontFamily: T.serif, fontSize: "clamp(19px, 2.4vw, 24px)", color: T.text, margin: "0 0 8px", fontWeight: 700, lineHeight: 1.25 }}>
          {c.title}
        </h3>
        <p style={{ fontFamily: T.sans, fontSize: 14, color: T.muted, fontWeight: 300, margin: "0 0 18px", lineHeight: 1.6 }}>
          {c.sub}
        </p>
        <DirectBookingUSP locale={locale} tone="onLight" size={12} style={{ marginBottom: 4 }} />
      </div>

      <div style={{ marginTop: 20 }}>
        {c.items.map((item, i) => (
          <details
            key={i}
            style={{
              borderTop: `1px solid ${T.border}`,
              borderBottom: i === c.items.length - 1 ? `1px solid ${T.border}` : "none",
            }}
          >
            <summary
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
                padding: "18px 0",
                fontFamily: T.serif,
                fontSize: 16,
                fontWeight: 700,
                color: T.text,
                lineHeight: 1.35,
              }}
            >
              {item.q}
              <span aria-hidden className="hth-faq-plus" style={{ fontSize: 22, color: T.gold, flexShrink: 0, fontFamily: T.sans }}>
                +
              </span>
            </summary>
            <p style={{ fontFamily: T.sans, fontSize: 14.5, color: T.muted, fontWeight: 300, margin: "0 0 20px", lineHeight: 1.75 }}>
              {item.a}
            </p>
          </details>
        ))}
      </div>

      <div style={{ textAlign: "center", padding: "20px 0 24px" }}>
        {c.moreHref ? (
          <Link
            href={c.moreHref}
            style={{
              fontFamily: T.sans, fontSize: 13, fontWeight: 600, color: T.green,
              textDecoration: "underline", textUnderlineOffset: 4, textDecorationColor: T.gold,
            }}
          >
            {c.moreLabel} →
          </Link>
        ) : (
          <span style={{ fontFamily: T.sans, fontSize: 13, color: T.muted, fontWeight: 300 }}>
            {c.mailIntro}{" "}
            <a href="mailto:lodge@huisterhuynen.nl" style={{ color: T.green, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 4, textDecorationColor: T.gold }}>
              lodge@huisterhuynen.nl
            </a>
          </span>
        )}
      </div>
    </section>
  );
}
