"use client";
import { useState, useEffect } from "react";

type PricingPeriod = { id: string; lodge_id: string; label: string; start_date: string; end_date: string; price_per_night: number };
type SurchargeConfig = { feestdag_nl: number; feestdag_de: number; vakantie_nl: number; vakantie_ni: number; vakantie_nw: number; tt_assen: number; weekend: number };
type PricingConfig = { lodge_id: string; base_price: number; surcharge_config: SurchargeConfig };
type AvailabilityDiscount = { id?: string; lodge_id: string; days_before: number; discount_pct: number };
type GenPeriod = { lodge_id: string; label: string; start_date: string; end_date: string; price_per_night: number; category: string };

const DEFAULT_SURCHARGES: SurchargeConfig = { feestdag_nl: 15, feestdag_de: 15, vakantie_nl: 25, vakantie_ni: 20, vakantie_nw: 20, tt_assen: 50, weekend: 15 };
const SURCHARGE_LABELS: Record<keyof SurchargeConfig, string> = {
  feestdag_nl: "Feestdag NL",
  feestdag_de: "Feestdag DE",
  vakantie_nl: "Schoolvakantie NL (heel Nederland)",
  vakantie_ni: "Schoolvakantie DE Niedersachsen",
  vakantie_nw: "Schoolvakantie DE NRW",
  tt_assen: "TT Assen / MotoGP",
  weekend: "Weekend (vrijdag t/m zondag)",
};

