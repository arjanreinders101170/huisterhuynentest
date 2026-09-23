"use client";
import { useEffect, useRef, useState } from "react";
import {
  readConsent,
  writeConsent,
  applyConsentToDataLayer,
  DEFAULT_CONSENT,
} from "@/lib/tracking/consent";
import type { ConsentCategory, ConsentState } from "@/lib/tracking/types";

type Lang = "nl" | "de";

const COPY = {
  nl: {
    title: "Cookies & privacy",
    body: "Wij gebruiken cookies voor een optimale websitebeleving, bezoekersstatistieken en gepersonaliseerde advertenties. U kiest zelf welke cookies u toestaat.",
    /* Op een telefoon nam de volledige zin het halve scherm in beslag. Daar
     * staat de korte versie; het hele verhaal blijft achter "Voorkeuren
     * aanpassen" en het privacybeleid. */
    bodyShort: "Wij gebruiken cookies voor statistieken en advertenties. U kiest zelf.",
    acceptAll: "Alles accepteren",
    necessaryOnly: "Alleen noodzakelijke",
    /* Korte labels voor een telefoon, zodat beide knoppen naast elkaar passen. */
    acceptShort: "Accepteren",
    necessaryShort: "Alleen nodig",
    customize: "Voorkeuren aanpassen",
    save: "Voorkeuren opslaan",
    back: "Terug",
    layer2Intro: "Vink de categorieën aan die u wilt toestaan. Noodzakelijke cookies kunnen niet worden uitgeschakeld.",
    privacyLink: "Privacybeleid",
    cats: {
      functional: { label: "Noodzakelijk", desc: "Nodig voor boeking, login en beveiliging. Altijd actief." },
      statistics: { label: "Bezoekersstatistieken", desc: "Anonieme metingen om de site te verbeteren." },
      marketing: { label: "Gepersonaliseerde advertenties", desc: "Meta Pixel & Google Ads voor relevante advertenties en retargeting." },
    } as Record<ConsentCategory, { label: string; desc: string }>,
  },
  de: {
    title: "Cookies & Datenschutz",
    body: "Wir verwenden Cookies für ein optimales Website-Erlebnis, Besucherstatistiken und personalisierte Werbung. Sie entscheiden, welche Cookies Sie zulassen.",
    bodyShort: "Wir verwenden Cookies für Statistiken und Werbung. Sie entscheiden.",
    acceptAll: "Alle akzeptieren",
    necessaryOnly: "Nur notwendige",
    acceptShort: "Akzeptieren",
    necessaryShort: "Nur notwendige",
    customize: "Einstellungen anpassen",
    save: "Einstellungen speichern",
    back: "Zurück",
    layer2Intro: "Aktivieren Sie die Kategorien, die Sie zulassen möchten. Notwendige Cookies können nicht deaktiviert werden.",
    privacyLink: "Datenschutz",
    cats: {
      functional: { label: "Notwendig", desc: "Erforderlich für Buchung, Login und Sicherheit. Immer aktiv." },
      statistics: { label: "Besucherstatistiken", desc: "Anonyme Messungen zur Verbesserung der Website." },
      marketing: { label: "Personalisierte Werbung", desc: "Meta Pixel & Google Ads für relevante Werbung und Retargeting." },
    } as Record<ConsentCategory, { label: string; desc: string }>,
  },
} as const;

const PALETTE = {
  dark: "#2A2418",
  surface: "#FDFBF6",
  gold: "#B49A5E",
  border: "#E0D8C8",
  text: "#2A2418",
  muted: "#5A534C",
  shadow: "0 12px 40px rgba(0,0,0,.28)",
};

const FONT = "var(--font-dm-sans), system-ui, -apple-system, sans-serif";

