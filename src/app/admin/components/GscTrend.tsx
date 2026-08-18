"use client";
import { useState, useMemo, useRef } from "react";

/* ═══ Verloop per maand ═══
 * Drie kleine grafieken onder één maand-as in plaats van één grafiek met twee
 * assen: vertoningen (~1.800), klikken (~3) en positie (~49) verschillen zo
 * sterk van schaal dat ze samen niets laten zien.
 *
 * De positiegrafiek heeft een omgekeerde as — bij zoekposities is lager beter.
 */

const C = {
  card: "#fff", border: "#E5E7EB", text: "#111827", muted: "#6B7280", light: "#9CA3AF",
  lijn: "#2F4F3E",      // haalt 3:1 tegen wit; het merkgoud niet, dus geen datakleur
  raster: "#EEF0F2",
};

export interface MaandPunt {
  maand: string;
  vertoningen: number;
  klikken: number;
  positie: number;
  nietMerkKlikken?: number;
}

export interface Reeks {
  maanden: string[];
  totaal: MaandPunt[];
  clusters: string[];
  perCluster: Record<string, MaandPunt[]>;
}

const MND_KORT = ["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"];

function kortLabel(iso: string): string {
  const [jaar, maand] = iso.split("-");
  return `${MND_KORT[Number(maand) - 1]} '${jaar.slice(2)}`;
}

const STAPPEN = [1, 2, 2.5, 5, 10];

/** Rondt een asgrens af op een leesbaar getal (1, 2, 2,5 of 5 × macht van tien).
 *  Zonder dit staan er waarden als 2.178 op de as, wat onbedacht oogt. */
function netteGrens(waarde: number, naarBoven: boolean): number {
  if (waarde === 0) return 0;
  const macht = Math.pow(10, Math.floor(Math.log10(Math.abs(waarde))));
  const rest = waarde / macht;
  const keuze = naarBoven
    ? STAPPEN.find(s => s >= rest - 1e-9) ?? 10
    : [...STAPPEN].reverse().find(s => s <= rest + 1e-9) ?? 1;
  return keuze * macht;
}

/** Een nette stapgrootte voor een bereik dat niet bij nul begint. */
function netteStap(bereik: number): number {
  if (bereik <= 0) return 1;
  const macht = Math.pow(10, Math.floor(Math.log10(bereik)));
  const rest = bereik / macht;
  return (STAPPEN.find(s => s >= rest - 1e-9) ?? 10) * macht;
}

const B = { boven: 16, onder: 26, links: 44, rechts: 14 };
const BREEDTE = 800, HOOGTE = 150;

interface GrafiekProps {
  titel: string;
  toelichting?: string;
  punten: MaandPunt[];
  waarde: (p: MaandPunt) => number;
  omgekeerd?: boolean;          // lager is beter (positie)
  formatteer: (v: number) => string;
  actief: number | null;
  onHover: (i: number | null) => void;
}

