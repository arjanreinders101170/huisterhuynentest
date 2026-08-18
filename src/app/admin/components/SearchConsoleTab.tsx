"use client";
import { useState, useEffect } from "react";

const C = {
  bg: "#F7F8FA", card: "#fff", border: "#E5E7EB",
  text: "#111827", muted: "#6B7280", light: "#9CA3AF",
  green: "#2F4F3E", gold: "#B49A5E", rood: "#991B1B", groen: "#065F46",
};

interface Totalen {
  queries: number; klikken: number; vertoningen: number; ctr: number;
  positie: number; merkKlikken: number; nietMerkKlikken: number;
  commercieleVertoningen: number;
}
interface ClusterVerschil {
  cluster: string; queries: number; klikken: number; vertoningen: number;
  positie: number; boeking: number; winbaarheid: number;
  positieVorig: number | null; positieVerschil: number | null; vertoningenVorig: number | null;
}
interface Kans {
  soort: "nieuw_in_top20" | "bijna_binnen_bereik" | "veel_vertoningen_geen_klik" | "gedaald";
  sleutel: string; cluster: string; vertoningen: number; positie: number;
  vorigePositie?: number; toelichting: string;
}
interface SyncLog {
  maand: string; gestart_op: string; gelukt: boolean;
  aantal_queries: number; aantal_pages: number; foutmelding: string | null;
}
interface Analyse {
  leeg: boolean;
  maand?: string; vorigeMaand?: string | null; maanden?: string[];
  laatsteSync: SyncLog | null;
  totalen?: Totalen; totalenVorig?: Totalen | null;
  clusters?: ClusterVerschil[]; kansen?: Kans[];
  forecast?: { label: string; vertoningen: number; ctr: number; positie: number;
    vertoningenGehaald: boolean; ctrGehaald: boolean; positieGehaald: boolean };
}

const KANS_CONFIG: Record<Kans["soort"], { label: string; color: string; bg: string }> = {
  nieuw_in_top20:             { label: "Nieuw in top 20",   color: "#065F46", bg: "#D1FAE5" },
  veel_vertoningen_geen_klik: { label: "Snippet-probleem",  color: "#92400E", bg: "#FEF3C7" },
  bijna_binnen_bereik:        { label: "Bijna binnen bereik", color: "#1E3A5F", bg: "#DBEAFE" },
  gedaald:                    { label: "Gedaald",           color: "#991B1B", bg: "#FEE2E2" },
};

const MAAND_NAMEN = ["januari","februari","maart","april","mei","juni",
  "juli","augustus","september","oktober","november","december"];

function maandLabel(iso?: string | null): string {
  if (!iso) return "—";
  const [jaar, maand] = iso.split("-");
  return `${MAAND_NAMEN[Number(maand) - 1]} ${jaar}`;
}

/** Positieverandering. Let op: lager positienummer = beter, dus een positief
 *  verschil is een stijging. Dat draaien we hier één keer om. */
function Delta({ waarde, eenheid = "", omgekeerd = false }: { waarde: number | null; eenheid?: string; omgekeerd?: boolean }) {
  if (waarde === null || waarde === 0) {
    return <span style={{ fontSize: 12, color: C.light }}>gelijk</span>;
  }
  const beter = omgekeerd ? waarde < 0 : waarde > 0;
  return (
    <span style={{ fontSize: 12, fontWeight: 600, color: beter ? C.groen : C.rood }}>
      {waarde > 0 ? "▲" : "▼"} {Math.abs(waarde).toLocaleString("nl-NL")}{eenheid}
    </span>
  );
}

