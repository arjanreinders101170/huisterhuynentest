"use client";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { Icoon } from "@/components/Icoon";
import { DirectBookingUSP } from "@/components/DirectBookingUSP";
import { andereLodgePagina, VERTROUWEN, PRAKTISCH, PRAKTISCH_NOOT, HUISREGELS,
         HUISREGELS_EXTRA, ANNULEREN, type LodgePaginaData } from "@/data/lodge-paginas";
import { PRICE_FROM_EUR } from "@/lib/site";
import { LODGE_PHONE_DISPLAY, LODGE_WHATSAPP_URL } from "@/data/lodge";

/* Zelfde laadstrategie als op de homepage: het formulier leest de query en
 * luistert naar de lodgekeuze, dus het heeft geen serverrender nodig. */
const RequestForm = dynamic(() => import("@/components/RequestForm"), {
  ssr: false,
  loading: () => <div className="lpx-form-laden">Formulier laden…</div>,
});

const NAV: { label: string; href: string }[] = [
  { label: "Onze lodges", href: "/#lodges" },
  { label: "Omgeving", href: "/omgeving" },
  { label: "Inspiratie", href: "/blog" },
  { label: "Veelgestelde vragen", href: "/faq" },
];

function Wordmark() {
  return (
    <Link href="/" className="lpx-merk" aria-label="Huis ter Huynen — naar de homepage">
      <span className="lpx-merk-naam">Huis ter Huynen</span>
      <span className="lpx-merk-regel">
        <span className="lpx-merk-streep" aria-hidden />
        Boutique lodges
        <span className="lpx-merk-streep" aria-hidden />
      </span>
    </Link>
  );
}

