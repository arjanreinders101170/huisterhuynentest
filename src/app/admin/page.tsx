"use client";
import { useState, useEffect } from "react";

type Booking = { id: string; product: string; prijs: number; status: string; created_at: string; guest_id: string; metadata: Record<string, unknown> };
type Guest = { id: string; naam: string; email: string; profiel: string; laatste_bezoek: string };
type Review = { id: string; naam: string; sterren: number; tekst: string; zichtbaar: boolean; created_at: string };
type Aanvraag = { id: string; van: string; tot: string; personen: number; status: string; offerte_bedrag: number | null; created_at: string; guest_id: string; bericht?: string; guest?: { naam: string; email: string } | null };
type Product = { id: string; naam: string; omschrijving: string | null; prijs: number; categorie: string; actief: boolean; volgorde: number; btw_percentage: number; grootboek_code: string };
type Stay = { id: string; guest_id: string; lodge: string; check_in: string; check_out: string; token: string; door_code: string; wifi_code: string; status: string; welcome_sent: boolean; guests?: { naam: string; email: string } };

const C = {
  bg: "#F7F8FA", card: "#fff", border: "#E5E7EB",
  text: "#111827", muted: "#6B7280", light: "#9CA3AF",
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

type Tab = "dashboard" | "boekingen" | "gasten" | "reviews" | "aanvragen" | "producten" | "verblijven" | "tarieven" | "financieel" | "lodge_1" | "lodge_2" | "housekeeping" | "lodge_1_iot" | "lodge_2_iot";

type NavItem = { id: Tab; label: string };
type NavGroup = { groupLabel: string; sub: NavItem[] };
type NavSection = { id: string; icon: string; label: string; direct?: Tab; items: (NavItem | NavGroup)[] };

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
  const [navSection, setNavSection] = useState<string | null>(null);

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

  const logout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {}
    window.location.href = "/admin/login";
  };

  const newBookings = bookings.filter(b => b.status === "nieuw").length;
  const openAanvragen = aanvragen.filter(a => a.status === "nieuw" || a.status === "offerte_verstuurd").length;
  const avgStars = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.sterren, 0) / reviews.length).toFixed(1) : "—";

  const font = "'Inter', system-ui, -apple-system, sans-serif";

  const navSections: NavSection[] = [
    { id: "dashboard", icon: "⌂", label: "Dashboard", direct: "dashboard", items: [] },
    { id: "reserveringen", icon: "📅", label: "Reserveringen", items: [
      { id: "boekingen", label: "Boekingen" },
      { id: "aanvragen", label: "Aanvragen" },
    ]},
    { id: "checkinout", icon: "🔑", label: "Check in / uit", items: [
      { id: "verblijven", label: "Verblijven" },
      { id: "gasten", label: "Gasten" },
    ]},
    { id: "housekeeping", icon: "🧹", label: "Housekeeping", items: [
      { id: "housekeeping", label: "Overzicht" },
    ]},
    { id: "communicatie", icon: "💬", label: "Gastencommunicatie", items: [
      { id: "reviews", label: "Reviews" },
    ]},
    { id: "pricing", icon: "📊", label: "Dynamic Pricing", items: [
      { id: "tarieven", label: "Tarieven" },
      { id: "producten", label: "Producten" },
      { id: "financieel", label: "Financieel" },
    ]},
    { id: "lodges", icon: "🏡", label: "Lodges", items: [
      { groupLabel: "Lodge 1 — De Heide", sub: [
        { id: "lodge_1", label: "Overzicht" },
        { id: "lodge_1_iot", label: "Bediening" },
      ]},
      { groupLabel: "Lodge 2 — De Eik", sub: [
        { id: "lodge_2", label: "Overzicht" },
        { id: "lodge_2_iot", label: "Bediening" },
      ]},
    ]},
  ];

  const activeNavSectionId = navSections.find(s =>
    s.direct === tab || s.items.some(item =>
      "id" in item ? item.id === tab : item.sub.some(sub => sub.id === tab)
    )
  )?.id;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", minHeight: "100vh", fontFamily: font }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      {/* Icon sidebar */}
      <div style={{ width: 64, background: C.green, display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0", flexShrink: 0, zIndex: 10 }}>
        <div style={{ marginBottom: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: 0.5, lineHeight: 1.2, textAlign: "center" }}>HTH</div>
        </div>
        <div style={{ width: 32, height: 1, background: "rgba(255,255,255,0.15)", marginBottom: 12 }} />
        {navSections.map(section => {
          const isActive = navSection === section.id || (section.direct && activeNavSectionId === section.id);
          return (
            <div key={section.id}
              onClick={() => {
                if (section.direct) {
                  setTab(section.direct);
                  setNavSection(null);
                } else {
                  setNavSection(navSection === section.id ? null : section.id);
                }
              }}
              title={section.label}
              style={{
                width: 44, height: 44, borderRadius: 10,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                cursor: "pointer", marginBottom: 2,
                background: isActive ? "rgba(255,255,255,0.18)" : "transparent",
                transition: "background 0.15s",
              }}
            >
              <span style={{ fontSize: 20, lineHeight: 1 }}>{section.icon}</span>
            </div>
          );
        })}
        <div style={{ flex: 1 }} />
        <div style={{ width: 32, height: 1, background: "rgba(255,255,255,0.15)", marginBottom: 12 }} />
        <div onClick={logout} title="Uitloggen"
          style={{ width: 44, height: 44, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18, color: "rgba(255,255,255,0.5)" }}
        >↩</div>
      </div>

      {/* Nav panel */}
      {navSection && (
        <div style={{ width: 240, background: "#FAFAFA", borderRight: `1px solid ${C.border}`, padding: "20px 0", flexShrink: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "0 20px 16px", fontWeight: 600, fontSize: 13, color: C.text, letterSpacing: 0.3 }}>
            {navSections.find(s => s.id === navSection)?.label}
          </div>
          <div style={{ flex: 1 }}>
            {navSections.find(s => s.id === navSection)?.items.map((item, idx) => {
              if ("groupLabel" in item) {
                return (
                  <div key={idx}>
                    <div style={{ padding: "8px 20px 4px", fontSize: 11, color: C.light, textTransform: "uppercase", letterSpacing: 0.8 }}>
                      {item.groupLabel}
                    </div>
                    {item.sub.map(sub => (
                      <div key={sub.id} onClick={() => setTab(sub.id)} style={{
                        padding: "8px 20px 8px 28px", cursor: "pointer", fontSize: 13,
                        color: tab === sub.id ? C.text : C.muted,
                        background: tab === sub.id ? C.bg : "transparent",
                        fontWeight: tab === sub.id ? 500 : 400,
                        borderRadius: "0 8px 8px 0", marginRight: 12,
                      }}>
                        {sub.id.endsWith("_iot") && <span style={{ marginRight: 6, fontSize: 11 }}>⚡</span>}
                        {sub.label}
                      </div>
                    ))}
                  </div>
                );
              }
              return (
                <div key={item.id} onClick={() => setTab(item.id)} style={{
                  padding: "9px 20px", cursor: "pointer", fontSize: 13,
                  color: tab === item.id ? C.text : C.muted,
                  background: tab === item.id ? C.bg : "transparent",
                  fontWeight: tab === item.id ? 500 : 400,
                  borderRadius: "0 8px 8px 0", marginRight: 12, marginBottom: 2,
                }}>
                  {item.label}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
        {loading ? (
          <div style={{ fontSize: 14, color: C.muted, padding: 40, textAlign: "center" }}>Laden...</div>
        ) : (
          <>
            {/* DASHBOARD */}
            {tab === "dashboard" && (
              <>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 600, color: C.text, letterSpacing: -0.3 }}>Overzicht</div>
                    <div style={{ fontSize: 13, color: C.light, marginTop: 3 }}>
                      {new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}
                    </div>
                  </div>
                  <span
                    onClick={sendFollowUps}
                    style={{ fontSize: 12, color: followUpSending ? C.light : C.muted, cursor: followUpSending ? "default" : "pointer", display: "flex", alignItems: "center", gap: 5, paddingTop: 4 }}
                  >
                    <span style={{ fontSize: 14, display: "inline-block", transform: followUpSending ? "rotate(180deg)" : "none", transition: "transform 0.5s" }}>↻</span>
                    {followUpSending ? "Versturen…" : "Follow-ups versturen"}
                  </span>
                </div>

                {followUpResult && (
                  <div style={{ padding: "10px 16px", borderRadius: 8, background: "#F0FDF4", border: "1px solid #BBF7D0", fontSize: 13, color: "#166534", marginBottom: 20 }}>
                    {followUpResult}
                  </div>
                )}

                {/* Stat cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 28 }}>
                  {[
                    { label: "Gasten", value: guests.length, sub: "totaal" },
                    { label: "Boekingen", value: newBookings, sub: "nieuw", accent: newBookings > 0 },
                    { label: "Aanvragen", value: openAanvragen, sub: "open", accent: openAanvragen > 0 },
                    { label: "Reviews", value: avgStars, sub: "gemiddeld" },
                  ].map((m, i) => (
                    <div key={i} style={{
                      background: C.card, borderRadius: 12, padding: "16px 20px",
                      border: `1px solid ${m.accent ? "#FED7AA" : C.border}`,
                    }}>
                      <div style={{ fontSize: 11, color: C.light, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>{m.label}</div>
                      <div style={{ fontSize: 26, fontWeight: 600, color: m.accent ? "#EA580C" : C.text, lineHeight: 1 }}>{m.value}</div>
                      <div style={{ fontSize: 11, color: C.light, marginTop: 4 }}>{m.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Tijdlijn */}
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 12, letterSpacing: -0.1 }}>Bezettingstijdlijn</div>
                <ReservationTimeline stays={stays} guests={guests} guestMap={guestMap} />

                {/* Recente boekingen */}
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 12, marginTop: 32, letterSpacing: -0.1 }}>Recente boekingen</div>
                <Table
                  cols={["Gast", "Product", "Bedrag", "Status", "Datum"]}
                  widths={["2fr", "2fr", "1fr", "1fr", "1fr"]}
                  rows={bookings.slice(0, 8).map(b => [
                    guestMap[b.guest_id] || "Onbekend",
                    b.product,
                    b.prijs ? `€ ${b.prijs.toFixed(2)}` : "—",
                    <Badge key={b.id} status={b.status} />,
                    timeAgo(b.created_at),
                  ])}
                />

                {aanvragen.length > 0 && (
                  <>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 12, marginTop: 28, letterSpacing: -0.1 }}>Terugkeer-aanvragen</div>
                    <Table
                      cols={["Gast", "Periode", "Personen", "Status", "Offerte"]}
                      widths={["2fr", "2fr", "1fr", "1fr", "1fr"]}
                      rows={aanvragen.slice(0, 8).map(a => [
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
              <GastenTab guests={guests} stays={stays} bookings={bookings} aanvragen={aanvragen} />
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

            {tab === "financieel" && <FinancieelTab bookings={bookings} aanvragen={aanvragen} stays={stays} />}

            {(tab === "lodge_1" || tab === "lodge_2") && (
              <LodgeView lodgeId={tab} />
            )}

            {/* HOUSEKEEPING */}
            {tab === "housekeeping" && (
              <>
                <div style={{ fontSize: 20, fontWeight: 500, color: C.text, marginBottom: 4 }}>Housekeeping</div>
                <div style={{ fontSize: 13, color: C.light, marginBottom: 32 }}>Schoonmaakplanning en status per lodge</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 640 }}>
                  {["Lodge 1 — De Heide", "Lodge 2 — De Eik"].map((name, i) => (
                    <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "24px 24px" }}>
                      <div style={{ fontWeight: 500, fontSize: 14, color: C.text, marginBottom: 12 }}>{name}</div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {["Kamers", "Badkamer", "Keuken", "Buiten"].map(area => (
                          <span key={area} style={{ background: C.bg, color: C.muted, fontSize: 12, padding: "4px 10px", borderRadius: 6 }}>{area}</span>
                        ))}
                      </div>
                      <div style={{ marginTop: 16, padding: "10px 14px", background: "#FFF3E0", borderRadius: 8, fontSize: 12, color: "#E67E22" }}>
                        Wordt in een volgende versie ingevuld
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* LODGE IoT */}
            {(tab === "lodge_1_iot" || tab === "lodge_2_iot") && (
              <LodgeView lodgeId={tab === "lodge_1_iot" ? "lodge_1" : "lodge_2"} />
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

/* ═══ RESERVATION TIMELINE ═══ */
function ReservationTimeline({ stays, guests, guestMap }: { stays: Stay[]; guests: Guest[]; guestMap: Record<string, string> }) {
  const DAYS = 21;
  const DAY_W = 54;
  const LEFT_W = 148;
  const ROW_H = 62;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const windowStart = new Date(today);
  windowStart.setDate(windowStart.getDate() - 3);

  const days = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(windowStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const toDay = (s: string) => { const d = new Date(s); d.setHours(0, 0, 0, 0); return d; };
  const dayOffset = (d: Date) => (d.getTime() - windowStart.getTime()) / 86400000;
  const todayOff = dayOffset(today);

  const lodges = [
    { id: "lodge_1", label: "Lodge 1", sub: "De Heide" },
    { id: "lodge_2", label: "Lodge 2", sub: "De Eik" },
  ];

  const barColor = (status: string) => {
    if (status === "actief") return "#10B981";
    if (status === "verwacht" || status === "bevestigd") return "#3B82F6";
    if (status === "uitgecheckt") return "#9CA3AF";
    return "#8B5CF6";
  };

  return (
    <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid #E5E7EB", background: "#fff" }}>
      <div style={{ minWidth: LEFT_W + DAYS * DAY_W }}>
        {/* Header */}
        <div style={{ display: "flex", borderBottom: "1px solid #E5E7EB" }}>
          <div style={{ width: LEFT_W, flexShrink: 0, padding: "10px 16px", fontSize: 11, color: "#9CA3AF", fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.6, background: "#FAFAFA", borderRight: "1px solid #E5E7EB" }}>
            Lodge
          </div>
          {days.map((d, i) => {
            const isToday = d.getTime() === today.getTime();
            const isWknd = d.getDay() === 0 || d.getDay() === 6;
            return (
              <div key={i} style={{
                width: DAY_W, flexShrink: 0, textAlign: "center", padding: "8px 0",
                background: isToday ? "#EFF6FF" : "#FAFAFA",
                borderLeft: "1px solid #F3F4F6",
              }}>
                <div style={{ fontSize: 10, color: isToday ? "#3B82F6" : "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.4 }}>
                  {d.toLocaleDateString("nl-NL", { weekday: "short" })}
                </div>
                <div style={{ fontSize: 13, fontWeight: isToday ? 700 : isWknd ? 500 : 400, color: isToday ? "#3B82F6" : isWknd ? "#374151" : "#6B7280", marginTop: 1 }}>
                  {d.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Lodge rows */}
        {lodges.map((lodge, ri) => {
          const lodgeStays = stays.filter(s => {
            const ci = toDay(s.check_in);
            const co = toDay(s.check_out);
            return s.lodge === lodge.id && co > windowStart && ci < days[DAYS - 1];
          });

          return (
            <div key={lodge.id} style={{ display: "flex", height: ROW_H, borderTop: ri > 0 ? "1px solid #E5E7EB" : "none" }}>
              {/* Label */}
              <div style={{
                width: LEFT_W, flexShrink: 0, display: "flex", flexDirection: "column",
                justifyContent: "center", padding: "0 16px",
                borderRight: "1px solid #E5E7EB", background: "#FAFAFA",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: lodgeStays.some(s => s.status === "actief") ? "#10B981" : "#D1D5DB", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{lodge.label}</span>
                </div>
                <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 3, marginLeft: 14 }}>{lodge.sub}</div>
              </div>

              {/* Timeline */}
              <div style={{ flex: 1, position: "relative", display: "flex", overflow: "hidden" }}>
                {days.map((d, i) => {
                  const isToday = d.getTime() === today.getTime();
                  const isWknd = d.getDay() === 0 || d.getDay() === 6;
                  return (
                    <div key={i} style={{
                      width: DAY_W, flexShrink: 0, height: "100%",
                      background: isToday ? "#EFF6FF" : isWknd ? "#F9FAFB" : "#fff",
                      borderLeft: "1px solid #F3F4F6",
                    }} />
                  );
                })}

                {/* Today line */}
                <div style={{
                  position: "absolute", left: todayOff * DAY_W + DAY_W / 2,
                  top: 0, bottom: 0, width: 2, background: "#3B82F6", opacity: 0.25, borderRadius: 1,
                }} />

                {/* Bars */}
                {lodgeStays.map(stay => {
                  const ci = toDay(stay.check_in);
                  const co = toDay(stay.check_out);
                  const s0 = Math.max(0, dayOffset(ci));
                  const e0 = Math.min(DAYS, dayOffset(co));
                  if (e0 <= 0 || s0 >= DAYS) return null;
                  const left = s0 * DAY_W + 4;
                  const width = Math.max((e0 - s0) * DAY_W - 8, 24);
                  const name = stay.guests?.naam || guestMap[stay.guest_id] || "Gast";
                  const color = barColor(stay.status);
                  const nights = Math.round(dayOffset(co) - dayOffset(ci));

                  return (
                    <div key={stay.id} title={`${name} · ${nights} nacht${nights !== 1 ? "en" : ""}`} style={{
                      position: "absolute", left, top: "50%", transform: "translateY(-50%)",
                      width, height: 36, background: "#fff",
                      border: "1px solid #E5E7EB", borderRadius: 7,
                      display: "flex", alignItems: "center", overflow: "hidden",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)", zIndex: 1, cursor: "default",
                    }}>
                      <div style={{ width: 3, alignSelf: "stretch", background: color, flexShrink: 0, borderRadius: "6px 0 0 6px" }} />
                      <span style={{ fontSize: 12, fontWeight: 500, color: "#374151", marginLeft: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>
                        {name}
                      </span>
                    </div>
                  );
                })}

                {lodgeStays.length === 0 && (
                  <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#D1D5DB" }}>
                    Geen verblijven gepland
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
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
const LODGE_NAMES: Record<string, string> = { lodge_1: "Lodge 1 — De Heide", lodge_2: "Lodge 2 — De Eik" };

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
type SurchargeConfig = { feestdag_nl: number; feestdag_de: number; vakantie_nl: number; vakantie_ni: number; vakantie_nw: number; tt_assen: number };
type PricingConfig = { lodge_id: string; base_price: number; surcharge_config: SurchargeConfig };
type AvailabilityDiscount = { id?: string; lodge_id: string; days_before: number; discount_pct: number };
type GenPeriod = { lodge_id: string; label: string; start_date: string; end_date: string; price_per_night: number; category: string };

const DEFAULT_SURCHARGES: SurchargeConfig = { feestdag_nl: 15, feestdag_de: 15, vakantie_nl: 25, vakantie_ni: 20, vakantie_nw: 20, tt_assen: 50 };
const SURCHARGE_LABELS: Record<keyof SurchargeConfig, string> = {
  feestdag_nl: "Feestdag NL",
  feestdag_de: "Feestdag DE",
  vakantie_nl: "Schoolvakantie NL (Noord/Drenthe)",
  vakantie_ni: "Schoolvakantie DE Niedersachsen",
  vakantie_nw: "Schoolvakantie DE NRW",
  tt_assen: "TT Assen / MotoGP",
};

function TarievenTab() {
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

  const CATEGORY_COLORS: Record<string, string> = { vakantie_nl: "#2196F3", vakantie_ni: "#9C27B0", vakantie_nw: "#673AB7", tt_assen: C.orange, feestdag_nl: "#4CAF50", feestdag_de: "#8BC34A" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 500, color: C.text }}>Dynamische Tarieven</div>
          <div style={{ fontSize: 13, color: C.light, marginTop: 2 }}>Basisprijs · opslagen · leegstandkorting · automatische sync</div>
        </div>
      </div>

      {/* SQL setup hint */}
      <div style={{ fontSize: 12, color: C.muted, background: C.bg, borderRadius: 8, padding: "10px 14px", lineHeight: 1.6 }}>
        <strong>Nieuwe tabellen nodig in Supabase:</strong>{" "}
        <code style={{ fontSize: 10 }}>CREATE TABLE pricing_config (lodge_id text PRIMARY KEY, base_price numeric(10,2) NOT NULL DEFAULT 150, surcharge_config jsonb NOT NULL DEFAULT &apos;{"{}"}&apos;, updated_at timestamptz DEFAULT now());</code>{" · "}
        <code style={{ fontSize: 10 }}>CREATE TABLE availability_discounts (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, lodge_id text NOT NULL, days_before int NOT NULL, discount_pct numeric(5,2) NOT NULL, created_at timestamptz DEFAULT now());</code>
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

/* ═══ GASTEN TAB ═══ */
function GastenTab({ guests, stays, bookings, aanvragen }: { guests: Guest[]; stays: Stay[]; bookings: Booking[]; aanvragen: Aanvraag[] }) {
  const C = { bg: "#F5F3EE", card: "#fff", border: "#E8E4DC", text: "#2A2418", muted: "#8A7D6A", light: "#B4AFA5", green: "#2F4F3E", gold: "#B49A5E" };
  const [selected, setSelected] = useState<Guest | null>(null);

  const guestStays = (id: string) => stays.filter(s => s.guest_id === id);
  const guestBookings = (id: string) => bookings.filter(b => b.guest_id === id && b.product !== "follow-up-email");
  const guestAanvragen = (id: string) => aanvragen.filter(a => a.guest_id === id);

  const totalSpend = (id: string) => {
    const verblijf = guestAanvragen(id).filter(a => a.status === "geboekt").reduce((s, a) => s + (a.offerte_bedrag || 0), 0);
    const upsell = guestBookings(id).filter(b => b.status === "betaald").reduce((s, b) => s + (b.prijs || 0), 0);
    return verblijf + upsell;
  };

  return (
    <div style={{ display: "flex", gap: 20, height: "100%" }}>
      {/* List */}
      <div style={{ flex: selected ? "0 0 340px" : "1" }}>
        <div style={{ fontSize: 20, fontWeight: 500, color: C.text, marginBottom: 4 }}>Gasten</div>
        <div style={{ fontSize: 13, color: C.light, marginBottom: 16 }}>{guests.length} geregistreerd</div>
        <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr", padding: "10px 18px", background: C.bg, fontSize: 12, color: C.light, borderBottom: `1px solid ${C.border}` }}>
            <div>Naam</div><div>E-mail</div><div>Verblijven</div><div>Besteed</div>
          </div>
          {guests.length === 0 && (
            <div style={{ padding: 20, fontSize: 13, color: C.light, textAlign: "center" }}>Geen gasten</div>
          )}
          {guests.map(g => {
            const spend = totalSpend(g.id);
            const nStays = guestStays(g.id).length;
            const isActive = selected?.id === g.id;
            return (
              <div key={g.id} onClick={() => setSelected(isActive ? null : g)} style={{
                display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr", padding: "12px 18px",
                fontSize: 13, borderBottom: `1px solid ${C.border}`, alignItems: "center",
                cursor: "pointer",
                background: isActive ? "rgba(47,79,62,.04)" : "transparent",
                borderLeft: isActive ? `3px solid ${C.green}` : "3px solid transparent",
              }}>
                <div style={{ color: C.text, fontWeight: 500 }}>{g.naam}</div>
                <div style={{ color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.email}</div>
                <div style={{ color: C.muted }}>{nStays || "—"}</div>
                <div style={{ color: spend > 0 ? C.green : C.light, fontWeight: spend > 0 ? 500 : 400 }}>
                  {spend > 0 ? `€ ${spend.toFixed(0)}` : "—"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 600, color: C.text }}>{selected.naam}</div>
                <a href={`mailto:${selected.email}`} style={{ fontSize: 13, color: C.gold, textDecoration: "none" }}>{selected.email}</a>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", fontSize: 18, color: C.light, cursor: "pointer", padding: 4 }}>×</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {[
                { label: "Verblijven", value: guestStays(selected.id).length },
                { label: "Aanvragen", value: guestAanvragen(selected.id).length },
                { label: "Totaal besteed", value: `€ ${totalSpend(selected.id).toFixed(0)}` },
              ].map(m => (
                <div key={m.label} style={{ background: C.bg, borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, color: C.light, marginBottom: 2 }}>{m.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: C.text }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stays */}
          {guestStays(selected.id).length > 0 && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 10 }}>Verblijven</div>
              {guestStays(selected.id).map(s => (
                <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.bg}`, fontSize: 12 }}>
                  <span style={{ color: C.text }}>{s.lodge === "lodge_1" ? "De Heide" : "De Eik"} · {new Date(s.check_in).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })} – {new Date(s.check_out).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}</span>
                  <span style={{ color: s.status === "actief" ? C.green : C.light }}>{s.status}</span>
                </div>
              ))}
            </div>
          )}

          {/* Aanvragen */}
          {guestAanvragen(selected.id).length > 0 && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 10 }}>Aanvragen</div>
              {guestAanvragen(selected.id).map(a => (
                <div key={a.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.bg}`, fontSize: 12 }}>
                  <span style={{ color: C.text }}>{a.van} – {a.tot} · {a.personen}p</span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {a.offerte_bedrag && <span style={{ color: C.muted }}>€ {Number(a.offerte_bedrag).toFixed(0)}</span>}
                    <Badge status={a.status} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upsell bookings */}
          {guestBookings(selected.id).length > 0 && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 10 }}>Bestellingen</div>
              {guestBookings(selected.id).map(b => (
                <div key={b.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.bg}`, fontSize: 12 }}>
                  <span style={{ color: C.text }}>{b.product}</span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ color: C.muted }}>€ {(b.prijs || 0).toFixed(2)}</span>
                    <Badge status={b.status} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {guestStays(selected.id).length === 0 && guestAanvragen(selected.id).length === 0 && guestBookings(selected.id).length === 0 && (
            <div style={{ fontSize: 13, color: C.light, textAlign: "center", padding: 20 }}>Nog geen activiteit gevonden</div>
          )}
        </div>
      )}
    </div>
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

/* ═══ FINANCIEEL TAB ═══ */
const MAANDEN = ["Jan","Feb","Mrt","Apr","Mei","Jun","Jul","Aug","Sep","Okt","Nov","Dec"];

function FinancieelTab({ bookings, aanvragen, stays }: { bookings: Booking[]; aanvragen: Aanvraag[]; stays: Stay[] }) {
  const C = { bg: "#F5F3EE", card: "#fff", border: "#E8E4DC", text: "#2A2418", muted: "#8A7D6A", light: "#B4AFA5", green: "#2F4F3E", gold: "#B49A5E" };

  const [jaar, setJaar] = useState(new Date().getFullYear());

  // Verblijfsomzet = geboekte aanvragen met offerte_bedrag
  const verblijfsBoekingen = aanvragen.filter(a => a.status === "geboekt" && a.offerte_bedrag);
  const totaalVerblijf = verblijfsBoekingen.reduce((s, a) => s + (a.offerte_bedrag || 0), 0);

  // Upsell omzet = betaalde bookings
  const betaaldeBookings = bookings.filter(b => b.status === "betaald" || b.status === "bevestigd");
  const totaalUpsell = betaaldeBookings.reduce((s, b) => s + (b.prijs || 0), 0);

  const totaalOmzet = totaalVerblijf + totaalUpsell;

  // Geboekte nachten via stays
  const geboekteStays = stays.filter(s => s.status !== "geannuleerd");
  const totaalNachten = geboekteStays.reduce((s, stay) => {
    if (!stay.check_in || !stay.check_out) return s;
    return s + Math.max(0, Math.round((new Date(stay.check_out).getTime() - new Date(stay.check_in).getTime()) / 86400000));
  }, 0);

  // Per maand (verblijf op basis van aanvraag created_at, upsell op booking created_at)
  type MaandData = { verblijf: number; upsell: number; boekingen: number };
  const perMaand: MaandData[] = Array.from({ length: 12 }, () => ({ verblijf: 0, upsell: 0, boekingen: 0 }));

  verblijfsBoekingen.forEach(a => {
    const d = new Date(a.created_at);
    if (d.getFullYear() === jaar) {
      perMaand[d.getMonth()].verblijf += a.offerte_bedrag || 0;
      perMaand[d.getMonth()].boekingen += 1;
    }
  });
  betaaldeBookings.forEach(b => {
    const d = new Date(b.created_at);
    if (d.getFullYear() === jaar) {
      perMaand[d.getMonth()].upsell += b.prijs || 0;
    }
  });

  const maxMaand = Math.max(...perMaand.map(m => m.verblijf + m.upsell), 1);

  // Per lodge (stays)
  const lodge1Stays = geboekteStays.filter(s => s.lodge === "lodge_1");
  const lodge2Stays = geboekteStays.filter(s => s.lodge === "lodge_2");
  const lodgeNachten = (list: Stay[]) => list.reduce((s, st) => {
    if (!st.check_in || !st.check_out) return s;
    return s + Math.max(0, Math.round((new Date(st.check_out).getTime() - new Date(st.check_in).getTime()) / 86400000));
  }, 0);

  // Conversie
  const totaalAanvragen = aanvragen.length;
  const offertesVerstuurd = aanvragen.filter(a => a.status !== "nieuw").length;
  const geboekt = aanvragen.filter(a => a.status === "geboekt").length;
  const convPct = totaalAanvragen > 0 ? Math.round((geboekt / totaalAanvragen) * 100) : 0;

  const cs: React.CSSProperties = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px" };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 500, color: C.text }}>Financieel overzicht</div>
          <div style={{ fontSize: 13, color: C.light, marginTop: 2 }}>Omzet, boekingen en conversie</div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button onClick={() => setJaar(j => j - 1)} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.border}`, background: C.card, fontSize: 14, color: C.muted, cursor: "pointer" }}>‹</button>
          <span style={{ fontSize: 14, fontWeight: 500, color: C.text, minWidth: 44, textAlign: "center" }}>{jaar}</span>
          <button onClick={() => setJaar(j => j + 1)} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.border}`, background: C.card, fontSize: 14, color: C.muted, cursor: "pointer" }}>›</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Totale omzet", value: `€ ${totaalOmzet.toFixed(2)}`, color: C.green, sub: "verblijf + upsells" },
          { label: "Verblijfsomzet", value: `€ ${totaalVerblijf.toFixed(2)}`, color: C.text, sub: `${verblijfsBoekingen.length} boekingen` },
          { label: "Upsell omzet", value: `€ ${totaalUpsell.toFixed(2)}`, color: C.gold, sub: `${betaaldeBookings.length} betalingen` },
          { label: "Geboekte nachten", value: String(totaalNachten), color: "#1565C0", sub: `${geboekteStays.length} verblijven` },
        ].map((k, i) => (
          <div key={i} style={{ background: C.bg, borderRadius: 10, padding: "16px 18px" }}>
            <div style={{ fontSize: 11, color: C.light, marginBottom: 4, textTransform: "uppercase", letterSpacing: .4 }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: k.color, marginBottom: 2 }}>{k.value}</div>
            <div style={{ fontSize: 11, color: C.light }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Maandoverzicht */}
      <div style={{ ...cs, marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 20 }}>Omzet per maand — {jaar}</div>

        {/* Bar chart */}
        <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 120, marginBottom: 8 }}>
          {perMaand.map((m, i) => {
            const totaal = m.verblijf + m.upsell;
            const verblijfH = maxMaand > 0 ? (m.verblijf / maxMaand) * 100 : 0;
            const upsellH = maxMaand > 0 ? (m.upsell / maxMaand) * 100 : 0;
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                {totaal > 0 && (
                  <div style={{ fontSize: 9, color: C.muted, marginBottom: 2 }}>€{Math.round(totaal)}</div>
                )}
                <div style={{ width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", height: 90, gap: 1 }}>
                  <div style={{ width: "100%", height: `${upsellH}%`, background: C.gold, borderRadius: "3px 3px 0 0", minHeight: upsellH > 0 ? 2 : 0 }} />
                  <div style={{ width: "100%", height: `${verblijfH}%`, background: C.green, borderRadius: upsellH > 0 ? 0 : "3px 3px 0 0", minHeight: verblijfH > 0 ? 2 : 0 }} />
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {MAANDEN.map((m, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center", fontSize: 10, color: C.light }}>{m}</div>
          ))}
        </div>

        {/* Legenda */}
        <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.muted }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: C.green }} /> Verblijf
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.muted }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: C.gold }} /> Upsells
          </div>
        </div>

        {/* Tabel */}
        <div style={{ marginTop: 20, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr 1fr 60px", padding: "8px 16px", background: C.bg, fontSize: 11, color: C.light, borderBottom: `1px solid ${C.border}` }}>
            <div>Maand</div><div>Verblijf</div><div>Upsells</div><div>Totaal</div><div>Boek.</div>
          </div>
          {perMaand.map((m, i) => {
            const totaal = m.verblijf + m.upsell;
            if (totaal === 0 && m.boekingen === 0) return null;
            return (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr 1fr 60px", padding: "10px 16px", fontSize: 12, borderBottom: `1px solid ${C.border}`, alignItems: "center" }}>
                <div style={{ color: C.text, fontWeight: 500 }}>{MAANDEN[i]}</div>
                <div style={{ color: C.muted }}>{m.verblijf > 0 ? `€ ${m.verblijf.toFixed(2)}` : "—"}</div>
                <div style={{ color: C.muted }}>{m.upsell > 0 ? `€ ${m.upsell.toFixed(2)}` : "—"}</div>
                <div style={{ color: C.text, fontWeight: 500 }}>{totaal > 0 ? `€ ${totaal.toFixed(2)}` : "—"}</div>
                <div style={{ color: C.muted }}>{m.boekingen || "—"}</div>
              </div>
            );
          })}
          {perMaand.every(m => m.verblijf + m.upsell === 0) && (
            <div style={{ padding: 16, fontSize: 12, color: C.light, textAlign: "center" }}>Nog geen omzet in {jaar}</div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        {/* Per lodge */}
        <div style={cs}>
          <div style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 16 }}>Per lodge</div>
          {[
            { naam: "Lodge De Heide", list: lodge1Stays },
            { naam: "Lodge De Eik", list: lodge2Stays },
          ].map(({ naam, list }) => {
            const n = lodgeNachten(list);
            const pct = totaalNachten > 0 ? (n / totaalNachten) * 100 : 0;
            return (
              <div key={naam} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.text, marginBottom: 6 }}>
                  <span style={{ fontWeight: 500 }}>{naam}</span>
                  <span style={{ color: C.muted }}>{list.length} verblijven · {n} nachten</span>
                </div>
                <div style={{ height: 6, background: C.bg, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: C.green, borderRadius: 3 }} />
                </div>
              </div>
            );
          })}
          {geboekteStays.length === 0 && <div style={{ fontSize: 12, color: C.light, textAlign: "center" }}>Nog geen verblijven</div>}
        </div>

        {/* Conversie */}
        <div style={cs}>
          <div style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 16 }}>Aanvraag-conversie</div>
          {[
            { label: "Aanvragen ontvangen", value: totaalAanvragen, color: C.muted },
            { label: "Offerte verstuurd", value: offertesVerstuurd, color: C.gold },
            { label: "Geboekt", value: geboekt, color: C.green },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: C.muted }}>{label}</span>
              <span style={{ fontSize: 18, fontWeight: 600, color }}>{value}</span>
            </div>
          ))}
          <div style={{ paddingTop: 12, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: C.muted }}>Conversie (aanvraag → geboekt)</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: convPct >= 50 ? C.green : convPct >= 25 ? C.gold : "#E24B4A" }}>
              {convPct}%
            </span>
          </div>
        </div>
      </div>

      {/* Recente betalingen */}
      {betaaldeBookings.length > 0 && (
        <div style={cs}>
          <div style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 16 }}>Recente upsell-betalingen</div>
          <Table
            cols={["Product", "Bedrag", "Status", "Datum"]}
            widths={["3fr", "1fr", "1fr", "1fr"]}
            rows={betaaldeBookings.slice(0, 10).map(b => [
              b.product,
              `€ ${(b.prijs || 0).toFixed(2)}`,
              <Badge key={b.id} status={b.status} />,
              new Date(b.created_at).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "2-digit" }),
            ])}
          />
        </div>
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
