"use client";
import { useState } from "react";

const C = {
  bg: "#EAE3D2", card: "#FDFBF6", text: "#2A2418", muted: "#8A7D6A",
  gold: "#B49A5E", green: "#2F4F3E", border: "#E0D8C8",
  serif: "Georgia, 'Times New Roman', serif",
  sans: "var(--font-dm-sans), system-ui, sans-serif",
};

const faqItems = [
  {
    v: "Mag ik een hond meenemen?",
    a: "Ja, honden zijn van harte welkom! Er worden vaste extra schoonmaakkosten van €25 in rekening gebracht. Vermeld uw huisdier bij de reservering. De gast is aansprakelijk voor eventuele schade veroorzaakt door huisdieren.",
  },
  {
    v: "Hoe laat kan ik inchecken en uitchecken?",
    a: "Inchecken kan tussen 15:00 en 21:00 uur. Late check-in is mogelijk zonder extra kosten — de accommodatie is voorzien van digitale sloten die toegankelijk zijn tot middernacht. Uitchecken is uiterlijk om 11:00 uur. Een late check-out (tot 13:00 uur) is op aanvraag mogelijk voor €25, afhankelijk van beschikbaarheid.",
  },
  {
    v: "Is de hottub altijd beschikbaar?",
    a: "Ja, de privé hottub is 24/7 beschikbaar voor de gasten van de lodge. De temperatuur staat standaard ingesteld op 38°C.",
  },
  {
    v: "Is er parkeerplaats bij de lodge?",
    a: "Ja, er is gratis parkeergelegenheid op eigen terrein direct naast de lodge.",
  },
  {
    v: "Is er een EV-laadpaal aanwezig?",
    a: "Ja, op het terrein staat een laadpaal voor elektrische voertuigen. Gebruik hiervan is gratis voor gasten.",
  },
  {
    v: "Wat zijn de annuleringsvoorwaarden?",
    a: (
      <div>
        <p style={{ margin: "0 0 12px" }}>Annulering dient altijd schriftelijk per e-mail te worden gedaan. De ontvangstdatum geldt als annuleringsdatum.</p>
        <table style={{ width: "100%", borderCollapse: "collapse" as const, fontSize: 14 }}>
          <thead>
            <tr style={{ background: C.green, color: "white" }}>
              <th style={{ padding: "8px 12px", textAlign: "left" as const, fontWeight: 600 }}>Annulering</th>
              <th style={{ padding: "8px 12px", textAlign: "left" as const, fontWeight: 600 }}>Restitutie</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Meer dan 60 dagen vóór aankomst", "100% (minus €25 administratiekosten)"],
              ["30–60 dagen vóór aankomst", "70%"],
              ["14–30 dagen vóór aankomst", "50%"],
              ["7–14 dagen vóór aankomst", "25%"],
              ["Minder dan 7 dagen vóór aankomst", "Geen restitutie"],
              ["No-show", "Geen restitutie"],
            ].map(([when, what], i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? C.card : "white" }}>
                <td style={{ padding: "8px 12px", borderBottom: `1px solid ${C.border}` }}>{when}</td>
                <td style={{ padding: "8px 12px", borderBottom: `1px solid ${C.border}` }}>{what}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ margin: "12px 0 0", fontSize: 13, color: C.muted }}>
          Huis ter Huynen adviseert een annuleringsverzekering. Bij overmacht wordt in overleg naar een passende oplossing gezocht.
        </p>
      </div>
    ),
  },
  {
    v: "Is er WiFi beschikbaar?",
    a: "Ja, er is gratis snel WiFi beschikbaar in de gehele lodge.",
  },
  {
    v: "Is de lodge het hele jaar open?",
    a: "Ja, Huis ter Huynen is het hele jaar door te boeken. Elk seizoen heeft zijn eigen charme — van bloeiende heidevelden in de zomer tot stille besneeuwde bossen in de winter.",
  },
  {
    v: "Zijn er extra kosten bovenop de verblijfsprijs?",
    a: "De totaalprijs bestaat uit de verblijfskosten, schoonmaakkosten en toeristenbelasting (conform gemeente Tynaarlo). Optioneel: huisdier €25, late check-out €25, wijziging boeking €25.",
  },
  {
    v: "Hoe werkt het boekingsproces?",
    a: "Stuur uw gewenste datums en het aantal gasten via e-mail of WhatsApp. Wij reageren binnen 24 uur met een persoonlijk voorstel. Na akkoord ontvangt u een boekingsbevestiging. Bij boeking betaalt u 30% aanbetaling, het resterende bedrag uiterlijk 30 dagen vóór aankomst.",
  },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div style={{ background: C.bg, fontFamily: C.sans, color: C.text, minHeight: "100vh" }}>
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "60px 24px 80px" }}>

        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ fontFamily: C.sans, fontSize: 11, fontWeight: 600, color: C.gold, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 12 }}>
            Veelgestelde vragen
          </div>
          <h1 style={{ fontFamily: C.serif, fontSize: "clamp(28px, 5vw, 44px)", margin: "0 0 6px", fontWeight: 700, lineHeight: 1.1, color: C.text }}>
            FAQ
          </h1>
          <div style={{ height: 2, width: 48, background: C.gold, margin: "14px auto 0" }} />
          <p style={{ fontFamily: C.sans, fontSize: 16, color: C.muted, fontWeight: 300, margin: "20px auto 0", maxWidth: 520, lineHeight: 1.7 }}>
            Staat uw vraag er niet bij? Neem gerust contact op via{" "}
            <a href="mailto:lodge@huisterhuynen.nl" style={{ color: C.gold, textDecoration: "none" }}>lodge@huisterhuynen.nl</a>.
          </p>
        </div>

        <div>
          {faqItems.map((item, i) => (
            <div key={i} style={{ borderTop: i === 0 ? `1px solid ${C.border}` : "none", borderBottom: `1px solid ${C.border}` }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{ width: "100%", textAlign: "left" as const, background: "none", border: "none", cursor: "pointer", padding: "22px 0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}
              >
                <span style={{ fontFamily: C.serif, fontSize: 17, fontWeight: 700, color: C.text, lineHeight: 1.3 }}>
                  {item.v}
                </span>
                <span style={{ fontSize: 22, color: C.gold, flexShrink: 0, transform: open === i ? "rotate(45deg)" : "none", transition: "transform 0.2s" }}>
                  +
                </span>
              </button>
              {open === i && (
                <div style={{ fontFamily: C.sans, fontSize: 15, color: C.muted, fontWeight: 300, margin: "0 0 22px", lineHeight: 1.7 }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 60, textAlign: "center", fontSize: 13, color: C.muted }}>
          <a href="/" style={{ color: C.gold, textDecoration: "none" }}>← Terug naar home</a>
        </div>
      </div>
    </div>
  );
}
