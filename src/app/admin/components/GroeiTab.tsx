"use client";
import { useState, useEffect, useMemo } from "react";
import {
  BEZETTINGSDOEL, NACHTEN_BESCHIKBAAR, MAANDEN, JAAR,
  VASTE_LASTEN, VASTE_LASTEN_PER_JAAR, VASTE_LASTEN_PER_MAAND, BREAKEVEN, LADDER,
  BASISPRIJS, TOESLAGEN, nachtprijs, BLOKPLAFOND, WINTERSTRAF, ENERGIE_PER_NACHT, SCHOONMAAK,
  GEMIDDELDE_VERBLIJFSDUUR, BEZOEKERS_PER_MAAND_MINIMAAL,
  DOEL_BEZOEKERS_JAAR, DOEL_BEZOEKERS_MAAND, STRETCH_BEZOEKERS_MAAND,
  WEEKENDPLAFOND, DOORDEWEEKS_NODIG, DOORDEWEEKSE_BEZETTING_NODIG,
  MIJLPALEN, mijlpaalVoor, BEZETTINGSHEFBOMEN,
  KANAALMIX, KANAALMIX_KOSTEN, KANAALMIX_VRIJ_AANDEEL,
  SCENARIOS, planGestart, maandenTussen, type Scenario,
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
const pct = (n: number) => `${Math.round(n * 100)}%`;

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
  const breedte = Math.max(0, Math.min(100, deel * 100));
  return (
    <div style={{ height: 6, background: "#EEF0F3", borderRadius: 3, overflow: "hidden" }}>
      <div style={{ width: `${breedte}%`, height: "100%", background: kleur, borderRadius: 3 }} />
    </div>
  );
}

