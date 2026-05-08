"use client";
import type React from "react";
import { T, type Weather } from "@/data/tokens";
import { IcMenu, IcCloud, IcCal, IcSun, IcRain, IcSnow, IcStorm, IcMist } from "./icons";
import { useLanguage } from "@/i18n";

const WEATHER_ICONS: Record<string, () => React.ReactNode> = {
  sun: IcSun, cloud: IcCloud, rain: IcRain,
  snow: IcSnow, storm: IcStorm, mist: IcMist,
};

type Props = {
  today: string;
  weather: Weather | null;
  onMenuOpen: () => void;
};

export function Header({ today, weather, onMenuOpen }: Props) {
  const { lang, setLang } = useLanguage();
  const WeatherIcon = weather ? WEATHER_ICONS[weather.icon] || IcCloud : IcCloud;
  const temp = weather ? `${weather.temp}°C` : "…";
  const desc = weather?.description || "";

  return (
    <header style={{ background: T.bg, position: "sticky", top: 0, zIndex: 50, padding: "14px 20px 0" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={onMenuOpen} style={{ background: "none", border: "none", color: T.text, cursor: "pointer", padding: 4, WebkitTapHighlightColor: "transparent" }}>
          <IcMenu />
        </button>
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontFamily: T.serif, fontSize: 20, fontWeight: 600,
            color: "#52502E", letterSpacing: ".03em",
          }}>
            <span style={{ fontSize: 22 }}>H</span>UIS
            <span style={{ fontSize: 13, fontWeight: 400, margin: "0 3px", letterSpacing: ".1em" }}> TER </span>
            <span style={{ fontSize: 22 }}>H</span>UYNEN
          </div>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 6, marginTop: 2,
          }}>
            <div style={{ width: 24, height: 1, background: T.gold }} />
            <span style={{
              fontFamily: T.sans, fontSize: 8.5, fontWeight: 500,
              color: T.gold, letterSpacing: ".2em", textTransform: "uppercase",
            }}>
              Boutique Lodge
            </span>
            <div style={{ width: 24, height: 1, background: T.gold }} />
          </div>
        </div>
        {/* Language switcher */}
        <button
          onClick={() => setLang(lang === "nl" ? "de" : "nl")}
          style={{
            background: "none", border: `1px solid ${T.border}`,
            borderRadius: 8, cursor: "pointer",
            fontFamily: T.sans, fontSize: 11, fontWeight: 500,
            color: T.muted, padding: "4px 8px",
            letterSpacing: ".04em", lineHeight: 1,
          }}
        >
          {lang === "nl" ? "DE" : "NL"}
        </button>
      </div>
      <div style={{
        display: "flex", justifyContent: "space-between",
        padding: "10px 0 8px", borderBottom: `1px solid ${T.border}`,
      }}>
        <span style={{
          fontFamily: T.sans, fontSize: 12, color: T.muted,
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <WeatherIcon /> {temp}
          {desc && (
            <span style={{ fontSize: 11, opacity: 0.7 }}> · {desc}</span>
          )}
        </span>
        <span style={{
          fontFamily: T.sans, fontSize: 12, color: T.muted,
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <IcCal /> {today.charAt(0).toUpperCase() + today.slice(1)}
        </span>
      </div>
    </header>
  );
}
