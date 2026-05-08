"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const T = {
  bg: "#EAE3D2", card: "#FDFBF6", green: "#2F4F3E",
  text: "#2A2418", muted: "#8A7D6A", gold: "#B49A5E", border: "#E0D8C8",
};

function BetaaldContent() {
  const params = useSearchParams();
  const product = params.get("product") || "je bestelling";

  // Product-specific hero image
  const heroImage = (() => {
    const p = product.toLowerCase();
    if (p.includes("fiets") || p.includes("bike") || p.includes("ebike") || p.includes("atb")) return "/rent_a_bike.jpg";
    if (p.includes("late") || p.includes("check-out") || p.includes("checkout")) return "/late_check_out.jpg";
    return "/borrel1.jpg";
  })();

  return (
    <div style={{
      background: T.bg, minHeight: "100vh",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16,
    }}>
      <div style={{ maxWidth: 420, width: "100%" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 18, fontWeight: 700, color: "#52502E", letterSpacing: 2 }}>HUIS TER HUYNEN</div>
          <div style={{ marginTop: 6 }}>
            <span style={{ display: "inline-block", width: 20, height: 1, background: T.gold, verticalAlign: "middle" }}></span>
            <span style={{ fontSize: 8, color: T.gold, letterSpacing: 2.5, textTransform: "uppercase" as const, padding: "0 8px", verticalAlign: "middle" }}>Boutique Lodge</span>
            <span style={{ display: "inline-block", width: 20, height: 1, background: T.gold, verticalAlign: "middle" }}></span>
          </div>
        </div>

        {/* Card with hero image */}
        <div style={{
          background: T.card, borderRadius: 12,
          border: `1px solid ${T.border}`, overflow: "hidden",
        }}>
          {/* Hero image */}
          <img
            src={heroImage}
            alt={product}
            style={{ display: "block", width: "100%", height: 180, objectFit: "cover" }}
          />

          {/* Content */}
          <div style={{ padding: "28px 24px", textAlign: "center" }}>
            <div style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 26, fontWeight: 700, color: T.text,
              marginBottom: 10,
            }}>
              Bedankt voor je betaling
            </div>
            <p style={{
              fontSize: 15, color: T.muted, fontWeight: 300,
              lineHeight: 1.6, marginBottom: 24, margin: "0 0 24px",
            }}>
              Je betaling voor <strong style={{ color: T.text, fontWeight: 500 }}>{product}</strong> is
              ontvangen. Je krijgt een bevestiging per e-mail.
            </p>

            <div style={{
              background: "#F5F1E8", borderRadius: 10, padding: "16px 20px",
              textAlign: "left", marginBottom: 24,
            }}>
              <div style={{ fontSize: 13, color: T.green, lineHeight: 2.2 }}>
                <div>✓ Betaling ontvangen</div>
                <div>✓ Bevestigingsmail onderweg</div>
                <div>✓ Wij regelen de rest</div>
              </div>
            </div>

            <a href="/app" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "16px 40px", borderRadius: 12,
              background: T.green, color: "#fff",
              textDecoration: "none", fontSize: 15, fontWeight: 500,
            }}>
              Terug naar de app →
            </a>

            <div style={{
              marginTop: 20, paddingTop: 16, borderTop: `1px solid ${T.border}`,
              fontSize: 12, color: T.muted,
            }}>
              WhatsApp ons op <a href="tel:+31642568603" style={{ color: T.green, fontWeight: 600, textDecoration: "none" }}>+31 6 42568603</a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <div style={{ display: "inline-block", width: 40, height: 1, background: T.gold }}></div>
          <p style={{ fontSize: 11, color: T.muted, marginTop: 10 }}>Huis ter Huynen · Zuiderstraat 6 · Zeijen, Drenthe</p>
        </div>

      </div>
    </div>
  );
}

export default function BetaaldPage() {
  return (
    <Suspense fallback={<div style={{ background: "#EAE3D2", minHeight: "100vh" }} />}>
      <BetaaldContent />
    </Suspense>
  );
}