/** Eén stap in de keten bezetting → nachten → boekingen → bezoekers. */
function Schakel({ waarde, eenheid, label }: { waarde: string; eenheid: string; label: string }) {
  return (
    <div style={{ minWidth: 116 }}>
      <div style={{ fontSize: 26, fontWeight: 700, color: C.text, lineHeight: 1.1 }}>{waarde}</div>
      <div style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>{eenheid}</div>
      <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.4, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function Pijl() {
  return <div style={{ fontSize: 18, color: C.gold, alignSelf: "center", padding: "0 2px" }}>→</div>;
}

/* ── Tab ─────────────────────────────────────────────────────────────────── */

export function GroeiTab() {
  const [data, setData] = useState<GroeiData | null>(null);
  const [laadt, setLaadt] = useState(true);
  const [scenarioId, setScenarioId] = useState<Scenario["id"]>("bezetting");

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
  const scenario = SCENARIOS.find(s => s.id === scenarioId)!;

  /* Search Console meet alleen organisch verkeer: dit is bewust een ondergrens.
   * Zodra GA4 draait komt het echte sessiecijfer hier te staan. */
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
  const maxBezoekers = useMemo(() => Math.max(...MAANDEN.map(m => m.bezoekers)), []);

  const kanalen = data?.kanalen.tellingen ?? [];
  const kanaalTotaal = kanalen.reduce((s, k) => s + k.aanvragen, 0);

  return (
    <div style={{ maxWidth: 1000 }}>
      <header style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.text }}>
          Groei — van bezetting naar bezoekers
        </h2>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: C.muted, lineHeight: 1.6, maxWidth: 760 }}>
          Het doel is <strong style={{ color: C.text }}>{pct(BEZETTINGSDOEL)} bezetting het hele jaar door</strong>.
          Het bezoekersaantal is daarvan een afgeleide en geen doel op zich — die volgorde staat
          hier bewust, want sturen op verkeer levert verkeer op en niet per se nachten.
        </p>
      </header>

      {/* ── De keten ── */}
      <Kaart
        titel="De rekensom"
        sub={`Twee lodges, ${NACHTEN_BESCHIKBAAR} nachten per jaar te vergeven. Zo loopt het van bezetting terug naar het aantal bezoekers dat u nodig heeft.`}
      >
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-start", marginBottom: 18 }}>
          <Schakel waarde={pct(BEZETTINGSDOEL)} eenheid="bezetting" label="het praktische maximum voor twee lodges" />
          <Pijl />
          <Schakel waarde={getal(JAAR.nachten)} eenheid="nachten" label={`van de ${getal(NACHTEN_BESCHIKBAAR)} beschikbaar`} />
          <Pijl />
          <Schakel waarde={getal(JAAR.boekingen)} eenheid="boekingen" label={`gemiddeld ${GEMIDDELDE_VERBLIJFSDUUR.toFixed(1)} nachten per verblijf`} />
          <Pijl />
          <Schakel waarde={getal(JAAR.eigenBoekingen)} eenheid="via eigen site" label="de rest komt via boekingssites en terugkeer" />
          <Pijl />
          <Schakel waarde={getal(JAAR.bezoekers)} eenheid="bezoekers/jaar" label={`± ${getal(BEZOEKERS_PER_MAAND_MINIMAAL)} per maand`} />
        </div>

        <div style={{
          padding: "14px 16px", background: "#FAFAF7", borderLeft: `3px solid ${C.gold}`,
          borderRadius: "0 8px 8px 0", fontSize: 12, color: C.text, lineHeight: 1.7,
        }}>
          <strong>Het antwoord op de vraag:</strong> ongeveer <strong>{getal(BEZOEKERS_PER_MAAND_MINIMAAL)} bezoekers
          per maand</strong> volstaat om {pct(BEZETTINGSDOEL)} bezetting te halen — niet 10.000.
          Het doel staat op <strong>{getal(DOEL_BEZOEKERS_JAAR)} bezoekers per jaar</strong> ({getal(DOEL_BEZOEKERS_MAAND)} per
          maand), ruim twee keer de minimale behoefte. Die marge is er om drie redenen: de conversie
          begint lager zolang er geen reviews en geen interieurbeeld zijn, verkeer valt nooit precies
          in de maanden waarin u het nodig heeft, en bezoek dat vandaag niet boekt bouwt wel de
          e-maillijst waarmee u volgend jaar de lage maanden vult.
          <br /><br />
          {getal(STRETCH_BEZOEKERS_MAAND)} bezoekers per <em>maand</em> blijft een zinvol doel, maar
          voor iets anders: dat koopt geen bezetting meer — die zit dan aan het plafond — maar
          overvraag, en overvraag is prijsmacht.
        </div>
      </Kaart>

      {/* ── De ondergrens ── */}
      <Kaart
        titel="De ondergrens — dekking van hypotheek en vaste lasten"
        sub={`${euro(VASTE_LASTEN.financieringPerMaand)} per maand financieringslasten plus ${euro(VASTE_LASTEN.parkkostenPerJaar)} per jaar parkkosten — samen ${euro(VASTE_LASTEN_PER_JAAR)} per jaar, ${euro(VASTE_LASTEN_PER_MAAND)} per maand. Doorgerekend op de kalender van 2027 met de tarieven uit de prijsmotor.`}
      >
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>Break-even</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: C.gold, lineHeight: 1.2 }}>{pct(BREAKEVEN.bezetting)}</div>
            <div style={{ fontSize: 12, color: C.muted }}>jaarbezetting</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>Per maand</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: C.text, lineHeight: 1.2 }}>{BREAKEVEN.nachtenPerMaand}</div>
            <div style={{ fontSize: 12, color: C.muted }}>nachten · {BREAKEVEN.boekingenPerMaand} boekingen</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>Gemiddeld tarief</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: C.text, lineHeight: 1.2 }}>{euro(BREAKEVEN.gemiddeldTarief)}</div>
            <div style={{ fontSize: 12, color: C.muted }}>per nacht</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>Bezoekers nodig</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: C.green, lineHeight: 1.2 }}>{BREAKEVEN.bezoekersPerMaand}</div>
            <div style={{ fontSize: 12, color: C.muted }}>per maand</div>
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginBottom: 16 }}>
          <thead>
            <tr style={{ textAlign: "left", color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>
              <th style={{ padding: "6px 0", fontWeight: 600 }}>Bezetting</th>
              <th style={{ padding: "6px 0", fontWeight: 600, textAlign: "right" }}>Nachten</th>
              <th style={{ padding: "6px 0", fontWeight: 600, textAlign: "right" }}>Boekingen</th>
              <th style={{ padding: "6px 0", fontWeight: 600, textAlign: "right" }}>Gem. tarief</th>
              <th style={{ padding: "6px 0", fontWeight: 600, textAlign: "right" }}>Omzet</th>
              <th style={{ padding: "6px 0", fontWeight: 600, textAlign: "right" }}>Energie</th>
              <th style={{ padding: "6px 0", fontWeight: 600, textAlign: "right" }}>Ná vaste lasten</th>
            </tr>
          </thead>
          <tbody>
            {LADDER.map(t => {
              const isDoel = t.bezetting >= BLOKPLAFOND.bezetting - 0.01;
              const isBreak = Math.abs(t.bezetting - BREAKEVEN.bezetting) < 0.01;
              return (
                <tr key={t.bezetting} style={{
                  borderTop: `1px solid ${C.border}`,
                  background: isDoel ? "#F0F5F2" : isBreak ? "#FAFAF7" : "transparent",
                  fontWeight: isDoel || isBreak ? 600 : 400,
                }}>
                  <td style={{ padding: "9px 0", color: C.text }}>
                    {pct(t.bezetting)}
                    {isBreak && <span style={{ marginLeft: 8, fontSize: 10, color: C.gold }}>break-even</span>}
                    {isDoel && <span style={{ marginLeft: 8, fontSize: 10, color: C.green }}>plafond in blokken</span>}
                  </td>
                  <td style={{ padding: "9px 0", textAlign: "right", color: C.text }}>{t.nachten}</td>
                  <td style={{ padding: "9px 0", textAlign: "right", color: C.muted }}>{t.boekingen}</td>
                  <td style={{ padding: "9px 0", textAlign: "right", color: C.muted }}>{euro(t.adr)}</td>
                  <td style={{ padding: "9px 0", textAlign: "right", color: C.text }}>{euro(t.omzet)}</td>
                  <td style={{ padding: "9px 0", textAlign: "right", color: C.muted }}>−{euro(t.energie)}</td>
                  <td style={{ padding: "9px 0", textAlign: "right", color: t.resultaat > 0 ? C.groen : C.rood }}>
                    {euro(t.resultaat)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 14 }}>
          {TOESLAGEN.map(t => (
            <div key={t.label} style={{ fontSize: 11 }}>
              <div style={{ color: C.muted }}>{t.label}</div>
              <div style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>{euro(nachtprijs(t.pct))}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 14 }}>
          <div style={{
            flex: "1 1 20rem", padding: "12px 14px", background: "#FAFAF7",
            borderLeft: `3px solid ${C.rood}`, borderRadius: "0 8px 8px 0",
            fontSize: 12, color: C.text, lineHeight: 1.7,
          }}>
            <strong>De winterstraf.</strong> Stroom en water gaan op de meter, en dat maakt de lage
            maanden dubbel lastig. Een novembernacht levert {euro(WINTERSTRAF.novemberTarief)} op en
            kost {euro(WINTERSTRAF.novemberEnergie)} aan energie — netto {euro(WINTERSTRAF.novemberNetto)}.
            Een augustusnacht levert {euro(WINTERSTRAF.augustusTarief)} op en kost er
            {" "}{euro(WINTERSTRAF.augustusEnergie)} — netto {euro(WINTERSTRAF.augustusNetto)}. De maanden
            die het moeilijkst te verkopen zijn, zijn ook het duurst om te leveren. Reken daarom in de
            winter met een minimumverblijf van drie nachten: de jacuzzi opwarmen kost hetzelfde bij twee
            of bij vier nachten.
          </div>
          <div style={{
            flex: "1 1 20rem", padding: "12px 14px", background: "#FAFAF7",
            borderLeft: `3px solid ${C.gold}`, borderRadius: "0 8px 8px 0",
            fontSize: 12, color: C.text, lineHeight: 1.7,
          }}>
            <strong>Het blokplafond.</strong> Verkoopt u uitsluitend hele weekenden, midweken en
            vakantieweken, dan komt u niet verder dan {BLOKPLAFOND.nachten} van de {NACHTEN_BESCHIKBAAR} nachten —
            {" "}{pct(BLOKPLAFOND.bezetting)}. De rest zijn losse zondag- en maandagnachten die tussen twee
            boekingen in vallen. {pct(BEZETTINGSDOEL)} halen betekent dus per definitie ook die restnachten
            verkopen: flexibele aankomstdagen en een last-minute-kanaal zijn geen verfijning maar
            voorwaarde.
          </div>
        </div>

        <p style={{
          margin: 0, fontSize: 12, color: C.text, lineHeight: 1.7,
          padding: "12px 14px", background: "#FAFAF7", borderLeft: `3px solid ${C.green}`, borderRadius: "0 8px 8px 0",
        }}>
          <strong>Wat dit betekent.</strong> De lichten blijven aan bij {pct(BREAKEVEN.bezetting)} bezetting —
          {" "}{BREAKEVEN.nachtenPerMaand} nachten en {BREAKEVEN.boekingenPerMaand.toFixed(1)} boekingen per
          maand over twee lodges, en daar zijn ongeveer {BREAKEVEN.bezoekersPerMaand} bezoekers per maand
          voor nodig. Het doel van {pct(BEZETTINGSDOEL)} is dus geen overleven maar verdienen: het verschil
          tussen break-even en het plafond is ruim {euro(54_000)} per jaar. Het marketingbudget van
          {" "}{euro(550)} per maand hoeft daarvan maar één extra boeking per maand terug te verdienen.
          <br /><br />
          Basisprijs {euro(BASISPRIJS)} per nacht; per nacht wint de duurste toeslag. Variabele kosten:
          {" "}{euro(ENERGIE_PER_NACHT[7])} tot {euro(ENERGIE_PER_NACHT[1])} per nacht aan stroom en water
          (op de meter, seizoensgebonden) en {euro(SCHOONMAAK.kostprijs)} schoonmaak per wissel tegen
          {" "}{euro(SCHOONMAAK.doorberekend)} die u doorberekent. Toeristenbelasting telt niet mee — dat is
          doorstroom naar de gemeente.
        </p>
      </Kaart>

      {/* ── Het maandmodel ── */}
      <Kaart
        titel="Per maand"
        sub="Merk op dat het aantal boekingen het hele jaar vrijwel gelijk blijft: laagseizoen betekent veel korte verblijven, hoogseizoen weinig lange. Alleen de verblijfsduur verschuift."
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, minWidth: 640 }}>
            <thead>
              <tr style={{ textAlign: "left", color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>
                <th style={{ padding: "6px 10px 6px 0", fontWeight: 600 }}>Maand</th>
                <th style={{ padding: "6px 10px", fontWeight: 600, textAlign: "right" }}>Doel</th>
                <th style={{ padding: "6px 10px", fontWeight: 600, textAlign: "right" }}>Nachten</th>
                <th style={{ padding: "6px 10px", fontWeight: 600, textAlign: "right" }}>Verblijf</th>
                <th style={{ padding: "6px 10px", fontWeight: 600, textAlign: "right" }}>Boekingen</th>
                <th style={{ padding: "6px 10px", fontWeight: 600, textAlign: "right" }}>Eigen site</th>
                <th style={{ padding: "6px 10px", fontWeight: 600, textAlign: "right" }}>Conversie</th>
                <th style={{ padding: "6px 0 6px 10px", fontWeight: 600 }}>Bezoekers nodig</th>
              </tr>
            </thead>
            <tbody>
              {MAANDEN.map(m => (
                <tr key={m.maand} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: "8px 10px 8px 0", fontWeight: 600, color: C.text, textTransform: "capitalize" }}>{m.maand}</td>
                  <td style={{ padding: "8px 10px", textAlign: "right", color: C.muted }}>{pct(m.bezetting)}</td>
                  <td style={{ padding: "8px 10px", textAlign: "right", color: C.text }}>{m.nachten}</td>
                  <td style={{ padding: "8px 10px", textAlign: "right", color: C.muted }}>{m.verblijfsduur.toFixed(1)}</td>
                  <td style={{ padding: "8px 10px", textAlign: "right", color: C.text, fontWeight: 600 }}>{m.boekingen}</td>
                  <td style={{ padding: "8px 10px", textAlign: "right", color: C.text }}>{m.eigenBoekingen}</td>
                  <td style={{ padding: "8px 10px", textAlign: "right", color: C.muted }}>{(m.conversie * 100).toFixed(1)}%</td>
                  <td style={{ padding: "8px 0 8px 10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ minWidth: 34, textAlign: "right", color: C.text }}>{getal(m.bezoekers)}</span>
                      <div style={{ flex: 1, minWidth: 60 }}><Balk deel={m.bezoekers / maxBezoekers} /></div>
                    </div>
                  </td>
                </tr>
              ))}
              <tr style={{ borderTop: `2px solid ${C.border}`, fontWeight: 700 }}>
                <td style={{ padding: "10px 10px 10px 0", color: C.text }}>Jaar</td>
                <td style={{ padding: "10px", textAlign: "right", color: C.green }}>{pct(BEZETTINGSDOEL)}</td>
                <td style={{ padding: "10px", textAlign: "right", color: C.text }}>{JAAR.nachten}</td>
                <td style={{ padding: "10px", textAlign: "right", color: C.muted }}>{GEMIDDELDE_VERBLIJFSDUUR.toFixed(1)}</td>
                <td style={{ padding: "10px", textAlign: "right", color: C.text }}>{JAAR.boekingen}</td>
                <td style={{ padding: "10px", textAlign: "right", color: C.text }}>{JAAR.eigenBoekingen}</td>
                <td style={{ padding: "10px", textAlign: "right", color: C.muted }}>
                  {((JAAR.eigenBoekingen / JAAR.bezoekers) * 100).toFixed(1)}%
                </td>
                <td style={{ padding: "10px 0 10px 10px", color: C.text }}>{getal(JAAR.bezoekers)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Kaart>

      {/* ── Doordeweeks ── */}
      <Kaart
        titel="De harde randvoorwaarde: doordeweeks"
        sub="Dit is het cijfer dat bepaalt of maximale bezetting haalbaar is, en het staat los van marketing."
      >
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>Alleen weekenden</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.rood, lineHeight: 1.2 }}>{pct(WEEKENDPLAFOND)}</div>
            <div style={{ fontSize: 12, color: C.muted }}>plafond voor de jaarbezetting</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>Nodig doordeweeks</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.text, lineHeight: 1.2 }}>{DOORDEWEEKS_NODIG}</div>
            <div style={{ fontSize: 12, color: C.muted }}>nachten per jaar</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>Doordeweekse bezetting</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.gold, lineHeight: 1.2 }}>{pct(DOORDEWEEKSE_BEZETTING_NODIG)}</div>
            <div style={{ fontSize: 12, color: C.muted }}>die u moet halen</div>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: 12, color: C.text, lineHeight: 1.7 }}>
          Vrijdag, zaterdag en zondag zijn drie van de zeven dagen. Verkoopt u alleen weekenden, dan
          komt u nooit boven {pct(WEEKENDPLAFOND)} uit, hoeveel bezoekers u ook binnenhaalt. Het
          doordeweekse publiek is een ánder publiek — 55-plussers, thuiswerkers, hondenbezitters,
          mensen zonder schoolgaande kinderen — met een andere boodschap, een ander tarief en andere
          kanalen. Dit is de belangrijkste opdracht van het hele plan, en er is geen advertentie die
          hem oplost.
        </p>
      </Kaart>

      {/* ── Hefbomen ── */}
      <Kaart
        titel="Wat de bezetting werkelijk bepaalt"
        sub="Op volgorde van invloed. Meer bezoekers staat bewust onderaan."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {BEZETTINGSHEFBOMEN.map((h, i) => (
            <div key={h.id} style={{ display: "flex", gap: 12 }}>
              <div style={{
                minWidth: 22, height: 22, borderRadius: 11, flexShrink: 0,
                background: h.impact === "hoog" ? C.green : "#E5E7EB",
                color: h.impact === "hoog" ? "#fff" : C.muted,
                fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
              }}>{i + 1}</div>
              <div>
                <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{h.titel}</span>
                  <span style={{ fontSize: 11, color: C.gold, fontWeight: 600 }}>{h.effect}</span>
                </div>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{h.toelichting}</p>
              </div>
            </div>
          ))}
        </div>
      </Kaart>

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
                <div style={{ fontSize: 30, fontWeight: 700, color: C.text, lineHeight: 1.2 }}>{getal(stand)}</div>
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
                  Genoeg voor {pct(BEZETTINGSDOEL)}
                </div>
                <div style={{ fontSize: 30, fontWeight: 700, color: C.green, lineHeight: 1.2 }}>
                  {getal(BEZOEKERS_PER_MAAND_MINIMAAL)}
                </div>
                <div style={{ fontSize: 12, color: C.muted }}>
                  {procent(stand / BEZOEKERS_PER_MAAND_MINIMAAL)} daarvan gehaald
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
              {" "}Voor de bezetting is {getal(BEZOEKERS_PER_MAAND_MINIMAAL)} per maand al genoeg;
              het doel van {getal(DOEL_BEZOEKERS_MAAND)} is er om marge te hebben. Verwacht de
              beweging bovendien laat: artikelen halen hun volle verkeer pas na 6 tot 12 maanden,
              dus de curve loopt achter op het werk.
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
        sub="Elke fase heeft een bezettingsdoel én een verkeersdoel. Het bezettingsdoel is het echte doel; het verkeersdoel is wat ervoor nodig is."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {MIJLPALEN.map(m => {
            const actief = m.id === fase.id;
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
                  <span style={{ marginLeft: "auto", display: "flex", gap: 14, alignItems: "baseline" }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: m.bezetting === null ? C.light : C.green }}>
                      {m.bezetting === null ? "—" : pct(m.bezetting)}
                    </span>
                    <span style={{ fontSize: 13, color: C.gold, fontWeight: 600 }}>{getal(m.doel)}/mnd</span>
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
        titel="Waar het verkeer vandaan komt"
        sub={`Als verhouding, zodat dezelfde mix klopt bij ${getal(DOEL_BEZOEKERS_MAAND)} én bij ${getal(STRETCH_BEZOEKERS_MAAND)} bezoekers per maand. Doorlopende kosten bij het scenario Bezetting: ${euro(KANAALMIX_KOSTEN)} per maand.`}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {KANAALMIX.map(k => (
            <div key={k.id}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.text, minWidth: 230 }}>{k.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{pct(k.aandeel)}</span>
                <span style={{ fontSize: 11, color: C.light }}>
                  ± {getal(Math.round(k.aandeel * DOEL_BEZOEKERS_MAAND))}/mnd
                </span>
                <span style={{ marginLeft: "auto", fontSize: 12, color: k.kostenPerMaand > 0 ? C.gold : C.light }}>
                  {k.kostenPerMaand > 0 ? `${euro(k.kostenPerMaand)}/mnd` : "geen vaste kosten"}
                </span>
              </div>
              <Balk deel={k.aandeel} kleur={k.kostenPerMaand > 0 ? C.gold : C.green} />
              <p style={{ margin: "5px 0 0", fontSize: 11, color: C.muted, lineHeight: 1.6 }}>{k.toelichting}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}`, fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
          <strong style={{ color: C.text }}>Let op de verhouding.</strong> De groene balken — samen{" "}
          {pct(KANAALMIX_VRIJ_AANDEEL)} van het verkeer — kosten na de investering niets meer per
          maand. De gouden balken stoppen op de dag dat u stopt met betalen. Daarom staat het
          advertentiebudget in het scenario Bezetting alleen op de maanden waarin u het nodig heeft.
        </div>
      </Kaart>

      {/* ── Budget ── */}
      <Kaart
        titel="Marketingbudget"
        sub="Vier scenario's over 24 maanden. Let bij het vergelijken op de bezettingskolom en niet op de bezoekerskolom — daar gaat het tenslotte om."
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
              {s.naam}{s.advies && <span style={{ fontSize: 10, marginLeft: 5, opacity: 0.85 }}>· advies</span>}
              <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.85 }}>
                {euro(s.perMaand)}/mnd · {pct(s.bezetting)}
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
            <div style={{ fontSize: 24, fontWeight: 700, color: C.text }}>
              {euro(scenario.perMaand * scenario.maanden + scenario.eenmalig)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>Bezetting</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: scenario.bezetting >= BEZETTINGSDOEL ? C.groen : C.rood }}>
              {pct(scenario.bezetting)}
            </div>
            <div style={{ fontSize: 11, color: C.muted }}>
              {scenario.bezetting >= BEZETTINGSDOEL ? "doel gehaald" : "doel niet gehaald"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>Bezoekers p/mnd</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: C.text }}>
              {getal(scenario.uitkomst[0])}–{getal(scenario.uitkomst[1])}
            </div>
          </div>
        </div>

        <p style={{ margin: "0 0 16px", fontSize: 12, color: C.text, lineHeight: 1.7, padding: "12px 14px", background: "#FAFAF7", borderLeft: `3px solid ${scenario.advies ? C.green : C.gold}`, borderRadius: "0 8px 8px 0" }}>
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

        <h4 style={{ margin: "22px 0 8px", fontSize: 13, fontWeight: 700, color: C.text }}>Eenmalige investeringen</h4>
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
        sub="Aanvragen van de afgelopen twaalf maanden, per kanaal waaruit ze binnenkwamen. Dit is de toets op het budget: een kanaal dat verkeer levert maar geen boekingen, verdient geen verhoging."
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
