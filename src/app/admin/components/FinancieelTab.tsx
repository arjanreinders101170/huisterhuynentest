"use client";
import { useState } from "react";
import { Booking, BookingRequest, Stay } from "../types";
import { Badge } from "./Badge";
import { Table } from "./ReservationTimeline";

const MAANDEN = ["Jan","Feb","Mrt","Apr","Mei","Jun","Jul","Aug","Sep","Okt","Nov","Dec"];

export function FinancieelTab({ bookings, bookingRequests, stays }: { bookings: Booking[]; bookingRequests: BookingRequest[]; stays: Stay[] }) {
  const C = { bg: "#F5F3EE", card: "#fff", border: "#E8E4DC", text: "#2A2418", muted: "#8A7D6A", light: "#B4AFA5", green: "#2F4F3E", gold: "#B49A5E" };

  const [jaar, setJaar] = useState(new Date().getFullYear());

  // Verblijfsomzet = bevestigde booking_requests met totaal
  const verblijfsBoekingen = bookingRequests.filter(r => r.status === "bevestigd" && r.totaal);
  const totaalVerblijf = verblijfsBoekingen.reduce((s, r) => s + Number(r.totaal || 0), 0);

  // Upsell omzet = betaalde bookings
  const betaaldeBookings = bookings.filter(b => b.status === "betaald" || b.status === "bevestigd");
  const totaalUpsell = betaaldeBookings.reduce((s, b) => s + (b.prijs || 0), 0);

  /* Booking.com-omzet komt uit de geïmporteerde verblijven. Bruto is wat de
   * gast bij Booking.com betaalt, netto is wat er na commissie binnenkomt.
   *
   * Let op bij het vergelijken met de directe boekingen hierboven: die tellen
   * met `totaal`, en daar zitten eindschoonmaak en toeristenbelasting al in
   * (zie _booking-requests.ts). Booking.com rekent die niet af — bedlinnen,
   * eindschoonmaak en toeristenbelasting factureren we zelf na afloop. Het
   * Booking.com-bedrag is dus alleen logies en valt om die reden lager uit dan
   * een directe boeking van dezelfde week. De labels zeggen dat er expliciet
   * bij; ze optellen zonder dat onderscheid zou een verkeerd beeld geven. */
  const getal = (v: number | string | null | undefined): number => {
    const n = Number(v ?? 0);
    return Number.isFinite(n) ? n : 0;
  };
  const bookingStays = stays.filter(s => s.bron === "booking_com" && s.status !== "geannuleerd");
  const bookingBruto = bookingStays.reduce((som, s) => som + getal(s.extern_bedrag), 0);
  const bookingCommissie = bookingStays.reduce((som, s) => som + getal(s.extern_commissie), 0);
  const bookingNetto = bookingBruto - bookingCommissie;
  const commissiePct = bookingBruto > 0 ? (bookingCommissie / bookingBruto) * 100 : 0;

  /* De eindfactuur maakt de vergelijking pas rond: schoonmaak, bedlinnen en
   * toeristenbelasting zitten bij een directe boeking in `totaal`, en komen bij
   * Booking.com hierlangs binnen. Alleen wat daadwerkelijk gefactureerd is telt
   * als omzet; wat nog openstaat staat apart, als werkvoorraad. */
  const gefactureerd = bookingStays.filter(
    s => s.eindfactuur_status === "verstuurd" || s.eindfactuur_status === "voldaan");
  const bookingEindfactuur = gefactureerd.reduce((som, s) => som + getal(s.eindfactuur_totaal), 0);
  const nogTeFactureren = bookingStays
    .filter(s => (s.eindfactuur_status ?? "open") === "open")
    .reduce((som, s) => som + getal(s.eindfactuur_totaal), 0);

  /* Gerealiseerd versus nog te komen. De bedragen hierboven zijn alles wat er
   * geboekt staat, ook verblijven die nog moeten plaatsvinden — Booking.com
   * boekt ver vooruit, dus dat loopt flink uiteen. Gerealiseerd is wat er
   * daadwerkelijk verbleven is: uitgecheckt op of vóór vandaag. Booking.com
   * betaalt pas ná het verblijf uit, dus dit is ook het bedrag dat inmiddels
   * op de rekening hoort te staan. */
  const vandaag = new Date();
  vandaag.setHours(0, 0, 0, 0);
  const isGerealiseerd = (s: Stay) => {
    if (!s.check_out) return false;
    const uit = new Date(s.check_out);
    uit.setHours(0, 0, 0, 0);
    return uit.getTime() <= vandaag.getTime();
  };
  const gerealiseerdeStays = bookingStays.filter(isGerealiseerd);
  const komendeStays = bookingStays.filter(s => !isGerealiseerd(s));
  const gerealiseerdBruto = gerealiseerdeStays.reduce((som, s) => som + getal(s.extern_bedrag), 0);
  const gerealiseerdCommissie = gerealiseerdeStays.reduce((som, s) => som + getal(s.extern_commissie), 0);
  const gerealiseerdNetto = gerealiseerdBruto - gerealiseerdCommissie;
  const gerealiseerdEindfactuur = gefactureerd
    .filter(isGerealiseerd)
    .reduce((som, s) => som + getal(s.eindfactuur_totaal), 0);
  const gerealiseerdTotaal = gerealiseerdNetto + gerealiseerdEindfactuur;
  const komendNetto = komendeStays.reduce(
    (som, s) => som + getal(s.extern_bedrag) - getal(s.extern_commissie), 0);

  const totaalOmzet = totaalVerblijf + totaalUpsell + bookingNetto + bookingEindfactuur;

  // Geboekte nachten via stays
  const geboekteStays = stays.filter(s => s.status !== "geannuleerd");
  const totaalNachten = geboekteStays.reduce((s, stay) => {
    if (!stay.check_in || !stay.check_out) return s;
    return s + Math.max(0, Math.round((new Date(stay.check_out).getTime() - new Date(stay.check_in).getTime()) / 86400000));
  }, 0);

  // Per maand (verblijf op basis van booking_request created_at, upsell op booking created_at)
  type MaandData = { verblijf: number; upsell: number; booking: number; eindfactuur: number; boekingen: number };
  const perMaand: MaandData[] = Array.from({ length: 12 }, () => ({ verblijf: 0, upsell: 0, booking: 0, eindfactuur: 0, boekingen: 0 }));

  verblijfsBoekingen.forEach(r => {
    const d = new Date(r.created_at);
    if (d.getFullYear() === jaar) {
      perMaand[d.getMonth()].verblijf += Number(r.totaal || 0);
      perMaand[d.getMonth()].boekingen += 1;
    }
  });
  betaaldeBookings.forEach(b => {
    const d = new Date(b.created_at);
    if (d.getFullYear() === jaar) {
      perMaand[d.getMonth()].upsell += b.prijs || 0;
    }
  });

  /* Op de boekingsdatum, net als de directe boekingen hierboven — anders zou
   * dezelfde grafiek twee verschillende momenten door elkaar tonen. Ontbreekt
   * die datum in de export, dan valt hij terug op de aankomstdatum. */
  bookingStays.forEach(s => {
    const d = new Date(s.geboekt_op || s.check_in);
    if (d.getFullYear() === jaar) {
      perMaand[d.getMonth()].booking += getal(s.extern_bedrag) - getal(s.extern_commissie);
      perMaand[d.getMonth()].boekingen += 1;
    }
  });

  /* Een eindfactuur gaat pas ná het verblijf de deur uit, dus die telt op de
   * vertrekmaand — niet op de boekingsmaand zoals het logies hierboven. */
  gefactureerd.forEach(s => {
    const d = new Date(s.check_out);
    if (d.getFullYear() === jaar) perMaand[d.getMonth()].eindfactuur += getal(s.eindfactuur_totaal);
  });

  const maxMaand = Math.max(...perMaand.map(m => m.verblijf + m.upsell + m.booking + m.eindfactuur), 1);

  // Per lodge (stays)
  const lodge1Stays = geboekteStays.filter(s => s.lodge === "lodge_1");
  const lodge2Stays = geboekteStays.filter(s => s.lodge === "lodge_2");
  const lodgeNachten = (list: Stay[]) => list.reduce((s, st) => {
    if (!st.check_in || !st.check_out) return s;
    return s + Math.max(0, Math.round((new Date(st.check_out).getTime() - new Date(st.check_in).getTime()) / 86400000));
  }, 0);

  // Conversie
  const totaalAanvragen = bookingRequests.length;
  const offertesVerstuurd = bookingRequests.filter(r => r.status !== "nieuw").length;
  const geboekt = bookingRequests.filter(r => r.status === "bevestigd").length;
  const convPct = totaalAanvragen > 0 ? Math.round((geboekt / totaalAanvragen) * 100) : 0;

  const cs: React.CSSProperties = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 24px" };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 500, color: C.text }}>Financieel overzicht</div>
          <div style={{ fontSize: 13, color: C.light, marginTop: 2 }}>Omzet, boekingen en conversie</div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button onClick={() => setJaar(j => j - 1)} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.border}`, background: C.card, fontSize: 14, color: C.muted, cursor: "pointer" }}>‹</button>
          <span style={{ fontSize: 14, fontWeight: 500, color: C.text, minWidth: 44, textAlign: "center" }}>{jaar}</span>
          <button onClick={() => setJaar(j => j + 1)} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.border}`, background: C.card, fontSize: 14, color: C.muted, cursor: "pointer" }}>›</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Totale omzet", value: `€ ${totaalOmzet.toFixed(2)}`, color: C.green, sub: "direct + Booking.com netto + upsells" },
          { label: "Direct geboekt", value: `€ ${totaalVerblijf.toFixed(2)}`, color: C.text, sub: `${verblijfsBoekingen.length} boekingen, incl. schoonmaak en toeristenbelasting` },
          { label: "Booking.com logies", value: `€ ${bookingNetto.toFixed(2)}`, color: "#2F4F6F", sub: `${bookingStays.length} boekingen, na commissie` },
          { label: "Booking.com gerealiseerd", value: `€ ${gerealiseerdTotaal.toFixed(2)}`, color: "#2F4F6F", sub: `${gerealiseerdeStays.length} verbleven t/m vandaag, incl. eindfactuur` },
          { label: "Eindfacturen", value: `€ ${bookingEindfactuur.toFixed(2)}`, color: "#6B7F94", sub: nogTeFactureren > 0 ? `€ ${nogTeFactureren.toFixed(2)} nog te factureren` : `${gefactureerd.length} gefactureerd` },
          { label: "Upsell omzet", value: `€ ${totaalUpsell.toFixed(2)}`, color: C.gold, sub: `${betaaldeBookings.length} betalingen` },
          { label: "Geboekte nachten", value: String(totaalNachten), color: "#1565C0", sub: `${geboekteStays.length} verblijven` },
        ].map((k, i) => (
          <div key={i} style={{ background: C.bg, borderRadius: 10, padding: "16px 18px" }}>
            <div style={{ fontSize: 11, color: C.light, marginBottom: 4, textTransform: "uppercase", letterSpacing: .4 }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: k.color, marginBottom: 2 }}>{k.value}</div>
            <div style={{ fontSize: 11, color: C.light }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Maandoverzicht */}
      <div style={{ ...cs, marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 20 }}>Omzet per maand — {jaar}</div>

        {/* Bar chart */}
        <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 120, marginBottom: 8 }}>
          {perMaand.map((m, i) => {
            const totaal = m.verblijf + m.upsell + m.booking + m.eindfactuur;
            const verblijfH = maxMaand > 0 ? (m.verblijf / maxMaand) * 100 : 0;
            const upsellH = maxMaand > 0 ? (m.upsell / maxMaand) * 100 : 0;
            const bookingH = maxMaand > 0 ? (m.booking / maxMaand) * 100 : 0;
            const eindH = maxMaand > 0 ? (m.eindfactuur / maxMaand) * 100 : 0;
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                {totaal > 0 && (
                  <div style={{ fontSize: 9, color: C.muted, marginBottom: 2 }}>€{Math.round(totaal)}</div>
                )}
                <div style={{ width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", height: 90, gap: 1 }}>
                  <div style={{ width: "100%", height: `${upsellH}%`, background: C.gold, borderRadius: "3px 3px 0 0", minHeight: upsellH > 0 ? 2 : 0 }} />
                  <div style={{ width: "100%", height: `${eindH}%`, background: "#6B7F94", borderRadius: upsellH > 0 ? 0 : "3px 3px 0 0", minHeight: eindH > 0 ? 2 : 0 }} />
                  <div style={{ width: "100%", height: `${bookingH}%`, background: "#2F4F6F", borderRadius: upsellH > 0 || eindH > 0 ? 0 : "3px 3px 0 0", minHeight: bookingH > 0 ? 2 : 0 }} />
                  <div style={{ width: "100%", height: `${verblijfH}%`, background: C.green, borderRadius: upsellH > 0 || bookingH > 0 || eindH > 0 ? 0 : "3px 3px 0 0", minHeight: verblijfH > 0 ? 2 : 0 }} />
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {MAANDEN.map((m, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center", fontSize: 10, color: C.light }}>{m}</div>
          ))}
        </div>

        {/* Legenda */}
        <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.muted }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: C.green }} /> Direct
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.muted }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: "#2F4F6F" }} /> Booking.com (logies, netto)
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.muted }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: "#6B7F94" }} /> Eindfacturen
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: C.muted }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: C.gold }} /> Upsells
          </div>
        </div>

        {/* Tabel */}
        <div style={{ marginTop: 20, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "62px 1fr 1fr 1fr 1fr 1fr 50px", padding: "8px 16px", background: C.bg, fontSize: 11, color: C.light, borderBottom: `1px solid ${C.border}` }}>
            <div>Maand</div><div>Direct</div><div>Booking.com</div><div>Eindfact.</div><div>Upsells</div><div>Totaal</div><div>Boek.</div>
          </div>
          {perMaand.map((m, i) => {
            const totaal = m.verblijf + m.upsell + m.booking + m.eindfactuur;
            if (totaal === 0 && m.boekingen === 0) return null;
            return (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "62px 1fr 1fr 1fr 1fr 1fr 50px", padding: "10px 16px", fontSize: 12, borderBottom: `1px solid ${C.border}`, alignItems: "center" }}>
                <div style={{ color: C.text, fontWeight: 500 }}>{MAANDEN[i]}</div>
                <div style={{ color: C.muted }}>{m.verblijf > 0 ? `€ ${m.verblijf.toFixed(2)}` : "—"}</div>
                <div style={{ color: C.muted }}>{m.booking > 0 ? `€ ${m.booking.toFixed(2)}` : "—"}</div>
                <div style={{ color: C.muted }}>{m.eindfactuur > 0 ? `€ ${m.eindfactuur.toFixed(2)}` : "—"}</div>
                <div style={{ color: C.muted }}>{m.upsell > 0 ? `€ ${m.upsell.toFixed(2)}` : "—"}</div>
                <div style={{ color: C.text, fontWeight: 500 }}>{totaal > 0 ? `€ ${totaal.toFixed(2)}` : "—"}</div>
                <div style={{ color: C.muted }}>{m.boekingen || "—"}</div>
              </div>
            );
          })}
          {perMaand.every(m => m.verblijf + m.upsell + m.booking + m.eindfactuur === 0) && (
            <div style={{ padding: 16, fontSize: 12, color: C.light, textAlign: "center" }}>Nog geen omzet in {jaar}</div>
          )}
        </div>
      </div>

      {/* Kanalen — wat een boeking via Booking.com kost ten opzichte van direct */}
      {bookingStays.length > 0 && (
        <div style={{ ...cs, marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 4 }}>Kanalen</div>
          <div style={{ fontSize: 12, color: C.light, marginBottom: 18 }}>
            Booking.com-cijfers komen uit de geïmporteerde reserveringsexport
          </div>

          <div style={{ background: "#EEF2F7", borderRadius: 8, padding: "12px 16px", fontSize: 12, color: C.text, lineHeight: 1.6, marginBottom: 16 }}>
            Booking.com rekent alleen het logies af. Bedlinnen, eindschoonmaak en
            toeristenbelasting factureren we zelf na afloop; die staan hieronder apart.
            Bij een directe boeking zitten ze al in het totaal, dus pas mét de eindfactuur
            erbij zijn de twee kanalen te vergelijken.
            {nogTeFactureren > 0 && (
              <> Er staat nu <strong>€ {nogTeFactureren.toFixed(2)}</strong> aan eindfacturen open;
              dat telt nog niet als omzet mee.</>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
            {[
              { label: "Bruto via Booking.com", value: `€ ${bookingBruto.toFixed(2)}`, sub: "logies, wat de gast daar betaalt", color: C.text },
              { label: "Commissie", value: `− € ${bookingCommissie.toFixed(2)}`, sub: `${commissiePct.toFixed(1)}% van bruto`, color: "#9B3B2E" },
              { label: "Netto uitbetaald", value: `€ ${bookingNetto.toFixed(2)}`, sub: `${bookingStays.length} boekingen, excl. eindfactuur`, color: "#2F4F6F" },
              { label: "Eindfacturen", value: `€ ${bookingEindfactuur.toFixed(2)}`, sub: `${gefactureerd.length} verstuurd of betaald`, color: "#6B7F94" },
              { label: "Totaal per boeking", value: `€ ${(bookingStays.length > 0 ? (bookingNetto + bookingEindfactuur) / bookingStays.length : 0).toFixed(2)}`, sub: "netto logies + eindfactuur", color: C.muted },
            ].map(k => (
              <div key={k.label} style={{ background: C.bg, borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 11, color: C.light, marginBottom: 4 }}>{k.label}</div>
                <div style={{ fontSize: 19, fontWeight: 600, color: k.color }}>{k.value}</div>
                <div style={{ fontSize: 11, color: C.light, marginTop: 2 }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Gerealiseerd — wat er verbleven is, tegenover wat er nog aankomt.
              Booking.com boekt ver vooruit, dus zonder dit onderscheid lijkt de
              omzet hoger dan wat er tot nu toe daadwerkelijk binnen is. */}
          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ background: "#EEF2F7", borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 11, color: C.light, marginBottom: 4 }}>Gerealiseerd t/m vandaag</div>
              <div style={{ fontSize: 19, fontWeight: 600, color: "#2F4F6F" }}>€ {gerealiseerdTotaal.toFixed(2)}</div>
              <div style={{ fontSize: 11, color: C.light, marginTop: 2 }}>
                {gerealiseerdeStays.length} verbleven · € {gerealiseerdNetto.toFixed(2)} netto logies
                {gerealiseerdEindfactuur > 0 ? ` + € ${gerealiseerdEindfactuur.toFixed(2)} eindfactuur` : ""}
              </div>
            </div>
            <div style={{ background: C.bg, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 11, color: C.light, marginBottom: 4 }}>Nog te komen</div>
              <div style={{ fontSize: 19, fontWeight: 600, color: C.muted }}>€ {komendNetto.toFixed(2)}</div>
              <div style={{ fontSize: 11, color: C.light, marginTop: 2 }}>
                {komendeStays.length} geboekt · netto logies, nog niet uitbetaald
              </div>
            </div>
          </div>
          {gerealiseerdCommissie > 0 && (
            <div style={{ fontSize: 11, color: C.light, marginTop: 8 }}>
              Van het gerealiseerde deel ging € {gerealiseerdCommissie.toFixed(2)} commissie af
              (bruto € {gerealiseerdBruto.toFixed(2)}).
            </div>
          )}

          {bookingCommissie > 0 && (
            <div style={{ marginTop: 16, padding: "12px 16px", background: "#FDF6F0", borderRadius: 8, fontSize: 12, color: C.text, lineHeight: 1.6 }}>
              Diezelfde boekingen direct via de eigen site hadden <strong>€ {bookingCommissie.toFixed(2)}</strong> meer opgeleverd.
            </div>
          )}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        {/* Per lodge */}
        <div style={cs}>
          <div style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 16 }}>Per lodge</div>
          {[
            { naam: "Lodge De Heide", list: lodge1Stays },
            { naam: "Lodge De Eik", list: lodge2Stays },
          ].map(({ naam, list }) => {
            const n = lodgeNachten(list);
            const pct = totaalNachten > 0 ? (n / totaalNachten) * 100 : 0;
            return (
              <div key={naam} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.text, marginBottom: 6 }}>
                  <span style={{ fontWeight: 500 }}>{naam}</span>
                  <span style={{ color: C.muted }}>{list.length} verblijven · {n} nachten</span>
                </div>
                <div style={{ height: 6, background: C.bg, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: C.green, borderRadius: 3 }} />
                </div>
              </div>
            );
          })}
          {geboekteStays.length === 0 && <div style={{ fontSize: 12, color: C.light, textAlign: "center" }}>Nog geen verblijven</div>}
        </div>

        {/* Conversie */}
        <div style={cs}>
          <div style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 16 }}>Aanvraag-conversie</div>
          {[
            { label: "Aanvragen ontvangen", value: totaalAanvragen, color: C.muted },
            { label: "Offerte verstuurd", value: offertesVerstuurd, color: C.gold },
            { label: "Geboekt", value: geboekt, color: C.green },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: C.muted }}>{label}</span>
              <span style={{ fontSize: 18, fontWeight: 600, color }}>{value}</span>
            </div>
          ))}
          <div style={{ paddingTop: 12, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: C.muted }}>Conversie (aanvraag → geboekt)</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: convPct >= 50 ? C.green : convPct >= 25 ? C.gold : "#E24B4A" }}>
              {convPct}%
            </span>
          </div>
        </div>
      </div>

      {/* Recente betalingen */}
      {betaaldeBookings.length > 0 && (
        <div style={cs}>
          <div style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 16 }}>Recente upsell-betalingen</div>
          <Table
            cols={["Product", "Bedrag", "Status", "Datum"]}
            widths={["3fr", "1fr", "1fr", "1fr"]}
            rows={betaaldeBookings.slice(0, 10).map(b => [
              b.product,
              `€ ${(b.prijs || 0).toFixed(2)}`,
              <Badge key={b.id} status={b.status} />,
              new Date(b.created_at).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "2-digit" }),
            ])}
          />
        </div>
      )}
    </>
  );
}
