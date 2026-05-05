"use client";
import { useState, useEffect } from "react";

type Booking = { id: string; product: string; prijs: number; status: string; created_at: string; guest_id: string; metadata: Record<string, unknown> };
type Guest = { id: string; naam: string; email: string; profiel: string; laatste_bezoek: string };
type Review = { id: string; naam: string; sterren: number; tekst: string; zichtbaar: boolean; created_at: string };
type Aanvraag = { id: string; van: string; tot: string; personen: number; status: string; offerte_bedrag: number | null; created_at: string; guest_id: string };
type Product = { id: string; naam: string; omschrijving: string | null; prijs: number; categorie: string; actief: boolean; volgorde: number };

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

type Tab = "dashboard" | "boekingen" | "gasten" | "reviews" | "aanvragen" | "producten";

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [aanvragen, setAanvragen] = useState<Aanvraag[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [guestMap, setGuestMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [bRes, gRes, rRes, aRes, pRes] = await Promise.all([
          fetch("/api/admin/data?table=bookings"),
          fetch("/api/admin/data?table=guests"),
          fetch("/api/admin/data?table=reviews"),
          fetch("/api/admin/data?table=aanvragen"),
          fetch("/api/admin/data?table=products"),
        ]);
        const [bData, gData, rData, aData, pData] = await Promise.all([bRes.json(), gRes.json(), rRes.json(), aRes.json(), pRes.json()]);
        setBookings(bData.data || []);
        setGuests(gData.data || []);
        setReviews(rData.data || []);
        setAanvragen(aData.data || []);
        setProducts(pData.data || []);

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
    { id: "boekingen", label: "Boekingen" },
    { id: "gasten", label: "Gasten" },
    { id: "reviews", label: "Reviews" },
    { id: "aanvragen", label: "Aanvragen" },
    { id: "producten", label: "Producten" },
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
          <div style={{ padding: "6px 14px", fontSize: 13, color: C.muted }}>
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#2E7D32", marginRight: 8 }}></span>Lodge 1
          </div>
          <div style={{ padding: "6px 14px", fontSize: 13, color: C.muted }}>
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "#2E7D32", marginRight: 8 }}></span>Lodge 2
          </div>
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
                </div>

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
                        guestMap[a.guest_id] || "Onbekend",
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
              <>
                <div style={{ fontSize: 20, fontWeight: 500, color: C.text, marginBottom: 4 }}>Terugkeer-aanvragen</div>
                <div style={{ fontSize: 13, color: C.light, marginBottom: 24 }}>Aanvragen van gasten die terug willen komen</div>
                <Table
                  cols={["Gast", "Periode", "Personen", "Status", "Offerte", "Datum"]}
                  widths={["2fr", "2fr", "80px", "1fr", "1fr", "1fr"]}
                  rows={aanvragen.map(a => [
                    guestMap[a.guest_id] || "Onbekend",
                    `${a.van} – ${a.tot}`,
                    String(a.personen),
                    <Badge key={a.id} status={a.status} />,
                    a.offerte_bedrag ? `€ ${a.offerte_bedrag.toFixed(2)}` : "—",
                    new Date(a.created_at).toLocaleDateString("nl-NL", { day: "numeric", month: "short" }),
                  ])}
                />
              </>
            )}

            {/* PRODUCTEN */}
            {tab === "producten" && (
              <ProductenTab products={products} setProducts={setProducts} />
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
  const [form, setForm] = useState({ id: "", naam: "", omschrijving: "", prijs: "", categorie: "upsell", volgorde: "0" });
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
    setForm({ id: p.id, naam: p.naam, omschrijving: p.omschrijving || "", prijs: String(p.prijs), categorie: p.categorie, volgorde: String(p.volgorde) });
  };

  const startCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm({ id: "", naam: "", omschrijving: "", prijs: "", categorie: "upsell", volgorde: "0" });
  };

  const save = async () => {
    if (!form.naam || !form.prijs) return;
    setSaving(true);
    try {
      const action = creating ? "create_product" : "update_product";
      const r = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...form, prijs: parseFloat(form.prijs) }),
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
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
        <div style={{ display: "grid", gridTemplateColumns: "80px 2fr 2fr 80px 80px 120px", padding: "10px 18px", background: C.bg, fontSize: 12, color: C.light, borderBottom: `1px solid ${C.border}` }}>
          <div>ID</div><div>Naam</div><div>Omschrijving</div><div>Prijs</div><div>Status</div><div></div>
        </div>
        {upsells.map(p => (
          <div key={p.id} style={{ display: "grid", gridTemplateColumns: "80px 2fr 2fr 80px 80px 120px", padding: "12px 18px", fontSize: 13, borderBottom: `1px solid ${C.border}`, alignItems: "center", opacity: p.actief ? 1 : 0.4 }}>
            <div style={{ color: C.muted, fontFamily: "monospace", fontSize: 12 }}>{p.id}</div>
            <div style={{ color: C.text, fontWeight: 500 }}>{p.naam}</div>
            <div style={{ color: C.muted }}>{p.omschrijving || "—"}</div>
            <div style={{ color: C.text, fontWeight: 500 }}>€ {p.prijs.toFixed(2)}</div>
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
        <div style={{ display: "grid", gridTemplateColumns: "100px 2fr 2fr 80px 80px 120px", padding: "10px 18px", background: C.bg, fontSize: 12, color: C.light, borderBottom: `1px solid ${C.border}` }}>
          <div>ID</div><div>Naam</div><div>Omschrijving</div><div>Dag</div><div>Status</div><div></div>
        </div>
        {fietsen.map(p => (
          <div key={p.id} style={{ display: "grid", gridTemplateColumns: "100px 2fr 2fr 80px 80px 120px", padding: "12px 18px", fontSize: 13, borderBottom: `1px solid ${C.border}`, alignItems: "center", opacity: p.actief ? 1 : 0.4 }}>
            <div style={{ color: C.muted, fontFamily: "monospace", fontSize: 12 }}>{p.id}</div>
            <div style={{ color: C.text, fontWeight: 500 }}>{p.naam}</div>
            <div style={{ color: C.muted }}>{p.omschrijving || "—"}</div>
            <div style={{ color: C.text, fontWeight: 500 }}>€ {p.prijs.toFixed(2)}</div>
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
