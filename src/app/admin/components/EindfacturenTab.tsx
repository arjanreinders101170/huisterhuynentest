"use client";
import { useMemo, useState } from "react";
import { Stay, FeeTemplate } from "../types";
import {
  berekenEindfactuur, standaardAan, telNachten,
  STATUS_LABELS, type EindfactuurStatus, type FeeSjabloon,
} from "@/lib/eindfactuur";

const C = { bg: "#F5F3EE", card: "#fff", border: "#E8E4DC", text: "#2A2418", muted: "#8A7D6A", light: "#B4AFA5", green: "#2F4F3E", gold: "#B49A5E", rood: "#9B3B2E", blauw: "#2F4F6F" };

const STATUS_KLEUR: Record<EindfactuurStatus, string> = {
  open: C.gold, verstuurd: C.blauw, voldaan: C.green, nvt: C.light,
};

const LODGE_LABEL: Record<string, string> = { lodge_1: "De Heide", lodge_2: "De Eik" };

function datum(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
}

function euro(n: number): string {
  return `€ ${n.toFixed(2)}`;
}

export function EindfacturenTab({ stays, setStays, feeTemplates }: {
  stays: Stay[];
  setStays: (s: Stay[]) => void;
  feeTemplates: FeeTemplate[];
}) {
  const [toonAlles, setToonAlles] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  /* Alleen boekingen via Booking.com: bij een directe boeking zijn schoonmaak
   * en toeristenbelasting al in de offerte meegenomen en afgerekend. */
  const rijen = useMemo(() => {
    return stays
      .filter(s => s.bron === "booking_com" && s.status !== "geannuleerd")
      .filter(s => toonAlles || (s.eindfactuur_status ?? "open") === "open")
      .sort((a, b) => (a.check_out || "").localeCompare(b.check_out || ""));
  }, [stays, toonAlles]);

  const actieveSjablonen = useMemo(
    () => feeTemplates.filter(f => f.actief) as unknown as FeeSjabloon[],
    [feeTemplates],
  );

  const nogTeFactureren = stays
    .filter(s => s.bron === "booking_com" && s.status !== "geannuleerd" && (s.eindfactuur_status ?? "open") === "open")
    .reduce((som, s) => som + Number(s.eindfactuur_totaal || 0), 0);

  const zonderPersonen = stays.filter(
    s => s.bron === "booking_com" && s.status !== "geannuleerd" && !s.personen,
  ).length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 500, color: C.text, margin: 0 }}>Eindfacturen</h2>
          <div style={{ fontSize: 13, color: C.light, marginTop: 4 }}>
            Bedlinnen, eindschoonmaak en toeristenbelasting bij Booking.com-boekingen
          </div>
        </div>
        <button
          onClick={() => setToonAlles(v => !v)}
          style={{ padding: "9px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.card, color: C.muted, fontSize: 13, cursor: "pointer" }}
        >
          {toonAlles ? "Alleen openstaande" : "Ook afgehandelde"}
        </button>
      </div>

      <div style={{ background: "#EEF2F7", borderRadius: 10, padding: "14px 18px", fontSize: 13, color: C.text, lineHeight: 1.6, marginBottom: 20 }}>
        Booking.com rekent alleen het logies met de gast af. Wat hieronder staat, moet
        er nog zelf uit — de tarieven komen uit <strong>Dynamic Pricing → Toeslagen</strong>,
        dus daar pas je ze aan.
        {zonderPersonen > 0 && (
          <>
            {" "}Bij <strong>{zonderPersonen}</strong> {zonderPersonen === 1 ? "boeking" : "boekingen"} ontbreekt
            nog het aantal personen; de export van Booking.com bevat dat niet, en zonder
            dat getal is de toeristenbelasting niet te berekenen.
          </>
        )}
      </div>

      {nogTeFactureren > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px", marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: C.light, textTransform: "uppercase", letterSpacing: .4 }}>Nog te factureren</div>
          <div style={{ fontSize: 24, fontWeight: 600, color: C.gold, marginTop: 4 }}>{euro(nogTeFactureren)}</div>
        </div>
      )}

      {rijen.length === 0 ? (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 28, textAlign: "center", fontSize: 13, color: C.light }}>
          {toonAlles
            ? "Nog geen Booking.com-boekingen geïmporteerd."
            : "Niets meer te factureren."}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rijen.map(s => (
            <EindfactuurKaart
              key={s.id}
              stay={s}
              sjablonen={actieveSjablonen}
              uitgeklapt={open === s.id}
              onKlap={() => setOpen(open === s.id ? null : s.id)}
              onOpgeslagen={bijgewerkt => setStays(stays.map(x => x.id === bijgewerkt.id ? bijgewerkt : x))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EindfactuurKaart({ stay, sjablonen, uitgeklapt, onKlap, onOpgeslagen }: {
  stay: Stay;
  sjablonen: FeeSjabloon[];
  uitgeklapt: boolean;
  onKlap: () => void;
  onOpgeslagen: (s: Stay) => void;
}) {
  const nachten = telNachten(stay.check_in, stay.check_out);
  const [personen, setPersonen] = useState(stay.personen ? String(stay.personen) : "");
  const [status, setStatus] = useState<EindfactuurStatus>(stay.eindfactuur_status ?? "open");
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState("");

  /* Bij een verblijf dat al eens is vastgelegd volgen we die keuze; anders de
   * standaard (schoonmaak, bedlinnen en belastingen aan, de rest uit). */
  const [gekozen, setGekozen] = useState<Set<string>>(() => {
    const eerder = stay.eindfactuur_regels;
    if (eerder && eerder.length > 0) return new Set(eerder.map(r => r.fee_template_id));
    return new Set(sjablonen.filter(standaardAan).map(f => f.id));
  });

  const aantalPersonen = Number(personen) || 0;
  const { regels, totaal, overgeslagen } = useMemo(
    () => berekenEindfactuur(sjablonen, nachten, aantalPersonen, gekozen),
    [sjablonen, nachten, aantalPersonen, gekozen],
  );

  const vastgelegd = Number(stay.eindfactuur_totaal || 0);
  const afwijkend = stay.eindfactuur_bijgewerkt_op != null && Math.abs(vastgelegd - totaal) >= 0.005;

  const bewaar = async () => {
    setBezig(true); setFout("");
    try {
      const r = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_eindfactuur",
          id: stay.id,
          personen: aantalPersonen,
          gekozen: [...gekozen],
          status,
        }),
      });
      const d = await r.json();
      if (!r.ok) setFout(d.error || "Opslaan mislukt");
      else {
        onOpgeslagen({
          ...stay,
          personen: aantalPersonen > 0 ? aantalPersonen : null,
          eindfactuur_regels: d.regels,
          eindfactuur_totaal: d.totaal,
          eindfactuur_status: status,
          eindfactuur_bijgewerkt_op: new Date().toISOString(),
        });
      }
    } catch { setFout("Opslaan mislukt"); }
    setBezig(false);
  };

  const huidigeStatus: EindfactuurStatus = stay.eindfactuur_status ?? "open";
  const inputStyle: React.CSSProperties = {
    padding: "8px 12px", borderRadius: 8, border: `1px solid ${C.border}`,
    background: C.card, fontSize: 13, color: C.text, outline: "none",
  };

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
      <div
        onClick={onKlap}
        style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, cursor: "pointer", flexWrap: "wrap" }}
      >
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 500, fontSize: 14, color: C.text }}>{stay.gast_naam || stay.guests?.naam || "Gast"}</span>
            <span style={{ background: `${STATUS_KLEUR[huidigeStatus]}1A`, color: STATUS_KLEUR[huidigeStatus], fontSize: 11, padding: "2px 8px", borderRadius: 6, fontWeight: 500 }}>
              {STATUS_LABELS[huidigeStatus]}
            </span>
            <span style={{ fontSize: 12, color: C.light }}>{LODGE_LABEL[stay.lodge] ?? stay.lodge}</span>
          </div>
          <div style={{ fontSize: 12, color: C.muted }}>
            {datum(stay.check_in)} – {datum(stay.check_out)} · {nachten} {nachten === 1 ? "nacht" : "nachten"}
            {stay.personen ? ` · ${stay.personen} ${stay.personen === 1 ? "persoon" : "personen"}` : " · aantal personen onbekend"}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: stay.eindfactuur_bijgewerkt_op ? C.text : C.light }}>
            {stay.eindfactuur_bijgewerkt_op ? euro(vastgelegd) : "nog niet bepaald"}
          </div>
          <div style={{ fontSize: 11, color: C.light, marginTop: 2 }}>{uitgeklapt ? "inklappen" : "bekijk en pas aan"}</div>
        </div>
      </div>

      {uitgeklapt && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "18px 20px", background: C.bg }}>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 18 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Aantal personen</label>
              <input
                type="number" min={0} max={20} value={personen}
                onChange={e => setPersonen(e.target.value)}
                placeholder="bijv. 4"
                style={{ ...inputStyle, width: 110 }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, color: C.muted, marginBottom: 4 }}>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as EindfactuurStatus)} style={{ ...inputStyle, width: 190 }}>
                {(Object.keys(STATUS_LABELS) as EindfactuurStatus[]).map(k => (
                  <option key={k} value={k}>{STATUS_LABELS[k]}</option>
                ))}
              </select>
            </div>
          </div>

          {aantalPersonen === 0 && (
            <div style={{ background: "#FDF6F0", border: `1px solid ${C.gold}55`, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: C.text, marginBottom: 14 }}>
              Vul het aantal personen in — zonder dat blijven de posten per persoon leeg.
            </div>
          )}

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden", marginBottom: 14 }}>
            {sjablonen.length === 0 ? (
              <div style={{ padding: 16, fontSize: 12, color: C.light }}>
                Geen actieve toeslagen. Zet ze aan bij Dynamic Pricing → Toeslagen.
              </div>
            ) : sjablonen.map(f => {
              const regel = regels.find(r => r.fee_template_id === f.id);
              const aan = gekozen.has(f.id);
              return (
                <label
                  key={f.id}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", borderBottom: `1px solid ${C.border}`, cursor: "pointer", fontSize: 13 }}
                >
                  <input
                    type="checkbox"
                    checked={aan}
                    onChange={() => setGekozen(prev => {
                      const next = new Set(prev);
                      if (next.has(f.id)) next.delete(f.id); else next.add(f.id);
                      return next;
                    })}
                  />
                  <span style={{ flex: 1, color: aan ? C.text : C.light }}>{f.label}</span>
                  <span style={{ fontSize: 12, color: C.light }}>{regel?.berekening ?? ""}</span>
                  <span style={{ minWidth: 80, textAlign: "right", color: aan ? C.text : C.light, fontWeight: aan ? 500 : 400 }}>
                    {regel ? euro(regel.bedrag) : "—"}
                  </span>
                </label>
              );
            })}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "13px 16px", fontSize: 14, fontWeight: 600, color: C.text }}>
              <span>Totaal eindfactuur</span>
              <span>{euro(totaal)}</span>
            </div>
          </div>

          {overgeslagen.length > 0 && (
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 14, lineHeight: 1.6 }}>
              Niet meegerekend: {overgeslagen.map(o => `${o.label} (${o.reden})`).join(" · ")}
            </div>
          )}

          {afwijkend && (
            <div style={{ background: "#FDF6F0", border: `1px solid ${C.gold}55`, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: C.text, marginBottom: 14 }}>
              Vastgelegd staat {euro(vastgelegd)}, nu wordt {euro(totaal)} berekend — een tarief
              of het aantal personen is sindsdien gewijzigd. Opslaan legt het nieuwe bedrag vast.
            </div>
          )}

          {fout && <div style={{ color: C.rood, fontSize: 13, marginBottom: 12 }}>{fout}</div>}

          <button
            onClick={bewaar}
            disabled={bezig}
            style={{
              padding: "10px 20px", borderRadius: 8, border: "none",
              background: C.green, color: "#fff", fontSize: 13, fontWeight: 500,
              cursor: bezig ? "default" : "pointer", opacity: bezig ? 0.6 : 1,
            }}
          >
            {bezig ? "Opslaan…" : "Vastleggen"}
          </button>
        </div>
      )}
    </div>
  );
}