export function ConsentBanner() {
  const [open, setOpen] = useState(false);
  const [layer2, setLayer2] = useState(false);
  const [state, setState] = useState<ConsentState>(DEFAULT_CONSENT);
  const [lang, setLang] = useState<Lang>("nl");
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const current = readConsent();
    setState(current.state);
    setOpen(!current.decided);
    setLang((navigator.language || "nl").toLowerCase().startsWith("de") ? "de" : "nl");

    /* Returning visitors: replay the stored consent so GTM picks it up on
     * this page load. Without this, default-deny stays active and tags
     * requiring ad_storage never fire after the first session. */
    if (current.decided) applyConsentToDataLayer(current.state);

    const reopen = () => {
      const c = readConsent();
      setState(c.state);
      setLayer2(true);
      setOpen(true);
    };
    window.addEventListener("hth:open-consent", reopen);
    return () => window.removeEventListener("hth:open-consent", reopen);
  }, []);

  /* De balk staat vast onderaan het scherm en zou dus over de onderste regels
   * van de pagina heen vallen — op een landingspagina precies over de feiten-
   * balk. Zolang de balk staat, reserveert de body er onderaan net zoveel
   * ruimte voor als de balk hoog is, zodat er niets achter verdwijnt. De hoogte
   * wisselt met de schermbreedte (tekst en knoppen breken af), vandaar de
   * ResizeObserver in plaats van een vast getal. */
  useEffect(() => {
    const el = barRef.current;
    if (!open || layer2 || !el) return;
    const sync = () => {
      document.body.style.paddingBottom = `${el.offsetHeight}px`;
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
      document.body.style.paddingBottom = "";
    };
  }, [open, layer2]);

  /* Zolang de keuze open staat, houdt globals.css de boekingsbalk op een
   * telefoon verborgen: dan staat er onderaan maar één balk tegelijk. */
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.setAttribute("data-consent-open", "");
    return () => root.removeAttribute("data-consent-open");
  }, [open]);

  /* Escape sluit alleen de voorkeurenlaag; de keuze zelf blijft staan. */
  useEffect(() => {
    if (!layer2) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLayer2(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [layer2]);

  if (!open) return null;
  const t = COPY[lang];

  const acceptAll = () => {
    const s: ConsentState = { functional: true, statistics: true, marketing: true };
    setState(s);
    writeConsent(s);
    setOpen(false);
    setLayer2(false);
  };
  const necessaryOnly = () => {
    const s: ConsentState = { functional: true, statistics: false, marketing: false };
    setState(s);
    writeConsent(s);
    setOpen(false);
    setLayer2(false);
  };
  const save = () => {
    writeConsent({ ...state, functional: true });
    setOpen(false);
    setLayer2(false);
  };

  const toggle = (cat: ConsentCategory) => {
    if (cat === "functional") return;
    setState(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  /* Voorkeuren zijn een bewuste tweede stap: die mag wél een dialoog met
   * schermvulling zijn. De eerste indruk niet — dat is de smalle balk. */
  if (layer2) {
    return (
      <div
        className="hth-consent-overlay"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9500,
          background: "rgba(20,18,16,.55)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="hth-consent-title"
          style={{
            width: "100%",
            maxWidth: 520,
            maxHeight: "85vh",
            overflowY: "auto",
            background: PALETTE.dark,
            borderRadius: 14,
            padding: "20px 22px",
            boxShadow: PALETTE.shadow,
            fontFamily: FONT,
            color: "white",
          }}
        >
          <h2
            id="hth-consent-title"
            style={{
              margin: "0 0 10px",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: 16,
              fontWeight: 700,
              color: "white",
            }}
          >
            {t.title}
          </h2>
          <Layer2
            intro={t.layer2Intro}
            cats={t.cats}
            state={state}
            toggle={toggle}
            save={save}
            back={() => setLayer2(false)}
            labels={{ save: t.save, back: t.back }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={barRef}
      className="hth-consent-bar"
      role="region"
      aria-label={t.title}
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        zIndex: 9500,
        background: PALETTE.dark,
        borderTop: `1px solid ${PALETTE.gold}55`,
        boxShadow: "0 -8px 28px rgba(0,0,0,.22)",
        fontFamily: FONT,
        color: "white",
      }}
    >
      <div className="hth-consent-bar-inner">
        <p className="hth-consent-text">
          <strong style={{ color: "white", fontWeight: 600 }}>{t.title}</strong>
          {" — "}
          <span className="hth-consent-long">{t.body}</span>
          <span className="hth-consent-short">{t.bodyShort}</span>{" "}
          <a
            href={lang === "de" ? "/datenschutz" : "/privacy"}
            style={{ color: PALETTE.gold, textDecoration: "underline", textUnderlineOffset: 3 }}
          >
            {t.privacyLink}
          </a>
          {/* Op een telefoon scheelt een derde knoppenregel bijna 45px; daar
           * staat "Voorkeuren aanpassen" als link achter de tekst. Boven de
           * 600px blijft het de knop rechts in de balk — de CSS laat er
           * precies één van de twee zien, scheidingsteken inbegrepen. */}
          <span className="hth-consent-prefs-inline">
            {" · "}
            <button
              type="button"
              onClick={() => setLayer2(true)}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                font: "inherit",
                color: PALETTE.gold,
                textDecoration: "underline",
                textUnderlineOffset: 3,
                cursor: "pointer",
              }}
            >
              {t.customize}
            </button>
          </span>
        </p>
        <div className="hth-consent-actions">
          <ConsentButton onClick={acceptAll} variant="primary">
            <span className="hth-consent-long">{t.acceptAll}</span>
            <span className="hth-consent-short">{t.acceptShort}</span>
          </ConsentButton>
          <ConsentButton onClick={necessaryOnly} variant="secondary">
            <span className="hth-consent-long">{t.necessaryOnly}</span>
            <span className="hth-consent-short">{t.necessaryShort}</span>
          </ConsentButton>
          <ConsentButton onClick={() => setLayer2(true)} variant="tertiary" className="hth-consent-prefs-btn">
            {t.customize}
          </ConsentButton>
        </div>
      </div>
    </div>
  );
}

function Layer2({
  intro,
  cats,
  state,
  toggle,
  save,
  back,
  labels,
}: {
  intro: string;
  cats: Record<ConsentCategory, { label: string; desc: string }>;
  state: ConsentState;
  toggle: (cat: ConsentCategory) => void;
  save: () => void;
  back: () => void;
  labels: { save: string; back: string };
}) {
  const order: ConsentCategory[] = ["functional", "statistics", "marketing"];
  return (
    <>
      <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,.78)", lineHeight: 1.55, marginBottom: 14 }}>
        {intro}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
        {order.map(cat => {
          const locked = cat === "functional";
          const checked = state[cat];
          return (
            <label
              key={cat}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                padding: "10px 12px",
                background: "rgba(255,255,255,.05)",
                borderRadius: 8,
                cursor: locked ? "default" : "pointer",
                opacity: locked ? 0.85 : 1,
              }}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={locked}
                onChange={() => toggle(cat)}
                style={{ marginTop: 3, accentColor: PALETTE.gold }}
              />
              <span style={{ flex: 1 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "white",
                  }}
                >
                  {cats[cat].label}
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: 12,
                    color: "rgba(255,255,255,.65)",
                    marginTop: 2,
                    lineHeight: 1.5,
                  }}
                >
                  {cats[cat].desc}
                </span>
              </span>
            </label>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <ConsentButton onClick={save} variant="primary">
          {labels.save}
        </ConsentButton>
        <ConsentButton onClick={back} variant="tertiary">
          {labels.back}
        </ConsentButton>
      </div>
    </>
  );
}

function ConsentButton({
  children,
  onClick,
  variant,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant: "primary" | "secondary" | "tertiary";
  className?: string;
}) {
  const base: React.CSSProperties = {
    padding: "9px 14px",
    borderRadius: 8,
    border: "none",
    fontSize: 12.5,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "transform .1s ease",
  };
  if (variant === "primary") {
    return (
      <button className={className} onClick={onClick} style={{ ...base, background: PALETTE.gold, color: PALETTE.dark }}>
        {children}
      </button>
    );
  }
  if (variant === "secondary") {
    return (
      <button
        className={className}
        onClick={onClick}
        style={{
          ...base,
          background: "transparent",
          color: "white",
          border: "1px solid rgba(255,255,255,.35)",
        }}
      >
        {children}
      </button>
    );
  }
  return (
    <button
      className={className}
      onClick={onClick}
      style={{
        ...base,
        background: "transparent",
        color: "rgba(255,255,255,.85)",
        textDecoration: "underline",
        textUnderlineOffset: 3,
        padding: "9px 6px",
        fontWeight: 500,
      }}
    >
      {children}
    </button>
  );
}
