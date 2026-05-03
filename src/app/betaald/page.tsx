"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function BetaaldContent() {
  const params = useSearchParams();
  const product = params.get("product") || "je bestelling";

  return (
    <div style={{
      background: "#EAE3D2", minHeight: "100vh",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div style={{ maxWidth: 380, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>🌿</div>
        <div style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 28, fontWeight: 700, color: "#2A2418",
          marginBottom: 10,
        }}>
          Betaling ontvangen
        </div>
        <p style={{
          fontSize: 15, color: "#8A7D6A", fontWeight: 300,
          lineHeight: 1.6, marginBottom: 28,
        }}>
          Je betaling voor <strong style={{ color: "#2A2418", fontWeight: 500 }}>{product}</strong> is
          succesvol verwerkt. We regelen alles voor je.
        </p>
        <a
          href="/"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "14px 32px", borderRadius: 14,
            background: "#2F4F3E", color: "#fff",
            textDecoration: "none", fontSize: 15, fontWeight: 500,
          }}
        >
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
