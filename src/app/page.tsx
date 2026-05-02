"use client";
import { useState, useRef, useEffect } from "react";

/* ══════════════════════════════════════════════════════════════
   DESIGN TOKENS — hardcoded strings, no variables that can fail
   ══════════════════════════════════════════════════════════════ */
const BG = "#EAE3D2";
const CARD = "#FDFBF6";
const GREEN = "#2F4F3E";
const GREEN2 = "#3A6350";
const GOLD = "#B49A5E";
const TXT = "#2A2418";
const MUT = "#8A7D6A";
const BRD = "#E0D8C8";
const SERIF = "'Playfair Display', Georgia, serif";
const SANS = "'DM Sans', system-ui, sans-serif";

/* ══════════════════════════════════════════════════════════════
   INLINE SVG ICONS — no imports, no spread, no failure points
   ══════════════════════════════════════════════════════════════ */
function SheepSvg({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="40" fill={GREEN} />
      <ellipse cx="40" cy="49" rx="14" ry="11" fill="#EAE3D2" />
      <circle cx="31" cy="46" r="8" fill="#EAE3D2" />
      <circle cx="49" cy="46" r="8" fill="#EAE3D2" />
      <circle cx="40" cy="38" r="8" fill="#EAE3D2" />
      <circle cx="35" cy="41" r="5.5" fill="#F2EDE3" />
      <circle cx="45" cy="41" r="5.5" fill="#F2EDE3" />
      <ellipse cx="40" cy="30" rx="7" ry="6" fill="#D4CABB" />
      <ellipse cx="32.5" cy="29" rx="3" ry="2.3" fill="#D4CABB" />
      <ellipse cx="47.5" cy="29" rx="3" ry="2.3" fill="#D4CABB" />
      <circle cx="37.5" cy="29" r="1.4" fill={GREEN} />
      <circle cx="42.5" cy="29" r="1.4" fill={GREEN} />
      <ellipse cx="40" cy="32.5" rx="2" ry="1.1" fill="#B0A694" />
    </svg>
  );
}

