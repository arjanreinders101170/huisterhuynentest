"use client";
import { useState, useEffect } from "react";
import { T, cardStyle, type Route } from "@/data/tokens";
import { IcHeart, IcCheck } from "./icons";

type Review = {
  id: string;
  naam: string;
  sterren: number;
  tekst: string;
  datum: string;
};

function StarRow({ count, onSelect }: { count: number; onSelect?: (n: number) => void }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span
          key={n}
          onClick={() => onSelect?.(n)}
          style={{
            cursor: onSelect ? "pointer" : "default",
            fontSize: 20,
            transition: "transform .1s",
          }}
        >
          {n <= count ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
}

export function Info({ onNavigate }: { onNavigate: (r: Route) => void }) {
  /* ═══ REVIEWS STATE ═══ */
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [naam, setNaam] = useState("");
  const [sterren, setSterren] = useState(0);
  const [tekst, setTekst] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  // Fetch reviews on mount
  useEffect(() => {
    fetch("/api/reviews")
      .then(r => r.json())
      .then(d => setReviews(d.reviews || []))
      .catch(() => {});
  }, []);

  const submitReview = async () => {
    if (!naam.trim() || !tekst.trim() || sterren === 0 || sending) return;
    setSending(true);
    try {
      const r = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ naam: naam.trim(), sterren, tekst: tekst.trim() }),
      });
      if (r.ok) {
        setSubmitted(true);
        // Refresh reviews
        const d = await fetch("/api/reviews").then(r => r.json());
        setReviews(d.reviews || []);
      }
    } catch {}
    setSending(false);
  };

  return (
    <div style={{ padding: "0 20px 110px" }}>
      <div style={{ paddingTop: 28 }}>
        <h1 style={{ fontFamily: T.serif, fontSize: 28, fontWeight: 700, color: T.text, margin: "0 0 6px" }}>Huis ter Huynen</h1>
        <p style={{ fontFamily: T.sans, fontSize: 14, color: T.muted, fontWeight: 300, margin: 0 }}>Boutique Lodge · Zeijen, Drenthe</p>
      </div>

      {/* Contact */}
      <h2 style={{ fontFamily: T.serif, fontSize: 18, fontWeight: 600, color: T.text, margin: "28px 0 14px" }}>Contact</h2>
      {[
        { l: "Adres", v: "Zuiderstraat 6, Zeijen" },
        { l: "Telefoon", v: "+31 6 42568603" },
        { l: "E-mail", v: "info@huisterhuynen.nl" },
      ].map((x, i) => (
        <div key={i} style={{ padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontFamily: T.sans, fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 2 }}>{x.l}</div>
          <div style={{ fontFamily: T.sans, fontSize: 14, color: T.text }}>{x.v}</div>
        </div>
      ))}

      {/* Tijden */}
      <h2 style={{ fontFamily: T.serif, fontSize: 18, fontWeight: 600, color: T.text, margin: "28px 0 14px" }}>Tijden</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[{ l: "Check-in", t: "15:00" }, { l: "Check-out", t: "11:00" }].map((x, i) => (
          <div key={i} style={{ ...cardStyle, padding: "14px 16px", textAlign: "center" }}>
            <div style={{ fontFamily: T.sans, fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: ".06em" }}>{x.l}</div>
            <div style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 600, color: T.green, marginTop: 4 }}>{x.t}</div>
          </div>
        ))}
      </div>

      {/* Huisregels */}
      <h2 style={{ fontFamily: T.serif, fontSize: 18, fontWeight: 600, color: T.text, margin: "28px 0 14px" }}>Huisregels</h2>
      <div style={{ ...cardStyle, padding: "16px 18px" }}>
        {["Niet roken in de lodge", "Huisdieren welkom (overleg vooraf)", "Rust na 22:00", "Afval gescheiden"].map((r, i) => (
          <div key={i} style={{
            fontFamily: T.sans, fontSize: 13, color: T.text, fontWeight: 300,
            padding: "8px 0", display: "flex", alignItems: "center", gap: 8,
            borderBottom: i < 3 ? `1px solid ${T.border}` : "none",
          }}>
            <span style={{ color: T.green, fontSize: 10 }}>●</span> {r}
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════
          REVIEWS
          ═══════════════════════════════════ */}
      <h2 style={{ fontFamily: T.serif, fontSize: 18, fontWeight: 600, color: T.text, margin: "28px 0 14px" }}>
        Wat gasten zeggen
      </h2>

      {/* Existing reviews — last 5 */}
      {reviews.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          {reviews.map(rev => (
            <div key={rev.id} style={{ ...cardStyle, padding: "16px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontFamily: T.serif, fontSize: 15, fontWeight: 600, color: T.text, marginBottom: 2 }}>
                    {rev.naam}
                  </div>
                  <div style={{ color: T.gold, fontSize: 14, letterSpacing: 1 }}>
                    {"★".repeat(rev.sterren)}{"☆".repeat(5 - rev.sterren)}
                  </div>
                </div>
                <div style={{ fontFamily: T.sans, fontSize: 11, color: T.muted, fontWeight: 300 }}>
                  {rev.datum}
                </div>
              </div>
              <p style={{
                fontFamily: T.sans, fontSize: 13, color: T.muted,
                fontWeight: 300, lineHeight: 1.6, margin: 0,
                fontStyle: "italic",
              }}>
                &ldquo;{rev.tekst}&rdquo;
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Review form or CTA */}
      {submitted ? (
        <div style={{
          ...cardStyle, padding: "24px 20px", textAlign: "center",
          animation: "fadeUp .4s ease both",
        }}>
          <div style={{ color: T.green, marginBottom: 12 }}><IcCheck /></div>
          <div style={{ fontFamily: T.serif, fontSize: 18, fontWeight: 600, color: T.text, marginBottom: 6 }}>
            Bedankt voor je review!
          </div>
          <p style={{ fontFamily: T.sans, fontSize: 13, color: T.muted, fontWeight: 300, margin: 0 }}>
            Je review is geplaatst. We waarderen het enorm.
          </p>
        </div>
      ) : !showForm ? (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: T.serif, fontSize: 17, fontWeight: 600, color: T.text, marginBottom: 4 }}>
            Hoe was je verblijf?
          </div>
          <div style={{ fontFamily: T.sans, fontSize: 13, color: T.muted, fontWeight: 300, marginBottom: 14 }}>
            We horen het graag
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: "12px 28px", borderRadius: 12, border: "none",
              background: T.green, color: "#fff", fontFamily: T.sans,
              fontSize: 14, fontWeight: 500, cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 6,
            }}
          >
            <IcHeart /> Review achterlaten
          </button>
        </div>
      ) : (
        <div style={{ ...cardStyle, padding: "22px 20px", animation: "fadeUp .3s ease both" }}>
          <div style={{ fontFamily: T.serif, fontSize: 17, fontWeight: 600, color: T.text, marginBottom: 16 }}>
            Deel je ervaring
          </div>

          {/* Stars */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: T.sans, fontSize: 12, color: T.muted, marginBottom: 6, fontWeight: 300 }}>
              Beoordeling
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setSterren(n)}
                  style={{
                    width: 40, height: 40, borderRadius: 10,
                    border: n <= sterren ? "none" : `1px solid ${T.border}`,
                    background: n <= sterren ? T.green : T.card,
                    color: n <= sterren ? "#fff" : T.muted,
                    fontSize: 16, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all .15s ease",
                  }}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: T.sans, fontSize: 12, color: T.muted, marginBottom: 6, fontWeight: 300 }}>
              Naam
            </div>
            <input
              value={naam}
              onChange={e => setNaam(e.target.value)}
              placeholder="Bijv. Martijn & Lisa"
              maxLength={50}
              style={{
                width: "100%", padding: "11px 14px", borderRadius: 12,
                border: `1px solid ${T.border}`, background: T.card,
                fontFamily: T.sans, fontSize: 14, color: T.text,
                fontWeight: 300, outline: "none",
              }}
            />
          </div>

          {/* Text */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontFamily: T.sans, fontSize: 12, color: T.muted, marginBottom: 6, fontWeight: 300 }}>
              Je ervaring
            </div>
            <textarea
              value={tekst}
              onChange={e => setTekst(e.target.value)}
              placeholder="Wat vond je het leukst?"
              maxLength={500}
              rows={3}
              style={{
                width: "100%", padding: "11px 14px", borderRadius: 12,
                border: `1px solid ${T.border}`, background: T.card,
                fontFamily: T.sans, fontSize: 14, color: T.text,
                fontWeight: 300, outline: "none", resize: "none",
                lineHeight: 1.5,
              }}
            />
          </div>

          {/* Submit */}
          <button
            onClick={submitReview}
            disabled={!naam.trim() || !tekst.trim() || sterren === 0 || sending}
            style={{
              width: "100%", padding: 14, borderRadius: 14, border: "none",
              background: (!naam.trim() || !tekst.trim() || sterren === 0) ? T.border : T.green,
              color: "#fff", fontFamily: T.sans, fontSize: 15, fontWeight: 500,
              cursor: (!naam.trim() || !tekst.trim() || sterren === 0) ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "background .15s ease",
            }}
          >
            {sending ? "Versturen..." : "Plaats review"}
          </button>

          <button
            onClick={() => setShowForm(false)}
            style={{
              width: "100%", marginTop: 8, background: "none", border: "none",
              fontFamily: T.sans, fontSize: 12, color: T.muted,
              fontWeight: 300, cursor: "pointer", padding: 8,
            }}
          >
            Annuleren
          </button>
        </div>
      )}

      {/* Terugkomen CTA */}
      <div style={{
        marginTop: 32, padding: "24px 20px", borderRadius: 16,
        background: `linear-gradient(135deg, ${T.green} 0%, ${T.green2} 100%)`,
        textAlign: "center",
        boxShadow: "0 8px 32px rgba(47,79,62,.2)",
      }}>
        <div style={{ fontFamily: T.serif, fontSize: 20, fontWeight: 600, color: "#fff", marginBottom: 6 }}>
          Kom nog eens terug
        </div>
        <p style={{ fontFamily: T.sans, fontSize: 13, color: "rgba(255,255,255,.7)", fontWeight: 300, lineHeight: 1.5, margin: "0 0 16px" }}>
          Ontvang een persoonlijk aanbod met beste prijs garantie
        </p>
        <button
          onClick={() => onNavigate("terugkomen")}
          style={{
            padding: "12px 28px", borderRadius: 12, border: "none",
            background: "#fff", color: T.green,
            fontFamily: T.sans, fontSize: 14, fontWeight: 500, cursor: "pointer",
          }}
        >
          Bekijk beschikbaarheid
        </button>
      </div>
    </div>
  );
}
