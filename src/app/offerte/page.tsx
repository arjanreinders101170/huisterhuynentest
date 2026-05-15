"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const T = {
  bg: "#EAE3D2", card: "#FDFBF6", green: "#2F4F3E",
  gold: "#B49A5E", text: "#2A2418", muted: "#5A534C", border: "#E0D8C8",
};

// Tynaarlo belastingverordening 2026 — vakantiehuis (geen camping/groep)
const TOERISTENBELASTING_PER_PPN = 1.50;

function OfferteForm() {
  const params = useSearchParams();
  const aanvraagId = params.get("id") || "";
  const gastEmail = params.get("email") || "";
  const gastNaam = params.get("naam") || "";
  const van = params.get("van") || "";
  const tot = params.get("tot") || "";
  const personenParam = params.get("personen") || "2";

  const [personen, setPersonen] = useState(personenParam);
  const [nachten, setNachten] = useState("");
  const [prijsVerblijf, setPrijsVerblijf] = useState("");
  const [toeristenbelasting, setToeristenbelasting] = useState("");
  const [belastingAuto, setBelastingAuto] = useState(true);
  const [schoonmaak, setSchoonmaak] = useState("75");
  const [bericht, setBericht] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const autoBelasting = useMemo(() => {
    const p = parseInt(personen) || 0;
    const n = parseInt(nachten) || 0;
    return p > 0 && n > 0 ? (p * n * TOERISTENBELASTING_PER_PPN).toFixed(2) : "";
  }, [personen, nachten]);

  const effectieveBelasting = belastingAuto && autoBelasting ? autoBelasting : toeristenbelasting;

  const totaal = (
    (parseFloat(prijsVerblijf) || 0) +
    (parseFloat(effectieveBelasting) || 0) +
    (parseFloat(schoonmaak) || 0)
  ).toFixed(2);

  const canSend = prijsVerblijf && gastEmail && !sending;

  const submit = async () => {
    if (!canSend) return;
    setSending(true);
    try {
      const r = await fetch("/api/offerte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aanvraagId, gastEmail, gastNaam, van, tot,
          personen: parseInt(personen),
          prijsVerblijf,
          toeristenbelasting: effectieveBelasting,
          schoonmaak, bericht,
        }),
      });
      if (r.ok) setSent(true);
    } catch {}
    setSending(false);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", borderRadius: 10,
    border: `1px solid ${T.border}`, background: T.card,
    fontFamily: "Arial, sans-serif", fontSize: 16, color: T.text,
    outline: "none", boxSizing: "border-box",
  };

  if (sent) {
    return (
      <div style={{ textAlign: "center", padding: "60px 24px" }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>✉️</div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: "bold", color: T.text, margin: "0 0 10px" }}>
          Offerte verstuurd
        </h1>
        <p style={{ fontFamily: "Arial, sans-serif", fontSize: 15, color: T.muted, lineHeight: 1.6 }}>
          {gastNaam || "De gast"} ontvangt het aanbod op {gastEmail}.
        </p>
        <p style={{ fontFamily: "Arial, sans-serif", fontSize: 14, color: T.green, fontWeight: "bold", marginTop: 16 }}>
          Totaal: € {totaal}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: 26, fontWeight: "bold", color: T.text, margin: "0 0 6px" }}>
        Offerte versturen
      </h1>
      <p style={{ fontFamily: "Arial, sans-serif", fontSize: 14, color: T.muted, margin: "0 0 28px" }}>
        Vul de bedragen in en verstuur het aanbod
      </p>

      {/* Guest info (read-only) */}
      <div style={{
        background: "#F5F1E8", borderRadius: 10, padding: "16px 18px", marginBottom: 24,
        fontFamily: "Arial, sans-serif", fontSize: 14,
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={{ padding: "4px 0", color: T.muted, width: 90 }}>Gast</td>
              <td style={{ padding: "4px 0", color: T.text, fontWeight: "bold" }}>{gastNaam || "—"}</td>
            </tr>
            <tr>
              <td style={{ padding: "4px 0", color: T.muted }}>E-mail</td>
              <td style={{ padding: "4px 0", color: T.text }}>{gastEmail}</td>
            </tr>
            <tr>
              <td style={{ padding: "4px 0", color: T.muted }}>Periode</td>
              <td style={{ padding: "4px 0", color: T.text, fontWeight: "bold" }}>{van} t/m {tot}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Price fields */}
      <div style={{ fontFamily: "Arial, sans-serif", fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12, fontWeight: "bold" }}>
        Prijsopbouw
      </div>

      {/* Personen + nachten — basis voor automatische toeristenbelasting */}
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontFamily: "Arial, sans-serif", fontSize: 14, color: T.text, display: "block", marginBottom: 4 }}>Personen</label>
          <input value={personen} onChange={e => setPersonen(e.target.value)} type="number" min="1" max="6" style={inputStyle} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontFamily: "Arial, sans-serif", fontSize: 14, color: T.text, display: "block", marginBottom: 4 }}>Nachten</label>
          <input value={nachten} onChange={e => setNachten(e.target.value)} type="number" min="1" placeholder="7" style={inputStyle} />
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <label style={{ fontFamily: "Arial, sans-serif", fontSize: 14, color: T.text }}>Verblijf (prijs per periode)</label>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "Arial, sans-serif", fontSize: 16, color: T.muted }}>€</span>
          <input value={prijsVerblijf} onChange={e => setPrijsVerblijf(e.target.value)} placeholder="285.00" type="number" step="0.01" style={inputStyle} />
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
          <label style={{ fontFamily: "Arial, sans-serif", fontSize: 14, color: T.text }}>
            Toeristenbelasting
            {belastingAuto && autoBelasting && (
              <span style={{ marginLeft: 8, fontSize: 11, color: T.gold, fontWeight: "normal" }}>
                auto: {personen}p × {nachten}n × € {TOERISTENBELASTING_PER_PPN.toFixed(2)}
              </span>
            )}
          </label>
          {!belastingAuto && (
            <button type="button" onClick={() => { setBelastingAuto(true); setToeristenbelasting(""); }}
              style={{ background: "none", border: "none", color: T.green, fontSize: 11, cursor: "pointer", textDecoration: "underline", padding: 0 }}>
              ↻ auto
            </button>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "Arial, sans-serif", fontSize: 16, color: T.muted }}>€</span>
          <input
            value={belastingAuto ? autoBelasting : toeristenbelasting}
            onChange={e => { setBelastingAuto(false); setToeristenbelasting(e.target.value); }}
            placeholder={autoBelasting || "12.50"} type="number" step="0.01" style={inputStyle}
          />
        </div>
        <p style={{ margin: "4px 0 0", fontSize: 11, color: T.muted, fontFamily: "Arial, sans-serif" }}>
          Tynaarlo 2026: € 1,50 p.p. per nacht (vakantiehuis)
        </p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontFamily: "Arial, sans-serif", fontSize: 14, color: T.text, display: "block", marginBottom: 4 }}>Eindschoonmaak</label>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "Arial, sans-serif", fontSize: 16, color: T.muted }}>€</span>
          <input value={schoonmaak} onChange={e => setSchoonmaak(e.target.value)} placeholder="75.00" type="number" step="0.01" style={inputStyle} />
        </div>
      </div>

      {/* Total */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "16px 0", borderTop: `2px solid ${T.border}`, borderBottom: `2px solid ${T.border}`,
        marginBottom: 20,
      }}>
        <span style={{ fontFamily: "Arial, sans-serif", fontSize: 16, fontWeight: "bold", color: T.text }}>Totaal</span>
        <span style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: "bold", color: T.green }}>€ {totaal}</span>
      </div>

      {/* Personal message */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontFamily: "Arial, sans-serif", fontSize: 14, color: T.text, display: "block", marginBottom: 4 }}>
          Persoonlijk bericht <span style={{ color: T.muted, fontWeight: "normal" }}>(optioneel)</span>
        </label>
        <textarea value={bericht} onChange={e => setBericht(e.target.value)}
          placeholder="Bijv. Leuk dat jullie terugkomen! We hebben de lodge extra mooi gemaakt..."
          rows={3}
          style={{ ...inputStyle, resize: "none", lineHeight: 1.5, fontFamily: "Arial, sans-serif", fontSize: 14 }} />
      </div>

      {/* Send button */}
      <button onClick={submit} disabled={!canSend} style={{
        width: "100%", padding: 16, borderRadius: 10, border: "none",
        background: canSend ? T.green : T.border,
        color: "#fff", fontFamily: "Georgia, serif", fontSize: 16, fontWeight: "bold",
        cursor: canSend ? "pointer" : "not-allowed",
      }}>
        {sending ? "Versturen..." : "Verstuur offerte naar gast"}
      </button>

      <p style={{
        fontFamily: "Arial, sans-serif", fontSize: 11, color: T.muted,
        textAlign: "center", marginTop: 12,
      }}>
        De gast ontvangt een mooie e-mail met dit aanbod
      </p>
    </div>
  );
}

export default function OffertePage() {
  return (
    <div style={{
      background: T.bg, minHeight: "100vh",
      fontFamily: "Arial, sans-serif",
    }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "32px 24px 60px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: "bold", color: "#52502E", letterSpacing: 2 }}>
            HUIS TER HUYNEN
          </div>
          <div style={{ fontSize: 9, color: T.gold, letterSpacing: 3, textTransform: "uppercase", marginTop: 4 }}>
            Boutique Lodge
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: T.card, borderRadius: 12, border: `1px solid ${T.border}`,
          padding: "28px 24px", boxShadow: "0 2px 12px rgba(47,79,62,.06)",
        }}>
          <Suspense fallback={<div>Laden...</div>}>
            <OfferteForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
