"use client";
import { useState } from "react";

const LODGE_NAMES: Record<string, string> = { lodge_1: "Lodge 1 — De Heide", lodge_2: "Lodge 2 — De Eik" };

type Preset = { label: string; icon: string; temp: number; light: string; desc: string };
const PRESETS: Preset[] = [
  { label: "Gereed voor gast", icon: "🏡", temp: 21, light: "Warm", desc: "Verwarming 21°, licht warm" },
  { label: "Afwezig", icon: "🌙", temp: 15, light: "Uit", desc: "Verwarming 15°, alles uit" },
  { label: "Vorstbeveiliging", icon: "❄️", temp: 7, light: "Uit", desc: "Minimale verwarming" },
  { label: "Onderhoud", icon: "🔧", temp: 18, light: "Helder", desc: "Schoonmaak, automations uit" },
];

export function LodgeView({ lodgeId }: { lodgeId: string }) {
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
