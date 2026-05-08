"use client";

import { useState } from "react";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";

const T = {
  bg: "#EAE3D2",
  card: "#FDFBF6",
  green: "#2F4F3E",
  text: "#2A2418",
  muted: "#8A7D6A",
  gold: "#B49A5E",
  border: "#E0D8C8",
};

export default function LandingPage() {
  const [selectedLodge, setSelectedLodge] = useState<"lodge_1" | "lodge_2">("lodge_1");

  return (
    <div style={{ background: T.bg, fontFamily: "'DM Sans', system-ui, sans-serif", color: T.text }}>
      {/* HERO */}
      <section style={{
        height: "600px",
        background: "linear-gradient(135deg, #8B6B3D 0%, #A67B4B 50%, #6B5B3A 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "radial-gradient(circle at 20% 50%, rgba(139, 107, 61, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(107, 91, 58, 0.2) 0%, transparent 50%)",
          opacity: 0.4,
        }} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: "600px", padding: "40px" }}>
          {/* LOGO */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: "22px", fontWeight: "bold", color: "white", letterSpacing: "3px", marginBottom: "8px" }}>
              HUIS TER HUYNEN
            </div>
            <div>
              <span style={{ display: "inline-block", width: "24px", height: "1px", background: T.gold, verticalAlign: "middle" }}></span>
              <span style={{ fontSize: "8px", color: T.gold, letterSpacing: "2.5px", textTransform: "uppercase", padding: "0 8px", verticalAlign: "middle" }}>Boutique Lodge</span>
              <span style={{ display: "inline-block", width: "24px", height: "1px", background: T.gold, verticalAlign: "middle" }}></span>
            </div>
          </div>

          <p style={{ fontSize: "16px", fontWeight: 300, lineHeight: 1.6, marginBottom: "30px" }}>
            Twee unieke boutique lodges in het hart van Drenthe. Natuur, privacy, en luxe in perfecte harmonie.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button style={{
              padding: "14px 40px",
              background: T.gold,
              color: T.green,
              border: "none",
              borderRadius: "12px",
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer",
            }}>
              Bekijk beschikbaarheid
            </button>
            <button style={{
              padding: "14px 40px",
              background: "transparent",
              color: "white",
              border: "2px solid white",
              borderRadius: "12px",
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer",
            }}>
              Lees meer
            </button>
          </div>
        </div>
      </section>

      {/* USPs */}
      <section style={{ background: T.card, padding: "60px 40px" }}>
        <div style={{ maxWidth: "1440px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "36px", margin: "0 0 12px", color: T.text }}>
              Waarom Huis ter Huynen?
            </h2>
            <div style={{ height: "2px", width: "40px", background: T.gold, margin: "12px auto" }}></div>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "30px",
            textAlign: "center",
          }}>
            {[
              { label: "Privé Hottub", desc: "Genieten onder de sterren" },
              { label: "Natuur Pur", desc: "Heide, bos en hunebed" },
              { label: "EV Laadpaal", desc: "Duurzaam verblijven" },
              { label: "Volledige Privacy", desc: "Alleen jij en je gezelschap" },
              { label: "Uniek Design", desc: "Boomhut & Schaapskooi" },
              { label: "Persoonlijk", desc: "Direct contact met eigenaar" },
            ].map((usp, i) => (
              <div key={i}>
                <div style={{ fontSize: "12px", fontWeight: "600", color: T.gold, letterSpacing: "1px", marginBottom: "12px", textTransform: "uppercase" }}>
                  ━━━
                </div>
                <h3 style={{ fontSize: "16px", color: T.green, marginBottom: "8px", fontWeight: 600 }}>
                  {usp.label}
                </h3>
                <p style={{ fontSize: "13px", color: T.muted, margin: 0 }}>
                  {usp.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LODGES */}
      <section style={{ background: "white", padding: "60px 40px" }}>
        <div style={{ maxWidth: "1440px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "36px", margin: "0 0 12px", color: T.text }}>
              Onze Lodges
            </h2>
            <div style={{ height: "2px", width: "40px", background: T.gold, margin: "12px auto" }}></div>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "30px",
          }}>
            {[
              { id: "lodge_1", name: "De Boomhut", desc: "Luxe boomhut voor twee personen. Uitzicht over het bos met privé hottub en sauna.", features: "✓ 2 personen  ✓ Hottub  ✓ Sauna" },
              { id: "lodge_2", name: "De Schaapskooi", desc: "Voormalige schapenschuur omgetoverd tot luxe verblijf. Warmte, comfort en authenticiteit.", features: "✓ 4 personen  ✓ Hottub  ✓ Keuken" },
            ].map((lodge) => (
              <div key={lodge.id} style={{
                borderRadius: "12px",
                overflow: "hidden",
                background: T.card,
                border: `1px solid ${T.border}`,
              }}>
                <div style={{
                  height: "200px",
                  background: "linear-gradient(135deg, #8B7355, #A89070)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#999",
                  fontSize: "14px",
                }}>
                  [FOTO {lodge.name}]
                </div>
                <div style={{ padding: "24px" }}>
                  <h3 style={{ fontFamily: "Georgia, serif", fontSize: "20px", color: T.green, marginBottom: "8px", margin: "0 0 8px" }}>
                    {lodge.name}
                  </h3>
                  <p style={{ fontSize: "13px", color: T.muted, marginBottom: "16px", margin: "0 0 16px" }}>
                    {lodge.desc}
                  </p>
                  <div style={{ fontSize: "12px", color: T.gold, marginBottom: "12px" }}>
                    {lodge.features}
                  </div>
                  <button style={{
                    width: "100%",
                    padding: "12px",
                    background: T.green,
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}>
                    Bekijk {lodge.name}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section style={{ background: T.bg, padding: "60px 40px" }}>
        <div style={{ maxWidth: "1440px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "36px", margin: "0 0 12px", color: T.text }}>
              Wat gasten zeggen
            </h2>
            <div style={{ height: "2px", width: "40px", background: T.gold, margin: "12px auto" }}></div>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
          }}>
            {[
              { text: '"Een onvergetelijk weekend in de Boomhut. De hottub onder de sterren, het geluid van de vogels, pure magic."', author: "Sarah & Mark, Amsterdam" },
              { text: '"De Schaapskooi is het mooiste wat ik het afgelopen jaar heb gezien. Warm, authentiek, en hartelijk ontvangen."', author: "Petra, Groningen" },
              { text: '"Perfect voor een EV roadtrip! Laadpaal ter plekke en het uitzicht over de heide is fenomenaal."', author: "Jan, Duitsland" },
            ].map((review, i) => (
              <div key={i} style={{
                background: "white",
                padding: "24px",
                borderRadius: "12px",
                borderLeft: `4px solid ${T.gold}`,
              }}>
                <div style={{ fontSize: "13px", color: T.gold, marginBottom: "12px" }}>★★★★★</div>
                <p style={{ fontSize: "14px", color: T.text, fontStyle: "italic", marginBottom: "12px", margin: "0 0 12px", lineHeight: 1.6 }}>
                  {review.text}
                </p>
                <div style={{ fontSize: "13px", fontWeight: 600, color: T.green }}>
                  {review.author}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AVAILABILITY CALENDAR */}
      <section style={{ background: "white", padding: "60px 40px" }}>
        <div style={{ maxWidth: "1440px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "36px", margin: "0 0 12px", color: T.text }}>
              Beschikbaarheid
            </h2>
            <div style={{ height: "2px", width: "40px", background: T.gold, margin: "12px auto" }}></div>
          </div>

          {/* Lodge selector */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginBottom: "30px" }}>
            {[
              { id: "lodge_1" as const, name: "De Boomhut" },
              { id: "lodge_2" as const, name: "De Schaapskooi" },
            ].map((lodge) => (
              <button
                key={lodge.id}
                onClick={() => setSelectedLodge(lodge.id)}
                style={{
                  padding: "12px 24px",
                  background: selectedLodge === lodge.id ? T.green : T.border,
                  color: selectedLodge === lodge.id ? "white" : T.text,
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                {lodge.name}
              </button>
            ))}
          </div>

          {/* Calendar Component */}
          <AvailabilityCalendar lodgeId={selectedLodge} />

          {/* Legend */}
          <div style={{ display: "flex", gap: "20px", justifyContent: "center", marginTop: "30px", fontSize: "13px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "16px", height: "16px", background: "#90EE90", borderRadius: "3px" }}></div>
              <span>Beschikbaar</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "16px", height: "16px", background: "#D3D3D3", borderRadius: "3px" }}></div>
              <span>Geboekt</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "16px", height: "16px", background: "#FFA500", borderRadius: "3px" }}></div>
              <span>Geblokkeerd</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: T.green, color: "white", padding: "60px 40px", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "36px", margin: "0 0 16px" }}>
            Klaar voor je volgende avontuur?
          </h2>
          <p style={{ fontSize: "15px", fontWeight: 300, marginBottom: "30px", margin: "0 0 30px" }}>
            Stuur ons je voorkeursdatums en wij stellen een persoonlijk voorstel samen.
          </p>
          <button style={{
            padding: "16px 50px",
            background: T.gold,
            color: T.green,
            border: "none",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: 600,
            cursor: "pointer",
          }}>
            Vraag beschikbaarheid aan
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#1A1A1A", color: T.muted, padding: "40px", textAlign: "center", fontSize: "13px" }}>
        <p style={{ margin: "0 0 8px" }}>
          Zuiderstraat 6 · 9491 EC Zeijen, Drenthe · <a href="tel:+31642568603" style={{ color: T.gold, textDecoration: "none" }}>+31 6 42568603</a>
        </p>
        <p style={{ margin: "8px 0 0" }}>
          © 2026 Huis ter Huynen · 
          <a href="/privacy" style={{ color: T.gold, textDecoration: "none", margin: "0 8px" }}>Privacy</a> ·
          <a href="/terms" style={{ color: T.gold, textDecoration: "none", margin: "0 8px" }}>Voorwaarden</a> ·
          <a href="mailto:lodge@huisterhuynen.nl" style={{ color: T.gold, textDecoration: "none", margin: "0 0 0 8px" }}>Contact</a>
        </p>
      </footer>
    </div>
  );
}
