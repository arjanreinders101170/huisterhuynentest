"use client";
import { useState, useEffect, useMemo } from "react";
import {
  DOEL_BEZOEKERS, MIJLPALEN, KANAALMIX, KANAALMIX_TOTAAL, KANAALMIX_KOSTEN,
  SCENARIOS, mijlpaalVoor, type Scenario,
} from "@/lib/groeiplan";
import { KANAAL_LABEL, type Kanaal } from "@/lib/attributie";

const C = {
  bg: "#F7F8FA", card: "#fff", border: "#E5E7EB",
  text: "#111827", muted: "#6B7280", light: "#9CA3AF",
  green: "#2F4F3E", gold: "#B49A5E", rood: "#991B1B", groen: "#065F46",
};

interface MaandRij { maand: string; klikken: number; vertoningen: number }
interface KanaalTelling { kanaal: Kanaal; aanvragen: number; geboekt: number; omzet: number }
interface GroeiData {
  reeks: MaandRij[];
  kanalen: { tellingen: KanaalTelling[]; zonderHerkomst: number; totaal: number };
}

const euro = (n: number) => `€ ${n.toLocaleString("nl-NL")}`;
const getal = (n: number) => n.toLocaleString("nl-NL");

function maandLabel(maand: string): string {
  const d = new Date(`${maand.length === 7 ? `${maand}-01` : maand}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return maand;
  return d.toLocaleDateString("nl-NL", { month: "short", year: "2-digit", timeZone: "UTC" });
}

/* ── Bouwstenen ──────────────────────────────────────────────────────────── */

function Kaart({ titel, sub, children }: { titel: string; sub?: string; children: React.ReactNode }) {
  return (
    <section style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text }}>{titel}</h3>
      {sub && <p style={{ margin: "4px 0 16px", fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{sub}</p>}
      {!sub && <div style={{ height: 14 }} />}
      {children}
    </section>
  );
}

function Balk({ deel, kleur = C.green }: { deel: number; kleur?: string }) {
  const pct = Math.max(0, Math.min(100, deel * 100));
  return (
    <div style={{ height: 6, background: "#EEF0F3", borderRadius: 3, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: kleur, borderRadius: 3 }} />
    </div>
  );
}

/* ── Tab ─────────────────────────────────────────────────────────────────── */

export function GroeiTab() {
  const [data, setData] = useState<GroeiData | null>(null);
  const [laadt, setLaadt] = useState(true);
  const [scenarioId, setScenarioId] = useState<Scenario["id"]>("doelgericht");

  useEffect(() => {
    let afgebroken = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/data?table=groei");
        const json = await res.json();
        if (!afgebroken && json.data) setData(json.data as GroeiData);
      } catch { /* laat het scherm de lege staat tonen */ }
      if (!afgebroken) setLaadt(false);
    })();
    return () => { afgebroken = true; };
  }, []);

  const nuMaand = new Date().toISOString().slice(0, 7);
  const fase = mijlpaalVoor(nuMaand);
  const scenario = SCENARIOS.find(s => s.id === scenarioId)!;

  /* Het laatste volledige maandcijfer is onze stand. Search Console meet
   * alleen organisch verkeer, dus dit is bewust een ondergrens. */
  const laatste = data?.reeks.at(-1) ?? null;
  const vorige = data?.reeks.at(-2) ?? null;
  const stand = laatste?.klikken ?? 0;
  const groei = vorige && vorige.klikken > 0 ? (stand - vorige.klikken) / vorige.klikken : null;

  const maxKlikken = useMemo(
    () => Math.max(1, ...(data?.reeks ?? []).map(r => r.klikken)),
    [data],
  );

  const kanalen = data?.kanalen.tellingen ?? [];
  const kanaalTotaal = kanalen.reduce((s, k) => s + k.aanvragen, 0);

  return (
    <div style={{ maxWidth: 1000 }}>
      <header style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.text }}>
          Groei naar 10.000 bezoekers
        </h2>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: C.muted, lineHeight: 1.6, maxWidth: 720 }}>
          Het doel is 10.000 bezoekers per maand. Dat is meer dan nodig om twee lodges te vullen —
          en dat is precies de bedoeling: vraag boven capaciteit is prijsmacht, en het is de basis
          onder een derde lodge. De weg ernaartoe loopt via contentvolume, niet via advertentiebudget.
        </p>
      </header>

      {/* ── Stand van zaken ── */}
      <Kaart
        titel={`Stand — fase ${fase.titel.toLowerCase()} (${fase.periode})`}
        sub="Gemeten als organische klikken uit Search Console. Dat mist direct, social en betaald verkeer, dus het echte cijfer ligt hoger. Zodra GA4 draait komt het sessiecijfer hier te staan."
      >
        {laadt ? (
          <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Bezig met laden…</p>
        ) : !laatste ? (
          <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
            Nog geen Search Console-data. Haal die op via de tab Search Console — zonder die cijfers
            is de voortgang niet te volgen.
          </p>
        ) : (
          <>
            <div style={{ display: "flex", gap: 32, flexWrap: "wrap", marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>
                  {maandLabel(laatste.maand)}
                </div>
                <div style={{ fontSize: 30, fontWeight: 700, color: C.text, lineHeight: 1.2 }}>
                  {getal(stand)}
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>
                  bezoekers uit zoeken
                  {groei !== null && (
                    <span style={{ marginLeft: 6, color: groei >= 0 ? C.groen : C.rood, fontWeight: 600 }}>
                      {groei >= 0 ? "+" : ""}{Math.round(groei * 100)}%
                    </span>
                  )}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>
                  Doel deze fase
                </div>
                <div style={{ fontSize: 30, fontWeight: 700, color: C.gold, lineHeight: 1.2 }}>
                  {getal(fase.doel)}
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>
                  {stand >= fase.doel ? "gehaald" : `nog ${getal(fase.doel - stand)} te gaan`}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>
                  Einddoel
                </div>
                <div style={{ fontSize: 30, fontWeight: 700, color: C.green, lineHeight: 1.2 }}>
                  {getal(DOEL_BEZOEKERS)}
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>
                  {Math.round((stand / DOEL_BEZOEKERS) * 100)}% van de eindstreep
                </div>
              </div>
            </div>

            {/* Maandreeks — de vorm van de curve zegt meer dan het laatste cijfer. */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 90, marginBottom: 6 }}>
              {data!.reeks.map(r => (
                <div key={r.maand} title={`${maandLabel(r.maand)}: ${getal(r.klikken)} klikken`}
                  style={{ flex: 1, minWidth: 6, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%" }}>
                  <div style={{
                    height: `${Math.max(2, (r.klikken / maxKlikken) * 100)}%`,
                    background: r.maand === laatste.maand ? C.green : "#C7CDD4",
                    borderRadius: "2px 2px 0 0",
                  }} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.light }}>
              <span>{maandLabel(data!.reeks[0].maand)}</span>
              <span>{maandLabel(laatste.maand)}</span>
            </div>
          </>
        )}
      </Kaart>

      {/* ── Mijlpalen ── */}
      <Kaart
        titel="De ladder"
        sub="Vijf fases in ongeveer 24 maanden. Elke fase heeft een eigen reden van bestaan — een fase overslaan werkt niet, omdat een artikel pas na 6 tot 12 maanden zijn volle verkeer haalt."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {MIJLPALEN.map(m => {
            const actief = m.id === fase.id;
            const gehaald = stand >= m.doel;
            return (
              <div key={m.id} style={{
                padding: "14px 16px",
                background: actief ? "#F0F5F2" : "transparent",
                border: `1px solid ${actief ? C.green : "transparent"}`,
                borderRadius: 10,
              }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{m.titel}</span>
                  <span style={{ fontSize: 12, color: C.muted }}>{m.periode}</span>
                  <span style={{ marginLeft: "auto", fontSize: 15, fontWeight: 700, color: gehaald ? C.groen : C.gold }}>
                    {gehaald ? "✓ " : ""}{getal(m.doel)}
                  </span>
                </div>
                <p style={{ margin: "6px 0 8px", fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{m.waarom}</p>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: C.text, lineHeight: 1.8 }}>
                  {m.hefbomen.map(h => <li key={h}>{h}</li>)}
                </ul>
              </div>
            );
          })}
        </div>
      </Kaart>

      {/* ── Kanaalmix ── */}
      <Kaart
        titel="Waar de 10.000 vandaan komen"
        sub={`De mix bij het einddoel. Geen enkel kanaal is groter dan 38%, zodat een algoritmewijziging of een stopgezette campagne het geheel niet omver duwt. Doorlopende kosten van deze mix: ${euro(KANAALMIX_KOSTEN)} per maand.`}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {KANAALMIX.map(k => (
            <div key={k.id}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.text, minWidth: 230 }}>{k.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{getal(k.bezoekers)}</span>
                <span style={{ fontSize: 11, color: C.light }}>
                  {Math.round((k.bezoekers / KANAALMIX_TOTAAL) * 100)}%
                </span>
                <span style={{ marginLeft: "auto", fontSize: 12, color: k.kostenPerMaand > 0 ? C.gold : C.light }}>
                  {k.kostenPerMaand > 0 ? `${euro(k.kostenPerMaand)}/mnd` : "geen vaste kosten"}
                </span>
              </div>
              <Balk deel={k.bezoekers / KANAALMIX_TOTAAL} kleur={k.kostenPerMaand > 0 ? C.gold : C.green} />
              <p style={{ margin: "5px 0 0", fontSize: 11, color: C.muted, lineHeight: 1.6 }}>{k.toelichting}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}`, fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
          <strong style={{ color: C.text }}>Let op de verhouding.</strong> De groene balken — samen{" "}
          {Math.round(((KANAALMIX_TOTAAL - KANAALMIX.filter(k => k.kostenPerMaand > 0).reduce((s, k) => s + k.bezoekers, 0)) / KANAALMIX_TOTAAL) * 100)}%
          {" "}van het verkeer — kosten na de investering niets meer per maand. De gouden balken
          stoppen op de dag dat u stopt met betalen. Daarom ligt het zwaartepunt van het budget bij
          content en niet bij advertenties.
        </div>
      </Kaart>

      {/* ── Budget ── */}
      <Kaart
        titel="Marketingbudget"
        sub="Drie scenario's over 24 maanden. Kies er één; elk scenario is intern consistent — losse posten eruit halen verandert de uitkomst."
      >
        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          {SCENARIOS.map(s => (
            <button key={s.id} onClick={() => setScenarioId(s.id)}
              style={{
                padding: "10px 16px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit",
                border: `1px solid ${s.id === scenarioId ? C.green : C.border}`,
                background: s.id === scenarioId ? C.green : C.card,
                color: s.id === scenarioId ? "#fff" : C.text,
                fontSize: 13, fontWeight: 600, textAlign: "left",
              }}>
              {s.naam}
              <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.85 }}>
                {euro(s.perMaand)}/mnd
              </div>
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 28, flexWrap: "wrap", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>Per maand</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: C.text }}>{euro(scenario.perMaand)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>Eenmalig</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: C.text }}>{euro(scenario.eenmalig)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>
              Totaal over {scenario.maanden} maanden
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: C.green }}>
              {euro(scenario.perMaand * scenario.maanden + scenario.eenmalig)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>Verwacht resultaat</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: scenario.doelGehaald ? C.groen : C.rood }}>
              {getal(scenario.uitkomst[0])}–{getal(scenario.uitkomst[1])}
            </div>
            <div style={{ fontSize: 11, color: C.muted }}>
              {scenario.doelGehaald ? "doel gehaald" : "doel niet gehaald"}
            </div>
          </div>
        </div>

        <p style={{ margin: "0 0 16px", fontSize: 12, color: C.text, lineHeight: 1.7, padding: "12px 14px", background: "#FAFAF7", borderLeft: `3px solid ${C.gold}`, borderRadius: "0 8px 8px 0" }}>
          {scenario.oordeel}
        </p>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ textAlign: "left", color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>
              <th style={{ padding: "6px 0", fontWeight: 600 }}>Post</th>
              <th style={{ padding: "6px 0", fontWeight: 600, width: 90, textAlign: "right" }}>Per maand</th>
              <th style={{ padding: "6px 0 6px 16px", fontWeight: 600 }}>Wat het koopt</th>
            </tr>
          </thead>
          <tbody>
            {scenario.posten.map(p => (
              <tr key={p.label} style={{ borderTop: `1px solid ${C.border}` }}>
                <td style={{ padding: "10px 0", fontWeight: 600, color: C.text, verticalAlign: "top" }}>{p.label}</td>
                <td style={{ padding: "10px 0", textAlign: "right", color: C.text, verticalAlign: "top" }}>{euro(p.bedrag)}</td>
                <td style={{ padding: "10px 0 10px 16px", color: C.muted, lineHeight: 1.6 }}>{p.wat}</td>
              </tr>
            ))}
            <tr style={{ borderTop: `2px solid ${C.border}` }}>
              <td style={{ padding: "10px 0", fontWeight: 700, color: C.text }}>Totaal per maand</td>
              <td style={{ padding: "10px 0", textAlign: "right", fontWeight: 700, color: C.text }}>{euro(scenario.perMaand)}</td>
              <td />
            </tr>
          </tbody>
        </table>

        <h4 style={{ margin: "22px 0 8px", fontSize: 13, fontWeight: 700, color: C.text }}>
          Eenmalige investeringen
        </h4>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <tbody>
            {scenario.eenmaligePosten.map(p => (
              <tr key={p.label} style={{ borderTop: `1px solid ${C.border}` }}>
                <td style={{ padding: "10px 0", fontWeight: 600, color: C.text, verticalAlign: "top" }}>{p.label}</td>
                <td style={{ padding: "10px 0", textAlign: "right", color: C.text, width: 90, verticalAlign: "top" }}>{euro(p.bedrag)}</td>
                <td style={{ padding: "10px 0 10px 16px", color: C.muted, lineHeight: 1.6 }}>{p.wat}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Kaart>

      {/* ── Werkelijke herkomst ── */}
      <Kaart
        titel="Wat de kanalen werkelijk opleveren"
        sub="Aanvragen van de afgelopen twaalf maanden, per kanaal waaruit ze binnenkwamen. Dit is de toets op het budget: een kanaal dat verkeer levert maar geen aanvragen, verdient geen verhoging."
      >
        {laadt ? (
          <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Bezig met laden…</p>
        ) : kanalen.length === 0 ? (
          <p style={{ fontSize: 13, color: C.muted, margin: 0, lineHeight: 1.7 }}>
            Nog geen aanvragen met herkomst. Vanaf nu draagt elke aanvraag het kanaal waaruit hij
            kwam{data && data.kanalen.zonderHerkomst > 0
              ? `; ${data.kanalen.zonderHerkomst} eerdere ${data.kanalen.zonderHerkomst === 1 ? "aanvraag dateert" : "aanvragen dateren"} van vóór die meting.`
              : "."}
            {" "}Zet advertenties pas aan als dit gevuld raakt — anders is achteraf niet te zeggen
            welke euro werkte.
          </p>
        ) : (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ textAlign: "left", color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>
                  <th style={{ padding: "6px 0", fontWeight: 600 }}>Kanaal</th>
                  <th style={{ padding: "6px 0", fontWeight: 600, textAlign: "right" }}>Aanvragen</th>
                  <th style={{ padding: "6px 0", fontWeight: 600, textAlign: "right" }}>Geboekt</th>
                  <th style={{ padding: "6px 0", fontWeight: 600, textAlign: "right" }}>Omzet</th>
                </tr>
              </thead>
              <tbody>
                {kanalen.map(k => (
                  <tr key={k.kanaal} style={{ borderTop: `1px solid ${C.border}` }}>
                    <td style={{ padding: "10px 0", fontWeight: 600, color: C.text }}>
                      {KANAAL_LABEL[k.kanaal] ?? k.kanaal}
                      <div style={{ marginTop: 4, maxWidth: 220 }}>
                        <Balk deel={kanaalTotaal > 0 ? k.aanvragen / kanaalTotaal : 0} />
                      </div>
                    </td>
                    <td style={{ padding: "10px 0", textAlign: "right", color: C.text }}>{k.aanvragen}</td>
                    <td style={{ padding: "10px 0", textAlign: "right", color: C.text }}>{k.geboekt}</td>
                    <td style={{ padding: "10px 0", textAlign: "right", color: C.text }}>
                      {k.omzet > 0 ? euro(Math.round(k.omzet)) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data && data.kanalen.zonderHerkomst > 0 && (
              <p style={{ margin: "12px 0 0", fontSize: 11, color: C.light, lineHeight: 1.6 }}>
                {data.kanalen.zonderHerkomst} {data.kanalen.zonderHerkomst === 1 ? "aanvraag heeft" : "aanvragen hebben"} geen
                herkomst — die {data.kanalen.zonderHerkomst === 1 ? "dateert" : "dateren"} van vóór de meting, of de bezoeker
                blokkeerde opslag in de browser. Niet meegeteld, om direct verkeer niet groter te laten lijken dan het is.
              </p>
            )}
          </>
        )}
      </Kaart>
    </div>
  );
}
