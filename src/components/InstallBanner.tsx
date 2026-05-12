"use client";
import { useState, useEffect } from "react";
import { T } from "@/data/tokens";

/*
 * PWA Install Banner
 * 
 * Shows a subtle, lodge-branded suggestion to install the app.
 * - Only shows in browser (not when already installed as PWA)
 * - Only shows once (dismissed = localStorage flag)
 * - Detects iOS vs Android for correct instructions
 * - Appears after 5 seconds (not on immediate load)
 */

type Props = {
  delayMs?: number;
};

export function InstallBanner({ delayMs = 5000 }: Props = {}) {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Don't show if already running as PWA
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    // @ts-expect-error — Safari-specific
    if (window.navigator.standalone) return;

    // Don't show if already dismissed
    try {
      if (localStorage.getItem("hth-install-dismissed")) return;
    } catch { return; }

    // Detect iOS
    const ua = navigator.userAgent;
    const ios = /iPhone|iPad|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(ios);

    const timer = setTimeout(() => setShow(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  const dismiss = () => {
    setShow(false);
    try { localStorage.setItem("hth-install-dismissed", "1"); } catch {}
  };

  if (!show) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 72,
      left: "50%",
      transform: "translateX(-50%)",
      width: "100%",
      maxWidth: 430,
      zIndex: 90,
      padding: "0 12px",
      boxSizing: "border-box",
      animation: "fadeUp .4s ease both",
    }}>
      <div style={{
        background: T.card,
        borderRadius: 14,
        border: `1px solid ${T.border}`,
        boxShadow: "0 -2px 20px rgba(42,36,24,.1)",
        padding: "14px 16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Icon */}
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: `linear-gradient(135deg, ${T.green}, ${T.green2})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 17 }}>🐑</span>
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: T.serif, fontSize: 14, fontWeight: 600,
              color: T.text,
            }}>
              Zet op je beginscherm
            </div>
            <div style={{
              fontFamily: T.sans, fontSize: 11, color: T.muted,
              fontWeight: 300, lineHeight: 1.4,
            }}>
              {isIOS
                ? <>Tik <span style={{ fontWeight: 500 }}>delen</span> (▢↑) → <span style={{ fontWeight: 500 }}>Zet op beginscherm</span></>
                : "Open als app voor de beste ervaring"
              }
            </div>
          </div>

          {/* Dismiss */}
          <button onClick={dismiss} style={{
            background: "none", border: "none",
            color: T.muted, cursor: "pointer",
            fontSize: 18, padding: "0 0 0 4px",
            lineHeight: 1, flexShrink: 0,
          }}>
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
