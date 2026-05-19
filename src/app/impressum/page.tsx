"use client";
const C = { bg: "#EAE3D2", text: "#2A2418", muted: "#5A534C", gold: "#B49A5E", border: "#D5C9B0" };

const S = {
  h1: { fontFamily: "Georgia,serif", fontSize: 36, marginBottom: 12 } as React.CSSProperties,
  h2: { fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12, color: C.text, borderBottom: `2px solid ${C.gold}`, paddingBottom: 6 } as React.CSSProperties,
  p: { marginBottom: 10, lineHeight: 1.8 } as React.CSSProperties,
};

export default function ImpressumPage() {
  return (
    <div style={{ background: C.bg, fontFamily: "var(--font-dm-sans), system-ui, sans-serif", color: C.text, minHeight: "100vh" }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 20px" }}>

        <h1 style={S.h1}>Impressum</h1>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 40 }}>Angaben gemäß § 5 TMG</p>

        <div style={{ lineHeight: 1.8 }}>

          <h2 style={S.h2}>Anbieter</h2>
          <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, padding: "20px 24px", marginBottom: 16 }}>
            <p style={{ margin: 0, lineHeight: 1.9 }}>
              <strong>VVR Vastgoed BV</strong><br />
              handelnd unter „Huis ter Huynen“<br />
              Bommegearde 176<br />
              9244 AM Beetsterzwaag<br />
              Niederlande
            </p>
          </div>

          <h2 style={S.h2}>Vertreten durch</h2>
          <p style={S.p}>Arjan Reinders, Geschäftsführer</p>

          <h2 style={S.h2}>Kontakt</h2>
          <p style={S.p}>
            Telefon: <a href="tel:+31642568603" style={{ color: C.gold }}>+31 6 42568603</a><br />
            E-Mail: <a href="mailto:lodge@huisterhuynen.nl" style={{ color: C.gold }}>lodge@huisterhuynen.nl</a>
          </p>

          <h2 style={S.h2}>Standort der Unterkunft</h2>
          <p style={S.p}>
            Huis ter Huynen — Boutique Lodge<br />
            Zuiderstraat 6<br />
            9491 EC Zeijen, Niederlande
          </p>

          <h2 style={S.h2}>Registereintrag</h2>
          <p style={S.p}>
            Eintragung im Handelsregister (KvK Niederlande)<br />
            Registernummer: <strong>96382600</strong><br />
            Registergericht: Kamer van Koophandel, Niederlande
          </p>

          <h2 style={S.h2}>Umsatzsteuer-Identifikationsnummer</h2>
          <p style={S.p}>
            Gemäß § 27 a Umsatzsteuergesetz:<br />
            <strong>NL867587106B01</strong>
          </p>

          <h2 style={S.h2}>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
          <p style={S.p}>
            Arjan Reinders<br />
            Bommegearde 176, 9244 AM Beetsterzwaag, Niederlande
          </p>

          <h2 style={S.h2}>Streitschlichtung</h2>
          <p style={S.p}>
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
            <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" style={{ color: C.gold }}>
              https://ec.europa.eu/consumers/odr/
            </a>
          </p>
          <p style={S.p}>
            Unsere E-Mail-Adresse finden Sie oben im Impressum. Wir sind weder verpflichtet noch bereit, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>

          <h2 style={S.h2}>Haftung für Inhalte</h2>
          <p style={S.p}>
            Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.
          </p>

          <h2 style={S.h2}>Haftung für Links</h2>
          <p style={S.p}>
            Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
          </p>

          <h2 style={S.h2}>Urheberrecht</h2>
          <p style={S.p}>
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem niederländischen und deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
          </p>

        </div>

        <div style={{ marginTop: 60, textAlign: "center", fontSize: 13, color: C.muted }}>
          <p>
            <a href="/datenschutz" style={{ color: C.gold, textDecoration: "none", marginRight: 16 }}>Datenschutz</a>
            <a href="/agb" style={{ color: C.gold, textDecoration: "none", marginRight: 16 }}>AGB</a>
            <a href="/" style={{ color: C.gold, textDecoration: "none" }}>← Zurück zur Startseite</a>
          </p>
        </div>
      </div>
    </div>
  );
}
