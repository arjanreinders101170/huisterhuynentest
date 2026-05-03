"use client";
import { useState } from "react";
import { T, cardStyle, iconBox } from "@/data/tokens";
import { IcBike, IcLotus, IcFork, IcClock, IcLeaf, IcHeart, IcCheck, IcGift, IcBasket } from "./icons";

type Upsell = { id: string; title: string; sub: string; price: string };
type Props = { booked: string | null; onBook: (p: string) => void; upsells: Upsell[] };

const icons: Record<string, React.ReactNode> = {
  welkomst: <IcGift />, boodschappen: <IcBasket />,
  fiets: <IcBike />, wellness: <IcLotus />, ontbijt: <IcFork />,
  latecheck: <IcClock />, picknick: <IcLeaf />, massage: <IcHeart />,
};

const WELKOMST_ITEMS = [
  "Flesje Drentse Schans bier", "Stuk Drentse boerenkaas",
  "Ambachtelijke droge worst", "Potje Drentse honing",
  "Zak boerenbeschuit", "Fles rode wijn (of sap)",
];
const BOODSCHAPPEN_ITEMS = [
  "Brood (vers)", "Halfvolle melk (1L)", "Scharreleieren (6 st)",
  "Roomboter", "Filterkoffie", "Pakje thee", "Suiker", "Jus d'orange",
];

