import Link from "next/link";

/* ── Woordmerk ────────────────────────────────────────────────────────
   WAD & WEIDS in kapitalen met ruime letterafstand; de ampersand houdt
   twee landschappen bij elkaar en staat daarom bewust rustiger.

   Het beeldmerk is een horizon in een staand kader: een strakke waterlijn,
   een zachte duinrand eronder en één wadpaal die de lijn doorbreekt.
   Geen huisje, geen zon — wel meteen kust, ruimte en landschap. */
export function LogoMark({ size = 38 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <rect x="1.6" y="1.6" width="36.8" height="36.8" rx="9" stroke="currentColor" strokeOpacity=".3" strokeWidth="1.1" />
      <path d="M8 18.4h24" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M8 23.6c3.6 0 4.6-3 8.2-3s4.4 3 7.9 3c2.4 0 3.6-1.4 7.9-1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeOpacity=".75" />
      <path d="M8 29.2h24" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeOpacity=".4" />
      <path d="M25.6 13.6v9.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ size = "md", href = "/wad-weids", tagline = false }: {
  size?: "md" | "lg"; href?: string;
  /** De regel onder het woordmerk staat in de footer en op de merkpagina;
   *  in de navigatie zou hij de balk onnodig breed maken. */
  tagline?: boolean;
}) {
  return (
    <Link href={href} className={`ww-logo${size === "lg" ? " ww-logo--lg" : ""}`} aria-label="Wad &amp; Weids — naar de homepage">
      <span className="ww-logo__mark"><LogoMark size={size === "lg" ? 54 : 38} /></span>
      <span className="ww-logo__type">
        <span className="ww-logo__word">Wad <em>&amp;</em> Weids</span>
        {tagline && <span className="ww-logo__tag">Luxe verblijven in de mooiste natuur van Nederland</span>}
      </span>
    </Link>
  );
}
