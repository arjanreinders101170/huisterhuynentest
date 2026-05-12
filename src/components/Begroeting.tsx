"use client";

import { useState } from "react";
import { T } from "@/data/tokens";
import { SheepSvg } from "./icons";

type Props = {
  naam: string;
  lodgeNaam: string;
  checkIn: string;
  onConfirm: () => void;
};

/* Option B: warm greeting with confirmation step.
 * Shown once when guest opens the app via magic-link (?s=TOKEN).
 * The check-in date is read aloud so guest can spot a wrong booking. */
export function Begroeting({ naam, lodgeNaam, checkIn, onConfirm }: Props) {
  const [confirming, setConfirming] = useState(false);

  const checkInFormatted = new Date(checkIn).toLocaleDateString("nl-NL", {
    weekday: "long", day: "numeric", month: "long",
  });

  const firstName = (naam || "").split(" ")[0] || naam || "";

  const daysUntil = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const arrival = new Date(checkIn);
    arrival.setHours(0, 0, 0, 0);
    const diff = Math.round((arrival.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff <= 0) return null;
    if (diff === 1) return "morgen";
    return `over ${diff} nachtjes`;
  })();

  const confirm = () => {
    setConfirming(true);
    // Brief visual feedback before fading out
    setTimeout(onConfirm, 350);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: `linear-gradient(180deg, ${T.bg} 0%, #DDD5C2 50%, ${T.bg} 100%)`,
      display: "flex", flexDirection: "column", alignItems: "center",
      overflowY: "auto",
      maxWidth: 430, margin: "0 auto",
      opacity: confirming ? 0 : 1,
      transition: "opacity .35s ease",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 4,
        background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)`,
      }} />

      <div style={{
        padding: "0 28px", width: "100%",
        display: "flex", flexDirection: "column", alignItems: "center",
        paddingTop: 64, paddingBottom: 40,
      }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div style={{
            fontFamily: T.serif, fontSize: 22, fontWeight: 600,
            color: "#52502E", letterSpacing: ".03em",
          }}>
            <span style={{ fontSize: 25 }}>H</span>UIS
            <span style={{ fontSize: 14, fontWeight: 400, margin: "0 4px", letterSpacing: ".1em" }}> TER </span>
            <span style={{ fontSize: 25 }}>H</span>UYNEN
          </div>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 8, marginTop: 3,
          }}>
            <div style={{ width: 28, height: 1, background: T.gold }} />
            <span style={{
              fontFamily: T.sans, fontSize: 9, fontWeight: 500,
              color: T.gold, letterSpacing: ".22em", textTransform: "uppercase",
            }}>
              Boutique Lodge
            </span>
            <div style={{ width: 28, height: 1, background: T.gold }} />
          </div>
        </div>

        {/* Sheep */}
        <div style={{
          margin: "36px 0 28px",
          filter: "drop-shadow(0 4px 12px rgba(47,79,62,.15))",
          animation: "fadeUp .5s ease both",
        }}>
          <SheepSvg size={80} />
        </div>

        {/* Greeting */}
        <h1 style={{
          fontFamily: T.serif, fontSize: 30, fontWeight: 700,
          color: T.text, textAlign: "center", lineHeight: 1.2,
          margin: "0 0 12px",
          animation: "fadeUp .5s .05s ease both",
        }}>
          Hoi{firstName ? `, ${firstName}` : ""}
        </h1>
        <p style={{
          fontFamily: T.sans, fontSize: 15, color: T.muted,
          fontWeight: 300, textAlign: "center", lineHeight: 1.6,
          margin: "0 0 28px", maxWidth: 320,
          animation: "fadeUp .5s .1s ease both",
        }}>
          Fijn dat je er bent. Klopt het dat we jullie verwachten?
        </p>

        {/* Stay confirmation card */}
        <div style={{
          width: "100%",
          background: T.card,
          borderRadius: 18,
          border: `1px solid ${T.border}`,
          padding: "22px 22px 24px",
          boxShadow: "0 4px 20px rgba(47,79,62,.06)",
          marginBottom: 24,
          animation: "fadeUp .5s .15s ease both",
        }}>
          <div style={{
            fontFamily: T.sans, fontSize: 10, color: T.gold,
            letterSpacing: ".18em", textTransform: "uppercase", fontWeight: 600,
            textAlign: "center", marginBottom: 12,
          }}>
            Jullie verblijf
          </div>
          <div style={{
            fontFamily: T.serif, fontSize: 22, fontWeight: 600,
            color: T.text, textAlign: "center", lineHeight: 1.3,
            marginBottom: 6,
          }}>
            {lodgeNaam}
          </div>
          <div style={{
            fontFamily: T.sans, fontSize: 14, color: T.muted,
            fontWeight: 300, textAlign: "center", lineHeight: 1.5,
          }}>
            Aankomst {checkInFormatted}
            {daysUntil && (
              <>
                <br />
                <span style={{ color: T.green, fontWeight: 500 }}>{daysUntil}</span>
              </>
            )}
          </div>
        </div>

        {/* Confirm button */}
        <button
          onClick={confirm}
          disabled={confirming}
          style={{
            width: "100%",
            padding: 16,
            borderRadius: 16,
            border: "none",
            background: `linear-gradient(135deg, ${T.green}, ${T.green2})`,
            color: "#fff",
            fontFamily: T.serif, fontSize: 16, fontWeight: 600,
            cursor: confirming ? "wait" : "pointer",
            boxShadow: "0 8px 24px rgba(47,79,62,.2)",
            animation: "fadeUp .5s .2s ease both",
          }}
        >
          Ja, dat klopt
        </button>

        <a
          href="tel:+31642568603"
          style={{
            marginTop: 20,
            fontFamily: T.sans, fontSize: 13, color: T.muted,
            fontWeight: 300, textDecoration: "none",
            padding: "8px 16px",
            animation: "fadeUp .5s .25s ease both",
          }}
        >
          Klopt iets niet? <span style={{ color: T.green, fontWeight: 500 }}>Bel of WhatsApp ons</span>
        </a>

        <div style={{
          width: 40, height: 1, background: T.gold,
          opacity: 0.4, marginTop: 28,
          animation: "fadeUp .5s .3s ease both",
        }} />
      </div>
    </div>
  );
}
