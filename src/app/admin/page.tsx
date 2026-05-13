"use client";
import { useState, useEffect } from "react";

type Booking = { id: string; product: string; prijs: number; status: string; created_at: string; guest_id: string; metadata: Record<string, unknown> };
type Guest = { id: string; naam: string; email: string; profiel: string; laatste_bezoek: string };
type Review = { id: string; naam: string; sterren: number; tekst: string; zichtbaar: boolean; created_at: string };
type Aanvraag = { id: string; van: string; tot: string; personen: number; status: string; offerte_bedrag: number | null; created_at: string; guest_id: string; bericht?: string; guest?: { naam: string; email: string } | null };
type Product = { id: string; naam: string; omschrijving: string | null; prijs: number; categorie: string; actief: boolean; volgorde: number; btw_percentage: number; grootboek_code: string };
type Stay = { id: string; guest_id: string; lodge: string; check_in: string; check_out: string; token: string; door_code: string; wifi_code: string; status: string; welcome_sent: boolean; guests?: { naam: string; email: string } };

const C = {
  bg: "#F5F3EE", card: "#fff", border: "#E8E4DC",
  text: "#2A2418", muted: "#8A7D6A", light: "#B4AFA5",
  green: "#2F4F3E", gold: "#B49A5E",
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  nieuw: { bg: "#FFF3E0", text: "#E67E22" },
  bevestigd: { bg: "#E8F5E9", text: "#2E7D32" },
  betaald: { bg: "#E8F5E9", text: "#2E7D32" },
  afgewezen: { bg: "#FFEBEE", text: "#C62828" },
  offerte_verstuurd: { bg: "#E3F2FD", text: "#1565C0" },
  geboekt: { bg: "#E8F5E9", text: "#2E7D32" },
  verlopen: { bg: "#F5F5F5", text: "#9E9E9E" },
};

