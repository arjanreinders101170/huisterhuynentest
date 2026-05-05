"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const T = {
  bg: "#EAE3D2", card: "#FDFBF6", green: "#2F4F3E", green2: "#3A6350",
  gold: "#B49A5E", text: "#2A2418", muted: "#8A7D6A", border: "#E0D8C8",
};

type Aanvraag = {
  id: string;
  van: string;
  tot: string;
  personen: number;
  status: string;
  offerte_bedrag: number | null;
  gastNaam: string;
  gastEmail: string;
};

function BevestigContent() {
  const params = useSearchParams();
  const id = params.get("id") || "";
  const token = params.get("t") || "";

  const [data, setData] = useState<Aanvraag | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) { setError("Geen aanvraag gevonden"); setLoading(false); return; }
    fetch(`/api/bevestig?id=${id}&t=${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); }
        else if (d.status === "geboekt") { setConfirmed(true); setData(d); }
        else { setData(d); }
        setLoading(false);
      })
      .catch(() => { setError("Kon aanvraag niet laden"); setLoading(false); });
  }, [id, token]);

  const confirm = async () => {
    if (confirming) return;
    setConfirming(true);
    try {
      const r = await fetch("/api/bevestig", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, token }),
      });
      const d = await r.json();
      if (d.success) setConfirmed(true);
      else setError(d.error || "Er ging iets mis");
    } catch { setError("Kon niet bevestigen"); }
    setConfirming(false);
  };

  if (loading) {
    return <p style={{ textAlign: "center", color: T.muted, fontFamily: "Arial, sans-serif", fontSize: 15 }}>Laden...</p>;
  }

  if (error && !confirmed) {
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <p style={{ fontFamily: "Arial, sans-serif", fontSize: 15, color: T.muted }}>{error}</p>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>🌿</div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: "bold", color: T.text, margin: "0 0 10px" }}>
          Bevestigd!
        </h1>
        <p style={{ fontFamily: "Arial, sans-serif", fontSize: 15, color: T.muted, lineHeight: 1.6, margin: "0 0 24px" }}>
          Je reservering is bevestigd. We verheugen ons op jullie komst en nemen binnenkort contact op.
        </p>
        {data && (
          <div style={{ background: "#F5F1E8", borderRadius: 8, padding: "16px 18px", marginBottom: 24, textAlign: "center" }}>
            <p style={{ margin: "0 0 4px", fontFamily: "Georgia, serif", fontSize: 18, fontWeight: "bold", color: T.text }}>{data.van} t/m {data.tot}</p>
            <p style={{ margin: 0, fontFamily: "Arial, sans-serif", fontSize: 13, color: T.green, fontWeight: "bold" }}>{data.personen} personen</p>
          </div>
        )}
        <div style={{ fontFamily: "Arial, sans-serif", fontSize: 13, color: T.green, lineHeight: 2, textAlign: "left", maxWidth: 280, margin: "0 auto" }}>
          <div>✓ Reservering bevestigd</div>
          <div>✓ Bevestigingsmail onderweg</div>
          <div>✓ Praktische info volgt binnenkort</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🌿</div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: "bold", color: T.text, margin: "0 0 6px" }}>
          Jouw aanbod
        </h1>
        <p style={{ fontFamily: "Arial, sans-serif", fontSize: 14, color: T.muted, margin: 0 }}>
          Speciaal voor {data?.gastNaam || "jou"}
        </p>
      </div>

      {/* Period */}
      <div style={{ background: "#F5F1E8", borderRadius: 8, padding: "18px 20px", marginBottom: 20, textAlign: "center" }}>
        <p style={{ margin: "0 0 4px", fontFamily: "Arial, sans-serif", fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: 1 }}>Je verblijf</p>
        <p style={{ margin: "0 0 4px", fontFamily: "Georgia, serif", fontSize: 18, fontWeight: "bold", color: T.text }}>{data?.van} t/m {data?.tot}</p>
        <p style={{ margin: 0, fontFamily: "Arial, sans-serif", fontSize: 13, color: T.green, fontWeight: "bold" }}>{data?.personen} personen</p>
      </div>

      {/* Price */}
      {data?.offerte_bedrag && (
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "18px 0", borderTop: `2px solid ${T.border}`, borderBottom: `2px solid ${T.border}`,
          marginBottom: 24,
        }}>
          <span style={{ fontFamily: "Arial, sans-serif", fontSize: 16, fontWeight: "bold", color: T.text }}>Totaal</span>
          <span style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: "bold", color: T.green }}>€ {data.offerte_bedrag.toFixed(2)}</span>
        </div>
      )}

      {/* Trust */}
      <div style={{ marginBottom: 24, fontFamily: "Arial, sans-serif", fontSize: 13, color: T.green, lineHeight: 2 }}>
        <div>✓ Beste prijs garantie</div>
        <div>✓ Persoonlijk afgestemd</div>
        <div>✓ Direct bevestigd, geen wachttijd</div>
      </div>

      {/* CTA */}
      <button onClick={confirm} disabled={confirming} style={{
        width: "100%", padding: 18, borderRadius: 10, border: "none",
        background: confirming ? T.border : `linear-gradient(135deg, ${T.green}, ${T.green2})`,
        color: "#fff", fontFamily: "Georgia, serif", fontSize: 18, fontWeight: "bold",
        cursor: confirming ? "not-allowed" : "pointer",
        boxShadow: confirming ? "none" : "0 8px 32px rgba(47,79,62,.25)",
      }}>
        {confirming ? "Bevestigen..." : "Bevestig mijn reservering"}
      </button>

      <p style={{
        fontFamily: "Arial, sans-serif", fontSize: 11, color: T.muted,
        textAlign: "center", marginTop: 12, lineHeight: 1.5,
      }}>
        Na bevestiging nemen wij contact op met praktische informatie
      </p>

      {/* Contact */}
      <div style={{
        marginTop: 24, paddingTop: 16, borderTop: `1px solid ${T.border}`,
        fontFamily: "Arial, sans-serif", fontSize: 12, color: T.muted, textAlign: "center",
      }}>
        Vragen? Bel <a href="tel:+31612345678" style={{ color: T.green, textDecoration: "none", fontWeight: "bold" }}>+31 6 12 34 56 78</a>
      </div>
    </div>
  );
}

export default function BevestigPage() {
  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "32px 24px 60px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: "bold", color: "#52502E", letterSpacing: 2 }}>HUIS TER HUYNEN</div>
          <div style={{ fontSize: 9, color: T.gold, letterSpacing: 3, textTransform: "uppercase", marginTop: 4 }}>Boutique Lodge</div>
        </div>
        {/* Card */}
        <div style={{ background: T.card, borderRadius: 12, border: `1px solid ${T.border}`, padding: "28px 24px", boxShadow: "0 2px 12px rgba(47,79,62,.06)" }}>
          <Suspense fallback={<p style={{ textAlign: "center", color: T.muted }}>Laden...</p>}>
            <BevestigContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
