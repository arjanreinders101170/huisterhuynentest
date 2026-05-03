"use client";

import { useState } from "react";
import { T, type GuestProfile } from "@/data/tokens";
import { PROFILES } from "@/data/profiles";
import { SheepSvg } from "./icons";

type Props = {
  onSelect: (profile: GuestProfile) => void;
};

export function Onboarding({ onSelect }: Props) {
  const [picked, setPicked] = useState<string | null>(null);

  const handlePick = (key: string) => {
    setPicked(key);
    // Brief delay for visual feedback before transitioning
    setTimeout(() => onSelect(key as GuestProfile), 400);
  };

  const profiles = (Object.keys(PROFILES) as Array<Exclude<GuestProfile, null>>).map(key => ({
    key,
    ...PROFILES[key],
  }));

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: `linear-gradient(180deg, ${T.bg} 0%, #DDD5C2 50%, ${T.bg} 100%)`,
      display: "flex", flexDirection: "column", alignItems: "center",
      overflowY: "auto",
      maxWidth: 430, margin: "0 auto",
    }}>
      {/* Decorative top accent */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 4,
        background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)`,
      }} />

      {/* Content */}
      <div style={{
        padding: "0 28px", width: "100%",
        display: "flex", flexDirection: "column", alignItems: "center",
        paddingTop: 56, paddingBottom: 40,
      }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div style={{
            fontFamily: T.serif, fontSize: 22, fontWeight: 600,
            color: "#52502E", letterSpacing: ".03em",
          }}>
            <span style={{ fontSize: 25 }}>H</span>UIS
            <span style={{ fontSize: 14, fontWeight: 400, margin: "0 4px", letterSpacing: ".1em" }}> TER </span>
            <span style={{ fontSize: 25 }}>H</span>UYNEN
          </div>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 8, marginTop: 3,
          }}>
            <div style={{ width: 28, height: 1, background: T.gold }} />
            <span style={{
              fontFamily: T.sans, fontSize: 9, fontWeight: 500,
              color: T.gold, letterSpacing: ".22em", textTransform: "uppercase",
            }}>
              Boutique Lodge
            </span>
            <div style={{ width: 28, height: 1, background: T.gold }} />
          </div>
        </div>

        {/* Sheep */}
        <div style={{
          margin: "28px 0 24px",
          filter: "drop-shadow(0 4px 12px rgba(47,79,62,.15))",
        }}>
          <SheepSvg size={72} />
        </div>

        {/* Welcome text */}
        <h1 style={{
          fontFamily: T.serif, fontSize: 28, fontWeight: 700,
          color: T.text, textAlign: "center", lineHeight: 1.2,
          margin: "0 0 8px",
        }}>
          Welkom
        </h1>
        <p style={{
          fontFamily: T.sans, fontSize: 15, color: T.muted,
          fontWeight: 300, textAlign: "center", lineHeight: 1.55,
          margin: "0 0 32px", maxWidth: 280,
        }}>
          Vertel ons iets over je verblijf, dan stemmen we alles op jullie af.
        </p>

        {/* Profile cards */}
        <div style={{
          width: "100%", display: "flex", flexDirection: "column", gap: 12,
        }}>
          {profiles.map((p, i) => {
            const isSelected = picked === p.key;
            return (
              <button
                key={p.key}
                onClick={() => handlePick(p.key)}
                style={{
                  width: "100%",
                  padding: "18px 20px",
                  borderRadius: 16,
                  border: isSelected ? `2px solid ${T.green}` : `1px solid ${T.border}`,
                  background: isSelected
                    ? "rgba(47,79,62,.06)"
                    : T.card,
                  boxShadow: isSelected
                    ? "0 4px 20px rgba(47,79,62,.15)"
                    : "0 2px 8px rgba(47,79,62,.04)",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 16,
                  textAlign: "left",
                  transition: "all 0.2s ease",
                  animation: `fadeUp 0.5s ${0.1 + i * 0.08}s ease both`,
                  transform: isSelected ? "scale(1.02)" : "scale(1)",
                }}
              >
                {/* Emoji circle */}
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: isSelected
                    ? `linear-gradient(135deg, ${T.green}, ${T.green2})`
                    : "rgba(47,79,62,.05)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24, flexShrink: 0,
                  transition: "all 0.2s ease",
                }}>
                  {isSelected ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span>{p.emoji}</span>
                  )}
                </div>

                {/* Text */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: T.serif, fontSize: 17, fontWeight: 600,
                    color: T.text, marginBottom: 3,
                  }}>
                    {p.label}
                  </div>
                  <div style={{
                    fontFamily: T.sans, fontSize: 12, color: T.muted,
                    fontWeight: 300, lineHeight: 1.4,
                  }}>
                    {p.sub}
                  </div>
                </div>

                {/* Arrow */}
                {!isSelected && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.gold} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.6 }}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {/* Skip */}
        <button
          onClick={() => onSelect(null)}
          style={{
            marginTop: 24,
            background: "none", border: "none", cursor: "pointer",
            fontFamily: T.sans, fontSize: 13, color: T.muted,
            fontWeight: 300, letterSpacing: ".02em",
            padding: "8px 16px",
            borderBottom: `1px solid transparent`,
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = T.text)}
          onMouseLeave={(e) => (e.currentTarget.style.color = T.muted)}
        >
          Overslaan — ik kijk liever zelf rond
        </button>

        {/* Bottom decorative line */}
        <div style={{
          width: 40, height: 1, background: T.gold,
          opacity: 0.4, marginTop: 20,
        }} />
      </div>
    </div>
  );
}
