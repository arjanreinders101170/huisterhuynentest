"use client";
import { T, cardStyle, iconBox, type Route, type GuestProfile, type Weather } from "@/data/tokens";
import { PROFILES } from "@/data/profiles";
import { SheepSvg, IcTrees, IcFork, IcBike, IcFamily, IcTemple, IcLotus, IcChat, IcArrow, IcLeaf, IcPin, IcWifi, IcCar, IcClock, IcSun, IcCloud, IcRain } from "./icons";
import type { ReactNode } from "react";

/* ═══ CATEGORY VISUAL MAP ═══ */
const CAT_MAP: Record<string, { icon: ReactNode; t: string; s: string }> = {
  natuur:      { icon: <IcTrees />,  t: "Natuur & Wandelen",   s: "Ontdek de mooiste plekken" },
  eten:        { icon: <IcFork />,   t: "Eten & Drinken",      s: "Lekker eten in de omgeving" },
  actief:      { icon: <IcBike />,   t: "Actief & Avontuur",   s: "Fietsen, MTB, varen en meer" },
  kinderen:    { icon: <IcFamily />, t: "Met Kinderen",        s: "Leuke uitjes voor jong & oud" },
  cultuur:     { icon: <IcTemple />, t: "Cultuur & Ontdekken", s: "Musea, dorpen en verhalen" },
  ontspanning: { icon: <IcLotus />,  t: "Ontspanning & Luxe",  s: "Wellness, sauna's en extra's" },
};

const DEFAULT_ORDER = ["natuur", "eten", "actief", "kinderen", "cultuur", "ontspanning"];

type Props = {
  onNavigate: (r: Route) => void;
  categoryKeys: readonly string[];
  profile: GuestProfile;
  weather: Weather | null;
};

