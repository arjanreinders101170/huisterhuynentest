import Link from "next/link";
import { SiteHeader } from "@/components/wadweids/SiteHeader";
import { SiteFooter } from "@/components/wadweids/SiteFooter";
import { SectionHead } from "@/components/wadweids/Sections";
import { LogoMark } from "@/components/wadweids/Logo";
import { PropertyCard } from "@/components/wadweids/PropertyCard";
import { IconArrow, IconComfort, IconNature, IconPersonal, IconSpace, IconTide } from "@/components/wadweids/Icons";
import { PROPERTIES } from "@/lib/wadweids/content";

/* Merkpagina en overdrachtsdocument in één: kleur, typografie, componenten
   en de architectuur achter het platform. Bedoeld voor de bouwer die
   hierna aan de slag gaat. */
export const metadata = { title: "Merk & designsysteem — Wad & Weids" };

const KLEUREN = [
  ["Gebroken wit", "#FAF8F4", "Paginagrond"],
  ["Zand", "#EFE7D9", "Rustsecties"],
  ["Zand diep", "#E2D6C2", "Vlakken, randen"],
  ["Klei", "#C9B79C", "Scheidingen"],
  ["Diep groen", "#23392F", "Merkkleur, knoppen"],
  ["Zeeblauw", "#1D3B4A", "Footer, overlays"],
  ["Oker", "#A8834C", "Accent, nooit als vlak"],
  ["Inkt", "#1A201E", "Tekst"],
];

