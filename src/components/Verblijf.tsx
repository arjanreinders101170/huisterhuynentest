"use client";
import { useState, useEffect } from "react";
import { T, cardStyle, iconBox, type Route, type DoorStatus } from "@/data/tokens";
import { IcLock, IcUnlock, IcKey, IcCopy, IcCheck, IcCar, IcInfo, IcClock, IcHeart, IcSquare, IcCheckSquare, IcWifi, IcPlug } from "./icons";
import { useLanguage } from "@/i18n";

type Props = {
  door: DoorStatus;
  onUnlock: () => void;
  wifiCopied: boolean;
  onCopyWifi: () => void;
  onNavigate: (r: Route) => void;
};

export function Verblijf({ door, onUnlock, wifiCopied, onCopyWifi, onNavigate }: Props) {
  const { t } = useLanguage();
  const CHECKLIST = t.verblijf.checklist;
  const [showCheckout, setShowCheckout] = useState(false);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [countdown, setCountdown] = useState("");
  const [showWifiQR, setShowWifiQR] = useState(false);

  /* ═══ COUNTDOWN to 11:00 ═══ */
  useEffect(() => {
    if (!showCheckout) return;

    const tick = () => {
      const now = new Date();
      const target = new Date();
      target.setHours(11, 0, 0, 0);

      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdown(t.verblijf.checkoutTime + "!");
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setCountdown(`${h}h ${m}m`);
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
        <h1 style={{ fontFamily: T.serif, fontSize: 28, fontWeight: 700, color: T.text, margin: "0 0 6px" }}>{t.verblijf.title}</h1>
        <p style={{ fontFamily: T.sans, fontSize: 14, color: T.muted, fontWeight: 300, margin: 0 }}>{t.verblijf.subtitle}</p>
      </div>

      {/* Lodge control hint */}
      <div style={{
        marginTop: 16, padding: "12px 16px", borderRadius: 12,
        background: "rgba(180,154,94,.08)", border: `1px solid rgba(180,154,94,.15)`,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{ fontSize: 15 }}>☰</span>
        <span style={{ fontFamily: T.sans, fontSize: 12, color: T.gold, fontWeight: 400, lineHeight: 1.4 }}>
          {t.verblijf.lodgeHint}
        </span>
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
          {door === "open" ? t.verblijf.doorOpen : door === "opening" ? t.verblijf.doorOpening : door === "error" ? t.verblijf.doorError : t.verblijf.doorLocked}
        </div>
        <div style={{ fontFamily: T.sans, fontSize: 13, color: T.muted, fontWeight: 300, marginBottom: 20 }}>
          {door === "open" ? t.verblijf.doorSubOpen : door === "opening" ? t.verblijf.doorSubOpening : door === "error" ? t.verblijf.doorSubError : t.verblijf.doorSubLocked}
        </div>
        {door !== "open" && (
          <button onClick={onUnlock} disabled={door === "opening"} style={{
            width: "100%", padding: 14, borderRadius: 14, border: "none", background: T.green, color: "#fff",
            fontFamily: T.sans, fontSize: 15, fontWeight: 500,
            cursor: door === "opening" ? "not-allowed" : "pointer",
            opacity: door === "opening" ? 0.7 : 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <IcKey /> {door === "opening" ? t.verblijf.opening : t.verblijf.openDoor}
          </button>
        )}
        {door === "open" && (
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button onClick={() => onNavigate("home")} style={{ flex: 1, padding: 12, borderRadius: 12, border: `1px solid ${T.border}`, background: T.card, fontFamily: T.sans, fontSize: 13, color: T.text, cursor: "pointer" }}>{t.verblijf.exploreTips}</button>
            <button onClick={() => onNavigate("reserveren")} style={{ flex: 1, padding: 12, borderRadius: 12, border: "none", background: T.green, fontFamily: T.sans, fontSize: 13, color: "#fff", cursor: "pointer" }}>{t.verblijf.bookBreakfast}</button>
          </div>
        )}
      </div>
      <div style={{ fontFamily: T.sans, fontSize: 11, color: T.muted, textAlign: "center", marginTop: 12, fontWeight: 300 }}>
        {t.verblijf.accessCode} <strong style={{ color: T.text }}>4821</strong>
      </div>

      {/* Wifi */}
      <h2 style={{ fontFamily: T.serif, fontSize: 18, fontWeight: 600, color: T.text, margin: "28px 0 14px" }}>{t.verblijf.wifi}</h2>
      <div style={{ ...cardStyle, padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: T.sans, fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 3 }}>{t.verblijf.network}</div>
          <div style={{ fontFamily: T.sans, fontSize: 15, fontWeight: 500, color: T.text }}>HuynenGast</div>
          <div style={{ fontFamily: T.sans, fontSize: 13, color: T.muted, fontWeight: 300, marginTop: 2 }}>HuynenGast2024</div>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button onClick={() => setShowWifiQR(true)} style={{
            padding: "10px 14px", borderRadius: 10, border: "none", background: T.green,
            fontFamily: T.sans, fontSize: 12, color: "#fff", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 5, fontWeight: 500,
          }}>
            <IcWifi /> {t.verblijf.qrLabel}
          </button>
          <button onClick={onCopyWifi} style={{
            padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.card,
            fontFamily: T.sans, fontSize: 12, color: T.text, cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
          }}>
            {wifiCopied ? <><IcCheck /> {t.verblijf.copied}</> : <><IcCopy /> {t.verblijf.copy}</>}
          </button>
        </div>
      </div>

      {/* Wifi QR Modal */}
      {showWifiQR && (
        <div onClick={() => setShowWifiQR(false)} style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(42,36,24,.6)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: T.card, borderRadius: 20,
            padding: "32px 28px", maxWidth: 320, width: "100%",
            textAlign: "center", boxShadow: "0 20px 60px rgba(47,79,62,.2)",
            animation: "fadeUp .3s ease",
          }}>
            <div style={{ color: T.green, marginBottom: 16 }}><IcWifi /></div>
            <div style={{ fontFamily: T.serif, fontSize: 20, fontWeight: 600, color: T.text, marginBottom: 6 }}>
              {t.verblijf.wifiConnect}
            </div>
            <p style={{ fontFamily: T.sans, fontSize: 13, color: T.muted, fontWeight: 300, marginBottom: 24, lineHeight: 1.5 }}>
              {t.verblijf.wifiScanHint}
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent("WIFI:T:WPA;S:HuynenGast;P:HuynenGast2024;;")}&size=200x200&color=2F4F3E&bgcolor=FDFBF6`}
              alt="Wifi QR code"
              width={180} height={180}
              style={{ borderRadius: 14, border: `1px solid ${T.border}`, margin: "0 auto 20px", display: "block" }}
            />
            <div style={{ background: "rgba(47,79,62,.04)", borderRadius: 12, padding: "14px 16px", textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontFamily: T.sans, fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: ".04em" }}>{t.verblijf.network}</span>
                <span style={{ fontFamily: T.sans, fontSize: 13, color: T.text, fontWeight: 500 }}>HuynenGast</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: T.sans, fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: ".04em" }}>{t.verblijf.password}</span>
                <span style={{ fontFamily: T.sans, fontSize: 13, color: T.text, fontWeight: 500 }}>HuynenGast2024</span>
              </div>
            </div>
            <button onClick={() => { navigator.clipboard?.writeText("HuynenGast2024"); setShowWifiQR(false); }} style={{
              marginTop: 16, width: "100%", padding: 14, borderRadius: 14,
              border: "none", background: T.green, color: "#fff",
              fontFamily: T.sans, fontSize: 15, fontWeight: 500, cursor: "pointer",
            }}>
              {t.verblijf.copyPassword}
            </button>
          </div>
        </div>
      )}

      {/* Practical */}
      <h2 style={{ fontFamily: T.serif, fontSize: 18, fontWeight: 600, color: T.text, margin: "28px 0 14px" }}>{t.verblijf.practical}</h2>
      {[
        { ic: <IcCar />, label: t.verblijf.parking, s: t.verblijf.parkingInfo },
        { ic: <IcPlug />, label: t.verblijf.charger, s: t.verblijf.chargerInfo },
        { ic: <IcInfo />, label: t.verblijf.houseRules, s: t.verblijf.houseRulesInfo },
      ].map((x, i) => (
        <div key={i} style={{ ...cardStyle, padding: "14px 16px", marginBottom: 10, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ ...iconBox, width: 40, height: 40, borderRadius: 10, color: T.green }}>{x.ic}</div>
          <div>
            <div style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 500, color: T.text }}>{x.label}</div>
            <div style={{ fontFamily: T.sans, fontSize: 12, color: T.muted, fontWeight: 300 }}>{x.s}</div>
          </div>
        </div>
      ))}

      {/* ═══════════════════════════════════
          CHECK-OUT SECTION
          ═══════════════════════════════════ */}
      <h2 style={{ fontFamily: T.serif, fontSize: 18, fontWeight: 600, color: T.text, margin: "28px 0 14px" }}>{t.verblijf.checkout}</h2>

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
              {t.verblijf.checkoutTime}
            </div>
            <div style={{ fontFamily: T.sans, fontSize: 12, color: T.muted, fontWeight: 300 }}>
              {t.verblijf.checkoutHint}
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
              {t.verblijf.checkoutLabel}
            </div>
            <div style={{ fontFamily: T.serif, fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
              {countdown || "11:00"}
            </div>
            <div style={{ fontFamily: T.sans, fontSize: 12, color: "rgba(255,255,255,.6)", fontWeight: 300 }}>
              {allDone ? t.verblijf.allDone : `${checked.size} ${t.verblijf.checkedOf} ${CHECKLIST.length} ${t.verblijf.ticked}`}
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
                  {t.verblijf.thankYou}
                </div>
                <p style={{ fontFamily: T.sans, fontSize: 13, color: T.muted, fontWeight: 300, lineHeight: 1.5, margin: "0 0 16px" }}>
                  {t.verblijf.reviewPrompt}
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
                  <IcHeart /> {t.verblijf.leaveReview}
                </button>
                <button
                  onClick={() => onNavigate("terugkomen")}
                  style={{
                    width: "100%", padding: 12, borderRadius: 14, marginTop: 8,
                    border: `1px solid ${T.border}`, background: T.card,
                    fontFamily: T.sans, fontSize: 13, color: T.text,
                    fontWeight: 300, cursor: "pointer",
                  }}
                >
                  {t.verblijf.planReturn}
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
              {t.verblijf.collapse}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
