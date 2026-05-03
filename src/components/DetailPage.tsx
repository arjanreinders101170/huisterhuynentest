"use client";
import { T, cardStyle, type Category, type Route } from "@/data/tokens";
import { IcBack, IcPin, IcRoute, IcClock, IcGlobe, IcPhone, IcArrow, IcCheck } from "./icons";

type Props = {
  data: Category;
  onBack: () => void;
  onNavigate: (r: Route) => void;
};

export function DetailPage({ data, onBack, onNavigate }: Props) {
  return (
    <div style={{ padding: "0 0 110px" }}>
      {/* Sub-header */}
      <div style={{
        padding: "12px 20px", display: "flex", alignItems: "center", gap: 14,
        borderBottom: `1px solid ${T.border}`, background: T.bg,
        position: "sticky", top: 68, zIndex: 40,
      }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: T.text, padding: 0 }}>
          <IcBack />
        </button>
        <div>
          <div style={{ fontFamily: T.serif, fontSize: 18, fontWeight: 600, color: T.text }}>{data.title}</div>
          <div style={{ fontFamily: T.sans, fontSize: 11, color: T.muted, fontWeight: 300 }}>{data.items.length} {data.sub}</div>
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ padding: "14px 20px 6px", display: "flex", gap: 8, overflowX: "auto" }}>
        {data.filters.map((f, i) => (
          <button key={f} style={{
            background: i === 0 ? T.green : T.card, color: i === 0 ? "#fff" : T.text,
            border: i === 0 ? "none" : `1px solid ${T.border}`,
            borderRadius: 20, padding: "7px 14px", fontFamily: T.sans,
            fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
          }}>{f}</button>
        ))}
      </div>

      {/* Cards */}
      <div style={{ padding: "10px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        {data.items.map((item, i) => (
          <div key={item.id} style={{
            ...cardStyle, padding: 0, overflow: "hidden",
            animation: `fadeUp .4s ${i * 0.03}s ease both`,
          }}>
            {/* Accent bar */}
            <div style={{
              height: 4,
              background: i < 4
                ? `linear-gradient(90deg, ${T.green}, ${T.green2})`
                : i < 7
                  ? `linear-gradient(90deg, ${T.green2}, ${T.gold})`
                  : `linear-gradient(90deg, ${T.gold}, ${T.muted})`,
            }} />

            <div style={{ padding: "16px 18px" }}>
              {/* Title + badge */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: T.serif, fontSize: 17, fontWeight: 600, color: T.text, lineHeight: 1.25, marginBottom: 4 }}>
                    {item.naam}
                  </div>
                  <div style={{ fontFamily: T.sans, fontSize: 12, color: T.muted, fontWeight: 300, display: "flex", alignItems: "center", gap: 5 }}>
                    <IcPin /> {item.afstand}
                  </div>
                </div>
                {item.moeilijkheid && (
                  <div style={{
                    background: item.moeilijkheid === "Pittig" ? "rgba(180,154,94,.15)" : "rgba(47,79,62,.08)",
                    borderRadius: 8, padding: "4px 10px", flexShrink: 0,
                  }}>
                    <span style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 500, color: item.moeilijkheid === "Pittig" ? T.gold : T.green }}>
                      {item.moeilijkheid}
                    </span>
                  </div>
                )}
                {item.prijs && !item.moeilijkheid && (
                  <div style={{ background: "rgba(47,79,62,.06)", borderRadius: 8, padding: "4px 10px", flexShrink: 0 }}>
                    <span style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 500, color: T.green }}>{item.prijs}</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div style={{
                display: "flex", gap: 16, marginBottom: 10, padding: "8px 0",
                borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, flexWrap: "wrap",
              }}>
                {item.lengte && <div style={{ display: "flex", alignItems: "center", gap: 5 }}><IcRoute /><span style={{ fontFamily: T.sans, fontSize: 12, color: T.text }}>{item.lengte}</span></div>}
                {item.duur && <div style={{ display: "flex", alignItems: "center", gap: 5 }}><IcClock /><span style={{ fontFamily: T.sans, fontSize: 12, color: T.text }}>{item.duur}</span></div>}
                {item.website && <div style={{ display: "flex", alignItems: "center", gap: 5 }}><IcGlobe /><span style={{ fontFamily: T.sans, fontSize: 12, color: T.green }}>{item.website}</span></div>}
                {item.tel && <div style={{ display: "flex", alignItems: "center", gap: 5 }}><IcPhone /><span style={{ fontFamily: T.sans, fontSize: 12, color: T.text }}>{item.tel}</span></div>}
              </div>

              {/* Description */}
              <p style={{ fontFamily: T.sans, fontSize: 13, color: T.muted, fontWeight: 300, lineHeight: 1.65, margin: "0 0 12px" }}>
                {item.beschrijving}
              </p>

              {/* Tags */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                {item.tags.map(tag => (
                  <span key={tag} style={{
                    background: "rgba(47,79,62,.05)", borderRadius: 6,
                    padding: "3px 8px", fontFamily: T.sans, fontSize: 10, color: T.green, letterSpacing: ".02em",
                  }}>{tag}</span>
                ))}
              </div>

              {/* Upsell banner */}
              {item.upsell && (
                <div onClick={() => onNavigate("reserveren")} style={{
                  background: "rgba(180,154,94,.1)", borderRadius: 10,
                  padding: "10px 14px", marginBottom: 12, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span style={{ fontFamily: T.sans, fontSize: 12, color: T.gold, fontWeight: 500 }}>💡</span>
                  <span style={{ fontFamily: T.sans, fontSize: 12, color: T.text, fontWeight: 400, flex: 1 }}>{item.upsell}</span>
                  <IcArrow />
                </div>
              )}

              {/* Plan route */}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${item.coords}&travelmode=driving`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  width: "100%", padding: 13, borderRadius: 12,
                  background: T.green, color: "#fff", textDecoration: "none",
                  fontFamily: T.sans, fontSize: 14, fontWeight: 500,
                }}
              >
                <IcRoute /> Plan route
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
