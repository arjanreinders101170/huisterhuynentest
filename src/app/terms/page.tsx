"use client";
const C = { bg: "#EAE3D2", text: "#2A2418", muted: "#8A7D6A", gold: "#B49A5E" };
export default function TermsPage() {
  return (
    <div style={{ background: C.bg, fontFamily: "'DM Sans',system-ui,sans-serif", color: C.text, minHeight: "100vh" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
        <h1 style={{ fontFamily: "Georgia,serif", fontSize: 36, marginBottom: 12 }}>Algemene Voorwaarden</h1>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 40 }}>Laatst bijgewerkt: Mei 2026</p>
        <div style={{ lineHeight: 1.8 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>1. Toepasselijkheid</h2>
          <p>Deze voorwaarden zijn van toepassing op alle boekingen bij Huis ter Huynen.</p>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>2. Annulering</h2>
          <p><strong>Gratis annulering:</strong> Tot 14 dagen voor aankomst.</p>
          <p><strong>50% refund:</strong> Tot 7 dagen voor aankomst.</p>
          <p><strong>Geen refund:</strong> Minder dan 7 dagen voor aankomst.</p>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>3. Check-in / Check-out</h2>
          <p>Check-in: 15:00 · Check-out: 11:00</p>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>4. Huisregels</h2>
          <p>Niet roken · Geen huisdieren zonder overleg · Geen feesten · Stilte 22:00–08:00</p>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>5. Contact</h2>
          <p>Huis ter Huynen · Zuiderstraat 6 · 9491 EC Zeijen · <a href="mailto:lodge@huisterhuynen.nl" style={{ color: C.gold }}>lodge@huisterhuynen.nl</a></p>
        </div>
        <div style={{ marginTop: 60, textAlign: "center", fontSize: 13 }}>
          <a href="/" style={{ color: C.gold, textDecoration: "none" }}>← Terug naar home</a>
        </div>
      </div>
    </div>
  );
}