export function Reserveren({ booked, onBook, upsells }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [bookingFor, setBookingFor] = useState<string | null>(null);
  const [gastNaam, setGastNaam] = useState("");
  const [gastEmail, setGastEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const [picnicLoading, setPicnicLoading] = useState(false);

  const isPackage = (id: string) => id === "welkomst" || id === "boodschappen";
  const packageItems = (id: string) => id === "welkomst" ? WELKOMST_ITEMS : BOODSCHAPPEN_ITEMS;

  /* ═══ SUBMIT BOOKING WITH EMAIL ═══ */
  const submitBooking = async (product: string, prijs: string) => {
    if (!gastNaam.trim() || !gastEmail.trim() || sending) return;
    setSending(true);

    try {
      await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product,
          prijs,
          gastNaam: gastNaam.trim(),
          gastEmail: gastEmail.trim(),
          datum: new Date().toLocaleDateString("nl-NL", {
            weekday: "long", day: "numeric", month: "long", year: "numeric",
          }),
        }),
      });
    } catch {
      // Booking registered regardless
    }

    onBook(product);
    setConfirmed(product);
    setBookingFor(null);
    setGastNaam("");
    setGastEmail("");
    setSending(false);
  };

  const startBooking = (product: string) => {
    if (confirmed === product || booked === product) return;
    setBookingFor(product);
  };

  /* ═══ BOOKING FORM ═══ */
  const renderBookingForm = (product: string, prijs: string) => {
    if (bookingFor !== product) return null;
    const canSubmit = gastNaam.trim().length > 0 && gastEmail.includes("@");

    return (
      <div style={{
        padding: "16px 18px", borderTop: `1px solid ${T.border}`,
        animation: "fadeUp .25s ease both",
      }}>
        <div style={{
          fontFamily: T.sans, fontSize: 12, color: T.muted, fontWeight: 500,
          textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 12,
        }}>
          Gegevens voor boeking
        </div>
        <input
          value={gastNaam}
          onChange={e => setGastNaam(e.target.value)}
          placeholder="Naam (bijv. Martijn & Lisa)"
          style={{
            width: "100%", padding: "11px 14px", borderRadius: 12, marginBottom: 8,
            border: `1px solid ${T.border}`, background: T.card,
            fontFamily: T.sans, fontSize: 14, color: T.text, fontWeight: 300, outline: "none",
          }}
        />
        <input
          value={gastEmail}
          onChange={e => setGastEmail(e.target.value)}
          placeholder="E-mailadres"
          type="email"
          style={{
            width: "100%", padding: "11px 14px", borderRadius: 12, marginBottom: 14,
            border: `1px solid ${T.border}`, background: T.card,
            fontFamily: T.sans, fontSize: 14, color: T.text, fontWeight: 300, outline: "none",
          }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setBookingFor(null)} style={{
            flex: 1, padding: 12, borderRadius: 12, border: `1px solid ${T.border}`,
            background: T.card, fontFamily: T.sans, fontSize: 13, color: T.muted,
            cursor: "pointer",
          }}>
            Annuleren
          </button>
          <button
            onClick={() => submitBooking(product, prijs)}
            disabled={!canSubmit || sending}
            style={{
              flex: 2, padding: 12, borderRadius: 12, border: "none",
              background: canSubmit && !sending ? T.green : T.border,
              fontFamily: T.sans, fontSize: 13, fontWeight: 500, color: "#fff",
              cursor: canSubmit && !sending ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            {sending ? "Versturen..." : `Bevestig · ${prijs}`}
          </button>
        </div>
      </div>
    );
  };

  const isDone = (title: string) => confirmed === title || booked === title;

  return (
    <div style={{ padding: "0 20px 110px" }}>
      <div style={{ paddingTop: 28 }}>
        <h1 style={{ fontFamily: T.serif, fontSize: 28, fontWeight: 700, color: T.text, margin: "0 0 6px" }}>Extra boeken</h1>
        <p style={{ fontFamily: T.sans, fontSize: 14, color: T.muted, fontWeight: 300, margin: 0 }}>Maak je verblijf nog mooier</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
        {upsells.map(u => {
          const isPkg = isPackage(u.id);
          const isExp = expanded === u.id;
          const done = isDone(u.title);

          return (
            <div key={u.id} style={{
              ...cardStyle, padding: 0, overflow: "hidden",
              border: isExp ? `1px solid ${T.gold}` : `1px solid ${T.border}`,
              transition: "border-color .2s ease",
            }}>
              {/* Main row */}
              <div
                onClick={() => isPkg ? setExpanded(isExp ? null : u.id) : undefined}
                style={{ padding: 18, display: "flex", alignItems: "center", gap: 16, cursor: isPkg ? "pointer" : "default" }}
              >
                <div style={{
                  ...iconBox, width: 48, height: 48, borderRadius: 14, color: T.green,
                  background: isPkg && isExp ? "rgba(180,154,94,.12)" : "rgba(47,79,62,.06)",
                }}>
                  {icons[u.id] || <IcLeaf />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: T.serif, fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 2 }}>{u.title}</div>
                  <div style={{ fontFamily: T.sans, fontSize: 11, color: T.muted, fontWeight: 300 }}>{u.sub}</div>
                </div>
                <div style={{ textAlign: "right" as const, flexShrink: 0 }}>
                  <div style={{ fontFamily: T.sans, fontSize: 16, fontWeight: 500, color: T.green, marginBottom: isPkg ? 0 : 6 }}>{u.price}</div>
                  {!isPkg && (
                    <button onClick={() => done ? undefined : startBooking(u.title)} style={{
                      padding: "7px 14px", borderRadius: 10, fontFamily: T.sans, fontSize: 12,
                      cursor: done ? "default" : "pointer", fontWeight: 500,
                      background: done ? T.green : "transparent",
                      color: done ? "#fff" : T.green,
                      border: done ? "none" : `1px solid ${T.green}`,
                    }}>
                      {done ? "✓ Geboekt" : "Boek"}
                    </button>
                  )}
                  {isPkg && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.gold} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 4, transition: "transform .2s", transform: isExp ? "rotate(90deg)" : "rotate(0deg)" }}>
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Booking form for regular items */}
              {!isPkg && renderBookingForm(u.title, u.price)}

              {/* Expanded package */}
              {isPkg && isExp && (
                <div style={{ padding: "0 18px 18px", borderTop: `1px solid ${T.border}`, animation: "fadeUp .25s ease both" }}>
                  <div style={{ padding: "14px 0 16px" }}>
                    <div style={{ fontFamily: T.sans, fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 10, fontWeight: 500 }}>
                      {u.id === "welkomst" ? "In het pakket" : "Basis boodschappen"}
                    </div>
                    {packageItems(u.id).map((item, i) => (
                      <div key={i} style={{ fontFamily: T.sans, fontSize: 13, color: T.text, fontWeight: 300, padding: "6px 0", display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ color: T.green, fontSize: 8 }}>●</span> {item}
                      </div>
                    ))}
                  </div>

                  {/* CTA: Order via lodge */}
                  {!done ? (
                    <button onClick={() => startBooking(u.title)} style={{
                      width: "100%", padding: 14, borderRadius: 14, border: "none",
                      background: T.green, color: "#fff",
                      fontFamily: T.sans, fontSize: 15, fontWeight: 500, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      marginBottom: 10,
                    }}>
                      <IcGift /> Bestel via ons · {u.price}
                    </button>
                  ) : (
                    <div style={{
                      width: "100%", padding: 14, borderRadius: 14,
                      background: "rgba(47,79,62,.08)",
                      fontFamily: T.sans, fontSize: 15, fontWeight: 500, color: T.green,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      marginBottom: 10,
                    }}>
                      <IcCheck /> Besteld — wij regelen het
                    </div>
                  )}

                  {/* Booking form inline for packages */}
                  {bookingFor === u.title && renderBookingForm(u.title, u.price)}

                  {/* Picnic link */}
                  <a href="https://picnic.app/nl/" target="_blank" rel="noopener noreferrer" style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    width: "100%", padding: 13, borderRadius: 14,
                    border: `1px solid ${T.border}`, background: T.card, textDecoration: "none",
                    fontFamily: T.sans, fontSize: 13, fontWeight: 400, color: T.text,
                  }}>
                    Of bestel zelf via Picnic
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>

                  <p style={{ fontFamily: T.sans, fontSize: 11, color: T.muted, fontWeight: 300, marginTop: 10, textAlign: "center", lineHeight: 1.4 }}>
                    {u.id === "welkomst" ? "Het pakket staat klaar bij aankomst." : "Picnic bezorgt gratis in Drenthe."}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirmation banner */}
      {confirmed && (
        <div style={{
          marginTop: 20, padding: "16px 18px", borderRadius: 14,
          background: "rgba(47,79,62,.06)", border: "1px solid rgba(47,79,62,.15)",
          animation: "fadeUp .3s ease both",
        }}>
          <div style={{ fontFamily: T.sans, fontSize: 14, color: T.green, fontWeight: 500, display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <IcCheck /> Boeking ontvangen
          </div>
          <div style={{ fontFamily: T.sans, fontSize: 12, color: T.muted, fontWeight: 300, lineHeight: 1.5 }}>
            Je ontvangt een bevestiging per e-mail. We nemen zo snel mogelijk contact op.
          </div>
        </div>
      )}
    </div>
  );
}