export function TarievenTab() {
  const C = { bg: "#F5F3EE", card: "#fff", border: "#E8E4DC", text: "#2A2418", muted: "#8A7D6A", light: "#B4AFA5", green: "#2F4F3E", gold: "#B49A5E", orange: "#E67E22" };
  const inp: React.CSSProperties = { width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.card, fontSize: 13, color: C.text, outline: "none", boxSizing: "border-box" };

  // — Pricing config state (base price + surcharges per lodge)
  const [configs, setConfigs] = useState<Record<string, PricingConfig>>({
    lodge_1: { lodge_id: "lodge_1", base_price: 0, surcharge_config: { ...DEFAULT_SURCHARGES } },
    lodge_2: { lodge_id: "lodge_2", base_price: 0, surcharge_config: { ...DEFAULT_SURCHARGES } },
  });
  const [configSaving, setConfigSaving] = useState<string | null>(null);

  // — Availability discounts state per lodge
  const [discounts, setDiscounts] = useState<Record<string, AvailabilityDiscount[]>>({ lodge_1: [], lodge_2: [] });
  const [discountSaving, setDiscountSaving] = useState<string | null>(null);
  const [discountLodge, setDiscountLodge] = useState<"lodge_1" | "lodge_2">("lodge_1");

  // — Sync state
  const [syncYear, setSyncYear] = useState(2027);
  const [syncLodge, setSyncLodge] = useState<"lodge_1" | "lodge_2">("lodge_1");
  const [syncPreview, setSyncPreview] = useState<GenPeriod[] | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncSaving, setSyncSaving] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  // — Manual period CRUD state
  const [periods, setPeriods] = useState<PricingPeriod[]>([]);
  const [periodsLoading, setPeriodsLoading] = useState(true);
  const [periodsError, setPeriodsError] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const emptyForm = { lodge_id: "lodge_1", label: "", start_date: "", end_date: "", price_per_night: "" };
  const [form, setForm] = useState(emptyForm);

  const lodgeLabel = (id: string) => id === "lodge_1" ? "De Heide" : "De Eik";

  // Load all data
  useEffect(() => {
    (async () => {
      const [cfgRes, discRes, perRes] = await Promise.all([
        fetch("/api/admin/data?table=pricing_config"),
        fetch("/api/admin/data?table=availability_discounts"),
        fetch("/api/admin/data?table=pricing_periods"),
      ]);
      const [cfgData, discData, perData] = await Promise.all([cfgRes.json(), discRes.json(), perRes.json()]);

      if (cfgData.data?.length) {
        const updated = { ...configs };
        for (const c of cfgData.data as PricingConfig[]) {
          updated[c.lodge_id] = { ...c, surcharge_config: { ...DEFAULT_SURCHARGES, ...(c.surcharge_config || {}) } };
        }
        setConfigs(updated);
      }

      if (discData.data?.length) {
        const grouped: Record<string, AvailabilityDiscount[]> = { lodge_1: [], lodge_2: [] };
        for (const d of discData.data as AvailabilityDiscount[]) {
          grouped[d.lodge_id] = [...(grouped[d.lodge_id] || []), d];
        }
        setDiscounts(grouped);
      }

      if (perData.error) setPeriodsError(perData.error);
      setPeriods(perData.data || []);
      setPeriodsLoading(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save base price + surcharges for a lodge
  const saveConfig = async (lodgeId: string) => {
    setConfigSaving(lodgeId);
    await fetch("/api/admin/data", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save_pricing_config", lodge_id: lodgeId, base_price: configs[lodgeId].base_price, surcharge_config: configs[lodgeId].surcharge_config }),
    });
    setConfigSaving(null);
  };

  const updateSurcharge = (lodgeId: string, key: keyof SurchargeConfig, val: number) => {
    setConfigs(prev => ({ ...prev, [lodgeId]: { ...prev[lodgeId], surcharge_config: { ...prev[lodgeId].surcharge_config, [key]: val } } }));
  };

  // Availability discounts
  const saveDiscounts = async (lodgeId: string) => {
    setDiscountSaving(lodgeId);
    await fetch("/api/admin/data", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save_availability_discounts", lodge_id: lodgeId, discounts: discounts[lodgeId] }),
    });
    setDiscountSaving(null);
  };

  const addDiscount = (lodgeId: string) => {
    setDiscounts(prev => ({ ...prev, [lodgeId]: [...prev[lodgeId], { lodge_id: lodgeId, days_before: 30, discount_pct: 15 }] }));
  };

  const updateDiscount = (lodgeId: string, idx: number, field: "days_before" | "discount_pct", val: number) => {
    setDiscounts(prev => {
      const rows = [...prev[lodgeId]];
      rows[idx] = { ...rows[idx], [field]: val };
      return { ...prev, [lodgeId]: rows };
    });
  };

  const removeDiscount = (lodgeId: string, idx: number) => {
    setDiscounts(prev => ({ ...prev, [lodgeId]: prev[lodgeId].filter((_, i) => i !== idx) }));
  };

  // Sync feestdagen
  const runSync = async (previewOnly: boolean) => {
    const cfg = configs[syncLodge];
    if (!cfg.base_price) { setSyncMsg("Stel eerst een basisprijs in voor deze lodge."); return; }
    previewOnly ? setSyncing(true) : setSyncSaving(true);
    setSyncMsg(null);
    try {
      const res = await fetch("/api/admin/sync-pricing", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: syncYear, lodge_id: syncLodge, base_price: cfg.base_price, surcharges: cfg.surcharge_config, preview_only: previewOnly }),
      });
      const data = await res.json();
      if (data.error) { setSyncMsg(`Fout: ${data.error}`); }
      else if (previewOnly) { setSyncPreview(data.periods); }
      else { setSyncPreview(null); setSyncMsg(`✓ ${data.count} tariefperiodes opgeslagen voor ${syncYear}`); setPeriods([]); setPeriodsLoading(true); const r = await fetch("/api/admin/data?table=pricing_periods"); const d = await r.json(); setPeriods(d.data || []); setPeriodsLoading(false); }
    } catch { setSyncMsg("Netwerk fout — probeer opnieuw"); }
    previewOnly ? setSyncing(false) : setSyncSaving(false);
  };

  // Manual period CRUD
  const reloadPeriods = async () => { setPeriodsLoading(true); const r = await fetch("/api/admin/data?table=pricing_periods"); const d = await r.json(); setPeriods(d.data || []); setPeriodsLoading(false); };
  const startCreate = () => { setCreating(true); setEditing(null); setForm(emptyForm); setShowManual(true); };
  const startEdit = (p: PricingPeriod) => { setEditing(p.id); setCreating(false); setForm({ lodge_id: p.lodge_id, label: p.label, start_date: p.start_date, end_date: p.end_date, price_per_night: String(p.price_per_night) }); setShowManual(true); };
  const cancel = () => { setCreating(false); setEditing(null); };
  const savePeriod = async () => {
    if (!form.label || !form.start_date || !form.end_date || !form.price_per_night) return;
    setSaving(true);
    const action = creating ? "create_pricing_period" : "update_pricing_period";
    const body: Record<string, unknown> = { action, ...form, price_per_night: parseFloat(form.price_per_night) };
    if (editing) body.id = editing;
    await fetch("/api/admin/data", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    await reloadPeriods();
    setCreating(false); setEditing(null); setSaving(false);
  };
  const deletePeriod = async (id: string) => {
    if (!confirm("Tariefperiode verwijderen?")) return;
    await fetch("/api/admin/data", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete_pricing_period", id }) });
    setPeriods(prev => prev.filter(p => p.id !== id));
  };

  const CATEGORY_COLORS: Record<string, string> = { vakantie_nl: "#2196F3", vakantie_ni: "#9C27B0", vakantie_nw: "#673AB7", tt_assen: C.orange, feestdag_nl: "#4CAF50", feestdag_de: "#8BC34A", weekend: "#FF7043" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 500, color: C.text }}>Dynamische Tarieven</div>
          <div style={{ fontSize: 13, color: C.light, marginTop: 2 }}>Basisprijs · opslagen · leegstandkorting · automatische sync</div>
        </div>
      </div>

      {/* ── BASISPRIJS & OPSLAGEN ── */}
      {(["lodge_1", "lodge_2"] as const).map(lodgeId => (
        <div key={lodgeId} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 24px" }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: C.text, marginBottom: 16 }}>Lodge {lodgeLabel(lodgeId)}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Basisprijs */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>Basisprijs per nacht</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16, color: C.muted }}>€</span>
                <input
                  type="number" step="1" min="0"
                  value={configs[lodgeId].base_price || ""}
                  onChange={e => setConfigs(prev => ({ ...prev, [lodgeId]: { ...prev[lodgeId], base_price: parseFloat(e.target.value) || 0 } }))}
                  placeholder="150"
                  style={{ ...inp, width: 100, fontSize: 20, fontWeight: 700, textAlign: "center" }}
                />
                <button onClick={() => saveConfig(lodgeId)} disabled={configSaving === lodgeId} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: C.green, color: "#fff", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
                  {configSaving === lodgeId ? "..." : "Opslaan"}
                </button>
              </div>
            </div>

            {/* Opslagpercentages */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>Opslagpercentages</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {(Object.keys(SURCHARGE_LABELS) as (keyof SurchargeConfig)[]).map(key => {
                  const pct = configs[lodgeId].surcharge_config[key];
                  const exPrice = configs[lodgeId].base_price ? Math.round(configs[lodgeId].base_price * (1 + pct / 100)) : null;
                  return (
                    <div key={key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: CATEGORY_COLORS[key] || C.gold, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: C.text, flex: 1, minWidth: 0 }}>{SURCHARGE_LABELS[key]}</span>
                      <input
                        type="number" min="0" max="200" step="1"
                        value={pct}
                        onChange={e => updateSurcharge(lodgeId, key, parseFloat(e.target.value) || 0)}
                        style={{ ...inp, width: 56, textAlign: "center", padding: "4px 6px" }}
                      />
                      <span style={{ fontSize: 11, color: C.muted, width: 16 }}>%</span>
                      {exPrice && <span style={{ fontSize: 11, color: C.gold, minWidth: 44 }}>→ €{exPrice}</span>}
                    </div>
                  );
                })}
              </div>
              <button onClick={() => saveConfig(lodgeId)} disabled={configSaving === lodgeId} style={{ marginTop: 10, padding: "6px 14px", borderRadius: 8, border: "none", background: C.green, color: "#fff", fontSize: 12, cursor: "pointer" }}>
                {configSaving === lodgeId ? "..." : "Opslagen opslaan"}
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* ── LEEGSTAND KORTING ── */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 24px" }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: C.text, marginBottom: 4 }}>Leegstand korting</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>Automatische korting op niet-geboekte nachten naarmate de aankomst nadert. De zwaarste toepasselijke korting wordt gebruikt.</div>

        {/* Lodge selector */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {(["lodge_1", "lodge_2"] as const).map(l => (
            <button key={l} onClick={() => setDiscountLodge(l)} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${discountLodge === l ? C.green : C.border}`, background: discountLodge === l ? C.green : C.card, color: discountLodge === l ? "#fff" : C.text, fontSize: 12, cursor: "pointer" }}>
              {lodgeLabel(l)}
            </button>
          ))}
        </div>

        {/* Discount rules table */}
        <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden", marginBottom: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 40px", padding: "8px 16px", background: C.bg, fontSize: 11, color: C.light, fontWeight: 600 }}>
            <div>Binnen X dagen voor aankomst</div>
            <div>Korting op prijs</div>
            <div />
          </div>
          {discounts[discountLodge].length === 0 && (
            <div style={{ padding: "14px 16px", fontSize: 13, color: C.light, textAlign: "center" }}>Geen kortingsregels — voeg er een toe</div>
          )}
          {discounts[discountLodge].map((d, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 40px", padding: "8px 16px", borderTop: `1px solid ${C.border}`, alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input type="number" min="1" max="365" value={d.days_before} onChange={e => updateDiscount(discountLodge, i, "days_before", parseInt(e.target.value) || 1)} style={{ ...inp, width: 60, textAlign: "center" }} />
                <span style={{ fontSize: 12, color: C.muted }}>dagen</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input type="number" min="1" max="80" value={d.discount_pct} onChange={e => updateDiscount(discountLodge, i, "discount_pct", parseFloat(e.target.value) || 0)} style={{ ...inp, width: 56, textAlign: "center" }} />
                <span style={{ fontSize: 12, color: C.muted }}>% korting</span>
                {configs[discountLodge].base_price > 0 && (
                  <span style={{ fontSize: 11, color: C.orange }}>→ €{Math.round(configs[discountLodge].base_price * (1 - d.discount_pct / 100))}/nacht</span>
                )}
              </div>
              <button onClick={() => removeDiscount(discountLodge, i)} style={{ padding: "4px 8px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.card, fontSize: 13, color: "#E24B4A", cursor: "pointer" }}>×</button>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => addDiscount(discountLodge)} style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.card, fontSize: 12, color: C.text, cursor: "pointer" }}>+ Regel toevoegen</button>
          <button onClick={() => saveDiscounts(discountLodge)} disabled={discountSaving === discountLodge} style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: C.green, color: "#fff", fontSize: 12, cursor: "pointer" }}>
            {discountSaving === discountLodge ? "Opslaan..." : "Opslaan"}
          </button>
        </div>
      </div>

      {/* ── SYNC FEESTDAGEN ── */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 24px" }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: C.text, marginBottom: 4 }}>Automatisch invullen via feestdagen</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>Haalt NL/DE feestdagen en schoolvakanties op en berekent de prijs op basis van basisprijs + opslagpercentages. TT Assen 2026: 26–28 jun (bevestigd), 2027: 25–27 jun (geschat).</div>

        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Jaar</label>
            <select value={syncYear} onChange={e => { setSyncYear(parseInt(e.target.value)); setSyncPreview(null); }} style={{ ...inp, width: 90 }}>
              {[2026, 2027, 2028].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Lodge</label>
            <select value={syncLodge} onChange={e => { setSyncLodge(e.target.value as "lodge_1" | "lodge_2"); setSyncPreview(null); }} style={{ ...inp, width: 140 }}>
              <option value="lodge_1">De Heide</option>
              <option value="lodge_2">De Eik</option>
            </select>
          </div>
          <button onClick={() => runSync(true)} disabled={syncing} style={{ padding: "9px 18px", borderRadius: 8, border: `1px solid ${C.green}`, background: C.card, color: C.green, fontSize: 13, fontWeight: 500, cursor: syncing ? "not-allowed" : "pointer" }}>
            {syncing ? "Ophalen..." : "Preview genereren →"}
          </button>
          {syncPreview && (
            <button onClick={() => runSync(false)} disabled={syncSaving} style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: C.green, color: "#fff", fontSize: 13, fontWeight: 600, cursor: syncSaving ? "not-allowed" : "pointer" }}>
              {syncSaving ? "Opslaan..." : `✓ Bevestig & sla ${syncPreview.length} periodes op`}
            </button>
          )}
        </div>

        {syncMsg && (
          <div style={{ fontSize: 13, padding: "10px 14px", borderRadius: 8, background: syncMsg.startsWith("✓") ? "rgba(47,79,62,.08)" : "rgba(185,28,28,.06)", color: syncMsg.startsWith("✓") ? C.green : "#b91c1c", marginBottom: 12 }}>
            {syncMsg}
          </div>
        )}

        {syncPreview && (
          <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 90px", padding: "8px 16px", background: C.bg, fontSize: 11, color: C.light, fontWeight: 600 }}>
              <div>Periode</div><div>Van</div><div>Tot</div><div>Per nacht</div>
            </div>
            {syncPreview.sort((a, b) => a.start_date.localeCompare(b.start_date)).map((p, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 90px", padding: "8px 16px", borderTop: `1px solid ${C.border}`, fontSize: 12, alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: CATEGORY_COLORS[p.category] || C.gold, flexShrink: 0 }} />
                  <span style={{ color: C.text }}>{p.label}</span>
                </div>
                <div style={{ color: C.muted }}>{p.start_date}</div>
                <div style={{ color: C.muted }}>{p.end_date}</div>
                <div style={{ fontWeight: 600, color: C.gold }}>€ {p.price_per_night}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── HANDMATIGE PERIODES ── */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        <div
          onClick={() => setShowManual(v => !v)}
          style={{ padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: C.text }}>Handmatige tariefperiodes</div>
            <div style={{ fontSize: 12, color: C.light, marginTop: 2 }}>Voeg aangepaste periodes toe of bewerk bestaande</div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={e => { e.stopPropagation(); startCreate(); }} style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: C.green, color: "#fff", fontSize: 12, cursor: "pointer" }}>
              + Nieuw
            </button>
            <span style={{ fontSize: 18, color: C.light }}>{showManual ? "▲" : "▼"}</span>
          </div>
        </div>

        {showManual && (
          <div style={{ padding: "0 24px 20px", borderTop: `1px solid ${C.border}` }}>
            {periodsError && (
              <div style={{ fontSize: 12, color: "#b91c1c", background: "rgba(185,28,28,.06)", borderRadius: 8, padding: "8px 12px", margin: "12px 0" }}>
                {periodsError} — maak de tabel aan:{" "}
                <code style={{ fontSize: 10 }}>CREATE TABLE pricing_periods (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, lodge_id text NOT NULL, label text NOT NULL, start_date date NOT NULL, end_date date NOT NULL, price_per_night numeric(10,2) NOT NULL, created_at timestamptz DEFAULT now());</code>
              </div>
            )}

            {(creating || editing) && (
              <div style={{ background: C.bg, borderRadius: 10, padding: "16px", margin: "12px 0" }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 12 }}>{creating ? "Nieuwe periode" : "Bewerk periode"}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 3 }}>Lodge</label>
                    <select value={form.lodge_id} onChange={e => setForm({ ...form, lodge_id: e.target.value })} style={inp}>
                      <option value="lodge_1">Lodge De Heide</option>
                      <option value="lodge_2">Lodge De Eik</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 3 }}>Naam</label>
                    <input value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} placeholder="bijv. Kerst" style={inp} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
                  <div><label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 3 }}>Van</label><input value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} type="date" style={inp} /></div>
                  <div><label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 3 }}>Tot</label><input value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} type="date" style={inp} /></div>
                  <div><label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 3 }}>€ per nacht</label><input value={form.price_per_night} onChange={e => setForm({ ...form, price_per_night: e.target.value })} type="number" step="0.01" style={inp} /></div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={cancel} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.card, fontSize: 12, color: C.muted, cursor: "pointer" }}>Annuleren</button>
                  <button onClick={savePeriod} disabled={saving} style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: C.green, color: "#fff", fontSize: 12, cursor: "pointer" }}>{saving ? "Opslaan..." : "Opslaan"}</button>
                </div>
              </div>
            )}

            {periodsLoading ? (
              <div style={{ fontSize: 13, color: C.light, padding: "16px 0", textAlign: "center" }}>Laden...</div>
            ) : (
              (["lodge_1", "lodge_2"] as const).map(lodgeId => {
                const byLodge = periods.filter(p => p.lodge_id === lodgeId);
                return (
                  <div key={lodgeId} style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 8 }}>Lodge {lodgeLabel(lodgeId)} ({byLodge.length})</div>
                    {byLodge.length === 0 ? (
                      <div style={{ fontSize: 12, color: C.light, padding: "8px 0" }}>Geen handmatige periodes</div>
                    ) : (
                      <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "2fr 100px 100px 90px 100px", padding: "7px 14px", background: C.bg, fontSize: 11, color: C.light }}>
                          <div>Naam</div><div>Van</div><div>Tot</div><div>Per nacht</div><div />
                        </div>
                        {byLodge.map(p => (
                          <div key={p.id} style={{ display: "grid", gridTemplateColumns: "2fr 100px 100px 90px 100px", padding: "9px 14px", fontSize: 12, borderTop: `1px solid ${C.border}`, alignItems: "center" }}>
                            <div style={{ color: C.text, fontWeight: 500 }}>{p.label}</div>
                            <div style={{ color: C.muted }}>{p.start_date}</div>
                            <div style={{ color: C.muted }}>{p.end_date}</div>
                            <div style={{ fontWeight: 600, color: C.gold }}>€ {Number(p.price_per_night).toFixed(0)}</div>
                            <div style={{ display: "flex", gap: 4 }}>
                              <button onClick={() => startEdit(p)} style={{ padding: "3px 8px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.card, fontSize: 11, color: C.muted, cursor: "pointer" }}>Bewerk</button>
                              <button onClick={() => deletePeriod(p.id)} style={{ padding: "3px 8px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.card, fontSize: 11, color: "#E24B4A", cursor: "pointer" }}>×</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
