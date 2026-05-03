"use client";
import { T, cardStyle, iconBox } from "@/data/tokens";
import { IcBike, IcLotus, IcFork, IcClock, IcLeaf, IcHeart, IcCheck } from "./icons";

type Upsell = { id: string; title: string; sub: string; price: string };
type Props = { booked: string | null; onBook: (p: string) => void; upsells: Upsell[] };

const icons: Record<string, React.ReactNode> = {
  fiets: <IcBike />, wellness: <IcLotus />, ontbijt: <IcFork />,
  latecheck: <IcClock />, picknick: <IcLeaf />, massage: <IcHeart />,
};

export function Reserveren({ booked, onBook, upsells }: Props) {
  return (
    <div style={{ padding: "0 20px 110px" }}>
      <div style={{ paddingTop: 28 }}>
        <h1 style={{ fontFamily: T.serif, fontSize: 28, fontWeight: 700, color: T.text, margin: "0 0 6px" }}>Extra boeken</h1>
        <p style={{ fontFamily: T.sans, fontSize: 14, color: T.muted, fontWeight: 300, margin: 0 }}>Maak je verblijf nog mooier</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
        {upsells.map(u => (
          <div key={u.id} style={{ ...cardStyle, padding: 18, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ ...iconBox, width: 48, height: 48, borderRadius: 14, color: T.green }}>{icons[u.id] || <IcLeaf />}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: T.serif, fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 2 }}>{u.title}</div>
              <div style={{ fontFamily: T.sans, fontSize: 11, color: T.muted, fontWeight: 300 }}>{u.sub}</div>
            </div>
            <div style={{ textAlign: "right" as const, flexShrink: 0 }}>
              <div style={{ fontFamily: T.sans, fontSize: 16, fontWeight: 500, color: T.green, marginBottom: 6 }}>{u.price}</div>
              <button onClick={() => onBook(u.title)} style={{
                padding: "7px 14px", borderRadius: 10, fontFamily: T.sans, fontSize: 12, cursor: "pointer", fontWeight: 500,
                background: booked === u.title ? T.green : "transparent",
                color: booked === u.title ? "#fff" : T.green,
                border: booked === u.title ? "none" : `1px solid ${T.green}`,
              }}>{booked === u.title ? "✓ Geboekt" : "Boek"}</button>
            </div>
          </div>
        ))}
      </div>
      {booked && (
        <div style={{
          marginTop: 20, padding: "14px 16px", borderRadius: 12,
          background: "rgba(47,79,62,.06)", border: "1px solid rgba(47,79,62,.15)",
          fontFamily: T.sans, fontSize: 13, color: T.green, display: "flex", alignItems: "center", gap: 8,
        }}>
          <IcCheck /> <strong>{booked}</strong> is geboekt. We nemen contact op ter bevestiging.
        </div>
      )}
    </div>
  );
}