export function Home({ onNavigate, categoryKeys, profile, weather }: Props) {
  /* ═══ PERSONALIZATION ═══ */
  const cfg = profile && profile in PROFILES
    ? PROFILES[profile as Exclude<GuestProfile, null>]
    : null;

  const tileOrder = cfg ? cfg.tileOrder : DEFAULT_ORDER;

  const welkom = cfg
    ? cfg.welkom
    : "Waar mogen we je vandaag mee inspireren?";

  const popular = cfg
    ? cfg.popularItem
    : { naam: "Wandeling Dwingelderveld", sub: "10 min rijden · Heide in bloei", category: "natuur" };

  return (
    <div style={{ padding: "0 20px 110px" }}>

      {/* Hero */}
      <div style={{ paddingTop: 32, paddingBottom: 8 }}>
        <h1 style={{
          fontFamily: T.serif, fontSize: 36, fontWeight: 700,
          color: T.text, lineHeight: 1.1, margin: "0 0 10px",
        }}>
          Welkom
        </h1>
        <p style={{
          fontFamily: T.sans, fontSize: 15, color: T.muted,
          fontWeight: 300, margin: 0, lineHeight: 1.5,
        }}>
          {welkom}
        </p>
      </div>

      {/* Chatbot CTA */}
      <div
        onClick={() => onNavigate("chat")}
        style={{
          marginTop: 20, borderRadius: 16, padding: 20,
          display: "flex", alignItems: "center", gap: 16, cursor: "pointer",
          background: `linear-gradient(135deg, ${T.green} 0%, ${T.green2} 100%)`,
          boxShadow: "0 8px 32px rgba(47,79,62,.2)",
        }}
      >
        <SheepSvg size={56} />
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: T.serif, fontSize: 17, fontWeight: 600,
            color: "#fff", marginBottom: 4,
          }}>
            Vraag het aan Huynen Host
          </div>
          <div style={{
            fontFamily: T.sans, fontSize: 12,
            color: "rgba(255,255,255,.6)", fontWeight: 300,
          }}>
            {cfg ? `Tips afgestemd op ${cfg.label.toLowerCase()}` : "Ik help je graag op weg"}
          </div>
        </div>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: "rgba(255,255,255,.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", flexShrink: 0,
        }}>
          <IcChat />
        </div>
      </div>

      {/* Weather tip — contextual suggestion */}
      {weather?.tip && (
        <div
          onClick={() => {
            const isIndoor = weather.icon === "rain" || weather.icon === "storm" || weather.icon === "snow";
            onNavigate(isIndoor ? "detail:kinderen" : "detail:natuur");
          }}
          className="tile-tap"
          style={{
            marginTop: 16,
            padding: "14px 18px",
            borderRadius: 14,
            background: weather.icon === "rain" || weather.icon === "storm"
              ? "rgba(47,79,62,.06)"
              : "rgba(180,154,94,.08)",
            border: `1px solid ${T.border}`,
            display: "flex",
            alignItems: "center",
            gap: 12,
            cursor: "pointer",
          }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: T.card,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: T.muted, flexShrink: 0,
          }}>
            {weather.icon === "sun" && <IcSun />}
            {weather.icon === "cloud" && <IcCloud />}
            {(weather.icon === "rain" || weather.icon === "storm") && <IcRain />}
            {!["sun", "cloud", "rain", "storm"].includes(weather.icon) && <IcCloud />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: T.sans, fontSize: 13, color: T.text,
              fontWeight: 400, lineHeight: 1.45,
            }}>
              {weather.tip}
            </div>
          </div>
          <span style={{ color: T.gold, opacity: 0.6, flexShrink: 0 }}><IcArrow /></span>
        </div>
      )}

      {/* Category tiles — ordered by profile */}
      <h2 style={{
        fontFamily: T.serif, fontSize: 18, fontWeight: 600,
        color: T.text, margin: "28px 0 14px",
      }}>
        {cfg ? "Aangeraden voor jullie" : "Ontdek"}
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {tileOrder.map(key => {
          const c = CAT_MAP[key];
          if (!c) return null;
          return (
            <div
              key={key}
              className="tile-tap"
              onClick={() => onNavigate(`detail:${key}`)}
              style={{ ...cardStyle, padding: "18px 16px", cursor: "pointer" }}
            >
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "flex-start", marginBottom: 12,
              }}>
                <div style={iconBox}>{c.icon}</div>
                <span className="tile-arrow" style={{
                  color: T.gold, opacity: 0.7, transition: "all .15s",
                }}>
                  <IcArrow />
                </span>
              </div>
              <div style={{
                fontFamily: T.serif, fontSize: 14, fontWeight: 600,
                color: T.text, marginBottom: 4, lineHeight: 1.25,
              }}>
                {c.t}
              </div>
              <div style={{
                fontFamily: T.sans, fontSize: 11, color: T.muted,
                fontWeight: 300, lineHeight: 1.4,
              }}>
                {c.s}
              </div>
            </div>
          );
        })}
      </div>

      {/* Popular today — personalized */}
      <h2 style={{
        fontFamily: T.serif, fontSize: 18, fontWeight: 600,
        color: T.text, margin: "28px 0 14px",
      }}>
        {cfg ? "Tip voor jullie" : "Populair vandaag"}
      </h2>
      <div
        className="tile-tap"
        style={{
          ...cardStyle, padding: 16, display: "flex",
          alignItems: "center", gap: 14, cursor: "pointer",
        }}
        onClick={() => onNavigate(`detail:${popular.category}`)}
      >
        <div style={{ ...iconBox, background: "rgba(180,154,94,.15)" }}>
          <IcLeaf />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: T.serif, fontSize: 15, fontWeight: 600,
            color: T.text, marginBottom: 3,
          }}>
            {popular.naam}
          </div>
          <div style={{
            fontFamily: T.sans, fontSize: 11, color: T.muted,
            fontWeight: 300, display: "flex", alignItems: "center", gap: 4,
          }}>
            <IcPin /> {popular.sub}
          </div>
        </div>
        <span style={{ color: T.green }}><IcArrow /></span>
      </div>

      {/* Info bar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 24 }}>
        {[
          { ic: <IcWifi />, l: "Wifi", v: "HuynenGast" },
          { ic: <IcCar />, l: "Parkeren", v: "Gratis op terrein" },
          { ic: <IcClock />, l: "Check-in", v: "15:00" },
          { ic: <IcClock />, l: "Check-out", v: "11:00" },
        ].map((x, i) => (
          <div key={i} style={{
            background: "rgba(47,79,62,.06)", borderRadius: 12,
            padding: "12px 14px", display: "flex", alignItems: "center", gap: 10,
          }}>
            <span style={{ color: T.green }}>{x.ic}</span>
            <div>
              <div style={{
                fontFamily: T.sans, fontSize: 10, color: T.muted,
                textTransform: "uppercase", letterSpacing: ".04em",
              }}>
                {x.l}
              </div>
              <div style={{
                fontFamily: T.sans, fontSize: 13, color: T.text, fontWeight: 500,
              }}>
                {x.v}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
