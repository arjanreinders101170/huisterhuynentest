"use client";
import { useState } from "react";
import { T } from "@/data/tokens";

type Props = {
  open: boolean;
  onClose: () => void;
};

type Mode = "wakker" | "slapen";
type Scene = "warm" | "helder" | "dim" | "uit";

const SCENES: { id: Scene; label: string; color: string; border?: string }[] = [
  { id: "warm", label: "Warm", color: "linear-gradient(135deg,#F5C97E,#E8A84C)" },
  { id: "helder", label: "Helder", color: "linear-gradient(135deg,#FFF8E8,#F5EDD6)", border: "1px solid #E0D8C8" },
  { id: "dim", label: "Dim", color: "linear-gradient(135deg,#D4A56A,#8B6B3D)" },
  { id: "uit", label: "Uit", color: "#E0D8C8" },
];

export function LodgeControl({ open, onClose }: Props) {
  const [mode, setMode] = useState<Mode>("wakker");
  const [temp, setTemp] = useState(21);
  const [scene, setScene] = useState<Scene>("warm");

  // Demo charger state
  const chargerConnected = true;
  const chargerPercent = 65;

  const adjustTemp = (delta: number) => {
    setTemp(t => Math.max(16, Math.min(24, t + delta)));
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    if (m === "slapen") {
      setTemp(18);
      setScene("dim");
    } else {
      setTemp(21);
      setScene("warm");
    }
  };

  // Slider visual position (16-24 range)
  const sliderPercent = ((temp - 16) / 8) * 100;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(42,36,24,.5)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity .3s ease",
        }}
      />

      {/* Drawer */}
      <div style={{
        position: "fixed", top: 0, left: 0, bottom: 0,
        width: "min(340px, 85vw)", zIndex: 210,
        background: T.bg,
        transform: open ? "translateX(0)" : "translateX(-100%)",
        transition: "transform .3s cubic-bezier(.32,.72,0,1)",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 700, color: T.text }}>Mijn lodge</div>
            <div style={{ fontFamily: T.sans, fontSize: 12, color: T.muted, fontWeight: 300, marginTop: 2 }}>Boutique Lodge · Zeijen</div>
          </div>
          <button onClick={onClose} style={{
            width: 36, height: 36, borderRadius: 10,
            border: `1px solid ${T.border}`, background: T.card,
            fontSize: 18, color: T.muted, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>×</button>
        </div>

        <div style={{ padding: "20px" }}>

          {/* ═══ MODE ═══ */}
          <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
            <button onClick={() => switchMode("wakker")} style={{
              flex: 1, padding: "14px 0", borderRadius: 14, border: "none",
              background: mode === "wakker" ? `linear-gradient(135deg,${T.green},${T.green2})` : T.card,
              color: mode === "wakker" ? "#fff" : T.muted,
              fontFamily: T.sans, fontSize: 14, cursor: "pointer",
              borderWidth: mode === "wakker" ? 0 : 1, borderStyle: "solid", borderColor: T.border,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" style={{ display: "block", margin: "0 auto 6px" }}>
                <circle cx="12" cy="12" r="4.5"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/>
              </svg>
              Wakker
            </button>
            <button onClick={() => switchMode("slapen")} style={{
              flex: 1, padding: "14px 0", borderRadius: 14, border: "none",
              background: mode === "slapen" ? `linear-gradient(135deg,${T.green},${T.green2})` : T.card,
              color: mode === "slapen" ? "#fff" : T.muted,
              fontFamily: T.sans, fontSize: 14, cursor: "pointer",
              borderWidth: mode === "slapen" ? 0 : 1, borderStyle: "solid", borderColor: T.border,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" style={{ display: "block", margin: "0 auto 6px" }}>
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
              Slapen
            </button>
          </div>

          {/* ═══ TEMPERATURE ═══ */}
          <div style={{
            background: T.card, borderRadius: 16,
            border: `1px solid ${T.border}`, padding: "22px 20px", marginBottom: 16,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <div style={{ fontFamily: T.serif, fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 2 }}>Temperatuur</div>
                <div style={{ fontFamily: T.sans, fontSize: 12, color: T.muted, fontWeight: 300 }}>Nu 19.5°C in de lodge</div>
              </div>
              <div style={{ fontFamily: T.serif, fontSize: 36, fontWeight: 700, color: T.green, lineHeight: 1 }}>{temp}°</div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => adjustTemp(-1)} style={{
                width: 44, height: 44, borderRadius: 12,
                border: `1px solid ${T.border}`, background: T.card,
                fontSize: 20, color: T.text, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                WebkitTapHighlightColor: "transparent",
              }}>−</button>

              <div style={{ flex: 1, height: 4, background: T.border, borderRadius: 2, position: "relative" }}>
                <div style={{ position: "absolute", left: 0, top: 0, width: `${sliderPercent}%`, height: "100%", background: T.green, borderRadius: 2 }} />
                <div style={{
                  position: "absolute", left: `${sliderPercent}%`, top: -6,
                  width: 16, height: 16, background: T.green, borderRadius: "50%",
                  transform: "translateX(-50%)", border: `3px solid ${T.card}`,
                  boxShadow: "0 1px 4px rgba(0,0,0,.1)",
                }} />
              </div>

              <button onClick={() => adjustTemp(1)} style={{
                width: 44, height: 44, borderRadius: 12,
                border: "none", background: T.green,
                fontSize: 20, color: "#fff", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                WebkitTapHighlightColor: "transparent",
              }}>+</button>
            </div>
          </div>

          {/* ═══ LIGHTING ═══ */}
          <div style={{ fontFamily: T.serif, fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 10 }}>Sfeer</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
            {SCENES.map(s => (
              <button key={s.id} onClick={() => setScene(s.id)} style={{
                background: T.card, borderRadius: 14, padding: "14px 0",
                textAlign: "center", cursor: "pointer",
                border: scene === s.id ? `2px solid ${T.gold}` : `1px solid ${T.border}`,
                WebkitTapHighlightColor: "transparent",
              }}>
                <div style={{
                  width: 26, height: 26, margin: "0 auto 6px", borderRadius: "50%",
                  background: s.color, border: s.border || "none",
                }} />
                <div style={{
                  fontFamily: T.sans, fontSize: 11,
                  color: scene === s.id ? T.text : T.muted,
                  fontWeight: scene === s.id ? 500 : 300,
                }}>{s.label}</div>
              </button>
            ))}
          </div>

          {/* ═══ CHARGER ═══ */}
          {chargerConnected && (
            <>
              <div style={{ fontFamily: T.serif, fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 10 }}>Laadpaal</div>
              <div style={{
                background: T.card, borderRadius: 16,
                border: `1px solid ${T.border}`, padding: "16px 18px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.green }} />
                    <span style={{ fontFamily: T.sans, fontSize: 14, color: T.text }}>Auto laadt op</span>
                  </div>
                  <span style={{ fontFamily: T.sans, fontSize: 14, color: T.green, fontWeight: 500 }}>± 2 uur</span>
                </div>
                <div style={{ height: 6, background: T.border, borderRadius: 3 }}>
                  <div style={{ width: `${chargerPercent}%`, height: "100%", background: T.green, borderRadius: 3, transition: "width .3s" }} />
                </div>
                <div style={{ fontFamily: T.sans, fontSize: 12, color: T.muted, fontWeight: 300, marginTop: 8, textAlign: "center" }}>
                  {chargerPercent}% geladen
                </div>
              </div>
            </>
          )}

          {/* Demo notice */}
          <div style={{
            marginTop: 24, padding: "12px 16px", borderRadius: 10,
            background: "rgba(180,154,94,.08)",
            fontFamily: T.sans, fontSize: 11, color: T.gold, textAlign: "center",
          }}>
            Demo modus — wordt gekoppeld aan Home Assistant
          </div>

        </div>
      </div>
    </>
  );
}
