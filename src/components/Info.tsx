"use client";
import { useState, useEffect } from "react";
import { T, cardStyle, type Route } from "@/data/tokens";
import { IcHeart, IcCheck } from "./icons";
import { useLanguage } from "@/i18n";
import type { GoogleReview, GoogleReviewsData } from "@/lib/google-reviews";

type Review = {
  id: string;
  naam: string;
  sterren: number;
  tekst: string;
  datum: string;
};

function GoogleBadge() {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 20,
      background: "rgba(66,133,244,.08)", border: "1px solid rgba(66,133,244,.2)",
    }}>
      <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      <span style={{ fontFamily: T.sans, fontSize: 10, color: "#4285F4", fontWeight: 500 }}>Google</span>
    </div>
  );
}

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
  const { t, lang } = useLanguage();
  /* ═══ REVIEWS STATE ═══ */
  const [reviews, setReviews] = useState<Review[]>([]);
  const [googleData, setGoogleData] = useState<GoogleReviewsData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [naam, setNaam] = useState("");
  const [sterren, setSterren] = useState(0);
  const [tekst, setTekst] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  // Fetch internal reviews + Google reviews on mount
  useEffect(() => {
    fetch("/api/reviews")
      .then(r => r.json())
      .then(d => setReviews(d.reviews || []))
      .catch(() => {});

    fetch("/api/google-reviews")
      .then(r => r.json())
      .then((d: GoogleReviewsData) => {
        if (d.reviews?.length > 0 || d.rating > 0) setGoogleData(d);
      })
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
        <h1 style={{ fontFamily: T.serif, fontSize: 28, fontWeight: 700, color: T.text, margin: "0 0 6px" }}>{t.info.title}</h1>
        <p style={{ fontFamily: T.sans, fontSize: 14, color: T.muted, fontWeight: 300, margin: 0 }}>{t.info.subtitle}</p>
      </div>

      {/* Contact */}
      <h2 style={{ fontFamily: T.serif, fontSize: 18, fontWeight: 600, color: T.text, margin: "28px 0 14px" }}>{t.info.contact}</h2>
      {[
        { l: t.info.address, v: "Zuiderstraat 6, Zeijen" },
        { l: t.info.phone,   v: "+31 6 42568603" },
        { l: t.info.email,   v: "info@huisterhuynen.nl" },
      ].map((x, i) => (
        <div key={i} style={{ padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontFamily: T.sans, fontSize: 11, color: T.muted, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 2 }}>{x.l}</div>
          <div style={{ fontFamily: T.sans, fontSize: 14, color: T.text }}>{x.v}</div>
        </div>
      ))}

      {/* Tijden */}
      <h2 style={{ fontFamily: T.serif, fontSize: 18, fontWeight: 600, color: T.text, margin: "28px 0 14px" }}>{t.info.times}</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[{ l: t.info.checkIn, v: "15:00" }, { l: t.info.checkOut, v: "11:00" }].map((x, i) => (
          <div key={i} style={{ ...cardStyle, padding: "14px 16px", textAlign: "center" }}>
            <div style={{ fontFamily: T.sans, fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: ".06em" }}>{x.l}</div>
            <div style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 600, color: T.green, marginTop: 4 }}>{x.v}</div>
          </div>
        ))}
      </div>

      {/* Huisregels */}
      <h2 style={{ fontFamily: T.serif, fontSize: 18, fontWeight: 600, color: T.text, margin: "28px 0 14px" }}>{t.info.houseRules}</h2>
      <div style={{ ...cardStyle, padding: "16px 18px" }}>
        {t.info.houseRulesList.map((r, i) => (
          <div key={i} style={{
            fontFamily: T.sans, fontSize: 13, color: T.text, fontWeight: 300,
            padding: "8px 0", display: "flex", alignItems: "center", gap: 8,
            borderBottom: i < t.info.houseRulesList.length - 1 ? `1px solid ${T.border}` : "none",
          }}>
            <span style={{ color: T.green, fontSize: 10 }}>●</span> {r}
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════
          GOOGLE REVIEWS
          ═══════════════════════════════════ */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "28px 0 14px" }}>
        <h2 style={{ fontFamily: T.serif, fontSize: 18, fontWeight: 600, color: T.text, margin: 0 }}>
          {lang === "de" ? "Gästebewertungen" : "Gastreviews"}
        </h2>
        {googleData && googleData.rating > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: T.gold, fontSize: 16 }}>★</span>
            <span style={{ fontFamily: T.serif, fontSize: 16, fontWeight: 600, color: T.text }}>
              {googleData.rating.toFixed(1)}
            </span>
            <span style={{ fontFamily: T.sans, fontSize: 11, color: T.muted }}>
              ({googleData.total})
            </span>
          </div>
        )}
      </div>

      {/* Google reviews */}
      {googleData && googleData.reviews.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
          {googleData.reviews.map((rev: GoogleReview, i: number) => (
            <div key={i} style={{ ...cardStyle, padding: "16px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {rev.profile_photo_url ? (
                    <img
                      src={rev.profile_photo_url}
                      alt={rev.author_name}
                      width={28}
                      height={28}
                      style={{ borderRadius: "50%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: "rgba(66,133,244,.12)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: T.sans, fontSize: 13, fontWeight: 600, color: "#4285F4",
                    }}>
                      {rev.author_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div style={{ fontFamily: T.serif, fontSize: 14, fontWeight: 600, color: T.text, lineHeight: 1.2 }}>
                      {rev.author_name}
                    </div>
                    <GoogleBadge />
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: T.gold, fontSize: 13, letterSpacing: 1 }}>
                    {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                  </div>
                  <div style={{ fontFamily: T.sans, fontSize: 10, color: T.muted, fontWeight: 300, marginTop: 2 }}>
                    {rev.relative_time_description}
                  </div>
                </div>
              </div>
              {rev.text && (
                <p style={{
                  fontFamily: T.sans, fontSize: 13, color: T.muted,
                  fontWeight: 300, lineHeight: 1.6, margin: 0,
                  fontStyle: "italic",
                }}>
                  &ldquo;{rev.text}&rdquo;
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CTA: write Google review */}
      {googleData?.reviewUrl && (
        <a
          href={googleData.reviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            width: "100%", padding: "13px 20px", borderRadius: 14, border: `1px solid rgba(66,133,244,.3)`,
            background: "rgba(66,133,244,.05)", color: "#4285F4",
            fontFamily: T.sans, fontSize: 14, fontWeight: 500,
            textDecoration: "none", marginBottom: 28,
            boxSizing: "border-box",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {lang === "de" ? "Bewertung auf Google schreiben" : "Schrijf een Google review"}
        </a>
      )}

      {/* ═══════════════════════════════════
          INTERNE REVIEWS
          ═══════════════════════════════════ */}
      {reviews.length > 0 && (
        <>
          <h3 style={{ fontFamily: T.serif, fontSize: 15, fontWeight: 600, color: T.text, margin: "0 0 12px" }}>
            {lang === "de" ? "Direkte Erfahrungen" : "Directe ervaringen"}
          </h3>
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
        </>
      )}

      {/* Review form or CTA */}
      {submitted ? (
        <div style={{
          ...cardStyle, padding: "24px 20px", textAlign: "center",
          animation: "fadeUp .4s ease both",
        }}>
          <div style={{ color: T.green, marginBottom: 12 }}><IcCheck /></div>
          <div style={{ fontFamily: T.serif, fontSize: 18, fontWeight: 600, color: T.text, marginBottom: 6 }}>
            {t.info.thankYou}
          </div>
          <p style={{ fontFamily: T.sans, fontSize: 13, color: T.muted, fontWeight: 300, margin: 0 }}>
            {t.info.thankYouSub}
          </p>
        </div>
      ) : !showForm ? (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: T.serif, fontSize: 17, fontWeight: 600, color: T.text, marginBottom: 4 }}>
            {t.info.howWasYourStay}
          </div>
          <div style={{ fontFamily: T.sans, fontSize: 13, color: T.muted, fontWeight: 300, marginBottom: 14 }}>
            {t.info.weWantToHear}
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
            <IcHeart /> {t.info.leaveReview}
          </button>
        </div>
      ) : (
        <div style={{ ...cardStyle, padding: "22px 20px", animation: "fadeUp .3s ease both" }}>
          <div style={{ fontFamily: T.serif, fontSize: 17, fontWeight: 600, color: T.text, marginBottom: 16 }}>
            {t.info.shareExperience}
          </div>

          {/* Stars */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: T.sans, fontSize: 12, color: T.muted, marginBottom: 6, fontWeight: 300 }}>
              {t.info.rating}
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
              {t.info.name}
            </div>
            <input
              value={naam}
              onChange={e => setNaam(e.target.value)}
              placeholder={t.info.namePlaceholder}
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
              {t.info.experience}
            </div>
            <textarea
              value={tekst}
              onChange={e => setTekst(e.target.value)}
              placeholder={t.info.experiencePlaceholder}
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
            {sending ? t.info.submitting : t.info.submit}
          </button>

          <button
            onClick={() => setShowForm(false)}
            style={{
              width: "100%", marginTop: 8, background: "none", border: "none",
              fontFamily: T.sans, fontSize: 12, color: T.muted,
              fontWeight: 300, cursor: "pointer", padding: 8,
            }}
          >
            {t.info.cancel}
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
          {t.info.comeBack}
        </div>
        <p style={{ fontFamily: T.sans, fontSize: 13, color: "rgba(255,255,255,.7)", fontWeight: 300, lineHeight: 1.5, margin: "0 0 16px" }}>
          {t.info.comeBackSub}
        </p>
        <button
          onClick={() => onNavigate("terugkomen")}
          style={{
            padding: "12px 28px", borderRadius: 12, border: "none",
            background: "#fff", color: T.green,
            fontFamily: T.sans, fontSize: 14, fontWeight: 500, cursor: "pointer",
          }}
        >
          {t.info.checkAvailability}
        </button>
      </div>
    </div>
  );
}
