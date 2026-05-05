"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const T = {
  bg: "#EAE3D2", card: "#FDFBF6", green: "#2F4F3E",
  text: "#2A2418", muted: "#8A7D6A",
};

function BetaaldContent() {
  const params = useSearchParams();
  const product = params.get("product") || "je bestelling";

  return (
    <div style={{
      background: T.bg, minHeight: "100vh",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div style={{ maxWidth: 380, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>🌿</div>
        <div style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 28, fontWeight: 700, color: T.text,
          marginBottom: 10,
        }}>
          Bedankt voor je betaling
        </div>
        <p style={{
          fontSize: 15, color: T.muted, fontWeight: 300,
          lineHeight: 1.6, marginBottom: 24,
        }}>
          Je betaling voor <strong style={{ color: T.text, fontWeight: 500 }}>{product}</strong> wordt
          verwerkt. Je ontvangt een bevestiging per e-mail.
        </p>

        <div style={{
          background: T.card, borderRadius: 12, padding: "16px 20px",
          border: "1px solid #E0D8C8", textAlign: "left", marginBottom: 28,
        }}>
          <div style={{ fontSize: 13, color: T.green, lineHeight: 2 }}>
            <div>✓ Betaling ontvangen</div>
            <div>✓ Bevestigingsmail onderweg</div>
            <div>✓ Wij regelen de rest</div>
          </div>
        </div>

        <a href="/" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "14px 32px", borderRadius: 14,
          background: T.green, color: "#fff",
          textDecoration: "none", fontSize: 15, fontWeight: 500,
        }}>
          Terug naar de app
        </a>
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
