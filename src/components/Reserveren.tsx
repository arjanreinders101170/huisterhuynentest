"use client";
import { useState } from "react";
import { T, cardStyle, iconBox } from "@/data/tokens";
import { IcBike, IcClock, IcCheck, IcGift, IcBasket } from "./icons";

type Upsell = { id: string; title: string; sub: string; price: string };
type Props = { booked: string | null; onBook: (p: string) => void; upsells: Upsell[] };

const icons: Record<string, React.ReactNode> = {
  welkomst: <IcGift />, boodschappen: <IcBasket />,
  fiets: <IcBike />, latecheck: <IcClock />,
};

/* ═══ PACKAGE CONTENTS ═══ */
const WELKOMST_ITEMS = [
  "Flesje Drentse Schans bier", "Stuk Drentse boerenkaas",
  "Ambachtelijke droge worst", "Potje Drentse honing",
  "Zak boerenbeschuit", "Fles rode wijn (of sap)",
];
const BOODSCHAPPEN_ITEMS = [
  "Brood (vers)", "Halfvolle melk (1L)", "Scharreleieren (6 st)",
  "Roomboter", "Filterkoffie", "Pakje thee", "Suiker", "Jus d'orange",
];

/* ═══ FIETS TARIEVEN ═══ */
type FietsType = { id: string; naam: string; dag: number; week: number; needsBike?: boolean };
const FIETSEN: FietsType[] = [
  { id: "fiets", naam: "Fiets", dag: 8.50, week: 42.50 },
  { id: "kinderfiets", naam: "Kinderfiets", dag: 6.50, week: 32.50 },
  { id: "ebike", naam: "Elektrische fiets", dag: 25.00, week: 125.00 },
  { id: "atb", naam: "ATB / MTB", dag: 22.50, week: 112.50 },
  { id: "zitje", naam: "Zitje voor/achter*", dag: 2.50, week: 12.50, needsBike: true },
];

