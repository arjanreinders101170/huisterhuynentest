"use client";
const C = { bg: "#EAE3D2", text: "#2A2418", muted: "#5A534C", gold: "#B49A5E", border: "#D5C9B0" };

const S = {
  h1: { fontFamily: "Georgia,serif", fontSize: 36, marginBottom: 12 } as React.CSSProperties,
  h2: { fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12, color: C.text, borderBottom: `2px solid ${C.gold}`, paddingBottom: 6 } as React.CSSProperties,
  h3: { fontSize: 16, fontWeight: 600, marginTop: 20, marginBottom: 8, color: C.text } as React.CSSProperties,
  p: { marginBottom: 10, lineHeight: 1.8 } as React.CSSProperties,
  ul: { marginLeft: 20, marginBottom: 12, lineHeight: 1.8 } as React.CSSProperties,
  li: { marginBottom: 4 } as React.CSSProperties,
  table: { width: "100%", borderCollapse: "collapse" as const, marginBottom: 16 },
  td: { border: `1px solid ${C.border}`, padding: "8px 12px", lineHeight: 1.6 } as React.CSSProperties,
  th: { border: `1px solid ${C.border}`, padding: "8px 12px", background: C.gold, color: "#fff", textAlign: "left" as const, fontWeight: 600 } as React.CSSProperties,
  callout: { background: "#fff8ec", border: `1px solid ${C.gold}`, borderRadius: 6, padding: "12px 16px", marginBottom: 16 } as React.CSSProperties,
};

