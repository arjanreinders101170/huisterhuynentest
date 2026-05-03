"use client";
import { T, cardStyle, iconBox, type Route, type DoorStatus } from "@/data/tokens";
import { IcLock, IcUnlock, IcKey, IcCopy, IcCheck, IcCar, IcInfo } from "./icons";

type Props = {
  door: DoorStatus;
  onUnlock: () => void;
  wifiCopied: boolean;
  onCopyWifi: () => void;
  onNavigate: (r: Route) => void;
};

export function Verblijf({ door, onUnlock, wifiCopied, onCopyWifi, onNavigate }: Props) {
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
    </div>
  );
}
