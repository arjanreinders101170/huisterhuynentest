"use client";
import { useEffect, useState } from "react";
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
    acceptAll: "Alles accepteren",
    necessaryOnly: "Alleen noodzakelijke",
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
    acceptAll: "Alle akzeptieren",
    necessaryOnly: "Nur notwendige",
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

export function ConsentBanner() {
  const [open, setOpen] = useState(false);
  const [layer2, setLayer2] = useState(false);
  const [state, setState] = useState<ConsentState>(DEFAULT_CONSENT);
  const [lang, setLang] = useState<Lang>("nl");

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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="hth-consent-title"
      style={{
        position: "fixed",
        bottom: 16,
        left: 12,
        right: 12,
        zIndex: 9500,
        background: PALETTE.dark,
        borderRadius: 14,
        padding: layer2 ? "20px 22px" : "18px 22px",
        boxShadow: PALETTE.shadow,
        fontFamily: "system-ui, -apple-system, sans-serif",
        maxWidth: 520,
        margin: "0 auto",
        color: "white",
      }}
    >
      {!layer2 ? (
        <Layer1
          title={t.title}
          body={t.body}
          acceptAll={acceptAll}
          necessaryOnly={necessaryOnly}
          customize={() => setLayer2(true)}
          labels={{ acceptAll: t.acceptAll, necessaryOnly: t.necessaryOnly, customize: t.customize }}
          lang={lang}
        />
      ) : (
        <Layer2
          intro={t.layer2Intro}
          cats={t.cats}
          state={state}
          toggle={toggle}
          save={save}
          back={() => setLayer2(false)}
          labels={{ save: t.save, back: t.back }}
        />
      )}
    </div>
  );
}

function Layer1({
  title,
  body,
  acceptAll,
  necessaryOnly,
  customize,
  labels,
  lang,
}: {
  title: string;
  body: string;
  acceptAll: () => void;
  necessaryOnly: () => void;
  customize: () => void;
  labels: { acceptAll: string; necessaryOnly: string; customize: string };
  lang: Lang;
}) {
  return (
    <>
      <h2
        id="hth-consent-title"
        style={{
          margin: 0,
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 16,
          fontWeight: 700,
          color: "white",
          marginBottom: 8,
        }}
      >
        {title}
      </h2>
      <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,.78)", lineHeight: 1.55 }}>
        {body}{" "}
        <a
          href={lang === "de" ? "/datenschutz" : "/privacy"}
          style={{ color: PALETTE.gold, textDecoration: "underline", textUnderlineOffset: 3 }}
        >
          {lang === "de" ? "Datenschutz" : "Privacybeleid"}
        </a>
      </p>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginTop: 14,
        }}
      >
        <ConsentButton onClick={acceptAll} variant="primary">
          {labels.acceptAll}
        </ConsentButton>
        <ConsentButton onClick={necessaryOnly} variant="secondary">
          {labels.necessaryOnly}
        </ConsentButton>
        <ConsentButton onClick={customize} variant="tertiary">
          {labels.customize}
        </ConsentButton>
      </div>
    </>
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
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant: "primary" | "secondary" | "tertiary";
}) {
  const base: React.CSSProperties = {
    padding: "10px 16px",
    borderRadius: 8,
    border: "none",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "transform .1s ease",
  };
  if (variant === "primary") {
    return (
      <button onClick={onClick} style={{ ...base, background: PALETTE.gold, color: PALETTE.dark }}>
        {children}
      </button>
    );
  }
  if (variant === "secondary") {
    return (
      <button
        onClick={onClick}
        style={{
          ...base,
          background: PALETTE.surface,
          color: PALETTE.dark,
          border: `1px solid ${PALETTE.border}`,
        }}
      >
        {children}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      style={{
        ...base,
        background: "transparent",
        color: "rgba(255,255,255,.85)",
        textDecoration: "underline",
        textUnderlineOffset: 3,
        padding: "10px 8px",
        fontWeight: 500,
      }}
    >
      {children}
    </button>
  );
}
