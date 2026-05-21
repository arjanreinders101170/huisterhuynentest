import Image from "next/image";
import Link from "next/link";

const T = {
  bg: "#EAE3D2",
  card: "#FDFBF6",
  green: "#2F4F3E",
  text: "#2A2418",
  muted: "#5A534C",
  gold: "#B49A5E",
  border: "#E0D8C8",
  serif: "Georgia, 'Times New Roman', serif",
  sans: "var(--font-dm-sans), system-ui, sans-serif",
};

const fietsroutes = [
  {
    naam: "Norgeroute vanuit Zeijen",
    afstand: "18 km",
    niveau: "Makkelijk",
    duur: "± 1,5 uur",
    start: "Direct vanuit de lodge",
    beschrijving:
      "De ideale eerste route. Vanuit Zeijen door de esdorpen richting Norg — houtwallen, brinkjes en stille zandpaden. Perfect voor beginners en gezinnen met kinderen.",
    kleur: T.green,
  },
  {
    naam: "Hondsrug Fietsroute",
    afstand: "45 km",
    niveau: "Gemiddeld",
    duur: "± 3 uur",
    start: "5 min fietsen",
    beschrijving:
      "Over de stuwwal die Drenthe zijn ruggengraat geeft. Afwisselend bos, open heide en authentieke esdorpen. Hoogtepunten: Rolde, Grolloo en het Ballooërveld met schaapskudde.",
    kleur: "#7B6B3A",
  },
  {
    naam: "Hunebedenroute",
    afstand: "55 km",
    niveau: "Gevorderd",
    duur: "± 4 uur",
    start: "5 min fietsen",
    beschrijving:
      "Prehistorisch Drenthe op twee wielen. Van Zeijen tot Borger langs 15 hunebedden — ideaal als dagtocht met picknick in het veld. Een van de iconische fietsvakantie Drenthe routes.",
    kleur: T.green,
  },
  {
    naam: "Drentsche Aa Route",
    afstand: "35 km",
    niveau: "Makkelijk",
    duur: "± 2,5 uur",
    start: "10 min fietsen",
    beschrijving:
      "Door het Nationaal Park Drentsche Aa — een rivierdal met brongebieden, elzenbroekbossen en stilte die de stad vergeten doet. Een van de mooiste natuurroutes van Nederland.",
    kleur: T.green,
  },
  {
    naam: "Esdorpenroute Grolloo–Rolde",
    afstand: "25 km",
    niveau: "Makkelijk",
    duur: "± 2 uur",
    start: "5 min fietsen",
    beschrijving:
      "Langs de meest authentieke esdorpen van Drenthe. Kleine kerken, groene brinkjes en koeien langs het pad. Rust en tijdloosheid in optima forma.",
    kleur: "#7B6B3A",
  },
  {
    naam: "MTB Zeijerwiek",
    afstand: "15 km",
    niveau: "Avontuurlijk",
    duur: "± 1,5 uur",
    start: "Direct vanuit de lodge",
    beschrijving:
      "Voor wie snelheid en terrein wil. Singletrack en bospad door het Zeijerwiek — avontuurlijk maar goed te doen voor gemiddelde mountainbikers.",
    kleur: "#7B6B3A",
  },
];

const wandelroutes = [
  {
    naam: "Veentjesroute Zeijen",
    afstand: "7,5 km",
    niveau: "Makkelijk",
    duur: "± 2 uur",
    beschrijving:
      "De mooiste wandelroute in Drenthe direct vanuit de lodge. Langs houtwallen, veentjes en Drentse gedichten door het Zeijerwiek. Vlak, goed begaanbaar en het hele jaar door mooi.",
    kleur: T.green,
  },
  {
    naam: "Zeijerstrubben",
    afstand: "Vrij verkennen",
    niveau: "Makkelijk",
    duur: "1–2 uur",
    beschrijving:
      "Oud strubbenbos met kronkelende eiken op een stuifzandheuvel. Mysterieus, stil en perfect voor een vroege ochtend. Weinig bezoekers, veel sfeer — een verborgen parel van Drenthe.",
    kleur: T.green,
  },
  {
    naam: "Ballooërveld",
    afstand: "9 km",
    niveau: "Gemiddeld",
    duur: "± 2,5 uur",
    beschrijving:
      "367 hectare heideveld met schaapskudde. Spectaculair in augustus als de heide paars kleurt. Op 12 minuten rijden van de lodge — wandelen in Drenthe op zijn allerbest.",
    kleur: "#7B6B3A",
  },
];