export default function AgbPage() {
  return (
    <div style={{ background: C.bg, fontFamily: "var(--font-dm-sans), system-ui, sans-serif", color: C.text, minHeight: "100vh" }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 20px" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
          <h1 style={S.h1}>Allgemeine Geschäftsbedingungen</h1>
          <a href="/terms" style={{ color: C.gold, fontSize: 13, textDecoration: "none" }}>Nederlandse versie →</a>
        </div>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>Huis ter Huynen · Version 2.0 · Stand: Mai 2026</p>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 40 }}>
          Gültig für alle Direktbuchungen und Aufenthalte bei Huis ter Huynen, betrieben von VVR Vastgoed BV (KvK: 96382600, USt-IdNr: NL867587106B01), Bommegearde 176, 9244 AM Beetsterzwaag, Niederlande.
        </p>

        <div style={{ lineHeight: 1.8 }}>

          <h2 style={S.h2}>1. Definitionen und Geltungsbereich</h2>
          <h3 style={S.h3}>1.1 Definitionen</h3>
          <ul style={S.ul}>
            <li style={S.li}><strong>Huis ter Huynen</strong>: die Unterkunft, betrieben von VVR Vastgoed BV.</li>
            <li style={S.li}><strong>Gast</strong>: die natürliche oder juristische Person, die eine Buchung vornimmt und/oder die Unterkunft nutzt.</li>
            <li style={S.li}><strong>Buchung</strong>: die Vereinbarung über die vorübergehende Nutzung der Unterkunft für einen vereinbarten Zeitraum gegen ein vereinbartes Entgelt.</li>
            <li style={S.li}><strong>Gesamtpreis</strong>: alle Kosten inkl. Übernachtung, Endreinigung, Kurtaxe und etwaige Zuschläge.</li>
          </ul>
          <h3 style={S.h3}>1.2 Geltungsbereich</h3>
          <p style={S.p}>Diese AGB gelten für sämtliche Angebote, Buchungen und Verträge zwischen Huis ter Huynen und dem Gast. Mit der Bestätigung einer Buchung erklärt der Gast, diese AGB zur Kenntnis genommen zu haben und mit ihnen einverstanden zu sein. Abweichungen sind nur wirksam, wenn schriftlich vereinbart.</p>

          <h2 style={S.h2}>2. Zustandekommen der Buchung</h2>
          <p style={S.p}>Eine Buchung kommt zustande, sobald Huis ter Huynen eine schriftliche Bestätigung (per E-Mail) verschickt hat. Der Gast haftet für die Richtigkeit der angegebenen Daten. Der Hauptbucher muss mindestens 18 Jahre alt sein. Die maximale Belegung pro Buchung ist verbindlich.</p>

          <h2 style={S.h2}>3. Zahlung</h2>
          <table style={S.table}>
            <thead>
              <tr><th style={S.th}>Zeitpunkt</th><th style={S.th}>Zu zahlender Betrag</th></tr>
            </thead>
            <tbody>
              <tr><td style={S.td}>Bei Buchung</td><td style={S.td}>30 % Anzahlung des Gesamtpreises</td></tr>
              <tr><td style={S.td}>Spätestens 30 Tage vor Anreise</td><td style={S.td}>Restbetrag (70 %)</td></tr>
              <tr><td style={S.td}>Bei Buchungen innerhalb 30 Tagen vor Anreise</td><td style={S.td}>100 % sofort fällig</td></tr>
            </tbody>
          </table>
          <p style={S.p}>Akzeptierte Zahlungsmethoden: iDEAL, SEPA-Überweisung, Visa, Mastercard. Alle Beträge enthalten die gesetzliche Mehrwertsteuer.</p>
          <p style={S.p}>Bei nicht fristgerechter Zahlung ist Huis ter Huynen nach Ablauf einer Nachfrist von 5 Werktagen berechtigt, die Buchung zu stornieren. Es gelten dann die Stornierungskosten nach Ziffer 4.</p>

          <h2 style={S.h2}>4. Stornierung durch den Gast</h2>
          <p style={S.p}>Stornierungen sind ausschließlich schriftlich (per E-Mail) wirksam. Maßgeblich ist das Eingangsdatum bei Huis ter Huynen.</p>
          <table style={S.table}>
            <thead>
              <tr><th style={S.th}>Zeitpunkt der Stornierung</th><th style={S.th}>Erstattung</th></tr>
            </thead>
            <tbody>
              <tr><td style={S.td}>Mehr als 60 Tage vor Anreise</td><td style={S.td}>100 % (abzüglich €25 Bearbeitungsgebühr)</td></tr>
              <tr><td style={S.td}>30–60 Tage vor Anreise</td><td style={S.td}>70 %</td></tr>
              <tr><td style={S.td}>14–30 Tage vor Anreise</td><td style={S.td}>50 %</td></tr>
              <tr><td style={S.td}>7–14 Tage vor Anreise</td><td style={S.td}>25 %</td></tr>
              <tr><td style={S.td}>Weniger als 7 Tage vor Anreise</td><td style={S.td}>Keine Erstattung</td></tr>
              <tr><td style={S.td}>No-show</td><td style={S.td}>Keine Erstattung</td></tr>
            </tbody>
          </table>
          <div style={S.callout}>
            <strong>Empfehlung:</strong> Wir empfehlen den Abschluss einer Reiserücktrittsversicherung. Bei höherer Gewalt (z. B. Krankheit) suchen wir in Absprache nach einer Lösung.
          </div>

          <h2 style={S.h2}>5. Stornierung durch Huis ter Huynen</h2>
          <p style={S.p}>Huis ter Huynen ist berechtigt, eine Buchung zu stornieren bei: höherer Gewalt (siehe Ziffer 11), falschen oder betrügerischen Buchungsangaben, nicht fristgerechter Zahlung nach Mahnung oder Verstoß gegen frühere Aufenthaltsvereinbarungen. Bei einer Stornierung durch Huis ter Huynen (außer höherer Gewalt) erhält der Gast 100 % Erstattung. Weitergehende Schadensersatzansprüche sind ausgeschlossen.</p>

          <h2 style={S.h2}>6. An- und Abreise</h2>
          <table style={S.table}>
            <thead>
              <tr><th style={S.th}>Zeitpunkt</th><th style={S.th}>Uhrzeit</th></tr>
            </thead>
            <tbody>
              <tr><td style={S.td}>Check-in</td><td style={S.td}>15:00 – 21:00 Uhr</td></tr>
              <tr><td style={S.td}>Check-out</td><td style={S.td}>spätestens 11:00 Uhr</td></tr>
            </tbody>
          </table>
          <p style={S.p}>Späte Anreise (Late Check-in) ist bis 24:00 Uhr möglich. Späte Abreise (nach 11:00 Uhr) ist nur nach Absprache möglich und kostet €25 (max. bis 13:00 Uhr). Bei der Ankunft kann nach einem gültigen Lichtbildausweis gefragt werden (Kurtaxe-Meldepflicht).</p>

          <h2 style={S.h2}>7. Aufenthalt und Hausordnung</h2>
          <h3 style={S.h3}>7.1 Rauchen</h3>
          <p style={S.p}>Rauchen ist im Inneren der Unterkunft nicht gestattet. Bei Verstößen wird eine Reinigungsgebühr von mindestens €150 erhoben.</p>
          <h3 style={S.h3}>7.2 Haustiere</h3>
          <p style={S.p}>Haustiere sind willkommen. Es wird eine pauschale Reinigungsgebühr von €25 erhoben. Der Gast haftet für sämtliche durch Haustiere verursachten Schäden.</p>
          <h3 style={S.h3}>7.3 Feiern und Veranstaltungen</h3>
          <p style={S.p}>Feiern, Veranstaltungen oder Zusammenkünfte mit mehr Personen als bei der Buchung vereinbart sind nicht gestattet, sofern nicht schriftlich anders vereinbart.</p>
          <h3 style={S.h3}>7.4 Ruhezeiten</h3>
          <p style={S.p}>Zwischen 22:00 und 08:00 Uhr gilt die gesetzliche Nachtruhe. Bei wiederholten Lärmbeschwerden kann der Aufenthalt fristlos und ohne Erstattung beendet werden.</p>
          <h3 style={S.h3}>7.5 Belegung</h3>
          <p style={S.p}>Die Unterkunft darf nicht mit mehr Personen als bei der Buchung vereinbart belegt werden. Tagesgäste sind im Voraus anzumelden.</p>
          <h3 style={S.h3}>7.6 Zustand bei Abreise</h3>
          <ul style={S.ul}>
            <li style={S.li}>Die Unterkunft ist in ordentlichem Zustand zu hinterlassen (Geschirr gespült, Müll sortiert, Sachen aufgeräumt).</li>
            <li style={S.li}>Fenster und Türen müssen bei Abreise geschlossen sein.</li>
            <li style={S.li}>Schlüssel/Zugangsmittel sind wie vereinbart zurückzugeben.</li>
          </ul>

          <h2 style={S.h2}>8. Schäden und Reinigung</h2>
          <p style={S.p}>Huis ter Huynen erhebt keine Kaution. Der Gast haftet für sämtliche während des Aufenthalts entstandenen Schäden. Schäden sind unverzüglich zu melden. Bei übermäßiger Verschmutzung werden zusätzliche Reinigungskosten ab €75 berechnet.</p>

          <h2 style={S.h2}>9. Haftung</h2>
          <p style={S.p}>Huis ter Huynen haftet nicht für: Personenschäden außer bei Vorsatz oder grober Fahrlässigkeit; Diebstahl, Verlust oder Beschädigung persönlicher Gegenstände; Schäden durch extreme Witterung oder andere externe Faktoren; mittelbare Schäden oder Folgeschäden (entgangener Gewinn, verpasste Aktivitäten). Die Haftung von Huis ter Huynen ist auf die Höhe der Übernachtungskosten beschränkt. Der Gast haftet gesamtschuldnerisch für alle während des Aufenthalts an der Unterkunft entstehenden Schäden.</p>

          <h2 style={S.h2}>10. Beschwerden und Streitigkeiten</h2>
          <p style={S.p}>Beschwerden sind unverzüglich bei Ankunft bzw. spätestens binnen 24 Stunden nach Feststellung zu melden, damit Huis ter Huynen Abhilfe schaffen kann. Beschwerden, die erst nach Abreise gemeldet werden, werden nicht bearbeitet. Beschwerden bitte per E-Mail an <a href="mailto:lodge@huisterhuynen.nl" style={{ color: C.gold }}>lodge@huisterhuynen.nl</a>.</p>
          <p style={S.p}>
            Die Europäische Kommission stellt eine Online-Streitbeilegungsplattform bereit:{" "}
            <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" style={{ color: C.gold }}>ec.europa.eu/consumers/odr</a>. Wir sind weder verpflichtet noch bereit, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>

          <h2 style={S.h2}>11. Höhere Gewalt</h2>
          <p style={S.p}>Als höhere Gewalt gelten unvorhersehbare Umstände, die nicht von Huis ter Huynen oder dem Gast zu vertreten sind, darunter Brand, Hochwasser, extreme Wetterereignisse, Epidemien, Pandemien, behördliche Anordnungen oder andere Katastrophen. In diesem Fall sucht Huis ter Huynen gemeinsam mit dem Gast nach einer angemessenen Lösung (z. B. Umbuchung, anteilige Erstattung).</p>

          <h2 style={S.h2}>12. Datenschutz</h2>
          <p style={S.p}>Wir verarbeiten personenbezogene Daten gemäß DSGVO. Einzelheiten finden Sie in unserer <a href="/datenschutz" style={{ color: C.gold }}>Datenschutzerklärung</a>.</p>

          <h2 style={S.h2}>13. Anwendbares Recht und Gerichtsstand</h2>
          <p style={S.p}>Auf alle Verträge findet niederländisches Recht Anwendung. Gerichtsstand ist – soweit gesetzlich zulässig – das Gericht des Bezirks Noord-Nederland (Rechtbank Noord-Nederland). Zwingende Verbraucherschutzvorschriften des Landes, in dem der Gast seinen gewöhnlichen Aufenthalt hat, bleiben unberührt.</p>

          <h2 style={S.h2}>14. Kontakt</h2>
          <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, padding: "20px 24px" }}>
            <p style={{ margin: 0, lineHeight: 2 }}>
              <strong>VVR Vastgoed BV</strong><br />
              Bommegearde 176, 9244 AM Beetsterzwaag, Niederlande<br />
              KvK: 96382600 · USt-IdNr: NL867587106B01<br />
              E-Mail: <a href="mailto:lodge@huisterhuynen.nl" style={{ color: C.gold }}>lodge@huisterhuynen.nl</a><br />
              Telefon: <a href="tel:+31642568603" style={{ color: C.gold }}>+31 6 42568603</a>
            </p>
          </div>

        </div>

        <div style={{ marginTop: 60, textAlign: "center", fontSize: 13, color: C.muted }}>
          <p>© 2026 Huis ter Huynen. Alle Rechte vorbehalten.</p>
          <p>
            <a href="/datenschutz" style={{ color: C.gold, textDecoration: "none", marginRight: 16 }}>Datenschutz</a>
            <a href="/impressum" style={{ color: C.gold, textDecoration: "none", marginRight: 16 }}>Impressum</a>
            <a href="/" style={{ color: C.gold, textDecoration: "none" }}>← Zurück zur Startseite</a>
          </p>
        </div>
      </div>
    </div>
  );
}
