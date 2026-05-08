"use client";
import { useState } from "react";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
const T = { bg: "#EAE3D2", card: "#FDFBF6", green: "#2F4F3E", text: "#2A2418", muted: "#8A7D6A", gold: "#B49A5E", border: "#E0D8C8" };
export default function LandingPage() {
  const [selectedLodge, setSelectedLodge] = useState<"lodge_1"|"lodge_2">("lodge_1");
  return (
    <div style={{ background: T.bg, fontFamily: "'DM Sans', system-ui, sans-serif", color: T.text }}>
      {/* HERO */}
      <section style={{ height: 600, background: "linear-gradient(135deg,#8B6B3D 0%,#A67B4B 50%,#6B5B3A 100%)", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", color: "white", position: "relative" }}>
        <div style={{ position: "relative", zIndex: 2, maxWidth: 600, padding: 40 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: "Georgia,serif", fontSize: 22, fontWeight: "bold", letterSpacing: 3, marginBottom: 8 }}>HUIS TER HUYNEN</div>
            <div><span style={{ display: "inline-block", width: 24, height: 1, background: T.gold, verticalAlign: "middle" }}></span><span style={{ fontSize: 8, color: T.gold, letterSpacing: "2.5px", textTransform: "uppercase" as const, padding: "0 8px", verticalAlign: "middle" }}>Boutique Lodge</span><span style={{ display: "inline-block", width: 24, height: 1, background: T.gold, verticalAlign: "middle" }}></span></div>
          </div>
          <p style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.6, marginBottom: 30 }}>Twee unieke boutique lodges in het hart van Drenthe. Natuur, privacy, en luxe in perfecte harmonie.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button style={{ padding: "14px 40px", background: T.gold, color: T.green, border: "none", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Bekijk beschikbaarheid</button>
            <button style={{ padding: "14px 40px", background: "transparent", color: "white", border: "2px solid white", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Lees meer</button>
          </div>
        </div>
      </section>

      {/* USPs */}
      <section style={{ background: T.card, padding: "60px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ fontFamily: "Georgia,serif", fontSize: 36, margin: "0 0 12px" }}>Waarom Huis ter Huynen?</h2>
            <div style={{ height: 2, width: 40, background: T.gold, margin: "12px auto" }}></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 30, textAlign: "center" }}>
            {[{l:"Privé Hottub",d:"Genieten onder de sterren"},{l:"Natuur Pur",d:"Heide, bos en hunebed"},{l:"EV Laadpaal",d:"Duurzaam verblijven"},{l:"Volledige Privacy",d:"Alleen jij en je gezelschap"},{l:"Uniek Design",d:"Boomhut & Schaapskooi"},{l:"Persoonlijk",d:"Direct contact met eigenaar"}].map((u,i) => (
              <div key={i}><div style={{ fontSize: 12, fontWeight: 600, color: T.gold, letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" as const }}>━━━</div><h3 style={{ fontSize: 16, color: T.green, marginBottom: 8, fontWeight: 600 }}>{u.l}</h3><p style={{ fontSize: 13, color: T.muted, margin: 0 }}>{u.d}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* LODGES */}
      <section style={{ background: "white", padding: "60px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ fontFamily: "Georgia,serif", fontSize: 36, margin: "0 0 12px" }}>Onze Lodges</h2>
            <div style={{ height: 2, width: 40, background: T.gold, margin: "12px auto" }}></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 30 }}>
            {[{id:"lodge_1",name:"De Boomhut",desc:"Luxe boomhut voor twee personen. Uitzicht over het bos met privé hottub en sauna.",features:"✓ 2 personen  ✓ Hottub  ✓ Sauna"},{id:"lodge_2",name:"De Schaapskooi",desc:"Voormalige schapenschuur omgetoverd tot luxe verblijf. Warmte, comfort en authenticiteit.",features:"✓ 4 personen  ✓ Hottub  ✓ Keuken"}].map(lodge => (
              <div key={lodge.id} style={{ borderRadius: 12, overflow: "hidden", background: T.card, border: `1px solid ${T.border}` }}>
                <div style={{ height: 200, background: "linear-gradient(135deg,#8B7355,#A89070)", display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: 14 }}>[FOTO {lodge.name}]</div>
                <div style={{ padding: 24 }}>
                  <h3 style={{ fontFamily: "Georgia,serif", fontSize: 20, color: T.green, margin: "0 0 8px" }}>{lodge.name}</h3>
                  <p style={{ fontSize: 13, color: T.muted, margin: "0 0 16px" }}>{lodge.desc}</p>
                  <div style={{ fontSize: 12, color: T.gold, marginBottom: 12 }}>{lodge.features}</div>
                  <button style={{ width: "100%", padding: 12, background: T.green, color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Bekijk {lodge.name}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section style={{ background: T.bg, padding: "60px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ fontFamily: "Georgia,serif", fontSize: 36, margin: "0 0 12px" }}>Wat gasten zeggen</h2>
            <div style={{ height: 2, width: 40, background: T.gold, margin: "12px auto" }}></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
            {[{t:'"Een onvergetelijk weekend in de Boomhut. De hottub onder de sterren, het geluid van de vogels, pure magic."',a:"Sarah & Mark, Amsterdam"},{t:'"De Schaapskooi is het mooiste wat ik het afgelopen jaar heb gezien. Warm, authentiek, en hartelijk ontvangen."',a:"Petra, Groningen"},{t:'"Perfect voor een EV roadtrip! Laadpaal ter plekke en het uitzicht over de heide is fenomenaal."',a:"Jan, Duitsland"}].map((r,i) => (
              <div key={i} style={{ background: "white", padding: 24, borderRadius: 12, borderLeft: `4px solid ${T.gold}` }}>
                <div style={{ fontSize: 13, color: T.gold, marginBottom: 12 }}>★★★★★</div>
                <p style={{ fontSize: 14, color: T.text, fontStyle: "italic", margin: "0 0 12px", lineHeight: 1.6 }}>{r.t}</p>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.green }}>— {r.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AVAILABILITY */}
      <section style={{ background: "white", padding: "60px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ fontFamily: "Georgia,serif", fontSize: 36, margin: "0 0 12px" }}>Beschikbaarheid</h2>
            <div style={{ height: 2, width: 40, background: T.gold, margin: "12px auto" }}></div>
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 30 }}>
            {[{id:"lodge_1" as const,name:"De Boomhut"},{id:"lodge_2" as const,name:"De Schaapskooi"}].map(l => (
              <button key={l.id} onClick={() => setSelectedLodge(l.id)} style={{ padding: "12px 24px", background: selectedLodge === l.id ? T.green : T.border, color: selectedLodge === l.id ? "white" : T.text, border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>{l.name}</button>
            ))}
          </div>
          <AvailabilityCalendar lodgeId={selectedLodge} />
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: T.green, color: "white", padding: "60px 40px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "Georgia,serif", fontSize: 36, margin: "0 0 16px" }}>Klaar voor je volgende avontuur?</h2>
          <p style={{ fontSize: 15, fontWeight: 300, margin: "0 0 30px" }}>Stuur ons je voorkeursdatums en wij stellen een persoonlijk voorstel samen.</p>
          <button style={{ padding: "16px 50px", background: T.gold, color: T.green, border: "none", borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: "pointer" }}>Vraag beschikbaarheid aan</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#1A1A1A", color: T.muted, padding: 40, textAlign: "center", fontSize: 13 }}>
        <p style={{ margin: "0 0 8px" }}>Zuiderstraat 6 · 9491 EC Zeijen, Drenthe · <a href="tel:+31642568603" style={{ color: T.gold, textDecoration: "none" }}>+31 6 42568603</a></p>
        <p style={{ margin: "8px 0 0" }}>© 2026 Huis ter Huynen · <a href="/privacy" style={{ color: T.gold, textDecoration: "none", margin: "0 8px" }}>Privacy</a> · <a href="/terms" style={{ color: T.gold, textDecoration: "none", margin: "0 8px" }}>Voorwaarden</a> · <a href="mailto:lodge@huisterhuynen.nl" style={{ color: T.gold, textDecoration: "none" }}>Contact</a></p>
      </footer>
    </div>
  );
}