export default function MerkPage() {
  return (
    <>
      <SiteHeader />

      <div className="ww-pagehead ww-pagehead--onsand">
        <div className="ww-wrap">
          <span className="ww-eyebrow">Merk &amp; designsysteem</span>
          <h1 className="ww-h2 ww-mt-s">De onderdelen waaruit Wad &amp; Weids bestaat</h1>
          <p className="ww-lead ww-mt-s">
            Deze pagina hoort niet bij de bezoekerssite. Het is de overdracht: het palet, de typografie, de
            componenten en de technische opzet — zodat een nieuwe woning toevoegen straks een kwestie van
            invullen is, niet van ontwerpen.
          </p>
        </div>
      </div>

      {/* ── Logo ─────────────────────────────────────────────────── */}
      <section className="ww-section ww-section--tight">
        <div className="ww-wrap">
          <SectionHead eyebrow="Logo" title="Woordmerk en beeldmerk" text="Het woordmerk staat centraal. Het beeldmerk is een horizon: een strakke waterlijn, een zachte duinrand en één wadpaal die de lijn doorbreekt. Geen huisje, geen zon." />
          <div className="ww-grid">
            <div className="ww-specimen ww-center" style={{ background: "var(--shell)" }}>
              <div className="ww-specimen__label">Beeldmerk</div>
              <div style={{ display: "flex", justifyContent: "center", color: "var(--forest)" }}><LogoMark size={120} /></div>
            </div>
            <div className="ww-specimen ww-center" style={{ display: "grid", placeContent: "center", background: "var(--forest)", color: "#fff" }}>
              <div className="ww-specimen__label" style={{ color: "rgba(255,255,255,.6)" }}>Op donker</div>
              <span className="ww-logo__word" style={{ fontSize: "1.8rem" }}>Wad <em>&amp;</em> Weids</span>
            </div>
            <div className="ww-specimen" style={{ display: "grid", placeContent: "center" }}>
              <div className="ww-specimen__label">Woordmerk</div>
              <span className="ww-logo__word" style={{ fontSize: "1.8rem" }}>Wad <em>&amp;</em> Weids</span>
              <span className="ww-logo__tag" style={{ marginTop: 10 }}>Luxe verblijven in de mooiste natuur van Nederland</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Kleur ────────────────────────────────────────────────── */}
      <section className="ww-section ww-section--tight ww-section--sand">
        <div className="ww-wrap">
          <SectionHead eyebrow="Kleur" title="Acht kleuren, meer niet" text="Zand en gebroken wit dragen de pagina, diep groen is de merkkleur, zeeblauw de tweede stem en oker het accent. Fel bestaat niet in dit palet." />
          <div className="ww-swatches">
            {KLEUREN.map(([naam, hex, gebruik]) => (
              <div className="ww-swatchcard" key={hex}>
                <div className="ww-swatchcard__chip" style={{ background: hex }} />
                <div className="ww-swatchcard__meta">
                  <strong>{naam}</strong>
                  <code>{hex}</code> · {gebruik}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Typografie ───────────────────────────────────────────── */}
      <section className="ww-section ww-section--tight">
        <div className="ww-wrap">
          <SectionHead eyebrow="Typografie" title="Cormorant Garamond en Jost" text="Een hoog-contrast serif voor alles wat groot is, een geometrische sans voor alles wat gelezen en aangeklikt wordt. Kapitalen krijgen altijd ruime letterafstand." />
          <div className="ww-specimen">
            <div className="ww-specimen__label">Display · Cormorant Garamond 300</div>
            <p className="ww-display">Ruimte om te ademen.</p>
          </div>
          <div className="ww-specimen">
            <div className="ww-specimen__label">Sectiekop · Cormorant Garamond 300</div>
            <p className="ww-h2">Met zorg gekozen, één voor één</p>
          </div>
          <div className="ww-specimen">
            <div className="ww-specimen__label">Eyebrow &amp; navigatie · Jost 400, 0.2em</div>
            <span className="ww-eyebrow">Onze verblijven</span>
          </div>
          <div className="ww-specimen">
            <div className="ww-specimen__label">Lopende tekst · Jost 300</div>
            <p className="ww-body">
              Wadzicht staat waar Nederland ophoudt. Achter het huis loopt de zeedijk, daarachter de kwelder,
              en daarachter niets dan wad tot aan de eilanden.
            </p>
          </div>
        </div>
      </section>

      {/* ── Componenten ──────────────────────────────────────────── */}
      <section className="ww-section ww-section--tight ww-section--sand">
        <div className="ww-wrap">
          <SectionHead eyebrow="Componenten" title="Knoppen, iconen en kaarten" text="Alles wat op de site staat komt uit deze set. Nieuwe pagina's worden ermee samengesteld, niet opnieuw getekend." />
          <div className="ww-specimen">
            <div className="ww-specimen__label">Knoppen</div>
            <div className="ww-row">
              <span className="ww-btn ww-btn--primary">Boek nu</span>
              <span className="ww-btn ww-btn--ghost">Bekijk beschikbaarheid</span>
              <span className="ww-link">Alle verblijven <IconArrow size={13} /></span>
              <span className="ww-chip">Sauna</span>
              <span className="ww-chip ww-chip--on">Aan het water</span>
            </div>
          </div>
          <div className="ww-specimen">
            <div className="ww-specimen__label">Iconen · 1,3 px lijn, altijd currentColor</div>
            <div className="ww-row" style={{ gap: 34, color: "var(--forest)" }}>
              <IconSpace /><IconNature /><IconComfort /><IconPersonal /><IconTide />
            </div>
          </div>
          <div className="ww-mt-l">
            <div className="ww-specimen__label">Accommodatiekaart · dezelfde component op elke pagina</div>
            <div className="ww-grid ww-mt-s">
              {PROPERTIES.slice(0, 3).map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>
          </div>
        </div>
      </section>

      {/* ── Architectuur ─────────────────────────────────────────── */}
      <section className="ww-section ww-section--tight">
        <div className="ww-wrap">
          <SectionHead eyebrow="Techniek" title="Wad & Weids voorop, MyTourist als motor" text="De website is het merk richting de gast. MyTourist is het systeem erachter: beschikbaarheid, tarieven en reserveringen. Eén adapter verbindt de twee." />
          <div className="ww-code">{`Wad & Weids (Next.js)
   │
   │  MyTouristClient  ── src/lib/wadweids/mytourist.ts
   │      listProperties()   getProperty()
   │      getAvailability()  quote()
   │      search()           createBooking()
   ▼
MyTourist PMS
   beschikbaarheid · dynamische tarieven · reserveringen · gasten`}</div>

          <div className="ww-flow ww-mt-l">
            {[
              ["Woninggegevens", "Naam, capaciteit, vaste kosten en minimumverblijf komen uit MyTourist en worden 's nachts gesynchroniseerd."],
              ["Beschikbaarheid en prijs", "Per verzoek live opgehaald, nooit gecachet langer dan een minuut. De kalender in de boekingsmodule tekent wat het PMS zegt."],
              ["Content en fotografie", "Teksten, beelden en bestemmingen blijven bij Wad & Weids: dat is het merk, en dat hoort niet in een PMS."],
              ["Reserveringen", "createBooking() schrijft de optie weg in MyTourist en geeft het reserveringsnummer terug; de betaallink volgt uit dezelfde flow."],
            ].map(([titel, tekst], i) => (
              <div className="ww-flowstep" key={titel}>
                <span className="ww-flowstep__n">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <strong style={{ fontFamily: "var(--serif)", fontSize: "1.2rem", fontWeight: 500 }}>{titel}</strong>
                  <p>{tekst}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Schaalbaarheid ───────────────────────────────────────── */}
      <section className="ww-section ww-section--tight ww-section--sand">
        <div className="ww-wrap">
          <SectionHead eyebrow="Schaalbaarheid" title="Van acht naar vijftig woningen" text="Elke pagina rendert wat er in de collectie zit. Groeien betekent records toevoegen, geen pagina's ontwerpen." />
          <div style={{ overflowX: "auto" }}>
          <table className="ww-table">
            <thead>
              <tr><th>Onderdeel</th><th>Vandaag</th><th>Bij 50 woningen</th></tr>
            </thead>
            <tbody>
              <tr><td>Woning toevoegen</td><td><code>PROPERTIES</code> uitbreiden</td><td>Record uit het PMS; detailpagina ontstaat vanzelf</td></tr>
              <tr><td>Detailpagina</td><td>Eén sjabloon</td><td>Hetzelfde sjabloon, statisch gegenereerd per slug</td></tr>
              <tr><td>Zoeken</td><td>Filteren in de browser</td><td>Filterset gaat naar MyTourist; resultaten gepagineerd</td></tr>
              <tr><td>Bestemmingen</td><td>Zes regio&apos;s</td><td>Regio toevoegen = één record, tegelgrid vult zich</td></tr>
              <tr><td>Filters</td><td>Vaste sleutels per voorziening</td><td>Nieuwe voorziening = één regel in <code>AMENITIES</code></td></tr>
              <tr><td>Prijzen</td><td>Dynamisch per seizoen en weekend</td><td>Volledig uit MyTourist, inclusief staffels en kortingen</td></tr>
              <tr><td>Favorieten</td><td>In de browser bewaard</td><td>Aan het gastaccount, zichtbaar in e-mail en app</td></tr>
            </tbody>
          </table>
          </div>

          <div className="ww-row ww-mt-l">
            <Link href="/wad-weids" className="ww-btn ww-btn--primary">Naar de homepage <IconArrow size={14} /></Link>
            <Link href="/wad-weids/mobiel" className="ww-btn ww-btn--ghost">Mobiele weergave</Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