const faqItems = [
  {
    v: "Is Drenthe geschikt voor een fietsvakantie?",
    a: "Zeker. Drenthe heeft meer dan 1.000 km aan gemarkeerde fietspaden en een uitgebreid knooppuntennet waarmee u zelf routes kunt samenstellen. Het landschap is vlak tot licht heuvelachtig, ideaal voor elk niveau — van gezinnen tot getrainde fietsers.",
  },
  {
    v: "Kan ik mijn fiets meenemen naar de lodge?",
    a: "Ja, u kunt uw eigen fiets meenemen. Er is overdekte stallingmogelijkheid op het terrein van Huis ter Huynen.",
  },
  {
    v: "Zijn er e-bikes te huur in de omgeving van Zeijen?",
    a: "Ja, in Assen (20 min) zijn meerdere fietsverhuurbedrijven waar u (e-)bikes kunt huren. Bezorging op locatie is op aanvraag mogelijk.",
  },
  {
    v: "Welke wandelroutes starten direct bij de lodge?",
    a: "De Veentjesroute Zeijen (7,5 km) start direct bij de lodge. Ook het Zeijerwiek en de Zeijerstrubben liggen op loopafstand. Er zijn 13+ gemarkeerde routes binnen 15 minuten te belopen.",
  },
  {
    v: "Hoe ver is Huis ter Huynen van Nationaal Park Drentsche Aa?",
    a: "Het Nationaal Park Drentsche Aa grenst bijna aan Zeijen. Op de fiets bent u er in 10–15 minuten — het startpunt van de Drentsche Aa route ligt op korte afstand van de lodge.",
  },
];