function Grafiek({ titel, toelichting, punten, waarde, omgekeerd, formatteer, actief, onHover }: GrafiekProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const waarden = punten.map(waarde);
  const max = Math.max(...waarden, omgekeerd ? 0 : 1);
  const min = omgekeerd ? Math.min(...waarden.filter(v => v > 0), max) : 0;

  // Bij posities begint de as niet bij nul: die ligt rond de data zelf, anders
  // wordt een lijn die tussen 49 en 52 beweegt platgedrukt op een as 0–100.
  // Afronden gebeurt dan op een stap die bij het bereik past, niet op een macht
  // van tien.
  let boven: number, onder: number;
  if (omgekeerd) {
    const marge = Math.max((max - min) * 0.25, 1);
    const stap = netteStap((max + marge - (min - marge)) / 2);
    boven = Math.max(1, Math.floor((min - marge) / stap) * stap);
    onder = Math.ceil((max + marge) / stap) * stap;
  } else {
    boven = netteGrens(max * 1.1, true);
    onder = 0;
  }

  const x = (i: number) => B.links + (i / Math.max(1, punten.length - 1)) * (BREEDTE - B.links - B.rechts);
  const y = (v: number) => {
    const bereik = onder - boven || 1;
    const t = (v - boven) / bereik;                       // 0 = beste, 1 = slechtste
    return B.boven + t * (HOOGTE - B.boven - B.onder);
  };

  const lijn = punten.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(waarde(p)).toFixed(1)}`).join(" ");
  const vlak = `${lijn} L${x(punten.length - 1).toFixed(1)},${HOOGTE - B.onder} L${x(0).toFixed(1)},${HOOGTE - B.onder} Z`;

  // Assemerken: eerste, laatste en elke derde maand — 16 labels passen niet.
  const toonLabel = (i: number) => i === 0 || i === punten.length - 1 || i % 3 === 0;

  const raakVlak = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const doos = svg.getBoundingClientRect();
    const px = ((e.clientX - doos.left) / doos.width) * BREEDTE;
    const stap = (BREEDTE - B.links - B.rechts) / Math.max(1, punten.length - 1);
    const i = Math.round((px - B.links) / stap);
    onHover(i >= 0 && i < punten.length ? i : null);
  };

  const laatste = punten.length - 1;

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: C.text }}>{titel}</span>
        {toelichting && <span style={{ fontSize: 11, color: C.light }}>{toelichting}</span>}
      </div>
      <svg
        ref={svgRef} viewBox={`0 0 ${BREEDTE} ${HOOGTE}`} width="100%"
        style={{ display: "block", overflow: "visible" }}
        onMouseMove={raakVlak} onMouseLeave={() => onHover(null)}
        role="img" aria-label={`${titel} per maand`}
      >
        {/* Rasterlijnen op drie niveaus, bewust ingetogen */}
        {[0, 0.5, 1].map(f => {
          const yy = B.boven + f * (HOOGTE - B.boven - B.onder);
          const v = boven + f * (onder - boven);
          return (
            <g key={f}>
              <line x1={B.links} x2={BREEDTE - B.rechts} y1={yy} y2={yy} stroke={C.raster} strokeWidth={1} />
              <text x={B.links - 7} y={yy + 3.5} textAnchor="end" fontSize={10} fill={C.light}>
                {formatteer(v)}
              </text>
            </g>
          );
        })}

        <path d={vlak} fill={C.lijn} opacity={0.07} />
        <path d={lijn} fill="none" stroke={C.lijn} strokeWidth={2}
              strokeLinejoin="round" strokeLinecap="round" />

        {/* Laatste punt krijgt een markering plus waarde: één direct label, niet allemaal */}
        <circle cx={x(laatste)} cy={y(waarde(punten[laatste]))} r={4}
                fill={C.lijn} stroke="#fff" strokeWidth={2} />

        {actief !== null && actief >= 0 && actief < punten.length && (
          <g>
            <line x1={x(actief)} x2={x(actief)} y1={B.boven} y2={HOOGTE - B.onder}
                  stroke={C.lijn} strokeWidth={1} opacity={0.35} />
            <circle cx={x(actief)} cy={y(waarde(punten[actief]))} r={4.5}
                    fill={C.lijn} stroke="#fff" strokeWidth={2} />
          </g>
        )}

        {punten.map((p, i) => toonLabel(i) && (
          <text key={p.maand} x={x(i)} y={HOOGTE - 8} textAnchor="middle" fontSize={10} fill={C.light}>
            {kortLabel(p.maand)}
          </text>
        ))}
      </svg>
    </div>
  );
}

export function GscTrend({ reeks }: { reeks: Reeks }) {
  const [cluster, setCluster] = useState<string>("__alle");
  const [actief, setActief] = useState<number | null>(null);
  const [alsTabel, setAlsTabel] = useState(false);

  const punten = useMemo(
    () => (cluster === "__alle" ? reeks.totaal : reeks.perCluster[cluster] ?? []),
    [cluster, reeks],
  );

  if (punten.length < 2) {
    return null;   // met één maand valt er niets te verlopen
  }

  const kaart: React.CSSProperties = {
    background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 20px",
  };

  const gekozen = actief !== null && actief >= 0 && actief < punten.length ? punten[actief] : null;
  // Zolang elke klik merkgebonden is, zegt de klikgrafiek iets anders dan je denkt.
  const klikNoot = cluster === "__alle" && punten.every(p => (p.nietMerkKlikken ?? 0) === 0)
    ? "alle klikken merkgebonden"
    : undefined;

  return (
    <div style={{ ...kaart, marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Verloop per maand</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
            {punten.length} maanden · beweeg over de grafiek voor de cijfers van één maand
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <select
            value={cluster} onChange={e => setCluster(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${C.border}`,
              fontSize: 12.5, fontFamily: "inherit", background: C.card, color: C.text }}
          >
            <option value="__alle">Alle clusters</option>
            {reeks.clusters.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button
            onClick={() => setAlsTabel(v => !v)}
            style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${C.border}`,
              fontSize: 12.5, fontWeight: 500, fontFamily: "inherit", cursor: "pointer",
              background: alsTabel ? "#F3F4F6" : C.card, color: C.text }}
          >
            {alsTabel ? "Toon grafiek" : "Toon tabel"}
          </button>
        </div>
      </div>

      {/* Wat er onder de muis zit — vaste plek, zodat de grafieken niet verspringen */}
      <div style={{ minHeight: 22, marginBottom: 6, fontSize: 12.5,
        color: gekozen ? C.text : C.light, fontVariantNumeric: "tabular-nums" }}>
        {gekozen ? (
          <>
            <strong>{kortLabel(gekozen.maand)}</strong>
            {"  ·  "}{gekozen.vertoningen.toLocaleString("nl-NL")} vertoningen
            {"  ·  "}{gekozen.klikken} {gekozen.klikken === 1 ? "klik" : "klikken"}
            {"  ·  positie "}{gekozen.positie.toFixed(1)}
          </>
        ) : "Beweeg over een grafiek om één maand te lezen"}
      </div>

      {alsTabel ? (
        <div style={{ overflowX: "auto", border: `1px solid ${C.border}`, borderRadius: 9 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5,
            fontVariantNumeric: "tabular-nums" }}>
            <thead>
              <tr style={{ background: "#F9FAFB" }}>
                {["Maand", "Vertoningen", "Klikken", "Positie"].map((h, i) => (
                  <th key={h} style={{ textAlign: i === 0 ? "left" : "right", padding: "8px 12px",
                    fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase",
                    letterSpacing: ".04em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {punten.map(p => (
                <tr key={p.maand} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: "7px 12px" }}>{kortLabel(p.maand)}</td>
                  <td style={{ padding: "7px 12px", textAlign: "right" }}>{p.vertoningen.toLocaleString("nl-NL")}</td>
                  <td style={{ padding: "7px 12px", textAlign: "right" }}>{p.klikken}</td>
                  <td style={{ padding: "7px 12px", textAlign: "right" }}>{p.positie.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <Grafiek titel="Vertoningen" punten={punten} waarde={p => p.vertoningen}
            formatteer={v => Math.round(v).toLocaleString("nl-NL")}
            actief={actief} onHover={setActief} />
          <Grafiek titel="Klikken" toelichting={klikNoot} punten={punten} waarde={p => p.klikken}
            formatteer={v => v.toLocaleString("nl-NL", { maximumFractionDigits: 1 })}
            actief={actief} onHover={setActief} />
          <Grafiek titel="Gewogen positie" toelichting="lager is beter" punten={punten}
            waarde={p => p.positie} omgekeerd
            formatteer={v => v.toLocaleString("nl-NL", { maximumFractionDigits: 1 })}
            actief={actief} onHover={setActief} />
        </>
      )}
    </div>
  );
}
