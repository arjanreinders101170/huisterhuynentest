"use client";
import { useState, useEffect, useRef } from "react";
import { Booking, Guest, Review, Product, Stay, DiscountCode, BlogPost, LandingPageRow, BookingRequest, FeeTemplate } from "./types";
import { Badge, timeAgo } from "./components/Badge";
import { ReservationTimeline, Table } from "./components/ReservationTimeline";
import { LodgeView } from "./components/LodgeView";
import { ProductenTab } from "./components/ProductenTab";
import { TarievenTab } from "./components/TarievenTab";
import { GastenTab } from "./components/GastenTab";
import { FinancieelTab } from "./components/FinancieelTab";
import { VerblijvenTab } from "./components/VerblijvenTab";
import { ActiesTab } from "./components/ActiesTab";
import { BlogTab } from "./components/BlogTab";
import { LandingTab } from "./components/LandingTab";
import { AanvragenV2Tab } from "./components/AanvragenV2Tab";
import { ToeslagenTab } from "./components/ToeslagenTab";
import { MarketingTab } from "./components/MarketingTab";

const C = {
  bg: "#F7F8FA", card: "#fff", border: "#E5E7EB",
  text: "#111827", muted: "#6B7280", light: "#9CA3AF",
  green: "#2F4F3E", gold: "#B49A5E",
};

type Tab = "dashboard" | "boekingen" | "gasten" | "reviews" | "aanvragen_v2" | "producten" | "verblijven" | "tarieven" | "financieel" | "lodge_1" | "lodge_2" | "housekeeping" | "lodge_1_iot" | "lodge_2_iot" | "acties" | "blog" | "landingspaginas" | "toeslagen" | "marketing_dashboard";

