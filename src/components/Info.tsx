"use client";
import { T, cardStyle, type Route } from "@/data/tokens";
import { IcHeart } from "./icons";

export function Info({ onNavigate }: { onNavigate: (r: Route) => void }) {
  return (
    <div style={{ padding: "0 20px 110px" }}>
      <div style={{ paddingTop: 28 }}>
        <h1 style={{ fontFamily: T.serif, fontSize: 28, fontWeight: 700, color: T.text, margin: "0 0 6px" }}>Huis ter Huynen</h1>
        <p style={{ fontFamily: T.sans, fontSize: 14, color: T.muted, fontWeight: 300, margin: 0 }}>Boutique Lodge · Zeijen, Drenthe</p>
      </div>
      <h2 style={{ fontFamily: T.serif, fontSize: 18, fontWeight: 600, color: T.text, margin: "28px 0 14px" }}>Contact</h2>
      {[{ l: "Adres", v: "Zeijen, Drenthe" }, { l: "Telefoon", v: "+31 6 12 34 56 78" }, { l: "E-mail", v: "info@huisterhuynen.nl" }].map((x, i) => (
        <div key={i} style={{ padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontFamily: T.sans, fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 2 }}>{x.l}</div>
          <div style={{ fontFamily: T.sans, fontSize: 14, color: T.text }}>{x.v}</div>
        </div>
      ))}
      <h2 style={{ fontFamily: T.serif, fontSize: 18, fontWeight: 600, color: T.text, margin: "28px 0 14px" }}>Tijden</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[{ l: "Check-in", t: "15:00" }, { l: "Check-out", t: "11:00" }].map((x, i) => (
          <div key={i} style={{ ...cardStyle, padding: "14px 16px", textAlign: "center" }}>
            <div style={{ fontFamily: T.sans, fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: ".06em" }}>{x.l}</div>
            <div style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 600, color: T.green, marginTop: 4 }}>{x.t}</div>
          </div>
        ))}
      </div>
      <h2 style={{ fontFamily: T.serif, fontSize: 18, fontWeight: 600, color: T.text, margin: "28px 0 14px" }}>Huisregels</h2>
      <div style={{ ...cardStyle, padding: "16px 18px" }}>
        {["Niet roken in de lodge", "Huisdieren welkom (overleg vooraf)", "Rust na 22:00", "Afval gescheiden"].map((r, i) => (
          <div key={i} style={{ fontFamily: T.sans, fontSize: 13, color: T.text, fontWeight: 300, padding: "8px 0", display: "flex", alignItems: "center", gap: 8, borderBottom: i < 3 ? `1px solid ${T.border}` : "none" }}>
            <span style={{ color: T.green, fontSize: 10 }}>●</span> {r}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 28, textAlign: "center" }}>
        <div style={{ fontFamily: T.serif, fontSize: 18, fontWeight: 600, color: T.text, marginBottom: 4 }}>Hoe was je verblijf?</div>
        <div style={{ fontFamily: T.sans, fontSize: 13, color: T.muted, fontWeight: 300, marginBottom: 14 }}>We horen het graag</div>
        <button style={{ padding: "12px 28px", borderRadius: 12, border: "none", background: T.green, color: "#fff", fontFamily: T.sans, fontSize: 14, fontWeight: 500, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <IcHeart /> Review achterlaten
        </button>
      </div>
    </div>
  );
}