export default function OmgevingPage() {
  return (
    <div style={{ background: T.bg, fontFamily: T.sans, color: T.text }}>

      {/* ── Breadcrumb nav ── */}
      <div style={{ background: T.green, padding: "16px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <nav aria-label="Breadcrumb">
            <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <li>
                <Link href="/" style={{ fontFamily: T.sans, fontSize: 12, color: "rgba(255,255,255,.6)", textDecoration: "none" }}>
                  Huis ter Huynen
                </Link>
              </li>
              <li style={{ fontSize: 12, color: "rgba(255,255,255,.4)" }}>›</li>
              <li style={{ fontFamily: T.sans, fontSize: 12, color: T.gold, fontWeight: 600 }}>
                Omgeving & Activiteiten
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* ── Hero ── */}
      <div style={{ background: T.green, padding: "56px 40px 72px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.gold, letterSpacing: "2.5px", textTransform: "uppercase" as const, marginBottom: 16 }}>
            Zeijen · Drenthe
          </div>
          <h1 style={{ fontFamily: T.serif, fontSize: "clamp(28px, 5vw, 52px)", color: "white", margin: "0 0 24px", fontWeight: 700, lineHeight: 1.15 }}>
            Fietsen en wandelen<br />in Drenthe vanuit Zeijen
          </h1>
          <p style={{ fontFamily: T.sans, fontSize: 17, color: "rgba(255,255,255,.72)", fontWeight: 300, maxWidth: 680, margin: "0 auto 36px", lineHeight: 1.75 }}>
            Zeijen ligt midden in het Drentse fiets- en wandelparadijs. Meer dan 1.000 km gemarkeerde fietspaden, wandelroutes die direct bij de lodge starten en het Nationaal Park Drentsche Aa op 15 minuten. Stap buiten — en Drenthe staat voor u klaar.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" as const }}>
            <a href="#fietsen" style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 600, color: T.green, background: T.gold, padding: "12px 24px", borderRadius: 8, textDecoration: "none", letterSpacing: ".02em" }}>
              Fietsroutes bekijken
            </a>
            <a href="#wandelen" style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 600, color: "white", border: "1px solid rgba(255,255,255,.35)", padding: "12px 24px", borderRadius: 8, textDecoration: "none" }}>
              Wandelroutes
            </a>
          </div>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div style={{ background: T.card, borderBottom: `1px solid ${T.border}`, padding: "28px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 40, justifyContent: "center", flexWrap: "wrap" as const }}>
          {[
            { n: "1.000+", label: "km fietspaden in Drenthe" },
            { n: "13+",    label: "wandelroutes op 15 min" },
            { n: "52",     label: "hunebedden in de buurt" },
            { n: "15 min", label: "tot Nationaal Park" },
          ].map(({ n, label }) => (
            <div key={label} style={{ textAlign: "center" as const }}>
              <div style={{ fontFamily: T.serif, fontSize: 28, fontWeight: 700, color: T.green }}>{n}</div>
              <div style={{ fontFamily: T.sans, fontSize: 12, color: T.muted }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════
          FIETSEN
      ══════════════════════════════════════ */}
      <section id="fietsen" style={{ padding: "80px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          <div style={{ textAlign: "center" as const, marginBottom: 56 }}>
            <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.gold, letterSpacing: "2.5px", textTransform: "uppercase" as const, marginBottom: 12 }}>
              Fietsvakantie Drenthe
            </div>
            <h2 style={{ fontFamily: T.serif, fontSize: "clamp(24px, 4vw, 40px)", color: T.text, margin: "0 0 20px", fontWeight: 700, lineHeight: 1.2 }}>
              Fietsroutes in Drenthe — direct voor de deur
            </h2>
            <p style={{ fontFamily: T.sans, fontSize: 16, color: T.muted, fontWeight: 300, maxWidth: 640, margin: "0 auto", lineHeight: 1.75 }}>
              Drenthe is het beste fietsland van Nederland. Weinig verkeer, eindeloze bospaden en een knooppuntennet waarmee u zelf elke route kunt samenstellen. Vanuit Huis ter Huynen in Zeijen fietst u zo het landschap in — 18 km routes direct vanaf de deur.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginBottom: 48 }}>
            {fietsroutes.map((route) => (
              <article key={route.naam} style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, padding: "28px 24px", boxShadow: "0 2px 12px rgba(47,79,62,.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <span style={{
                    fontFamily: T.sans, fontSize: 10, fontWeight: 700,
                    color: route.kleur,
                    background: route.kleur === T.green ? "rgba(47,79,62,.08)" : "rgba(123,107,58,.08)",
                    padding: "3px 10px", borderRadius: 6, textTransform: "uppercase" as const, letterSpacing: "0.5px",
                  }}>
                    {route.niveau}
                  </span>
                  <span style={{ fontFamily: T.sans, fontSize: 11, color: T.muted }}>{route.start}</span>
                </div>
                <h3 style={{ fontFamily: T.serif, fontSize: 18, color: T.text, margin: "0 0 4px", fontWeight: 700, lineHeight: 1.3 }}>
                  {route.naam}
                </h3>
                <div style={{ fontFamily: T.sans, fontSize: 12, color: T.gold, fontWeight: 600, marginBottom: 12 }}>
                  {route.afstand} · {route.duur}
                </div>
                <p style={{ fontFamily: T.sans, fontSize: 13, color: T.muted, margin: 0, lineHeight: 1.65, fontWeight: 300 }}>
                  {route.beschrijving}
                </p>
              </article>
            ))}
          </div>

          {/* E-bike infobox */}
          <div style={{ background: T.green, borderRadius: 14, padding: "36px 40px", display: "flex", gap: 40, alignItems: "flex-start", flexWrap: "wrap" as const }}>
            <div style={{ flex: "1 1 260px" }}>
              <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.gold, letterSpacing: "2px", textTransform: "uppercase" as const, marginBottom: 10 }}>
                Fiets mee of huur ter plekke
              </div>
              <h3 style={{ fontFamily: T.serif, fontSize: 20, color: "white", margin: "0 0 12px", fontWeight: 700 }}>
                E-bike of eigen fiets?
              </h3>
              <p style={{ fontFamily: T.sans, fontSize: 14, color: "rgba(255,255,255,.72)", fontWeight: 300, margin: 0, lineHeight: 1.75 }}>
                U kunt uw eigen fiets meenemen — er is overdekte stallingruimte op het terrein. Liever een e-bike huren? In Assen (20 min) zijn meerdere verhuurders, deels met bezorging op locatie. Ideaal voor een zorgeloze fietsvakantie in Drenthe.
              </p>
            </div>
            <div style={{ flex: "1 1 260px" }}>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {[
                  "Overdekte fietsenstalling op het terrein",
                  "Knooppuntenkaarten beschikbaar bij de lodge",
                  "E-bike verhuur in Assen met bezorging",
                  "MTB-routes direct vanaf de deur",
                  "Fietsherstelkit beschikbaar op verzoek",
                ].map((item, i) => (
                  <li key={i} style={{
                    fontFamily: T.sans, fontSize: 13, color: "rgba(255,255,255,.8)", fontWeight: 300,
                    paddingBottom: 10, marginBottom: 10,
                    borderBottom: i < 4 ? "1px solid rgba(255,255,255,.12)" : "none",
                    display: "flex", gap: 10, alignItems: "baseline",
                  }}>
                    <span style={{ color: T.gold, flexShrink: 0 }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Foto tussenblok ── */}
      <div style={{ position: "relative", height: 320, overflow: "hidden" }}>
        <Image
          src="/wandel_drenthe.jpg"
          alt="Wandelpaden en fietspaden door de Drentse heide rondom Zeijen, Nationaal Park Drentsche Aa"
          fill
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center 60%" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(47,79,62,.45)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" as const, padding: "0 40px" }}>
          <div>
            <p style={{ fontFamily: T.serif, fontSize: "clamp(18px, 3vw, 28px)", color: "white", fontStyle: "italic", fontWeight: 400, margin: "0 0 10px", lineHeight: 1.45 }}>
              "Het mooie aan Drenthe is dat de natuur nog van jou is."
            </p>
            <div style={{ fontFamily: T.sans, fontSize: 12, color: T.gold, letterSpacing: "1px" }}>
              Nationaal Park Drentsche Aa · op 15 min van de lodge
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          WANDELEN
      ══════════════════════════════════════ */}
      <section id="wandelen" style={{ padding: "80px 40px", background: "white" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          <div style={{ textAlign: "center" as const, marginBottom: 56 }}>
            <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.gold, letterSpacing: "2.5px", textTransform: "uppercase" as const, marginBottom: 12 }}>
              Wandelen in Drenthe
            </div>
            <h2 style={{ fontFamily: T.serif, fontSize: "clamp(24px, 4vw, 40px)", color: T.text, margin: "0 0 20px", fontWeight: 700, lineHeight: 1.2 }}>
              Wandelroutes rondom de lodge
            </h2>
            <p style={{ fontFamily: T.sans, fontSize: 16, color: T.muted, fontWeight: 300, maxWidth: 640, margin: "0 auto", lineHeight: 1.75 }}>
              Zeijen is omringd door oude houtwallen, veentjes en strubbenbossen. De Veentjesroute start letterlijk bij de voordeur. Nationaal Park Drentsche Aa ligt op een kwartier lopen — wandelen in Drenthe begint hier.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {wandelroutes.map((route) => (
              <article key={route.naam} style={{ background: T.bg, borderRadius: 14, border: `1px solid ${T.border}`, padding: "28px 24px", boxShadow: "0 2px 12px rgba(47,79,62,.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <span style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 700, color: route.kleur, background: "rgba(47,79,62,.08)", padding: "3px 10px", borderRadius: 6, textTransform: "uppercase" as const, letterSpacing: "0.5px" }}>
                    {route.niveau}
                  </span>
                  <span style={{ fontFamily: T.sans, fontSize: 11, color: T.muted }}>{route.duur}</span>
                </div>
                <h3 style={{ fontFamily: T.serif, fontSize: 18, color: T.text, margin: "0 0 4px", fontWeight: 700, lineHeight: 1.3 }}>
                  {route.naam}
                </h3>
                <div style={{ fontFamily: T.sans, fontSize: 12, color: T.gold, fontWeight: 600, marginBottom: 12 }}>
                  {route.afstand}
                </div>
                <p style={{ fontFamily: T.sans, fontSize: 13, color: T.muted, margin: 0, lineHeight: 1.65, fontWeight: 300 }}>
                  {route.beschrijving}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          MEER ACTIVITEITEN
      ══════════════════════════════════════ */}
      <section style={{ padding: "72px 40px", background: T.bg }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center" as const, marginBottom: 44 }}>
            <h2 style={{ fontFamily: T.serif, fontSize: "clamp(22px, 3vw, 34px)", color: T.text, margin: "0 0 12px", fontWeight: 700 }}>
              Meer te doen in de omgeving
            </h2>
            <p style={{ fontFamily: T.sans, fontSize: 15, color: T.muted, fontWeight: 300, maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
              Drenthe is veel meer dan fiets- en wandelgebied. Cultuur, wellness en natuur liggen allemaal binnen een halfuur rijden.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {[
              {
                titel: "Cultuur & UNESCO",
                kleur: T.green,
                items: ["52 hunebedden in de omgeving", "Drents Museum Assen", "Kamp Westerbork", "Museumdorp Orvelte"],
              },
              {
                titel: "Wellness & Spa",
                kleur: "#7B6B3A",
                items: ["LOFF Boutique Wellness Assen", "Spa Hof van Saksen", "Waterlelie Zevenhuizen", "Eigen sauna & hottub bij de lodge"],
              },
              {
                titel: "Natuur & Park",
                kleur: T.green,
                items: ["Nationaal Park Drentsche Aa", "Dwingelderveld (grootste heide NL)", "UNESCO Geopark Hondsrug", "Drentsche Aa rivierdal"],
              },
              {
                titel: "Daguitstapjes",
                kleur: "#7B6B3A",
                items: ["Assen centrum (20 min)", "Groningen stad (35 min)", "Giethoorn (1 uur)", "Lauwersmeer (45 min)"],
              },
            ].map((cat) => (
              <div key={cat.titel} style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, padding: "24px 20px" }}>
                <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: cat.kleur, textTransform: "uppercase" as const, letterSpacing: ".04em", marginBottom: 14 }}>
                  {cat.titel}
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {cat.items.map((item, j) => (
                    <li key={j} style={{ fontFamily: T.sans, fontSize: 13, color: T.muted, fontWeight: 300, padding: "7px 0", borderBottom: j < cat.items.length - 1 ? `1px solid ${T.border}` : "none", lineHeight: 1.5 }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FAQ
      ══════════════════════════════════════ */}
      <section style={{ padding: "72px 40px", background: T.card }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <div style={{ textAlign: "center" as const, marginBottom: 48 }}>
            <h2 style={{ fontFamily: T.serif, fontSize: "clamp(22px, 3vw, 34px)", color: T.text, margin: "0 0 6px", fontWeight: 700 }}>
              Veelgestelde vragen
            </h2>
            <div style={{ height: 2, width: 40, background: T.gold, margin: "14px auto 0" }} />
          </div>
          <div>
            {faqItems.map((item, i) => (
              <div key={i} style={{ borderTop: `1px solid ${T.border}`, borderBottom: i === faqItems.length - 1 ? `1px solid ${T.border}` : "none", padding: "24px 0" }}>
                <h3 style={{ fontFamily: T.serif, fontSize: 17, fontWeight: 700, color: T.text, margin: "0 0 10px", lineHeight: 1.3 }}>
                  {item.v}
                </h3>
                <p style={{ fontFamily: T.sans, fontSize: 15, color: T.muted, fontWeight: 300, margin: 0, lineHeight: 1.7 }}>
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA
      ══════════════════════════════════════ */}
      <section style={{ background: T.green, padding: "72px 40px", textAlign: "center" as const }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.gold, letterSpacing: "2.5px", textTransform: "uppercase" as const, marginBottom: 16 }}>
            Opening 1 januari 2027
          </div>
          <h2 style={{ fontFamily: T.serif, fontSize: "clamp(22px, 3.5vw, 34px)", color: "white", margin: "0 0 16px", fontWeight: 700 }}>
            Klaar voor een fietsvakantie in Drenthe?
          </h2>
          <p style={{ fontFamily: T.sans, fontSize: 15, color: "rgba(255,255,255,.68)", fontWeight: 300, margin: "0 0 32px", lineHeight: 1.75 }}>
            De lodges openen 1 januari 2027. Schrijf u in voor de nieuwsbrief en ontvang als eerste de openingsaanbieding — inclusief vroegboekkorting.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" as const }}>
            <Link href="/#nieuwsbrief" style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 600, color: T.green, background: T.gold, padding: "14px 28px", borderRadius: 8, textDecoration: "none" }}>
              Nieuwsbrief aanmelden
            </Link>
            <Link href="/faq" style={{ fontFamily: T.sans, fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,.8)", border: "1px solid rgba(255,255,255,.3)", padding: "14px 28px", borderRadius: 8, textDecoration: "none" }}>
              Bekijk de FAQ
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
