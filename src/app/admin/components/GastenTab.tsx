"use client";
import { useState } from "react";
import { Guest, Stay, Booking, BookingRequest } from "../types";
import { Badge } from "./Badge";

export function GastenTab({ guests, stays, bookings, bookingRequests }: { guests: Guest[]; stays: Stay[]; bookings: Booking[]; bookingRequests: BookingRequest[] }) {
  const C = { bg: "#F5F3EE", card: "#fff", border: "#E8E4DC", text: "#2A2418", muted: "#8A7D6A", light: "#B4AFA5", green: "#2F4F3E", gold: "#B49A5E" };
  const [selected, setSelected] = useState<Guest | null>(null);

  const guestStays = (id: string) => stays.filter(s => s.guest_id === id);
  const guestBookings = (id: string) => bookings.filter(b => b.guest_id === id && b.product !== "follow-up-email");
  const guestAanvragen = (id: string) => bookingRequests.filter(r => r.guest_id === id);

  const totalSpend = (id: string) => {
    const verblijf = guestAanvragen(id).filter(r => r.status === "bevestigd").reduce((s, r) => s + Number(r.totaal || 0), 0);
    const upsell = guestBookings(id).filter(b => b.status === "betaald").reduce((s, b) => s + (b.prijs || 0), 0);
    return verblijf + upsell;
  };

  return (
    <div style={{ display: "flex", gap: 20, height: "100%" }}>
      {/* List */}
      <div style={{ flex: selected ? "0 0 340px" : "1" }}>
        <div style={{ fontSize: 20, fontWeight: 500, color: C.text, marginBottom: 4 }}>Gasten</div>
        <div style={{ fontSize: 13, color: C.light, marginBottom: 16 }}>{guests.length} geregistreerd</div>
        <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr", padding: "10px 18px", background: C.bg, fontSize: 12, color: C.light, borderBottom: `1px solid ${C.border}` }}>
            <div>Naam</div><div>E-mail</div><div>Verblijven</div><div>Besteed</div>
          </div>
          {guests.length === 0 && (
            <div style={{ padding: 20, fontSize: 13, color: C.light, textAlign: "center" }}>Geen gasten</div>
          )}
          {guests.map(g => {
            const spend = totalSpend(g.id);
            const nStays = guestStays(g.id).length;
            const isActive = selected?.id === g.id;
            return (
              <div key={g.id} onClick={() => setSelected(isActive ? null : g)} style={{
                display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1fr", padding: "12px 18px",
                fontSize: 13, borderBottom: `1px solid ${C.border}`, alignItems: "center",
                cursor: "pointer",
                background: isActive ? "rgba(47,79,62,.04)" : "transparent",
                borderLeft: isActive ? `3px solid ${C.green}` : "3px solid transparent",
              }}>
                <div style={{ color: C.text, fontWeight: 500 }}>{g.naam}</div>
                <div style={{ color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.email}</div>
                <div style={{ color: C.muted }}>{nStays || "—"}</div>
                <div style={{ color: spend > 0 ? C.green : C.light, fontWeight: spend > 0 ? 500 : 400 }}>
                  {spend > 0 ? `€ ${spend.toFixed(0)}` : "—"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 600, color: C.text }}>{selected.naam}</div>
                <a href={`mailto:${selected.email}`} style={{ fontSize: 13, color: C.gold, textDecoration: "none" }}>{selected.email}</a>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", fontSize: 18, color: C.light, cursor: "pointer", padding: 4 }}>×</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {[
                { label: "Verblijven", value: guestStays(selected.id).length },
                { label: "Aanvragen", value: guestAanvragen(selected.id).length },
                { label: "Totaal besteed", value: `€ ${totalSpend(selected.id).toFixed(0)}` },
              ].map(m => (
                <div key={m.label} style={{ background: C.bg, borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, color: C.light, marginBottom: 2 }}>{m.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: C.text }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stays */}
          {guestStays(selected.id).length > 0 && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 10 }}>Verblijven</div>
              {guestStays(selected.id).map(s => (
                <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.bg}`, fontSize: 12 }}>
                  <span style={{ color: C.text }}>{s.lodge === "lodge_1" ? "De Heide" : "De Eik"} · {new Date(s.check_in).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })} – {new Date(s.check_out).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}</span>
                  <span style={{ color: s.status === "actief" ? C.green : C.light }}>{s.status}</span>
                </div>
              ))}
            </div>
          )}

          {/* Aanvragen */}
          {guestAanvragen(selected.id).length > 0 && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 10 }}>Aanvragen</div>
              {guestAanvragen(selected.id).map(r => {
                const periode = r.check_in && r.check_out
                  ? `${new Date(r.check_in).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })} – ${new Date(r.check_out).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}`
                  : (r.periode_tekst || "—");
                const bedrag = r.totaal ?? r.voorgestelde_prijs;
                return (
                  <div key={r.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.bg}`, fontSize: 12 }}>
                    <span style={{ color: C.text }}>{periode} · {r.personen ?? "—"}p</span>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      {bedrag != null && <span style={{ color: C.muted }}>€ {Number(bedrag).toFixed(0)}</span>}
                      <Badge status={r.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Upsell bookings */}
          {guestBookings(selected.id).length > 0 && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 10 }}>Bestellingen</div>
              {guestBookings(selected.id).map(b => (
                <div key={b.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.bg}`, fontSize: 12 }}>
                  <span style={{ color: C.text }}>{b.product}</span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ color: C.muted }}>€ {(b.prijs || 0).toFixed(2)}</span>
                    <Badge status={b.status} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {guestStays(selected.id).length === 0 && guestAanvragen(selected.id).length === 0 && guestBookings(selected.id).length === 0 && (
            <div style={{ fontSize: 13, color: C.light, textAlign: "center", padding: 20 }}>Nog geen activiteit gevonden</div>
          )}
        </div>
      )}
    </div>
  );
}
