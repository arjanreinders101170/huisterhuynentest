"use client";
import { useState, useEffect, useRef } from "react";
import { checkStayDates, earliestStayDate, bookingsNotYetOpen, formatOpeningDate, MIN_NIGHTS,
         isAankomstdag, vertrekdatumsVoor, vormLabel } from "@/lib/stay-dates";
import { pushEvent, baseEnvelope, newEventId, saveUserCache } from "@/lib/tracking/dataLayer";
import { getAttribution } from "@/lib/tracking/attribution";

type Lodge = "lodge_1" | "lodge_2";
const LODGE_LABELS: Record<Lodge, string> = { lodge_1: "De Heide", lodge_2: "De Eik" };
const LODGE_DESC: Record<Lodge, string> = {
  lodge_1: "Panoramisch heide-uitzicht, eigen sauna",
  lodge_2: "Onder de eiken, volledige keuken & BBQ",
};

function diffDays(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

export default function RequestForm() {
  const [lodge, setLodge] = useState<Lodge>("lodge_1");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [bericht, setBericht] = useState("");
  const [aantalPersonen, setAantalPersonen] = useState(2);
  const [huisdieren, setHuisdieren] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [availabilityStatus, setAvailabilityStatus] = useState<"idle" | "checking" | "available" | "unavailable">("idle");
  const availCheckRef = useRef<string>("");

  const minDate = earliestStayDate();
  const nights = checkIn && checkOut ? diffDays(checkIn, checkOut) : 0;
  const dateCheck = checkStayDates(checkIn, checkOut);
  const vertrekOpties = checkIn && isAankomstdag(checkIn) ? vertrekdatumsVoor(checkIn) : [];
  const datesValid = dateCheck.ok;
  // Alleen tonen als er iets te melden valt over ingevulde datums.
  const dateError = checkIn && checkOut && !dateCheck.ok ? dateCheck.error : "";
  const canSubmit = datesValid && naam.trim() && email.includes("@") && !sending && availabilityStatus !== "unavailable";

  useEffect(() => {
    if (!checkIn || !checkOut || nights < 2) {
      setAvailabilityStatus("idle");
      return;
    }
    const key = `${lodge}:${checkIn}:${checkOut}`;
    if (availCheckRef.current === key) return;
    availCheckRef.current = key;
    setAvailabilityStatus("checking");

    fetch(`/api/ical?lodge=${lodge}`)
      .then(r => r.json())
      .then(data => {
        const events: { start: string; end: string }[] = data.events || [];
        let d = checkIn;
        let conflict = false;
        while (d < checkOut) {
          if (events.some(e => d >= e.start && d < e.end)) { conflict = true; break; }
          const [y, m, day] = d.split("-").map(Number);
          const next = new Date(y, m - 1, day + 1);
          d = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-${String(next.getDate()).padStart(2, "0")}`;
        }
        setAvailabilityStatus(conflict ? "unavailable" : "available");
      })
      .catch(() => setAvailabilityStatus("idle"));
  }, [lodge, checkIn, checkOut, nights]);

  const handleSubmit = async () => {
    setError("");
    if (!dateCheck.ok) { setError(dateCheck.error); return; }
    if (!naam.trim() || !email.includes("@")) { setError("Vul je naam en e-mailadres in."); return; }

    setSending(true);
    try {
      const metaEventId = newEventId();
      const [firstName, ...rest] = naam.trim().split(/\s+/);
      const lastName = rest.join(" ") || undefined;
      saveUserCache({ em: email.trim(), fn: firstName, ln: lastName });

      const baseLead = baseEnvelope("Lead");
      pushEvent({
        ...baseLead,
        event_id: metaEventId,
        ecommerce: { currency: "EUR", value: 0 },
        lead: { form: "homepage_aanvraag", value: 0 },
        booking: { check_in: checkIn, check_out: checkOut, lodge, nights, guests: aantalPersonen },
        user: { ...baseLead.user, em: email.trim(), fn: firstName, ln: lastName },
      });

      const res = await fetch("/api/reservering", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          naam: naam.trim(),
          email: email.trim(),
          lodge,
          checkIn,
          checkOut,
          nights: String(nights),
          totalPrice: "0",
          priceLabel: "Op aanvraag",
          bericht: bericht.trim(),
          aantalPersonen: String(aantalPersonen),
          huisdieren: huisdieren ? "ja" : "nee",
          _meta: { event_id: metaEventId },
          _attr: getAttribution(),
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Er ging iets mis. Probeer het opnieuw of WhatsApp ons.");
        setSending(false);
        return;
      }
      setSent(true);
    } catch {
      setError("Er ging iets mis. Probeer het opnieuw of WhatsApp ons.");
    }
    setSending(false);
  };

  if (sent) {
    return (
      <div className="hth-form hth-form--sent">
        <div className="hth-form-body">
          <div className="hth-form-sent-mark">✓</div>
          <div className="hth-form-sent-title">Aanvraag ontvangen</div>
          <p className="hth-form-sent-text">
            Bedankt, {naam.split(" ")[0]}. We bekijken je gewenste data persoonlijk en sturen je binnen 24 uur een aanbod op maat via {email}.
          </p>
          <button
            type="button"
            className="hth-form-restart"
            onClick={() => { setSent(false); setCheckIn(""); setCheckOut(""); setNaam(""); setEmail(""); setBericht(""); setAantalPersonen(2); setHuisdieren(false); setAvailabilityStatus("idle"); availCheckRef.current = ""; }}
          >
            Nieuwe aanvraag
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="hth-form">
      <div className="hth-form-body">
        {/* Lodge keuze */}
        <div className="hth-form-block">
          <div className="hth-form-eyebrow">Welke lodge heeft je voorkeur?</div>
          <div className="hth-form-row">
            {(["lodge_1", "lodge_2"] as Lodge[]).map(l => (
              <button
                key={l}
                type="button"
                aria-pressed={lodge === l}
                className={`hth-lodge${lodge === l ? " hth-lodge--on" : ""}`}
                onClick={() => { setLodge(l); setAvailabilityStatus("idle"); availCheckRef.current = ""; }}
              >
                <span className="hth-lodge-title">Lodge {LODGE_LABELS[l]}</span>
                <span className="hth-lodge-desc">{LODGE_DESC[l]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Data */}
        <div className="hth-form-block">
          <div className="hth-form-row hth-form-row--fields">
            <div className="hth-field">
              <label className="hth-label" htmlFor="hth-checkin">Gewenste aankomst *</label>
              <input id="hth-checkin" className="hth-control" type="date" value={checkIn} min={minDate}
                onChange={e => {
                  const aan = e.target.value;
                  setCheckIn(aan);
                  // Meteen een geldige vertrekdatum klaarzetten, anders moet de
                  // gast zelf uitrekenen welke combinatie mag.
                  const opties = aan && isAankomstdag(aan) ? vertrekdatumsVoor(aan) : [];
                  setCheckOut(opties.length > 0 ? opties[0].datum : "");
                }} />
            </div>
            <div className="hth-field">
              <label className="hth-label" htmlFor="hth-checkout">Vertrek *</label>
              {vertrekOpties.length > 0 ? (
                <select id="hth-checkout" className="hth-control" value={checkOut} onChange={e => setCheckOut(e.target.value)}>
                  {vertrekOpties.map(o => (
                    <option key={o.datum} value={o.datum}>
                      {new Date(`${o.datum}T00:00:00`).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                      {" \u2014 "}{vormLabel(o.vorm)}
                    </option>
                  ))}
                </select>
              ) : (
                <input id="hth-checkout" className="hth-control" type="date" value={checkOut} min={checkIn || minDate}
                  onChange={e => setCheckOut(e.target.value)} disabled={!checkIn} />
              )}
            </div>
          </div>
          <p className="hth-form-note">
            We verhuren per midweek (ma&nbsp;&ndash;&nbsp;vr), weekend (vr&nbsp;&ndash;&nbsp;zo) of hele week (ma&nbsp;&ndash;&nbsp;zo).
            Aankomst is dus op maandag of vrijdag.
          </p>
          {bookingsNotYetOpen() && (
            <p className="hth-form-note">
              We openen op {formatOpeningDate()} &mdash; aanvragen kunnen voor data vanaf die dag.
            </p>
          )}
          <div className="hth-form-status" aria-live="polite">
            {dateError && (
              <p className="hth-form-note hth-form-note--error">{dateError}</p>
            )}
            {!dateError && availabilityStatus === "checking" && (
              <p className="hth-form-note">Beschikbaarheid controleren...</p>
            )}
            {!dateError && availabilityStatus === "available" && datesValid && (
              <p className="hth-form-note hth-form-note--ok">
                ✓ Deze periode is beschikbaar &mdash; {nights} nacht{nights !== 1 ? "en" : ""}
              </p>
            )}
            {!dateError && availabilityStatus === "unavailable" && (
              <p className="hth-form-note hth-form-note--error">
                ✗ Deze periode is helaas al bezet &mdash; kies andere datums
              </p>
            )}
            {!dateError && availabilityStatus === "idle" && (
              <p className="hth-form-note hth-form-note--small">
                Een verblijf duurt minimaal {MIN_NIGHTS} nachten.
              </p>
            )}
          </div>
        </div>

        {/* Personen + huisdieren */}
        <div className="hth-form-block">
          <div className="hth-form-row hth-form-row--pair">
            <div className="hth-field">
              <span className="hth-label" id="hth-personen-label">Aantal personen *</span>
              <div className="hth-control hth-stepper" role="group" aria-labelledby="hth-personen-label">
                <button type="button" className="hth-stepper-btn" aria-label="Minder personen"
                  onClick={() => setAantalPersonen(p => Math.max(1, p - 1))}>&minus;</button>
                <span className="hth-stepper-value" aria-live="polite">{aantalPersonen}</span>
                <button type="button" className="hth-stepper-btn" aria-label="Meer personen"
                  onClick={() => setAantalPersonen(p => Math.min(4, p + 1))}>+</button>
              </div>
            </div>
            <div className="hth-field">
              <label className={`hth-control hth-check${huisdieren ? " hth-check--on" : ""}`}>
                <input type="checkbox" checked={huisdieren} onChange={e => setHuisdieren(e.target.checked)} />
                <span>Ik neem een huisdier mee</span>
              </label>
            </div>
          </div>
        </div>

        {/* Gegevens */}
        <div className="hth-form-block">
          <div className="hth-form-row hth-form-row--fields hth-form-row--stack">
            <div className="hth-field">
              <label className="hth-label" htmlFor="hth-naam">Naam *</label>
              <input id="hth-naam" className="hth-control" value={naam} onChange={e => setNaam(e.target.value)} placeholder="Jan de Vries" />
            </div>
            <div className="hth-field">
              <label className="hth-label" htmlFor="hth-email">E-mailadres *</label>
              <input id="hth-email" className="hth-control" value={email} onChange={e => setEmail(e.target.value)} placeholder="jan@voorbeeld.nl" type="email" />
            </div>
          </div>
        </div>

        <div className="hth-form-block">
          <label className="hth-label" htmlFor="hth-bericht">Bericht (optioneel)</label>
          <textarea id="hth-bericht" className="hth-control hth-control--area" value={bericht}
            onChange={e => setBericht(e.target.value)}
            placeholder="Bijv. een speciale gelegenheid, flexibele data of een vraag..." rows={3} />
        </div>

        {error && <div className="hth-form-error">{error}</div>}

        <div className="hth-form-block">
          <button type="button" className="hth-form-submit" onClick={handleSubmit} disabled={!canSubmit}>
            {sending ? "Aanvraag verzenden..." : "Stuur mijn aanvraag \u2192"}
          </button>
          <p className="hth-form-note hth-form-note--center">
            Geen betaling nu. Je ontvangt binnen 24 uur een persoonlijk aanbod op maat.
          </p>
        </div>
      </div>
    </div>
  );
}
