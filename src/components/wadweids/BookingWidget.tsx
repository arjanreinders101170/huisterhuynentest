"use client";
import { useEffect, useMemo, useState } from "react";
import type { BookingConfirmation, Property } from "@/lib/wadweids/types";
import { calendarMonth, firstBookableStay, quoteFor } from "@/lib/wadweids/mytourist";
import { addDays, dayMonth, euro, iso, longDate } from "@/lib/wadweids/format";
import { IconArrow, IconCheck, IconChevron } from "./Icons";

/* ══════════════════════════════════════════════════════════════════════
   Boekingsmodule
   ──────────────────────────────────────────────────────────────────────
   Dit is het scharnierpunt tussen website en PMS. In de mock-up rekent
   quoteFor() de prijs uit; live komt exact hetzelfde Quote-object van
   MyTourist terug (POST /quotes) en verandert er aan deze component niets.

   De volgorde is bewust: prijs → data → gasten → extra's → totaal → boeken.
   De gast ziet nooit een bedrag dat later nog verandert.
   ══════════════════════════════════════════════════════════════════════ */
const DOW = ["ma", "di", "wo", "do", "vr", "za", "zo"];

export function BookingWidget({ property }: { property: Property }) {
  const [arrival, setArrival] = useState("");
  const [departure, setDeparture] = useState("");
  const [guests, setGuests] = useState(Math.min(2, property.guests));
  const [extras, setExtras] = useState<string[]>([]);
  const [maand, setMaand] = useState<{ y: number; m: number } | null>(null);
  const [bevestiging, setBevestiging] = useState<BookingConfirmation | null>(null);

  /* Data pas na mount zetten: de server weet niet welke dag het bij de
     bezoeker is, en een verschil zou de hydratie breken. */
  useEffect(() => {
    const stay = firstBookableStay(property, addDays(iso(new Date()), 14), Math.max(3, property.minNights));
    setArrival(stay.arrival);
    setDeparture(stay.departure);
    const d = new Date(stay.arrival + "T12:00:00");
    setMaand({ y: d.getFullYear(), m: d.getMonth() });
  }, [property]);

  const quote = useMemo(
    () => (arrival && departure ? quoteFor(property, { propertyId: property.id, arrival, departure, guests, extras }) : null),
    [property, arrival, departure, guests, extras]
  );

  const dagen = useMemo(() => (maand ? calendarMonth(property, maand.y, maand.m) : []), [property, maand]);
  const offset = useMemo(() => {
    if (!dagen.length) return 0;
    const first = new Date(dagen[0].date + "T12:00:00").getDay();
    return (first + 6) % 7; // maandag eerst
  }, [dagen]);

  const boek = () => {
    if (!quote?.available) return;
    setBevestiging({
      reference: `WW-${new Date().getFullYear()}-${property.id.slice(-4)}`,
      status: "option",
      quote,
    });
  };

  const toggleExtra = (key: string) =>
    setExtras((list) => (list.includes(key) ? list.filter((k) => k !== key) : [...list, key]));

  if (bevestiging) {
    return (
      <div className="ww-booking">
        <span className="ww-booking__status"><span className="ww-dot" /> Optie vastgelegd</span>
        <h3 className="ww-h3 ww-mt-s">Bedankt — we houden {property.name} voor je vast.</h3>
        <p className="ww-body ww-mt-s" style={{ fontSize: ".92rem" }}>
          Reserveringsnummer <strong>{bevestiging.reference}</strong>. Je ontvangt binnen enkele minuten een
          bevestiging met een betaallink voor de aanbetaling van {euro(bevestiging.quote.deposit)}.
        </p>
        <div className="ww-booking__lines ww-mt-m">
          <div className="ww-booking__line"><span>Aankomst</span><span>{longDate(bevestiging.quote.arrival)}</span></div>
          <div className="ww-booking__line"><span>Vertrek</span><span>{longDate(bevestiging.quote.departure)}</span></div>
          <div className="ww-booking__line"><span>Gasten</span><span>{bevestiging.quote.guests}</span></div>
        </div>
        <div className="ww-booking__total"><span>Totaal</span><strong>{euro(bevestiging.quote.total, true)}</strong></div>
        <button className="ww-btn ww-btn--ghost ww-btn--block ww-mt-m" onClick={() => setBevestiging(null)}>
          Terug naar de kalender
        </button>
        <p className="ww-booking__note">In de echte site legt MyTourist deze optie vast en verstuurt hij de bevestiging.</p>
      </div>
    );
  }

  return (
    <div className="ww-booking">
      <div className="ww-booking__price">
        <span className="ww-price">
          {euro(quote?.averageRate ?? property.priceFrom)} <small>gemiddeld per nacht</small>
        </span>
        <span className="ww-booking__status">
          <span className={`ww-dot${quote && !quote.available ? " ww-dot--busy" : ""}`} />
          {quote?.available ? "Beschikbaar" : "Bezet"}
        </span>
      </div>

      <div className="ww-booking__dates">
        <div className="ww-field">
          <label htmlFor="bk-arr">Aankomst</label>
          <input
            id="bk-arr" type="date" min={iso(new Date())} value={arrival}
            onChange={(e) => {
              setArrival(e.target.value);
              if (e.target.value && departure <= e.target.value) setDeparture(addDays(e.target.value, property.minNights));
              const d = new Date(e.target.value + "T12:00:00");
              if (!isNaN(+d)) setMaand({ y: d.getFullYear(), m: d.getMonth() });
            }}
          />
        </div>
        <div className="ww-field">
          <label htmlFor="bk-dep">Vertrek</label>
          <input
            id="bk-dep" type="date" min={arrival ? addDays(arrival, 1) : undefined}
            value={departure} onChange={(e) => setDeparture(e.target.value)}
          />
        </div>
      </div>

      <div className="ww-booking__guests">
        <div className="ww-field">
          <label htmlFor="bk-guests">Gasten</label>
          <select id="bk-guests" value={guests} onChange={(e) => setGuests(+e.target.value)}>
            {Array.from({ length: property.guests }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? "gast" : "gasten"}</option>
            ))}
          </select>
          <span className="ww-field__caret"><IconChevron /></span>
        </div>
      </div>

      {property.extras.length > 0 && (
        <div className="ww-mt-m">
          <h4 style={{ fontSize: ".72rem", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-soft)", marginBottom: 10 }}>
            Extra&apos;s
          </h4>
          {property.extras.map((extra) => (
            <label className="ww-extra" key={extra.key}>
              <input
                type="checkbox" className="ww-checkbox" style={{ marginTop: 3 }}
                checked={extras.includes(extra.key)} onChange={() => toggleExtra(extra.key)}
              />
              <span>
                {extra.label}
                <span style={{ display: "block", color: "var(--ink-soft)", fontSize: ".82rem" }}>{extra.description}</span>
              </span>
              <span className="ww-extra__price">
                {extra.price === 0 ? "gratis" : `${euro(extra.price)}${extra.unit === "night" ? " p.n." : extra.unit === "person" ? " p.p." : ""}`}
              </span>
            </label>
          ))}
        </div>
      )}

      {quote && (
        <>
          <div className="ww-booking__lines">
            {quote.lines.map((line) => (
              <div className={`ww-booking__line${line.kind === "extra" ? " ww-booking__line--extra" : ""}`} key={line.label}>
                <span>
                  {line.label}
                  {line.detail && <em style={{ fontStyle: "normal", opacity: .6, fontSize: ".8rem" }}> · {line.detail}</em>}
                </span>
                <span>{euro(line.amount, line.kind === "tax")}</span>
              </div>
            ))}
          </div>
          <div className="ww-booking__total">
            <span>Totaal {quote.nights > 0 ? `· ${quote.nights} ${quote.nights === 1 ? "nacht" : "nachten"}` : ""}</span>
            <strong>{euro(quote.total, true)}</strong>
          </div>
        </>
      )}

      <button
        className="ww-btn ww-btn--primary ww-btn--block ww-btn--lg ww-mt-m"
        onClick={boek} disabled={!quote?.available}
        style={!quote?.available ? { opacity: .45, cursor: "not-allowed" } : undefined}
      >
        Boek nu <IconArrow size={14} />
      </button>

      <p className="ww-booking__note">
        {quote?.available
          ? `Aanbetaling ${euro(quote.deposit)} · rest 30 dagen voor aankomst · gratis annuleren tot 60 dagen vooraf`
          : quote?.reason ?? "Kies een periode om de prijs te zien."}
      </p>

      {/* Beschikbaarheid — in de mock-up berekend, live rechtstreeks uit
          de MyTourist-kalender van deze woning. */}
      {maand && (
        <div className="ww-mt-l">
          <div className="ww-row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
            <button
              aria-label="Vorige maand"
              onClick={() => setMaand((cur) => (cur === null ? cur : cur.m === 0 ? { y: cur.y - 1, m: 11 } : { y: cur.y, m: cur.m - 1 }))}
              style={{ transform: "rotate(90deg)" }}
            ><IconChevron /></button>
            <strong style={{ fontFamily: "var(--serif)", fontSize: "1.15rem", fontWeight: 500 }}>
              {new Date(maand.y, maand.m, 1).toLocaleDateString("nl-NL", { month: "long", year: "numeric" })}
            </strong>
            <button
              aria-label="Volgende maand"
              onClick={() => setMaand((cur) => (cur === null ? cur : cur.m === 11 ? { y: cur.y + 1, m: 0 } : { y: cur.y, m: cur.m + 1 }))}
              style={{ transform: "rotate(-90deg)" }}
            ><IconChevron /></button>
          </div>
          <div className="ww-cal">
            {DOW.map((d) => <span className="ww-cal__dow" key={d}>{d}</span>)}
            {Array.from({ length: offset }, (_, i) => <span className="ww-cal__day ww-cal__day--out" key={`o${i}`} />)}
            {dagen.map((dag) => {
              const gekozen = arrival && departure && dag.date >= arrival && dag.date < departure;
              const cls = gekozen ? "ww-cal__day ww-cal__day--sel" : dag.available ? "ww-cal__day" : "ww-cal__day ww-cal__day--busy";
              return (
                <button
                  key={dag.date} className={cls} disabled={!dag.available}
                  title={dag.available ? `${dayMonth(dag.date)} · ${euro(dag.rate)}` : `${dayMonth(dag.date)} · bezet`}
                  onClick={() => {
                    if (!arrival || departure || dag.date <= arrival) { setArrival(dag.date); setDeparture(""); }
                    else setDeparture(dag.date);
                  }}
                >
                  {Number(dag.date.slice(-2))}
                </button>
              );
            })}
          </div>
          <div className="ww-cal__legend">
            <span><i className="ww-swatch" /> beschikbaar</span>
            <span><i className="ww-swatch ww-swatch--busy" /> bezet</span>
            <span><IconCheck size={13} /> live uit MyTourist</span>
          </div>
        </div>
      )}
    </div>
  );
}
