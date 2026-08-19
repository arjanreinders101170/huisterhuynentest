"use client";
import { useState, useEffect, useMemo } from "react";
import {
  DOEL_BEZOEKERS, MIJLPALEN, KANAALMIX, KANAALMIX_TOTAAL, KANAALMIX_KOSTEN,
  SCENARIOS, mijlpaalVoor, planGestart, maandenTussen, type Scenario,
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

/* Een stand van 3 op 10.000 is 0,03% en wordt afgerond 0% — wat leest als
 * "er gebeurt niets". Onder de procent tonen we daarom dat het klein is,
 * niet dat het nul is. */
const procent = (deel: number): string => {
  const pct = deel * 100;
  if (pct > 0 && pct < 1) return "<1%";
  return `${Math.round(pct)}%`;
};

/** Maanden schrijven we uit, zodat "over 4 maanden" nergens "over 4 maand" wordt. */
const maanden = (n: number) => `${n} ${n === 1 ? "maand" : "maanden"}`;

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
  /* Vóór september 2026 is de eerste fase nog niet begonnen. Zonder dit leest
   * het scherm als "we lopen achter op fase fundament" terwijl die nog moet
   * starten. */
  const gestart = planGestart(nuMaand);
  const maandenTotFase = maandenTussen(nuMaand, fase.vanaf);
  const maandenTotFaseDoel = maandenTussen(nuMaand, fase.tot);
  const eindfase = MIJLPALEN[MIJLPALEN.length - 1];
  const scenario = SCENARIOS.find(s => s.id === scenarioId)!;

  /* Het laatste volledige maandcijfer is onze stand. Search Console meet
   * alleen organisch verkeer, dus dit is bewust een ondergrens. */
  const laatste = data?.reeks.at(-1) ?? null;
  const vorige = data?.reeks.at(-2) ?? null;
  const stand = laatste?.klikken ?? 0;

  /* Bij deze aantallen zegt een percentage niets: van 1 naar 3 is +200% en
   * klinkt als een doorbraak. Onder de 20 klikken tonen we het verschil zelf. */
  const verschil = vorige ? stand - vorige.klikken : null;
  const groeiTekst =
    vorige === null || verschil === null ? null
      : vorige.klikken >= 20
        ? `${verschil >= 0 ? "+" : ""}${Math.round((verschil / vorige.klikken) * 100)}%`
        : `${verschil >= 0 ? "+" : ""}${getal(verschil)} t.o.v. ${maandLabel(vorige.maand)}`;

  /* De reeks eindigt op de laatst opgehaalde maand. Loopt die meer dan één
   * maand achter, dan kijkt u naar oude cijfers en moet het scherm dat zeggen. */
  const maandenOud = laatste ? maandenTussen(laatste.maand, nuMaand) : 0;
  const verouderd = maandenOud >= 2;

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
        titel={gestart
          ? `Stand — fase ${fase.titel.toLowerCase()} (${fase.periode})`
          : `Stand — de eerste fase (${fase.titel.toLowerCase()}) begint ${maandLabel(fase.vanaf)}`}
        sub="Gemeten als organische klikken uit Search Console, per maand. Dat mist direct, social en betaald verkeer, dus het echte cijfer ligt hoger. Zodra GA4 draait komt het sessiecijfer hier te staan."
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
                  Nu — {maandLabel(laatste.maand)}
                </div>
                <div style={{ fontSize: 30, fontWeight: 700, color: C.text, lineHeight: 1.2 }}>
                  {getal(stand)}
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>
                  bezoekers uit zoeken
                  {groeiTekst && verschil !== null && (
                    <span style={{ marginLeft: 6, color: verschil >= 0 ? C.groen : C.rood, fontWeight: 600 }}>
                      {groeiTekst}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>
                  Doel {maandLabel(fase.tot)}
                </div>
                <div style={{ fontSize: 30, fontWeight: 700, color: C.gold, lineHeight: 1.2 }}>
                  {getal(fase.doel)}
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>
                  {stand >= fase.doel
                    ? "gehaald"
                    : maandenTotFaseDoel > 0
                      ? `nog ${getal(fase.doel - stand)} te gaan, in ${maanden(maandenTotFaseDoel)}`
                      : `nog ${getal(fase.doel - stand)} te gaan`}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>
                  Einddoel {maandLabel(eindfase.tot)}
                </div>
                <div style={{ fontSize: 30, fontWeight: 700, color: C.green, lineHeight: 1.2 }}>
                  {getal(DOEL_BEZOEKERS)}
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>
                  {procent(stand / DOEL_BEZOEKERS)} van de eindstreep, over{" "}
                  {maanden(Math.max(0, maandenTussen(nuMaand, eindfase.tot)))}
                </div>
              </div>
            </div>

            {/* Zonder deze regel leest de kaart als achterstand, terwijl de
              * eerste fase nog moet beginnen. */}
            <p style={{
              margin: "0 0 18px", fontSize: 12, color: C.text, lineHeight: 1.7,
              padding: "12px 14px", background: "#FAFAF7",
              borderLeft: `3px solid ${C.gold}`, borderRadius: "0 8px 8px 0",
            }}>
              <strong>Zo leest u dit.</strong> {getal(stand)} is wat de site in{" "}
              {maandLabel(laatste.maand)} werkelijk uit Google haalde — de laatste maand met
              volledige cijfers; {maandLabel(nuMaand)} loopt nog.{" "}
              {gestart
                ? `De ${getal(fase.doel)} ernaast is geen cijfer voor nu maar voor ${maandLabel(fase.tot)}, het eind van fase ${fase.titel.toLowerCase()}.`
                : `De ${getal(fase.doel)} ernaast is geen cijfer voor nu: fase ${fase.titel.toLowerCase()} begint pas ${maandLabel(fase.vanaf)}${maandenTotFase > 0 ? ` — over ${maanden(maandenTotFase)}` : ""}, en die ${getal(fase.doel)} hoort bij ${maandLabel(fase.tot)}, het eind van die fase.`}
              {" "}Het einddoel van {getal(DOEL_BEZOEKERS)} staat gepland voor{" "}
              {maandLabel(eindfase.tot)}; op {getal(stand)} bezoekers is dat afgerond nul procent,
              en dat blijft nog maanden zo — artikelen halen hun volle verkeer pas na 6 tot 12
              maanden, dus de curve loopt achter op het werk.
            </p>

            {verouderd && (
              <p style={{ margin: "0 0 18px", fontSize: 12, color: C.rood, lineHeight: 1.7 }}>
                Let op: de laatste cijfers zijn van {maandLabel(laatste.maand)}, {maanden(maandenOud)} geleden.
                Haal Search Console opnieuw op via die tab — hier staat nu een verouderde stand.
              </p>
            )}

            {/* Maandreeks — de vorm van de curve zegt meer dan het laatste cijfer.
              * Bij weinig maanden zetten we het aantal erboven: een balk op
              * volle hoogte suggereert anders veel verkeer waar er 5 klikken staan. */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 90, marginBottom: 6 }}>
              {data!.reeks.map(r => (
                <div key={r.maand} title={`${maandLabel(r.maand)}: ${getal(r.klikken)} klikken`}
                  style={{ flex: 1, minWidth: 6, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%" }}>
                  {data!.reeks.length <= 12 && (
                    <div style={{ fontSize: 10, color: C.light, textAlign: "center", marginBottom: 2 }}>
                      {getal(r.klikken)}
                    </div>
                  )}
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
              <span>
                {maandLabel(laatste.maand)} — hoogste maand tot nu toe: {getal(maxKlikken)}
              </span>
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
                  {actief && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
                      color: C.green, background: "#DCE7E0", borderRadius: 4, padding: "2px 6px",
                    }}>
                      {gestart ? "nu bezig" : `start ${maandLabel(m.vanaf)}`}
                    </span>
                  )}
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
