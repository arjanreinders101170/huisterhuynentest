"use client";
import { useState } from "react";
import type { Voorstel, Soort } from "@/lib/booking-import";

type Telling = Record<Soort, number> & { conflicten: number };

const C = { bg: "#F5F3EE", card: "#fff", border: "#E8E4DC", text: "#2A2418", muted: "#8A7D6A", light: "#B4AFA5", green: "#2F4F3E", gold: "#B49A5E", rood: "#9B3B2E" };

const SOORT_LABEL: Record<Soort, string> = {
  nieuw: "Nieuw", gewijzigd: "Gewijzigd", geannuleerd: "Annuleren",
  ongewijzigd: "Al verwerkt", overgeslagen: "Overslaan", fout: "Fout",
};

const SOORT_KLEUR: Record<Soort, string> = {
  nieuw: C.green, gewijzigd: C.gold, geannuleerd: C.rood,
  ongewijzigd: C.light, overgeslagen: C.light, fout: C.rood,
};

/** Alleen deze soorten leiden tot een schrijfactie. */
const TE_VERWERKEN: Soort[] = ["nieuw", "gewijzigd", "geannuleerd"];

const LODGE_LABEL: Record<string, string> = { lodge_1: "De Heide", lodge_2: "De Eik" };

function datum(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
}

function euro(n: number | null): string {
  return n === null ? "—" : `€ ${n.toFixed(2)}`;
}

