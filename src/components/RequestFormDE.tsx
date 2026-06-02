"use client";
import { useState } from "react";
import { BOOKINGS_OPEN_FROM } from "@/data/lodge";
import { pushEvent, baseEnvelope, newEventId, saveUserCache } from "@/lib/tracking/dataLayer";

const T = {
  bg: "#EAE3D2", card: "#FDFBF6", green: "#2F4F3E",
  gold: "#B49A5E", text: "#2A2418", muted: "#5A534C",
  border: "#E0D8C8", serif: "Georgia,'Times New Roman',serif",
  sans: "var(--font-dm-sans), system-ui, sans-serif",
};

type Lodge = "lodge_1" | "lodge_2";
const LODGE_LABELS: Record<Lodge, string> = { lodge_1: "De Heide", lodge_2: "De Eik" };
const LODGE_DESC: Record<Lodge, string> = {
  lodge_1: "Panoramablick über die Heide, eigene Sauna",
  lodge_2: "Unter den Eichen, vollständige Küche & BBQ",
};

function diffDays(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

export default function RequestFormDE() {
  const [lodge, setLodge] = useState<Lodge>("lodge_1");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [bericht, setBericht] = useState("");
  const [aantalPersonen, setAantalPersonen] = useState(2);
  const [huisdieren, setHuisdieren] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const minDate = BOOKINGS_OPEN_FROM;
  const nights = checkIn && checkOut ? diffDays(checkIn, checkOut) : 0;
  const datesValid = !!checkIn && !!checkOut && nights >= 2;
  const canSubmit = datesValid && naam.trim() && email.includes("@") && !sending;

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px", borderRadius: 10,
    border: `1px solid ${T.border}`, background: "#fff",
    fontFamily: T.sans, fontSize: 14, color: T.text,
    outline: "none", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontFamily: T.sans, fontSize: 12, color: T.muted, marginBottom: 4,
  };

  const handleSubmit = async () => {
    setError("");
    if (!checkIn || !checkOut) { setError("Bitte wählen Sie ein Anreise- und Abreisedatum."); return; }
    if (nights < 2) { setError("Ein Aufenthalt dauert mindestens 2 Nächte."); return; }
    if (!naam.trim() || !email.includes("@")) { setError("Bitte geben Sie Ihren Namen und Ihre E-Mail-Adresse an."); return; }

    setSending(true);
    try {
      const metaEventId = newEventId();
      const [firstName, ...rest] = naam.trim().split(/\s+/);
      const lastName = rest.join(" ") || undefined;
      saveUserCache({ em: email.trim(), fn: firstName, ln: lastName });

      const baseLead = baseEnvelope("Lead");
      pushEvent({
        ...baseLead,
        event_id: metaEventId,
        ecommerce: { currency: "EUR", value: 0 },
        lead: { form: "de_anfrage", value: 0 },
        booking: { check_in: checkIn, check_out: checkOut, lodge, nights, guests: aantalPersonen },
        user: { ...baseLead.user, em: email.trim(), fn: firstName, ln: lastName },
      });

      const res = await fetch("/api/reservering", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          naam: naam.trim(),
          email: email.trim(),
          lodge,
          checkIn,
          checkOut,
          nights: String(nights),
          totalPrice: "0",
          priceLabel: "Op aanvraag",
          bericht: bericht.trim(),
          aantalPersonen: String(aantalPersonen),
          huisdieren: huisdieren ? "ja" : "nee",
          _meta: { event_id: metaEventId },
        }),
      });
      if (!res.ok) throw new Error("request failed");
      setSent(true);
    } catch {
      setError("Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder schreiben Sie uns auf WhatsApp.");
    }
    setSending(false);
  };

  if (sent) {
    return (
      <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center", padding: "48px 28px", background: "#fff", border: `1px solid ${T.border}`, borderRadius: 16, boxShadow: "0 4px 24px rgba(47,79,62,.08)" }}>
        <div style={{ fontSize: 36, marginBottom: 14, color: T.green }}>✓</div>
        <div style={{ fontFamily: T.serif, fontSize: 24, fontWeight: 700, color: T.green, marginBottom: 10 }}>
          Anfrage erhalten
        </div>
        <p style={{ fontFamily: T.sans, fontSize: 15, color: T.muted, lineHeight: 1.7, margin: "0 auto", maxWidth: 440 }}>
          Vielen Dank, {naam.split(" ")[0]}. Wir prüfen Ihre gewünschten Daten persönlich und senden Ihnen innerhalb von 24 Stunden ein maßgeschneidertes Angebot an {email}.
        </p>
        <button
          onClick={() => { setSent(false); setCheckIn(""); setCheckOut(""); setNaam(""); setEmail(""); setBericht(""); setAantalPersonen(2); setHuisdieren(false); }}
          style={{ marginTop: 24, padding: "11px 26px", borderRadius: 10, border: `1px solid ${T.border}`, background: "#fff", fontFamily: T.sans, fontSize: 13, color: T.muted, cursor: "pointer" }}
        >
          Neue Anfrage
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", background: "#fff", border: `1px solid ${T.border}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 24px rgba(47,79,62,.08)" }}>
      <div style={{ padding: "28px 28px 24px" }}>
        {/* Lodge Auswahl */}
        <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 12 }}>
          Welche Lodge bevorzugen Sie?
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 22 }}>
          {(["lodge_1", "lodge_2"] as Lodge[]).map(l => (
            <button
              key={l}
              type="button"
              onClick={() => setLodge(l)}
              style={{
                textAlign: "left", padding: "14px 16px", borderRadius: 12, cursor: "pointer",
                border: lodge === l ? `2px solid ${T.green}` : `1px solid ${T.border}`,
                background: lodge === l ? "rgba(47,79,62,.05)" : "#fff",
                transition: "border-color .15s, background .15s",
              }}
            >
              <div style={{ fontFamily: T.serif, fontSize: 16, fontWeight: 700, color: T.green, marginBottom: 3 }}>
                Lodge {LODGE_LABELS[l]}
              </div>
              <div style={{ fontFamily: T.sans, fontSize: 12, color: T.muted, lineHeight: 1.4 }}>
                {LODGE_DESC[l]}
              </div>
            </button>
          ))}
        </div>

        {/* Daten */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 6 }}>
          <div>
            <label style={labelStyle}>Gewünschtes Anreisedatum *</label>
            <input type="date" value={checkIn} min={minDate}
              onChange={e => { setCheckIn(e.target.value); if (checkOut && e.target.value >= checkOut) setCheckOut(""); }}
              style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Gewünschtes Abreisedatum *</label>
            <input type="date" value={checkOut} min={checkIn || minDate}
              onChange={e => setCheckOut(e.target.value)} style={inputStyle} />
          </div>
        </div>
        <p style={{ fontFamily: T.sans, fontSize: 11, color: T.muted, margin: "0 0 20px" }}>
          {nights > 0
            ? `${nights} Nacht${nights !== 1 ? "e" : ""} ausgewählt${nights < 2 ? " — Mindestaufenthalt 2 Nächte" : ""}`
            : "Mindestaufenthalt 2 Nächte."}
        </p>

        {/* Personen + Haustiere */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Personenanzahl *</label>
            <div style={{ display: "flex", alignItems: "center", border: `1px solid ${T.border}`, borderRadius: 10, background: "#fff", overflow: "hidden" }}>
              <button type="button" onClick={() => setAantalPersonen(p => Math.max(1, p - 1))}
                style={{ width: 40, height: 44, border: "none", background: "transparent", fontFamily: T.sans, fontSize: 18, color: T.text, cursor: "pointer", flexShrink: 0 }}>−</button>
              <span style={{ flex: 1, textAlign: "center", fontFamily: T.sans, fontSize: 14, color: T.text, fontWeight: 600 }}>{aantalPersonen}</span>
              <button type="button" onClick={() => setAantalPersonen(p => Math.min(4, p + 1))}
                style={{ width: 40, height: 44, border: "none", background: "transparent", fontFamily: T.sans, fontSize: 18, color: T.text, cursor: "pointer", flexShrink: 0 }}>+</button>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <label style={{
              display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
              border: `1px solid ${huisdieren ? T.green : T.border}`, borderRadius: 10,
              padding: "11px 14px", background: huisdieren ? "rgba(47,79,62,.06)" : "#fff",
              transition: "border-color .15s, background .15s",
            }}>
              <input type="checkbox" checked={huisdieren} onChange={e => setHuisdieren(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: T.green, cursor: "pointer", flexShrink: 0 }} />
              <span style={{ fontFamily: T.sans, fontSize: 13, color: T.text }}>Ich bringe ein Haustier mit</span>
            </label>
          </div>
        </div>

        {/* Kontaktdaten */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Name *</label>
            <input value={naam} onChange={e => setNaam(e.target.value)} placeholder="Max Mustermann" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>E-Mail-Adresse *</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="max@beispiel.de" type="email" style={inputStyle} />
          </div>
        </div>
        <div style={{ marginBottom: 22 }}>
          <label style={labelStyle}>Nachricht (optional)</label>
          <textarea value={bericht} onChange={e => setBericht(e.target.value)} placeholder="Z.B. ein besonderer Anlass, flexible Reisedaten oder eine Frage..." rows={3}
            style={{ ...inputStyle, resize: "vertical", fontFamily: T.sans }} />
        </div>

        {error && (
          <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 8, background: "rgba(198,40,40,.07)", border: "1px solid #FFCDD2", fontFamily: T.sans, fontSize: 13, color: "#C62828" }}>
            {error}
          </div>
        )}

        <button onClick={handleSubmit} disabled={!canSubmit} style={{
          width: "100%", padding: "15px", borderRadius: 12, border: "none",
          background: canSubmit ? T.green : T.border,
          color: "#fff", fontFamily: T.sans, fontSize: 15, fontWeight: 600,
          cursor: canSubmit ? "pointer" : "not-allowed", transition: "background .15s",
        }}>
          {sending ? "Anfrage wird gesendet..." : "Anfrage senden →"}
        </button>
        <p style={{ fontFamily: T.sans, fontSize: 12, color: T.muted, textAlign: "center", margin: "12px 0 0", lineHeight: 1.6 }}>
          Keine Zahlung jetzt. Sie erhalten innerhalb von 24 Stunden ein persönliches Angebot.
        </p>
      </div>
    </div>
  );
}
