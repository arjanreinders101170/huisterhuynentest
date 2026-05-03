import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Welkom – Huis ter Huynen",
  description: "Alles wat je moet weten voor je verblijf",
};

export default function WelkomPage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://huisterhuynentest.vercel.app";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(appUrl)}&size=200x200&color=2F4F3E&bgcolor=FDFBF6`;
  const mapsUrl = "https://www.google.com/maps/dir/?api=1&destination=53.1052,6.5058&travelmode=driving";

  return (
    <div style={{
      background: "#EAE3D2",
      minHeight: "100vh",
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      <div style={{ maxWidth: 430, margin: "0 auto", padding: "0 24px 60px" }}>

        {/* Gold accent */}
        <div style={{
          height: 4, margin: "0 -24px",
          background: "linear-gradient(90deg, transparent, #B49A5E, transparent)",
        }} />

        {/* Logo */}
        <div style={{ textAlign: "center", paddingTop: 48, marginBottom: 8 }}>
          <div style={{
            fontFamily: "'Playfair Display', Georgia, serif",
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

        {/* Welcome */}
        <div style={{ textAlign: "center", margin: "32px 0 36px" }}>
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 32, fontWeight: 700, color: "#2A2418",
            lineHeight: 1.15, margin: "0 0 12px",
          }}>
            Fijn dat jullie komen
          </h1>
          <p style={{
            fontSize: 15, color: "#8A7D6A", fontWeight: 300,
            lineHeight: 1.6, margin: 0, maxWidth: 300, marginLeft: "auto", marginRight: "auto",
          }}>
            Hier vind je alles wat je moet weten voor een ontspannen aankomst bij de lodge.
          </p>
        </div>

        {/* Info cards */}
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 14 }}>

          {/* Check-in */}
          <div style={{
            background: "#FDFBF6", borderRadius: 16,
            border: "1px solid #E0D8C8", padding: "20px 22px",
            boxShadow: "0 2px 12px rgba(47,79,62,.06)",
          }}>
            <div style={{
              fontSize: 11, color: "#8A7D6A", textTransform: "uppercase" as const,
              letterSpacing: ".06em", marginBottom: 10, fontWeight: 500,
            }}>
              Check-in
            </div>
            <div style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 28, fontWeight: 600, color: "#2F4F3E", marginBottom: 6,
            }}>
              15:00
            </div>
            <p style={{ fontSize: 13, color: "#8A7D6A", fontWeight: 300, lineHeight: 1.6, margin: 0 }}>
              Je bent welkom vanaf 15:00. De deur open je via de app of met toegangscode 4821.
              Check-out is de volgende dag om 11:00.
            </p>
          </div>

          {/* Adres + route */}
          <div style={{
            background: "#FDFBF6", borderRadius: 16,
            border: "1px solid #E0D8C8", padding: "20px 22px",
            boxShadow: "0 2px 12px rgba(47,79,62,.06)",
          }}>
            <div style={{
              fontSize: 11, color: "#8A7D6A", textTransform: "uppercase" as const,
              letterSpacing: ".06em", marginBottom: 10, fontWeight: 500,
            }}>
              Adres & route
            </div>
            <p style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 18, fontWeight: 600, color: "#2A2418",
              margin: "0 0 6px",
            }}>
              Zeijen, Drenthe
            </p>
            <p style={{ fontSize: 13, color: "#8A7D6A", fontWeight: 300, lineHeight: 1.6, margin: "0 0 14px" }}>
              Rustig gelegen in het groen. Navigeer naar de lodge en parkeer gratis op eigen terrein.
            </p>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                width: "100%", padding: 13, borderRadius: 12,
                background: "#2F4F3E", color: "#fff", textDecoration: "none",
                fontSize: 14, fontWeight: 500,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Navigeer naar de lodge
            </a>
          </div>

          {/* Wat meenemen */}
          <div style={{
            background: "#FDFBF6", borderRadius: 16,
            border: "1px solid #E0D8C8", padding: "20px 22px",
            boxShadow: "0 2px 12px rgba(47,79,62,.06)",
          }}>
            <div style={{
              fontSize: 11, color: "#8A7D6A", textTransform: "uppercase" as const,
              letterSpacing: ".06em", marginBottom: 10, fontWeight: 500,
            }}>
              Goed om te weten
            </div>
            {[
              { emoji: "🔑", text: "Deur open je via de app — geen sleutel nodig" },
              { emoji: "📶", text: "Wifi: HuynenGast · wachtwoord: HuynenGast2024" },
              { emoji: "🅿️", text: "Gratis parkeren op eigen terrein" },
              { emoji: "🐕", text: "Huisdieren welkom (overleg vooraf)" },
              { emoji: "🤫", text: "Rust na 22:00 — geniet van de stilte" },
            ].map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "10px 0",
                borderBottom: i < 4 ? "1px solid #E0D8C8" : "none",
              }}>
                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{item.emoji}</span>
                <span style={{ fontSize: 13, color: "#2A2418", fontWeight: 300, lineHeight: 1.5 }}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div style={{
            background: "#FDFBF6", borderRadius: 16,
            border: "1px solid #E0D8C8", padding: "20px 22px",
            boxShadow: "0 2px 12px rgba(47,79,62,.06)",
          }}>
            <div style={{
              fontSize: 11, color: "#8A7D6A", textTransform: "uppercase" as const,
              letterSpacing: ".06em", marginBottom: 10, fontWeight: 500,
            }}>
              Vragen?
            </div>
            <p style={{ fontSize: 13, color: "#8A7D6A", fontWeight: 300, lineHeight: 1.6, margin: "0 0 4px" }}>
              Bel of WhatsApp ons gerust:
            </p>
            <a href="tel:+31612345678" style={{
              fontSize: 18, fontWeight: 500, color: "#2F4F3E", textDecoration: "none",
              fontFamily: "'Playfair Display', Georgia, serif",
            }}>
              +31 6 12 34 56 78
            </a>
          </div>
        </div>

        {/* CTA — open de app */}
        <div style={{ marginTop: 32, textAlign: "center" as const }}>
          <a
            href={appUrl}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              width: "100%", padding: 16, borderRadius: 16,
              background: "linear-gradient(135deg, #2F4F3E 0%, #3A6350 100%)",
              color: "#fff", textDecoration: "none", fontSize: 16, fontWeight: 500,
              boxShadow: "0 8px 32px rgba(47,79,62,.25)",
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Open de conciërge app
          </a>
          <p style={{
            fontSize: 12, color: "#8A7D6A", fontWeight: 300, marginTop: 10,
          }}>
            Tips, restaurants, wandelingen & meer — afgestemd op jou
          </p>
        </div>

        {/* QR Code section — for host to print/share */}
        <div style={{
          marginTop: 40, textAlign: "center" as const,
          padding: "28px 20px", borderRadius: 16,
          background: "#FDFBF6", border: "1px solid #E0D8C8",
        }}>
          <div style={{
            fontSize: 11, color: "#8A7D6A", textTransform: "uppercase" as const,
            letterSpacing: ".06em", marginBottom: 14, fontWeight: 500,
          }}>
            Scan voor de app
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrUrl}
            alt="QR code naar de conciërge app"
            width={160}
            height={160}
            style={{
              borderRadius: 12, border: "1px solid #E0D8C8",
            }}
          />
          <p style={{
            fontSize: 11, color: "#8A7D6A", fontWeight: 300, marginTop: 12,
            maxWidth: 220, marginLeft: "auto", marginRight: "auto",
          }}>
            Scan met je telefoon om de digitale conciërge te openen
          </p>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 36, textAlign: "center" as const,
        }}>
          <div style={{ width: 40, height: 1, background: "#B49A5E", opacity: 0.4, margin: "0 auto 16px" }} />
          <p style={{ fontSize: 11, color: "#8A7D6A", fontWeight: 300 }}>
            Huis ter Huynen · Boutique Lodge · Zeijen, Drenthe
          </p>
        </div>
      </div>
    </div>
  );
}
