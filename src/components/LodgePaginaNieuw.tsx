"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { Icoon } from "@/components/Icoon";
import { DirectBookingUSP } from "@/components/DirectBookingUSP";
import { andereLodgePagina, VERTROUWEN, type LodgePaginaData } from "@/data/lodge-paginas";
import { PRICE_FROM_EUR } from "@/lib/site";
import { LODGE_PHONE_DISPLAY, LODGE_PHONE_E164 } from "@/data/lodge";

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

export function LodgePaginaNieuw({ data }: { data: LodgePaginaData }) {
  const ander = andereLodgePagina(data.key);

  return (
    <div className="lpx">
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
            <a href="#aanvraag" className="lpx-kop-cta">
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
            <ul className="lpx-inventaris">
              {data.inventaris.map((i) => (
                <li key={i}>
                  <span className="lpx-vink" aria-hidden>✓</span>
                  {i}
                </li>
              ))}
            </ul>
            <div className="lpx-knoppen">
              <Link href={data.canoniekePagina} className="lpx-knop-rand">
                Bekijk alle faciliteiten <span aria-hidden>→</span>
              </Link>
              <Link href={ander.canoniekePagina} className="lpx-knop-tekst">
                Of vergelijk met {ander.naam}
              </Link>
            </div>
          </section>

          <hr className="lpx-scheiding" />

          <section aria-labelledby="lpx-prijs">
            <h2 id="lpx-prijs" className="lpx-h2">Prijs en verblijfsvorm</h2>
            <p className="lpx-alinea">
              De prijs begint bij €{PRICE_FROM_EUR} per nacht voor de hele lodge, niet per persoon.
              Losse nachten verhuren wij niet: er zijn twee wisseldagen — maandag en vrijdag — en
              daarmee drie vormen: midweek (ma&nbsp;–&nbsp;vr), weekend (vr&nbsp;–&nbsp;zo) of de
              hele week (ma&nbsp;–&nbsp;zo). Boekingskosten rekenen wij niet, omdat u rechtstreeks
              bij de eigenaar boekt.
            </p>
            <p className="lpx-alinea">
              Liever even overleggen? Bel of app{" "}
              <a href={`tel:${LODGE_PHONE_E164}`} className="lpx-link">{LODGE_PHONE_DISPLAY}</a>.
            </p>
          </section>
        </main>

        {/* De aanvraagkolom schuift op een breed scherm over de onderrand
         * van de hero heen en blijft daarna meelopen; op een smal scherm
         * valt hij gewoon onder de tekst. Zie .lpx-aanvraag in globals.css. */}
        <aside className="lpx-aanvraag" id="aanvraag" aria-label="Aanvraagformulier">
          <div className="lpx-aanvraag-kaart">
            {/* De prijs staat waar eerst de kop stond: dat is het eerste
              * wat een bezoeker in dit blok zoekt, en "Stel je aanvraag
              * samen" vertelde hem alleen wat hij al zag. Het bedrag komt
              * uit PRICE_FROM_EUR, zodat het niet op twee plekken los van
              * elkaar kan verouderen. */}
            <h2 className="lpx-prijs">
              <span className="lpx-prijs-label">Vanaf</span>
              <span className="lpx-prijs-bedrag">&euro;&nbsp;{PRICE_FROM_EUR},-</span>
              <span className="lpx-prijs-eenheid">per nacht</span>
            </h2>
            <RequestForm voorkeur={data.lodgeParam} />
            <DirectBookingUSP tone="onLight" size={11.5} style={{ marginTop: 14, justifyContent: "center" }} />
          </div>
        </aside>
      </div>

      {/* ── Vertrouwensbalk ───────────────────────────────────────── */}
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
    </div>
  );
}
