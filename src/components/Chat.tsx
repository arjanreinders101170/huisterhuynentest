"use client";
import type { RefObject } from "react";
import { T, type ChatMsg, type GuestProfile } from "@/data/tokens";
import { SheepSvg, IcSend } from "./icons";

const CHIPS: Record<string, string[]> = {
  stel: ["Romantisch dineren", "Rustige wandeling", "Wellness vandaag", "Wijn & borrel"],
  gezin: ["Wat bij regen?", "Kindvriendelijk eten", "Speeltuin dichtbij", "Dagje uit"],
  actief: ["Fietsroute vandaag", "Waar kan ik kanoën?", "MTB-trails", "Sportief eten"],
  rust: ["Stilste wandeling", "Sauna in de buurt", "Boek & koffie plek", "Niets-doen tips"],
  default: ["Wandeltips", "Restaurants", "Leuk uitje", "Dit weer"],
};

type Props = {
  msgs: ChatMsg[];
  input: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  busy: boolean;
  endRef: RefObject<HTMLDivElement | null>;
  profile?: GuestProfile;
};

export function Chat({ msgs, input, onInputChange, onSend, busy, endRef, profile }: Props) {
  const chips = (profile && CHIPS[profile]) ? CHIPS[profile] : CHIPS.default;
  /* Height: viewport minus header (68px) minus nav bar (72px) */
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "calc(100vh - 140px)",
      position: "relative",
    }}>
      {/* Chat header with avatar + quick chips */}
      <div style={{
        padding: "16px 20px 12px",
        borderBottom: `1px solid ${T.border}`,
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <SheepSvg size={42} />
          <div>
            <div style={{ fontFamily: T.serif, fontSize: 17, fontWeight: 600, color: T.text }}>
              Huynen Host
            </div>
            <div style={{ fontFamily: T.sans, fontSize: 11, color: T.muted, fontWeight: 300 }}>
              Digitale conciërge · Online
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
          {chips.map(q => (
            <button
              key={q}
              onClick={() => {
                onInputChange(q);
                /* Auto-send after chip tap for better UX */
                setTimeout(() => {
                  const btn = document.getElementById("chat-send-btn");
                  if (btn) btn.click();
                }, 100);
              }}
              style={{
                background: T.card,
                border: `1px solid ${T.border}`,
                borderRadius: 20,
                padding: "6px 14px",
                fontFamily: T.sans,
                fontSize: 12,
                color: T.text,
                cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Messages area — scrollable */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        WebkitOverflowScrolling: "touch",
      }}>
        {msgs.map((m, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            gap: 8,
            alignItems: "flex-end",
          }}>
            {m.role === "assistant" && <SheepSvg size={28} />}
            <div style={{
              maxWidth: "78%",
              padding: "12px 16px",
              fontFamily: T.sans,
              fontSize: 14,
              lineHeight: 1.6,
              fontWeight: 300,
              background: m.role === "user" ? T.green : T.card,
              color: m.role === "user" ? "#fff" : T.text,
              borderRadius: m.role === "user"
                ? "16px 16px 4px 16px"
                : "16px 16px 16px 4px",
              border: m.role === "assistant"
                ? `1px solid ${T.border}`
                : "none",
            }}>
              {m.text}
            </div>
          </div>
        ))}
        {busy && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <SheepSvg size={28} />
            <div style={{
              background: T.card,
              borderRadius: "16px 16px 16px 4px",
              border: `1px solid ${T.border}`,
              padding: "14px 18px",
              display: "flex",
              gap: 6,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.gold, animation: "dotPulse 1s 0s ease-in-out infinite" }} />
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.gold, animation: "dotPulse 1s 0.2s ease-in-out infinite" }} />
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.gold, animation: "dotPulse 1s 0.4s ease-in-out infinite" }} />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input area — always visible above nav */}
      <div style={{
        padding: "10px 20px 14px",
        borderTop: `1px solid ${T.border}`,
        display: "flex",
        gap: 10,
        alignItems: "center",
        background: T.bg,
        flexShrink: 0,
      }}>
        <input
          value={input}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder="Stel je vraag..."
          autoComplete="off"
          enterKeyHint="send"
          style={{
            flex: 1,
            background: T.card,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: "12px 16px",
            fontFamily: T.sans,
            fontSize: 16,
            outline: "none",
            color: T.text,
            fontWeight: 300,
            /* Prevent iOS zoom on focus */
            WebkitAppearance: "none",
          }}
        />
        <button
          id="chat-send-btn"
          onClick={onSend}
          disabled={busy || !input.trim()}
          style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            background: busy || !input.trim() ? T.border : T.green,
            border: "none",
            color: "#fff",
            cursor: busy || !input.trim() ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            WebkitTapHighlightColor: "transparent",
            transition: "background .15s ease",
          }}
        >
          <IcSend />
        </button>
      </div>
    </div>
  );
}
