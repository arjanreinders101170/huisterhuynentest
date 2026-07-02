"use client";
import React, { useState } from "react";
import { Stay, Guest } from "../types";

export function ReservationTimeline({ stays, guests, guestMap }: { stays: Stay[]; guests: Guest[]; guestMap: Record<string, string> }) {
  const DAYS = 21;
  const DAY_W = 54;
  const LEFT_W = 148;
  const ROW_H = 62;
  const MAX_OFFSET = 365;

  const [slideOffset, setSlideOffset] = useState(0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const windowStart = new Date(today);
  windowStart.setDate(windowStart.getDate() - 3 + slideOffset);

  const days = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(windowStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const toDay = (s: string) => { const d = new Date(s); d.setHours(0, 0, 0, 0); return d; };
  const dayOffset = (d: Date) => (d.getTime() - windowStart.getTime()) / 86400000;
  const todayOff = dayOffset(today);

  const lodges = [
    { id: "lodge_1", label: "Lodge 1", sub: "De Heide" },
    { id: "lodge_2", label: "Lodge 2", sub: "De Eik" },
  ];

  const barColor = (status: string) => {
    if (status === "actief") return "#10B981";
    if (status === "verwacht" || status === "bevestigd") return "#3B82F6";
    if (status === "uitgecheckt") return "#9CA3AF";
    return "#8B5CF6";
  };

  const windowLabel = (() => {
    const from = new Date(windowStart);
    const to = new Date(windowStart);
    to.setDate(to.getDate() + DAYS - 1);
    const fmt = (d: Date) => d.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
    return `${fmt(from)} – ${fmt(to)}`;
  })();

  return (
    <div>
    <div style={{ overflowX: "auto", borderRadius: 12, border: "1px solid #E5E7EB", background: "#fff" }}>
      <div style={{ minWidth: LEFT_W + DAYS * DAY_W }}>
        {/* Header */}
        <div style={{ display: "flex", borderBottom: "1px solid #E5E7EB" }}>
          <div style={{ width: LEFT_W, flexShrink: 0, padding: "10px 16px", fontSize: 11, color: "#9CA3AF", fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.6, background: "#FAFAFA", borderRight: "1px solid #E5E7EB" }}>
            Lodge
          </div>
          {days.map((d, i) => {
            const isToday = d.getTime() === today.getTime();
            const isWknd = d.getDay() === 0 || d.getDay() === 5 || d.getDay() === 6;
            return (
              <div key={i} style={{
                width: DAY_W, flexShrink: 0, textAlign: "center", padding: "8px 0",
                background: isToday ? "#EFF6FF" : "#FAFAFA",
                borderLeft: "1px solid #F3F4F6",
              }}>
                <div style={{ fontSize: 10, color: isToday ? "#3B82F6" : "#9CA3AF", textTransform: "uppercase", letterSpacing: 0.4 }}>
                  {d.toLocaleDateString("nl-NL", { weekday: "short" })}
                </div>
                <div style={{ fontSize: 13, fontWeight: isToday ? 700 : isWknd ? 500 : 400, color: isToday ? "#3B82F6" : isWknd ? "#374151" : "#6B7280", marginTop: 1 }}>
                  {d.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Lodge rows */}
        {lodges.map((lodge, ri) => {
          const lodgeStays = stays.filter(s => {
            const ci = toDay(s.check_in);
            const co = toDay(s.check_out);
            return s.lodge === lodge.id && co > windowStart && ci < days[DAYS - 1];
          });

          return (
            <div key={lodge.id} style={{ display: "flex", height: ROW_H, borderTop: ri > 0 ? "1px solid #E5E7EB" : "none" }}>
              {/* Label */}
              <div style={{
                width: LEFT_W, flexShrink: 0, display: "flex", flexDirection: "column",
                justifyContent: "center", padding: "0 16px",
                borderRight: "1px solid #E5E7EB", background: "#FAFAFA",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: lodgeStays.some(s => s.status === "actief") ? "#10B981" : "#D1D5DB", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{lodge.label}</span>
                </div>
                <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 3, marginLeft: 14 }}>{lodge.sub}</div>
              </div>

              {/* Timeline */}
              <div style={{ flex: 1, position: "relative", display: "flex", overflow: "hidden" }}>
                {days.map((d, i) => {
                  const isToday = d.getTime() === today.getTime();
                  const isWknd = d.getDay() === 0 || d.getDay() === 5 || d.getDay() === 6;
                  return (
                    <div key={i} style={{
                      width: DAY_W, flexShrink: 0, height: "100%",
                      background: isToday ? "#EFF6FF" : isWknd ? "#F9FAFB" : "#fff",
                      borderLeft: "1px solid #F3F4F6",
                    }} />
                  );
                })}

                {/* Today line */}
                <div style={{
                  position: "absolute", left: todayOff * DAY_W + DAY_W / 2,
                  top: 0, bottom: 0, width: 2, background: "#3B82F6", opacity: 0.25, borderRadius: 1,
                }} />

                {/* Bars */}
                {lodgeStays.map(stay => {
                  const ci = toDay(stay.check_in);
                  const co = toDay(stay.check_out);
                  const s0 = Math.max(0, dayOffset(ci));
                  const e0 = Math.min(DAYS, dayOffset(co));
                  if (e0 <= 0 || s0 >= DAYS) return null;
                  const left = s0 * DAY_W + 4;
                  const width = Math.max((e0 - s0) * DAY_W - 8, 24);
                  const name = stay.guests?.naam || guestMap[stay.guest_id] || "Gast";
                  const color = barColor(stay.status);
                  const nights = Math.round(dayOffset(co) - dayOffset(ci));

                  return (
                    <div key={stay.id} title={`${name} · ${nights} nacht${nights !== 1 ? "en" : ""}`} style={{
                      position: "absolute", left, top: "50%", transform: "translateY(-50%)",
                      width, height: 36, background: "#fff",
                      border: "1px solid #E5E7EB", borderRadius: 7,
                      display: "flex", alignItems: "center", overflow: "hidden",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.06)", zIndex: 1, cursor: "default",
                    }}>
                      <div style={{ width: 3, alignSelf: "stretch", background: color, flexShrink: 0, borderRadius: "6px 0 0 6px" }} />
                      <span style={{ fontSize: 12, fontWeight: 500, color: "#374151", marginLeft: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>
                        {name}
                      </span>
                    </div>
                  );
                })}

                {lodgeStays.length === 0 && (
                  <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#D1D5DB" }}>
                    Geen verblijven gepland
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>

      {/* Navigatie */}
      <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={() => setSlideOffset(o => Math.max(0, o - 7))}
          disabled={slideOffset === 0}
          style={{
            padding: "5px 12px", borderRadius: 7, border: "1px solid #E5E7EB",
            background: "#fff", fontSize: 13, color: slideOffset === 0 ? "#D1D5DB" : "#374151",
            cursor: slideOffset === 0 ? "not-allowed" : "pointer", flexShrink: 0,
          }}
        >← Vorige week</button>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
          <input
            type="range"
            min={0}
            max={MAX_OFFSET}
            value={slideOffset}
            onChange={e => setSlideOffset(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#3B82F6", cursor: "pointer" }}
          />
          <div style={{ textAlign: "center", fontSize: 11, color: "#9CA3AF" }}>{windowLabel}</div>
        </div>

        <button
          onClick={() => setSlideOffset(o => Math.min(MAX_OFFSET, o + 7))}
          disabled={slideOffset >= MAX_OFFSET}
          style={{
            padding: "5px 12px", borderRadius: 7, border: "1px solid #E5E7EB",
            background: "#fff", fontSize: 13, color: slideOffset >= MAX_OFFSET ? "#D1D5DB" : "#374151",
            cursor: slideOffset >= MAX_OFFSET ? "not-allowed" : "pointer", flexShrink: 0,
          }}
        >Volgende week →</button>

        {slideOffset > 0 && (
          <button
            onClick={() => setSlideOffset(0)}
            style={{
              padding: "5px 12px", borderRadius: 7, border: "1px solid #BFDBFE",
              background: "#EFF6FF", fontSize: 12, color: "#3B82F6",
              cursor: "pointer", flexShrink: 0,
            }}
          >Vandaag</button>
        )}
      </div>
    </div>
  );
}

export function Table({ cols, widths, rows }: { cols: string[]; widths: string[]; rows: React.ReactNode[][] }) {
  const grid = widths.join(" ");
  if (rows.length === 0) {
    return <div style={{ fontSize: 13, color: "#B4AFA5", padding: 20, textAlign: "center" }}>Geen gegevens gevonden</div>;
  }
  return (
    <div style={{ border: "1px solid #E8E4DC", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: grid, padding: "10px 18px", background: "#F5F3EE", fontSize: 12, color: "#B4AFA5", borderBottom: "1px solid #E8E4DC" }}>
        {cols.map((c, i) => <div key={i}>{c}</div>)}
      </div>
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: "grid", gridTemplateColumns: grid, padding: "12px 18px", fontSize: 13, borderBottom: ri < rows.length - 1 ? "1px solid #E8E4DC" : "none", alignItems: "center" }}>
          {row.map((cell, ci) => (
            <div key={ci} style={{ color: ci === 0 ? "#2A2418" : "#8A7D6A", fontWeight: ci === 0 ? 500 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
