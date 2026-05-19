"use client";
/* Sticky pill language switcher — visible top-right on both homepages.
 * Plain <a> link so navigation respects hreflang and SEO crawling.
 * Mirrors the visual style used on the concierge app header. */

type Lang = "nl" | "de";

export function LanguageSwitcher({ currentLang }: { currentLang: Lang }) {
  const target = currentLang === "nl" ? "/de" : "/";
  const label = currentLang === "nl" ? "DE" : "NL";
  const aria = currentLang === "nl" ? "Auf Deutsch wechseln" : "Naar Nederlands wisselen";

  return (
    <a
      href={target}
      hrefLang={currentLang === "nl" ? "de" : "nl"}
      aria-label={aria}
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 9400,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "rgba(42, 36, 24, 0.85)",
        color: "#FDFBF6",
        border: "1px solid rgba(180, 154, 94, 0.45)",
        borderRadius: 999,
        padding: "7px 14px",
        fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        textDecoration: "none",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
      }}
    >
      <span aria-hidden style={{ opacity: 0.55 }}>
        {currentLang === "nl" ? "NL" : "DE"}
      </span>
      <span aria-hidden style={{ opacity: 0.4, fontWeight: 300 }}>·</span>
      <span>{label}</span>
    </a>
  );
}
