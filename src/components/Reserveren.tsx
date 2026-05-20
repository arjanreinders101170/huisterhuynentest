"use client";
import { useState } from "react";
import { T, cardStyle } from "@/data/tokens";
import { newEventId, getAnonymousId } from "@/lib/tracking/dataLayer";
import { IcBike, IcClock, IcCheck, IcGift, IcBasket } from "./icons";

type Upsell = { id: string; title: string; sub: string; price: string };
type Props = { booked: string | null; onBook: (p: string) => void; upsells: Upsell[] };

const icons: Record<string, React.ReactNode> = {
  welkomst: <IcGift />, boodschappen: <IcBasket />,
  fiets: <IcBike />, latecheck: <IcClock />,
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
  const [gastNaam, setGastNaam] = useState("");
  const [gastEmail, setGastEmail] = useState("");
  const [gastDatum, setGastDatum] = useState("");
  const [sending, setSending] = useState(false);
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<string | null>(null);
  const [fietsSelection, setFietsSelection] = useState<Record<string, number>>({});
  const [fietsDagen, setFietsDagen] = useState(1);

  const isPackage = (id: string) => id === "welkomst" || id === "boodschappen";
  const isFiets = (id: string) => id === "fiets";
  const isDone = (title: string) => confirmed === title || booked === title;

  const calcFietsPrice = () => {
    let total = 0;
    const isWeek = fietsDagen >= 7;
    for (const [fietsId, qty] of Object.entries(fietsSelection)) {
      if (qty <= 0) continue;
      const f = FIETSEN.find(x => x.id === fietsId);
      if (!f) continue;
      if (isWeek) {
        total += (f.week * Math.floor(fietsDagen / 7) + f.dag * (fietsDagen % 7)) * qty;
      } else {
        total += f.dag * fietsDagen * qty;
      }
    }
    return total;
  };

  const hasBikeSelected = Object.entries(fietsSelection).some(([id, qty]) => qty > 0 && id !== "zitje");
  const fietsTotal = calcFietsPrice();
  const fietsSummary = Object.entries(fietsSelection)
    .filter(([, q]) => q > 0)
    .map(([id, q]) => `${FIETSEN.find(f => f.id === id)?.naam} x${q}`)
    .join(", ");

  // Tomorrow's date as min for date picker
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;

  /* ═══ PAYMENT ═══ */
  const startPayment = async (productId: string, displayPrice: number, meta?: Record<string, unknown>) => {
    if (!gastNaam.trim() || !gastEmail.includes("@") || sending) return;
    setSending(true);
    const eventId = newEventId();
    try {
      sessionStorage.setItem("hth-pending-purchase", JSON.stringify({ event_id: eventId, value: displayPrice }));
    } catch {}
    try {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          gastNaam: gastNaam.trim(),
          gastEmail: gastEmail.trim(),
          metadata: { ...meta, datum: gastDatum || undefined },
          _meta: { event_id: eventId, anonymous_id: getAnonymousId() },
        }),
      });
      const d = await r.json();
      if (d.checkoutUrl) { window.location.href = d.checkoutUrl; return; }
      if (d.fallback || d.success) { onBook(productId); setConfirmed(productId); setShowForm(null); setExpanded(null); }
    } catch { onBook(productId); setConfirmed(productId); }
    setSending(false);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px", borderRadius: 12,
    border: `1px solid ${T.border}`, background: T.card,
    fontFamily: T.sans, fontSize: 14, color: T.text,
    fontWeight: 300, outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ padding: "0 20px 110px" }}>
      <div style={{ paddingTop: 28 }}>
        <h1 style={{ fontFamily: T.serif, fontSize: 28, fontWeight: 700, color: T.text, margin: "0 0 6px" }}>Extra's</h1>
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
            }}>
              {/* ═══ CARD HEADER ═══ */}
              <div onClick={() => isExpandable ? setExpanded(isExp ? null : u.id) : undefined}
                style={{ padding: "16px", cursor: isExpandable ? "pointer" : "default" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: isExp ? "rgba(180,154,94,.12)" : "rgba(47,79,62,.06)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: T.green, flexShrink: 0,
                  }}>{icons[u.id] || <IcClock />}</div>
                  <div style={{ fontFamily: T.serif, fontSize: 16, fontWeight: 600, color: T.text }}>{u.title}</div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingLeft: 54 }}>
                  <div style={{ fontFamily: T.sans, fontSize: 12, color: T.muted, fontWeight: 300, flex: 1, minWidth: 0 }}>{u.sub}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, marginLeft: 8 }}>
                    <span style={{ fontFamily: T.sans, fontSize: 15, fontWeight: 600, color: T.green, whiteSpace: "nowrap" }}>
                      {isFi ? "v.a. € 8,50" : u.price}
                    </span>
                    {isExpandable && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.gold} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                        style={{ transition: "transform .2s", transform: isExp ? "rotate(90deg)" : "rotate(0deg)" }}>
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    )}
                    {!isExpandable && !done && (
                      <button onClick={() => setShowForm(u.id)} style={{
                        padding: "6px 16px", borderRadius: 10, fontFamily: T.sans, fontSize: 12,
                        cursor: "pointer", fontWeight: 500,
                        background: "transparent", color: T.green, border: `1px solid ${T.green}`,
                      }}>Boek</button>
                    )}
                    {!isExpandable && done && (
                      <span style={{ padding: "6px 12px", borderRadius: 10, fontFamily: T.sans, fontSize: 12, fontWeight: 500, background: T.green, color: "#fff" }}>✓</span>
                    )}
                  </div>
                </div>
              </div>

              {/* ═══ LATE CHECKOUT FORM ═══ */}
              {!isExpandable && showForm === u.id && (
                <div style={{ padding: "16px", borderTop: `1px solid ${T.border}`, animation: "fadeUp .25s ease both" }}>
                  <div style={{ fontFamily: T.sans, fontSize: 12, color: T.muted, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 12 }}>Gegevens & afrekenen</div>
                  <input value={gastNaam} onChange={e => setGastNaam(e.target.value)} placeholder="Naam" style={{ ...inputStyle, marginBottom: 8 }} />
                  <input value={gastEmail} onChange={e => setGastEmail(e.target.value)} placeholder="E-mailadres" type="email" style={{ ...inputStyle, marginBottom: 14 }} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setShowForm(null)} style={{ flex: 1, padding: 12, borderRadius: 12, border: `1px solid ${T.border}`, background: T.card, fontFamily: T.sans, fontSize: 13, color: T.muted, cursor: "pointer" }}>Annuleren</button>
                    <button onClick={() => startPayment(u.id, priceNum)} disabled={!gastNaam.trim() || !gastEmail.includes("@") || sending} style={{
                      flex: 2, padding: 12, borderRadius: 12, border: "none",
                      background: gastNaam.trim() && gastEmail.includes("@") && !sending ? T.green : T.border,
                      fontFamily: T.sans, fontSize: 13, fontWeight: 500, color: "#fff",
                      cursor: gastNaam.trim() && gastEmail.includes("@") && !sending ? "pointer" : "not-allowed",
                    }}>{sending ? "Doorsturen..." : `Afrekenen · ${u.price}`}</button>
                  </div>
                </div>
              )}

              {/* ═══ PACKAGE EXPANDED ═══ */}
              {isPkg && isExp && (
                <div style={{ padding: "0 16px 18px", borderTop: `1px solid ${T.border}`, animation: "fadeUp .25s ease both" }}>
                  <div style={{ padding: "14px 0 16px" }}>
                    <div style={{ fontFamily: T.sans, fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 10, fontWeight: 500 }}>
                      {u.id === "welkomst" ? "In het pakket" : "Basis boodschappen"}
                    </div>
                    {(u.id === "welkomst" ? WELKOMST_ITEMS : BOODSCHAPPEN_ITEMS).map((item, i) => (
                      <div key={i} style={{ fontFamily: T.sans, fontSize: 13, color: T.text, fontWeight: 300, padding: "5px 0", display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ color: T.green, fontSize: 8 }}>●</span> {item}
                      </div>
                    ))}
                  </div>
                  {!done ? (
                    <button onClick={() => setShowForm(u.id)} style={{
                      width: "100%", padding: 14, borderRadius: 14, border: "none", background: T.green, color: "#fff",
                      fontFamily: T.sans, fontSize: 15, fontWeight: 500, cursor: "pointer", marginBottom: 10,
                    }}>Bestel & betaal · {u.price}</button>
                  ) : (
                    <div style={{ width: "100%", padding: 14, borderRadius: 14, background: "rgba(47,79,62,.08)",
                      fontFamily: T.sans, fontSize: 15, fontWeight: 500, color: T.green,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10,
                    }}><IcCheck /> Besteld & betaald</div>
                  )}
                  {/* Package booking form */}
                  {showForm === u.id && (
                    <div style={{ padding: "14px 0", borderTop: `1px solid ${T.border}`, animation: "fadeUp .2s ease both" }}>
                      <input value={gastNaam} onChange={e => setGastNaam(e.target.value)} placeholder="Naam" style={{ ...inputStyle, marginBottom: 8 }} />
                      <input value={gastEmail} onChange={e => setGastEmail(e.target.value)} placeholder="E-mailadres" type="email" style={{ ...inputStyle, marginBottom: 14 }} />
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => setShowForm(null)} style={{ flex: 1, padding: 12, borderRadius: 12, border: `1px solid ${T.border}`, background: T.card, fontFamily: T.sans, fontSize: 13, color: T.muted, cursor: "pointer" }}>Annuleren</button>
                        <button onClick={() => startPayment(u.id, priceNum)} disabled={!gastNaam.trim() || !gastEmail.includes("@") || sending} style={{
                          flex: 2, padding: 12, borderRadius: 12, border: "none",
                          background: gastNaam.trim() && gastEmail.includes("@") && !sending ? T.green : T.border,
                          fontFamily: T.sans, fontSize: 13, fontWeight: 500, color: "#fff",
                          cursor: gastNaam.trim() && gastEmail.includes("@") && !sending ? "pointer" : "not-allowed",
                        }}>{sending ? "Doorsturen..." : `Afrekenen · ${u.price}`}</button>
                      </div>
                    </div>
                  )}
                  <a href="https://picnic.app/nl/" target="_blank" rel="noopener noreferrer" style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    width: "100%", padding: 12, borderRadius: 14,
                    border: `1px solid ${T.border}`, background: T.card, textDecoration: "none",
                    fontFamily: T.sans, fontSize: 12, fontWeight: 400, color: T.text,
                  }}>
                    Of bestel zelf via Picnic
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                </div>
              )}

              {/* ═══ FIETS EXPANDED ═══ */}
              {isFi && isExp && (
                <div style={{ padding: "0 16px 18px", borderTop: `1px solid ${T.border}`, animation: "fadeUp .25s ease both" }}>
                  {/* Period selector */}
                  <div style={{ padding: "14px 0 12px" }}>
                    <div style={{ fontFamily: T.sans, fontSize: 12, color: T.muted, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 10 }}>Huurperiode</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                      {[1, 2, 3, 7].map(d => (
                        <button key={d} onClick={() => setFietsDagen(d)} style={{
                          padding: "10px 4px", borderRadius: 10, fontFamily: T.sans, fontSize: 12,
                          fontWeight: fietsDagen === d ? 600 : 300,
                          background: fietsDagen === d ? T.green : T.card,
                          color: fietsDagen === d ? "#fff" : T.text,
                          border: fietsDagen === d ? "none" : `1px solid ${T.border}`,
                          cursor: "pointer",
                        }}>{d === 7 ? "Week" : `${d} dag`}</button>
                      ))}
                    </div>
                  </div>

                  {/* Bike selector */}
                  <div style={{ fontFamily: T.sans, fontSize: 12, color: T.muted, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>Kies je fiets</div>
                  {FIETSEN.map(f => {
                    const qty = fietsSelection[f.id] || 0;
                    const isWeek = fietsDagen >= 7;
                    const price = isWeek ? f.week : f.dag;
                    const disabled = f.needsBike && !hasBikeSelected;
                    return (
                      <div key={f.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${T.border}`, opacity: disabled ? 0.4 : 1 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: T.sans, fontSize: 13, color: T.text, fontWeight: 400 }}>{f.naam}</div>
                          <div style={{ fontFamily: T.sans, fontSize: 11, color: T.muted, fontWeight: 300 }}>€ {price.toFixed(2)} / {isWeek ? "week" : "dag"}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                          <button disabled={disabled || qty === 0} onClick={() => setFietsSelection(p => ({ ...p, [f.id]: Math.max(0, qty - 1) }))}
                            style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${T.border}`, background: T.card, fontSize: 15, color: T.text, cursor: disabled || qty === 0 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                          <span style={{ fontFamily: T.sans, fontSize: 15, fontWeight: 500, width: 18, textAlign: "center" }}>{qty}</span>
                          <button disabled={disabled} onClick={() => setFietsSelection(p => ({ ...p, [f.id]: qty + 1 }))}
                            style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: disabled ? T.border : T.green, fontSize: 15, color: "#fff", cursor: disabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ fontFamily: T.sans, fontSize: 10, color: T.muted, fontWeight: 300, marginTop: 8 }}>* Zitje uitsluitend in combinatie met huurfiets · Legitimatie verplicht</div>
                  <div style={{ background: "rgba(180,154,94,.08)", borderRadius: 10, padding: "9px 12px", marginTop: 10, fontFamily: T.sans, fontSize: 11, color: T.gold }}>
                    ⏰ Reservering minimaal 24 uur van tevoren gewenst
                  </div>

                  {/* Total + Book button */}
                  {fietsTotal > 0 && showForm !== "fiets" && (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderTop: `2px solid ${T.border}`, marginTop: 12 }}>
                        <span style={{ fontFamily: T.sans, fontSize: 15, fontWeight: 500 }}>Totaal</span>
                        <span style={{ fontFamily: T.sans, fontSize: 18, fontWeight: 600, color: T.green }}>€ {fietsTotal.toFixed(2)}</span>
                      </div>
                      <button onClick={() => setShowForm("fiets")} style={{
                        width: "100%", padding: 14, borderRadius: 14, border: "none", background: T.green, color: "#fff",
                        fontFamily: T.sans, fontSize: 15, fontWeight: 500, cursor: "pointer",
                      }}>Reserveren & afrekenen</button>
                    </>
                  )}

                  {/* ═══ FIETS BOOKING FORM ═══ */}
                  {showForm === "fiets" && fietsTotal > 0 && (
                    <div style={{ marginTop: 14, padding: "16px 0 0", borderTop: `2px solid ${T.border}`, animation: "fadeUp .25s ease both" }}>
                      {/* Order summary */}
                      <div style={{ background: "rgba(47,79,62,.04)", borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
                        <div style={{ fontFamily: T.sans, fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8, fontWeight: 500 }}>Je reservering</div>
                        <div style={{ fontFamily: T.sans, fontSize: 13, color: T.text, fontWeight: 400, marginBottom: 4 }}>{fietsSummary}</div>
                        <div style={{ fontFamily: T.sans, fontSize: 12, color: T.muted, fontWeight: 300 }}>{fietsDagen} {fietsDagen === 1 ? "dag" : fietsDagen === 7 ? "week" : "dagen"}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, paddingTop: 8, borderTop: `1px solid ${T.border}` }}>
                          <span style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 500 }}>Totaal</span>
                          <span style={{ fontFamily: T.sans, fontSize: 16, fontWeight: 600, color: T.green }}>€ {fietsTotal.toFixed(2)}</span>
                        </div>
                      </div>

                      <div style={{ fontFamily: T.sans, fontSize: 12, color: T.muted, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 10 }}>Jouw gegevens</div>
                      <input value={gastNaam} onChange={e => setGastNaam(e.target.value)} placeholder="Naam" style={{ ...inputStyle, marginBottom: 8 }} />
                      <input value={gastEmail} onChange={e => setGastEmail(e.target.value)} placeholder="E-mailadres" type="email" style={{ ...inputStyle, marginBottom: 8 }} />
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontFamily: T.sans, fontSize: 12, color: T.muted, fontWeight: 300, marginBottom: 4 }}>Gewenste datum ophalen</div>
                        <input value={gastDatum} onChange={e => setGastDatum(e.target.value)} type="date" min={minDate}
                          style={{ ...inputStyle }} />
                      </div>

                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => setShowForm(null)} style={{ flex: 1, padding: 12, borderRadius: 12, border: `1px solid ${T.border}`, background: T.card, fontFamily: T.sans, fontSize: 13, color: T.muted, cursor: "pointer" }}>Annuleren</button>
                        <button
                          onClick={() => startPayment("fiets", fietsTotal, { fietsen: fietsSelection, dagen: fietsDagen, datum: gastDatum })}
                          disabled={!gastNaam.trim() || !gastEmail.includes("@") || !gastDatum || sending}
                          style={{
                            flex: 2, padding: 12, borderRadius: 12, border: "none",
                            background: gastNaam.trim() && gastEmail.includes("@") && gastDatum && !sending ? T.green : T.border,
                            fontFamily: T.sans, fontSize: 13, fontWeight: 500, color: "#fff",
                            cursor: gastNaam.trim() && gastEmail.includes("@") && gastDatum && !sending ? "pointer" : "not-allowed",
                          }}
                        >
                          {sending ? "Doorsturen..." : `Afrekenen · € ${fietsTotal.toFixed(2)}`}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {confirmed && (
        <div style={{
          marginTop: 20, padding: "14px 16px", borderRadius: 14,
          background: "rgba(47,79,62,.06)", border: "1px solid rgba(47,79,62,.15)",
          animation: "fadeUp .3s ease both",
        }}>
          <div style={{ fontFamily: T.sans, fontSize: 14, color: T.green, fontWeight: 500, display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <IcCheck /> Boeking ontvangen
          </div>
          <div style={{ fontFamily: T.sans, fontSize: 12, color: T.muted, fontWeight: 300 }}>
            Je ontvangt een bevestiging per e-mail.
          </div>
        </div>
      )}
    </div>
  );
}
