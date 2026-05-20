"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { NewsletterForm } from "@/components/NewsletterForm";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const BookingCalendar = dynamic(() => import("@/components/BookingCalendar"), {
  ssr: false,
  loading: () => (
    <div style={{ textAlign: "center", padding: 48, color: "#8A7D6A", fontFamily: "var(--font-dm-sans), system-ui, sans-serif", fontSize: 14 }}>
      Kalender wird geladen…
    </div>
  ),
});

interface GoogleReview {
  author: string;
  rating: number;
  text: string;
  time: number;
}

const FALLBACK_REVIEWS = [
  {
    text: "Ein unvergessliches Wochenende in „De Heide“. Der Hot Tub unter den Sternen, das Zwitschern der Vögel — pure Magie.",
    author: "Sarah & Mark",
    rating: 5,
  },
  {
    text: "„De Eik“ ist das Schönste, was ich im letzten Jahr gesehen habe. Warm, authentisch und herzlich empfangen.",
    author: "Petra",
    rating: 5,
  },
  {
    text: "Perfekt für einen E-Auto-Roadtrip. Ladestation vor Ort und der Blick über die Heide ist einfach fantastisch.",
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

function SectionTitle({ children, as = "h2" }: { children: string; as?: "h2" | "h3" }) {
  const Tag = as;
  return (
    <Tag style={{
      fontFamily: T.serif, fontSize: as === "h2" ? "clamp(28px, 4vw, 40px)" : "clamp(22px, 3vw, 30px)",
      color: T.text, margin: "0 0 6px", fontWeight: 700, lineHeight: 1.15,
    }}>
      {children}
    </Tag>
  );
}

function SectionHeader({ eyebrow, title, sub, as = "h2" }: { eyebrow: string; title: string; sub?: string; as?: "h2" | "h3" }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 52 }}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <SectionTitle as={as}>{title}</SectionTitle>
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
    <section id="verfugbarkeit" style={{
      background: "white",
      padding: "80px 40px",
      borderTop: `3px solid ${T.green}`,
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <Eyebrow>Verfügbarkeit</Eyebrow>
          <SectionTitle as="h2">Ihren Aufenthalt buchen</SectionTitle>
          <GoldRule />
          <p style={{ fontFamily: T.sans, fontSize: 16, color: T.muted, fontWeight: 300, margin: "20px auto 0", maxWidth: 560, lineHeight: 1.7 }}>
            Wählen Sie Ihre Reisedaten und senden Sie eine Anfrage. Wir bestätigen persönlich innerhalb von 24 Stunden.
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
            Frühbucher erhalten Vorrang auf die Sommerwochenenden 2027
          </div>
          <p style={{ fontFamily: T.sans, fontSize: 11, color: T.muted, fontWeight: 300, margin: "12px 0 0" }}>
            Buchungs-Kalender derzeit auf Niederländisch — Datumsauswahl und Preise sind selbsterklärend.
          </p>
        </div>
        <BookingCalendar />
      </div>
    </section>
  );
}

export default function LandingPageDE() {
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
      <LanguageSwitcher currentLang="de" />

      {/* ══ HERO ══ */}
      <section style={{
        minHeight: 680,
        background: `#141210`,
        display: "flex", alignItems: "center", justifyContent: "center",
        textAlign: "center", color: "white", position: "relative", overflow: "hidden",
      }}>
        <Image
          src="/lodge-heide.jpg"
          alt="Boutique Lodge De Heide von Huis ter Huynen, umgeben von Heide und Wald in Zeijen, Drenthe"
          fill
          priority
          quality={45}
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center 40%", opacity: 0.72 }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(10,8,4,.12) 0%, rgba(10,8,4,.52) 100%)",
        }} />

        <div style={{ position: "relative", zIndex: 2, maxWidth: 720, padding: "60px 32px" }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{
              fontFamily: T.serif, fontSize: 13, fontWeight: 700,
              color: T.gold, letterSpacing: "4px", textTransform: "uppercase", marginBottom: 10,
            }}>
              Boutique Lodge · Zeijen · Drenthe
            </div>
            <h1 style={{
              fontFamily: T.serif, fontSize: "clamp(34px, 5.5vw, 56px)",
              fontWeight: 700, margin: "0 0 6px", lineHeight: 1.1, color: "white",
            }}>
              Exklusive Wellness Lodges inmitten der Natur Drenthes
            </h1>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 14 }}>
              <span style={{ display: "block", width: 32, height: 1, background: T.gold, opacity: 0.8 }} />
              <span style={{ fontFamily: T.sans, fontSize: 12, color: T.gold, letterSpacing: "2px", textTransform: "uppercase" }}>
                Natur · Privatsphäre · Luxus
              </span>
              <span style={{ display: "block", width: 32, height: 1, background: T.gold, opacity: 0.8 }} />
            </div>
          </div>

          <p style={{
            fontFamily: T.sans, fontSize: 17, fontWeight: 300,
            lineHeight: 1.7, marginBottom: 36, color: "rgba(255,255,255,.88)",
          }}>
            Private Sauna, Hot Tub und absolute Ruhe — Ihr luxuriöser Rückzugsort in den Niederlanden.
          </p>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <a href="#verfugbarkeit" style={{
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
              Verfügbarkeit prüfen
              <span aria-hidden style={{ fontSize: 18, lineHeight: 1 }}>→</span>
            </a>

            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontFamily: T.sans, fontSize: 12, fontWeight: 500,
              color: T.gold, letterSpacing: "0.4px",
            }}>
              <span style={{
                display: "inline-block", width: 6, height: 6, borderRadius: "50%",
                background: T.gold, boxShadow: `0 0 0 4px rgba(180,154,94,.18)`,
              }} />
              Nur 2 Lodges · Frühbucher erhalten Vorrang
            </div>

            <a href="#umgebung" style={{
              fontFamily: T.sans, fontSize: 13, fontWeight: 400,
              color: "rgba(255,255,255,.7)",
              textDecoration: "underline", textUnderlineOffset: 4,
              textDecorationColor: "rgba(255,255,255,.35)",
            }}>
              Die Lodges entdecken
            </a>
          </div>
          <p style={{
            fontFamily: T.sans, fontSize: 11, fontWeight: 300,
            color: "rgba(255,255,255,.42)", marginTop: 24, letterSpacing: "0.3px",
          }}>
            Eröffnung 1. Januar 2027 · bereits buchbar
          </p>
        </div>
      </section>

      {/* ══ STATS STRIP ══ */}
      <section style={{ background: T.green, padding: "28px 40px" }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 0, textAlign: "center",
        }}>
          {[
            { n: "0 Min", label: "Wandern direkt vor der Tür" },
            { n: "15 Min", label: "Nationalpark Drentsche Aa" },
            { n: "52", label: "Hünengräber in Drenthe" },
            { n: "1.000+", label: "km Radwege rundum" },
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

      {/* ══ USPs — Ruhe, Privatsphäre und Wellness ══ */}
      <section style={{ background: T.card, padding: "80px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SectionHeader
            eyebrow="Warum Huis ter Huynen"
            title="Ruhe, Privatsphäre und exklusiver Komfort"
            sub="Hochwertige Ausstattung, stilvolles Interieur und maximale Privatsphäre für eine besondere Auszeit in Drenthe."
          />
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "40px 32px",
          }}>
            {[
              {
                label: "Private Wellness",
                desc: "Genießen Sie Ihre eigene Sauna und einen privaten Hot Tub unter dem Sternenhimmel — zu jeder Tages- und Jahreszeit.",
              },
              {
                label: "Mitten in der Natur",
                desc: "Direkt vor Ihrer Tür beginnen stille Wanderwege, Heideflächen und jahrhundertealte Wälder.",
              },
              {
                label: "Exklusiver Komfort",
                desc: "Hochwertige Ausstattung, stilvolles Interieur und maximale Privatsphäre für eine besondere Auszeit.",
              },
            ].map((usp, i) => (
              <div key={i} style={{ borderTop: `2px solid ${T.gold}`, paddingTop: 20 }}>
                <h3 style={{
                  fontFamily: T.serif, fontSize: 18, fontWeight: 700,
                  color: T.green, marginBottom: 10, marginTop: 0,
                }}>
                  {usp.label}
                </h3>
                <p style={{
                  fontFamily: T.sans, fontSize: 14, color: T.muted,
                  fontWeight: 300, margin: 0, lineHeight: 1.7,
                }}>
                  {usp.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ EXPERIENCE — Ankommen. Abschalten. Durchatmen. ══ */}
      <section style={{
        background: `linear-gradient(180deg, ${T.green} 0%, ${T.green2} 100%)`,
        padding: "80px 40px",
      }}>
        <div style={{ maxWidth: 820, margin: "0 auto", textAlign: "center", color: "white" }}>
          <Eyebrow>Das Erlebnis</Eyebrow>
          <h2 style={{
            fontFamily: T.serif, fontSize: "clamp(28px, 4vw, 40px)",
            margin: "0 0 14px", fontWeight: 700, color: "white", lineHeight: 1.15,
          }}>
            Ankommen. Abschalten. Durchatmen.
          </h2>
          <div style={{ height: 2, width: 48, background: T.gold, margin: "0 auto 28px" }} />
          <p style={{
            fontFamily: T.sans, fontSize: 16, fontWeight: 300,
            lineHeight: 1.8, color: "rgba(255,255,255,.85)", marginBottom: 16,
          }}>
            Huis ter Huynen ist ein Ort für Menschen, die Ruhe, Natur und hochwertigen Komfort schätzen. Unsere exklusiven Wellness Lodges verbinden modernes Design mit der natürlichen Schönheit Drenthes.
          </p>
          <p style={{
            fontFamily: T.sans, fontSize: 16, fontWeight: 300,
            lineHeight: 1.8, color: "rgba(255,255,255,.85)", marginBottom: 16,
          }}>
            Ob ein romantisches Wellness-Wochenende, eine kurze Auszeit vom Alltag oder entspannte Tage in der Natur — hier finden Sie Raum zum Entschleunigen.
          </p>
          <p style={{
            fontFamily: T.sans, fontSize: 16, fontWeight: 300,
            lineHeight: 1.8, color: "rgba(255,255,255,.85)",
          }}>
            Beginnen Sie den Morgen mit Vogelstimmen, entspannen Sie in Ihrer privaten Sauna und genießen Sie den Abend im warmen Hot Tub unter freiem Himmel.
          </p>
        </div>
      </section>

      {/* ══ LODGES ══ */}
      <section style={{ background: "white", padding: "80px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SectionHeader
            eyebrow="Unsere Unterkünfte"
            title="Wählen Sie Ihre Lodge"
            sub="Beide Lodges sind vollständig privat, mit eigenem Hot Tub ausgestattet und für maximalen Komfort in der Natur konzipiert."
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
                tag: "4 Personen",
                desc: "Eine luxuriöse Lodge auf der Drentse Heide, gestaltet für vier Gäste. Panoramablick über den Wald, eigene Sauna und privater Hot Tub auf der Terrasse.",
                features: ["4 Personen", "Privater Hot Tub", "Sauna", "Heideblick"],
                img: "/lodge-heide.jpg",
                alt: "Außenansicht von Lodge De Heide mit privatem Hot Tub auf der Terrasse und Blick über die Drentse Heide",
              },
              {
                id: "lodge_2",
                name: "De Eik",
                tag: "4 Personen",
                desc: "Eine geräumige Lodge unter Eichen, umgebaut zu einem stimmungsvollen Refugium für vier. Hohe Decken, authentische Ausstrahlung und voll ausgestattete Küche.",
                features: ["4 Personen", "Privater Hot Tub", "Voll ausgestattete Küche", "Außenküche & BBQ"],
                img: "/lodge-eik.jpg",
                alt: "Außenansicht von Lodge De Eik unter Eichen mit Außenküche und Grill",
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
                  <a href="#verfugbarkeit" style={{
                    display: "block", textAlign: "center",
                    width: "100%", padding: "13px 0",
                    background: T.green, color: "white",
                    border: "none", borderRadius: 10, boxSizing: "border-box",
                    fontSize: 14, fontWeight: 600, textDecoration: "none",
                    letterSpacing: "0.3px",
                  }}>
                    {lodge.name} buchen
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ WELLNESS — Private Wellness erleben ══ */}
      <section style={{ background: T.bg, padding: "80px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <SectionHeader
            eyebrow="Wellness"
            title="Private Wellness erleben"
            sub="Jede Lodge wurde mit Fokus auf Ruhe, Komfort und Privatsphäre gestaltet. Die Kombination aus Sauna, Hot Tub und natürlicher Umgebung schafft ein exklusives Wellness-Erlebnis zu jeder Jahreszeit."
          />
          <div style={{
            background: T.card, borderRadius: 14,
            border: `1px solid ${T.border}`,
            padding: "36px 40px",
            boxShadow: "0 2px 12px rgba(47,79,62,.05)",
          }}>
            <div style={{
              fontFamily: T.sans, fontSize: 11, fontWeight: 600,
              color: T.green, letterSpacing: "2px", textTransform: "uppercase",
              marginBottom: 18,
            }}>
              Ideal für
            </div>
            <ul style={{
              listStyle: "none", padding: 0, margin: 0,
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 14,
            }}>
              {[
                "Wellness-Wochenenden",
                "Romantische Aufenthalte",
                "Ruhige Natururlaube",
                "Luxus-Auszeiten in den Niederlanden",
              ].map((item, i) => (
                <li key={i} style={{
                  fontFamily: T.sans, fontSize: 15, color: T.text,
                  paddingLeft: 22, position: "relative", lineHeight: 1.6,
                }}>
                  <span aria-hidden style={{
                    position: "absolute", left: 0, top: 7,
                    width: 10, height: 10, borderRadius: "50%",
                    background: T.gold,
                  }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ══ AKTIVITÄTEN — 4 Kategorien mit Fotos ══ */}
      <section style={{ background: T.bg, padding: "80px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SectionHeader
            eyebrow="Aktivitäten in der Umgebung"
            title="Was Sie alles erleben können"
            sub="Drenthe bietet weit mehr als Wandern. Radfahren auf Knotenpunktstrecken, Kultur bei den Hünengräbern oder Entspannen in einem der Wellnesszentren — alles in unter einer halben Stunde erreichbar."
          />
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 24,
          }}>
            {[
              {
                cat: "Wandern & Natur",
                icon: "🌿",
                hoogtepunt: "Veentjesroute Zeijen",
                items: ["Direkt ab der Lodge", "13+ Routen in der Umgebung", "Nationalpark in 15 Min"],
                img: "/wandel_drenthe.jpg",
                alt: "Wanderweg durch die Drentse Heide mit blühender Heide",
                accent: T.green,
              },
              {
                cat: "Radfahren",
                icon: "🚴",
                hoogtepunt: "1.000+ km Knotenpunktnetz",
                items: ["E-Bikes leihbar in Assen", "Lieferung vor Ort möglich", "MTB-Routen verfügbar"],
                img: "/rent_a_bike.jpg",
                alt: "Fahrräder zur Miete entlang eines Drentse Radweges im Wald",
                accent: "#7B6B3A",
              },
              {
                cat: "Kultur & UNESCO",
                icon: "🗿",
                hoogtepunt: "52 Hünengräber · Drents Museum",
                items: ["Hunebed Highway (N34)", "Camp Westerbork", "Museumdorf Orvelte"],
                img: "/museum_drenthe.jpg",
                alt: "Hünengrab in Drenthe, prähistorisches Grabmal in grüner Landschaft",
                accent: T.green,
              },
              {
                cat: "Wellness",
                icon: "♨",
                hoogtepunt: "Saunas in 20 Min",
                items: ["LOFF Boutique Wellness Assen", "Spa Hof van Saksen", "Wellnessresort Waterlelie"],
                img: "/welness_drenthe.jpg",
                alt: "Außensauna und Wellness in waldreicher Umgebung in Drenthe",
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

      {/* ══ REVIEWS ══ */}
      <section style={{ background: T.bg, padding: "80px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <SectionHeader
            eyebrow="Stimmen unserer Gäste"
            title="Was Gäste über uns sagen"
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
                basierend auf {googleCount} Google-Bewertungen
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
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TRUST — Ein Ort zum Wohlfühlen ══ */}
      <section style={{ background: T.card, padding: "80px 40px" }}>
        <div style={{ maxWidth: 820, margin: "0 auto", textAlign: "center" }}>
          <SectionHeader
            eyebrow="Vertrauen"
            title="Ein Ort zum Wohlfühlen"
            sub="Mit viel Liebe zum Detail geschaffen, bietet Huis ter Huynen eine besondere Kombination aus Luxus, Ruhe und Gastfreundschaft."
          />
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 18, maxWidth: 760, margin: "0 auto",
          }}>
            {[
              "die entspannte Atmosphäre",
              "die hochwertige Ausstattung",
              "die natürliche Umgebung",
              "die Privatsphäre der Lodges",
            ].map((item, i) => (
              <div key={i} style={{
                background: "white", borderRadius: 10,
                border: `1px solid ${T.border}`, padding: "18px 20px",
                fontFamily: T.sans, fontSize: 14, color: T.text,
                lineHeight: 1.5, fontWeight: 400,
              }}>
                Unsere Gäste schätzen <strong style={{ color: T.green }}>{item}</strong>.
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ══ */}
      <section style={{
        background: `linear-gradient(180deg, ${T.green} 0%, ${T.green2} 100%)`,
        padding: "72px 40px",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: 700, margin: "0 auto", color: "white" }}>
          <Eyebrow>Bereit?</Eyebrow>
          <h2 style={{
            fontFamily: T.serif, fontSize: "clamp(28px, 4vw, 40px)",
            margin: "0 0 14px", fontWeight: 700, color: "white", lineHeight: 1.15,
          }}>
            Zeit für Ihre Auszeit?
          </h2>
          <div style={{ height: 2, width: 48, background: T.gold, margin: "0 auto 22px" }} />
          <p style={{
            fontFamily: T.sans, fontSize: 16, fontWeight: 300,
            lineHeight: 1.8, color: "rgba(255,255,255,.85)", marginBottom: 32,
          }}>
            Entdecken Sie die Ruhe Drenthes und genießen Sie exklusive Wellness inmitten der Natur.
          </p>
          <div style={{ display: "inline-flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <a href="#verfugbarkeit" style={{
              padding: "15px 38px",
              background: T.gold, color: "#1A2E24",
              borderRadius: 12, textDecoration: "none",
              fontFamily: T.sans, fontSize: 15, fontWeight: 700,
              letterSpacing: "0.3px",
              boxShadow: "0 6px 24px rgba(180,154,94,.45)",
            }}>
              Verfügbarkeit prüfen
            </a>
            <a href="#umgebung" style={{
              padding: "15px 38px",
              background: "transparent", color: "white",
              border: "1px solid rgba(255,255,255,.4)",
              borderRadius: 12, textDecoration: "none",
              fontFamily: T.sans, fontSize: 15, fontWeight: 500,
              letterSpacing: "0.3px",
            }}>
              Jetzt entdecken
            </a>
          </div>
        </div>
      </section>

      {/* ══ BOOKING ══ */}
      <BookingSection />

      {/* ══ NEWSLETTER ══ */}
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
            Eröffnung 1. Januar 2027
          </div>
          <h2 style={{
            fontFamily: T.serif, fontSize: "clamp(24px, 3.5vw, 34px)",
            color: "white", margin: "0 0 12px", fontWeight: 700, lineHeight: 1.2,
          }}>
            Seien Sie unter den Ersten
          </h2>
          <p style={{
            fontFamily: T.sans, fontSize: 15, color: "rgba(255,255,255,.65)",
            fontWeight: 300, margin: "0 0 32px", lineHeight: 1.7,
          }}>
            Abonnieren Sie unseren Newsletter und erhalten Sie Frühbucher-Vorteile, saisonale Tipps und die erste Nachricht zur Eröffnung der Lodges.
          </p>
          <NewsletterForm />
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ background: "#1A1A1A", color: "rgba(255,255,255,.55)", padding: "60px 40px 36px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "40px 48px",
            paddingBottom: 48,
            borderBottom: "1px solid rgba(255,255,255,.08)",
          }}>
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
                Zwei Boutique Lodges mitten in Drenthe. Natur, Privatsphäre und Luxus, in Gehweite zur Heide.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["De Heide · 4 Pers.", "De Eik · 4 Pers."].map((l, i) => (
                  <span key={i} style={{
                    fontFamily: T.sans, fontSize: 11, color: T.gold,
                    border: "1px solid rgba(180,154,94,.3)", padding: "3px 10px", borderRadius: 6,
                  }}>{l}</span>
                ))}
              </div>
            </div>

            <div>
              <div style={{
                fontFamily: T.sans, fontSize: 11, fontWeight: 600,
                color: T.gold, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 16,
              }}>
                Kontakt
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

            <div>
              <div style={{
                fontFamily: T.sans, fontSize: 11, fontWeight: 600,
                color: T.gold, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 16,
              }}>
                Schnellzugriff
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Unsere Lodges", href: "#" },
                  { label: "Drenthe entdecken", href: "#umgebung" },
                  { label: "Verfügbarkeit", href: "#verfugbarkeit" },
                  { label: "Datenschutz", href: "/datenschutz" },
                  { label: "Impressum", href: "/impressum" },
                  { label: "AGB", href: "/agb" },
                ].map((link, i) => (
                  <a key={i} href={link.href} style={{
                    fontFamily: T.sans, fontSize: 13, fontWeight: 300,
                    color: "rgba(255,255,255,.8)", textDecoration: "none",
                  }}>
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <div style={{
                fontFamily: T.sans, fontSize: 11, fontWeight: 600,
                color: T.gold, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 16,
              }}>
                Nederlands
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <a href="/" hrefLang="nl" style={{
                  fontFamily: T.sans, fontSize: 13, fontWeight: 300,
                  color: "rgba(255,255,255,.8)", textDecoration: "none",
                }}>
                  Nederlandse versie
                </a>
                <a href="/privacy" hrefLang="nl" style={{
                  fontFamily: T.sans, fontSize: 13, fontWeight: 300,
                  color: "rgba(255,255,255,.8)", textDecoration: "none",
                }}>
                  Privacybeleid
                </a>
                <a href="/terms" hrefLang="nl" style={{
                  fontFamily: T.sans, fontSize: 13, fontWeight: 300,
                  color: "rgba(255,255,255,.8)", textDecoration: "none",
                }}>
                  Algemene voorwaarden
                </a>
              </div>
            </div>
          </div>

          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexWrap: "wrap", gap: 12, paddingTop: 28,
            fontFamily: T.sans, fontSize: 12, fontWeight: 300,
            color: "rgba(255,255,255,.6)",
          }}>
            <span>© 2026 Huis ter Huynen · Zeijen, Drenthe</span>
            <span style={{ fontFamily: T.sans, fontSize: 11, color: "rgba(255,255,255,.55)" }}>
              VVR Vastgoed BV · KvK: 96382600 · USt-IdNr: NL867587106B01
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