export function Reserveren({ booked, onBook, upsells }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  // Booking form state
  const [gastNaam, setGastNaam] = useState("");
  const [gastEmail, setGastEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<string | null>(null);

  // Fiets state
  const [fietsSelection, setFietsSelection] = useState<Record<string, number>>({});
  const [fietsDagen, setFietsDagen] = useState(1);

  const isPackage = (id: string) => id === "welkomst" || id === "boodschappen";
  const isFiets = (id: string) => id === "fiets";
  const isDone = (title: string) => confirmed === title || booked === title;

  /* ═══ FIETS PRICE CALC ═══ */
  const calcFietsPrice = () => {
    let total = 0;
    const isWeek = fietsDagen >= 7;
    for (const [fietsId, qty] of Object.entries(fietsSelection)) {
      if (qty <= 0) continue;
      const fiets = FIETSEN.find(f => f.id === fietsId);
      if (!fiets) continue;
      if (isWeek) {
        const weeks = Math.floor(fietsDagen / 7);
        const extraDays = fietsDagen % 7;
        total += (fiets.week * weeks + fiets.dag * extraDays) * qty;
      } else {
        total += fiets.dag * fietsDagen * qty;
      }
    }
    return total;
  };

  const hasBikeSelected = Object.entries(fietsSelection).some(
    ([id, qty]) => qty > 0 && id !== "zitje"
  );
  const hasZitje = (fietsSelection["zitje"] || 0) > 0;

  /* ═══ MOLLIE PAYMENT ═══ */
  const startPayment = async (product: string, amount: number, meta?: Record<string, unknown>) => {
    if (!gastNaam.trim() || !gastEmail.includes("@") || sending) return;
    setSending(true);

    try {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product,
          amount: amount.toFixed(2),
          description: `Huis ter Huynen — ${product}`,
          gastNaam: gastNaam.trim(),
          gastEmail: gastEmail.trim(),
          metadata: meta,
        }),
      });
      const d = await r.json();

      if (d.checkoutUrl) {
        window.location.href = d.checkoutUrl;
        return;
      }

      // Fallback: no Mollie key → mark as booked via email
      if (d.fallback) {
        onBook(product);
        setConfirmed(product);
        setShowForm(null);
        setExpanded(null);
      }
    } catch {
      // Fallback on error
      onBook(product);
      setConfirmed(product);
    }
    setSending(false);
  };

  /* ═══ BOOKING FORM (reusable) ═══ */
  const renderForm = (product: string, amount: number, meta?: Record<string, unknown>) => {
    if (showForm !== product) return null;
    const canSubmit = gastNaam.trim().length > 0 && gastEmail.includes("@");

    return (
      <div style={{ padding: "16px 18px 18px", borderTop: `1px solid ${T.border}`, animation: "fadeUp .25s ease both" }}>
        <div style={{ fontFamily: T.sans, fontSize: 12, color: T.muted, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 12 }}>
          Gegevens & afrekenen
        </div>
        <input value={gastNaam} onChange={e => setGastNaam(e.target.value)} placeholder="Naam (bijv. Martijn & Lisa)"
          style={{ width: "100%", padding: "11px 14px", borderRadius: 12, marginBottom: 8, border: `1px solid ${T.border}`, background: T.card, fontFamily: T.sans, fontSize: 14, color: T.text, fontWeight: 300, outline: "none" }} />
        <input value={gastEmail} onChange={e => setGastEmail(e.target.value)} placeholder="E-mailadres" type="email"
          style={{ width: "100%", padding: "11px 14px", borderRadius: 12, marginBottom: 14, border: `1px solid ${T.border}`, background: T.card, fontFamily: T.sans, fontSize: 14, color: T.text, fontWeight: 300, outline: "none" }} />
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowForm(null)} style={{
            flex: 1, padding: 12, borderRadius: 12, border: `1px solid ${T.border}`,
            background: T.card, fontFamily: T.sans, fontSize: 13, color: T.muted, cursor: "pointer",
          }}>Annuleren</button>
          <button onClick={() => startPayment(product, amount, meta)} disabled={!canSubmit || sending} style={{
            flex: 2, padding: 12, borderRadius: 12, border: "none",
            background: canSubmit && !sending ? T.green : T.border,
            fontFamily: T.sans, fontSize: 13, fontWeight: 500, color: "#fff",
            cursor: canSubmit && !sending ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            {sending ? "Doorsturen naar iDEAL..." : `Afrekenen · € ${amount.toFixed(2)}`}
          </button>
        </div>
      </div>
    );
  };

  /* ═══ FIETS CONFIGURATOR ═══ */
  const renderFiets = () => {
    const total = calcFietsPrice();
    const hasItems = total > 0;

    return (
      <div style={{ padding: "0 18px 18px", borderTop: `1px solid ${T.border}`, animation: "fadeUp .25s ease both" }}>
        {/* Period selector */}
        <div style={{ padding: "14px 0 12px" }}>
          <div style={{ fontFamily: T.sans, fontSize: 12, color: T.muted, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 10 }}>
            Huurperiode
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[1, 2, 3, 7].map(d => (
              <button key={d} onClick={() => setFietsDagen(d)} style={{
                flex: 1, padding: "10px 0", borderRadius: 10, fontFamily: T.sans, fontSize: 13,
                fontWeight: fietsDagen === d ? 600 : 300,
                background: fietsDagen === d ? T.green : T.card,
                color: fietsDagen === d ? "#fff" : T.text,
                border: fietsDagen === d ? "none" : `1px solid ${T.border}`,
                cursor: "pointer",
              }}>
                {d === 7 ? "Week" : `${d} dag${d > 1 ? "en" : ""}`}
              </button>
            ))}
          </div>
        </div>

        {/* Bike types */}
        <div style={{ fontFamily: T.sans, fontSize: 12, color: T.muted, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>
          Kies je fiets
        </div>
        {FIETSEN.map(f => {
          const qty = fietsSelection[f.id] || 0;
          const isWeek = fietsDagen >= 7;
          const pricePerUnit = isWeek ? f.week : f.dag;
          const disabled = f.needsBike && !hasBikeSelected;

          return (
            <div key={f.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 0", borderBottom: `1px solid ${T.border}`,
              opacity: disabled ? 0.4 : 1,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: T.sans, fontSize: 14, color: T.text, fontWeight: 400 }}>{f.naam}</div>
                <div style={{ fontFamily: T.sans, fontSize: 11, color: T.muted, fontWeight: 300 }}>
                  € {pricePerUnit.toFixed(2)} / {isWeek ? "week" : "dag"}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button disabled={disabled || qty === 0} onClick={() => setFietsSelection(p => ({ ...p, [f.id]: Math.max(0, qty - 1) }))}
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    border: `1px solid ${T.border}`, background: T.card,
                    fontFamily: T.sans, fontSize: 16, color: T.text,
                    cursor: disabled || qty === 0 ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>−</button>
                <span style={{ fontFamily: T.sans, fontSize: 16, fontWeight: 500, color: T.text, width: 20, textAlign: "center" }}>{qty}</span>
                <button disabled={disabled} onClick={() => setFietsSelection(p => ({ ...p, [f.id]: qty + 1 }))}
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    border: "none", background: disabled ? T.border : T.green,
                    fontFamily: T.sans, fontSize: 16, color: "#fff",
                    cursor: disabled ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>+</button>
              </div>
            </div>
          );
        })}

        {/* Zitje warning */}
        {hasZitje && !hasBikeSelected && (
          <div style={{ fontFamily: T.sans, fontSize: 11, color: "#c0392b", fontWeight: 400, marginTop: 8 }}>
            * Zitje alleen in combinatie met een huurfiets
          </div>
        )}
        <div style={{ fontFamily: T.sans, fontSize: 11, color: T.muted, fontWeight: 300, marginTop: 6, marginBottom: 12 }}>
          * Zitje uitsluitend in combinatie met huurfiets · Legitimatie verplicht
        </div>

        {/* Notice */}
        <div style={{
          background: "rgba(180,154,94,.08)", borderRadius: 10,
          padding: "10px 14px", marginBottom: 14,
          fontFamily: T.sans, fontSize: 12, color: T.gold, fontWeight: 400,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          ⏰ Reservering minimaal 24 uur van tevoren gewenst
        </div>

        {/* Total + CTA */}
        {hasItems && (
          <>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "14px 0", borderTop: `2px solid ${T.border}`,
            }}>
              <div style={{ fontFamily: T.sans, fontSize: 15, fontWeight: 500, color: T.text }}>Totaal</div>
              <div style={{ fontFamily: T.sans, fontSize: 20, fontWeight: 600, color: T.green }}>€ {total.toFixed(2)}</div>
            </div>
            <button onClick={() => setShowForm("fiets")} style={{
              width: "100%", padding: 14, borderRadius: 14, border: "none",
              background: T.green, color: "#fff",
              fontFamily: T.sans, fontSize: 15, fontWeight: 500, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <IcBike /> Reserveren & afrekenen
            </button>
          </>
        )}

        {/* Payment form for fiets */}
        {showForm === "fiets" && hasItems && (
          <div style={{ marginTop: 14 }}>
            {renderForm("Fietsverhuur", total, {
              fietsen: Object.entries(fietsSelection).filter(([, q]) => q > 0).map(([id, q]) => `${FIETSEN.find(f => f.id === id)?.naam} x${q}`).join(", "),
              dagen: fietsDagen,
            })?.props.children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: "0 20px 110px" }}>
      <div style={{ paddingTop: 28 }}>
        <h1 style={{ fontFamily: T.serif, fontSize: 28, fontWeight: 700, color: T.text, margin: "0 0 6px" }}>Extra boeken</h1>
        <p style={{ fontFamily: T.sans, fontSize: 14, color: T.muted, fontWeight: 300, margin: 0 }}>Maak je verblijf nog mooier</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
        {upsells.map(u => {
          const isPkg = isPackage(u.id);
          const isFi = isFiets(u.id);
          const isExpandable = isPkg || isFi;
          const isExp = expanded === u.id;
          const done = isDone(u.title);

          const priceNum = parseFloat(u.price.replace(/[^0-9.,]/g, "").replace(",", "."));

          return (
            <div key={u.id} style={{
              ...cardStyle, padding: 0, overflow: "hidden",
              border: isExp ? `1px solid ${T.gold}` : `1px solid ${T.border}`,
              transition: "border-color .2s ease",
            }}>
              {/* Main row */}
              <div
                onClick={() => isExpandable ? setExpanded(isExp ? null : u.id) : undefined}
                style={{ padding: 18, display: "flex", alignItems: "center", gap: 16, cursor: isExpandable ? "pointer" : "default" }}
              >
                <div style={{
                  ...iconBox, width: 48, height: 48, borderRadius: 14, color: T.green,
                  background: isExp ? "rgba(180,154,94,.12)" : "rgba(47,79,62,.06)",
                }}>
                  {icons[u.id] || <IcClock />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: T.serif, fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 2 }}>{u.title}</div>
                  <div style={{ fontFamily: T.sans, fontSize: 11, color: T.muted, fontWeight: 300 }}>{u.sub}</div>
                </div>
                <div style={{ textAlign: "right" as const, flexShrink: 0 }}>
                  <div style={{ fontFamily: T.sans, fontSize: 16, fontWeight: 500, color: T.green, marginBottom: isExpandable ? 0 : 6 }}>
                    {isFi ? "vanaf € 8,50" : u.price}
                  </div>
                  {!isExpandable && (
                    <button onClick={() => done ? undefined : setShowForm(u.title)} style={{
                      padding: "7px 14px", borderRadius: 10, fontFamily: T.sans, fontSize: 12,
                      cursor: done ? "default" : "pointer", fontWeight: 500,
                      background: done ? T.green : "transparent",
                      color: done ? "#fff" : T.green,
                      border: done ? "none" : `1px solid ${T.green}`,
                    }}>{done ? "✓ Geboekt" : "Boek"}</button>
                  )}
                  {isExpandable && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.gold} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 4, transition: "transform .2s", transform: isExp ? "rotate(90deg)" : "rotate(0deg)" }}>
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Non-expandable booking form */}
              {!isExpandable && showForm === u.title && renderForm(u.title, priceNum)}

              {/* Package expanded */}
              {isPkg && isExp && (
                <div style={{ padding: "0 18px 18px", borderTop: `1px solid ${T.border}`, animation: "fadeUp .25s ease both" }}>
                  <div style={{ padding: "14px 0 16px" }}>
                    <div style={{ fontFamily: T.sans, fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 10, fontWeight: 500 }}>
                      {u.id === "welkomst" ? "In het pakket" : "Basis boodschappen"}
                    </div>
                    {(u.id === "welkomst" ? WELKOMST_ITEMS : BOODSCHAPPEN_ITEMS).map((item, i) => (
                      <div key={i} style={{ fontFamily: T.sans, fontSize: 13, color: T.text, fontWeight: 300, padding: "6px 0", display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ color: T.green, fontSize: 8 }}>●</span> {item}
                      </div>
                    ))}
                  </div>

                  {!done ? (
                    <button onClick={() => setShowForm(u.title)} style={{
                      width: "100%", padding: 14, borderRadius: 14, border: "none",
                      background: T.green, color: "#fff",
                      fontFamily: T.sans, fontSize: 15, fontWeight: 500, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      marginBottom: 10,
                    }}>
                      <IcGift /> Bestel & betaal · {u.price}
                    </button>
                  ) : (
                    <div style={{
                      width: "100%", padding: 14, borderRadius: 14,
                      background: "rgba(47,79,62,.08)",
                      fontFamily: T.sans, fontSize: 15, fontWeight: 500, color: T.green,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      marginBottom: 10,
                    }}>
                      <IcCheck /> Besteld & betaald
                    </div>
                  )}

                  {/* Payment form */}
                  {showForm === u.title && renderForm(u.title, priceNum)}

                  {/* Picnic fallback */}
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

              {/* Fiets expanded */}
              {isFi && isExp && renderFiets()}
              {isFi && isExp && showForm === "fiets" && renderForm("Fietsverhuur", calcFietsPrice(), {
                fietsen: Object.entries(fietsSelection).filter(([, q]) => q > 0).map(([id, q]) => `${FIETSEN.find(f => f.id === id)?.naam} x${q}`).join(", "),
                dagen: fietsDagen,
              })}
            </div>
          );
        })}
      </div>

      {/* Confirmation */}
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
            Je ontvangt een bevestiging per e-mail.
          </div>
        </div>
      )}
    </div>
  );
}
