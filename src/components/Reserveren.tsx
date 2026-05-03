"use client";
import { useState } from "react";
import { T, cardStyle, iconBox } from "@/data/tokens";
import { IcBike, IcLotus, IcFork, IcClock, IcLeaf, IcHeart, IcCheck, IcGift, IcBasket, IcArrow } from "./icons";

type Upsell = { id: string; title: string; sub: string; price: string };
type Props = { booked: string | null; onBook: (p: string) => void; upsells: Upsell[] };
type PicnicProduct = { searchTerm: string; productId: string | null; name: string; price: number; unit: string };

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
  const [picnicProducts, setPicnicProducts] = useState<PicnicProduct[]>([]);
  const [picnicLoading, setPicnicLoading] = useState(false);
  const [picnicStep, setPicnicStep] = useState<"idle" | "products" | "ordered">("idle");

  const isPackage = (id: string) => id === "welkomst" || id === "boodschappen";
  const packageItems = (id: string) => id === "welkomst" ? WELKOMST_ITEMS : BOODSCHAPPEN_ITEMS;

  /* ═══ PICNIC: Search for products ═══ */
  const searchPicnic = async (packageId: string) => {
    setPicnicLoading(true);
    setPicnicStep("idle");
    try {
      const r = await fetch("/api/picnic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "search", packageId }),
      });
      const d = await r.json();
      if (d.available && d.products) {
        setPicnicProducts(d.products);
        setPicnicStep("products");
      } else {
        // Picnic not configured — fallback to manual
        setPicnicStep("idle");
        window.open("https://picnic.app/nl/", "_blank");
      }
    } catch {
      window.open("https://picnic.app/nl/", "_blank");
    }
    setPicnicLoading(false);
  };

  /* ═══ PICNIC: Add to cart ═══ */
  const orderPicnic = async () => {
    setPicnicLoading(true);
    try {
      const products = picnicProducts
        .filter(p => p.productId)
        .map(p => ({ productId: p.productId, name: p.name, quantity: 1 }));

      const r = await fetch("/api/picnic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add-to-cart", products }),
      });
      const d = await r.json();
      if (d.success) {
        setPicnicStep("ordered");
      }
    } catch {}
    setPicnicLoading(false);
  };

  const resetPicnic = () => {
    setPicnicStep("idle");
    setPicnicProducts([]);
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
          const isExp = expanded === u.id;
          const isDone = booked === u.title;

          return (
            <div key={u.id} style={{
              ...cardStyle, padding: 0, overflow: "hidden",
              border: isExp ? `1px solid ${T.gold}` : `1px solid ${T.border}`,
              transition: "border-color .2s ease",
            }}>
              {/* Main row */}
              <div
                onClick={() => {
                  if (isPkg) {
                    setExpanded(isExp ? null : u.id);
                    resetPicnic();
                  }
                }}
                style={{
                  padding: 18, display: "flex", alignItems: "center", gap: 16,
                  cursor: isPkg ? "pointer" : "default",
                }}
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
                    <button onClick={() => onBook(u.title)} style={{
                      padding: "7px 14px", borderRadius: 10, fontFamily: T.sans, fontSize: 12,
                      cursor: "pointer", fontWeight: 500,
                      background: isDone ? T.green : "transparent",
                      color: isDone ? "#fff" : T.green,
                      border: isDone ? "none" : `1px solid ${T.green}`,
                    }}>{isDone ? "✓ Geboekt" : "Boek"}</button>
                  )}
                  {isPkg && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.gold} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 4, transition: "transform .2s ease", transform: isExp ? "rotate(90deg)" : "rotate(0deg)" }}>
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Expanded package detail */}
              {isPkg && isExp && (
                <div style={{ padding: "0 18px 18px", borderTop: `1px solid ${T.border}`, animation: "fadeUp .25s ease both" }}>

                  {/* Package contents */}
                  {picnicStep === "idle" && (
                    <>
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
                      <button onClick={() => onBook(u.title)} style={{
                        width: "100%", padding: 14, borderRadius: 14, border: "none",
                        background: isDone ? "rgba(47,79,62,.08)" : T.green,
                        color: isDone ? T.green : "#fff",
                        fontFamily: T.sans, fontSize: 15, fontWeight: 500,
                        cursor: isDone ? "default" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10,
                      }}>
                        {isDone ? <><IcCheck /> Besteld — wij regelen het</> : <><IcGift /> Bestel via ons · {u.price}</>}
                      </button>

                      {/* CTA: Picnic */}
                      <button
                        onClick={() => searchPicnic(u.id)}
                        disabled={picnicLoading}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                          width: "100%", padding: 13, borderRadius: 14,
                          border: `1px solid ${T.border}`, background: T.card,
                          fontFamily: T.sans, fontSize: 13, fontWeight: 400, color: T.text,
                          cursor: picnicLoading ? "not-allowed" : "pointer",
                        }}
                      >
                        {picnicLoading ? "Producten zoeken..." : "Of bestel zelf via Picnic"}
                        {!picnicLoading && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                        )}
                      </button>

                      <p style={{ fontFamily: T.sans, fontSize: 11, color: T.muted, fontWeight: 300, marginTop: 10, textAlign: "center", lineHeight: 1.4 }}>
                        {u.id === "welkomst" ? "Het pakket staat klaar bij aankomst." : "Picnic bezorgt gratis in Drenthe. Bestel min. 1 dag van tevoren."}
                      </p>
                    </>
                  )}

                  {/* Picnic product results */}
                  {picnicStep === "products" && (
                    <>
                      <div style={{ padding: "14px 0 6px" }}>
                        <div style={{ fontFamily: T.sans, fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 10, fontWeight: 500 }}>
                          Gevonden op Picnic
                        </div>
                        {picnicProducts.map((p, i) => (
                          <div key={i} style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "9px 0", borderBottom: i < picnicProducts.length - 1 ? `1px solid ${T.border}` : "none",
                          }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontFamily: T.sans, fontSize: 13, color: p.productId ? T.text : T.muted, fontWeight: 300 }}>
                                {p.name}
                              </div>
                              {p.unit && <div style={{ fontFamily: T.sans, fontSize: 10, color: T.muted, fontWeight: 300 }}>{p.unit}</div>}
                            </div>
                            <div style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 500, color: p.productId ? T.green : T.muted, flexShrink: 0 }}>
                              {p.productId ? `€ ${(p.price / 100).toFixed(2)}` : "—"}
                            </div>
                          </div>
                        ))}
                        <div style={{
                          display: "flex", justifyContent: "space-between",
                          padding: "12px 0 0", marginTop: 4,
                          borderTop: `2px solid ${T.border}`,
                        }}>
                          <div style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 500, color: T.text }}>Totaal</div>
                          <div style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 600, color: T.green }}>
                            € {(picnicProducts.filter(p => p.productId).reduce((sum, p) => sum + p.price, 0) / 100).toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={orderPicnic}
                        disabled={picnicLoading}
                        style={{
                          width: "100%", padding: 14, borderRadius: 14, border: "none",
                          background: T.green, color: "#fff",
                          fontFamily: T.sans, fontSize: 15, fontWeight: 500,
                          cursor: picnicLoading ? "not-allowed" : "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                          marginTop: 14, marginBottom: 8,
                        }}
                      >
                        {picnicLoading ? "Bestelling plaatsen..." : <><IcBasket /> Toevoegen aan Picnic winkelwagen</>}
                      </button>

                      <button onClick={resetPicnic} style={{
                        width: "100%", background: "none", border: "none",
                        fontFamily: T.sans, fontSize: 12, color: T.muted, fontWeight: 300,
                        cursor: "pointer", padding: 8,
                      }}>
                        Terug
                      </button>
                    </>
                  )}

                  {/* Order confirmed */}
                  {picnicStep === "ordered" && (
                    <div style={{ padding: "20px 0", textAlign: "center", animation: "fadeUp .3s ease both" }}>
                      <div style={{ color: T.green, marginBottom: 12 }}><IcCheck /></div>
                      <div style={{ fontFamily: T.serif, fontSize: 17, fontWeight: 600, color: T.text, marginBottom: 6 }}>
                        Toegevoegd aan je Picnic mandje!
                      </div>
                      <p style={{ fontFamily: T.sans, fontSize: 13, color: T.muted, fontWeight: 300, lineHeight: 1.5, margin: "0 0 16px" }}>
                        Open de Picnic app om een bezorgmoment te kiezen en af te rekenen.
                      </p>
                      <a
                        href="https://picnic.app/nl/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 8,
                          padding: "12px 24px", borderRadius: 14, background: T.green,
                          color: "#fff", textDecoration: "none",
                          fontFamily: T.sans, fontSize: 14, fontWeight: 500,
                        }}
                      >
                        Open Picnic
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {booked && (
        <div style={{
          marginTop: 20, padding: "14px 16px", borderRadius: 12,
          background: "rgba(47,79,62,.06)", border: "1px solid rgba(47,79,62,.15)",
          fontFamily: T.sans, fontSize: 13, color: T.green,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <IcCheck /> <strong>{booked}</strong> is geboekt. We nemen contact op ter bevestiging.
        </div>
      )}
    </div>
  );
}
