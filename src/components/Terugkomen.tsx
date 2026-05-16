"use client";
import { useState, useMemo, useEffect } from "react";
import { T, cardStyle, type Route } from "@/data/tokens";
import { IcCheck, IcArrow } from "./icons";
import { useLanguage } from "@/i18n";
import { BOOKINGS_OPEN_FROM, LODGE_NAMES, MAX_GUESTS_PER_LODGE } from "@/data/lodge";

type Lodge = "lodge_1" | "lodge_2";
type ICalEvent = { start: string; end: string };
type DayStatus = "preferred" | "other" | "booked";

type Props = {
  onNavigate: (r: Route) => void;
  preferredLodge?: Lodge | null;
  /** Herkomst van de aanvraag — bepaalt de 'bron' in booking_requests. */
  bron?: "terugkomer" | "app";
};

const MONTHS_NL = ["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"];
const MONTHS_DE = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
const DAYS_NL = ["Ma","Di","Wo","Do","Vr","Za","Zo"];
const DAYS_DE = ["Mo","Di","Mi","Do","Fr","Sa","So"];
const LODGE_LABELS: Record<Lodge, string> = LODGE_NAMES;

function toKey(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
function fromKey(s: string) { return new Date(s + "T12:00:00"); }
function isDayBooked(iso: string, events: ICalEvent[]): boolean {
  return events.some(e => iso >= e.start && iso < e.end);
}

export function Terugkomen({ onNavigate, preferredLodge, bron = "terugkomer" }: Props) {
  const { t, lang } = useLanguage();
  const MONTHS = lang === "de" ? MONTHS_DE : MONTHS_NL;
  const DAYS = lang === "de" ? DAYS_DE : DAYS_NL;
  const [step, setStep] = useState(1);
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [persons, setPersons] = useState(2);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [returningGuest, setReturningGuest] = useState<string | null>(null);

  const checkGuest = async (val: string) => {
    if (!val.includes("@")) return;
    try {
      const r = await fetch(`/api/guest-check?email=${encodeURIComponent(val)}`);
      const d = await r.json();
      if (d.known) {
        setReturningGuest(d.naam || "");
        if (!name) setName(d.naam || "");
      } else {
        setReturningGuest(null);
      }
    } catch {}
  };

  // Earliest selectable date: today or BOOKINGS_OPEN_FROM, whichever is later.
  const minDate = useMemo(() => {
    const opens = new Date(BOOKINGS_OPEN_FROM + "T00:00:00");
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return opens > now ? opens : now;
  }, []);
  const [calMonth, setCalMonth] = useState(() => ({
    year: minDate.getFullYear(),
    month: minDate.getMonth(),
  }));

  /* ═══ AVAILABILITY ═══ */
  const [lodge1Events, setLodge1Events] = useState<ICalEvent[]>([]);
  const [lodge2Events, setLodge2Events] = useState<ICalEvent[]>([]);
  const [availLoading, setAvailLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setAvailLoading(true);
    Promise.all([
      fetch("/api/ical?lodge=lodge_1").then(r => r.json()).catch(() => ({ events: [] })),
      fetch("/api/ical?lodge=lodge_2").then(r => r.json()).catch(() => ({ events: [] })),
    ]).then(([a, b]) => {
      if (cancelled) return;
      setLodge1Events(a.events || []);
      setLodge2Events(b.events || []);
      setAvailLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  /* ═══ CALENDAR LOGIC ═══ */
  const calDays = useMemo(() => {
    const first = new Date(calMonth.year, calMonth.month, 1);
    const startDay = (first.getDay() + 6) % 7; // Monday = 0
    const daysInMonth = new Date(calMonth.year, calMonth.month + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let i = 1; i <= daysInMonth; i++) cells.push(new Date(calMonth.year, calMonth.month, i));
    return cells;
  }, [calMonth]);

  /* Per-day status: preferred lodge free, only the other lodge free, or both booked.
   * Without a preferredLodge: lodge_1 acts as "preferred" (alphabetical default). */
  const effectivePreferred: Lodge = preferredLodge || "lodge_1";
  const effectiveOther: Lodge = effectivePreferred === "lodge_1" ? "lodge_2" : "lodge_1";
  const preferredEvents = effectivePreferred === "lodge_1" ? lodge1Events : lodge2Events;
  const otherEvents = effectivePreferred === "lodge_1" ? lodge2Events : lodge1Events;

  function dayStatus(d: Date): DayStatus {
    const iso = toKey(d);
    const prefBooked = isDayBooked(iso, preferredEvents);
    const otherBooked = isDayBooked(iso, otherEvents);
    if (!prefBooked) return "preferred";
    if (!otherBooked) return "other";
    return "booked";
  }

  /* Match a date range to a lodge.
   * Returns the lodge that has the WHOLE range free, preferring the user's
   * previous lodge. Null = neither lodge can host this range. */
  function matchRange(from: string, to: string): { lodge: Lodge; fallback: boolean } | null {
    function rangeFree(events: ICalEvent[]): boolean {
      let d = from;
      while (d < to) {
        if (isDayBooked(d, events)) return false;
        d = toKey(new Date(new Date(d).getTime() + 86400000));
      }
      return true;
    }
    if (rangeFree(preferredEvents)) return { lodge: effectivePreferred, fallback: false };
    if (rangeFree(otherEvents)) return { lodge: effectiveOther, fallback: true };
    return null;
  }

  const handleDateClick = (d: Date) => {
    if (d < minDate) return;
    const status = dayStatus(d);
    if (status === "booked") return;
    const key = toKey(d);
    if (!fromDate || (fromDate && toDate)) {
      setFromDate(key);
      setToDate(null);
    } else {
      if (d < fromKey(fromDate)) {
        setFromDate(key);
      } else {
        const nights = Math.round((d.getTime() - fromKey(fromDate).getTime()) / (1000 * 60 * 60 * 24));
        if (nights < 2) return; // minimum 2 nights
        setToDate(key);
      }
    }
  };

  const isInRange = (d: Date) => {
    if (!fromDate || !toDate) return false;
    return d >= fromKey(fromDate) && d <= fromKey(toDate);
  };

  const isFrom = (d: Date) => fromDate === toKey(d);
  const isTo = (d: Date) => toDate === toKey(d);
  const isPast = (d: Date) => d < minDate;

  const nights = fromDate && toDate
    ? Math.round((fromKey(toDate).getTime() - fromKey(fromDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const matchedLodge = fromDate && toDate ? matchRange(fromDate, toDate) : null;

  const formatDate = (key: string) => {
    const d = fromKey(key);
    return d.toLocaleDateString(lang === "de" ? "de-DE" : "nl-NL", { day: "numeric", month: "long" });
  };

  const canGoBack = calMonth.year > minDate.getFullYear() || (calMonth.year === minDate.getFullYear() && calMonth.month > minDate.getMonth());
  const prevMonth = () => {
    if (!canGoBack) return;
    setCalMonth(p => p.month === 0 ? { year: p.year - 1, month: 11 } : { year: p.year, month: p.month - 1 });
  };
  const nextMonth = () => setCalMonth(p => p.month === 11 ? { year: p.year + 1, month: 0 } : { year: p.year, month: p.month + 1 });

  /* ═══ SUBMIT ═══ */
  const canSubmit = fromDate && toDate && matchedLodge && email.includes("@") && !loading;

  const submit = async () => {
    if (!canSubmit || !matchedLodge) return;
    setLoading(true);
    try {
      await fetch("/api/terugkomen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: formatDate(fromDate!),
          to: formatDate(toDate!),
          fromIso: fromDate,
          toIso: toDate,
          email, name, persons, message,
          voorkeursLodge: matchedLodge.lodge,
          voorkeursLodgeNaam: LODGE_LABELS[matchedLodge.lodge],
          wasFallback: matchedLodge.fallback,
          bron,
        }),
      });
    } catch {}
    setLoading(false);
    setSuccess(true);
  };

  /* ═══ SUCCESS STATE ═══ */
  if (success) {
    return (
      <div style={{ padding: "0 24px 110px" }}>
        <div style={{ paddingTop: 60, textAlign: "center", animation: "fadeUp .5s ease both" }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🌿</div>
          <h1 style={{ fontFamily: T.serif, fontSize: 28, fontWeight: 700, color: T.text, margin: "0 0 10px" }}>
            {t.terugkomen.thankYou}
          </h1>
          <p style={{ fontFamily: T.sans, fontSize: 15, color: T.muted, fontWeight: 300, lineHeight: 1.6, margin: "0 0 28px", maxWidth: 300, marginLeft: "auto", marginRight: "auto" }}>
            {t.terugkomen.thankYouSub}
          </p>

          <div style={{ ...cardStyle, padding: "18px 20px", textAlign: "left", marginBottom: 24 }}>
            {(lang === "de"
              ? ["Bestpreisgarantie", "Speziell für Stammgäste", "Keine Verpflichtung"]
              : ["Beste prijs garantie", "Speciaal voor terugkerende gasten", "Geen verplichting"]
            ).map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
                borderBottom: i < 2 ? `1px solid ${T.border}` : "none",
              }}>
                <span style={{ color: T.green }}><IcCheck /></span>
                <span style={{ fontFamily: T.sans, fontSize: 14, color: T.text, fontWeight: 300 }}>{item}</span>
              </div>
            ))}
          </div>

          <button onClick={() => onNavigate("home")} style={{
            padding: "14px 32px", borderRadius: 14, border: "none",
            background: T.green, color: "#fff",
            fontFamily: T.sans, fontSize: 15, fontWeight: 500, cursor: "pointer",
          }}>
            {lang === "de" ? "Zurück zur Übersicht" : "Terug naar overzicht"}
          </button>
        </div>
      </div>
    );
  }

  /* ═══ MAIN FLOW ═══ */
  return (
    <div style={{ padding: "0 20px 110px" }}>
      {/* Header */}
      <div style={{ paddingTop: 28 }}>
        <button onClick={() => onNavigate("info")} style={{
          background: "none", border: "none", cursor: "pointer", color: T.muted,
          fontFamily: T.sans, fontSize: 13, fontWeight: 300, padding: 0, marginBottom: 12,
          display: "flex", alignItems: "center", gap: 4,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
          {lang === "de" ? "Zurück" : "Terug"}
        </button>
        <h1 style={{ fontFamily: T.serif, fontSize: 28, fontWeight: 700, color: T.text, margin: "0 0 6px" }}>
          {t.terugkomen.title}
        </h1>
        <p style={{ fontFamily: T.sans, fontSize: 14, color: T.muted, fontWeight: 300, margin: "0 0 20px", lineHeight: 1.5 }}>
          {t.terugkomen.subtitle}
        </p>
      </div>

      {/* Trust badges */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        {(lang === "de"
          ? ["Immer günstiger als Buchungsportale", "Persönlich abgestimmt", "Keine Verpflichtung"]
          : ["Altijd scherper dan booking sites", "Persoonlijk afgestemd", "Geen verplichting"]
        ).map((badge, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 5,
            fontFamily: T.sans, fontSize: 11, color: T.green, fontWeight: 400,
          }}>
            <span style={{ color: T.green, fontSize: 12 }}>✓</span> {badge}
          </div>
        ))}
      </div>

      {/* Step indicator */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[1, 2].map(s => (
          <div key={s} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: step >= s ? T.green : T.border,
            transition: "background .3s ease",
          }} />
        ))}
      </div>
      <div style={{ fontFamily: T.sans, fontSize: 11, color: T.muted, fontWeight: 300, marginBottom: 16 }}>
        {lang === "de"
          ? `Schritt ${step} von 2 — ${step === 1 ? "Zeitraum wählen" : "Ihre Angaben"}`
          : `Stap ${step} van 2 — ${step === 1 ? "Kies je periode" : "Je gegevens"}`}
      </div>

      {/* STEP 1: Calendar */}
      {step === 1 && (
        <div style={{ animation: "fadeUp .3s ease both" }}>
          <div style={{ ...cardStyle, padding: "20px 16px" }}>
            {/* Month nav */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <button
                onClick={prevMonth}
                disabled={!canGoBack}
                style={{
                  background: "none", border: "none",
                  cursor: canGoBack ? "pointer" : "not-allowed",
                  color: canGoBack ? T.muted : T.border, padding: 4,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <div style={{ fontFamily: T.serif, fontSize: 17, fontWeight: 600, color: T.text }}>
                {MONTHS[calMonth.month]} {calMonth.year}
              </div>
              <button onClick={nextMonth} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, padding: 4 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>

            {/* Day headers */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
              {DAYS.map(d => (
                <div key={d} style={{
                  textAlign: "center", fontFamily: T.sans, fontSize: 11,
                  color: T.muted, fontWeight: 500, padding: "4px 0",
                }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Loading state */}
            {availLoading ? (
              <div style={{ textAlign: "center", padding: 40, color: T.muted, fontFamily: T.sans, fontSize: 13 }}>
                {t.terugkomen.loadingAvail}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
                {calDays.map((d, i) => {
                  if (!d) return <div key={i} />;
                  const past = isPast(d);
                  const status = past ? "booked" : dayStatus(d);
                  const from = isFrom(d);
                  const to = isTo(d);
                  const inR = isInRange(d);
                  const selected = from || to;
                  const disabled = past || status === "booked";

                  /* Color logic per state */
                  let bg = "transparent";
                  let color: string = T.text;
                  if (selected) {
                    bg = T.green;
                    color = "#fff";
                  } else if (inR) {
                    bg = "rgba(47,79,62,.08)";
                  } else if (past) {
                    color = T.border;
                  } else if (status === "preferred") {
                    bg = "transparent";
                    color = T.text;
                  } else if (status === "other") {
                    // subtiele gold-tint = andere lodge wel vrij
                    bg = "rgba(180,154,94,.12)";
                    color = T.text;
                  } else if (status === "booked") {
                    // beide bezet
                    bg = "transparent";
                    color = T.border;
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => !disabled && handleDateClick(d)}
                      disabled={disabled}
                      style={{
                        width: "100%", aspectRatio: "1", borderRadius: selected ? 10 : inR ? 0 : 10,
                        border: "none", cursor: disabled ? "default" : "pointer",
                        fontFamily: T.sans, fontSize: 14, fontWeight: selected ? 600 : 300,
                        background: bg, color,
                        textDecoration: status === "booked" && !past ? "line-through" : "none",
                        transition: "all .1s ease",
                        WebkitTapHighlightColor: "transparent",
                        opacity: disabled && !past ? 0.55 : 1,
                      }}
                    >
                      {d.getDate()}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Legend */}
            {!availLoading && (
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginTop: 14, fontFamily: T.sans, fontSize: 10, color: T.muted, fontWeight: 300 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, border: `1px solid ${T.border}` }} />
                  {t.terugkomen.legendPreferred}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: "rgba(180,154,94,.4)" }} />
                  {t.terugkomen.legendOther}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: T.border }} />
                  {t.terugkomen.legendBooked}
                </span>
              </div>
            )}

            {/* Min nights notice */}
            <div style={{ fontFamily: T.sans, fontSize: 11, color: T.muted, fontWeight: 300, marginTop: 12, textAlign: "center" }}>
              {lang === "de"
                ? (fromDate && !toDate ? "Enddatum wählen (mind. 2 Nächte)" : "Mindestens 2 Nächte")
                : (fromDate && !toDate ? "Selecteer een einddatum (min. 2 nachten)" : "Minimaal 2 nachten")}
            </div>
          </div>

          {/* Selection summary */}
          {fromDate && toDate && (
            <div style={{
              marginTop: 14, padding: "14px 18px", borderRadius: 14,
              background: matchedLodge ? "rgba(47,79,62,.06)" : "rgba(180,154,94,.12)",
              border: `1px solid ${matchedLodge ? "rgba(47,79,62,.15)" : "rgba(180,154,94,.3)"}`,
              animation: "fadeUp .25s ease both",
            }}>
              <div style={{ fontFamily: T.sans, fontSize: 13, color: T.text, fontWeight: 400 }}>
                {formatDate(fromDate)} — {formatDate(toDate)}
              </div>
              <div style={{ fontFamily: T.sans, fontSize: 12, color: T.green, fontWeight: 500, marginTop: 2 }}>
                {nights} {lang === "de" ? "Nächte" : "nachten"}
              </div>
              <div style={{ marginTop: 8, fontFamily: T.sans, fontSize: 12, color: matchedLodge ? T.green : T.gold, fontWeight: 500, lineHeight: 1.4 }}>
                {!matchedLodge && t.terugkomen.rangeUnavailable}
                {matchedLodge && !preferredLodge && `✓ ${t.terugkomen.matchedFlex} (${LODGE_LABELS[matchedLodge.lodge]})`}
                {matchedLodge && preferredLodge && !matchedLodge.fallback && `✓ ${t.terugkomen.matchedPreferred} — ${LODGE_LABELS[matchedLodge.lodge]}`}
                {matchedLodge && preferredLodge && matchedLodge.fallback && `↪ ${t.terugkomen.matchedFallback} (${LODGE_LABELS[matchedLodge.lodge]})`}
              </div>
            </div>
          )}

          {/* Next button */}
          <button
            onClick={() => fromDate && toDate && matchedLodge && setStep(2)}
            disabled={!fromDate || !toDate || !matchedLodge}
            style={{
              width: "100%", padding: 16, borderRadius: 16, border: "none",
              background: fromDate && toDate && matchedLodge ? T.green : T.border,
              color: "#fff", fontFamily: T.sans, fontSize: 16, fontWeight: 500,
              cursor: fromDate && toDate && matchedLodge ? "pointer" : "not-allowed",
              marginTop: 20,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {lang === "de" ? "Nächster Schritt" : "Volgende stap"} <IcArrow />
          </button>
        </div>
      )}

      {/* STEP 2: Form */}
      {step === 2 && (
        <div style={{ animation: "fadeUp .3s ease both" }}>
          {/* Period summary */}
          <div style={{
            ...cardStyle, padding: "16px 18px", marginBottom: 20,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ fontFamily: T.sans, fontSize: 13, color: T.text }}>
                {formatDate(fromDate!)} — {formatDate(toDate!)}
              </div>
              <div style={{ fontFamily: T.sans, fontSize: 12, color: T.green, fontWeight: 500 }}>
                {nights} {lang === "de" ? "Nächte" : "nachten"} {matchedLodge && `· ${LODGE_LABELS[matchedLodge.lodge]}`}
              </div>
            </div>
            <button onClick={() => setStep(1)} style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: T.sans, fontSize: 12, color: T.gold, fontWeight: 400,
            }}>{lang === "de" ? "Ändern" : "Wijzig"}</button>
          </div>

          {/* Form */}
          <div style={{ ...cardStyle, padding: "22px 20px" }}>
            {/* Email */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontFamily: T.sans, fontSize: 12, color: T.muted, marginBottom: 6, fontWeight: 300 }}>{t.terugkomen.email} *</div>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                onBlur={e => checkGuest(e.target.value)}
                placeholder={t.terugkomen.emailPlaceholder}
                type="email"
                style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${returningGuest ? T.green : T.border}`, background: T.card, fontFamily: T.sans, fontSize: 16, color: T.text, fontWeight: 300, outline: "none" }}
              />
              {returningGuest !== null && (
                <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: 8, background: "rgba(47,79,62,.06)", border: `1px solid rgba(47,79,62,.15)`, fontFamily: T.sans, fontSize: 13, color: T.green, fontWeight: 400 }}>
                  {lang === "de"
                    ? `Willkommen zurück${returningGuest ? `, ${returningGuest}` : ""}! Schön, Sie wiederzusehen. 🌿`
                    : `Welkom terug${returningGuest ? `, ${returningGuest}` : ""}! Fijn je weer te zien. 🌿`}
                </div>
              )}
            </div>

            {/* Name */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontFamily: T.sans, fontSize: 12, color: T.muted, marginBottom: 6, fontWeight: 300 }}>
                {t.terugkomen.name} <span style={{ opacity: 0.5 }}>({lang === "de" ? "optional" : "optioneel"})</span>
              </div>
              <input value={name} onChange={e => setName(e.target.value)} placeholder={t.terugkomen.namePlaceholder}
                style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${T.border}`, background: T.card, fontFamily: T.sans, fontSize: 16, color: T.text, fontWeight: 300, outline: "none" }} />
            </div>

            {/* Persons */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontFamily: T.sans, fontSize: 12, color: T.muted, marginBottom: 6, fontWeight: 300 }}>{lang === "de" ? "Anzahl Personen" : "Aantal personen"}</div>
              <div style={{ display: "flex", gap: 8 }}>
                {Array.from({ length: MAX_GUESTS_PER_LODGE }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setPersons(n)} style={{
                    flex: 1, padding: "10px 0", borderRadius: 10, fontFamily: T.sans, fontSize: 14,
                    fontWeight: persons === n ? 600 : 300,
                    background: persons === n ? T.green : T.card,
                    color: persons === n ? "#fff" : T.text,
                    border: persons === n ? "none" : `1px solid ${T.border}`,
                    cursor: "pointer",
                  }}>{n}</button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div style={{ marginBottom: 4 }}>
              <div style={{ fontFamily: T.sans, fontSize: 12, color: T.muted, marginBottom: 6, fontWeight: 300 }}>
                {t.terugkomen.notes} <span style={{ opacity: 0.5 }}>({lang === "de" ? "optional" : "optioneel"})</span>
              </div>
              <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder={t.terugkomen.notesPlaceholder}
                rows={2} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${T.border}`, background: T.card, fontFamily: T.sans, fontSize: 14, color: T.text, fontWeight: 300, outline: "none", resize: "none", lineHeight: 1.5 }} />
            </div>
          </div>

          {/* CTA */}
          <button onClick={submit} disabled={!canSubmit} style={{
            width: "100%", padding: 16, borderRadius: 16, border: "none",
            background: canSubmit ? `linear-gradient(135deg, ${T.green} 0%, ${T.green2} 100%)` : T.border,
            color: "#fff", fontFamily: T.serif, fontSize: 17, fontWeight: 600,
            cursor: canSubmit ? "pointer" : "not-allowed",
            marginTop: 20,
            boxShadow: canSubmit ? "0 8px 32px rgba(47,79,62,.25)" : "none",
          }}>
            {loading ? t.terugkomen.requesting : t.terugkomen.request}
          </button>

          {/* Trust */}
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <div style={{ fontFamily: T.sans, fontSize: 11, color: T.muted, fontWeight: 300 }}>
              {lang === "de" ? "Wir antworten meist innerhalb weniger Stunden" : "Wij reageren meestal binnen enkele uren"}
            </div>
            <div style={{ fontFamily: T.sans, fontSize: 10, color: T.border, fontWeight: 300, marginTop: 4 }}>
              {lang === "de" ? "Kein Spam. Nur ein persönliches Angebot." : "Geen spam. Alleen een persoonlijk aanbod."}
            </div>
          </div>

          {/* Back */}
          <button onClick={() => setStep(1)} style={{
            width: "100%", marginTop: 12, background: "none", border: "none",
            fontFamily: T.sans, fontSize: 13, color: T.muted, fontWeight: 300,
            cursor: "pointer", padding: 8,
          }}>
            ← Terug naar kalender
          </button>
        </div>
      )}
    </div>
  );
}
