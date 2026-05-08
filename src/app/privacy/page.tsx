"use client";
const C = { bg: "#EAE3D2", text: "#2A2418", muted: "#8A7D6A", gold: "#B49A5E" };
export default function PrivacyPage() {
  return (
    <div style={{ background: C.bg, fontFamily: "'DM Sans',system-ui,sans-serif", color: C.text, minHeight: "100vh" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
        <h1 style={{ fontFamily: "Georgia,serif", fontSize: 36, marginBottom: 12 }}>Privacybeleid</h1>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 40 }}>Laatst bijgewerkt: Mei 2026</p>
        <div style={{ lineHeight: 1.8 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>1. Over ons</h2>
          <p>Huis ter Huynen is een boutique lodge bedrijf gevestigd te Zeijen, Drenthe. Wij verwerken persoonsgegevens conform de AVG.</p>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>2. Gegevens die wij verzamelen</h2>
          <p>Naam, e-mailadres, verblijfsdata, betaalgegevens (via Mollie), IP-adres.</p>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>3. Uw rechten</h2>
          <p>U heeft recht op inzage, correctie, verwijdering en portabiliteit van uw gegevens. Contact: <a href="mailto:lodge@huisterhuynen.nl" style={{ color: C.gold }}>lodge@huisterhuynen.nl</a></p>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginTop: 32, marginBottom: 12 }}>4. Contact</h2>
          <p>Huis ter Huynen · Zuiderstraat 6 · 9491 EC Zeijen · <a href="tel:+31642568603" style={{ color: C.gold }}>+31 6 42568603</a></p>
        </div>
        <div style={{ marginTop: 60, textAlign: "center", fontSize: 13 }}>
          <a href="/" style={{ color: C.gold, textDecoration: "none" }}>← Terug naar home</a>
        </div>
      </div>
    </div>
  );
}
