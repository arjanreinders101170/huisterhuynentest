"use client";
import { useState, useEffect } from "react";

const STORAGE_KEY = "hth-cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed", bottom: 80, left: 12, right: 12, zIndex: 9000,
      background: "#2A2418", borderRadius: 14, padding: "14px 18px",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      boxShadow: "0 8px 32px rgba(0,0,0,.25)",
      fontFamily: "system-ui, -apple-system, sans-serif",
      maxWidth: 430, margin: "0 auto",
    }}>
      <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,.75)", lineHeight: 1.5, flex: 1 }}>
        We gebruiken alleen functionele cookies voor een veilige sessie. Geen tracking.
      </p>
      <button
        onClick={accept}
        style={{
          flexShrink: 0, padding: "8px 16px", borderRadius: 8, border: "none",
          background: "#B49A5E", color: "#2A2418", fontSize: 12, fontWeight: 600,
          cursor: "pointer", whiteSpace: "nowrap",
        }}
      >
        Begrepen
      </button>
    </div>
  );
}
