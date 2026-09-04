import Link from "next/link";
import type { Destination } from "@/lib/wadweids/types";
import { PROPERTIES } from "@/lib/wadweids/content";
import { IconArrow, IconComfort, IconNature, IconPersonal, IconSpace } from "./Icons";

/* Sectiekop: kop links, toelichting en actie rechts. */
export function SectionHead({ eyebrow, title, text, action }: {
  eyebrow?: string; title: string; text?: string;
  action?: { label: string; href: string };
}) {
  return (
    <header className="ww-sectionhead">
      <div>
        {eyebrow && <span className="ww-eyebrow">{eyebrow}</span>}
        <h2 className="ww-h2">{title}</h2>
      </div>
      <div>
        {text && <p>{text}</p>}
        {action && (
          <Link href={action.href} className="ww-link ww-mt-s">
            {action.label} <IconArrow size={13} />
          </Link>
        )}
      </div>
    </header>
  );
}

/* ── Bestemmingstegel ────────────────────────────────────────────────
   Telt zelf hoeveel woningen er in de regio staan; groeit de collectie,
   dan klopt het getal vanzelf. */
export function DestinationTile({ destination }: { destination: Destination }) {
  const count = PROPERTIES.filter((p) => p.destination === destination.slug).length;
  const modifier = destination.tile === "wide" ? " ww-tile--wide" : destination.tile === "tall" ? " ww-tile--tall" : "";
  return (
    <Link href={`/wad-weids/bestemmingen/${destination.slug}`} className={`ww-tile${modifier}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={destination.image} alt={destination.name} loading="lazy" />
      <div className="ww-tile__body">
        <h3 className="ww-tile__name">{destination.name}</h3>
        <span className="ww-tile__count">
          {count > 0 ? `${count} ${count === 1 ? "verblijf" : "verblijven"}` : "Binnenkort"} · {destination.region}
        </span>
      </div>
    </Link>
  );
}

/* ── Kernwaarden ─────────────────────────────────────────────────── */
const VALUES = [
  { icon: IconSpace, title: "Ruimte", text: "Ruimte om echt even weg te zijn. Vrijstaand, met de horizon als buur." },
  { icon: IconNature, title: "Natuur", text: "Midden in bijzondere landschappen: wad, duin, heide en kwelder." },
  { icon: IconComfort, title: "Comfort", text: "Vakantiehuizen waar comfort en kwaliteit vanzelfsprekend zijn." },
  { icon: IconPersonal, title: "Persoonlijk", text: "Geen massaal vakantiepark, maar een zorgvuldig geselecteerde collectie." },
];

export function ValueProps() {
  return (
    <div className="ww-values">
      {VALUES.map(({ icon: Icon, title, text }) => (
        <div className="ww-value" key={title}>
          <div className="ww-value__icon"><Icon /></div>
          <h3>{title}</h3>
          <p>{text}</p>
        </div>
      ))}
    </div>
  );
}

/* ── Sfeerband ───────────────────────────────────────────────────── */
export function LifestyleBand({ image, alt, eyebrow, title, text, cta }: {
  image: string; alt: string; eyebrow?: string; title: string; text?: string;
  cta: { label: string; href: string };
}) {
  return (
    <section className="ww-band">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt={alt} loading="lazy" />
      <div className="ww-band__body">
        {eyebrow && <span className="ww-eyebrow ww-eyebrow--light">{eyebrow}</span>}
        <h2 className="ww-display ww-mt-s">{title}</h2>
        {text && <p>{text}</p>}
        <Link href={cta.href} className="ww-btn ww-btn--light ww-btn--lg">
          {cta.label} <IconArrow size={14} />
        </Link>
      </div>
    </section>
  );
}
