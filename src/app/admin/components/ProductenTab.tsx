"use client";
import { useState } from "react";
import { Product } from "../types";

export function ProductenTab({ products, setProducts }: { products: Product[]; setProducts: (p: Product[]) => void }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ id: "", naam: "", omschrijving: "", prijs: "", categorie: "upsell", volgorde: "0", btw: "21", grootboek: "8020" });
  const [saving, setSaving] = useState(false);

  const C = { bg: "#F5F3EE", card: "#fff", border: "#E8E4DC", text: "#2A2418", muted: "#8A7D6A", light: "#B4AFA5", green: "#2F4F3E", gold: "#B49A5E" };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    border: `1px solid ${C.border}`, background: C.card,
    fontSize: 14, color: C.text, outline: "none", boxSizing: "border-box",
  };

  const startEdit = (p: Product) => {
    setEditing(p.id);
    setCreating(false);
    setForm({ id: p.id, naam: p.naam, omschrijving: p.omschrijving || "", prijs: String(p.prijs), categorie: p.categorie, volgorde: String(p.volgorde), btw: String(p.btw_percentage ?? 21), grootboek: p.grootboek_code || "8020" });
  };

  const startCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm({ id: "", naam: "", omschrijving: "", prijs: "", categorie: "upsell", volgorde: "0", btw: "21", grootboek: "8020" });
  };

  const save = async () => {
    if (!form.naam || !form.prijs) return;
    setSaving(true);
    try {
      const action = creating ? "create_product" : "update_product";
      const r = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...form, prijs: parseFloat(form.prijs), btw_percentage: parseInt(form.btw), grootboek_code: form.grootboek }),
      });
      const d = await r.json();
      if (d.success) {
        const res = await fetch("/api/admin/data?table=products");
        const data = await res.json();
        setProducts(data.data || []);
        setEditing(null);
        setCreating(false);
      }
    } catch {}
    setSaving(false);
  };

  const toggleActive = async (id: string, actief: boolean) => {
    await fetch("/api/admin/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle_product", id, actief }),
    });
    setProducts(products.map(p => p.id === id ? { ...p, actief } : p));
  };

  const deleteProduct = async (id: string) => {
    if (!confirm(`Weet je zeker dat je "${id}" wilt verwijderen?`)) return;
    await fetch("/api/admin/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_product", id }),
    });
    setProducts(products.filter(p => p.id !== id));
  };

  const upsells = products.filter(p => p.categorie === "upsell");
  const fietsen = products.filter(p => p.categorie === "fiets");

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 500, color: C.text }}>Producten</div>
          <div style={{ fontSize: 13, color: C.light, marginTop: 2 }}>Beheer prijzen en producten</div>
        </div>
        <button onClick={startCreate} style={{
          padding: "8px 16px", borderRadius: 8, border: "none",
          background: C.green, color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer",
        }}>+ Nieuw product</button>
      </div>

      {/* Create/Edit form */}
      {(creating || editing) && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px", marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: C.text, marginBottom: 16 }}>
            {creating ? "Nieuw product" : `Bewerk: ${form.naam}`}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: C.muted, marginBottom: 4 }}>Product ID</label>
              <input value={form.id} onChange={e => setForm({ ...form, id: e.target.value })} placeholder="bijv. ontbijt"
                disabled={!!editing} style={{ ...inputStyle, opacity: editing ? 0.5 : 1 }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: C.muted, marginBottom: 4 }}>Naam</label>
              <input value={form.naam} onChange={e => setForm({ ...form, naam: e.target.value })} placeholder="Ontbijt op bed" style={inputStyle} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: C.muted, marginBottom: 4 }}>Prijs (€)</label>
              <input value={form.prijs} onChange={e => setForm({ ...form, prijs: e.target.value })} placeholder="19.50" type="number" step="0.01" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: C.muted, marginBottom: 4 }}>Categorie</label>
              <select value={form.categorie} onChange={e => setForm({ ...form, categorie: e.target.value })} style={inputStyle}>
                <option value="upsell">Upsell</option>
                <option value="fiets">Fiets</option>
                <option value="arrangement">Arrangement</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: C.muted, marginBottom: 4 }}>BTW %</label>
              <select value={form.btw} onChange={e => setForm({ ...form, btw: e.target.value })} style={inputStyle}>
                <option value="21">21%</option>
                <option value="9">9% (voedsel)</option>
                <option value="0">0%</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: C.muted, marginBottom: 4 }}>Grootboek</label>
              <select value={form.grootboek} onChange={e => setForm({ ...form, grootboek: e.target.value })} style={inputStyle}>
                <option value="8020">8020 - Omzet HTH</option>
                <option value="8010">8010 - Omzet algemeen</option>
                <option value="8030">8030 - Schoonmaak</option>
                <option value="8040">8040 - Toeristenbelasting</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: C.muted, marginBottom: 4 }}>Volgorde</label>
              <input value={form.volgorde} onChange={e => setForm({ ...form, volgorde: e.target.value })} type="number" style={inputStyle} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, color: C.muted, marginBottom: 4 }}>Omschrijving</label>
            <input value={form.omschrijving} onChange={e => setForm({ ...form, omschrijving: e.target.value })} placeholder="Korte beschrijving" style={inputStyle} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setEditing(null); setCreating(false); }} style={{
              padding: "10px 20px", borderRadius: 8, border: `1px solid ${C.border}`,
              background: C.card, fontSize: 13, color: C.muted, cursor: "pointer",
            }}>Annuleren</button>
            <button onClick={save} disabled={!form.naam || !form.prijs || saving} style={{
              padding: "10px 24px", borderRadius: 8, border: "none",
              background: form.naam && form.prijs && !saving ? C.green : C.border,
              fontSize: 13, fontWeight: 500, color: "#fff", cursor: form.naam && form.prijs ? "pointer" : "not-allowed",
            }}>{saving ? "Opslaan..." : "Opslaan"}</button>
          </div>
        </div>
      )}

      {/* Upsells */}
      <div style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 10 }}>Upsells</div>
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "80px 2fr 2fr 80px 50px 80px 120px", padding: "10px 18px", background: C.bg, fontSize: 12, color: C.light, borderBottom: `1px solid ${C.border}` }}>
          <div>ID</div><div>Naam</div><div>Omschrijving</div><div>Prijs</div><div>BTW</div><div>Status</div><div></div>
        </div>
        {upsells.map(p => (
          <div key={p.id} style={{ display: "grid", gridTemplateColumns: "80px 2fr 2fr 80px 50px 80px 120px", padding: "12px 18px", fontSize: 13, borderBottom: `1px solid ${C.border}`, alignItems: "center", opacity: p.actief ? 1 : 0.4 }}>
            <div style={{ color: C.muted, fontFamily: "monospace", fontSize: 12 }}>{p.id}</div>
            <div style={{ color: C.text, fontWeight: 500 }}>{p.naam}</div>
            <div style={{ color: C.muted }}>{p.omschrijving || "—"}</div>
            <div style={{ color: C.text, fontWeight: 500 }}>€ {p.prijs.toFixed(2)}</div>
            <div style={{ color: C.muted, fontSize: 12 }}>{p.btw_percentage ?? 21}%</div>
            <div>
              <span onClick={() => toggleActive(p.id, !p.actief)} style={{
                fontSize: 11, padding: "3px 8px", borderRadius: 6, cursor: "pointer",
                background: p.actief ? "#E8F5E9" : "#F5F5F5", color: p.actief ? "#2E7D32" : "#9E9E9E",
              }}>{p.actief ? "actief" : "uit"}</span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => startEdit(p)} style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.card, fontSize: 11, color: C.muted, cursor: "pointer" }}>Bewerk</button>
              <button onClick={() => deleteProduct(p.id)} style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.card, fontSize: 11, color: "#E24B4A", cursor: "pointer" }}>×</button>
            </div>
          </div>
        ))}
        {upsells.length === 0 && <div style={{ padding: 20, fontSize: 13, color: C.light, textAlign: "center" }}>Geen upsells</div>}
      </div>

      {/* Fietsen */}
      <div style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 10 }}>Fietsen (dagprijs)</div>
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "100px 2fr 2fr 80px 50px 80px 120px", padding: "10px 18px", background: C.bg, fontSize: 12, color: C.light, borderBottom: `1px solid ${C.border}` }}>
          <div>ID</div><div>Naam</div><div>Omschrijving</div><div>Dag</div><div>BTW</div><div>Status</div><div></div>
        </div>
        {fietsen.map(p => (
          <div key={p.id} style={{ display: "grid", gridTemplateColumns: "100px 2fr 2fr 80px 50px 80px 120px", padding: "12px 18px", fontSize: 13, borderBottom: `1px solid ${C.border}`, alignItems: "center", opacity: p.actief ? 1 : 0.4 }}>
            <div style={{ color: C.muted, fontFamily: "monospace", fontSize: 12 }}>{p.id}</div>
            <div style={{ color: C.text, fontWeight: 500 }}>{p.naam}</div>
            <div style={{ color: C.muted }}>{p.omschrijving || "—"}</div>
            <div style={{ color: C.text, fontWeight: 500 }}>€ {p.prijs.toFixed(2)}</div>
            <div style={{ color: C.muted, fontSize: 12 }}>{p.btw_percentage ?? 21}%</div>
            <div>
              <span onClick={() => toggleActive(p.id, !p.actief)} style={{
                fontSize: 11, padding: "3px 8px", borderRadius: 6, cursor: "pointer",
                background: p.actief ? "#E8F5E9" : "#F5F5F5", color: p.actief ? "#2E7D32" : "#9E9E9E",
              }}>{p.actief ? "actief" : "uit"}</span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => startEdit(p)} style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.card, fontSize: 11, color: C.muted, cursor: "pointer" }}>Bewerk</button>
              <button onClick={() => deleteProduct(p.id)} style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.card, fontSize: 11, color: "#E24B4A", cursor: "pointer" }}>×</button>
            </div>
          </div>
        ))}
        {fietsen.length === 0 && <div style={{ padding: 20, fontSize: 13, color: C.light, textAlign: "center" }}>Geen fietsen</div>}
      </div>
    </>
  );
}
