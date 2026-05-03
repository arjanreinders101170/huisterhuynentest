"use client";
import type { RefObject } from "react";
import { T, cardStyle, type ChatMsg } from "@/data/tokens";
import { SheepSvg, IcSend } from "./icons";

type Props = {
  msgs: ChatMsg[];
  input: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  busy: boolean;
  endRef: RefObject<HTMLDivElement | null>;
};

export function Chat({ msgs, input, onInputChange, onSend, busy, endRef }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 68px)" }}>
      <div style={{ padding: "20px 20px 14px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <SheepSvg size={42} />
          <div>
            <div style={{ fontFamily: T.serif, fontSize: 17, fontWeight: 600, color: T.text }}>Huynen Host</div>
            <div style={{ fontFamily: T.sans, fontSize: 11, color: T.muted, fontWeight: 300 }}>Digitale conciërge · Online</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
          {["Wandeltips", "Restaurants", "Met kinderen", "Dit weer"].map(q => (
            <button key={q} onClick={() => onInputChange(q)} style={{
              background: T.card, border: `1px solid ${T.border}`, borderRadius: 20,
              padding: "5px 12px", fontFamily: T.sans, fontSize: 11, color: T.text, cursor: "pointer",
            }}>{q}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 8, alignItems: "flex-end" }}>
            {m.role === "assistant" && <SheepSvg size={28} />}
            <div style={{
              maxWidth: "75%", padding: "11px 15px", fontFamily: T.sans, fontSize: 13, lineHeight: 1.6, fontWeight: 300,
              background: m.role === "user" ? T.green : T.card, color: m.role === "user" ? "#fff" : T.text,
              borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              border: m.role === "assistant" ? `1px solid ${T.border}` : "none",
            }}>{m.text}</div>
          </div>
        ))}
        {busy && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <SheepSvg size={28} />
            <div style={{
              background: T.card, borderRadius: "16px 16px 16px 4px", border: `1px solid ${T.border}`,
              padding: "14px 18px", display: "flex", gap: 6,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.gold, animation: "dotPulse 1s 0s ease-in-out infinite" }} />
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.gold, animation: "dotPulse 1s 0.2s ease-in-out infinite" }} />
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.gold, animation: "dotPulse 1s 0.4s ease-in-out infinite" }} />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div style={{ padding: "12px 20px 24px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 10, alignItems: "center", background: T.bg }}>
        <input
          value={input}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={e => e.key === "Enter" && onSend()}
          placeholder="Stel je vraag..."
          style={{
            flex: 1, background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
            padding: "12px 16px", fontFamily: T.sans, fontSize: 14, outline: "none", color: T.text, fontWeight: 300,
          }}
        />
        <button onClick={onSend} disabled={busy} style={{
          width: 44, height: 44, borderRadius: 14, background: busy ? T.border : T.green,
          border: "none", color: "#fff", cursor: busy ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}><IcSend /></button>
      </div>
    </div>
  );
}
