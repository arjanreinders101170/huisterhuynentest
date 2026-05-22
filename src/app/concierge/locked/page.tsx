import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Huis ter Huynen — Concierge",
  description: "De concierge app is alleen toegankelijk voor gasten met een geldige uitnodiging.",
  robots: { index: false, follow: false },
};

export default function ConciergeLockedPage() {
  return (
    <div style={{
      background: "#EAE3D2",
      minHeight: "100vh",
      fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
    }}>
      <div style={{ maxWidth: 430, margin: "0 auto", padding: "0 24px 60px" }}>
        <div style={{
          height: 4, margin: "0 -24px",
          background: "linear-gradient(90deg, transparent, #B49A5E, transparent)",
        }} />

        {/* Logo */}
        <div style={{ textAlign: "center", paddingTop: 64, marginBottom: 8 }}>
          <div style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontSize: 22, fontWeight: 600, color: "#52502E", letterSpacing: ".03em",
          }}>
            <span style={{ fontSize: 25 }}>H</span>UIS
            <span style={{ fontSize: 14, fontWeight: 400, margin: "0 4px", letterSpacing: ".1em" }}> TER </span>
            <span style={{ fontSize: 25 }}>H</span>UYNEN
          </div>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 8, marginTop: 3,
          }}>
            <div style={{ width: 28, height: 1, background: "#B49A5E" }} />
            <span style={{
              fontSize: 9, fontWeight: 500, color: "#B49A5E",
              letterSpacing: ".22em", textTransform: "uppercase" as const,
            }}>
              Boutique Lodge
            </span>
            <div style={{ width: 28, height: 1, background: "#B49A5E" }} />
          </div>
        </div>

        {/* Lock icon */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "rgba(47,79,62,.08)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#2F4F3E",
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>

        {/* Title + body */}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <h1 style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontSize: 28, fontWeight: 700, color: "#2A2418",
            lineHeight: 1.2, margin: "0 0 12px",
          }}>
            Alleen voor onze gasten
          </h1>
          <p style={{
            fontSize: 15, color: "#8A7D6A", fontWeight: 300,
            lineHeight: 1.6, margin: "0 auto", maxWidth: 320,
          }}>
            Deze concierge-app is gekoppeld aan een verblijf bij Huis ter Huynen.
            Open de persoonlijke link uit je welkomstmail — daarmee staat alles voor je klaar.
          </p>
        </div>

        {/* Actions */}
        <div style={{ marginTop: 32, display: "flex", flexDirection: "column" as const, gap: 12 }}>
          <a
            href="https://wa.me/31642568603"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              padding: 16, borderRadius: 16,
              background: "linear-gradient(135deg, #2F4F3E 0%, #3A6350 100%)",
              color: "#fff", textDecoration: "none", fontSize: 15, fontWeight: 500,
              boxShadow: "0 8px 24px rgba(47,79,62,.2)",
              fontFamily: "var(--font-playfair), Georgia, serif",
            }}
          >
            WhatsApp ons
          </a>
          <a
            href="tel:+31642568603"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 14, borderRadius: 16,
              background: "#FDFBF6", color: "#2A2418", textDecoration: "none",
              border: "1px solid #E0D8C8",
              fontSize: 14, fontWeight: 500,
            }}
          >
            Bel +31 6 42568603
          </a>
          <a
            href="/"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 14, fontSize: 13, color: "#8A7D6A",
              textDecoration: "none", fontWeight: 400,
            }}
          >
            Terug naar huisterhuynen.nl
          </a>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 40, textAlign: "center" as const }}>
          <div style={{ width: 40, height: 1, background: "#B49A5E", opacity: 0.4, margin: "0 auto 16px" }} />
          <p style={{ fontSize: 11, color: "#8A7D6A", fontWeight: 300 }}>
            Huis ter Huynen · Zuiderstraat 6 · Zeijen
          </p>
        </div>
      </div>
    </div>
  );
}