function Badge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] || { bg: "#F5F5F5", text: "#9E9E9E" };
  const label = status.replace("_", " ");
  return (
    <span style={{ background: c.bg, color: c.text, fontSize: 11, padding: "3px 10px", borderRadius: 6, fontWeight: 500, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} uur`;
  const days = Math.floor(hours / 24);
  return `${days} dag${days > 1 ? "en" : ""}`;
}

type Tab = "dashboard" | "boekingen" | "gasten" | "reviews" | "aanvragen" | "producten" | "verblijven" | "tarieven" | "lodge_1" | "lodge_2";

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [aanvragen, setAanvragen] = useState<Aanvraag[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stays, setStays] = useState<Stay[]>([]);
  const [guestMap, setGuestMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [followUpSending, setFollowUpSending] = useState(false);
  const [followUpResult, setFollowUpResult] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [bRes, gRes, rRes, aRes, pRes, sRes] = await Promise.all([
          fetch("/api/admin/data?table=bookings"),
          fetch("/api/admin/data?table=guests"),
          fetch("/api/admin/data?table=reviews"),
          fetch("/api/admin/data?table=aanvragen"),
          fetch("/api/admin/data?table=products"),
          fetch("/api/admin/data?table=stays"),
        ]);
        const [bData, gData, rData, aData, pData, sData] = await Promise.all([bRes.json(), gRes.json(), rRes.json(), aRes.json(), pRes.json(), sRes.json()]);
        setBookings(bData.data || []);
        setGuests(gData.data || []);
        setReviews(rData.data || []);
        setAanvragen(aData.data || []);
        setProducts(pData.data || []);
        setStays(sData.data || []);

        // Build guest name map
        const map: Record<string, string> = {};
        (gData.data || []).forEach((g: Guest) => { map[g.id] = g.naam; });
        setGuestMap(map);
      } catch (e) { console.error("Load failed:", e); }
      setLoading(false);
    }
    load();
  }, []);

  const toggleReview = async (id: string, visible: boolean) => {
    await fetch("/api/admin/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle_review", id, visible }),
    });
    setReviews(prev => prev.map(r => r.id === id ? { ...r, zichtbaar: visible } : r));
  };

  const sendFollowUps = async () => {
    setFollowUpSending(true);
    setFollowUpResult("");
    try {
      const r = await fetch("/api/followup", { method: "POST" });
      const d = await r.json();
      setFollowUpResult(d.message || `${d.sent || 0} email(s) verstuurd`);
    } catch { setFollowUpResult("Kon follow-ups niet versturen"); }
    setFollowUpSending(false);
  };

  const logout = () => {
    document.cookie = "hth-admin-session=; path=/; max-age=0";
    window.location.href = "/admin/login";
  };

  const newBookings = bookings.filter(b => b.status === "nieuw").length;
  const openAanvragen = aanvragen.filter(a => a.status === "nieuw" || a.status === "offerte_verstuurd").length;
  const avgStars = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.sterren, 0) / reviews.length).toFixed(1) : "—";

  const font = "'Inter', system-ui, -apple-system, sans-serif";

  const navItems: { id: Tab; label: string }[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "verblijven", label: "Verblijven" },
    { id: "boekingen", label: "Boekingen" },
    { id: "gasten", label: "Gasten" },
    { id: "reviews", label: "Reviews" },
    { id: "aanvragen", label: "Aanvragen" },
    { id: "producten", label: "Producten" },
    { id: "tarieven", label: "Tarieven" },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", minHeight: "100vh", fontFamily: font }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      {/* Sidebar */}
      <div style={{ width: 220, background: C.card, borderRight: `1px solid ${C.border}`, padding: "20px 0", flexShrink: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "0 20px 24px" }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: C.text, letterSpacing: .5 }}>HUIS TER HUYNEN</div>
          <div style={{ fontSize: 11, color: C.gold, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 2 }}>Backoffice</div>
        </div>

        <div style={{ padding: "0 12px", flex: 1 }}>
          {navItems.map(n => (
            <div key={n.id} onClick={() => setTab(n.id)} style={{
              padding: "9px 14px", borderRadius: 8, marginBottom: 2, cursor: "pointer",
              background: tab === n.id ? C.bg : "transparent",
              color: tab === n.id ? C.text : C.muted,
              fontSize: 13, fontWeight: tab === n.id ? 500 : 400,
            }}>{n.label}</div>
          ))}
        </div>

        <div style={{ padding: "16px 12px", borderTop: `1px solid ${C.border}`, marginTop: "auto" }}>
          <div style={{ padding: "6px 14px", fontSize: 11, color: C.light, textTransform: "uppercase", letterSpacing: .5 }}>Lodges</div>
          {(["lodge_1", "lodge_2"] as Tab[]).map(l => (
            <div key={l} onClick={() => setTab(l)} style={{
              padding: "8px 14px", borderRadius: 8, marginBottom: 2, cursor: "pointer",
              background: tab === l ? C.bg : "transparent",
              fontSize: 13, color: tab === l ? C.text : C.muted, fontWeight: tab === l ? 500 : 400,
            }}>
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#2E7D32", marginRight: 8 }}></span>
              {l === "lodge_1" ? "Lodge 1 — Boomhut" : "Lodge 2 — Schaapskooi"}
            </div>
          ))}
        </div>

        <div style={{ padding: "12px 12px 0", borderTop: `1px solid ${C.border}` }}>
          <div onClick={logout} style={{ padding: "9px 14px", fontSize: 13, color: C.light, cursor: "pointer" }}>Uitloggen</div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
        {loading ? (
          <div style={{ fontSize: 14, color: C.muted, padding: 40, textAlign: "center" }}>Laden...</div>
        ) : (
          <>
            {/* DASHBOARD */}
            {tab === "dashboard" && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 500, color: C.text }}>Dashboard</div>
                    <div style={{ fontSize: 13, color: C.light, marginTop: 2 }}>Overzicht van je lodges</div>
                  </div>
                  <button onClick={sendFollowUps} disabled={followUpSending} style={{
                    padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`,
                    background: C.card, fontSize: 12, color: C.muted, cursor: followUpSending ? "not-allowed" : "pointer",
                  }}>{followUpSending ? "Bezig..." : "Follow-up emails versturen"}</button>
                </div>

                {followUpResult && (
                  <div style={{ padding: "10px 16px", borderRadius: 8, background: "#E8F5E9", fontSize: 13, color: "#2E7D32", marginBottom: 16 }}>
                    {followUpResult}
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
                  {[
                    { label: "Totaal gasten", value: guests.length, color: C.text },
                    { label: "Nieuwe boekingen", value: newBookings, color: "#1565C0" },
                    { label: "Open aanvragen", value: openAanvragen, color: "#E67E22" },
                    { label: "Reviews", value: avgStars, color: "#2E7D32" },
                  ].map((m, i) => (
                    <div key={i} style={{ background: C.bg, borderRadius: 10, padding: "16px 18px" }}>
                      <div style={{ fontSize: 12, color: C.light, marginBottom: 4 }}>{m.label}</div>
                      <div style={{ fontSize: 24, fontWeight: 500, color: m.color }}>{m.value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: 15, fontWeight: 500, color: C.text, marginBottom: 12 }}>Recente boekingen</div>
                <Table
                  cols={["Gast", "Product", "Bedrag", "Status", "Datum"]}
                  widths={["2fr", "2fr", "1fr", "1fr", "1fr"]}
                  rows={bookings.slice(0, 10).map(b => [
                    guestMap[b.guest_id] || "Onbekend",
                    b.product,
                    b.prijs ? `€ ${b.prijs.toFixed(2)}` : "—",
                    <Badge key={b.id} status={b.status} />,
                    timeAgo(b.created_at),
                  ])}
                />

                {aanvragen.length > 0 && (
                  <>
                    <div style={{ fontSize: 15, fontWeight: 500, color: C.text, marginBottom: 12, marginTop: 28 }}>Terugkeer-aanvragen</div>
                    <Table
                      cols={["Gast", "Periode", "Personen", "Status", "Offerte"]}
                      widths={["2fr", "2fr", "1fr", "1fr", "1fr"]}
                      rows={aanvragen.slice(0, 10).map(a => [
                        a.guest?.naam || guestMap[a.guest_id] || "Onbekend",
                        `${a.van} – ${a.tot}`,
                        String(a.personen),
                        <Badge key={a.id} status={a.status} />,
                        a.offerte_bedrag ? `€ ${a.offerte_bedrag.toFixed(2)}` : "—",
                      ])}
                    />
                  </>
                )}
              </>
            )}

            {/* BOEKINGEN */}
            {tab === "boekingen" && (
              <>
                <div style={{ fontSize: 20, fontWeight: 500, color: C.text, marginBottom: 4 }}>Boekingen</div>
                <div style={{ fontSize: 13, color: C.light, marginBottom: 24 }}>Alle boekingen uit de app</div>
                <Table
                  cols={["Gast", "Product", "Bedrag", "Status", "Datum"]}
                  widths={["2fr", "2fr", "1fr", "1fr", "1fr"]}
                  rows={bookings.map(b => [
                    guestMap[b.guest_id] || "Onbekend",
                    b.product,
                    b.prijs ? `€ ${b.prijs.toFixed(2)}` : "—",
                    <Badge key={b.id} status={b.status} />,
                    new Date(b.created_at).toLocaleDateString("nl-NL", { day: "numeric", month: "short" }),
                  ])}
                />
              </>
            )}

            {/* GASTEN */}
            {tab === "gasten" && (
              <>
                <div style={{ fontSize: 20, fontWeight: 500, color: C.text, marginBottom: 4 }}>Gasten</div>
                <div style={{ fontSize: 13, color: C.light, marginBottom: 24 }}>{guests.length} gasten geregistreerd</div>
                <Table
                  cols={["Naam", "E-mail", "Profiel", "Laatste bezoek"]}
                  widths={["2fr", "2fr", "1fr", "1fr"]}
                  rows={guests.map(g => [
                    g.naam,
                    g.email,
                    g.profiel || "—",
                    g.laatste_bezoek ? new Date(g.laatste_bezoek).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" }) : "—",
                  ])}
                />
              </>
            )}

            {/* REVIEWS */}
            {tab === "reviews" && (
              <>
                <div style={{ fontSize: 20, fontWeight: 500, color: C.text, marginBottom: 4 }}>Reviews</div>
                <div style={{ fontSize: 13, color: C.light, marginBottom: 24 }}>Modereer reviews van gasten</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {reviews.map(r => (
                    <div key={r.id} style={{
                      background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
                      padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                      opacity: r.zichtbaar ? 1 : 0.5,
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                          <span style={{ fontWeight: 500, fontSize: 14, color: C.text }}>{r.naam}</span>
                          <span style={{ fontSize: 13, color: C.gold }}>{"★".repeat(r.sterren)}{"☆".repeat(5 - r.sterren)}</span>
                          <span style={{ fontSize: 11, color: C.light }}>{new Date(r.created_at).toLocaleDateString("nl-NL")}</span>
                        </div>
                        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{r.tekst}</div>
                      </div>
                      <button onClick={() => toggleReview(r.id, !r.zichtbaar)} style={{
                        padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.border}`,
                        background: C.card, fontSize: 12, color: C.muted, cursor: "pointer",
                        marginLeft: 16, whiteSpace: "nowrap",
                      }}>
                        {r.zichtbaar ? "Verberg" : "Toon"}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* AANVRAGEN */}
            {tab === "aanvragen" && (
              <AanvragenTab aanvragen={aanvragen} setAanvragen={setAanvragen} />
            )}

            {/* PRODUCTEN */}
            {tab === "verblijven" && (
              <VerblijvenTab stays={stays} setStays={setStays} />
            )}

            {tab === "producten" && (
              <ProductenTab products={products} setProducts={setProducts} />
            )}

            {tab === "tarieven" && <TarievenTab />}

            {(tab === "lodge_1" || tab === "lodge_2") && (
              <LodgeView lodgeId={tab} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ═══ PRODUCTEN TAB ═══ */
function ProductenTab({ products, setProducts }: { products: Product[]; setProducts: (p: Product[]) => void }) {
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

/* ═══ REUSABLE TABLE ═══ */
function Table({ cols, widths, rows }: { cols: string[]; widths: string[]; rows: React.ReactNode[][] }) {
  const grid = widths.join(" ");
  if (rows.length === 0) {
    return <div style={{ fontSize: 13, color: "#B4AFA5", padding: 20, textAlign: "center" }}>Geen gegevens gevonden</div>;
  }
  return (
    <div style={{ border: "1px solid #E8E4DC", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: grid, padding: "10px 18px", background: "#F5F3EE", fontSize: 12, color: "#B4AFA5", borderBottom: "1px solid #E8E4DC" }}>
        {cols.map((c, i) => <div key={i}>{c}</div>)}
      </div>
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: "grid", gridTemplateColumns: grid, padding: "12px 18px", fontSize: 13, borderBottom: ri < rows.length - 1 ? "1px solid #E8E4DC" : "none", alignItems: "center" }}>
          {row.map((cell, ci) => (
            <div key={ci} style={{ color: ci === 0 ? "#2A2418" : "#8A7D6A", fontWeight: ci === 0 ? 500 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ═══ LODGE VIEW ═══ */
const LODGE_NAMES: Record<string, string> = { lodge_1: "Lodge 1 — Boomhut", lodge_2: "Lodge 2 — Schaapskooi" };

type Preset = { label: string; icon: string; temp: number; light: string; desc: string };
const PRESETS: Preset[] = [
  { label: "Gereed voor gast", icon: "🏡", temp: 21, light: "Warm", desc: "Verwarming 21°, licht warm" },
  { label: "Afwezig", icon: "🌙", temp: 15, light: "Uit", desc: "Verwarming 15°, alles uit" },
  { label: "Vorstbeveiliging", icon: "❄️", temp: 7, light: "Uit", desc: "Minimale verwarming" },
  { label: "Onderhoud", icon: "🔧", temp: 18, light: "Helder", desc: "Schoonmaak, automations uit" },
];

function LodgeView({ lodgeId }: { lodgeId: string }) {
  const C = { bg: "#F5F3EE", card: "#fff", border: "#E8E4DC", text: "#2A2418", muted: "#8A7D6A", light: "#B4AFA5", green: "#2F4F3E", gold: "#B49A5E" };

  const [temp, setTemp] = useState(21);
  const [scene, setScene] = useState("Warm");
  const [activePreset, setActivePreset] = useState("Gereed voor gast");

  const devices = [
    { name: "Airco / verwarming", status: "online", value: `${temp}°C` },
    { name: "Hue verlichting", status: "online", value: scene },
    { name: "Laadpaal", status: "online", value: "Standby" },
    { name: "Energiemeter", status: "online", value: "4.2 kW" },
    { name: "Nuki deurslot", status: "online", value: "Op slot" },
  ];

  const scenes = ["Warm", "Helder", "Dim", "Uit"];
  const sceneColors: Record<string, string> = {
    Warm: "linear-gradient(135deg,#F5C97E,#E8A84C)",
    Helder: "linear-gradient(135deg,#FFF8E8,#F5EDD6)",
    Dim: "linear-gradient(135deg,#D4A56A,#8B6B3D)",
    Uit: "#D4D0C8",
  };

  const applyPreset = (p: Preset) => { setTemp(p.temp); setScene(p.light); setActivePreset(p.label); };
  const cs: React.CSSProperties = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px" };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 500, color: C.text }}>{LODGE_NAMES[lodgeId] || lodgeId}</div>
          <div style={{ fontSize: 13, color: C.light, marginTop: 2 }}>Device bediening · Demo modus</div>
        </div>
        <span style={{ padding: "6px 14px", borderRadius: 8, background: "rgba(46,125,50,.08)", color: "#2E7D32", fontSize: 12, fontWeight: 500 }}>Alle devices online</span>
      </div>

      {/* Presets */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 24 }}>
        {PRESETS.map(p => (
          <div key={p.label} onClick={() => applyPreset(p)} style={{
            ...cs, padding: 16, cursor: "pointer", textAlign: "center",
            border: activePreset === p.label ? `2px solid ${C.green}` : `1px solid ${C.border}`,
            background: activePreset === p.label ? "rgba(47,79,62,.03)" : C.card,
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{p.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 4 }}>{p.label}</div>
            <div style={{ fontSize: 11, color: C.light, lineHeight: 1.4 }}>{p.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        {/* Temperature */}
        <div style={cs}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: C.text }}>Temperatuur</div>
              <div style={{ fontSize: 12, color: C.light, marginTop: 2 }}>Bereik: 5° — 30°C</div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 600, color: C.green }}>{temp}°</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setTemp(t => Math.max(5, t - 1))} style={{ width: 40, height: 40, borderRadius: 10, border: `1px solid ${C.border}`, background: C.card, fontSize: 18, color: C.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
            <div style={{ flex: 1, height: 4, background: C.border, borderRadius: 2, position: "relative" }}>
              <div style={{ position: "absolute", left: 0, top: 0, width: `${((temp - 5) / 25) * 100}%`, height: "100%", background: C.green, borderRadius: 2 }} />
            </div>
            <button onClick={() => setTemp(t => Math.min(30, t + 1))} style={{ width: 40, height: 40, borderRadius: 10, border: "none", background: C.green, fontSize: 18, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
          </div>
        </div>

        {/* Lighting */}
        <div style={cs}>
          <div style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 16 }}>Sfeer</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {scenes.map(s => (
              <button key={s} onClick={() => setScene(s)} style={{
                padding: "14px 0", borderRadius: 10, textAlign: "center", cursor: "pointer",
                border: scene === s ? `2px solid ${C.gold}` : `1px solid ${C.border}`, background: C.card,
              }}>
                <div style={{ width: 22, height: 22, margin: "0 auto 6px", borderRadius: "50%", background: sceneColors[s], border: s === "Helder" ? `1px solid ${C.border}` : "none" }} />
                <div style={{ fontSize: 11, color: scene === s ? C.text : C.light, fontWeight: scene === s ? 500 : 400 }}>{s}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Device status */}
      <div style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 12 }}>Apparaten</div>
      <div style={{ ...cs, padding: 0, marginBottom: 24 }}>
        {devices.map((d, i) => (
          <div key={d.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 24px", borderBottom: i < devices.length - 1 ? `1px solid ${C.border}` : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: d.status === "online" ? "#2E7D32" : "#C62828" }} />
              <span style={{ fontSize: 13, color: C.text }}>{d.name}</span>
            </div>
            <span style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>{d.value}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: "14px 20px", borderRadius: 10, background: "rgba(180,154,94,.06)", border: "1px solid rgba(180,154,94,.15)", fontSize: 13, color: C.gold, textAlign: "center" }}>
        Demo modus — wordt gekoppeld aan Home Assistant zodra de NUC is geïnstalleerd
      </div>
    </>
  );
}

/* ═══ TARIEVEN TAB ═══ */
type PricingPeriod = { id: string; lodge_id: string; label: string; start_date: string; end_date: string; price_per_night: number };

function TarievenTab() {
  const C = { bg: "#F5F3EE", card: "#fff", border: "#E8E4DC", text: "#2A2418", muted: "#8A7D6A", light: "#B4AFA5", green: "#2F4F3E", gold: "#B49A5E" };
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    border: `1px solid ${C.border}`, background: C.card,
    fontSize: 14, color: C.text, outline: "none", boxSizing: "border-box",
  };

  const [periods, setPeriods] = useState<PricingPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const emptyForm = { lodge_id: "lodge_1", label: "", start_date: "", end_date: "", price_per_night: "" };
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    setFetchError(null);
    const res = await fetch("/api/admin/data?table=pricing_periods");
    const d = await res.json();
    if (d.error) setFetchError(d.error);
    setPeriods(d.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const startCreate = () => { setCreating(true); setEditing(null); setForm(emptyForm); };
  const startEdit = (p: PricingPeriod) => {
    setEditing(p.id); setCreating(false);
    setForm({ lodge_id: p.lodge_id, label: p.label, start_date: p.start_date, end_date: p.end_date, price_per_night: String(p.price_per_night) });
  };
  const cancel = () => { setCreating(false); setEditing(null); };

  const save = async () => {
    if (!form.label || !form.start_date || !form.end_date || !form.price_per_night) return;
    setSaving(true);
    const action = creating ? "create_pricing_period" : "update_pricing_period";
    const body: Record<string, unknown> = { action, ...form, price_per_night: parseFloat(form.price_per_night) };
    if (editing) body.id = editing;
    await fetch("/api/admin/data", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    await load();
    setCreating(false); setEditing(null);
    setSaving(false);
  };

  const deletePeriod = async (id: string) => {
    if (!confirm("Tariefperiode verwijderen?")) return;
    await fetch("/api/admin/data", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete_pricing_period", id }) });
    setPeriods(prev => prev.filter(p => p.id !== id));
  };

  const lodgeLabel = (id: string) => id === "lodge_1" ? "De Heide" : "De Eik";
  const byLodge = (id: string) => periods.filter(p => p.lodge_id === id);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 500, color: C.text }}>Tarieven</div>
          <div style={{ fontSize: 13, color: C.light, marginTop: 2 }}>Stel prijzen per periode en lodge in</div>
        </div>
        <button onClick={startCreate} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: C.green, color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
          + Nieuwe periode
        </button>
      </div>

      {fetchError && (
        <div style={{ fontSize: 13, color: "#b91c1c", background: "rgba(185,28,28,.06)", border: "1px solid rgba(185,28,28,.25)", borderRadius: 8, padding: "10px 14px", marginBottom: 20 }}>
          <strong>Fout bij laden tarieven:</strong> {fetchError}
          {fetchError.toLowerCase().includes("exist") || fetchError.toLowerCase().includes("relation") ? (
            <div style={{ marginTop: 6, color: C.muted }}>
              Zorg dat de <strong>pricing_periods</strong> tabel bestaat in Supabase:{" "}
              <code style={{ fontSize: 11, background: "rgba(0,0,0,.05)", padding: "1px 4px", borderRadius: 3 }}>
                CREATE TABLE pricing_periods (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, lodge_id text NOT NULL, label text NOT NULL, start_date date NOT NULL, end_date date NOT NULL, price_per_night numeric(10,2) NOT NULL, created_at timestamptz DEFAULT now());
              </code>
            </div>
          ) : null}
        </div>
      )}

      {(creating || editing) && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px", marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: C.text, marginBottom: 16 }}>{creating ? "Nieuwe tariefperiode" : "Bewerk periode"}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: C.muted, marginBottom: 4 }}>Lodge</label>
              <select value={form.lodge_id} onChange={e => setForm({ ...form, lodge_id: e.target.value })} style={inputStyle}>
                <option value="lodge_1">Lodge De Heide</option>
                <option value="lodge_2">Lodge De Eik</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: C.muted, marginBottom: 4 }}>Naam / label</label>
              <input value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} placeholder="bijv. Zomervakantie NL" style={inputStyle} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: C.muted, marginBottom: 4 }}>Startdatum</label>
              <input value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} type="date" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: C.muted, marginBottom: 4 }}>Einddatum</label>
              <input value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} type="date" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: C.muted, marginBottom: 4 }}>Prijs per nacht (€)</label>
              <input value={form.price_per_night} onChange={e => setForm({ ...form, price_per_night: e.target.value })} type="number" step="0.01" placeholder="195.00" style={inputStyle} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={cancel} style={{ padding: "10px 20px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.card, fontSize: 13, color: C.muted, cursor: "pointer" }}>Annuleren</button>
            <button onClick={save} disabled={!form.label || !form.start_date || !form.end_date || !form.price_per_night || saving} style={{
              padding: "10px 24px", borderRadius: 8, border: "none",
              background: form.label && form.start_date && form.end_date && form.price_per_night && !saving ? C.green : C.border,
              fontSize: 13, fontWeight: 500, color: "#fff",
              cursor: form.label && form.start_date && form.end_date && form.price_per_night ? "pointer" : "not-allowed",
            }}>{saving ? "Opslaan..." : "Opslaan"}</button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ fontSize: 13, color: C.light, padding: 20, textAlign: "center" }}>Laden...</div>
      ) : (
        ["lodge_1", "lodge_2"].map(lodgeId => (
          <div key={lodgeId} style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 10 }}>Lodge {lodgeLabel(lodgeId)}</div>
            <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 100px 120px", padding: "10px 18px", background: C.bg, fontSize: 12, color: C.light, borderBottom: `1px solid ${C.border}` }}>
                <div>Naam</div><div>Van</div><div>Tot</div><div>Per nacht</div><div></div>
              </div>
              {byLodge(lodgeId).length === 0 && (
                <div style={{ padding: 20, fontSize: 13, color: C.light, textAlign: "center" }}>Nog geen tarieven ingesteld</div>
              )}
              {byLodge(lodgeId).map(p => (
                <div key={p.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 100px 120px", padding: "12px 18px", fontSize: 13, borderBottom: `1px solid ${C.border}`, alignItems: "center" }}>
                  <div style={{ color: C.text, fontWeight: 500 }}>{p.label}</div>
                  <div style={{ color: C.muted }}>{p.start_date}</div>
                  <div style={{ color: C.muted }}>{p.end_date}</div>
                  <div style={{ color: C.text, fontWeight: 500 }}>€ {Number(p.price_per_night).toFixed(2)}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => startEdit(p)} style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.card, fontSize: 11, color: C.muted, cursor: "pointer" }}>Bewerk</button>
                    <button onClick={() => deletePeriod(p.id)} style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.card, fontSize: 11, color: "#E24B4A", cursor: "pointer" }}>×</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </>
  );
}

/* ═══ AANVRAGEN TAB ═══ */
function AanvragenTab({ aanvragen, setAanvragen }: { aanvragen: Aanvraag[]; setAanvragen: (a: Aanvraag[]) => void }) {
  const C = { bg: "#F5F3EE", card: "#fff", border: "#E8E4DC", text: "#2A2418", muted: "#8A7D6A", light: "#B4AFA5", green: "#2F4F3E", gold: "#B49A5E" };
  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    border: `1px solid ${C.border}`, background: C.card,
    fontSize: 13, color: C.text, outline: "none", boxSizing: "border-box",
  };

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [forms, setForms] = useState<Record<string, { verblijf: string; belasting: string; schoonmaak: string; bericht: string }>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, { ok: boolean; msg: string }>>({});

  const getForm = (id: string, a: Aanvraag) => {
    if (forms[id]) return forms[id];
    const nights = a.van && a.tot ? Math.round((new Date(a.tot).getTime() - new Date(a.van).getTime()) / 86400000) : 0;
    return { verblijf: nights > 0 ? String(nights * 195) : "", belasting: String((a.personen || 2) * nights * 2.5), schoonmaak: "75", bericht: "" };
  };

  const updateForm = (id: string, a: Aanvraag, field: string, value: string) => {
    setForms(prev => ({ ...prev, [id]: { ...getForm(id, a), [field]: value } }));
  };

  const sendOfferte = async (a: Aanvraag) => {
    const f = getForm(a.id, a);
    if (!f.verblijf) return;
    setSaving(a.id);
    setResult(prev => ({ ...prev, [a.id]: { ok: false, msg: "" } }));
    try {
      const r = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_offerte", id: a.id, prijsVerblijf: f.verblijf, toeristenbelasting: f.belasting, schoonmaak: f.schoonmaak, bericht: f.bericht }),
      });
      const d = await r.json();
      if (d.success) {
        setAanvragen(aanvragen.map(x => x.id === a.id ? { ...x, status: "offerte_verstuurd", offerte_bedrag: parseFloat(d.totaal) } : x));
        setExpandedId(null);
        setResult(prev => ({ ...prev, [a.id]: { ok: true, msg: `Offerte € ${parseFloat(d.totaal).toFixed(2)} verstuurd` } }));
      } else {
        setResult(prev => ({ ...prev, [a.id]: { ok: false, msg: d.error || "Kon offerte niet versturen" } }));
      }
    } catch {
      setResult(prev => ({ ...prev, [a.id]: { ok: false, msg: "Verbindingsfout" } }));
    }
    setSaving(null);
  };

  const reject = async (id: string) => {
    if (!confirm("Aanvraag afwijzen?")) return;
    setSaving(id);
    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject_aanvraag", id }),
      });
      setAanvragen(aanvragen.map(x => x.id === id ? { ...x, status: "afgewezen" } : x));
    } catch {}
    setSaving(null);
  };

  const openAanvragen = aanvragen.filter(a => a.status === "nieuw" || a.status === "offerte_verstuurd");
  const closedAanvragen = aanvragen.filter(a => a.status !== "nieuw" && a.status !== "offerte_verstuurd");

  const nights = (a: Aanvraag) => {
    if (!a.van || !a.tot) return 0;
    return Math.round((new Date(a.tot).getTime() - new Date(a.van).getTime()) / 86400000);
  };

  const renderCard = (a: Aanvraag) => {
    const f = getForm(a.id, a);
    const verblijf = parseFloat(f.verblijf) || 0;
    const belasting = parseFloat(f.belasting) || 0;
    const schoonmaak = parseFloat(f.schoonmaak) || 0;
    const totaal = verblijf + belasting + schoonmaak;
    const isExpanded = expandedId === a.id;
    const isNew = a.status === "nieuw";
    const isOfferteSent = a.status === "offerte_verstuurd";
    const res = result[a.id];
    const n = nights(a);

    return (
      <div key={a.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
        {/* Header row */}
        <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: isNew ? "pointer" : "default" }}
          onClick={() => isNew && setExpandedId(isExpanded ? null : a.id)}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ fontWeight: 500, fontSize: 14, color: C.text }}>{a.guest?.naam || "Gast"}</span>
              <Badge status={a.status} />
              {a.guest?.email && <span style={{ fontSize: 11, color: C.light }}>{a.guest.email}</span>}
            </div>
            <div style={{ fontSize: 12, color: C.muted }}>
              {a.van} – {a.tot}
              {n > 0 && <span style={{ color: C.light }}> · {n} nacht{n !== 1 ? "en" : ""}</span>}
              <span style={{ marginLeft: 8 }}>{a.personen} {a.personen === 1 ? "persoon" : "personen"}</span>
              {a.bericht && <span style={{ marginLeft: 8, fontStyle: "italic" }}>&ldquo;{a.bericht.slice(0, 60)}{a.bericht.length > 60 ? "…" : ""}&rdquo;</span>}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {isOfferteSent && a.offerte_bedrag && (
              <span style={{ fontSize: 13, color: C.muted }}>Offerte € {Number(a.offerte_bedrag).toFixed(2)}</span>
            )}
            {res?.ok && <span style={{ fontSize: 12, color: "#2E7D32", fontWeight: 500 }}>✓ {res.msg}</span>}
            {isNew && (
              <span style={{ fontSize: 12, color: C.gold, fontWeight: 500 }}>{isExpanded ? "▲ Sluiten" : "▼ Offerte maken"}</span>
            )}
            {isOfferteSent && (
              <button onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : a.id); }} style={{
                padding: "5px 12px", borderRadius: 6, border: `1px solid ${C.border}`,
                background: C.bg, fontSize: 11, color: C.muted, cursor: "pointer",
              }}>Opnieuw versturen</button>
            )}
          </div>
        </div>

        {/* Expanded form */}
        {isExpanded && (isNew || isOfferteSent) && (
          <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${C.bg}` }}>
            <div style={{ paddingTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Verblijf (€)</label>
                <input value={f.verblijf} onChange={e => updateForm(a.id, a, "verblijf", e.target.value)} type="number" step="0.01" placeholder="bijv. 390" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Toeristenbelasting (€)</label>
                <input value={f.belasting} onChange={e => updateForm(a.id, a, "belasting", e.target.value)} type="number" step="0.01" placeholder="bijv. 10" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Eindschoonmaak (€)</label>
                <input value={f.schoonmaak} onChange={e => updateForm(a.id, a, "schoonmaak", e.target.value)} type="number" step="0.01" placeholder="75" style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Persoonlijk bericht (optioneel)</label>
              <input value={f.bericht} onChange={e => updateForm(a.id, a, "bericht", e.target.value)} placeholder="Welkom terug! We verheugen ons op jullie komst..." style={{ ...inputStyle }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: C.green }}>
                Totaal: € {totaal.toFixed(2)}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {res && !res.ok && res.msg && (
                  <span style={{ fontSize: 12, color: "#E24B4A", alignSelf: "center" }}>{res.msg}</span>
                )}
                <button onClick={() => reject(a.id)} disabled={saving === a.id} style={{
                  padding: "8px 16px", borderRadius: 8, border: `1px solid ${C.border}`,
                  background: C.card, fontSize: 12, color: "#E24B4A", cursor: saving === a.id ? "not-allowed" : "pointer",
                }}>Afwijzen</button>
                <button onClick={() => sendOfferte(a)} disabled={!f.verblijf || saving === a.id} style={{
                  padding: "8px 20px", borderRadius: 8, border: "none",
                  background: f.verblijf && saving !== a.id ? C.green : C.border,
                  fontSize: 12, fontWeight: 500, color: "#fff", cursor: f.verblijf && saving !== a.id ? "pointer" : "not-allowed",
                }}>{saving === a.id ? "Versturen..." : "Offerte versturen →"}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div style={{ fontSize: 20, fontWeight: 500, color: C.text, marginBottom: 4 }}>Terugkeer-aanvragen</div>
      <div style={{ fontSize: 13, color: C.light, marginBottom: 24 }}>
        {openAanvragen.length} open · {closedAanvragen.length} afgehandeld
      </div>

      {aanvragen.length === 0 && (
        <div style={{ fontSize: 13, color: C.light, padding: 20, textAlign: "center" }}>Nog geen aanvragen ontvangen</div>
      )}

      {openAanvragen.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          {openAanvragen.map(renderCard)}
        </div>
      )}

      {closedAanvragen.length > 0 && (
        <>
          <div style={{ fontSize: 13, fontWeight: 500, color: C.light, marginBottom: 10, textTransform: "uppercase", letterSpacing: .5 }}>Afgehandeld</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {closedAanvragen.map(a => (
              <div key={a.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", opacity: 0.6 }}>
                <div>
                  <span style={{ fontWeight: 500, fontSize: 13, color: C.text, marginRight: 10 }}>{a.guest?.naam || "Gast"}</span>
                  <span style={{ fontSize: 12, color: C.muted }}>{a.van} – {a.tot} · {a.personen}p</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {a.offerte_bedrag && <span style={{ fontSize: 12, color: C.muted }}>€ {Number(a.offerte_bedrag).toFixed(2)}</span>}
                  <Badge status={a.status} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}

/* ═══ VERBLIJVEN TAB ═══ */
function VerblijvenTab({ stays, setStays }: { stays: Stay[]; setStays: (s: Stay[]) => void }) {
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ naam: "", email: "", lodge: "lodge_1", check_in: "", check_out: "" });
  const [saving, setSaving] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);

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
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_late_checkout", id: stayId }),
      });
    } catch {}
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
                <option value="lodge_1">Lodge 1 — Boomhut</option>
                <option value="lodge_2">Lodge 2 — Schaapskooi</option>
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

      {stays.length === 0 ? (
        <div style={{ fontSize: 13, color: C.light, padding: 20, textAlign: "center" }}>Nog geen verblijven aangemaakt</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {stays.map(s => {
            const guest = s.guests;
            const sc = statusColor(s.status);
            const lodge = s.lodge === "lodge_1" ? "Boomhut" : "Schaapskooi";
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
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {!s.welcome_sent ? (
                    <button onClick={() => sendWelcome(s.id)} disabled={sendingId === s.id} style={{
                      padding: "6px 14px", borderRadius: 6, border: "none",
                      background: C.green, color: "#fff", fontSize: 12, fontWeight: 500,
                      cursor: sendingId === s.id ? "not-allowed" : "pointer",
                    }}>{sendingId === s.id ? "Versturen..." : "Welkomstmail"}</button>
                  ) : s.status === "vertrokken" ? (
                    <span style={{ fontSize: 12, color: "#2E7D32", fontWeight: 500 }}>✓ Afgerond</span>
                  ) : (
                    <>
                      <span style={{ fontSize: 11, color: "#2E7D32" }}>✓ Welkom</span>
                      <button onClick={() => sendLateCheckout(s.id)} disabled={sendingId === s.id} style={{
                        padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.gold}`,
                        background: C.card, color: C.gold, fontSize: 12, fontWeight: 500,
                        cursor: sendingId === s.id ? "not-allowed" : "pointer",
                      }}>{sendingId === s.id ? "Versturen..." : "Late check-out"}</button>
                      <button onClick={() => sendThankyou(s.id)} disabled={sendingId === s.id} style={{
                        padding: "6px 14px", borderRadius: 6, border: `1px solid ${C.border}`,
                        background: C.card, color: C.muted, fontSize: 12, fontWeight: 500,
                        cursor: sendingId === s.id ? "not-allowed" : "pointer",
                      }}>{sendingId === s.id ? "Versturen..." : "Bedankt-mail"}</button>
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
