"use client";

const T = {
  bg: "#EAE3D2",
  card: "#FDFBF6",
  green: "#2F4F3E",
  green2: "#3A6350",
  text: "#2A2418",
  muted: "#8A7D6A",
  gold: "#B49A5E",
  border: "#E0D8C8",
  serif: "Georgia, 'Times New Roman', serif",
  sans: "'DM Sans', system-ui, sans-serif",
};

/* ─── micro helpers ─── */
function GoldRule() {
  return <div style={{ height: 2, width: 48, background: T.gold, margin: "14px auto 0" }} />;
}

function Eyebrow({ children }: { children: string }) {
  return (
    <div style={{
      fontFamily: T.sans, fontSize: 11, fontWeight: 600,
      color: T.gold, letterSpacing: "2.5px", textTransform: "uppercase",
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

export default function LandingPage() {
  return (
    <div style={{ background: T.bg, fontFamily: T.sans, color: T.text }}>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section style={{
        minHeight: 680,
        background: `linear-gradient(160deg, #2F4F3E 0%, #3A5C45 40%, #6B5B3A 100%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        textAlign: "center", color: "white", position: "relative", overflow: "hidden",
      }}>
        {/* texture overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url('/heide1.jpg')",
          backgroundSize: "cover", backgroundPosition: "center",
          opacity: 0.28,
        }} />
        {/* gradient scrim */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(47,79,62,.55) 0%, rgba(47,79,62,.75) 100%)",
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

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#omgeving" style={{
              padding: "15px 44px", background: "transparent", color: "white",
              border: "2px solid rgba(255,255,255,.55)", borderRadius: 12,
              fontSize: 15, fontWeight: 600, cursor: "pointer",
              textDecoration: "none", display: "inline-block",
            }}>
              De omgeving
            </a>
          </div>
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
              { icon: "◈", label: "Uniek design", desc: "Een boomhut én een schaapskooi — elk met eigen karakter." },
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
                name: "De Boomhut",
                tag: "Voor twee",
                desc: "Een luxe boomhut op hoogte, ingericht voor twee. Panoramisch uitzicht over het Drentse bos, eigen sauna en privé-hottub op het terras.",
                features: ["2 personen", "Privé-hottub", "Sauna", "Bos uitzicht"],
              },
              {
                id: "lodge_2",
                name: "De Schaapskooi",
                tag: "Voor vier",
                desc: "Een voormalige schapenschuur omgebouwd tot sfeervol verblijf voor vier. Hoge plafonds, authentieke balken en een volledige keuken.",
                features: ["4 personen", "Privé-hottub", "Volledige keuken", "Authentiek interieur"],
              },
            ].map((lodge) => (
              <div key={lodge.id} style={{
                borderRadius: 16, overflow: "hidden",
                background: T.card, border: `1px solid ${T.border}`,
                boxShadow: "0 4px 24px rgba(47,79,62,.07)",
              }}>
                <div style={{
                  height: 240,
                  backgroundImage: lodge.id === "lodge_1" ? "url('/heide2.jpg')" : "url('/heide3.jpg')",
                  backgroundSize: "cover", backgroundPosition: "center",
                  position: "relative",
                }}>
                  <div style={{
                    position: "absolute", top: 16, left: 16,
                    background: T.gold, color: T.green,
                    fontFamily: T.sans, fontSize: 11, fontWeight: 700,
                    letterSpacing: "1.5px", textTransform: "uppercase",
                    padding: "5px 12px", borderRadius: 6,
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
              color: T.gold, letterSpacing: "2px", textTransform: "uppercase",
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
                  <h4 style={{
                    fontFamily: T.serif, fontSize: 17, color: T.text,
                    margin: "0 0 4px", fontWeight: 700,
                  }}>
                    {w.naam}
                  </h4>
                  <div style={{
                    fontFamily: T.sans, fontSize: 12, color: T.gold,
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
                color: T.gold, letterSpacing: "2px", textTransform: "uppercase",
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
                color: T.gold, letterSpacing: "2px", textTransform: "uppercase",
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
              color: T.gold, letterSpacing: "2px", textTransform: "uppercase",
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
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 24,
          }}>
            {[
              {
                cat: "Wandelen & Natuur",
                icon: "🌿",
                hoogtepunt: "Veentjesroute Zeijen",
                items: ["Direct vanuit de lodge", "13+ routes in de omgeving", "Nationaal Park op 15 min"],
                img: "/heide1.jpg",
                accent: T.green,
              },
              {
                cat: "Fietsen",
                icon: "🚴",
                hoogtepunt: "1.000+ km knooppuntennet",
                items: ["E-bikes te huur in Assen", "Levering op locatie mogelijk", "MTB-routes beschikbaar"],
                img: "/rent_a_bike.jpg",
                accent: "#7B6B3A",
              },
              {
                cat: "Cultuur & UNESCO",
                icon: "🗿",
                hoogtepunt: "52 hunebedden · Drents Museum",
                items: ["Hunebed Highway (N34)", "Kamp Westerbork", "Museumdorp Orvelte"],
                img: "/heide2.jpg",
                accent: T.green,
              },
              {
                cat: "Wellness",
                icon: "♨",
                hoogtepunt: "Sauna's binnen 20 min",
                items: ["LOFF Boutique Wellness Assen", "Spa Hof van Saksen", "Massage aan huis mogelijk"],
                img: "/borrel1.jpg",
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
                  <img
                    src={c.img}
                    alt={c.cat}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                  <span style={{
                    position: "absolute", top: 10, right: 10,
                    background: "rgba(255,255,255,.85)", borderRadius: 8,
                    padding: "4px 8px", fontSize: 18, lineHeight: 1,
                  }}>{c.icon}</span>
                </div>
                <div style={{ padding: "20px 20px 22px" }}>
                  <h4 style={{
                    fontFamily: T.serif, fontSize: 16, fontWeight: 700,
                    color: T.text, margin: "0 0 4px",
                  }}>
                    {c.cat}
                  </h4>
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
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
          }}>
            {[
              {
                text: "Een onvergetelijk weekend in de Boomhut. De hottub onder de sterren, het geluid van de vogels — pure magie.",
                author: "Sarah & Mark",
                herkomst: "Amsterdam",
              },
              {
                text: "De Schaapskooi is het mooiste wat ik het afgelopen jaar heb gezien. Warm, authentiek, en hartelijk ontvangen.",
                author: "Petra",
                herkomst: "Groningen",
              },
              {
                text: "Perfect voor een EV-roadtrip. Laadpaal ter plekke en het uitzicht over de heide is fenomenaal.",
                author: "Jan",
                herkomst: "Duitsland",
              },
            ].map((review, i) => (
              <div key={i} style={{
                background: "white", padding: "32px 28px",
                borderRadius: 14, position: "relative", overflow: "hidden",
                boxShadow: "0 2px 16px rgba(47,79,62,.06)",
              }}>
                {/* decoratief aanhalingsteken */}
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
                  ★★★★★
                </div>
                <p style={{
                  fontFamily: T.serif, fontSize: 15, color: T.text,
                  fontStyle: "italic", margin: "0 0 20px", lineHeight: 1.75,
                  fontWeight: 400,
                }}>
                  "{review.text}"
                </p>
                <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
                  <div style={{
                    fontFamily: T.sans, fontSize: 13, fontWeight: 700, color: T.green,
                  }}>
                    {review.author}
                  </div>
                  <div style={{
                    fontFamily: T.sans, fontSize: 12, color: T.muted, fontWeight: 300,
                  }}>
                    {review.herkomst}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          CTA
      ══════════════════════════════════════════ */}
      <section style={{
        background: `linear-gradient(135deg, ${T.green} 0%, #3A6350 100%)`,
        color: "white", padding: "80px 40px", textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url('/heide2.jpg')",
          backgroundSize: "cover", backgroundPosition: "center",
          opacity: 0.08,
        }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 580, margin: "0 auto" }}>
          <div style={{
            fontFamily: T.sans, fontSize: 11, fontWeight: 600,
            color: T.gold, letterSpacing: "2.5px", textTransform: "uppercase",
            marginBottom: 14,
          }}>
            Klaar voor Drenthe
          </div>
          <h2 style={{
            fontFamily: T.serif, fontSize: "clamp(28px, 4vw, 40px)",
            margin: "0 0 16px", lineHeight: 1.15, fontWeight: 700,
          }}>
            Boek uw verblijf bij Huis ter Huynen
          </h2>
          <p style={{
            fontFamily: T.sans, fontSize: 15, fontWeight: 300,
            margin: "0 0 36px", lineHeight: 1.7, color: "rgba(255,255,255,.8)",
          }}>
            Stuur uw voorkeursdatums — wij reageren binnen 24 uur met een persoonlijk voorstel.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="mailto:lodge@huisterhuynen.nl" style={{
              padding: "15px 44px", background: "transparent", color: "white",
              border: "2px solid rgba(255,255,255,.4)", borderRadius: 12,
              fontSize: 15, fontWeight: 600, cursor: "pointer",
              textDecoration: "none", display: "inline-block",
            }}>
              Stuur een bericht
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer style={{ background: "#1A1A1A", color: T.muted, padding: "48px 40px", textAlign: "center" }}>
        <div style={{
          fontFamily: T.serif, fontSize: 14, color: "rgba(255,255,255,.4)",
          letterSpacing: "2px", textTransform: "uppercase", marginBottom: 20,
        }}>
          Huis ter Huynen
        </div>
        <p style={{ fontFamily: T.sans, fontSize: 13, margin: "0 0 8px", fontWeight: 300 }}>
          Zuiderstraat 6 · 9491 EC Zeijen, Drenthe
          {" · "}
          <a href="tel:+31642568603" style={{ color: T.gold, textDecoration: "none" }}>+31 6 42568603</a>
        </p>
        <p style={{ fontFamily: T.sans, fontSize: 12, margin: "16px 0 0", fontWeight: 300 }}>
          © 2026 Huis ter Huynen
          {" · "}
          <a href="/privacy" style={{ color: T.gold, textDecoration: "none" }}>Privacy</a>
          {" · "}
          <a href="/terms" style={{ color: T.gold, textDecoration: "none" }}>Voorwaarden</a>
          {" · "}
          <a href="mailto:lodge@huisterhuynen.nl" style={{ color: T.gold, textDecoration: "none" }}>Contact</a>
        </p>
      </footer>
    </div>
  );
}