type NavItem = { id: Tab; label: string };
type NavGroup = { groupLabel: string; sub: NavItem[] };
type NavSection = { id: string; icon: string; label: string; short: string; direct?: Tab; items: (NavItem | NavGroup)[] };

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stays, setStays] = useState<Stay[]>([]);
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [landingPages, setLandingPages] = useState<LandingPageRow[]>([]);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [feeTemplates, setFeeTemplates] = useState<FeeTemplate[]>([]);
  const [guestMap, setGuestMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [followUpSending, setFollowUpSending] = useState(false);
  const [followUpResult, setFollowUpResult] = useState("");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sluit dropdown automatisch zodra er een tab gekozen wordt
  useEffect(() => {
    setExpandedSection(null);
  }, [tab]);

  useEffect(() => {
    async function load() {
      try {
        const [bRes, gRes, rRes, pRes, sRes, dcRes, bpRes, brRes, ftRes] = await Promise.all([
          fetch("/api/admin/data?table=bookings"),
          fetch("/api/admin/data?table=guests"),
          fetch("/api/admin/data?table=reviews"),
          fetch("/api/admin/data?table=products"),
          fetch("/api/admin/data?table=stays"),
          fetch("/api/admin/data?table=discount_codes"),
          fetch("/api/admin/data?table=blog_posts"),
          fetch("/api/admin/data?table=booking_requests"),
          fetch("/api/admin/data?table=fee_templates"),
        ]);
        const [bData, gData, rData, pData, sData, dcData, bpData, brData, ftData] = await Promise.all([
          bRes.json(), gRes.json(), rRes.json(),
          pRes.json(), sRes.json(), dcRes.json(), bpRes.json(),
          brRes.json(), ftRes.json(),
        ]);
        setBookings(bData.data || []);
        setGuests(gData.data || []);
        setReviews(rData.data || []);
        setProducts(pData.data || []);
        setStays(sData.data || []);
        setDiscountCodes(dcData.data || []);
        setBlogPosts(bpData.data || []);
        setBookingRequests(brData.data || []);
        setFeeTemplates(ftData.data || []);

        // Build guest name map
        const map: Record<string, string> = {};
        (gData.data || []).forEach((g: Guest) => { map[g.id] = g.naam; });
        setGuestMap(map);
      } catch (e) { console.error("Load failed:", e); }
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    fetch("/api/admin/data?table=landing_pages")
      .then(r => r.json())
      .then(d => setLandingPages(d.data || []))
      .catch(() => {});
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
  const openAanvragen = bookingRequests.filter(r => r.status === "nieuw" || r.status === "in_behandeling" || r.status === "offerte_verstuurd").length;
  const avgStars = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.sterren, 0) / reviews.length).toFixed(1) : "—";

  const font = "'Inter', system-ui, -apple-system, sans-serif";

  const navSections: NavSection[] = [
    { id: "dashboard", icon: "⌂", label: "Dashboard", short: "Home", direct: "dashboard", items: [] },
    { id: "reserveringen", icon: "📅", label: "Reserveringen", short: "Reserveer.", items: [
      { id: "boekingen", label: "Boekingen" },
      { id: "aanvragen_v2", label: "Aanvragen" },
    ]},
    { id: "checkinout", icon: "🔑", label: "Check in / uit", short: "Check in", items: [
      { id: "verblijven", label: "Verblijven" },
      { id: "gasten", label: "Gasten" },
    ]},
    { id: "housekeeping", icon: "🧹", label: "Housekeeping", short: "Housekeep.", items: [
      { id: "housekeeping", label: "Overzicht" },
    ]},
    { id: "communicatie", icon: "💬", label: "Gastencommunicatie", short: "Gasten", items: [
      { id: "reviews", label: "Reviews" },
    ]},
    { id: "pricing", icon: "📊", label: "Dynamic Pricing", short: "Pricing", items: [
      { id: "tarieven", label: "Tarieven" },
      { id: "producten", label: "Producten" },
      { id: "toeslagen", label: "Toeslagen" },
      { id: "financieel", label: "Financieel" },
    ]},
    { id: "marketing", icon: "🎯", label: "Marketing", short: "Marketing", items: [
      { id: "marketing_dashboard", label: "Marketing Dashboard" },
      { id: "acties", label: "Promotiecodes" },
      { id: "blog", label: "Blog beheer" },
      { id: "landingspaginas", label: "Landingspagina's" },
    ]},
    { id: "lodges", icon: "🏡", label: "Lodges", short: "Lodges", items: [
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

  const cancelClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openSection = (sectionId: string) => {
    cancelClose();
    setExpandedSection(sectionId);
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimerRef.current = setTimeout(() => {
      setExpandedSection(null);
      closeTimerRef.current = null;
    }, 120);
  };

  const closeNow = () => {
    cancelClose();
    setExpandedSection(null);
  };

  const isSectionExpanded = (sectionId: string) => expandedSection === sectionId;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", flexDirection: "column", fontFamily: font, background: "#F0F1F3" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* Top nav */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", padding: "0 32px", height: 56, flexShrink: 0, position: "sticky", top: 0, zIndex: 50 }}>
        {/* Brand */}
        <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", letterSpacing: 0.1, marginRight: 40, whiteSpace: "nowrap" }}>
          Huis ter Huynen
        </div>

        {/* Nav items */}
        <div style={{ display: "flex", alignItems: "center", flex: 1, gap: 2 }}>
          {navSections.map(section => {
            const isSingleItem = !section.direct && section.items.length === 1 && "id" in section.items[0];
            const singleTarget = isSingleItem ? (section.items[0] as NavItem).id : undefined;
            const sectionActive = section.direct
              ? tab === section.direct
              : section.items.some(item =>
                  "id" in item ? item.id === tab : item.sub.some(sub => sub.id === tab)
                );
            const isDirectNav = !!section.direct || isSingleItem;
            const expanded = !isDirectNav && isSectionExpanded(section.id);

            const handleHeaderClick = () => {
              if (section.direct) {
                setTab(section.direct);
                closeNow();
              } else if (isSingleItem && singleTarget) {
                setTab(singleTarget);
                closeNow();
              } else {
                openSection(section.id);
              }
            };

            return (
              <div
                key={section.id}
                style={{ position: "relative" }}
                onMouseEnter={() => { if (!isDirectNav) openSection(section.id); }}
                onMouseLeave={() => { if (!isDirectNav) scheduleClose(); }}
              >
                <div onClick={handleHeaderClick} style={{
                  padding: "0 14px", height: 56, display: "flex", alignItems: "center", gap: 5,
                  fontSize: 14, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap",
                  color: sectionActive ? "#111827" : "#6B7280",
                  borderBottom: sectionActive ? "2px solid #111827" : "2px solid transparent",
                  userSelect: "none",
                }}>
                  {section.label}
                  {!isDirectNav && (
                    <span style={{
                      fontSize: 8, color: "#9CA3AF",
                      transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.15s ease",
                      display: "inline-block", marginTop: 1,
                    }}>▼</span>
                  )}
                </div>

                {/* Dropdown */}
                {expanded && (
                  <div style={{
                    position: "absolute", top: 56, left: 0,
                    background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.08)", minWidth: 180,
                    padding: "6px 0", zIndex: 100,
                  }}>
                    {section.items.map((item, idx) => {
                      if ("groupLabel" in item) {
                        return (
                          <div key={idx}>
                            <div style={{ padding: "8px 16px 4px", fontSize: 10, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.7 }}>
                              {item.groupLabel}
                            </div>
                            {item.sub.map(sub => (
                              <div key={sub.id} onClick={() => { setTab(sub.id); closeNow(); }} style={{
                                padding: "9px 16px 9px 24px", cursor: "pointer",
                                fontSize: 13, fontWeight: tab === sub.id ? 600 : 400,
                                color: tab === sub.id ? "#111827" : "#374151",
                                background: tab === sub.id ? "#F9FAFB" : "transparent",
                              }}>
                                {sub.id.endsWith("_iot") ? "⚡ " : ""}{sub.label}
                              </div>
                            ))}
                          </div>
                        );
                      }
                      return (
                        <div key={item.id} onClick={() => { setTab(item.id); closeNow(); }} style={{
                          padding: "9px 16px", cursor: "pointer",
                          fontSize: 13, fontWeight: tab === item.id ? 600 : 400,
                          color: tab === item.id ? "#111827" : "#374151",
                          background: tab === item.id ? "#F9FAFB" : "transparent",
                        }}>
                          {item.label}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Logout */}
        <div onClick={logout} style={{ fontSize: 13, fontWeight: 500, color: "#9CA3AF", cursor: "pointer", whiteSpace: "nowrap" }}>
          Uitloggen
        </div>
      </div>

      {/* Backdrop to close dropdown on outside click (touch / non-hover) */}
      {expandedSection !== null && (
        <div onClick={closeNow} style={{ position: "fixed", inset: 0, zIndex: 10 }} />
      )}

      {/* Content */}
      <div style={{ flex: 1, padding: "28px 32px", overflowY: "auto", background: "#F0F1F3", zIndex: 15 }}>
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
                <ReservationTimeline stays={stays} guests={guests} guestMap={guestMap} bookingRequests={bookingRequests} />

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

                {bookingRequests.length > 0 && (
                  <>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 12, marginTop: 28, letterSpacing: -0.1 }}>Aanvragen</div>
                    <Table
                      cols={["Gast", "Periode", "Personen", "Status", "Bedrag"]}
                      widths={["2fr", "2fr", "1fr", "1fr", "1fr"]}
                      rows={bookingRequests.slice(0, 8).map(r => {
                        const periode = r.check_in && r.check_out
                          ? `${new Date(r.check_in).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })} – ${new Date(r.check_out).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}`
                          : (r.periode_tekst || "—");
                        const bedrag = r.totaal ?? r.voorgestelde_prijs;
                        return [
                          r.guest?.naam || r.gast_naam || "Onbekend",
                          periode,
                          String(r.personen ?? "—"),
                          <Badge key={r.id} status={r.status} />,
                          bedrag != null ? `€ ${Number(bedrag).toFixed(2)}` : "—",
                        ];
                      })}
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
              <GastenTab guests={guests} stays={stays} bookings={bookings} bookingRequests={bookingRequests} />
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

            {tab === "aanvragen_v2" && (
              <AanvragenV2Tab requests={bookingRequests} setRequests={setBookingRequests} />
            )}

            {tab === "toeslagen" && (
              <ToeslagenTab templates={feeTemplates} setTemplates={setFeeTemplates} />
            )}

            {/* PRODUCTEN */}
            {tab === "verblijven" && (
              <VerblijvenTab stays={stays} setStays={setStays} />
            )}

            {tab === "producten" && (
              <ProductenTab products={products} setProducts={setProducts} />
            )}

            {tab === "tarieven" && <TarievenTab />}

            {tab === "financieel" && <FinancieelTab bookings={bookings} bookingRequests={bookingRequests} stays={stays} />}

            {tab === "acties" && (
              <ActiesTab codes={discountCodes} setCodes={setDiscountCodes} />
            )}

            {tab === "blog" && (
              <BlogTab posts={blogPosts} setPosts={setBlogPosts} />
            )}

            {tab === "landingspaginas" && (
              <LandingTab pages={landingPages} setPages={setLandingPages} />
            )}

            {tab === "marketing_dashboard" && <MarketingTab />}

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
