"use client";
import { useState } from "react";
import { DiscountCode } from "../types";

const C = {
  bg: "#F7F8FA", card: "#fff", border: "#E5E7EB",
  text: "#111827", muted: "#6B7280", light: "#9CA3AF",
  green: "#2F4F3E", gold: "#B49A5E",
};

const EMPTY_CODE_FORM = { id: "", code: "", omschrijving: "", type: "percentage" as "percentage" | "fixed", waarde: "", geldig_van: "", geldig_tot: "", max_gebruik: "", min_nachten: "" };

export function ActiesTab({ codes, setCodes }: { codes: DiscountCode[]; setCodes: (c: DiscountCode[]) => void }) {
  const [form, setForm] = useState(EMPTY_CODE_FORM);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const creating = !form.id;

  const startEdit = (c: DiscountCode) => {
    setForm({
      id: c.id, code: c.code, omschrijving: c.omschrijving || "",
      type: c.type, waarde: String(c.waarde),
      geldig_van: c.geldig_van || "", geldig_tot: c.geldig_tot || "",
      max_gebruik: c.max_gebruik != null ? String(c.max_gebruik) : "",
      min_nachten: c.min_nachten != null ? String(c.min_nachten) : "",
    });
  };

  const reset = () => { setForm(EMPTY_CODE_FORM); setMsg(""); };

  const reload = async () => {
    const res = await fetch("/api/admin/data?table=discount_codes");
    const data = await res.json();
    setCodes(data.data || []);
  };

  const save = async () => {
    if (!form.code || !form.waarde) { setMsg("Code en waarde zijn verplicht"); return; }
    setSaving(true);
    setMsg("");
    const action = creating ? "create_discount_code" : "update_discount_code";
    const res = await fetch("/api/admin/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...form }),
    });
    const data = await res.json();
    if (data.error) { setMsg(data.error); } else { reset(); await reload(); }
    setSaving(false);
  };

  const toggle = async (c: DiscountCode) => {
    await fetch("/api/admin/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle_discount_code", id: c.id, actief: !c.actief }),
    });
    await reload();
  };

  const del = async (c: DiscountCode) => {
    if (!confirm(`Code "${c.code}" verwijderen?`)) return;
    await fetch("/api/admin/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_discount_code", id: c.id }),
    });
    await reload();
  };

  const resetUsage = async (c: DiscountCode) => {
    if (!confirm(`Gebruik teller van "${c.code}" resetten naar 0?`)) return;
    await fetch("/api/admin/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset_discount_usage", id: c.id }),
    });
    await reload();
  };

  const inp: React.CSSProperties = {
    width: "100%", padding: "8px 12px", borderRadius: 8,
    border: `1px solid ${C.border}`, fontFamily: "inherit",
    fontSize: 13, color: C.text, background: "#fff",
    boxSizing: "border-box",
  };

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 6 }}>Promotiecodes</h2>
      <p style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>
        Maak herbruikbare codes aan voor campagnes, vroegboekacties, of partnerships.
      </p>

      {/* Form */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 28 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: C.text, marginBottom: 14 }}>
          {creating ? "Nieuwe promotiecode" : `Code bewerken: ${form.code}`}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
          <div>
            <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Code *</label>
            <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="bijv. VROEGVOGEL10" style={inp} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Omschrijving</label>
            <input value={form.omschrijving} onChange={e => setForm(f => ({ ...f, omschrijving: e.target.value }))}
              placeholder="Vroegboekkorting opening 2027" style={inp} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Type *</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as "percentage" | "fixed" }))} style={inp}>
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Vast bedrag (€)</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>
              Waarde * {form.type === "percentage" ? "(bijv. 10 = 10%)" : "(bijv. 25 = €25 korting)"}
            </label>
            <input value={form.waarde} onChange={e => setForm(f => ({ ...f, waarde: e.target.value }))}
              placeholder={form.type === "percentage" ? "10" : "25"} type="number" min="0" style={inp} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Geldig van</label>
            <input value={form.geldig_van} onChange={e => setForm(f => ({ ...f, geldig_van: e.target.value }))}
              type="date" style={inp} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Geldig tot</label>
            <input value={form.geldig_tot} onChange={e => setForm(f => ({ ...f, geldig_tot: e.target.value }))}
              type="date" style={inp} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Max gebruik (leeg = onbeperkt)</label>
            <input value={form.max_gebruik} onChange={e => setForm(f => ({ ...f, max_gebruik: e.target.value }))}
              placeholder="bijv. 50" type="number" min="1" style={inp} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Min. nachten (leeg = geen minimum)</label>
            <input value={form.min_nachten} onChange={e => setForm(f => ({ ...f, min_nachten: e.target.value }))}
              placeholder="bijv. 2" type="number" min="1" style={inp} />
          </div>
        </div>
        {msg && <p style={{ fontSize: 12, color: "#C62828", margin: "4px 0 10px" }}>{msg}</p>}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={save} disabled={saving} style={{
            padding: "9px 20px", borderRadius: 8, border: "none",
            background: C.green, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>
            {saving ? "Opslaan..." : (creating ? "Code aanmaken" : "Wijzigingen opslaan")}
          </button>
          {!creating && (
            <button onClick={reset} style={{
              padding: "9px 16px", borderRadius: 8, border: `1px solid ${C.border}`,
              background: "#fff", fontSize: 13, color: C.muted, cursor: "pointer",
            }}>Annuleren</button>
          )}
        </div>
      </div>

      {/* Code list */}
      {codes.length === 0 ? (
        <p style={{ fontSize: 13, color: C.muted }}>Nog geen promotiecodes aangemaakt.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {codes.map(c => (
            <div key={c.id} style={{
              background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
              padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
              opacity: c.actief ? 1 : 0.55,
            }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: C.text, letterSpacing: 1 }}>{c.code}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4,
                    background: c.actief ? "#E8F5E9" : "#F5F5F5",
                    color: c.actief ? "#2E7D32" : C.muted,
                  }}>{c.actief ? "ACTIEF" : "INACTIEF"}</span>
                </div>
                {c.omschrijving && <div style={{ fontSize: 12, color: C.muted }}>{c.omschrijving}</div>}
              </div>
              <div style={{ fontSize: 13, color: C.text, minWidth: 80 }}>
                {c.type === "percentage" ? `${c.waarde}% korting` : `€${c.waarde} korting`}
              </div>
              <div style={{ fontSize: 12, color: C.muted, minWidth: 100 }}>
                {c.max_gebruik != null ? `${c.gebruik_count} / ${c.max_gebruik} gebruikt` : `${c.gebruik_count}× gebruikt`}
              </div>
              <div style={{ fontSize: 12, color: C.muted, minWidth: 120 }}>
                {c.geldig_tot ? `t/m ${c.geldig_tot}` : "Geen einddatum"}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => startEdit(c)} style={{
                  padding: "5px 12px", borderRadius: 6, border: `1px solid ${C.border}`,
                  background: "#fff", fontSize: 12, color: C.text, cursor: "pointer",
                }}>Bewerk</button>
                <button onClick={() => toggle(c)} style={{
                  padding: "5px 12px", borderRadius: 6, border: `1px solid ${C.border}`,
                  background: "#fff", fontSize: 12, color: C.text, cursor: "pointer",
                }}>{c.actief ? "Deactiveer" : "Activeer"}</button>
                <button onClick={() => resetUsage(c)} title="Gebruik teller resetten" style={{
                  padding: "5px 10px", borderRadius: 6, border: `1px solid ${C.border}`,
                  background: "#fff", fontSize: 12, color: C.muted, cursor: "pointer",
                }}>Reset</button>
                <button onClick={() => del(c)} style={{
                  padding: "5px 10px", borderRadius: 6, border: "1px solid #FFCDD2",
                  background: "#fff", fontSize: 12, color: "#C62828", cursor: "pointer",
                }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
