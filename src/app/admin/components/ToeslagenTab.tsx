"use client";
import { useState } from "react";
import { FeeTemplate } from "../types";

const SOORT_LABEL: Record<FeeTemplate["soort"], { label: string; color: string }> = {
  toeslag:   { label: "Toeslag",   color: "#E67E22" },
  korting:   { label: "Korting",   color: "#2E7D32" },
  belasting: { label: "Belasting", color: "#1565C0" },
};

const BASIS_LABEL: Record<FeeTemplate["basis"], string> = {
  eenmalig:              "eenmalig",
  per_nacht:             "per nacht",
  per_persoon:           "per persoon",
  per_persoon_per_nacht: "p.p. per nacht",
};

export function ToeslagenTab({ templates, setTemplates }: { templates: FeeTemplate[]; setTemplates: (t: FeeTemplate[]) => void }) {
  const C = { bg: "#F5F3EE", card: "#fff", border: "#E8E4DC", text: "#2A2418", muted: "#8A7D6A", light: "#B4AFA5", green: "#2F4F3E", gold: "#B49A5E" };
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const blank = { label: "", soort: "toeslag" as FeeTemplate["soort"], bedrag: "", basis: "eenmalig" as FeeTemplate["basis"], volgorde: "0" };
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    border: `1px solid ${C.border}`, background: C.card,
    fontSize: 13, color: C.text, outline: "none", boxSizing: "border-box",
  };

  const startEdit = (t: FeeTemplate) => {
    setEditing(t.id);
    setCreating(false);
    setForm({ label: t.label, soort: t.soort, bedrag: t.bedrag != null ? String(t.bedrag) : "", basis: t.basis, volgorde: String(t.volgorde) });
    setErr("");
  };

  const startCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm(blank);
    setErr("");
  };

  const cancel = () => { setEditing(null); setCreating(false); setErr(""); };

  const save = async () => {
    if (!form.label.trim()) { setErr("Label is verplicht"); return; }
    setSaving(true);
    setErr("");
    try {
      const action = editing ? "update_fee_template" : "create_fee_template";
      const r = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, id: editing, ...form }),
      });
      const d = await r.json();
      if (!d.success) {
        setErr(d.error || "Kon niet opslaan");
        setSaving(false);
        return;
      }
      const refresh = await fetch("/api/admin/data?table=fee_templates");
      const rd = await refresh.json();
      setTemplates(rd.data || []);
      cancel();
    } catch {
      setErr("Verbindingsfout");
    }
    setSaving(false);
  };

  const toggle = async (t: FeeTemplate) => {
    await fetch("/api/admin/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle_fee_template", id: t.id, actief: !t.actief }),
    });
    setTemplates(templates.map(x => x.id === t.id ? { ...x, actief: !t.actief } : x));
  };

  const remove = async (t: FeeTemplate) => {
    if (!confirm(`"${t.label}" verwijderen?`)) return;
    await fetch("/api/admin/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_fee_template", id: t.id }),
    });
    setTemplates(templates.filter(x => x.id !== t.id));
  };

  const renderForm = () => (
    <div style={{ background: C.card, border: `1px solid ${C.gold}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 16 }}>
        {creating ? "Nieuwe regel toevoegen" : "Regel bewerken"}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 80px", gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Label</label>
          <input value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} placeholder="bijv. Huisdier, Vroegboekkorting" style={inputStyle} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Soort</label>
          <select value={form.soort} onChange={e => setForm({ ...form, soort: e.target.value as FeeTemplate["soort"] })} style={inputStyle}>
            <option value="toeslag">Toeslag</option>
            <option value="korting">Korting</option>
            <option value="belasting">Belasting</option>
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Bedrag (€)</label>
          <input value={form.bedrag} onChange={e => setForm({ ...form, bedrag: e.target.value })} type="number" step="0.01" placeholder="25.00" style={inputStyle} />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Basis</label>
          <select value={form.basis} onChange={e => setForm({ ...form, basis: e.target.value as FeeTemplate["basis"] })} style={inputStyle}>
            <option value="eenmalig">Eenmalig</option>
            <option value="per_nacht">Per nacht</option>
            <option value="per_persoon">Per persoon</option>
            <option value="per_persoon_per_nacht">P.p. per nacht</option>
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Volgorde</label>
          <input value={form.volgorde} onChange={e => setForm({ ...form, volgorde: e.target.value })} type="number" style={inputStyle} />
        </div>
      </div>
      {err && <div style={{ fontSize: 12, color: "#E24B4A", marginBottom: 12 }}>{err}</div>}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button onClick={cancel} disabled={saving} style={{
          padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`,
          background: C.card, fontSize: 12, color: C.muted, cursor: saving ? "not-allowed" : "pointer",
        }}>Annuleren</button>
        <button onClick={save} disabled={saving} style={{
          padding: "8px 20px", borderRadius: 8, border: "none",
          background: saving ? C.border : C.green,
          fontSize: 12, fontWeight: 500, color: "#fff", cursor: saving ? "not-allowed" : "pointer",
        }}>{saving ? "Opslaan..." : (editing ? "Bijwerken" : "Toevoegen")}</button>
      </div>
    </div>
  );

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 500, color: C.text, marginBottom: 4 }}>Toeslagen, kortingen &amp; belastingen</div>
          <div style={{ fontSize: 13, color: C.light }}>
            Templates die de offerte-editor automatisch voorstelt op basis van aantal personen en nachten.
          </div>
        </div>
        {!creating && !editing && (
          <button onClick={startCreate} style={{
            padding: "9px 18px", borderRadius: 8, border: "none",
            background: C.green, fontSize: 13, fontWeight: 500, color: "#fff", cursor: "pointer",
          }}>+ Nieuwe regel</button>
        )}
      </div>

      {(creating || editing) && renderForm()}

      {templates.length === 0 && !creating && (
        <div style={{ fontSize: 13, color: C.light, padding: 40, textAlign: "center", background: C.card, border: `1px solid ${C.border}`, borderRadius: 12 }}>
          Nog geen templates. Klik &ldquo;+ Nieuwe regel&rdquo; om te beginnen.
        </div>
      )}

      {templates.length > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 110px 120px 140px 80px 180px", padding: "12px 16px", background: C.bg, fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: .5, fontWeight: 500 }}>
            <div>Label</div>
            <div>Soort</div>
            <div style={{ textAlign: "right" }}>Bedrag</div>
            <div>Basis</div>
            <div style={{ textAlign: "center" }}>Actief</div>
            <div style={{ textAlign: "right" }}>Acties</div>
          </div>
          {templates.map(t => {
            const soort = SOORT_LABEL[t.soort];
            return (
              <div key={t.id} style={{ display: "grid", gridTemplateColumns: "2fr 110px 120px 140px 80px 180px", padding: "14px 16px", borderTop: `1px solid ${C.border}`, fontSize: 13, color: C.text, alignItems: "center", opacity: t.actief ? 1 : 0.55 }}>
                <div style={{ fontWeight: 500 }}>{t.label}</div>
                <div><span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 6, background: `${soort.color}15`, color: soort.color, fontWeight: 500 }}>{soort.label}</span></div>
                <div style={{ textAlign: "right", fontWeight: 500 }}>{t.bedrag != null ? `€ ${Number(t.bedrag).toFixed(2)}` : "—"}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{BASIS_LABEL[t.basis]}</div>
                <div style={{ textAlign: "center" }}>
                  <button onClick={() => toggle(t)} style={{
                    padding: "4px 10px", borderRadius: 6, border: `1px solid ${C.border}`,
                    background: t.actief ? "#E8F5E9" : C.bg, color: t.actief ? "#2E7D32" : C.muted,
                    fontSize: 11, fontWeight: 500, cursor: "pointer",
                  }}>{t.actief ? "Aan" : "Uit"}</button>
                </div>
                <div style={{ textAlign: "right", display: "flex", gap: 6, justifyContent: "flex-end" }}>
                  <button onClick={() => startEdit(t)} style={{
                    padding: "5px 12px", borderRadius: 6, border: `1px solid ${C.border}`,
                    background: C.card, fontSize: 11, color: C.muted, cursor: "pointer",
                  }}>Bewerk</button>
                  <button onClick={() => remove(t)} style={{
                    padding: "5px 12px", borderRadius: 6, border: `1px solid ${C.border}`,
                    background: C.card, fontSize: 11, color: "#E24B4A", cursor: "pointer",
                  }}>Verwijder</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
