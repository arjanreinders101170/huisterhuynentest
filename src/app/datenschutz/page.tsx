"use client";
const C = { bg: "#EAE3D2", text: "#2A2418", muted: "#5A534C", gold: "#B49A5E", border: "#D5C9B0" };

const S = {
  h1: { fontFamily: "Georgia,serif", fontSize: 36, marginBottom: 12 } as React.CSSProperties,
  h2: { fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12, color: C.text, borderBottom: `2px solid ${C.gold}`, paddingBottom: 6 } as React.CSSProperties,
  h3: { fontSize: 16, fontWeight: 600, marginTop: 20, marginBottom: 8, color: C.text } as React.CSSProperties,
  p: { marginBottom: 10, lineHeight: 1.8 } as React.CSSProperties,
  ul: { marginLeft: 20, marginBottom: 12, lineHeight: 1.8 } as React.CSSProperties,
  li: { marginBottom: 4 } as React.CSSProperties,
};

export default function DatenschutzPage() {
  return (
    <div style={{ background: C.bg, fontFamily: "var(--font-dm-sans), system-ui, sans-serif", color: C.text, minHeight: "100vh" }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 20px" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
          <h1 style={S.h1}>Datenschutzerklärung</h1>
          <a href="/privacy" style={{ color: C.gold, fontSize: 13, textDecoration: "none" }}>Nederlandse versie →</a>
        </div>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 40 }}>Stand: Mai 2026</p>

        <div style={{ lineHeight: 1.8 }}>

          <h2 style={S.h2}>1. Verantwortlicher</h2>
          <p style={S.p}>
            Verantwortlich für die Datenverarbeitung auf dieser Website im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:
          </p>
          <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, padding: "16px 20px", marginBottom: 16 }}>
            <p style={{ margin: 0, lineHeight: 1.9 }}>
              <strong>VVR Vastgoed BV</strong> (handelnd unter „Huis ter Huynen“)<br />
              Bommegearde 176<br />
              9244 AM Beetsterzwaag, Niederlande<br />
              KvK: 96382600 · USt-IdNr: NL867587106B01<br />
              Vertreten durch: Arjan Reinders<br />
              E-Mail: <a href="mailto:lodge@huisterhuynen.nl" style={{ color: C.gold }}>lodge@huisterhuynen.nl</a><br />
              Telefon: <a href="tel:+31642568603" style={{ color: C.gold }}>+31 6 42568603</a>
            </p>
          </div>

          <h2 style={S.h2}>2. Allgemeines zur Datenverarbeitung</h2>
          <h3 style={S.h3}>2.1 Umfang der Verarbeitung</h3>
          <p style={S.p}>
            Wir erheben und verwenden personenbezogene Daten unserer Nutzer grundsätzlich nur, soweit dies zur Bereitstellung einer funktionsfähigen Website sowie unserer Inhalte und Leistungen erforderlich ist oder Sie ausdrücklich eingewilligt haben.
          </p>
          <h3 style={S.h3}>2.2 Rechtsgrundlagen</h3>
          <ul style={S.ul}>
            <li style={S.li}><strong>Art. 6 Abs. 1 lit. a DSGVO</strong> – Einwilligung (z. B. Marketing-Cookies, Newsletter)</li>
            <li style={S.li}><strong>Art. 6 Abs. 1 lit. b DSGVO</strong> – Vertragserfüllung (Buchung, Zahlungsabwicklung)</li>
            <li style={S.li}><strong>Art. 6 Abs. 1 lit. c DSGVO</strong> – gesetzliche Verpflichtung (Aufbewahrung, Steuer)</li>
            <li style={S.li}><strong>Art. 6 Abs. 1 lit. f DSGVO</strong> – berechtigtes Interesse (IT-Sicherheit, Betrugsprävention)</li>
          </ul>

          <h2 style={S.h2}>3. Erhobene Daten</h2>
          <h3 style={S.h3}>3.1 Beim Besuch der Website</h3>
          <ul style={S.ul}>
            <li style={S.li}>IP-Adresse (gekürzt gespeichert)</li>
            <li style={S.li}>Datum und Uhrzeit des Zugriffs</li>
            <li style={S.li}>Browser-Typ und Betriebssystem</li>
            <li style={S.li}>Referrer-URL</li>
          </ul>
          <p style={S.p}>Diese Daten werden für die Dauer von maximal 30 Tagen in Server-Logs gespeichert (berechtigtes Interesse, Art. 6 Abs. 1 lit. f DSGVO).</p>

          <h3 style={S.h3}>3.2 Bei einer Buchung</h3>
          <ul style={S.ul}>
            <li style={S.li}>Name und Anschrift</li>
            <li style={S.li}>E-Mail-Adresse, Telefonnummer</li>
            <li style={S.li}>Buchungszeitraum, Anzahl der Gäste</li>
            <li style={S.li}>Zahlungsdaten (verarbeitet durch unseren Zahlungsdienstleister Mollie)</li>
            <li style={S.li}>Ausweisdaten zur Erfüllung der gesetzlichen Meldepflicht</li>
          </ul>
          <p style={S.p}>Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) sowie Art. 6 Abs. 1 lit. c DSGVO (gesetzliche Aufbewahrungspflicht, 7 Jahre).</p>

          <h2 style={S.h2}>4. Cookies und Tracking</h2>
          <h3 style={S.h3}>4.1 Allgemeines</h3>
          <p style={S.p}>
            Wir verwenden Cookies und ähnliche Technologien. Notwendige Cookies werden zur Bereitstellung der Website auf Grundlage unseres berechtigten Interesses (Art. 6 Abs. 1 lit. f DSGVO) bzw. § 25 Abs. 2 Nr. 2 TTDSG eingesetzt. Statistik- und Marketing-Cookies setzen wir nur mit Ihrer ausdrücklichen Einwilligung ein (Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TTDSG).
          </p>
          <h3 style={S.h3}>4.2 Meta Pixel und Conversions API</h3>
          <p style={S.p}>
            Auf dieser Website verwenden wir – nach Ihrer Einwilligung – das Meta Pixel (Facebook) sowie die Conversions API der Meta Platforms Ireland Ltd., 4 Grand Canal Square, Dublin 2, Irland. Damit erfassen wir das Verhalten von Nutzern, die durch Klicks auf Meta-Werbeanzeigen auf unsere Website weitergeleitet wurden, sowie nach einem Kauf-/Buchungsabschluss.
          </p>
          <p style={S.p}>
            <strong>Drittlandübermittlung:</strong> Eine Übermittlung Ihrer Daten in die USA findet statt. Meta Platforms, Inc. ist nach dem EU-US Data Privacy Framework zertifiziert. Wir haben mit Meta Standardvertragsklauseln gemäß Art. 46 DSGVO abgeschlossen.
          </p>
          <p style={S.p}>
            Mehr Informationen zur Datenverarbeitung bei Meta finden Sie unter <a href="https://www.facebook.com/about/privacy" target="_blank" rel="noopener noreferrer" style={{ color: C.gold }}>facebook.com/about/privacy</a>.
          </p>

          <h3 style={S.h3}>4.3 Google Tag Manager</h3>
          <p style={S.p}>
            Wir setzen den Google Tag Manager (Google Ireland Ltd., Gordon House, Barrow Street, Dublin 4, Irland) ein, um Tracking-Tags zentral zu verwalten. Der Google Tag Manager selbst erfasst keine personenbezogenen Daten, aktiviert jedoch ggf. andere Tags, die Daten erfassen können (jeweils nur mit Ihrer Einwilligung).
          </p>

          <h3 style={S.h3}>4.4 Widerruf der Einwilligung</h3>
          <p style={S.p}>
            Sie können Ihre Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen. Bitte klicken Sie dazu auf{" "}
            <button
              type="button"
              onClick={() => typeof window !== "undefined" && window.dispatchEvent(new Event("hth:open-consent"))}
              style={{ background: "none", border: "none", color: C.gold, cursor: "pointer", textDecoration: "underline", padding: 0, font: "inherit" }}
            >
              Cookie-Einstellungen öffnen
            </button>.
          </p>

          <h2 style={S.h2}>5. Empfänger Ihrer Daten</h2>
          <ul style={S.ul}>
            <li style={S.li}><strong>Mollie B.V.</strong> (Niederlande) – Zahlungsabwicklung</li>
            <li style={S.li}><strong>Resend, Inc.</strong> (USA, Standardvertragsklauseln) – Versand von Buchungsbestätigungen</li>
            <li style={S.li}><strong>Supabase Inc.</strong> (EU-Region) – Datenbankhosting</li>
            <li style={S.li}><strong>Vercel Inc.</strong> (USA, Standardvertragsklauseln) – Website-Hosting</li>
            <li style={S.li}><strong>Meta Platforms Ireland Ltd.</strong> – nur mit Einwilligung, siehe 4.2</li>
            <li style={S.li}><strong>Google Ireland Ltd.</strong> – nur mit Einwilligung, siehe 4.3</li>
            <li style={S.li}>Finanzbehörden und Buchhaltung – gesetzliche Verpflichtung</li>
          </ul>

          <h2 style={S.h2}>6. Speicherdauer</h2>
          <ul style={S.ul}>
            <li style={S.li}>Server-Logs: max. 30 Tage</li>
            <li style={S.li}>Buchungsdaten: 7 Jahre (steuerliche Aufbewahrungspflicht)</li>
            <li style={S.li}>Newsletter-Anmeldungen: bis Widerruf</li>
            <li style={S.li}>Marketing-Tracking-Daten: 12 Monate</li>
          </ul>

          <h2 style={S.h2}>7. Ihre Rechte</h2>
          <p style={S.p}>Sie haben jederzeit folgende Rechte:</p>
          <ul style={S.ul}>
            <li style={S.li}>Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO)</li>
            <li style={S.li}>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
            <li style={S.li}>Löschung Ihrer Daten (Art. 17 DSGVO)</li>
            <li style={S.li}>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
            <li style={S.li}>Datenübertragbarkeit (Art. 20 DSGVO)</li>
            <li style={S.li}>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
            <li style={S.li}>Widerruf erteilter Einwilligungen (Art. 7 Abs. 3 DSGVO)</li>
          </ul>
          <p style={S.p}>
            Anfragen richten Sie bitte an <a href="mailto:lodge@huisterhuynen.nl" style={{ color: C.gold }}>lodge@huisterhuynen.nl</a>.
          </p>

          <h2 style={S.h2}>8. Beschwerderecht</h2>
          <p style={S.p}>
            Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren. Für uns zuständig ist die niederländische Autoriteit Persoonsgegevens (<a href="https://autoriteitpersoonsgegevens.nl" target="_blank" rel="noopener noreferrer" style={{ color: C.gold }}>autoriteitpersoonsgegevens.nl</a>). In Deutschland können Sie sich an die zuständige Landesdatenschutzbehörde wenden.
          </p>

          <h2 style={S.h2}>9. SSL-Verschlüsselung</h2>
          <p style={S.p}>
            Diese Website nutzt aus Sicherheitsgründen eine SSL/TLS-Verschlüsselung. Sie erkennen eine verschlüsselte Verbindung an der Adresszeile des Browsers (https://) und am Schloss-Symbol.
          </p>

          <h2 style={S.h2}>10. Aktualität und Änderung dieser Datenschutzerklärung</h2>
          <p style={S.p}>
            Diese Datenschutzerklärung ist aktuell gültig und hat den Stand Mai 2026. Durch die Weiterentwicklung unserer Website oder geänderter gesetzlicher Vorgaben kann eine Änderung notwendig werden. Die jeweils aktuelle Fassung ist auf dieser Seite abrufbar.
          </p>

        </div>

        <div style={{ marginTop: 60, textAlign: "center", fontSize: 13, color: C.muted }}>
          <p>
            <a href="/impressum" style={{ color: C.gold, textDecoration: "none", marginRight: 16 }}>Impressum</a>
            <a href="/agb" style={{ color: C.gold, textDecoration: "none", marginRight: 16 }}>AGB</a>
            <a href="/" style={{ color: C.gold, textDecoration: "none" }}>← Zurück zur Startseite</a>
          </p>
        </div>
      </div>
    </div>
  );
}
