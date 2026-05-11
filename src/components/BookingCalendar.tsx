"use client";
import { useState, useEffect, useCallback } from "react";

const T = {
  bg: "#EAE3D2", card: "#FDFBF6", green: "#2F4F3E",
  gold: "#B49A5E", text: "#2A2418", muted: "#8A7D6A",
  border: "#E0D8C8", serif: "Georgia,'Times New Roman',serif",
  sans: "'DM Sans',system-ui,sans-serif",
};

type ICalEvent = { start: string; end: string };
type PricingPeriod = { id: string; label: string; start_date: string; end_date: string; price_per_night: number };
type Lodge = "lodge_1" | "lodge_2";

const LODGE_LABELS: Record<Lodge, string> = { lodge_1: "De Heide", lodge_2: "De Eik" };
const WEEKDAYS = ["Ma", "Di", "Wo", "Do", "Fr", "Za", "Zo"];

const OPENING_DATE = "2027-01-01";
const OPENING = new Date(2027, 0, 1);

function calcInitialOffset(): number {
  const now = new Date();
  return Math.max(
    0,
    (OPENING.getFullYear() - now.getFullYear()) * 12 + (OPENING.getMonth() - now.getMonth())
  );
}
const INITIAL_OFFSET = calcInitialOffset();

function toISO(d: Date): string {
  return d.toISOString().split("T")[0];
}

