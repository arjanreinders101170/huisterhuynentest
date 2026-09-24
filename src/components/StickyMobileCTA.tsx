"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { reserveerHref } from "@/lib/site";
import { stickyBlogCta } from "@/lib/blog-cta";
import { LODGE_PAGINAS } from "@/data/lodge-paginas";

/* Sticky mobile booking bar. Hidden on desktop (see globals.css media query).
 * Renders a spacer so page content isn't hidden behind the fixed bar on mobile.
 *
 * De CTA belooft niet meer dan wat er achter de klik zit: de bezoeker komt op
 * het aanvraagformulier, niet op een afrekenpagina. "Bekijk beschikbaarheid"
 * is dezelfde belofte als op de landingspagina's (LandingTemplate → ctaAvail)
 * en in i18n/nl.ts → checkAvailability.
 *
 * De balk hangt in de root-layout en dekt dus ook /de/*; de taal komt daarom
 * uit het pad in plaats van uit een prop die niemand meegeeft.
 *
 * De balk stond altijd in beeld, ook bovenaan de pagina naast de hero-knop
 * met hetzelfde doel, en de cookiebalk hing er nog boven: drie lagen die
 * samen bijna het halve scherm namen. Nu verschijnt hij pas als de hero-knop
 * (data-hero-cta) boven uit beeld is gescrold, en zolang de cookiekeuze open
 * staat houdt globals.css hem verborgen (html[data-consent-open]). De
 * voordelen staan al onder de hero-knop; de balk is daarom één regel:
 * vanafprijs links, knop rechts. */

const COPY = {
  nl: { cta: "Bekijk beschikbaarheid →", href: "/#reserveren" },
  de: { cta: "Verfügbarkeit prüfen →", href: "/de#verfugbarkeit" },
} as const;

/* Zelfde vanafprijs als op de landingspagina's (landing-seed → PRICE). */
const PRIJS = {
  nl: { van: "vanaf", bedrag: "€ 165", per: "per nacht" },
  de: { van: "ab", bedrag: "165 €", per: "pro Nacht" },
} as const;

/* Pagina's zonder hero-knop: toon de balk na ruim een halve schermhoogte. */
const DREMPEL_ZONDER_HERO = 0.6;

function useNaHeroKnop(pathname: string | null) {
  const [zichtbaar, setZichtbaar] = useState(false);
  useEffect(() => {
    const knop = document.querySelector<HTMLElement>("[data-hero-cta]");
    if (knop && "IntersectionObserver" in window) {
      // Alleen zichtbaar als de knop boven uit beeld is, niet als hij nog
      // onder de vouw staat.
      const io = new IntersectionObserver(([e]) => {
        setZichtbaar(!e.isIntersecting && e.boundingClientRect.top < 0);
      });
      io.observe(knop);
      return () => io.disconnect();
    }
    const sync = () => setZichtbaar(window.scrollY > window.innerHeight * DREMPEL_ZONDER_HERO);
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    return () => window.removeEventListener("scroll", sync);
  }, [pathname]);
  return zichtbaar;
}

export function StickyMobileCTA({ bookingHref, locale }: { bookingHref?: string; locale?: "nl" | "de" }) {
  const pathname = usePathname();
  const taal = locale ?? (pathname === "/de" || pathname?.startsWith("/de/") ? "de" : "nl");
  const copy = COPY[taal];
  // De balk hangt in de root-layout en krijgt van niemand een slug mee; het pad
  // is hier dus de enige bron voor de context van de pagina waar hij op staat.
  // Op een pagina zonder eigen context valt reserveerHref terug op /#reserveren.
  //
  // Blogs zijn het best presterende kanaal van de site (CTR 3,31% tegen 0,25%)
  // en linkten nauwelijks door. Heeft een artikel een eigen commerciële CTA,
  // dan volgt de balk die: bij het wellnessweekend-artikel is de wellnesspagina
  // een betere volgende stap dan een leeg boekingsformulier.
  const blogSlug = taal === "nl" && pathname?.startsWith("/blog/") ? pathname.slice("/blog/".length) : null;
  const blog = blogSlug ? stickyBlogCta(blogSlug) : null;
  const doel = bookingHref ?? blog?.href ?? (taal === "de" ? copy.href : reserveerHref(pathname?.replace(/^\//, "") || undefined));
  const label = blog?.knop ?? copy.cta;
  const prijs = PRIJS[taal];
  const zichtbaar = useNaHeroKnop(pathname);

  /* Niet op de lodgepagina's. Daar staat de knop naar het aanvraagpaneel in
   * de bovenbalk, en die blijft staan bij het scrollen — een tweede vaste
   * knop onderaan zegt hetzelfde en eet schermruimte.
   *
   * Bewust ná useNaHeroKnop en niet ervoor: die hook kwam er bij het
   * samenvoegen met main bij, en een return ertussen maakt het aantal hooks
   * afhankelijk van het pad. React klapt er dan op uit zodra je van een
   * lodgepagina naar een andere pagina navigeert. */
  if (pathname && LODGE_PAGINAS.some((l) => l.canoniekePagina === pathname)) return null;

  return (
    <>
      <div className="hth-sticky-cta-spacer" aria-hidden />
      <div
        className="hth-sticky-cta"
        data-zichtbaar={zichtbaar ? "ja" : "nee"}
        aria-hidden={!zichtbaar}
        style={{
          position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 60,
          alignItems: "center", gap: 12,
          padding: "8px 12px calc(8px + env(safe-area-inset-bottom))",
          background: "rgba(20,18,16,.97)", borderTop: "1px solid rgba(180,154,94,.4)",
          fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
        }}
      >
        {/* Een blog-CTA (bijv. de nieuwsbrief) is geen boeking; daar geen prijs. */}
        {!blog && <div style={{ flex: "none", fontSize: 11, lineHeight: 1.25, color: "rgba(255,255,255,.7)" }}>
          {prijs.van}
          <strong style={{ display: "block", fontSize: 15, color: "white", fontWeight: 700 }}>{prijs.bedrag}</strong>
          {prijs.per}
        </div>}
        <Link
          href={doel}
          tabIndex={zichtbaar ? undefined : -1}
          style={{
            flex: 1, minWidth: 0, textAlign: "center", padding: "13px 8px", borderRadius: 10,
            background: "#B49A5E", color: "#1A2E24", fontWeight: 700, fontSize: 15,
            textDecoration: "none",
          }}
        >
          {label}
        </Link>
      </div>
    </>
  );
}