function IconMenu() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="16" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></svg>; }
function IconCloud() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round"><path d="M18 10h1.26A2 2 0 0 1 22 12v0a2 2 0 0 1-2 2H7a5 5 0 1 1 .1-10A7 7 0 0 1 18 10z" /></svg>; }
function IconCal() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>; }
function IconArrow() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>; }
function IconChat() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>; }
function IconSend() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>; }
function IconHome() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>; }
function IconKey() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.78 7.78 5.5 5.5 0 0 1 7.78-7.78zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>; }
function IconHeart() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>; }
function IconCart() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>; }
function IconInfo() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>; }
function IconWifi() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><circle cx="12" cy="20" r="1" fill="currentColor" /></svg>; }
function IconCar() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-1L18 11l-2-6H8L6 11l-3.16.85a1 1 0 0 0-.84 1V16h3" /><circle cx="6.5" cy="16.5" r="2.5" /><circle cx="17.5" cy="16.5" r="2.5" /></svg>; }
function IconClock() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>; }
function IconLock() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>; }
function IconUnlock() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></svg>; }
function IconCopy() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>; }
function IconCheck() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>; }
function IconPin() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>; }
function IconLeaf() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 4 13C4 6 12 2 12 2s8 4 8 11a7 7 0 0 1-7 7z" /><path d="M12 20V10" /></svg>; }
function IconTrees() { return <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke={GREEN} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round"><path d="M16 4L8 14h4l-4 7h5v7h6v-7h5l-4-7h4z" /></svg>; }
function IconFork() { return <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke={GREEN} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round"><path d="M10 4v7c0 2 2 3 3 3v14M10 4c0 4 3 5 3 7M13 4c0 4-3 5-3 7" /><line x1="22" y1="4" x2="22" y2="28" /><path d="M19 4v5c0 2 3 3 3 3" /></svg>; }
function IconBike() { return <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke={GREEN} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="22" r="5" /><circle cx="24" cy="22" r="5" /><path d="M8 22l6-10h5" /><path d="M24 22l-5-10" /><path d="M14 12l5 10" /><path d="M19 12l2-3" /></svg>; }
function IconFamily() { return <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke={GREEN} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="8" r="3" /><circle cx="22" cy="8" r="3" /><path d="M5 22c0-4 2-6 5-6s5 2 5 6" /><path d="M17 22c0-4 2-6 5-6s5 2 5 6" /><circle cx="16" cy="14" r="2" /><path d="M13 26c0-3 1.5-4 3-4s3 1 3 4" /></svg>; }
function IconTemple() { return <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke={GREEN} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round"><path d="M16 4L6 10h20z" /><line x1="6" y1="10" x2="6" y2="26" /><line x1="12" y1="10" x2="12" y2="26" /><line x1="20" y1="10" x2="20" y2="26" /><line x1="26" y1="10" x2="26" y2="26" /><line x1="4" y1="26" x2="28" y2="26" /></svg>; }
function IconLotus() { return <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke={GREEN} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round"><path d="M16 24c0-6-5-11-10-13 2 6 5 11 10 13z" /><path d="M16 24c0-6 5-11 10-13-2 6-5 11-10 13z" /><path d="M16 22c0-4-2.5-8-6-10 1 5 2.5 8 6 10z" /><path d="M16 22c0-4 2.5-8 6-10-1 5-2.5 8-6 10z" /><line x1="16" y1="24" x2="16" y2="10" /></svg>; }

/* ══════════════════════════════════════════════════════════════
   MAIN APP
   ══════════════════════════════════════════════════════════════ */
type Msg = { role: "user" | "assistant"; text: string };

export default function Page() {
  const [page, setPage] = useState("home");
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", text: "Welkom! Ik ben de Huynen Host 🌿 Wat kan ik voor je doen?" },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [door, setDoor] = useState<"locked" | "opening" | "open">("locked");
  const [wifiCopied, setWifiCopied] = useState(false);
  const [booked, setBooked] = useState<string | null>(null);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy]);
  useEffect(() => { window.scrollTo(0, 0); }, [page]);

  const today = new Date().toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });

  const send = async () => {
    if (!input.trim() || busy) return;
    const q = input.trim();
    setInput("");
    setMsgs(p => [...p, { role: "user", text: q }]);
    setBusy(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...msgs.map(m => ({ role: m.role, content: m.text })), { role: "user", content: q }] }),
      });
      const d = await r.json();
      setMsgs(p => [...p, { role: "assistant", text: d.reply || "Even geen antwoord." }]);
    } catch { setMsgs(p => [...p, { role: "assistant", text: "Geen verbinding. Probeer straks opnieuw." }]); }
    setBusy(false);
  };

  const unlock = async () => {
    setDoor("opening");
    try {
      const r = await fetch("/api/nuki/unlock", { method: "POST" });
      const d = await r.json();
      setDoor(d.success ? "open" : "locked");
    } catch { setTimeout(() => setDoor("open"), 2000); }
  };

  /* ═══ STYLES ═══ */
  const card: React.CSSProperties = {
    background: CARD, borderRadius: 16, border: `1px solid ${BRD}`,
    boxShadow: "0 2px 12px rgba(47,79,62,.06)",
  };
  const icoBox: React.CSSProperties = {
    width: 44, height: 44, borderRadius: 12, background: "rgba(47,79,62,.06)",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  };

  /* ═══ HEADER ═══ */
  const header = (
    <header style={{ background: BG, position: "sticky", top: 0, zIndex: 50, padding: "14px 20px 0" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button style={{ background: "none", border: "none", color: TXT, cursor: "pointer" }}><IconMenu /></button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 600, color: "#52502E", letterSpacing: ".03em" }}>
            <span style={{ fontSize: 22 }}>H</span>UIS
            <span style={{ fontSize: 13, fontWeight: 400, margin: "0 3px", letterSpacing: ".1em" }}> TER </span>
            <span style={{ fontSize: 22 }}>H</span>UYNEN
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 2 }}>
            <div style={{ width: 24, height: 1, background: GOLD }} />
            <span style={{ fontFamily: SANS, fontSize: 8.5, fontWeight: 500, color: GOLD, letterSpacing: ".2em", textTransform: "uppercase" }}>Boutique Lodge</span>
            <div style={{ width: 24, height: 1, background: GOLD }} />
          </div>
        </div>
        <div style={{ width: 22 }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 8px", borderBottom: `1px solid ${BRD}` }}>
        <span style={{ fontFamily: SANS, fontSize: 12, color: MUT, display: "flex", alignItems: "center", gap: 5 }}><IconCloud /> 18°C</span>
        <span style={{ fontFamily: SANS, fontSize: 12, color: MUT, display: "flex", alignItems: "center", gap: 5 }}><IconCal /> {today.charAt(0).toUpperCase() + today.slice(1)}</span>
      </div>
    </header>
  );

  /* ═══ HOME ═══ */
  const cats = [
    { icon: <IconTrees />, t: "Natuur & Wandelen", s: "Ontdek de mooiste plekken" },
    { icon: <IconFork />, t: "Eten & Drinken", s: "Lekker eten in de omgeving" },
    { icon: <IconBike />, t: "Actief & Avontuur", s: "Fietsen, MTB, varen en meer" },
    { icon: <IconFamily />, t: "Met Kinderen", s: "Leuke uitjes voor jong & oud" },
    { icon: <IconTemple />, t: "Cultuur & Ontdekken", s: "Musea, dorpen en verhalen" },
    { icon: <IconLotus />, t: "Ontspanning & Luxe", s: "Wellness, sauna's en extra's" },
  ];

  const home = (
    <div style={{ padding: "0 20px 110px" }}>
      <div style={{ paddingTop: 32, paddingBottom: 8 }}>
        <h1 style={{ fontFamily: SERIF, fontSize: 36, fontWeight: 700, color: TXT, lineHeight: 1.1, margin: "0 0 10px" }}>Welkom</h1>
        <p style={{ fontFamily: SANS, fontSize: 15, color: MUT, fontWeight: 300, margin: 0 }}>Waar mogen we je vandaag mee inspireren?</p>
      </div>

      {/* Chatbot CTA */}
      <div onClick={() => setPage("chat")} style={{
        marginTop: 20, borderRadius: 16, padding: 20, display: "flex", alignItems: "center", gap: 16, cursor: "pointer",
        background: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN2} 100%)`, boxShadow: "0 8px 32px rgba(47,79,62,.2)",
      }}>
        <SheepSvg size={56} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: "#fff", marginBottom: 4 }}>Vraag het aan Huynen Host</div>
          <div style={{ fontFamily: SANS, fontSize: 12, color: "rgba(255,255,255,.6)", fontWeight: 300 }}>Ik help je graag op weg</div>
        </div>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
          <IconChat />
        </div>
      </div>

      {/* Tiles */}
      <h2 style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: TXT, margin: "28px 0 14px" }}>Ontdek</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {cats.map((c, i) => (
          <div key={i} style={{ ...card, padding: "18px 16px", cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={icoBox}>{c.icon}</div>
              <span style={{ color: MUT, opacity: 0.5 }}><IconArrow /></span>
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 600, color: TXT, marginBottom: 4, lineHeight: 1.25 }}>{c.t}</div>
            <div style={{ fontFamily: SANS, fontSize: 11, color: MUT, fontWeight: 300, lineHeight: 1.4 }}>{c.s}</div>
          </div>
        ))}
      </div>

      {/* Popular */}
      <h2 style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: TXT, margin: "28px 0 14px" }}>Populair vandaag</h2>
      <div style={{ ...card, padding: 16, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ ...icoBox, background: "rgba(180,154,94,.15)" }}><IconLeaf /></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: TXT, marginBottom: 3 }}>Wandeling Dwingelderveld</div>
          <div style={{ fontFamily: SANS, fontSize: 11, color: MUT, fontWeight: 300, display: "flex", alignItems: "center", gap: 4 }}><IconPin /> 10 min rijden · Heide in bloei</div>
        </div>
        <span style={{ color: GREEN }}><IconArrow /></span>
      </div>

      {/* Info bar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 24 }}>
        {[
          { ic: <IconWifi />, l: "Wifi", v: "HuynenGast" },
          { ic: <IconCar />, l: "Parkeren", v: "Gratis op terrein" },
          { ic: <IconClock />, l: "Check-in", v: "15:00" },
          { ic: <IconClock />, l: "Check-out", v: "11:00" },
        ].map((x, i) => (
          <div key={i} style={{ background: "rgba(47,79,62,.06)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: GREEN }}>{x.ic}</span>
            <div>
              <div style={{ fontFamily: SANS, fontSize: 10, color: MUT, textTransform: "uppercase", letterSpacing: ".04em" }}>{x.l}</div>
              <div style={{ fontFamily: SANS, fontSize: 13, color: TXT, fontWeight: 500 }}>{x.v}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  /* ═══ VERBLIJF ═══ */
  const verblijf = (
    <div style={{ padding: "0 20px 110px" }}>
      <div style={{ paddingTop: 28 }}>
        <h1 style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 700, color: TXT, margin: "0 0 6px" }}>Mijn verblijf</h1>
        <p style={{ fontFamily: SANS, fontSize: 14, color: MUT, fontWeight: 300, margin: 0 }}>Boomhut Lodge · Zeijen</p>
      </div>
      <div style={{ ...card, padding: "24px 20px", marginTop: 24, textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(47,79,62,.06)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: GREEN }}>
          {door === "open" ? <IconUnlock /> : <IconLock />}
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: TXT, marginBottom: 4 }}>
          {door === "open" ? "Deur is open" : door === "opening" ? "Even geduld..." : "Je lodge is klaar"}
        </div>
        <div style={{ fontFamily: SANS, fontSize: 13, color: MUT, fontWeight: 300, marginBottom: 20 }}>
          {door === "open" ? "Welkom! Veel plezier." : door === "opening" ? "Deur wordt geopend..." : "Beschikbaar sinds 15:00"}
        </div>
        {door !== "open" && (
          <button onClick={unlock} disabled={door === "opening"} style={{
            width: "100%", padding: 14, borderRadius: 14, border: "none", background: GREEN, color: "#fff",
            fontFamily: SANS, fontSize: 15, fontWeight: 500, cursor: door === "opening" ? "not-allowed" : "pointer",
            opacity: door === "opening" ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}><IconKey /> {door === "opening" ? "Openen..." : "Open deur"}</button>
        )}
        {door === "open" && (
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button onClick={() => setPage("home")} style={{ flex: 1, padding: 12, borderRadius: 12, border: `1px solid ${BRD}`, background: CARD, fontFamily: SANS, fontSize: 13, color: TXT, cursor: "pointer" }}>Ontdek tips</button>
            <button onClick={() => setPage("reserveren")} style={{ flex: 1, padding: 12, borderRadius: 12, border: "none", background: GREEN, fontFamily: SANS, fontSize: 13, color: "#fff", cursor: "pointer" }}>Boek ontbijt</button>
          </div>
        )}
      </div>
      <div style={{ fontFamily: SANS, fontSize: 11, color: MUT, textAlign: "center", marginTop: 12, fontWeight: 300 }}>
        Werkt het niet? Toegangscode: <strong style={{ color: TXT }}>4821</strong>
      </div>

      <h2 style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: TXT, margin: "28px 0 14px" }}>Wifi</h2>
      <div style={{ ...card, padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: SANS, fontSize: 11, color: MUT, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 3 }}>Netwerk</div>
          <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 500, color: TXT }}>HuynenGast</div>
          <div style={{ fontFamily: SANS, fontSize: 13, color: MUT, fontWeight: 300, marginTop: 2 }}>HuynenGast2024</div>
        </div>
        <button onClick={() => { navigator.clipboard?.writeText("HuynenGast2024"); setWifiCopied(true); setTimeout(() => setWifiCopied(false), 2000); }} style={{
          padding: "10px 16px", borderRadius: 10, border: `1px solid ${BRD}`, background: CARD,
          fontFamily: SANS, fontSize: 12, color: TXT, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
        }}>{wifiCopied ? <><IconCheck /> Gekopieerd</> : <><IconCopy /> Kopieer</>}</button>
      </div>

      <h2 style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: TXT, margin: "28px 0 14px" }}>Praktisch</h2>
      {[
        { ic: <IconCar />, t: "Parkeren", s: "Gratis op eigen terrein" },
        { ic: <IconInfo />, t: "Huisregels", s: "Niet roken · Huisdieren welkom · Rust na 22:00" },
      ].map((x, i) => (
        <div key={i} style={{ ...card, padding: "14px 16px", marginBottom: 10, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ ...icoBox, width: 40, height: 40, borderRadius: 10, color: GREEN }}>{x.ic}</div>
          <div>
            <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 500, color: TXT }}>{x.t}</div>
            <div style={{ fontFamily: SANS, fontSize: 12, color: MUT, fontWeight: 300 }}>{x.s}</div>
          </div>
        </div>
      ))}
    </div>
  );

  /* ═══ CHAT ═══ */
  const chat = (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 68px)" }}>
      <div style={{ padding: "20px 20px 14px", borderBottom: `1px solid ${BRD}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <SheepSvg size={42} />
          <div>
            <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 600, color: TXT }}>Huynen Host</div>
            <div style={{ fontFamily: SANS, fontSize: 11, color: MUT, fontWeight: 300 }}>Digitale conciërge · Online</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
          {["Wandeltips", "Restaurants", "Met kinderen", "Dit weer"].map(q => (
            <button key={q} onClick={() => setInput(q)} style={{
              background: CARD, border: `1px solid ${BRD}`, borderRadius: 20,
              padding: "5px 12px", fontFamily: SANS, fontSize: 11, color: TXT, cursor: "pointer",
            }}>{q}</button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 8, alignItems: "flex-end" }}>
            {m.role === "assistant" && <SheepSvg size={28} />}
            <div style={{
              maxWidth: "75%", padding: "11px 15px", fontFamily: SANS, fontSize: 13, lineHeight: 1.6, fontWeight: 300,
              background: m.role === "user" ? GREEN : CARD, color: m.role === "user" ? "#fff" : TXT,
              borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              border: m.role === "assistant" ? `1px solid ${BRD}` : "none",
            }}>{m.text}</div>
          </div>
        ))}
        {busy && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <SheepSvg size={28} />
            <div style={{ background: CARD, borderRadius: "16px 16px 16px 4px", border: `1px solid ${BRD}`, padding: "14px 18px", display: "flex", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: GOLD, opacity: 0.4 }} />
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: GOLD, opacity: 0.7 }} />
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: GOLD, opacity: 1 }} />
            </div>
          </div>
        )}
        <div ref={end} />
      </div>
      <div style={{ padding: "12px 20px 24px", borderTop: `1px solid ${BRD}`, display: "flex", gap: 10, alignItems: "center", background: BG }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Stel je vraag..."
          style={{ flex: 1, background: CARD, border: `1px solid ${BRD}`, borderRadius: 14, padding: "12px 16px", fontFamily: SANS, fontSize: 14, outline: "none", color: TXT, fontWeight: 300 }} />
        <button onClick={send} disabled={busy} style={{
          width: 44, height: 44, borderRadius: 14, background: busy ? BRD : GREEN, border: "none", color: "#fff",
          cursor: busy ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}><IconSend /></button>
      </div>
    </div>
  );

  /* ═══ RESERVEREN ═══ */
  const ups = [
    { t: "Fietsverhuur", s: "E-bikes voor een dag", p: "€ 12,50", ic: <IconBike /> },
    { t: "Wellness", s: "Sauna + massage", p: "€ 65,00", ic: <IconLotus /> },
    { t: "Ontbijt op bed", s: "Lokale producten", p: "€ 17,50", ic: <IconFork /> },
    { t: "Late check-out", s: "Uitslapen tot 13:00", p: "€ 25,00", ic: <IconClock /> },
  ];
  const reserveren = (
    <div style={{ padding: "0 20px 110px" }}>
      <div style={{ paddingTop: 28 }}>
        <h1 style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 700, color: TXT, margin: "0 0 6px" }}>Extra boeken</h1>
        <p style={{ fontFamily: SANS, fontSize: 14, color: MUT, fontWeight: 300, margin: 0 }}>Maak je verblijf nog mooier</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
        {ups.map((u, i) => (
          <div key={i} style={{ ...card, padding: 18, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ ...icoBox, width: 48, height: 48, borderRadius: 14, color: GREEN }}>{u.ic}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 600, color: TXT, marginBottom: 2 }}>{u.t}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: MUT, fontWeight: 300 }}>{u.s}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontFamily: SANS, fontSize: 16, fontWeight: 500, color: GREEN, marginBottom: 6 }}>{u.p}</div>
              <button onClick={() => setBooked(u.t)} style={{
                padding: "7px 14px", borderRadius: 10, fontFamily: SANS, fontSize: 12, cursor: "pointer", fontWeight: 500,
                background: booked === u.t ? GREEN : "transparent", color: booked === u.t ? "#fff" : GREEN,
                border: booked === u.t ? "none" : `1px solid ${GREEN}`,
              }}>{booked === u.t ? "✓ Geboekt" : "Boek"}</button>
            </div>
          </div>
        ))}
      </div>
      {booked && (
        <div style={{ marginTop: 20, padding: "14px 16px", borderRadius: 12, background: "rgba(47,79,62,.06)", border: "1px solid rgba(47,79,62,.15)", fontFamily: SANS, fontSize: 13, color: GREEN, display: "flex", alignItems: "center", gap: 8 }}>
          <IconCheck /> <strong>{booked}</strong> is geboekt.
        </div>
      )}
    </div>
  );

  /* ═══ INFO ═══ */
  const info = (
    <div style={{ padding: "0 20px 110px" }}>
      <div style={{ paddingTop: 28 }}>
        <h1 style={{ fontFamily: SERIF, fontSize: 28, fontWeight: 700, color: TXT, margin: "0 0 6px" }}>Huis ter Huynen</h1>
        <p style={{ fontFamily: SANS, fontSize: 14, color: MUT, fontWeight: 300, margin: 0 }}>Boutique Lodge · Zeijen, Drenthe</p>
      </div>
      <h2 style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: TXT, margin: "28px 0 14px" }}>Contact</h2>
      {[{ l: "Adres", v: "Zeijen, Drenthe" }, { l: "Telefoon", v: "+31 6 12 34 56 78" }, { l: "E-mail", v: "info@huisterhuynen.nl" }].map((x, i) => (
        <div key={i} style={{ padding: "12px 0", borderBottom: `1px solid ${BRD}` }}>
          <div style={{ fontFamily: SANS, fontSize: 11, color: MUT, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 2 }}>{x.l}</div>
          <div style={{ fontFamily: SANS, fontSize: 14, color: TXT }}>{x.v}</div>
        </div>
      ))}
      <h2 style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: TXT, margin: "28px 0 14px" }}>Tijden</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[{ l: "Check-in", t: "15:00" }, { l: "Check-out", t: "11:00" }].map((x, i) => (
          <div key={i} style={{ ...card, padding: "14px 16px", textAlign: "center" }}>
            <div style={{ fontFamily: SANS, fontSize: 10, color: MUT, textTransform: "uppercase", letterSpacing: ".06em" }}>{x.l}</div>
            <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 600, color: GREEN, marginTop: 4 }}>{x.t}</div>
          </div>
        ))}
      </div>
      <h2 style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: TXT, margin: "28px 0 14px" }}>Huisregels</h2>
      <div style={{ ...card, padding: "16px 18px" }}>
        {["Niet roken in de lodge", "Huisdieren welkom (overleg vooraf)", "Rust na 22:00", "Afval gescheiden"].map((r, i) => (
          <div key={i} style={{ fontFamily: SANS, fontSize: 13, color: TXT, fontWeight: 300, padding: "8px 0", display: "flex", alignItems: "center", gap: 8, borderBottom: i < 3 ? `1px solid ${BRD}` : "none" }}>
            <span style={{ color: GREEN, fontSize: 10 }}>●</span> {r}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 28, textAlign: "center" }}>
        <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 600, color: TXT, marginBottom: 4 }}>Hoe was je verblijf?</div>
        <div style={{ fontFamily: SANS, fontSize: 13, color: MUT, fontWeight: 300, marginBottom: 14 }}>We horen het graag</div>
        <button style={{ padding: "12px 28px", borderRadius: 12, border: "none", background: GREEN, color: "#fff", fontFamily: SANS, fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
          Review achterlaten
        </button>
      </div>
    </div>
  );

  /* ═══ NAV ═══ */
  const navData = [
    { ic: <IconHome />, l: "Home", p: "home" },
    { ic: <IconKey />, l: "Verblijf", p: "verblijf" },
    { ic: <IconChat />, l: "", p: "chat" },
    { ic: <IconCart />, l: "Boeken", p: "reserveren" },
    { ic: <IconInfo />, l: "Info", p: "info" },
  ];

  return (
    <>
      {header}
      {page === "home" && home}
      {page === "verblijf" && verblijf}
      {page === "chat" && chat}
      {page === "reserveren" && reserveren}
      {page === "info" && info}
      <nav style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430, background: CARD, borderTop: `1px solid ${BRD}`,
        display: "flex", justifyContent: "space-around", padding: "8px 0 20px", zIndex: 50,
      }}>
        {navData.map(n => {
          const a = page === n.p;
          const isC = n.p === "chat";
          return (
            <button key={n.p} onClick={() => setPage(n.p)} style={{
              background: isC ? (a ? GREEN : "rgba(47,79,62,.06)") : "none",
              border: "none", cursor: "pointer", display: "flex",
              flexDirection: isC ? "row" : "column", alignItems: "center", justifyContent: "center",
              gap: isC ? 0 : 3, padding: isC ? 0 : "2px 14px",
              width: isC ? 48 : "auto", height: isC ? 48 : "auto",
              borderRadius: isC ? 14 : 0, position: "relative",
              color: isC ? (a ? "#fff" : GREEN) : (a ? TXT : MUT),
              marginTop: isC ? -10 : 0,
              boxShadow: isC && a ? "0 4px 16px rgba(47,79,62,.25)" : "none",
              fontFamily: SANS,
            }}>
              {n.ic}
              {!isC && <span style={{ fontSize: 10, fontWeight: a ? 500 : 300 }}>{n.l}</span>}
              {a && !isC && <div style={{ position: "absolute", top: -1, width: 14, height: 2, borderRadius: 1, background: GOLD }} />}
            </button>
          );
        })}
      </nav>
    </>
  );
}
