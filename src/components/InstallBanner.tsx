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

export function InstallBanner() {
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

    // Show after 5 seconds
    const timer = setTimeout(() => setShow(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setShow(false);
    try { localStorage.setItem("hth-install-dismissed", "1"); } catch {}
  };

  if (!show) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 80, left: "50%", transform: "translateX(-50%)",
      width: "calc(100% - 40px)", maxWidth: 390,
      zIndex: 90,
      animation: "fadeUp .4s ease both",
    }}>
      <div style={{
        background: T.card,
        borderRadius: 16,
        border: `1px solid ${T.border}`,
        boxShadow: "0 8px 32px rgba(42,36,24,.15)",
        padding: "18px 20px",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          {/* Icon */}
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: `linear-gradient(135deg, ${T.green}, ${T.green2})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 20 }}>🐑</span>
          </div>

          {/* Text */}
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: T.serif, fontSize: 15, fontWeight: 600,
              color: T.text, marginBottom: 3,
            }}>
              Zet op je beginscherm
            </div>
            <div style={{
              fontFamily: T.sans, fontSize: 12, color: T.muted,
              fontWeight: 300, lineHeight: 1.5,
            }}>
              {isIOS
                ? <>Tik op <span style={{ fontWeight: 500 }}>delen</span> (▢↑) en dan <span style={{ fontWeight: 500 }}>&quot;Zet op beginscherm&quot;</span></>
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