export function SearchConsoleTab() {
  const [analyse, setAnalyse] = useState<Analyse | null>(null);
  const [fout, setFout] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/data?table=gsc_analyse");
        const json = await res.json();
        if (json.error) setFout(json.error); else setAnalyse(json.data);
      } catch {
        setFout("Kon de analyse niet laden.");
      }
    })();
  }, []);

  const kaart: React.CSSProperties = {
    background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 20px",
  };

  if (fout) {
    return <div style={{ ...kaart, color: C.rood }}>{fout}</div>;
  }
  if (!analyse) {
    return <div style={{ ...kaart, color: C.muted, fontSize: 13 }}>Analyse laden…</div>;
  }

  if (analyse.leeg) {
    const sync = analyse.laatsteSync;
    return (
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 4 }}>Search Console</h2>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Maandelijkse analyse van de zoekprestaties</p>
        <div style={{ ...kaart, borderLeft: `3px solid ${C.gold}` }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Nog geen data opgehaald</div>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, margin: 0 }}>
            De maandelijkse sync draait op de 3e van elke maand. Om hem te laten werken moet er een
            service-account op de Search Console-property staan en moeten <code>GSC_CLIENT_EMAIL</code>,{" "}
            <code>GSC_PRIVATE_KEY</code> en <code>GSC_SITE_URL</code> zijn ingesteld. De stappen staan in
            de README onder &ldquo;Search Console&rdquo;.
          </p>
          {sync && !sync.gelukt && sync.foutmelding && (
            <div style={{ marginTop: 12, padding: "10px 12px", background: "#FEE2E2",
              border: "1px solid #FCA5A5", borderRadius: 8, fontSize: 12, color: C.rood }}>
              Laatste poging ({maandLabel(sync.maand)}) mislukte: {sync.foutmelding}
            </div>
          )}
        </div>
      </div>
    );
  }

  const t = analyse.totalen!;
  const vorig = analyse.totalenVorig;
  const fc = analyse.forecast!;

  const kpis = [
    { label: "Vertoningen", waarde: t.vertoningen.toLocaleString("nl-NL"),
      delta: vorig ? t.vertoningen - vorig.vertoningen : null },
    { label: "Klikken", waarde: t.klikken.toLocaleString("nl-NL"),
      delta: vorig ? t.klikken - vorig.klikken : null },
    { label: "Niet-merkgebonden klikken", waarde: t.nietMerkKlikken.toLocaleString("nl-NL"),
      delta: vorig ? t.nietMerkKlikken - vorig.nietMerkKlikken : null, nadruk: true },
    { label: "CTR", waarde: `${t.ctr.toFixed(2)}%`,
      delta: vorig ? Math.round((t.ctr - vorig.ctr) * 100) / 100 : null, eenheid: "%" },
    { label: "Gewogen positie", waarde: t.positie.toFixed(1),
      delta: vorig ? Math.round((vorig.positie - t.positie) * 10) / 10 : null },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 4 }}>Search Console</h2>
        <p style={{ fontSize: 13, color: C.muted }}>
          {maandLabel(analyse.maand)}
          {analyse.vorigeMaand && <> — vergeleken met {maandLabel(analyse.vorigeMaand)}</>}
          {analyse.laatsteSync && (
            <> · laatst opgehaald {new Date(analyse.laatsteSync.gestart_op).toLocaleDateString("nl-NL")}</>
          )}
        </p>
      </div>

      {/* Kopregel */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(165px, 1fr))", gap: 12, marginBottom: 20 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ ...kaart, padding: "14px 16px",
            borderTop: k.nadruk ? `3px solid ${C.gold}` : undefined }}>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, lineHeight: 1.35 }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.green, lineHeight: 1 }}>{k.waarde}</div>
            <div style={{ marginTop: 6 }}>
              <Delta waarde={k.delta} eenheid={k.eenheid ?? ""} />
            </div>
          </div>
        ))}
      </div>

      {t.nietMerkKlikken === 0 && (
        <div style={{ ...kaart, borderLeft: `3px solid ${C.gold}`, background: "#FFF9ED", marginBottom: 20, fontSize: 13, lineHeight: 1.65 }}>
          <strong>Nog geen niet-merkgebonden klikken.</strong> Alle {t.klikken} klikken komen van mensen die
          de naam al kenden. Zolang dit op nul staat, trekt de site via Google geen nieuwe gasten aan —
          dat is de eerlijkste graadmeter die er is.
        </div>
      )}

      {/* Voortgang tegen de forecast */}
      <div style={{ ...kaart, marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Voortgang tegen de forecast</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>IJkpunt: {fc.label} uit het groeiplan</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14 }}>
          {[
            { label: "Vertoningen", nu: t.vertoningen, doel: fc.vertoningen, gehaald: fc.vertoningenGehaald, format: (v: number) => v.toLocaleString("nl-NL") },
            { label: "CTR", nu: t.ctr, doel: fc.ctr, gehaald: fc.ctrGehaald, format: (v: number) => `${v.toFixed(2)}%` },
            { label: "Gewogen positie", nu: t.positie, doel: fc.positie, gehaald: fc.positieGehaald, format: (v: number) => v.toFixed(1), lagerIsBeter: true },
          ].map(r => {
            const pct = r.lagerIsBeter
              ? Math.min(100, Math.round((r.doel / Math.max(r.nu, 0.01)) * 100))
              : Math.min(100, Math.round((r.nu / r.doel) * 100));
            return (
              <div key={r.label}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: C.muted }}>{r.label}</span>
                  <span style={{ fontWeight: 600, color: r.gehaald ? C.groen : C.text }}>
                    {r.format(r.nu)} <span style={{ color: C.light, fontWeight: 400 }}>/ {r.format(r.doel)}</span>
                  </span>
                </div>
                <div style={{ height: 7, background: "#E5E7EB", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99,
                    background: r.gehaald ? C.green : pct >= 60 ? C.gold : "#3B82F6" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Positieverschuiving per cluster */}
      <div style={{ ...kaart, marginBottom: 20, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px 12px" }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Positieverschuiving per cluster</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
            De eerste maanden is dit de belangrijkste graadmeter — klikken komen later.
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F9FAFB" }}>
                {["Cluster", "Vertoningen", "Klikken", "Positie", "Verschil", "Boeking", "Winbaar"].map((h, i) => (
                  <th key={h} style={{ textAlign: i === 0 ? "left" : "right", padding: "9px 14px",
                    fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase",
                    letterSpacing: ".04em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(analyse.clusters ?? []).map(c => (
                <tr key={c.cluster} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: "9px 14px", fontWeight: 500 }}>{c.cluster}</td>
                  <td style={{ padding: "9px 14px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                    {c.vertoningen.toLocaleString("nl-NL")}
                  </td>
                  <td style={{ padding: "9px 14px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{c.klikken}</td>
                  <td style={{ padding: "9px 14px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                    {c.positie.toFixed(1)}
                  </td>
                  <td style={{ padding: "9px 14px", textAlign: "right" }}>
                    <Delta waarde={c.positieVerschil} />
                  </td>
                  <td style={{ padding: "9px 14px", textAlign: "right", color: C.muted }}>{c.boeking}/5</td>
                  <td style={{ padding: "9px 14px", textAlign: "right", color: C.muted }}>
                    {Math.round(c.winbaarheid * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Kansen */}
      <div style={{ ...kaart }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>Nieuwe kansen deze maand</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>
          Alleen clusters met boekingsintentie 3 of hoger, en minimaal 10 vertoningen — daaronder is
          één positie verschil ruis.
        </div>
        {(analyse.kansen ?? []).length === 0 ? (
          <div style={{ fontSize: 13, color: C.muted }}>
            {analyse.vorigeMaand
              ? "Geen verschuivingen die de moeite waard zijn deze maand."
              : "Nog geen vergelijkingsmaand — kansen verschijnen zodra er een tweede maand is opgehaald."}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(analyse.kansen ?? []).map(k => {
              const cfg = KANS_CONFIG[k.soort];
              return (
                <div key={`${k.soort}-${k.sleutel}`} style={{
                  border: `1px solid ${C.border}`, borderRadius: 9, padding: "10px 13px",
                }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: cfg.color, background: cfg.bg,
                      padding: "2px 7px", borderRadius: 5, whiteSpace: "nowrap" }}>{cfg.label}</span>
                    <span style={{ fontWeight: 600, fontSize: 13.5 }}>{k.sleutel}</span>
                    <span style={{ fontSize: 11, color: C.light }}>
                      {k.cluster} · {k.vertoningen.toLocaleString("nl-NL")} vertoningen
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 5, lineHeight: 1.55 }}>{k.toelichting}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
