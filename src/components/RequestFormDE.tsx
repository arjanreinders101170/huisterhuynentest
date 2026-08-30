"use client";
import { useState } from "react";
import { checkStayDates, earliestStayDate, bookingsNotYetOpen, formatOpeningDate, MIN_NIGHTS,
         isAankomstdag, vertrekdatumsVoor, vormLabel } from "@/lib/stay-dates";
import { pushEvent, baseEnvelope, newEventId, saveUserCache } from "@/lib/tracking/dataLayer";
import { getAttribution } from "@/lib/tracking/attribution";

type Lodge = "lodge_1" | "lodge_2";
const LODGE_LABELS: Record<Lodge, string> = { lodge_1: "De Heide", lodge_2: "De Eik" };
const LODGE_DESC: Record<Lodge, string> = {
  lodge_1: "Panoramablick über die Heide, eigene Sauna",
  lodge_2: "Unter den Eichen, vollständige Küche & BBQ",
};

function diffDays(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

export default function RequestFormDE() {
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

  const minDate = earliestStayDate();
  const nights = checkIn && checkOut ? diffDays(checkIn, checkOut) : 0;
  const dateCheck = checkStayDates(checkIn, checkOut, { locale: "de" });
  const vertrekOpties = checkIn && isAankomstdag(checkIn) ? vertrekdatumsVoor(checkIn) : [];
  const datesValid = dateCheck.ok;
  const dateError = checkIn && checkOut && !dateCheck.ok ? dateCheck.error : "";
  const canSubmit = datesValid && naam.trim() && email.includes("@") && !sending;

  const handleSubmit = async () => {
    setError("");
    if (!dateCheck.ok) { setError(dateCheck.error); return; }
    if (!naam.trim() || !email.includes("@")) { setError("Bitte geben Sie Ihren Namen und Ihre E-Mail-Adresse an."); return; }

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
        lead: { form: "de_anfrage", value: 0 },
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
          locale: "de",
          _meta: { event_id: metaEventId },
          _attr: getAttribution(),
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder schreiben Sie uns auf WhatsApp.");
        setSending(false);
        return;
      }
      setSent(true);
    } catch {
      setError("Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder schreiben Sie uns auf WhatsApp.");
    }
    setSending(false);
  };

  if (sent) {
    return (
      <div className="hth-form hth-form--sent">
        <div className="hth-form-body">
          <div className="hth-form-sent-mark">✓</div>
          <div className="hth-form-sent-title">Anfrage erhalten</div>
          <p className="hth-form-sent-text">
            Vielen Dank, {naam.split(" ")[0]}. Wir prüfen Ihre gewünschten Daten persönlich und senden Ihnen innerhalb von 24 Stunden ein maßgeschneidertes Angebot an {email}.
          </p>
          <button
            type="button"
            className="hth-form-restart"
            onClick={() => { setSent(false); setCheckIn(""); setCheckOut(""); setNaam(""); setEmail(""); setBericht(""); setAantalPersonen(2); setHuisdieren(false); }}
          >
            Neue Anfrage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="hth-form">
      <div className="hth-form-body">
        {/* Lodge Auswahl */}
        <div className="hth-form-block">
          <div className="hth-form-eyebrow">Welche Lodge bevorzugen Sie?</div>
          <div className="hth-form-row">
            {(["lodge_1", "lodge_2"] as Lodge[]).map(l => (
              <button
                key={l}
                type="button"
                aria-pressed={lodge === l}
                className={`hth-lodge${lodge === l ? " hth-lodge--on" : ""}`}
                onClick={() => setLodge(l)}
              >
                <span className="hth-lodge-title">Lodge {LODGE_LABELS[l]}</span>
                <span className="hth-lodge-desc">{LODGE_DESC[l]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Daten */}
        <div className="hth-form-block">
          <div className="hth-form-row hth-form-row--fields">
            <div className="hth-field">
              <label className="hth-label" htmlFor="hth-checkin-de">Gewünschtes Anreisedatum *</label>
              <input id="hth-checkin-de" className="hth-control" type="date" value={checkIn} min={minDate}
                onChange={e => {
                  const aan = e.target.value;
                  setCheckIn(aan);
                  const opties = aan && isAankomstdag(aan) ? vertrekdatumsVoor(aan) : [];
                  setCheckOut(opties.length > 0 ? opties[0].datum : "");
                }} />
            </div>
            <div className="hth-field">
              <label className="hth-label" htmlFor="hth-checkout-de">Abreise *</label>
              {vertrekOpties.length > 0 ? (
                <select id="hth-checkout-de" className="hth-control" value={checkOut} onChange={e => setCheckOut(e.target.value)}>
                  {vertrekOpties.map(o => (
                    <option key={o.datum} value={o.datum}>
                      {new Date(`${o.datum}T00:00:00`).toLocaleDateString("de-DE", { day: "numeric", month: "short" })}
                      {" \u2014 "}{vormLabel(o.vorm, "de")}
                    </option>
                  ))}
                </select>
              ) : (
                <input id="hth-checkout-de" className="hth-control" type="date" value={checkOut} min={checkIn || minDate}
                  onChange={e => setCheckOut(e.target.value)} disabled={!checkIn} />
              )}
            </div>
          </div>
          <p className="hth-form-note">
            Wir vermieten als Kurzwoche (Mo&nbsp;&ndash;&nbsp;Fr), Wochenende (Fr&nbsp;&ndash;&nbsp;So) oder ganze
            Woche (Mo&nbsp;&ndash;&nbsp;So). Anreise ist also montags oder freitags.
          </p>
          {bookingsNotYetOpen() && (
            <p className="hth-form-note hth-form-note--small">
              Wir eröffnen am {formatOpeningDate("de")} &mdash; Anfragen sind für Daten ab diesem Tag möglich.
            </p>
          )}
          <div className="hth-form-status" aria-live="polite">
            {dateError ? (
              <p className="hth-form-note hth-form-note--error">{dateError}</p>
            ) : (
              <p className="hth-form-note hth-form-note--small">
                {datesValid
                  ? `${nights} Nacht${nights !== 1 ? "e" : ""} ausgewählt`
                  : `Mindestaufenthalt ${MIN_NIGHTS} Nächte.`}
              </p>
            )}
          </div>
        </div>

        {/* Personen + Haustiere */}
        <div className="hth-form-block">
          <div className="hth-form-row hth-form-row--pair">
            <div className="hth-field">
              <span className="hth-label" id="hth-personen-label-de">Personenanzahl *</span>
              <div className="hth-control hth-stepper" role="group" aria-labelledby="hth-personen-label-de">
                <button type="button" className="hth-stepper-btn" aria-label="Weniger Personen"
                  onClick={() => setAantalPersonen(p => Math.max(1, p - 1))}>&minus;</button>
                <span className="hth-stepper-value" aria-live="polite">{aantalPersonen}</span>
                <button type="button" className="hth-stepper-btn" aria-label="Mehr Personen"
                  onClick={() => setAantalPersonen(p => Math.min(4, p + 1))}>+</button>
              </div>
            </div>
            <div className="hth-field">
              <label className={`hth-control hth-check${huisdieren ? " hth-check--on" : ""}`}>
                <input type="checkbox" checked={huisdieren} onChange={e => setHuisdieren(e.target.checked)} />
                <span>Ich bringe ein Haustier mit</span>
              </label>
            </div>
          </div>
        </div>

        {/* Kontaktdaten */}
        <div className="hth-form-block">
          <div className="hth-form-row hth-form-row--fields hth-form-row--stack">
            <div className="hth-field">
              <label className="hth-label" htmlFor="hth-naam-de">Name *</label>
              <input id="hth-naam-de" className="hth-control" value={naam} onChange={e => setNaam(e.target.value)} placeholder="Max Mustermann" />
            </div>
            <div className="hth-field">
              <label className="hth-label" htmlFor="hth-email-de">E-Mail-Adresse *</label>
              <input id="hth-email-de" className="hth-control" value={email} onChange={e => setEmail(e.target.value)} placeholder="max@beispiel.de" type="email" />
            </div>
          </div>
        </div>

        <div className="hth-form-block">
          <label className="hth-label" htmlFor="hth-bericht-de">Nachricht (optional)</label>
          <textarea id="hth-bericht-de" className="hth-control hth-control--area" value={bericht}
            onChange={e => setBericht(e.target.value)}
            placeholder="Z.B. ein besonderer Anlass, flexible Reisedaten oder eine Frage..." rows={3} />
        </div>

        {error && <div className="hth-form-error">{error}</div>}

        <div className="hth-form-block">
          <button type="button" className="hth-form-submit" onClick={handleSubmit} disabled={!canSubmit}>
            {sending ? "Anfrage wird gesendet..." : "Anfrage senden \u2192"}
          </button>
          <p className="hth-form-note hth-form-note--center">
            Keine Zahlung jetzt. Sie erhalten innerhalb von 24 Stunden ein persönliches Angebot.
          </p>
        </div>
      </div>
    </div>
  );
}
