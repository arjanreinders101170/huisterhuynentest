"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { NewsletterForm } from "@/components/NewsletterForm";
const BookingCalendar = dynamic(() => import("@/components/BookingCalendar"), { ssr: false, loading: () => <div style={{ textAlign: "center", padding: 48, color: "#8A7D6A", fontFamily: "var(--font-dm-sans), system-ui, sans-serif", fontSize: 14 }}>Agenda laden...</div> });

interface GoogleReview {
  author: string;
  rating: number;
  text: string;
  time: number;
}

const FALLBACK_REVIEWS = [
  {
    text: "Een onvergetelijk weekend in De Heide. De hottub onder de sterren, het geluid van de vogels — pure magie.",
    author: "Sarah & Mark",
    rating: 5,
  },
  {
    text: "De Eik is het mooiste wat ik het afgelopen jaar heb gezien. Warm, authentiek, en hartelijk ontvangen.",
    author: "Petra",
    rating: 5,
  },
  {
    text: "Perfect voor een EV-roadtrip. Laadpaal ter plekke en het uitzicht over de heide is fenomenaal.",
    author: "Jan",
    rating: 5,
  },
];

const T = {
  bg: "#EAE3D2",
  card: "#FDFBF6",
  green: "#2F4F3E",
  green2: "#3A6350",
  text: "#2A2418",
  muted: "#5A534C",
  gold: "#B49A5E",
  border: "#E0D8C8",
  serif: "Georgia, 'Times New Roman', serif",
  sans: "var(--font-dm-sans), system-ui, sans-serif",
};

/* ─── micro helpers ─── */
function GoldRule() {
  return <div style={{ height: 2, width: 48, background: T.gold, margin: "14px auto 0" }} />;
}

