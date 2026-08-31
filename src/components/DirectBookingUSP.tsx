import type { CSSProperties } from "react";

/* ═══ Direct-boeken USP ═══
 * "Geen commissie. Beste prijs. Persoonlijk bevestigd."
 *
 * Staat bij elke boekings-CTA. Het verschil met een boekingssite is het
 * sterkste argument om hier te boeken, dus die belofte hoort op het moment
 * van klikken zichtbaar te zijn — niet ergens verderop de pagina.
 */

const COPY = {
  nl: ["Geen commissie", "Beste prijs", "Persoonlijk bevestigd"],
  de: ["Keine Provision", "Bestpreis", "Persönlich bestätigt"],
};

const LABEL = {
  nl: "Voordelen van direct boeken",
  de: "Vorteile der Direktbuchung",
};

const TONES = {
  onDark: { text: "rgba(255,255,255,.78)", mark: "#B49A5E" },
  onLight: { text: "#5A534C", mark: "#B49A5E" },
  onGold: { text: "rgba(26,46,36,.72)", mark: "#1A2E24" },
};

export function DirectBookingUSP({
  locale = "nl",
  tone = "onLight",
  align = "center",
  size = 12,
  style,
}: {
  locale?: "nl" | "de";
  tone?: keyof typeof TONES;
  align?: "center" | "left";
  size?: number;
  style?: CSSProperties;
}) {
  const c = TONES[tone];
  return (
    <ul
      aria-label={LABEL[locale]}
      style={{
        display: "flex",
        flexWrap: "wrap",
        /* Als flex-item in een kolom krijgt de lijst zijn max-content
         * breedte en breekt hij dus nooit af. Op een telefoon stak hij
         * daardoor buiten het scherm. */
        maxWidth: "100%",
        gap: "6px 16px",
        justifyContent: align === "center" ? "center" : "flex-start",
        listStyle: "none",
        margin: 0,
        padding: 0,
        ...style,
      }}
    >
      {COPY[locale].map((item) => (
        <li
          key={item}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
            fontSize: size,
            fontWeight: 500,
            color: c.text,
            letterSpacing: "0.3px",
            lineHeight: 1.5,
          }}
        >
          <span aria-hidden style={{ color: c.mark, fontSize: size + 1, lineHeight: 1 }}>
            ✓
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}