function addDays(iso: string, n: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

function diffDays(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

function isBooked(iso: string, events: ICalEvent[]): boolean {
  return events.some(e => iso >= e.start && iso < e.end);
}

function priceForDate(iso: string, periods: PricingPeriod[]): { price: number; label: string } | null {
  const p = periods.find(p => iso >= p.start_date && iso <= p.end_date);
  return p ? { price: p.price_per_night, label: p.label } : null;
}

function MonthCalendar({
  year, month, events, periods, checkIn, checkOut, hovered,
  onDayClick, onDayHover, today,
}: {
  year: number; month: number;
  events: ICalEvent[]; periods: PricingPeriod[];
  checkIn: string | null; checkOut: string | null; hovered: string | null;
  onDayClick: (iso: string) => void;
  onDayHover: (iso: string | null) => void;
  today: string;
}) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const offset = (firstDay.getDay() + 6) % 7; // Mon=0
  const monthName = firstDay.toLocaleDateString("nl-NL", { month: "long", year: "numeric" });

  const rangeEnd = checkOut || hovered;

  const days: { iso: string; inMonth: boolean }[] = [];
  for (let i = 0; i < offset; i++) {
    const d = new Date(year, month, 1 - (offset - i));
    days.push({ iso: toISO(d), inMonth: false });
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({ iso: toISO(new Date(year, month, d)), inMonth: true });
  }
  const remainder = 7 - (days.length % 7);
  if (remainder < 7) {
    for (let i = 1; i <= remainder; i++) {
      days.push({ iso: toISO(new Date(year, month + 1, i)), inMonth: false });
    }
  }

  return (
    <div>
      <div style={{ textAlign: "center", fontFamily: T.serif, fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 16, textTransform: "capitalize" }}>
        {monthName}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 6 }}>
        {WEEKDAYS.map(d => (
          <div key={d} style={{ textAlign: "center", fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.muted, padding: "4px 0" }}>{d}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
        {days.map(({ iso, inMonth }) => {
          const isPast = iso < today;
          const booked = isBooked(iso, events);
          const pricing = priceForDate(iso, periods);
          const isCheckIn = iso === checkIn;
          const isCheckOut = iso === checkOut;
          const inRange = checkIn && rangeEnd && iso > checkIn && iso < rangeEnd;
          const isToday = iso === today;
          const isHovered = iso === hovered;

          let bg = "transparent";
          let color = T.text;
          let borderColor = "transparent";
          let cursor = "default";
          let opacity = inMonth ? 1 : 0;
          let pointerEvents: React.CSSProperties["pointerEvents"] = "none";

          if (inMonth) {
            if (isPast || booked) {
              bg = booked ? "#EDE8E0" : "transparent";
              color = T.muted;
              opacity = booked ? 1 : 0.35;
            } else {
              cursor = "pointer";
              pointerEvents = "auto";
              if (isCheckIn || isCheckOut) {
                bg = T.green;
                color = "#fff";
              } else if (inRange) {
                bg = "rgba(47,79,62,.12)";
                color = T.green;
              } else if (isHovered && checkIn && !checkOut) {
                bg = "rgba(47,79,62,.08)";
              } else {
                borderColor = isToday ? T.gold : "transparent";
              }
            }
          }

          return (
            <div
              key={iso}
              onClick={() => inMonth && !isPast && !booked ? onDayClick(iso) : undefined}
              onMouseEnter={() => inMonth && !isPast && !booked ? onDayHover(iso) : undefined}
              onMouseLeave={() => onDayHover(null)}
              style={{
                aspectRatio: "1", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                background: bg, color,
                borderRadius: 8,
                border: `1px solid ${borderColor}`,
                cursor, opacity,
                pointerEvents,
                position: "relative",
                transition: "background .12s",
              }}
            >
              <span style={{ fontFamily: T.sans, fontSize: 13, fontWeight: isCheckIn || isCheckOut ? 700 : 400, lineHeight: 1 }}>
                {inMonth ? new Date(iso).getDate() : ""}
              </span>
              {inMonth && !isPast && !booked && pricing && !isCheckIn && !isCheckOut && (
                <span style={{ fontFamily: T.sans, fontSize: 9, color: inRange ? T.green : T.gold, fontWeight: 500, lineHeight: 1, marginTop: 2 }}>
                  €{pricing.price}
                </span>
              )}
              {inMonth && booked && (
                <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.25 }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <line x1="1" y1="1" x2="9" y2="9" stroke={T.muted} strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="9" y1="1" x2="1" y2="9" stroke={T.muted} strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function BookingCalendar() {
  const [lodge, setLodge] = useState<Lodge>("lodge_1");
  const [events, setEvents] = useState<ICalEvent[]>([]);
  const [periods, setPeriods] = useState<PricingPeriod[]>([]);
  const [loadingCal, setLoadingCal] = useState(true);
  const [monthOffset, setMonthOffset] = useState(INITIAL_OFFSET);
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [bericht, setBericht] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const now = new Date();
  const today = toISO(now);
  const effectiveToday = today >= OPENING_DATE ? today : OPENING_DATE;

  const fetchData = useCallback(async (l: Lodge) => {
    setLoadingCal(true);
    setEvents([]);
    setPeriods([]);
    try {
      const [icalRes, pricingRes] = await Promise.all([
        fetch(`/api/ical?lodge=${l}`),
        fetch(`/api/pricing?lodge=${l}`),
      ]);
      const [icalData, pricingData] = await Promise.all([icalRes.json(), pricingRes.json()]);
      setEvents(icalData.events || []);
      setPeriods(pricingData.data || []);
    } catch {}
    setLoadingCal(false);
  }, []);

  useEffect(() => { fetchData(lodge); }, [lodge, fetchData]);

  const handleLodge = (l: Lodge) => {
    setLodge(l);
    setCheckIn(null);
    setCheckOut(null);
    setSent(false);
  };

  const handleDayClick = (iso: string) => {
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(iso);
      setCheckOut(null);
      setSent(false);
      return;
    }
    if (iso <= checkIn) {
      setCheckIn(iso);
      setCheckOut(null);
      return;
    }
    const nights = diffDays(checkIn, iso);
    if (nights < 2) return;
    // Check no booked day in range
    let d = addDays(checkIn, 1);
    while (d < iso) {
      if (isBooked(d, events)) { setCheckIn(iso); setCheckOut(null); return; }
      d = addDays(d, 1);
    }
    setCheckOut(iso);
  };

  const month0 = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const month1 = new Date(now.getFullYear(), now.getMonth() + monthOffset + 1, 1);

  const nights = checkIn && checkOut ? diffDays(checkIn, checkOut) : 0;

  // Calculate total price from pricing periods
  let totalPrice = 0;
  let priceBreakdown: { label: string; nights: number; price: number }[] = [];
  if (checkIn && checkOut && nights > 0) {
    const grouped: Record<string, { label: string; nights: number; price: number }> = {};
    let d = checkIn;
    while (d < checkOut) {
      const p = priceForDate(d, periods);
      const key = p ? p.label : "Standaardtarief";
      const ppu = p ? p.price : 0;
      if (!grouped[key]) grouped[key] = { label: key, nights: 0, price: ppu };
      grouped[key].nights++;
      totalPrice += ppu;
      d = addDays(d, 1);
    }
    priceBreakdown = Object.values(grouped);
  }

  const hasPrice = totalPrice > 0;
  const canSubmit = checkIn && checkOut && naam.trim() && email.includes("@") && !sending;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSending(true);
    try {
      const priceLabel = priceBreakdown.map(b => b.label).join(" / ");
      await fetch("/api/reservering", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          naam: naam.trim(),
          email: email.trim(),
          lodge,
          checkIn,
          checkOut,
          nights: String(nights),
          totalPrice: String(totalPrice),
          priceLabel,
          bericht: bericht.trim(),
        }),
      });
      setSent(true);
    } catch {}
    setSending(false);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px", borderRadius: 10,
    border: `1px solid ${T.border}`, background: "#fff",
    fontFamily: T.sans, fontSize: 14, color: T.text,
    outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Lodge selector */}
      <div style={{ display: "flex", gap: 10, marginBottom: 32, justifyContent: "center" }}>
        {(["lodge_1", "lodge_2"] as Lodge[]).map(l => (
          <button key={l} onClick={() => handleLodge(l)} style={{
            padding: "10px 28px", borderRadius: 10,
            border: lodge === l ? "none" : `1px solid ${T.border}`,
            background: lodge === l ? T.green : "#fff",
            color: lodge === l ? "#fff" : T.text,
            fontFamily: T.sans, fontSize: 14, fontWeight: 600,
            cursor: "pointer",
          }}>
            Lodge {LODGE_LABELS[l]}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loadingCal && (
        <div style={{ textAlign: "center", padding: 48, fontFamily: T.sans, fontSize: 14, color: T.muted }}>
          Agenda laden...
        </div>
      )}

      {!loadingCal && (
        <>
          {/* Opening notice — only shown before the opening date */}
          {today < OPENING_DATE && (
            <div style={{
              textAlign: "center", marginBottom: 28, padding: "10px 16px",
              background: "rgba(180,154,94,.08)", borderRadius: 10,
              border: `1px solid rgba(180,154,94,.2)`,
              fontFamily: T.sans, fontSize: 13, color: T.gold, fontWeight: 500,
            }}>
              De lodges openen 1 januari 2027 — vanaf nu te boeken
            </div>
          )}

          {/* Calendar grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 40, marginBottom: 28 }}>
            <MonthCalendar year={month0.getFullYear()} month={month0.getMonth()} events={events} periods={periods}
              checkIn={checkIn} checkOut={checkOut} hovered={hovered}
              onDayClick={handleDayClick} onDayHover={setHovered} today={effectiveToday} />
            <MonthCalendar year={month1.getFullYear()} month={month1.getMonth()} events={events} periods={periods}
              checkIn={checkIn} checkOut={checkOut} hovered={hovered}
              onDayClick={handleDayClick} onDayHover={setHovered} today={effectiveToday} />
          </div>

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 28 }}>
            <button onClick={() => setMonthOffset(o => o - 1)} disabled={monthOffset <= INITIAL_OFFSET} style={{
              padding: "8px 20px", borderRadius: 8, border: `1px solid ${T.border}`,
              background: "#fff", fontFamily: T.sans, fontSize: 13, color: monthOffset <= INITIAL_OFFSET ? T.muted : T.text,
              cursor: monthOffset <= INITIAL_OFFSET ? "not-allowed" : "pointer",
            }}>← Vorige maanden</button>
            <button onClick={() => setMonthOffset(o => o + 1)} style={{
              padding: "8px 20px", borderRadius: 8, border: `1px solid ${T.border}`,
              background: "#fff", fontFamily: T.sans, fontSize: 13, color: T.text, cursor: "pointer",
            }}>Volgende maanden →</button>
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: 20, justifyContent: "center", marginBottom: 40, flexWrap: "wrap" }}>
            {[
              { color: T.green, label: "Geselecteerd" },
              { color: "rgba(47,79,62,.12)", border: "none", label: "Geselecteerde periode" },
              { color: "#EDE8E0", label: "Bezet" },
            ].map((l, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: T.sans, fontSize: 12, color: T.muted }}>
                <div style={{ width: 14, height: 14, borderRadius: 4, background: l.color }} />
                {l.label}
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: T.sans, fontSize: 12, color: T.muted }}>
              <span style={{ fontFamily: T.sans, fontSize: 10, color: T.gold, fontWeight: 600 }}>€125</span>
              <span>Prijs per nacht</span>
            </div>
          </div>

          {/* Hint when no dates selected */}
          {!checkIn && (
            <div style={{ textAlign: "center", padding: "20px 0", fontFamily: T.sans, fontSize: 14, color: T.muted }}>
              Klik op een aankomstdatum om te beginnen
            </div>
          )}
          {checkIn && !checkOut && (
            <div style={{ textAlign: "center", padding: "20px 0", fontFamily: T.sans, fontSize: 14, color: T.muted }}>
              Klik op een vertrekdatum (minimaal 2 nachten)
            </div>
          )}

          {/* Booking summary + form */}
          {checkIn && checkOut && (
            <div style={{
              background: "#fff", border: `1px solid ${T.border}`, borderRadius: 16,
              overflow: "hidden", boxShadow: "0 4px 24px rgba(47,79,62,.08)",
            }}>
              {/* Summary header */}
              <div style={{ background: T.green, padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,.6)", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 4 }}>
                    Lodge {LODGE_LABELS[lodge]}
                  </div>
                  <div style={{ fontFamily: T.serif, fontSize: 18, fontWeight: 700, color: "#fff" }}>
                    {new Date(checkIn).toLocaleDateString("nl-NL", { day: "numeric", month: "long" })} →{" "}
                    {new Date(checkOut).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                  <div style={{ fontFamily: T.sans, fontSize: 13, color: "rgba(255,255,255,.75)", marginTop: 4 }}>
                    {nights} nacht{nights !== 1 ? "en" : ""}
                  </div>
                </div>
                {hasPrice && (
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: T.sans, fontSize: 11, color: "rgba(255,255,255,.6)", marginBottom: 2 }}>Geschatte prijs</div>
                    <div style={{ fontFamily: T.serif, fontSize: 28, fontWeight: 700, color: T.gold }}>€ {totalPrice.toFixed(0)}</div>
                  </div>
                )}
              </div>

              <div style={{ padding: "24px 28px" }}>
                {/* Price breakdown */}
                {hasPrice && priceBreakdown.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 10 }}>Tariefopbouw</div>
                    <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden" }}>
                      {priceBreakdown.map((b, i) => (
                        <div key={i} style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          padding: "10px 16px", borderBottom: i < priceBreakdown.length - 1 ? `1px solid ${T.border}` : "none",
                          fontFamily: T.sans, fontSize: 13,
                        }}>
                          <span style={{ color: T.text }}>{b.label} <span style={{ color: T.muted }}>× {b.nights} nacht{b.nights !== 1 ? "en" : ""}</span></span>
                          <span style={{ fontWeight: 600, color: T.green }}>€ {(b.price * b.nights).toFixed(0)}</span>
                        </div>
                      ))}
                      <div style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "12px 16px", background: T.bg, fontFamily: T.sans,
                      }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>Totaal (indicatief)</span>
                        <span style={{ fontSize: 18, fontWeight: 700, color: T.green }}>€ {totalPrice.toFixed(0)}</span>
                      </div>
                    </div>
                    <p style={{ fontFamily: T.sans, fontSize: 11, color: T.muted, margin: "8px 0 0" }}>
                      De definitieve prijs wordt door ons bevestigd na je aanvraag.
                    </p>
                  </div>
                )}

                {sent ? (
                  <div style={{ textAlign: "center", padding: "32px 0" }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
                    <div style={{ fontFamily: T.serif, fontSize: 20, fontWeight: 700, color: T.green, marginBottom: 8 }}>Aanvraag verzonden!</div>
                    <p style={{ fontFamily: T.sans, fontSize: 14, color: T.muted, margin: 0 }}>
                      We nemen binnen 24 uur contact met je op via {email}.
                    </p>
                    <button onClick={() => { setCheckIn(null); setCheckOut(null); setSent(false); setNaam(""); setEmail(""); setBericht(""); }}
                      style={{ marginTop: 20, padding: "10px 24px", borderRadius: 8, border: `1px solid ${T.border}`, background: "#fff", fontFamily: T.sans, fontSize: 13, color: T.muted, cursor: "pointer" }}>
                      Nieuwe zoekopdracht
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.muted, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 14 }}>
                      Jouw gegevens
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                      <div>
                        <label style={{ display: "block", fontFamily: T.sans, fontSize: 12, color: T.muted, marginBottom: 4 }}>Naam *</label>
                        <input value={naam} onChange={e => setNaam(e.target.value)} placeholder="Jan de Vries" style={inputStyle} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontFamily: T.sans, fontSize: 12, color: T.muted, marginBottom: 4 }}>E-mailadres *</label>
                        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="jan@voorbeeld.nl" type="email" style={inputStyle} />
                      </div>
                    </div>
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ display: "block", fontFamily: T.sans, fontSize: 12, color: T.muted, marginBottom: 4 }}>Bericht (optioneel)</label>
                      <textarea value={bericht} onChange={e => setBericht(e.target.value)} placeholder="Bijv. aantal personen, wensen, vragen..." rows={3}
                        style={{ ...inputStyle, resize: "vertical", fontFamily: T.sans }} />
                    </div>
                    <button onClick={handleSubmit} disabled={!canSubmit} style={{
                      width: "100%", padding: "15px", borderRadius: 12, border: "none",
                      background: canSubmit ? T.green : T.border,
                      color: "#fff", fontFamily: T.sans, fontSize: 15, fontWeight: 600,
                      cursor: canSubmit ? "pointer" : "not-allowed",
                      transition: "background .15s",
                    }}>
                      {sending ? "Aanvraag verzenden..." : "Reserveringsaanvraag versturen →"}
                    </button>
                    <p style={{ fontFamily: T.sans, fontSize: 12, color: T.muted, textAlign: "center", margin: "10px 0 0" }}>
                      Geen betaling vereist · We bevestigen binnen 24 uur
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