function Eyebrow({ children }: { children: string }) {
  return (
    <div style={{
      fontFamily: T.sans, fontSize: 11, fontWeight: 600,
      color: T.green, letterSpacing: "2.5px", textTransform: "uppercase",
      marginBottom: 12,
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 style={{
      fontFamily: T.serif, fontSize: "clamp(28px, 4vw, 40px)",
      color: T.text, margin: "0 0 6px", fontWeight: 700, lineHeight: 1.15,
    }}>
      {children}
    </h2>
  );
}

function SectionHeader({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 52 }}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <SectionTitle>{title}</SectionTitle>
      <GoldRule />
      {sub && (
        <p style={{
          fontFamily: T.sans, fontSize: 16, color: T.muted,
          fontWeight: 300, margin: "20px auto 0", maxWidth: 560, lineHeight: 1.7,
        }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function BookingSection() {
  return (
    <section id="reserveren" style={{
      background: "white",
      padding: "80px 40px",
      borderTop: `3px solid ${T.green}`,
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.green, letterSpacing: "2.5px", textTransform: "uppercase", marginBottom: 12 }}>
            Reserveren
          </div>
          <h2 style={{ fontFamily: T.serif, fontSize: "clamp(28px, 4vw, 40px)", color: T.text, margin: "0 0 6px", fontWeight: 700, lineHeight: 1.15 }}>
            Boek uw verblijf
          </h2>
          <div style={{ height: 2, width: 48, background: T.gold, margin: "14px auto 0" }} />
          <p style={{ fontFamily: T.sans, fontSize: 16, color: T.muted, fontWeight: 300, margin: "20px auto 0", maxWidth: 560, lineHeight: 1.7 }}>
            Kies uw reisdata en stuur een aanvraag. Wij bevestigen binnen 24 uur persoonlijk.
          </p>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            fontFamily: T.sans, fontSize: 12, fontWeight: 500,
            color: T.green, letterSpacing: "0.4px",
            background: "rgba(47,79,62,.07)", padding: "6px 14px",
            borderRadius: 999, marginTop: 16,
          }}>
            <span style={{
              display: "inline-block", width: 6, height: 6, borderRadius: "50%",
              background: T.gold,
            }} />
            Vroege boekers krijgen voorrang op de zomerweekenden 2027
          </div>
        </div>
        <BookingCalendar />
      </div>
    </section>
  );
}

export default function LandingPage() {
  const [googleReviews, setGoogleReviews] = useState<GoogleReview[]>([]);
  const [googleRating, setGoogleRating] = useState<number | null>(null);
  const [googleCount, setGoogleCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/google-reviews")
      .then(r => r.json())
      .then(data => {
        if (data.reviews?.length) {
          setGoogleReviews(data.reviews);
          setGoogleRating(data.totalRating ?? null);
          setGoogleCount(data.totalCount ?? null);
        }
      })
      .catch(() => {});
  }, []);

  const displayReviews = googleReviews.length > 0
    ? googleReviews.map(r => ({ text: r.text, author: r.author, rating: r.rating }))
    : FALLBACK_REVIEWS;

  return (
    <main style={{ background: T.bg, fontFamily: T.sans, color: T.text }}>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section style={{
        minHeight: 680,
        background: `linear-gradient(160deg, #2F4F3E 0%, #3A5C45 40%, #6B5B3A 100%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        textAlign: "center", color: "white", position: "relative", overflow: "hidden",
      }}>
        {/* lodge photo */}
        <Image
          src="/lodge-heide.jpg"
          alt="Boutique Lodge De Heide van Huis ter Huynen, omgeven door Drentse heide en bos in Zeijen"
          fill
          priority
          quality={45}
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center 40%", opacity: 0.52 }}
        />
        {/* gradient scrim */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(47,79,62,.30) 0%, rgba(47,79,62,.52) 100%)",
        }} />

        <div style={{ position: "relative", zIndex: 2, maxWidth: 640, padding: "60px 32px" }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{
              fontFamily: T.serif, fontSize: 13, fontWeight: 700,
              color: T.gold, letterSpacing: "4px", textTransform: "uppercase", marginBottom: 10,
            }}>
              Boutique Lodge · Zeijen · Drenthe
            </div>
            <h1 style={{
              fontFamily: T.serif, fontSize: "clamp(38px, 6vw, 64px)",
              fontWeight: 700, margin: "0 0 6px", lineHeight: 1.05, color: "white",
            }}>
              Huis ter Huynen
            </h1>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 8 }}>
              <span style={{ display: "block", width: 32, height: 1, background: T.gold, opacity: 0.8 }} />
              <span style={{ fontFamily: T.sans, fontSize: 12, color: T.gold, letterSpacing: "2px", textTransform: "uppercase" }}>Natuur · Privacy · Luxe</span>
              <span style={{ display: "block", width: 32, height: 1, background: T.gold, opacity: 0.8 }} />
            </div>
          </div>

          <p style={{
            fontFamily: T.sans, fontSize: 17, fontWeight: 300,
            lineHeight: 1.7, marginBottom: 36, color: "rgba(255,255,255,.88)",
          }}>
            Twee unieke boutique lodges midden in het hart van Drenthe.
            Wandel vanuit de deur door eeuwenoude strubbenbossen,
            geniet van de heide en keer terug naar uw privé-hottub.
          </p>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <a href="#reserveren" style={{
              padding: "17px 52px",
              background: T.gold,
              color: "#1A2E24",
              border: "none",
              borderRadius: 12,
              fontSize: 16, fontWeight: 700, cursor: "pointer",
              textDecoration: "none", display: "inline-flex",
              alignItems: "center", gap: 10,
              letterSpacing: "0.3px",
              boxShadow: "0 6px 28px rgba(180,154,94,.55)",
            }}>
              Bekijk beschikbare data
              <span aria-hidden style={{ fontSize: 18, lineHeight: 1 }}>→</span>
            </a>

            {/* Scarcity badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontFamily: T.sans, fontSize: 12, fontWeight: 500,
              color: T.gold, letterSpacing: "0.4px",
            }}>
              <span style={{
                display: "inline-block", width: 6, height: 6, borderRadius: "50%",
                background: T.gold, boxShadow: `0 0 0 4px rgba(180,154,94,.18)`,
              }} />
              Slechts 2 lodges · vroege boekers krijgen voorrang op favoriete data
            </div>

            {/* Secondary text link */}
            <a href="#omgeving" style={{
              fontFamily: T.sans, fontSize: 13, fontWeight: 400,
              color: "rgba(255,255,255,.7)",
              textDecoration: "underline", textUnderlineOffset: 4,
              textDecorationColor: "rgba(255,255,255,.35)",
            }}>
              of ontdek eerst de omgeving
            </a>
          </div>
          <p style={{
            fontFamily: T.sans, fontSize: 11, fontWeight: 300,
            color: "rgba(255,255,255,.42)", marginTop: 24, letterSpacing: "0.3px",
          }}>
            Opening 1 januari 2027 · al boekbaar
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STATS STRIP
      ══════════════════════════════════════════ */}
      <section style={{ background: T.green, padding: "28px 40px" }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 0, textAlign: "center",
        }}>
          {[
            { n: "0 min", label: "Wandelen vanuit de deur" },
            { n: "15 min", label: "Nationaal Park Drentsche Aa" },
            { n: "52", label: "Hunebedden in Drenthe" },
            { n: "1.000+", label: "km fietsroutes rondom" },
          ].map((s, i, arr) => (
            <div key={i} style={{
              padding: "14px 20px",
              borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,.12)" : "none",
            }}>
              <div style={{
                fontFamily: T.serif, fontSize: 28, fontWeight: 700,
                color: T.gold, lineHeight: 1, marginBottom: 6,
              }}>
                {s.n}
              </div>
              <div style={{
                fontFamily: T.sans, fontSize: 12, color: "rgba(255,255,255,.65)",
                fontWeight: 300, lineHeight: 1.4,
              }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          USPs
      ══════════════════════════════════════════ */}
      <section style={{ background: T.card, padding: "80px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SectionHeader
            eyebrow="Waarom Huis ter Huynen"
            title="Alles voor een onvergetelijk verblijf"
            sub="Van privé-hottub tot laadfaciliteiten voor uw EV — wij denken aan alles, zodat u aan niets hoeft te denken."
          />
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "40px 32px",
          }}>
            {[
              { icon: "◈", label: "Privé Hottub", desc: "Genieten onder de sterren, op elk moment van de dag." },
              { icon: "◈", label: "Natuur pur sang", desc: "Heide, bos, hunebedden en beekdalen — direct om de hoek." },
              { icon: "◈", label: "EV Laadpaal", desc: "Duurzaam reizen? We hebben een snellader op het terrein." },
              { icon: "◈", label: "Volledige privacy", desc: "Alleen ú en uw gezelschap — geen omringende buren." },
              { icon: "◈", label: "Uniek design", desc: "De Heide én De Eik — elk met eigen karakter en sfeer." },
              { icon: "◈", label: "Persoonlijk contact", desc: "Direct bereikbaar bij de eigenaar, voor en tijdens uw verblijf." },
            ].map((usp, i) => (
              <div key={i} style={{ borderTop: `2px solid ${T.gold}`, paddingTop: 20 }}>
                <div style={{
                  fontFamily: T.serif, fontSize: 16, fontWeight: 700,
                  color: T.green, marginBottom: 8,
                }}>
                  {usp.label}
                </div>
                <p style={{
                  fontFamily: T.sans, fontSize: 14, color: T.muted,
                  fontWeight: 300, margin: 0, lineHeight: 1.65,
                }}>
                  {usp.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          LODGES
      ══════════════════════════════════════════ */}
      <section style={{ background: "white", padding: "80px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SectionHeader
            eyebrow="Onze accommodaties"
            title="Kies uw lodge"
            sub="Beide lodges zijn volledig privé, voorzien van een hottub en ontworpen voor maximaal comfort in de natuur."
          />
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 32,
          }}>
            {[
              {
                id: "lodge_1",
                name: "De Heide",
                tag: "4 personen",
                desc: "Een luxe lodge op de Drentse heide, ingericht voor vier. Panoramisch uitzicht over het bos, eigen sauna en privé-hottub op het terras.",
                features: ["4 personen", "Privé-hottub", "Sauna", "Hei uitzicht"],
                img: "/lodge-heide.jpg",
                alt: "Buitenaanzicht van Lodge De Heide met privé-hottub op het terras en uitzicht over de Drentse heide",
              },
              {
                id: "lodge_2",
                name: "De Eik",
                tag: "4 personen",
                desc: "Een ruime lodge onder de eiken, omgebouwd tot sfeervol verblijf voor vier. Hoge plafonds, authentieke uitstraling en een volledige keuken.",
                features: ["4 personen", "Privé-hottub", "Volledige keuken", "Buitenkeuken & BBQ"],
                img: "/lodge-eik.jpg",
                alt: "Buitenaanzicht van Lodge De Eik onder eikenbomen met buitenkeuken en BBQ",
              },
            ].map((lodge) => (
              <div key={lodge.id} style={{
                borderRadius: 16, overflow: "hidden",
                background: T.card, border: `1px solid ${T.border}`,
                boxShadow: "0 4px 24px rgba(47,79,62,.07)",
              }}>
                <div style={{ height: 270, position: "relative" }}>
                  <Image
                    src={lodge.img}
                    alt={lodge.alt}
                    fill
                    quality={65}
                    sizes="(max-width: 800px) 100vw, 50vw"
                    style={{ objectFit: "cover", objectPosition: "center 40%" }}
                  />
                  <div style={{
                    position: "absolute", top: 16, left: 16,
                    background: T.gold, color: "#1A2E24",
                    fontFamily: T.sans, fontSize: 11, fontWeight: 700,
                    letterSpacing: "1.5px", textTransform: "uppercase",
                    padding: "5px 12px", borderRadius: 6,
                    zIndex: 1,
                  }}>
                    {lodge.tag}
                  </div>
                </div>
                <div style={{ padding: 28 }}>
                  <h3 style={{
                    fontFamily: T.serif, fontSize: 22, color: T.green,
                    margin: "0 0 10px", fontWeight: 700,
                  }}>
                    {lodge.name}
                  </h3>
                  <p style={{
                    fontFamily: T.sans, fontSize: 14, color: T.muted,
                    margin: "0 0 20px", lineHeight: 1.7, fontWeight: 300,
                  }}>
                    {lodge.desc}
                  </p>
                  <div style={{
                    display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24,
                  }}>
                    {lodge.features.map((f, i) => (
                      <span key={i} style={{
                        fontFamily: T.sans, fontSize: 12, color: T.green,
                        background: "rgba(47,79,62,.08)", padding: "4px 12px",
                        borderRadius: 20, fontWeight: 500,
                      }}>
                        {f}
                      </span>
                    ))}
                  </div>
                  <button style={{
                    width: "100%", padding: "13px",
                    background: T.green, color: "white",
                    border: "none", borderRadius: 10,
                    fontSize: 14, fontWeight: 600, cursor: "pointer",
                    letterSpacing: "0.3px",
                  }}>
                    Bekijk {lodge.name}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STER CITAAT — direct na lodges
      ══════════════════════════════════════════ */}
      <section style={{
        background: `linear-gradient(180deg, ${T.green} 0%, ${T.green2} 100%)`,
        padding: "72px 40px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          maxWidth: 820, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 2,
        }}>
          <div style={{
            fontFamily: T.sans, fontSize: 14, color: T.gold,
            letterSpacing: "3px", marginBottom: 18,
          }}>
            ★ ★ ★ ★ ★
          </div>
          <p style={{
            fontFamily: T.serif, fontSize: "clamp(22px, 3vw, 30px)",
            color: "white", lineHeight: 1.45, fontWeight: 400,
            fontStyle: "italic", margin: "0 0 22px",
          }}>
            &ldquo;De hottub onder de sterren, het geluid van de vogels in de strubben — dit is geen weekendje weg, dit is een reset.&rdquo;
          </p>
          <div style={{ height: 1, width: 40, background: T.gold, margin: "0 auto 18px", opacity: 0.7 }} />
          <div style={{
            fontFamily: T.sans, fontSize: 13, fontWeight: 600,
            color: T.gold, letterSpacing: "1.5px", textTransform: "uppercase",
          }}>
            Sarah &amp; Mark · gasten van De Heide
          </div>
          <div style={{ marginTop: 28 }}>
            <a href="#reserveren" style={{
              fontFamily: T.sans, fontSize: 13, fontWeight: 600,
              color: "white", textDecoration: "underline", textUnderlineOffset: 5,
              textDecorationColor: "rgba(180,154,94,.7)",
              letterSpacing: "0.3px",
            }}>
              Reserveer uw eigen weekend →
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          OMGEVING — natuur & wat te doen
      ══════════════════════════════════════════ */}
      <section id="omgeving" style={{ background: T.bg, padding: "80px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SectionHeader
            eyebrow="Zeijen · Drenthe"
            title="De natuur om uw deur"
            sub="Zeijen is een van de mooiste brinkdorpen van Drenthe. Wandelroutes starten direct bij de lodge. Nationaal Park, UNESCO Geopark en 52 hunebedden liggen op steenworp afstand."
          />

          {/* Vanuit de lodge — 3 wandelingen */}
          <div style={{ marginBottom: 56 }}>
            <div style={{
              fontFamily: T.sans, fontSize: 11, fontWeight: 600,
              color: T.green, letterSpacing: "2px", textTransform: "uppercase",
              marginBottom: 20,
            }}>
              Direct vanuit de lodge te belopen
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 20,
            }}>
              {[
                {
                  naam: "Veentjesroute Zeijen",
                  lengte: "7,5 km · ± 2 uur",
                  afstand: "0 min — start bij de lodge",
                  niveau: "Makkelijk",
                  desc: "De mooiste route vanuit de lodge. Langs houtwallen, veentjes en Drentse gedichten door het Zeijerwiek.",
                  kleur: T.green,
                },
                {
                  naam: "Zeijerstrubben",
                  lengte: "Vrij te verkennen · 1–2 uur",
                  afstand: "3 min rijden",
                  niveau: "Makkelijk",
                  desc: "Oud strubbenbos met kronkelende eiken. Mysterieus, stil en perfect voor een vroege ochtend.",
                  kleur: T.green,
                },
                {
                  naam: "Ballooërveld",
                  lengte: "9 km · ± 2,5 uur",
                  afstand: "12 min rijden",
                  niveau: "Gemiddeld",
                  desc: "367 hectare heideveld met schaapskudde. Spectaculair in augustus als de heide paars kleurt.",
                  kleur: "#7B6B3A",
                },
              ].map((w, i) => (
                <div key={i} style={{
                  background: T.card, borderRadius: 14,
                  border: `1px solid ${T.border}`,
                  padding: 24,
                  boxShadow: "0 2px 12px rgba(47,79,62,.05)",
                }}>
                  <div style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "flex-start", marginBottom: 12,
                  }}>
                    <span style={{
                      fontFamily: T.sans, fontSize: 11, fontWeight: 600,
                      color: w.kleur, background: "rgba(47,79,62,.07)",
                      padding: "3px 10px", borderRadius: 6, letterSpacing: "0.5px",
                    }}>
                      {w.niveau}
                    </span>
                    <span style={{
                      fontFamily: T.sans, fontSize: 11, color: T.muted,
                      fontWeight: 400,
                    }}>
                      {w.afstand}
                    </span>
                  </div>
                  <h3 style={{
                    fontFamily: T.serif, fontSize: 17, color: T.text,
                    margin: "0 0 4px", fontWeight: 700,
                  }}>
                    {w.naam}
                  </h3>
                  <div style={{
                    fontFamily: T.sans, fontSize: 12, color: T.muted,
                    fontWeight: 500, marginBottom: 10,
                  }}>
                    {w.lengte}
                  </div>
                  <p style={{
                    fontFamily: T.sans, fontSize: 13, color: T.muted,
                    margin: 0, lineHeight: 1.65, fontWeight: 300,
                  }}>
                    {w.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Natuur highlights — 2 kolommen */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 20,
            marginBottom: 56,
          }}>
            <div style={{
              background: T.green, borderRadius: 14, padding: "32px 28px", color: "white",
            }}>
              <div style={{
                fontFamily: T.sans, fontSize: 11, fontWeight: 600,
                color: "white", letterSpacing: "2px", textTransform: "uppercase",
                marginBottom: 14,
              }}>
                Op 15 min rijden
              </div>
              <h3 style={{
                fontFamily: T.serif, fontSize: 20, fontWeight: 700,
                margin: "0 0 10px", color: "white",
              }}>
                Nationaal Park Drentsche Aa
              </h3>
              <p style={{
                fontFamily: T.sans, fontSize: 14, color: "rgba(255,255,255,.75)",
                fontWeight: 300, margin: "0 0 20px", lineHeight: 1.7,
              }}>
                Kronkelende beken, heidevelden en houtwallen. Het Boswachterspad langs het Oudemolense Diep is een aanrader — vlonderpaden en goede kans op de ijsvogel.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["Beekdal", "Boswachterspad", "IJsvogel"].map((t, i) => (
                  <span key={i} style={{
                    fontFamily: T.sans, fontSize: 11, color: "rgba(255,255,255,.8)",
                    border: "1px solid rgba(255,255,255,.2)", padding: "3px 10px", borderRadius: 6,
                  }}>{t}</span>
                ))}
              </div>
            </div>

            <div style={{
              background: T.card, borderRadius: 14, padding: "32px 28px",
              border: `1px solid ${T.border}`,
            }}>
              <div style={{
                fontFamily: T.sans, fontSize: 11, fontWeight: 600,
                color: T.green, letterSpacing: "2px", textTransform: "uppercase",
                marginBottom: 14,
              }}>
                Op 25 min rijden
              </div>
              <h3 style={{
                fontFamily: T.serif, fontSize: 20, fontWeight: 700,
                margin: "0 0 10px", color: T.text,
              }}>
                Nationaal Park Dwingelderveld
              </h3>
              <p style={{
                fontFamily: T.sans, fontSize: 14, color: T.muted,
                fontWeight: 300, margin: "0 0 20px", lineHeight: 1.7,
              }}>
                Het grootste natte heidegebied van West-Europa. Twee schaapskuddes, meer dan 40 vennen en een indrukwekkende nachtwandelroute. Met bezoekerscentrum.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["Nationaal Park", "Schaapskudde", "Nachtwandeling"].map((t, i) => (
                  <span key={i} style={{
                    fontFamily: T.sans, fontSize: 11, color: T.green,
                    background: "rgba(47,79,62,.08)", padding: "3px 10px", borderRadius: 6,
                  }}>{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Seizoenen strip */}
          <div style={{
            background: "rgba(180,154,94,.1)", borderRadius: 14,
            border: `1px solid rgba(180,154,94,.25)`, padding: "28px 32px",
          }}>
            <div style={{
              fontFamily: T.sans, fontSize: 11, fontWeight: 600,
              color: T.green, letterSpacing: "2px", textTransform: "uppercase",
              marginBottom: 20,
            }}>
              Elk seizoen zijn eigen magie
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              gap: "20px 32px",
            }}>
              {[
                { seizoen: "Lente · Apr – Jun", highlight: "Bloeiende stuifzanden, jonge dieren in de wei en stilte in het bos." },
                { seizoen: "Zomer · Jul – Sep", highlight: "Heide paars gekleurd in aug–sep. Schaapskuddes op de velden." },
                { seizoen: "Herfst · Okt – Nov", highlight: "Kraanvogels trekken over. Herfstkleuren in de Zeijerstrubben." },
                { seizoen: "Winter · Dec – Mar", highlight: "Stille bossen, bevroren vennen, de hottub op zijn allermooist." },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{
                    fontFamily: T.sans, fontSize: 12, fontWeight: 700,
                    color: T.green, marginBottom: 6,
                  }}>
                    {s.seizoen}
                  </div>
                  <p style={{
                    fontFamily: T.sans, fontSize: 13, color: T.muted,
                    margin: 0, lineHeight: 1.6, fontWeight: 300,
                  }}>
                    {s.highlight}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          WAT TE DOEN — 4 categorieën
      ══════════════════════════════════════════ */}
      <section style={{ background: "white", padding: "80px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SectionHeader
            eyebrow="Activiteiten in de omgeving"
            title="Wat er allemaal te doen is"
            sub="Drenthe is véél meer dan wandelen. Fietsen door de knooppuntenroutes, cultuur snuiven bij de hunebedden of ontspannen in een van de wellnesscentra — het past allemaal binnen een halfuur."
          />
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 24,
          }}>
            {[
              {
                cat: "Wandelen & Natuur",
                icon: "🌿",
                hoogtepunt: "Veentjesroute Zeijen",
                items: ["Direct vanuit de lodge", "13+ routes in de omgeving", "Nationaal Park op 15 min"],
                img: "/wandel_drenthe.jpg",
                alt: "Wandelpad door het Drentse heidelandschap met paarse heide in bloei",
                accent: T.green,
              },
              {
                cat: "Fietsen",
                icon: "🚴",
                hoogtepunt: "1.000+ km knooppuntennet",
                items: ["E-bikes te huur in Assen", "Levering op locatie mogelijk", "MTB-routes beschikbaar"],
                img: "/rent_a_bike.jpg",
                alt: "Fietsen klaar voor verhuur langs een Drents fietspad in het bos",
                accent: "#7B6B3A",
              },
              {
                cat: "Cultuur & UNESCO",
                icon: "🗿",
                hoogtepunt: "52 hunebedden · Drents Museum",
                items: ["Hunebed Highway (N34)", "Kamp Westerbork", "Museumdorp Orvelte"],
                img: "/museum_drenthe.jpg",
                alt: "Hunebed in Drenthe, prehistorisch grafmonument in een groen landschap",
                accent: T.green,
              },
              {
                cat: "Wellness",
                icon: "♨",
                hoogtepunt: "Sauna's binnen 20 min",
                items: ["LOFF Boutique Wellness Assen", "Spa Hof van Saksen", "Massage aan huis mogelijk"],
                img: "/welness_drenthe.jpg",
                alt: "Buitensauna en wellness in een bosrijke omgeving in Drenthe",
                accent: "#7B6B3A",
              },
            ].map((c, i) => (
              <div key={i} style={{
                background: "white", borderRadius: 14,
                border: `1px solid ${T.border}`,
                overflow: "hidden",
                boxShadow: "0 2px 12px rgba(0,0,0,.06)",
              }}>
                <div style={{ position: "relative", height: 180 }}>
                  <Image
                    src={c.img}
                    alt={c.alt}
                    fill
                    sizes="(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 25vw"
                    style={{ objectFit: "cover" }}
                  />
                  <span style={{
                    position: "absolute", top: 10, right: 10,
                    background: "rgba(255,255,255,.85)", borderRadius: 8,
                    padding: "4px 8px", fontSize: 18, lineHeight: 1,
                  }}>{c.icon}</span>
                </div>
                <div style={{ padding: "20px 20px 22px" }}>
                  <h3 style={{
                    fontFamily: T.serif, fontSize: 16, fontWeight: 700,
                    color: T.text, margin: "0 0 4px",
                  }}>
                    {c.cat}
                  </h3>
                  <div style={{
                    fontFamily: T.sans, fontSize: 11, color: c.accent,
                    fontWeight: 600, marginBottom: 14, textTransform: "uppercase", letterSpacing: ".04em",
                  }}>
                    {c.hoogtepunt}
                  </div>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                    {c.items.map((item, j) => (
                      <li key={j} style={{
                        fontFamily: T.sans, fontSize: 13, color: T.muted,
                        fontWeight: 300, paddingBottom: 6, lineHeight: 1.5,
                        borderBottom: j < c.items.length - 1 ? `1px solid ${T.border}` : "none",
                        marginBottom: j < c.items.length - 1 ? 6 : 0,
                      }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          REVIEWS
      ══════════════════════════════════════════ */}
      <section style={{ background: T.bg, padding: "80px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SectionHeader
            eyebrow="Ervaringen van gasten"
            title="Wat anderen zeggen"
          />
          {googleRating && googleCount && (
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              justifyContent: "center", marginBottom: 36,
            }}>
              <span style={{ fontFamily: T.sans, fontSize: 13, color: T.gold, letterSpacing: "1px" }}>
                {"★".repeat(Math.round(googleRating))}
              </span>
              <span style={{ fontFamily: T.sans, fontSize: 13, color: T.text, fontWeight: 600 }}>
                {googleRating.toFixed(1)}
              </span>
              <span style={{ fontFamily: T.sans, fontSize: 12, color: T.muted }}>
                op basis van {googleCount} Google reviews
              </span>
            </div>
          )}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
          }}>
            {displayReviews.map((review, i) => (
              <div key={i} style={{
                background: "white", padding: "32px 28px",
                borderRadius: 14, position: "relative", overflow: "hidden",
                boxShadow: "0 2px 16px rgba(47,79,62,.06)",
              }}>
                <div style={{
                  position: "absolute", top: 16, right: 20,
                  fontFamily: T.serif, fontSize: 72, color: T.gold,
                  opacity: 0.12, lineHeight: 1, userSelect: "none",
                  fontWeight: 700,
                }}>
                  "
                </div>
                <div style={{
                  fontFamily: T.sans, fontSize: 13, color: T.gold,
                  marginBottom: 14, letterSpacing: "1px",
                }}>
                  {"★".repeat(review.rating)}
                </div>
                <p style={{
                  fontFamily: T.serif, fontSize: 15, color: T.text,
                  fontStyle: "italic", margin: "0 0 20px", lineHeight: 1.75,
                  fontWeight: 400,
                }}>
                  &ldquo;{review.text}&rdquo;
                </p>
                <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
                  <div style={{
                    fontFamily: T.sans, fontSize: 13, fontWeight: 700, color: T.green,
                  }}>
                    {review.author}
                  </div>
                  {googleReviews.length > 0 && (
                    <div style={{
                      fontFamily: T.sans, fontSize: 11, color: T.muted, fontWeight: 300,
                      display: "flex", alignItems: "center", gap: 4, marginTop: 2,
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Google review
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          BESCHIKBAARHEID & RESERVEREN
      ══════════════════════════════════════════ */}
      <BookingSection />

      {/* ══════════════════════════════════════════
          NIEUWSBRIEF
      ══════════════════════════════════════════ */}
      <section style={{
        background: T.green,
        padding: "72px 40px",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{
            fontFamily: T.sans, fontSize: 11, fontWeight: 600,
            color: "rgba(255,255,255,.9)", letterSpacing: "2.5px", textTransform: "uppercase",
            marginBottom: 14,
          }}>
            Opening 1 januari 2027
          </div>
          <h2 style={{
            fontFamily: T.serif, fontSize: "clamp(24px, 3.5vw, 34px)",
            color: "white", margin: "0 0 12px", fontWeight: 700, lineHeight: 1.2,
          }}>
            Wees er als eerste bij
          </h2>
          <p style={{
            fontFamily: T.sans, fontSize: 15, color: "rgba(255,255,255,.65)",
            fontWeight: 300, margin: "0 0 32px", lineHeight: 1.7,
          }}>
            Schrijf je in voor de nieuwsbrief en ontvang vroegboekvoordeel,
            seizoenstips en het eerste bericht zodra de lodges opengaan.
          </p>
          <NewsletterForm />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer style={{ background: "#1A1A1A", color: "rgba(255,255,255,.55)", padding: "60px 40px 36px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* Top grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "40px 48px",
            paddingBottom: 48,
            borderBottom: "1px solid rgba(255,255,255,.08)",
          }}>
            {/* Brand */}
            <div>
              <div style={{
                fontFamily: T.serif, fontSize: 18, fontWeight: 700,
                color: "white", letterSpacing: "0.5px", marginBottom: 12,
              }}>
                Huis ter Huynen
              </div>
              <p style={{
                fontFamily: T.sans, fontSize: 13, fontWeight: 300,
                lineHeight: 1.7, margin: "0 0 16px", color: "rgba(255,255,255,.75)",
              }}>
                Twee boutique lodges midden in het hart van Drenthe. Natuur, privacy en luxe — op loopafstand van de heide.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["De Heide · 4 pers.", "De Eik · 4 pers."].map((l, i) => (
                  <span key={i} style={{
                    fontFamily: T.sans, fontSize: 11, color: T.gold,
                    border: "1px solid rgba(180,154,94,.3)", padding: "3px 10px", borderRadius: 6,
                  }}>{l}</span>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <div style={{
                fontFamily: T.sans, fontSize: 11, fontWeight: 600,
                color: T.gold, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 16,
              }}>
                Contact
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 300, lineHeight: 1.6 }}>
                  Zuiderstraat 6<br />9491 EC Zeijen, Drenthe
                </div>
                <a href="https://wa.me/31642568603" target="_blank" rel="noopener noreferrer" style={{
                  fontFamily: T.sans, fontSize: 13, fontWeight: 400,
                  color: "#25D366", textDecoration: "none", display: "flex", alignItems: "center", gap: 6,
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
                <a href="mailto:lodge@huisterhuynen.nl" style={{
                  fontFamily: T.sans, fontSize: 13, fontWeight: 400,
                  color: "rgba(255,255,255,.7)", textDecoration: "none", display: "flex", alignItems: "center", gap: 6,
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  lodge@huisterhuynen.nl
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <div style={{
                fontFamily: T.sans, fontSize: 11, fontWeight: 600,
                color: T.gold, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 16,
              }}>
                Snel naar
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Onze lodges", href: "#" },
                  { label: "De omgeving", href: "#omgeving" },
                  { label: "Reserveren", href: "https://wa.me/31642568603" },
                  { label: "Blog & Verhalen", href: "/blog" },
                  { label: "FAQ", href: "/faq" },
                  { label: "Privacybeleid", href: "/privacy" },
                  { label: "Algemene voorwaarden", href: "/terms" },
                ].map((link, i) => (
                  <a key={i} href={link.href} style={{
                    fontFamily: T.sans, fontSize: 13, fontWeight: 300,
                    color: "rgba(255,255,255,.8)", textDecoration: "none",
                    transition: "color .15s",
                  }}>
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexWrap: "wrap", gap: 12, paddingTop: 28,
            fontFamily: T.sans, fontSize: 12, fontWeight: 300,
            color: "rgba(255,255,255,.6)",
          }}>
            <span>© 2026 Huis ter Huynen · Zeijen, Drenthe</span>
            <span style={{ fontFamily: T.sans, fontSize: 11, color: "rgba(255,255,255,.55)" }}>
              Boutique Lodge · KVK: 96382600
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