export function LodgeKop({ data }: { data: LodgePaginaData }) {
  const ander = andereLodgePagina(data.key);

  /* Onder de 1000px staat er geen kolom meer naast de tekst, en dan duwt
   * het formulier — met keuzes, datums en zes velden een scherm hoog —
   * de hele pagina omlaag. Wie wil lezen scrollt er eerst langs, wie wil
   * aanvragen scrollt ernaartoe. Daar hoort het dus niet in de pagina
   * maar erachter: de knop staat bovenaan altijd in beeld en het paneel
   * schuift eroverheen. Op een breed scherm verandert er niets — daar is
   * die kolom juist het hele idee.
   *
   * De grens staat ook in globals.css (.lpx-aanvraag); verander ze samen. */
  const [paneelOpen, setPaneelOpen] = useState(false);
  const [alleOpen, setAlleOpen] = useState(false);
  const sluitKnop = useRef<HTMLButtonElement>(null);
  const kwamVan = useRef<HTMLElement | null>(null);

  const sluit = useCallback(() => {
    setPaneelOpen(false);
    kwamVan.current?.focus();
  }, []);

  const opCta = useCallback((e: React.MouseEvent) => {
    // Breed scherm: de ankersprong doet wat hij altijd deed.
    if (!window.matchMedia("(max-width: 1000px)").matches) return;
    e.preventDefault();
    kwamVan.current = e.currentTarget as HTMLElement;
    setPaneelOpen(true);
  }, []);

  useEffect(() => {
    if (!paneelOpen) return;
    sluitKnop.current?.focus();
    const vorige = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const opToets = (e: KeyboardEvent) => { if (e.key === "Escape") sluit(); };
    /* Wie het paneel openzet en dan zijn scherm draait naar een breedte
     * waar de kolom weer past, houdt anders een vastgezette pagina over. */
    const breed = window.matchMedia("(min-width: 1001px)");
    const opBreed = (e: MediaQueryListEvent) => { if (e.matches) sluit(); };

    document.addEventListener("keydown", opToets);
    breed.addEventListener("change", opBreed);
    return () => {
      document.body.style.overflow = vorige;
      document.removeEventListener("keydown", opToets);
      breed.removeEventListener("change", opBreed);
    };
  }, [paneelOpen, sluit]);

  return (
    <>
      {/* ── Bovenbalk ─────────────────────────────────────────────── */}
      <header className="lpx-kop">
        <div className="lpx-kop-binnen">
          <Wordmark />
          <nav className="lpx-nav" aria-label="Hoofdmenu">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="lpx-nav-link">{n.label}</Link>
            ))}
          </nav>
          <div className="lpx-kop-rechts">
            <a href="/de" hrefLang="de" className="lpx-taal" aria-label="Auf Deutsch wechseln">
              <span aria-hidden>NL</span>
              <span aria-hidden className="lpx-taal-punt">·</span>
              <span>DE</span>
            </a>
            <a href="#aanvraag" className="lpx-kop-cta" onClick={opCta}>
              <span className="lpx-cta-lang">Bekijk beschikbaarheid</span>
              <span className="lpx-cta-kort">Beschikbaarheid</span>{" "}
              <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero: één grote foto plus een raster van vier ─────────── */}
      <section className="lpx-hero" aria-label={`Foto's van ${data.naam}`}>
        <div className="lpx-hero-groot">
          <Image
            src={data.hero.src}
            alt={data.hero.alt}
            fill
            priority
            quality={60}
            sizes="(max-width: 900px) 100vw, 58vw"
            style={{ objectFit: "cover", objectPosition: data.hero.focus || "center" }}
          />
          <div className="lpx-hero-scrim" aria-hidden />
          <div className="lpx-hero-tekst">
            <div className="lpx-eyebrow lpx-eyebrow--licht">{data.eyebrow}</div>
            <h1 className="lpx-h1">{data.h1}</h1>
            <p className="lpx-hero-sub">{data.tagline}</p>
            <ul className="lpx-cijfers">
              {data.kerncijfers.map((c) => (
                <li key={c.tekst}>
                  <Icoon naam={c.icoon} kleur="#E7D9B4" maat={19} />
                  {c.tekst}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="lpx-hero-raster">
          {data.raster.map((f) => (
            <div key={f.src + f.alt} className="lpx-hero-tegel">
              <Image
                src={f.src}
                alt={f.alt}
                fill
                quality={55}
                sizes="(max-width: 900px) 50vw, 21vw"
                style={{ objectFit: "cover", objectPosition: f.focus || "center" }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Kruimelpad ────────────────────────────────────────────── */}
      <nav aria-label="Kruimelpad" className="lpx-kruimel">
        <ol>
          <li><Link href="/">Home</Link></li>
          <li aria-hidden>›</li>
          <li><Link href="/#lodges">Onze lodges</Link></li>
          <li aria-hidden>›</li>
          <li aria-current="page">{data.naam}</li>
        </ol>
      </nav>

      {/* ── Inhoud links, aanvraag rechts ─────────────────────────── */}
      <div className="lpx-body">
        <main className="lpx-inhoud">
          <p className="lpx-lead">{data.tagline}</p>
          <p className="lpx-intro">{data.intro}</p>

          <ul className="lpx-voorzieningen">
            {data.voorzieningen.map((v) => (
              <li key={v.tekst}>
                <Icoon naam={v.icoon} kleur="#8A6F2E" maat={19} />
                {v.tekst}
              </li>
            ))}
          </ul>

          <ul className="lpx-labels">
            {data.labels.map((l) => <li key={l}>{l}</li>)}
          </ul>

          <hr className="lpx-scheiding" />

          <section aria-labelledby="lpx-inventaris">
            <h2 id="lpx-inventaris" className="lpx-h2">Wat er in de lodge zit</h2>
            <p className="lpx-alinea">
              {data.naam} is van alle gemakken voorzien. Hieronder staat wat er werkelijk in
              staat, zodat u niet hoeft te mailen om te weten of u een koffiezetapparaat moet
              meenemen.
            </p>
            {/* Vier, niet tien. Een vinkje zegt alleen "dit is er ook", en
              * tien gelijkwaardige regels laten het bijzondere wegvallen
              * tussen de vaatwasser en de waterkoker. */}
            <ul className="lpx-toppers">
              {data.toppers.map((t) => (
                <li key={t.tekst}>
                  <span className="lpx-topper-ic">
                    <Icoon naam={t.icoon} kleur="#2F4F3E" maat={20} />
                  </span>
                  <span className="lpx-topper-tekst">{t.tekst}</span>
                </li>
              ))}
            </ul>
            <div className="lpx-knoppen">
              {/* Klapt de lijst hieronder open in plaats van de bezoeker
                * naar een andere pagina te sturen, waar hij de rest van dit
                * verhaal kwijt is. */}
              <button
                type="button"
                className="lpx-knop-rand"
                aria-expanded={alleOpen}
                aria-controls="lpx-alle"
                onClick={() => setAlleOpen((o) => !o)}
              >
                {alleOpen ? "Verberg faciliteiten" : "Bekijk alle faciliteiten"}
                <svg className="lpx-knop-chevron" width="16" height="16" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                     strokeLinejoin="round" aria-hidden focusable="false">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              <Link href={ander.canoniekePagina} className="lpx-knop-tekst">
                Of vergelijk met {ander.naam}
              </Link>
            </div>
            {alleOpen && (
              <div className="lpx-alle" id="lpx-alle">
                {data.faciliteiten.map((g) => (
                  <div key={g.groep}>
                    <p className="lpx-alle-groep">{g.groep}</p>
                    <ul className="lpx-alle-items">
                      {g.items.map((it) => (
                        <li key={it.tekst}>
                          <Icoon naam={it.icoon} kleur="#8A6F2E" maat={17} />
                          {it.tekst}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>

        </main>

        {/* De aanvraagkolom schuift op een breed scherm over de onderrand
         * van de hero heen en blijft daarna meelopen; op een smal scherm
         * valt hij gewoon onder de tekst. Zie .lpx-aanvraag in globals.css. */}
        <div
          className={`lpx-waas${paneelOpen ? " lpx-waas--open" : ""}`}
          onClick={sluit}
          hidden={!paneelOpen}
        />

        <aside
          className={`lpx-aanvraag${paneelOpen ? " lpx-aanvraag--open" : ""}`}
          id="aanvraag"
          aria-label="Aanvraagformulier"
          {...(paneelOpen ? { role: "dialog", "aria-modal": true } : {})}
        >
          <div className="lpx-aanvraag-kaart">
            <div className="lpx-paneel-balk">
              <span className="lpx-paneel-titel">Beschikbaarheid aanvragen</span>
              <button type="button" className="lpx-paneel-sluit" onClick={sluit}
                      ref={sluitKnop} aria-label="Sluiten">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="1.8" strokeLinecap="round" aria-hidden focusable="false">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            {/* De prijs staat waar eerst de kop stond: dat is het eerste
              * wat een bezoeker in dit blok zoekt, en "Stel je aanvraag
              * samen" vertelde hem alleen wat hij al zag. Het bedrag komt
              * uit PRICE_FROM_EUR, zodat het niet op twee plekken los van
              * elkaar kan verouderen. */}
            {/* Bewust geen kop. Als h2 stond de prijs tussen "Wat er in de
              * lodge zit" en "Het uitzicht en de hottub" in de kopstructuur
              * van de pagina — een kop die geen sectie opent. Het blok zelf
              * heeft al een naam via de aria-label van de aside. */}
            <p className="lpx-prijs">
              <span className="lpx-prijs-label">Vanaf</span>
              <span className="lpx-prijs-bedrag">&euro;&nbsp;{PRICE_FROM_EUR},-</span>{" "}
              <span className="lpx-prijs-eenheid">per nacht</span>
            </p>
            <RequestForm voorkeur={data.lodgeParam} />
            <DirectBookingUSP tone="onLight" size={11.5} style={{ marginTop: 14, justifyContent: "center" }} />
          </div>
        </aside>
      </div>
    </>
  );
}

/* ── De praktische kaart ──
 * Praktische informatie, huisregels en annuleren stonden als drie losse
 * blokken onder elkaar, elk met een eigen streep erboven. Drie objecten
 * die hetzelfde zeggen — "dit is het kleine lettertje" — lezen rustiger
 * als één object met lijnen erbinnen.
 *
 * Het staat op de pagina niet in de kolom naast het formulier maar onder
 * het verhaal: het kleine lettertje komt pas aan bod als iemand overtuigd
 * is, daarvóór staat het in de weg. */
export function PraktischeKaart() {
  return (
  <section className="lp-pad lp-artikel lpx-praktisch-band">
  <div>
  <div className="lpx-praktisch">
    <section aria-labelledby="lpx-praktisch">
      <h2 id="lpx-praktisch" className="lpx-h3">Praktische informatie</h2>
      <dl className="lpx-gegevens">
        {PRAKTISCH.map((r) => (
          <Fragment key={r.label}>
            <dt>{r.label}</dt>
            <dd>{r.waarde}</dd>
          </Fragment>
        ))}
      </dl>
      <p className="lpx-kaart-noot">{PRAKTISCH_NOOT}</p>
    </section>

    <section aria-labelledby="lpx-huisregels">
      <h2 id="lpx-huisregels" className="lpx-h3">Huisregels</h2>
      <ul className="lpx-regels">
        {HUISREGELS.map((r) => (
          <li key={r.tekst}>
            <Icoon naam={r.icoon} kleur="#8A6F2E" maat={15} />
            {r.tekst}
          </li>
        ))}
      </ul>
      <p className="lpx-subkop">Aanvullende huisregels</p>
      <ul className="lpx-stippen">
        {HUISREGELS_EXTRA.map((r) => <li key={r}>{r}</li>)}
      </ul>
    </section>

    <section aria-labelledby="lpx-annuleren">
      <h2 id="lpx-annuleren" className="lpx-h3">Annuleren</h2>
      <ul className="lpx-staffel">
        {ANNULEREN.map((a) => (
          <li key={a.periode}>
            <span className="lpx-staffel-periode">{a.periode}</span>
            {a.bij && <span className="lpx-staffel-bij">{a.bij}</span>}
            <span className={`lpx-staffel-deel${a.niets ? " lpx-staffel-deel--niets" : ""}`}>
              {a.deel}
            </span>
          </li>
        ))}
      </ul>
      <p className="lpx-kaart-noot">
        Omboeken kan tot 30 dagen voor aankomst, na goedkeuring en afhankelijk van
        beschikbaarheid; daarvoor geldt € 25 wijzigingskosten. De volledige voorwaarden
        staan in de <Link href="/terms" className="lpx-link">algemene voorwaarden</Link>.
      </p>
    </section>

    {/* Het pictogram zit ín de link: het is de uitnodiging, niet een
      * plaatje ernaast. Het woord "App" is daarmee overbodig — maar
      * dan draagt alleen het beeld nog die betekenis, en een
      * schermlezer ziet geen beeld. Vandaar het aria-label. */}
    <p className="lpx-vraag">
      Staat er iets niet bij?{" "}
      <a
        href={LODGE_WHATSAPP_URL}
        className="lpx-wa"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Stuur een WhatsApp-bericht naar ${LODGE_PHONE_DISPLAY}`}
      >
        <Icoon naam="whatsapp" kleur="#2F4F3E" maat={18} />
        <b>{LODGE_PHONE_DISPLAY}</b>
      </a>
    </p>
  </div>
  </div>
  </section>
  );
}

/* ── De vertrouwensbalk ──
 * Sluit de inhoud af, net boven de veelgestelde vragen. */
export function Vertrouwensbalk() {
  return (
  <section className="lpx-vertrouwen" aria-label="Waarom Huis ter Huynen">
    <ul>
      {VERTROUWEN.map((v) => (
        <li key={v.tekst}>
          <Icoon naam={v.icoon} kleur="#8A6F2E" maat={20} />
          {v.tekst}
        </li>
      ))}
    </ul>
    <p className="lpx-handschrift">
      Twee lodges op de heide,<br />elk met een eigen hottub.
    </p>
  </section>
  );
}