export function ImportTab({ onVerwerkt }: { onVerwerkt: () => void }) {
  const [bestandsnaam, setBestandsnaam] = useState("");
  const [base64, setBase64] = useState("");
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState("");
  const [voorstellen, setVoorstellen] = useState<Voorstel[] | null>(null);
  const [telling, setTelling] = useState<Telling | null>(null);
  const [gekozen, setGekozen] = useState<Set<string>>(new Set());
  const [uitslag, setUitslag] = useState<{ toegevoegd: number; bijgewerkt: number; geannuleerd: number; mislukt: { reservering: string; reden: string }[] } | null>(null);

  const kiesBestand = async (file: File | null) => {
    setFout(""); setVoorstellen(null); setTelling(null); setUitslag(null);
    if (!file) { setBase64(""); setBestandsnaam(""); return; }
    setBestandsnaam(file.name);
    const buf = await file.arrayBuffer();
    // In stukjes, want String.fromCharCode(...) over een hele megabyte klapt de stack om.
    const bytes = new Uint8Array(buf);
    let binair = "";
    for (let i = 0; i < bytes.length; i += 8192) {
      binair += String.fromCharCode(...bytes.subarray(i, i + 8192));
    }
    setBase64(btoa(binair));
  };

  const bekijk = async () => {
    if (!base64) return;
    setBezig(true); setFout(""); setUitslag(null);
    try {
      const r = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "booking_import_preview", bestand: base64 }),
      });
      const d = await r.json();
      if (!r.ok) { setFout(d.error || "Kon het bestand niet lezen"); }
      else {
        setVoorstellen(d.voorstellen);
        setTelling(d.telling);
        /* Standaard aangevinkt staat alles wat schoon is. Regels met een
         * agendaconflict laten we bewust uit: die wil je eerst zelf zien. */
        setGekozen(new Set(
          (d.voorstellen as Voorstel[])
            .filter(v => TE_VERWERKEN.includes(v.soort) && v.conflicten.length === 0)
            .map(v => v.regel.externId),
        ));
      }
    } catch { setFout("Kon het bestand niet versturen"); }
    setBezig(false);
  };

  const verwerk = async () => {
    if (gekozen.size === 0) return;
    setBezig(true); setFout("");
    try {
      const r = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "booking_import_apply", bestand: base64, goedgekeurd: [...gekozen] }),
      });
      const d = await r.json();
      if (!r.ok) setFout(d.error || "Verwerken mislukt");
      else {
        setUitslag(d);
        setVoorstellen(null);
        setTelling(null);
        onVerwerkt();
      }
    } catch { setFout("Verwerken mislukt"); }
    setBezig(false);
  };

  const wissel = (id: string) => {
    setGekozen(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const teVerwerken = (voorstellen || []).filter(v => TE_VERWERKEN.includes(v.soort));

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 500, color: C.text, margin: 0 }}>Booking.com importeren</h2>
        <div style={{ fontSize: 13, color: C.light, marginTop: 4 }}>
          Reserveringsexport inlezen — je ziet eerst wat er gebeurt, daarna pas verwerken
        </div>
      </div>

      {/* Stap 1 — bestand kiezen */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 10 }}>1 · Bestand kiezen</div>
        <input
          type="file"
          accept=".xls,.csv,.tsv,.txt,application/vnd.ms-excel,text/csv"
          onChange={e => kiesBestand(e.target.files?.[0] ?? null)}
          style={{ fontSize: 13, color: C.text }}
        />
        <div style={{ fontSize: 12, color: C.light, marginTop: 10, lineHeight: 1.6 }}>
          Extranet → Reserveringen → Downloaden. Zowel het .xls-bestand als een CSV werkt.
          Dezelfde export twee keer inlezen kan geen kwaad: reserveringen worden herkend
          aan hun reserveringsnummer.
        </div>
        {bestandsnaam && (
          <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: C.muted }}>{bestandsnaam}</span>
            <button
              onClick={bekijk}
              disabled={bezig || !base64}
              style={{
                padding: "9px 18px", borderRadius: 8, border: "none", cursor: bezig ? "default" : "pointer",
                background: C.green, color: "#fff", fontSize: 13, fontWeight: 500, opacity: bezig ? 0.6 : 1,
              }}
            >
              {bezig ? "Bezig…" : "Bekijk wat er gebeurt"}
            </button>
          </div>
        )}
      </div>

      {fout && (
        <div style={{ background: "#FDF2F0", border: `1px solid ${C.rood}33`, color: C.rood, borderRadius: 10, padding: "12px 16px", fontSize: 13, marginBottom: 16 }}>
          {fout}
        </div>
      )}

      {uitslag && (
        <div style={{ background: "#F1F6F2", border: `1px solid ${C.green}33`, borderRadius: 10, padding: "14px 16px", fontSize: 13, color: C.text, marginBottom: 16 }}>
          <strong>Verwerkt.</strong> {uitslag.toegevoegd} toegevoegd, {uitslag.bijgewerkt} bijgewerkt, {uitslag.geannuleerd} geannuleerd.
          {uitslag.mislukt.length > 0 && (
            <div style={{ marginTop: 8, color: C.rood }}>
              {uitslag.mislukt.length} regel(s) mislukt:
              <ul style={{ margin: "6px 0 0 18px", padding: 0 }}>
                {uitslag.mislukt.map(m => <li key={m.reservering}>{m.reservering} — {m.reden}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Stap 2 — voorstel */}
      {voorstellen && telling && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 16 }}>
            {([
              { label: "Nieuw", n: telling.nieuw, kleur: C.green },
              { label: "Gewijzigd", n: telling.gewijzigd, kleur: C.gold },
              { label: "Annuleren", n: telling.geannuleerd, kleur: C.rood },
              { label: "Al verwerkt", n: telling.ongewijzigd, kleur: C.light },
              { label: "Conflicten", n: telling.conflicten, kleur: C.rood },
              { label: "Fouten", n: telling.fout + telling.overgeslagen, kleur: C.muted },
            ]).map(k => (
              <div key={k.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 22, fontWeight: 500, color: k.n > 0 ? k.kleur : C.light }}>{k.n}</div>
                <div style={{ fontSize: 11, color: C.light, marginTop: 2 }}>{k.label}</div>
              </div>
            ))}
          </div>

          {telling.conflicten > 0 && (
            <div style={{ background: "#FDF6F0", border: `1px solid ${C.gold}55`, borderRadius: 10, padding: "12px 16px", fontSize: 13, color: C.text, marginBottom: 16, lineHeight: 1.6 }}>
              <strong>Let op:</strong> {telling.conflicten} boeking(en) overlappen met iets dat al in de agenda staat.
              Die staan hieronder uitgevinkt. Controleer eerst of het om dezelfde gast gaat voordat je ze aanzet.
            </div>
          )}

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 780 }}>
                <thead>
                  <tr style={{ background: C.bg }}>
                    {["", "Wat", "Gast", "Lodge", "Aankomst", "Vertrek", "Bedrag", "Commissie", "Bijzonderheden"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 11, fontWeight: 600, color: C.muted, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {voorstellen.map(v => {
                    const kiesbaar = TE_VERWERKEN.includes(v.soort);
                    const opmerkingen = [
                      ...v.conflicten.map(c => `Overlapt met ${c}`),
                      ...v.regel.waarschuwingen,
                      ...v.wijzigingen.map(w => `${w.veld}: ${w.van} → ${w.naar}`),
                      ...(kiesbaar ? [] : [v.toelichting]),
                    ];
                    return (
                      <tr key={`${v.regel.externId}-${v.regel.regelnummer}`} style={{ borderTop: `1px solid ${C.border}`, opacity: kiesbaar ? 1 : 0.6 }}>
                        <td style={{ padding: "10px 12px" }}>
                          {kiesbaar ? (
                            <input
                              type="checkbox"
                              checked={gekozen.has(v.regel.externId)}
                              onChange={() => wissel(v.regel.externId)}
                              aria-label={`${SOORT_LABEL[v.soort]} — ${v.regel.gastNaam}`}
                            />
                          ) : <span style={{ color: C.light }}>—</span>}
                        </td>
                        <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                          <span style={{ color: SOORT_KLEUR[v.soort], fontWeight: 500 }}>{SOORT_LABEL[v.soort]}</span>
                        </td>
                        <td style={{ padding: "10px 12px", color: C.text }}>{v.regel.gastNaam || "—"}</td>
                        <td style={{ padding: "10px 12px", color: C.muted, whiteSpace: "nowrap" }}>{v.regel.lodge ? LODGE_LABEL[v.regel.lodge] : "?"}</td>
                        <td style={{ padding: "10px 12px", color: C.muted, whiteSpace: "nowrap" }}>{datum(v.regel.checkIn)}</td>
                        <td style={{ padding: "10px 12px", color: C.muted, whiteSpace: "nowrap" }}>{datum(v.regel.checkOut)}</td>
                        <td style={{ padding: "10px 12px", color: C.text, whiteSpace: "nowrap" }}>{euro(v.regel.bedrag)}</td>
                        <td style={{ padding: "10px 12px", color: C.muted, whiteSpace: "nowrap" }}>{euro(v.regel.commissie)}</td>
                        <td style={{ padding: "10px 12px", color: v.conflicten.length > 0 ? C.rood : C.muted, fontSize: 12, lineHeight: 1.5 }}>
                          {opmerkingen.length > 0 ? opmerkingen.join(" · ") : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stap 3 — verwerken */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <button
              onClick={verwerk}
              disabled={bezig || gekozen.size === 0}
              style={{
                padding: "11px 22px", borderRadius: 8, border: "none",
                cursor: bezig || gekozen.size === 0 ? "default" : "pointer",
                background: gekozen.size === 0 ? C.light : C.green, color: "#fff",
                fontSize: 14, fontWeight: 500, opacity: bezig ? 0.6 : 1,
              }}
            >
              {bezig ? "Bezig…" : `Verwerk ${gekozen.size} van ${teVerwerken.length}`}
            </button>
            {teVerwerken.length > 0 && (
              <button
                onClick={() => setGekozen(gekozen.size === teVerwerken.length
                  ? new Set()
                  : new Set(teVerwerken.map(v => v.regel.externId)))}
                style={{ padding: "11px 18px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.card, color: C.muted, fontSize: 13, cursor: "pointer" }}
              >
                {gekozen.size === teVerwerken.length ? "Niets selecteren" : "Alles selecteren"}
              </button>
            )}
            <span style={{ fontSize: 12, color: C.light }}>Er wordt nog niets opgeslagen tot je hierop klikt.</span>
          </div>
        </>
      )}
    </div>
  );
}
