"use client";
import { useState } from "react";
import { BookingRequest } from "../types";
import { Badge } from "./Badge";
import { timeAgo } from "./Badge";

const BRON_LABELS: Record<string, { icon: string; label: string }> = {
  homepage:   { icon: "🏠", label: "Homepage" },
  app:        { icon: "📱", label: "App" },
  terugkomer: { icon: "↩️", label: "Terugkomer" },
};

const LODGE_SHORT_NAMES: Record<string, string> = {
  lodge_1: "De Heide",
  lodge_2: "De Eik",
};

const SOORT_LABEL: Record<string, { label: string; color: string }> = {
  toeslag:   { label: "Toeslag",   color: "#E67E22" },
  korting:   { label: "Korting",   color: "#2E7D32" },
  belasting: { label: "Belasting", color: "#1565C0" },
};

type OfferteForm = {
  prijsVerblijf: string;
  schoonmaak: string;
  toeristenbelasting: string;
  extraRegels: { label: string; bedrag: string; soort: "toeslag" | "korting" | "belasting" }[];
  bericht: string;
};

export function AanvragenV2Tab({ requests, setRequests }: { requests: BookingRequest[]; setRequests: (r: BookingRequest[]) => void }) {
  const C = { bg: "#F5F3EE", card: "#fff", border: "#E8E4DC", text: "#2A2418", muted: "#8A7D6A", light: "#B4AFA5", green: "#2F4F3E", gold: "#B49A5E" };
  const [filterBron, setFilterBron] = useState<"all" | "homepage" | "app" | "terugkomer">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | BookingRequest["status"]>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingPrefill, setLoadingPrefill] = useState<string | null>(null);
  const [forms, setForms] = useState<Record<string, OfferteForm>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, { ok: boolean; msg: string }>>({});
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<unknown>(null);
  const [payLoading, setPayLoading] = useState<string | null>(null);

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    border: `1px solid ${C.border}`, background: C.card,
    fontSize: 13, color: C.text, outline: "none", boxSizing: "border-box",
  };

  const runDiagnosis = async () => {
    setDiagnosing(true);
    setDiagnosis(null);
    try {
      const r = await fetch("/api/admin/diagnose-booking-requests");
      const d = await r.json();
      setDiagnosis(d);
    } catch (e) {
      setDiagnosis({ error: String(e) });
    }
    setDiagnosing(false);
  };

  const openEditor = async (req: BookingRequest, editable = true) => {
    if (expandedId === req.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(req.id);
    if (!editable) return;       // betaalpaneel heeft geen prefill nodig
    if (forms[req.id]) return; // al geladen

    setLoadingPrefill(req.id);
    try {
      const r = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "prefill_offerte", requestId: req.id }),
      });
      const d = await r.json();
      if (d.success && d.prefill) {
        setForms(prev => ({
          ...prev,
          [req.id]: {
            prijsVerblijf: d.prefill.verblijf > 0 ? String(d.prefill.verblijf) : "",
            schoonmaak: d.prefill.schoonmaak > 0 ? String(d.prefill.schoonmaak) : "",
            toeristenbelasting: d.prefill.toeristenbelasting > 0 ? String(d.prefill.toeristenbelasting) : "",
            extraRegels: (d.prefill.extraRegels || []).map((x: { label: string; bedrag: number; soort: string }) => ({
              label: x.label, bedrag: String(x.bedrag), soort: (x.soort as "toeslag" | "korting" | "belasting"),
            })),
            bericht: "",
          },
        }));
      }
    } catch (e) {
      console.error("Prefill failed:", e);
    }
    setLoadingPrefill(null);
  };

  const updateForm = (id: string, patch: Partial<OfferteForm>) => {
    setForms(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const addRegel = (id: string, regel: { label: string; bedrag: string; soort: "toeslag" | "korting" | "belasting" }) => {
    setForms(prev => ({
      ...prev,
      [id]: { ...prev[id], extraRegels: [...(prev[id]?.extraRegels || []), regel] },
    }));
  };

  const removeRegel = (id: string, idx: number) => {
    setForms(prev => ({
      ...prev,
      [id]: { ...prev[id], extraRegels: prev[id].extraRegels.filter((_, i) => i !== idx) },
    }));
  };

  const updateRegel = (id: string, idx: number, patch: Partial<{ label: string; bedrag: string; soort: "toeslag" | "korting" | "belasting" }>) => {
    setForms(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        extraRegels: prev[id].extraRegels.map((r, i) => i === idx ? { ...r, ...patch } : r),
      },
    }));
  };

  const computeTotal = (f: OfferteForm): number => {
    const v = parseFloat(f.prijsVerblijf) || 0;
    const s = parseFloat(f.schoonmaak) || 0;
    const t = parseFloat(f.toeristenbelasting) || 0;
    const extras = f.extraRegels.reduce((acc, r) => {
      const b = Math.abs(parseFloat(r.bedrag) || 0);
      return acc + (r.soort === "korting" ? -b : b);
    }, 0);
    return Math.max(0, v + s + t + extras);
  };

  const sendOfferte = async (req: BookingRequest) => {
    const f = forms[req.id];
    if (!f || !f.prijsVerblijf) return;
    setSaving(req.id);
    setResult(prev => ({ ...prev, [req.id]: { ok: false, msg: "" } }));
    try {
      const r = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_offerte_v2",
          requestId: req.id,
          prijsVerblijf: f.prijsVerblijf,
          schoonmaak: f.schoonmaak,
          toeristenbelasting: f.toeristenbelasting,
          extraRegels: f.extraRegels.map(x => ({ label: x.label, bedrag: parseFloat(x.bedrag) || 0, soort: x.soort })),
          bericht: f.bericht,
        }),
      });
      const d = await r.json();
      if (d.success) {
        setRequests(requests.map(x => x.id === req.id ? { ...x, status: "offerte_verstuurd", totaal: d.totaal } : x));
        setExpandedId(null);
        setResult(prev => ({ ...prev, [req.id]: { ok: true, msg: d.warning || `Offerte € ${Number(d.totaal).toFixed(2)} verstuurd` } }));
      } else {
        setResult(prev => ({ ...prev, [req.id]: { ok: false, msg: d.error || "Kon offerte niet versturen" } }));
      }
    } catch {
      setResult(prev => ({ ...prev, [req.id]: { ok: false, msg: "Verbindingsfout" } }));
    }
    setSaving(null);
  };

  const rejectRequest = async (id: string) => {
    if (!confirm("Aanvraag afwijzen?")) return;
    setSaving(id);
    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject_booking_request", id }),
      });
      setRequests(requests.map(x => x.id === id ? { ...x, status: "afgewezen" } : x));
      setExpandedId(null);
    } catch {}
    setSaving(null);
  };

  const markInBehandeling = async (id: string) => {
    await fetch("/api/admin/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_booking_in_behandeling", id }),
    });
    setRequests(requests.map(x => x.id === id ? { ...x, status: "in_behandeling" } : x));
  };

  const sendPaymentLink = async (req: BookingRequest, fase: "aanbetaling" | "restbetaling") => {
    if (!req.totaal || Number(req.totaal) <= 0) {
      setResult(prev => ({ ...prev, [req.id]: { ok: false, msg: "Stuur eerst een offerte" } }));
      return;
    }
    const faseLabel = fase === "aanbetaling" ? "Aanbetaling" : "Restbetaling";
    if (!confirm(`${faseLabel} (${fase === "aanbetaling" ? "30%" : "70%"}) als iDEAL-betaallink naar ${req.gast_email || "de gast"} sturen?`)) return;
    setPayLoading(`${req.id}:${fase}`);
    setResult(prev => ({ ...prev, [req.id]: { ok: false, msg: "" } }));
    try {
      const r = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_payment_link", requestId: req.id, fase }),
      });
      const d = await r.json();
      if (d.success) {
        const newStatus = fase === "aanbetaling" ? "aanbetaling_verstuurd" : "restbetaling_verstuurd";
        setRequests(requests.map(x => x.id === req.id ? { ...x, status: newStatus } : x));
        setResult(prev => ({ ...prev, [req.id]: { ok: true, msg: `${faseLabel} € ${Number(d.amount).toFixed(2)} verstuurd` } }));
      } else {
        setResult(prev => ({ ...prev, [req.id]: { ok: false, msg: d.error || "Kon betaallink niet versturen" } }));
      }
    } catch {
      setResult(prev => ({ ...prev, [req.id]: { ok: false, msg: "Verbindingsfout" } }));
    }
    setPayLoading(null);
  };

  const filtered = requests.filter(r =>
    (filterBron === "all" || r.bron === filterBron) &&
    (filterStatus === "all" || r.status === filterStatus)
  );

  const fmtDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString("nl-NL", { day: "numeric", month: "short" }) : "—";

  const period = (r: BookingRequest) => {
    if (r.check_in && r.check_out) {
      return `${fmtDate(r.check_in)} → ${fmtDate(r.check_out)}${r.nachten ? ` · ${r.nachten}n` : ""}`;
    }
    return r.periode_tekst || "—";
  };

  const chipStyle = (active: boolean): React.CSSProperties => ({
    padding: "5px 12px", borderRadius: 14, border: `1px solid ${active ? C.green : C.border}`,
    background: active ? C.green : C.card, color: active ? "#fff" : C.muted,
    fontSize: 12, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap",
  });

  const counts = {
    all: requests.length,
    homepage:   requests.filter(r => r.bron === "homepage").length,
    app:        requests.filter(r => r.bron === "app").length,
    terugkomer: requests.filter(r => r.bron === "terugkomer").length,
  };

  const renderEditor = (req: BookingRequest) => {
    const f = forms[req.id];
    const isLoading = loadingPrefill === req.id;
    if (isLoading || !f) {
      return <div style={{ padding: 24, fontSize: 13, color: C.muted }}>Voorstel berekenen...</div>;
    }
    const total = computeTotal(f);
    const isSaving = saving === req.id;
    const res = result[req.id];

    return (
      <div style={{ padding: "20px 24px", background: "#FAFAF7", borderTop: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: .5, marginBottom: 12, fontWeight: 500 }}>
          Offerte opbouwen
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Verblijf (€) *</label>
            <input value={f.prijsVerblijf} onChange={e => updateForm(req.id, { prijsVerblijf: e.target.value })} type="number" step="0.01" placeholder="0.00" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Eindschoonmaak (€)</label>
            <input value={f.schoonmaak} onChange={e => updateForm(req.id, { schoonmaak: e.target.value })} type="number" step="0.01" placeholder="0.00" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Toeristenbelasting (€)</label>
            <input value={f.toeristenbelasting} onChange={e => updateForm(req.id, { toeristenbelasting: e.target.value })} type="number" step="0.01" placeholder="0.00" style={inputStyle} />
          </div>
        </div>

        {f.extraRegels.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>Extra regels</div>
            {f.extraRegels.map((r, idx) => {
              const soort = SOORT_LABEL[r.soort];
              return (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 110px 130px 28px", gap: 8, marginBottom: 6, alignItems: "center" }}>
                  <input value={r.label} onChange={e => updateRegel(req.id, idx, { label: e.target.value })} placeholder="Label" style={inputStyle} />
                  <input value={r.bedrag} onChange={e => updateRegel(req.id, idx, { bedrag: e.target.value })} type="number" step="0.01" placeholder="0.00" style={inputStyle} />
                  <select value={r.soort} onChange={e => updateRegel(req.id, idx, { soort: e.target.value as "toeslag" | "korting" | "belasting" })} style={{ ...inputStyle, color: soort.color, fontWeight: 500 }}>
                    <option value="toeslag">Toeslag</option>
                    <option value="korting">Korting</option>
                    <option value="belasting">Belasting</option>
                  </select>
                  <button onClick={() => removeRegel(req.id, idx)} title="Verwijder regel" style={{
                    width: 28, height: 28, borderRadius: 6, border: `1px solid ${C.border}`,
                    background: C.card, color: "#E24B4A", cursor: "pointer", fontSize: 14, padding: 0,
                  }}>×</button>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <button onClick={() => addRegel(req.id, { label: "", bedrag: "", soort: "toeslag" })} style={{
            padding: "8px 14px", borderRadius: 6, border: `1px dashed ${C.green}`,
            background: "transparent", fontSize: 12, fontWeight: 600, color: C.green, cursor: "pointer",
          }}>+ Extra regel</button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Persoonlijk bericht (optioneel)</label>
          <textarea value={f.bericht} onChange={e => updateForm(req.id, { bericht: e.target.value })}
            placeholder="Welkom! We verheugen ons op jullie komst..."
            rows={3} style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 16, fontWeight: 500, color: C.green }}>
            Totaal: € {total.toFixed(2)}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {res && !res.ok && res.msg && (
              <span style={{ fontSize: 12, color: "#E24B4A" }}>{res.msg}</span>
            )}
            <button onClick={() => rejectRequest(req.id)} disabled={isSaving} style={{
              padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`,
              background: C.card, fontSize: 12, color: "#E24B4A", cursor: isSaving ? "not-allowed" : "pointer",
            }}>Wijs af</button>
            {req.status === "nieuw" && (
              <button onClick={() => markInBehandeling(req.id)} disabled={isSaving} style={{
                padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`,
                background: C.card, fontSize: 12, color: C.muted, cursor: isSaving ? "not-allowed" : "pointer",
              }}>In behandeling</button>
            )}
            <button onClick={() => sendOfferte(req)} disabled={!f.prijsVerblijf || isSaving} style={{
              padding: "8px 20px", borderRadius: 8, border: "none",
              background: f.prijsVerblijf && !isSaving ? C.green : C.border,
              fontSize: 12, fontWeight: 500, color: "#fff", cursor: f.prijsVerblijf && !isSaving ? "pointer" : "not-allowed",
            }}>{isSaving ? "Versturen..." : "Verstuur offerte →"}</button>
          </div>
        </div>
      </div>
    );
  };

  const renderPayment = (req: BookingRequest) => {
    const totaal = Number(req.totaal) || 0;
    const deposit = Math.round(totaal * 0.30 * 100) / 100;
    const rest = Math.round((totaal - deposit) * 100) / 100;
    const res = result[req.id];

    const depositSent = ["aanbetaling_verstuurd", "aanbetaling_betaald", "restbetaling_verstuurd", "volledig_betaald"].includes(req.status);
    const depositPaid = ["aanbetaling_betaald", "restbetaling_verstuurd", "volledig_betaald"].includes(req.status);
    const finalSent = ["restbetaling_verstuurd", "volledig_betaald"].includes(req.status);
    const finalPaid = req.status === "volledig_betaald";

    const row = (
      label: string, pct: string, amount: number,
      fase: "aanbetaling" | "restbetaling",
      sent: boolean, paid: boolean, enabled: boolean,
    ) => {
      const busy = payLoading === `${req.id}:${fase}`;
      return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 14px", border: `1px solid ${C.border}`, borderRadius: 8, background: C.card }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{label} <span style={{ color: C.muted, fontWeight: 400 }}>({pct})</span></div>
            <div style={{ fontSize: 16, fontWeight: 500, color: C.green }}>€ {amount.toFixed(2)}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {paid
              ? <span style={{ fontSize: 12, color: "#2E7D32", fontWeight: 600 }}>✓ betaald</span>
              : sent
                ? <span style={{ fontSize: 12, color: "#F9A825", fontWeight: 600 }}>● link verstuurd</span>
                : null}
            <button
              onClick={() => sendPaymentLink(req, fase)}
              disabled={!enabled || busy || paid}
              style={{
                padding: "8px 16px", borderRadius: 8, border: "none",
                background: (enabled && !paid) ? C.green : C.border,
                fontSize: 12, fontWeight: 500, color: "#fff",
                cursor: (enabled && !busy && !paid) ? "pointer" : "not-allowed",
              }}
            >
              {busy ? "Versturen..." : sent ? "Opnieuw sturen" : "Stuur betaallink"}
            </button>
          </div>
        </div>
      );
    };

    return (
      <div style={{ padding: "20px 24px", background: "#FAFAF7", borderTop: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: .5, marginBottom: 12, fontWeight: 500 }}>
          Betaling in termijnen
        </div>
        {totaal <= 0 ? (
          <div style={{ fontSize: 13, color: "#E24B4A" }}>Geen totaalbedrag bekend — stuur eerst een offerte.</div>
        ) : (
          <>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>
              Totaal bevestigd: <strong style={{ color: C.text }}>€ {totaal.toFixed(2)}</strong>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {row("Aanbetaling", "30%", deposit, "aanbetaling", depositSent, depositPaid, true)}
              {row("Restbetaling", "70%", rest, "restbetaling", finalSent, finalPaid, depositPaid || finalSent)}
            </div>
            {!depositPaid && (
              <div style={{ fontSize: 11, color: C.light, marginTop: 10 }}>
                De restbetaling wordt actief zodra de aanbetaling is voldaan.
              </div>
            )}
            {res && !res.ok && res.msg && (
              <div style={{ fontSize: 12, color: "#E24B4A", marginTop: 10 }}>{res.msg}</div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <div style={{ fontSize: 20, fontWeight: 500, color: C.text, marginBottom: 4 }}>Aanvragen</div>
      <div style={{ fontSize: 13, color: C.light, marginBottom: 20 }}>
        Alle aanvragen uit alle bronnen — homepage, concierge-app en terugkomers — in één overzicht. Klik op een aanvraag om een offerte op te bouwen.
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        <button onClick={() => setFilterBron("all")} style={chipStyle(filterBron === "all")}>Alle bronnen ({counts.all})</button>
        <button onClick={() => setFilterBron("homepage")}   style={chipStyle(filterBron === "homepage")}>🏠 Homepage ({counts.homepage})</button>
        <button onClick={() => setFilterBron("app")}        style={chipStyle(filterBron === "app")}>📱 App ({counts.app})</button>
        <button onClick={() => setFilterBron("terugkomer")} style={chipStyle(filterBron === "terugkomer")}>↩️ Terugkomer ({counts.terugkomer})</button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
        <button onClick={() => setFilterStatus("all")} style={chipStyle(filterStatus === "all")}>Alle statussen</button>
        {(["nieuw", "in_behandeling", "offerte_verstuurd", "bevestigd", "afgewezen"] as const).map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} style={chipStyle(filterStatus === s)}>{s.replace("_", " ")}</button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ fontSize: 13, color: C.light, padding: 40, textAlign: "center", background: C.card, border: `1px solid ${C.border}`, borderRadius: 12 }}>
          Geen aanvragen in deze selectie
        </div>
      )}

      {filtered.length > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "90px 1fr 1fr 110px 90px 110px 100px", padding: "12px 16px", background: C.bg, fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: .5, fontWeight: 500 }}>
            <div>Bron</div>
            <div>Gast</div>
            <div>Periode</div>
            <div>Lodge</div>
            <div style={{ textAlign: "right" }}>Voorstel</div>
            <div>Status</div>
            <div style={{ textAlign: "right" }}>Ontvangen</div>
          </div>
          {filtered.map(r => {
            const bron = BRON_LABELS[r.bron] || { icon: "·", label: r.bron };
            const name = r.guest?.naam || r.gast_naam || "—";
            const email = r.guest?.email || r.gast_email || "";
            const lodge = r.lodge ? (LODGE_SHORT_NAMES[r.lodge] || r.lodge) : "—";
            const isExpanded = expandedId === r.id;
            const isEditable = r.status === "nieuw" || r.status === "in_behandeling" || r.status === "offerte_verstuurd";
            const isPayable = r.status === "bevestigd" || r.status === "aanbetaling_verstuurd" || r.status === "aanbetaling_betaald" || r.status === "restbetaling_verstuurd" || r.status === "volledig_betaald";
            const isExpandable = isEditable || isPayable;
            const res = result[r.id];

            return (
              <div key={r.id} style={{ borderTop: `1px solid ${C.border}` }}>
                <div
                  onClick={() => isExpandable && openEditor(r, isEditable)}
                  style={{
                    display: "grid", gridTemplateColumns: "90px 1fr 1fr 110px 90px 110px 100px",
                    padding: "14px 16px", fontSize: 13, color: C.text, alignItems: "center",
                    cursor: isExpandable ? "pointer" : "default",
                    background: isExpanded ? "#FAFAF7" : "transparent",
                  }}
                >
                  <div title={bron.label} style={{ fontSize: 14 }}>{bron.icon} <span style={{ fontSize: 11, color: C.muted }}>{bron.label}</span></div>
                  <div>
                    <div style={{ fontWeight: 500 }}>{name}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{email}</div>
                  </div>
                  <div style={{ fontSize: 12, color: C.muted }}>
                    {period(r)}
                    <div style={{ fontSize: 11 }}>
                      {(r.personen ?? 0) > 0 && `${r.personen}p`}
                      {r.huisdieren && <span style={{ marginLeft: 6 }}>🐾</span>}
                      {r.promo_code && <span style={{ marginLeft: 6, color: C.gold }}>{r.promo_code}</span>}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: C.muted }}>{lodge}</div>
                  <div style={{ textAlign: "right", fontWeight: 500, color: r.voorgestelde_prijs || r.totaal ? C.text : C.light }}>
                    {r.totaal ? `€ ${Number(r.totaal).toFixed(2)}` : (r.voorgestelde_prijs ? `€ ${Number(r.voorgestelde_prijs).toFixed(2)}` : "—")}
                  </div>
                  <div>
                    <Badge status={r.status} />
                    {res?.ok && <div style={{ fontSize: 11, color: "#2E7D32", marginTop: 2 }}>✓ {res.msg}</div>}
                  </div>
                  <div style={{ textAlign: "right", fontSize: 12, color: C.muted }}>
                    {timeAgo(r.created_at)}
                    {isExpandable && <div style={{ fontSize: 10, color: C.gold, marginTop: 2 }}>{isExpanded ? "▲" : "▼"}</div>}
                  </div>
                </div>
                {isExpanded && (isEditable ? renderEditor(r) : renderPayment(r))}
              </div>
            );
          })}
        </div>
      )}

      <details style={{ marginTop: 16, padding: "10px 16px", background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 12, color: C.muted }}>
        <summary style={{ cursor: "pointer", fontWeight: 500 }}>🔧 Diagnose: aanvragen komen niet binnen?</summary>
        <div style={{ marginTop: 12 }}>
          <p style={{ margin: "0 0 10px", lineHeight: 1.5 }}>
            Test of de <code>booking_requests</code>-tabel bereikbaar en beschrijfbaar is. Doet een proef-insertie en ruimt die direct op.
          </p>
          <button onClick={runDiagnosis} disabled={diagnosing} style={{
            padding: "7px 14px", borderRadius: 6, border: `1px solid ${C.border}`,
            background: C.card, fontSize: 12, color: C.text, cursor: diagnosing ? "not-allowed" : "pointer",
          }}>{diagnosing ? "Bezig..." : "Diagnose starten"}</button>
          {diagnosis !== null && (
            <pre style={{
              marginTop: 12, padding: 12, background: "#1F1F1F", color: "#E0E0E0",
              borderRadius: 6, fontSize: 11, overflowX: "auto", maxHeight: 400,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            }}>{JSON.stringify(diagnosis, null, 2)}</pre>
          )}
        </div>
      </details>
    </>
  );
}
