/* ═══ Betaalmethodenbalk ═══
 *
 * De logo's van de methodes die via Mollie openstaan. Niet louter sier: een
 * bezoeker die rechtstreeks bij een particulier boekt in plaats van via een
 * bekend platform, vraagt zich op precies dat moment af of het veilig is. Een
 * rij herkenbare merken beantwoordt die vraag zonder een zin tekst.
 *
 * De logo's staan als losse bestanden in /public/betaal en worden met <img>
 * geladen, niet inline. De SVG's van Mollie bevatten eigen id's voor clip- en
 * maskpaden (clip0_203_1411 en dergelijke); inline naast elkaar in één
 * document botsen die op elkaar en verdwijnt er willekeurig een logo. Als
 * los document heeft elk bestand zijn eigen id-ruimte.
 */

const METHODES = [
  { bestand: "ideal-wero", naam: "iDEAL" },
  { bestand: "visa", naam: "Visa" },
  { bestand: "mastercard", naam: "Mastercard" },
  { bestand: "paypal", naam: "PayPal" },
  { bestand: "wero", naam: "Wero" },
  { bestand: "bank", naam: "Bankoverschrijving" },
  { bestand: "mollie", naam: "Mollie" },
] as const;

const T = {
  card: "#FDFBF6",
  text: "#2A2418",
  muted: "#5A534C",
  border: "#E0D8C8",
  sans: "var(--font-dm-sans), system-ui, sans-serif",
};

export type BetaalVariant = "kaart" | "kaal" | "voettekst";

export function Betaalmethoden({
  variant = "kaart",
  titel = "Veilig betalen",
  tekst = "Uw betaling loopt via Mollie. Wij zien of bewaren uw kaartgegevens niet.",
  locale = "nl",
}: {
  variant?: BetaalVariant;
  titel?: string;
  tekst?: string;
  locale?: "nl" | "de";
}) {
  const klein = variant === "voettekst";
  const hoogte = klein ? 26 : 32;

  const logos = (
    <ul
      style={{
        display: "flex", flexWrap: "wrap", alignItems: "center",
        gap: klein ? 8 : 10, listStyle: "none", margin: 0, padding: 0,
      }}
    >
      {METHODES.map((m) => (
        <li key={m.bestand} style={{ display: "flex" }}>
          {/* Geen next/image: dit zijn vaste, piepkleine SVG's. De optimizer
              zou er alleen een extra request van maken zonder één byte te
              besparen. width/height staan er hard op tegen layout shift. */}
          <img
            src={`/betaal/${m.bestand}.svg`}
            alt={m.naam}
            width={Math.round((hoogte / 48) * 64)}
            height={hoogte}
            loading="lazy"
            decoding="async"
            style={{ display: "block", borderRadius: 6 }}
          />
        </li>
      ))}
    </ul>
  );

  if (variant === "kaal") return logos;

  if (variant === "voettekst") {
    return (
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ fontFamily: T.sans, fontSize: 13, color: T.muted, fontWeight: 400 }}>
          {locale === "de" ? "Sicher bezahlen über Mollie" : "Veilig betalen via Mollie"}
        </div>
        {logos}
      </div>
    );
  }

  return (
    <div
      style={{
        border: `1px solid ${T.border}`, borderRadius: 12, background: "white",
        padding: "20px 22px", display: "grid", gap: 14,
      }}
    >
      <div>
        <div style={{ fontFamily: T.sans, fontSize: 14.5, fontWeight: 600, color: T.text, marginBottom: 6 }}>
          {titel}
        </div>
        <p style={{ fontFamily: T.sans, fontSize: 14.5, color: T.muted, fontWeight: 300, lineHeight: 1.6, margin: 0 }}>
          {tekst}
        </p>
      </div>
      {logos}
    </div>
  );
}
