"use client";
import { useState } from "react";
import { Stay } from "../types";

export function VerblijvenTab({ stays, setStays }: { stays: Stay[]; setStays: (s: Stay[]) => void }) {
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ naam: "", email: "", lodge: "lodge_1", check_in: "", check_out: "" });
  const [saving, setSaving] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [lcSentIds, setLcSentIds] = useState<Set<string>>(new Set());

  const C = { bg: "#F5F3EE", card: "#fff", border: "#E8E4DC", text: "#2A2418", muted: "#8A7D6A", light: "#B4AFA5", green: "#2F4F3E", gold: "#B49A5E" };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    border: `1px solid ${C.border}`, background: C.card,
    fontSize: 14, color: C.text, outline: "none", boxSizing: "border-box",
  };

  const createStay = async () => {
    if (!form.naam || !form.email || !form.check_in || !form.check_out) return;
    setSaving(true);
    try {
      const r = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_stay", ...form }),
      });
      const d = await r.json();
      if (d.success) {
        const res = await fetch("/api/admin/data?table=stays");
        const data = await res.json();
        setStays(data.data || []);
        setCreating(false);
        setForm({ naam: "", email: "", lodge: "lodge_1", check_in: "", check_out: "" });
      }
    } catch {}
    setSaving(false);
  };

  const sendWelcome = async (stayId: string) => {
    setSendingId(stayId);
    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_welcome", id: stayId }),
      });
      const res = await fetch("/api/admin/data?table=stays");
      const data = await res.json();
      setStays(data.data || []);
    } catch {}
    setSendingId(null);
  };

  const sendThankyou = async (stayId: string) => {
    setSendingId(stayId);
    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_thankyou", id: stayId }),
      });
      const res = await fetch("/api/admin/data?table=stays");
      const data = await res.json();
      setStays(data.data || []);
    } catch {}
    setSendingId(null);
  };

  const sendLateCheckout = async (stayId: string) => {
    setSendingId(stayId);
    try {
      const r = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_late_checkout", id: stayId }),
      });
      const d = await r.json();
      if (d.success) setLcSentIds(prev => new Set(prev).add(stayId));
    } catch {}
    setSendingId(null);
  };

  const copyStayLink = async (stayId: string) => {
    setLinkError(null);
    try {
      const r = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_stay_link", id: stayId }),
      });
      const d = await r.json();
      if (!r.ok || !d.link) {
        setLinkError(d.error || "Kon link niet ophalen");
        return;
      }
      await navigator.clipboard.writeText(d.link);
      setCopiedId(stayId);
      setTimeout(() => setCopiedId(prev => (prev === stayId ? null : prev)), 2000);
    } catch {
      setLinkError("Kopiëren mislukt — controleer je browser-rechten");
    }
  };

  const rotateStayToken = async (stayId: string) => {
    if (!confirm("Nieuwe toegangslink genereren? De oude link werkt direct niet meer.")) return;
    setLinkError(null);
    setSendingId(stayId);
    try {
      const r = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rotate_stay_token", id: stayId }),
      });
      const d = await r.json();
      if (!r.ok || !d.link) {
        setLinkError(d.error || "Kon token niet vernieuwen");
        return;
      }
      try { await navigator.clipboard.writeText(d.link); } catch {}
      setCopiedId(stayId);
      setTimeout(() => setCopiedId(prev => (prev === stayId ? null : prev)), 2500);
      const res = await fetch("/api/admin/data?table=stays");
      const data = await res.json();
      setStays(data.data || []);
    } catch {
      setLinkError("Token-rotatie mislukt");
    }
    setSendingId(null);
  };

  const statusColor = (s: string) => {
    if (s === "actief") return { bg: "#E8F5E9", text: "#2E7D32" };
    if (s === "gepland") return { bg: "#E3F2FD", text: "#1565C0" };
    return { bg: "#F5F5F5", text: "#9E9E9E" };
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 500, color: C.text }}>Verblijven</div>
          <div style={{ fontSize: 13, color: C.light, marginTop: 2 }}>Beheer gasttoegang en verstuur welkomstmails</div>
        </div>
        <button onClick={() => setCreating(!creating)} style={{
          padding: "8px 16px", borderRadius: 8, border: "none",
          background: C.green, color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer",
        }}>+ Nieuw verblijf</button>
      </div>

      {creating && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px", marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: C.text, marginBottom: 16 }}>Nieuw verblijf aanmaken</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: C.muted, marginBottom: 4 }}>Gastnaam</label>
              <input value={form.naam} onChange={e => setForm({ ...form, naam: e.target.value })} placeholder="Jan de Vries" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: C.muted, marginBottom: 4 }}>E-mail</label>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="jan@voorbeeld.nl" type="email" style={inputStyle} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: C.muted, marginBottom: 4 }}>Lodge</label>
              <select value={form.lodge} onChange={e => setForm({ ...form, lodge: e.target.value })} style={inputStyle}>
                <option value="lodge_1">Lodge 1 — De Heide</option>
                <option value="lodge_2">Lodge 2 — De Eik</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: C.muted, marginBottom: 4 }}>Check-in</label>
              <input value={form.check_in} onChange={e => setForm({ ...form, check_in: e.target.value })} type="date" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: C.muted, marginBottom: 4 }}>Check-out</label>
              <input value={form.check_out} onChange={e => setForm({ ...form, check_out: e.target.value })} type="date" style={inputStyle} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={createStay} disabled={saving || !form.naam || !form.email || !form.check_in || !form.check_out} style={{
              padding: "10px 20px", borderRadius: 8, border: "none",
              background: form.naam && form.email && form.check_in && form.check_out && !saving ? C.green : "#D4D0C8",
              color: "#fff", fontSize: 13, fontWeight: 500, cursor: form.naam && form.email ? "pointer" : "not-allowed",
            }}>{saving ? "Bezig..." : "Verblijf aanmaken"}</button>
            <button onClick={() => setCreating(false)} style={{
              padding: "10px 20px", borderRadius: 8, border: `1px solid ${C.border}`,
              background: C.card, color: C.muted, fontSize: 13, cursor: "pointer",
            }}>Annuleren</button>
          </div>
        </div>
      )}

      {linkError && (
        <div style={{
          background: "#FDECEA", border: "1px solid #F5C2C0", color: "#B71C1C",
          fontSize: 12, padding: "8px 12px", borderRadius: 6, marginBottom: 12,
        }}>{linkError}</div>
      )}

      {stays.length === 0 ? (
        <div style={{ fontSize: 13, color: C.light, padding: 20, textAlign: "center" }}>Nog geen verblijven aangemaakt</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {stays.map(s => {
            const guest = s.guests;
            const sc = statusColor(s.status);
            const lodge = s.lodge === "lodge_1" ? "De Heide" : "De Eik";
            const cin = new Date(s.check_in).toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
            const cout = new Date(s.check_out).toLocaleDateString("nl-NL", { day: "numeric", month: "short" });

            return (
              <div key={s.id} style={{
                background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
                padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontWeight: 500, fontSize: 14, color: C.text }}>{guest?.naam || "Gast"}</span>
                    <span style={{ background: sc.bg, color: sc.text, fontSize: 11, padding: "2px 8px", borderRadius: 6, fontWeight: 500 }}>{s.status}</span>
                    <span style={{ fontSize: 12, color: C.light }}>{lodge}</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.muted }}>
                    {cin} – {cout} · Deurcode: <strong>{s.door_code}</strong> · Wi-Fi: <strong>HuynenGast</strong> (statisch)
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                  {s.status === "vertrokken" ? (
                    <span style={{ fontSize: 12, color: "#2E7D32", fontWeight: 500 }}>✓ Afgerond</span>
                  ) : (
                    <>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <button onClick={() => sendWelcome(s.id)} disabled={sendingId === s.id} style={{
                          padding: "6px 14px", borderRadius: 6, border: "none",
                          background: C.green, color: "#fff", fontSize: 12, fontWeight: 500,
                          cursor: sendingId === s.id ? "not-allowed" : "pointer",
                        }}>{sendingId === s.id ? "Versturen..." : s.welcome_sent ? "Opnieuw versturen" : "Welkomstmail"}</button>
                        <button onClick={() => copyStayLink(s.id)} style={{
                          padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.gold}`,
                          background: C.card, color: C.gold, fontSize: 12, fontWeight: 500, cursor: "pointer",
                        }}>{copiedId === s.id ? "✓ Gekopieerd" : "Kopieer link"}</button>
                        {s.welcome_sent && (
                          <button onClick={() => sendLateCheckout(s.id)} disabled={sendingId === s.id || lcSentIds.has(s.id)} style={{
                            padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.border}`,
                            background: lcSentIds.has(s.id) ? "#F0FFF4" : C.card,
                            color: lcSentIds.has(s.id) ? "#2E7D32" : C.muted,
                            fontSize: 12, fontWeight: 500,
                            cursor: sendingId === s.id || lcSentIds.has(s.id) ? "not-allowed" : "pointer",
                          }}>{sendingId === s.id ? "Versturen..." : lcSentIds.has(s.id) ? "✓ Verstuurd" : "Late check-out"}</button>
                        )}
                        {s.welcome_sent && (
                          <button onClick={() => sendThankyou(s.id)} disabled={sendingId === s.id} style={{
                            padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.border}`,
                            background: C.card, color: C.muted, fontSize: 12, fontWeight: 500,
                            cursor: sendingId === s.id ? "not-allowed" : "pointer",
                          }}>{sendingId === s.id ? "Versturen..." : "Bedankt-mail"}</button>
                        )}
                      </div>
                      <button onClick={() => rotateStayToken(s.id)} disabled={sendingId === s.id} style={{
                        padding: "2px 0", border: "none", background: "none",
                        color: C.light, fontSize: 11, fontWeight: 400,
                        cursor: sendingId === s.id ? "not-allowed" : "pointer",
                        textDecoration: "underline",
                      }}>Roteer toegangstoken</button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
