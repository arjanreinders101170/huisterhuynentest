"use client";
import { useState, useEffect } from "react";
import { T, cardStyle, iconBox, type Route, type DoorStatus } from "@/data/tokens";
import { IcLock, IcUnlock, IcKey, IcCopy, IcCheck, IcCar, IcInfo, IcClock, IcHeart, IcSquare, IcCheckSquare } from "./icons";

type Props = {
  door: DoorStatus;
  onUnlock: () => void;
  wifiCopied: boolean;
  onCopyWifi: () => void;
  onNavigate: (r: Route) => void;
};

/* ═══ CHECKOUT CHECKLIST ═══ */
const CHECKLIST = [
  { id: "afwas", label: "Afwas gedaan of vaatwasser aan" },
  { id: "afval", label: "Afval gescheiden in de keuken" },
  { id: "ramen", label: "Ramen en deuren dicht" },
  { id: "verwarming", label: "Verwarming laag gezet" },
  { id: "spullen", label: "Persoonlijke spullen ingepakt" },
];

export function Verblijf({ door, onUnlock, wifiCopied, onCopyWifi, onNavigate }: Props) {
  const [showCheckout, setShowCheckout] = useState(false);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [countdown, setCountdown] = useState("");

  /* ═══ COUNTDOWN to 11:00 ═══ */
  useEffect(() => {
    if (!showCheckout) return;

    const tick = () => {
      const now = new Date();
      const target = new Date();
      target.setHours(11, 0, 0, 0);

      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdown("Check-out tijd!");
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setCountdown(`Nog ${h} uur en ${m} min`);
    };

    tick();
    const interval = setInterval(tick, 30000); // update every 30s
    return () => clearInterval(interval);
  }, [showCheckout]);

  const toggleCheck = (id: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allDone = checked.size === CHECKLIST.length;

  return (
    <div style={{ padding: "0 20px 110px" }}>
      <div style={{ paddingTop: 28 }}>
        <h1 style={{ fontFamily: T.serif, fontSize: 28, fontWeight: 700, color: T.text, margin: "0 0 6px" }}>Mijn verblijf</h1>
        <p style={{ fontFamily: T.sans, fontSize: 14, color: T.muted, fontWeight: 300, margin: 0 }}>Boomhut Lodge · Zeijen</p>
      </div>

      {/* Door */}
      <div style={{ ...cardStyle, padding: "24px 20px", marginTop: 24, textAlign: "center" }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%", background: "rgba(47,79,62,.06)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px", color: T.green,
          animation: door === "opening" ? "unlockPulse 1.5s infinite" : "none",
        }}>
          {door === "open" ? <IcUnlock /> : <IcLock />}
        </div>
        <div style={{ fontFamily: T.serif, fontSize: 18, fontWeight: 600, color: T.text, marginBottom: 4 }}>
          {door === "open" ? "Deur is open" : door === "opening" ? "Even geduld..." : door === "error" ? "Niet gelukt" : "Je lodge is klaar"}
        </div>
        <div style={{ fontFamily: T.sans, fontSize: 13, color: T.muted, fontWeight: 300, marginBottom: 20 }}>
          {door === "open" ? "Welkom! Veel plezier." : door === "opening" ? "Deur wordt geopend..." : door === "error" ? "Gebruik de toegangscode hieronder" : "Beschikbaar sinds 15:00"}
        </div>
        {door !== "open" && (
          <button onClick={onUnlock} disabled={door === "opening"} style={{
            width: "100%", padding: 14, borderRadius: 14, border: "none", background: T.green, color: "#fff",
            fontFamily: T.sans, fontSize: 15, fontWeight: 500,
            cursor: door === "opening" ? "not-allowed" : "pointer",
            opacity: door === "opening" ? 0.7 : 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <IcKey /> {door === "opening" ? "Openen..." : "Open deur"}
          </button>
        )}
        {door === "open" && (
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button onClick={() => onNavigate("home")} style={{ flex: 1, padding: 12, borderRadius: 12, border: `1px solid ${T.border}`, background: T.card, fontFamily: T.sans, fontSize: 13, color: T.text, cursor: "pointer" }}>Ontdek tips</button>
            <button onClick={() => onNavigate("reserveren")} style={{ flex: 1, padding: 12, borderRadius: 12, border: "none", background: T.green, fontFamily: T.sans, fontSize: 13, color: "#fff", cursor: "pointer" }}>Boek ontbijt</button>
          </div>
        )}
      </div>
      <div style={{ fontFamily: T.sans, fontSize: 11, color: T.muted, textAlign: "center", marginTop: 12, fontWeight: 300 }}>
        Werkt het niet? Toegangscode: <strong style={{ color: T.text }}>4821</strong>
      </div>

      {/* Wifi */}
      <h2 style={{ fontFamily: T.serif, fontSize: 18, fontWeight: 600, color: T.text, margin: "28px 0 14px" }}>Wifi</h2>
      <div style={{ ...cardStyle, padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: T.sans, fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 3 }}>Netwerk</div>
          <div style={{ fontFamily: T.sans, fontSize: 15, fontWeight: 500, color: T.text }}>HuynenGast</div>
          <div style={{ fontFamily: T.sans, fontSize: 13, color: T.muted, fontWeight: 300, marginTop: 2 }}>HuynenGast2024</div>
        </div>
        <button onClick={onCopyWifi} style={{
          padding: "10px 16px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.card,
          fontFamily: T.sans, fontSize: 12, color: T.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
        }}>
          {wifiCopied ? <><IcCheck /> Gekopieerd</> : <><IcCopy /> Kopieer</>}
        </button>
      </div>

      {/* Practical */}
      <h2 style={{ fontFamily: T.serif, fontSize: 18, fontWeight: 600, color: T.text, margin: "28px 0 14px" }}>Praktisch</h2>
      {[
        { ic: <IcCar />, t: "Parkeren", s: "Gratis op eigen terrein" },
        { ic: <IcInfo />, t: "Huisregels", s: "Niet roken · Huisdieren welkom · Rust na 22:00" },
      ].map((x, i) => (
        <div key={i} style={{ ...cardStyle, padding: "14px 16px", marginBottom: 10, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ ...iconBox, width: 40, height: 40, borderRadius: 10, color: T.green }}>{x.ic}</div>
          <div>
            <div style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 500, color: T.text }}>{x.t}</div>
            <div style={{ fontFamily: T.sans, fontSize: 12, color: T.muted, fontWeight: 300 }}>{x.s}</div>
          </div>
        </div>
      ))}

      {/* ═══════════════════════════════════
          CHECK-OUT SECTION
          ═══════════════════════════════════ */}
      <h2 style={{ fontFamily: T.serif, fontSize: 18, fontWeight: 600, color: T.text, margin: "28px 0 14px" }}>Vertrek</h2>

      {!showCheckout ? (
        /* Collapsed state — tap to expand */
        <div
          className="tile-tap"
          onClick={() => setShowCheckout(true)}
          style={{
            ...cardStyle,
            padding: "18px 20px",
            display: "flex", alignItems: "center", gap: 14,
            cursor: "pointer",
          }}
        >
          <div style={{ ...iconBox, width: 44, height: 44, borderRadius: 12, color: T.gold, background: "rgba(180,154,94,.1)" }}>
            <IcClock />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: T.serif, fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 2 }}>
              Check-out om 11:00
            </div>
            <div style={{ fontFamily: T.sans, fontSize: 12, color: T.muted, fontWeight: 300 }}>
              Tik hier voor je vertrekchecklist
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.gold} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.6 }}>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      ) : (
        /* Expanded state — countdown + checklist */
        <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
          {/* Countdown header */}
          <div style={{
            background: `linear-gradient(135deg, ${T.green} 0%, ${T.green2} 100%)`,
            padding: "20px 22px",
            textAlign: "center",
          }}>
            <div style={{ fontFamily: T.sans, fontSize: 11, color: "rgba(255,255,255,.5)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 6 }}>
              Check-out
            </div>
            <div style={{ fontFamily: T.serif, fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
              {countdown || "11:00"}
            </div>
            <div style={{ fontFamily: T.sans, fontSize: 12, color: "rgba(255,255,255,.6)", fontWeight: 300 }}>
              {allDone ? "Alles klaar — fijne reis!" : `${checked.size} van ${CHECKLIST.length} afgevinkt`}
            </div>
          </div>

          {/* Checklist */}
          <div style={{ padding: "16px 20px" }}>
            {CHECKLIST.map(item => {
              const done = checked.has(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "13px 0",
                    borderBottom: `1px solid ${T.border}`,
                    cursor: "pointer",
                    WebkitTapHighlightColor: "transparent",
                    transition: "opacity .15s",
                    opacity: done ? 0.5 : 1,
                  }}
                >
                  <span style={{ color: done ? T.green : T.muted, flexShrink: 0 }}>
                    {done ? <IcCheckSquare /> : <IcSquare />}
                  </span>
                  <span style={{
                    fontFamily: T.sans, fontSize: 14, color: T.text,
                    fontWeight: 300,
                    textDecoration: done ? "line-through" : "none",
                  }}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Review CTA — appears when all checked */}
          {allDone && (
            <div style={{
              padding: "0 20px 22px",
              textAlign: "center",
              animation: "fadeUp .4s ease both",
            }}>
              <div style={{
                background: "rgba(180,154,94,.08)",
                borderRadius: 14, padding: "20px 18px",
              }}>
                <div style={{ fontFamily: T.serif, fontSize: 17, fontWeight: 600, color: T.text, marginBottom: 6 }}>
                  Bedankt voor je verblijf!
                </div>
                <p style={{ fontFamily: T.sans, fontSize: 13, color: T.muted, fontWeight: 300, lineHeight: 1.5, margin: "0 0 16px" }}>
                  We hopen dat je genoten hebt. Wil je ons helpen met een korte review?
                </p>
                <button
                  onClick={() => onNavigate("info")}
                  style={{
                    width: "100%", padding: 14, borderRadius: 14,
                    border: "none", background: T.green, color: "#fff",
                    fontFamily: T.sans, fontSize: 15, fontWeight: 500,
                    cursor: "pointer", display: "flex", alignItems: "center",
                    justifyContent: "center", gap: 8,
                  }}
                >
                  <IcHeart /> Review achterlaten
                </button>
              </div>
            </div>
          )}

          {/* Collapse button */}
          <div style={{ padding: "0 20px 16px", textAlign: "center" }}>
            <button
              onClick={() => setShowCheckout(false)}
              style={{
                background: "none", border: "none",
                fontFamily: T.sans, fontSize: 12, color: T.muted,
                fontWeight: 300, cursor: "pointer",
              }}
            >
              Inklappen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
