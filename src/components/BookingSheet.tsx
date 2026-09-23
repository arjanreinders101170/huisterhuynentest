"use client";
import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/* ═══ Boekingsformulier als paneel op de telefoon ═══
 *
 * Een klik op "Bekijk beschikbaarheid" scrolde op een telefoon zichtbaar door
 * de hele pagina naar het formulier onderaan: hottub, omgeving, reviews,
 * alles schoot voorbij. Op een telefoon schuift het formulier nu als paneel
 * van onderen omhoog; de bezoeker blijft op zijn plek en staat er na het
 * sluiten weer.
 *
 * Er komt geen tweede formulier bij. Dit component zet de bestaande
 * boekingssectie (#reserveren, op /de #verfugbarkeit) in paneelstand; de
 * opmaak staat in globals.css onder html[data-sheet-open]. Zo blijven de
 * lodgekeuze (kiesLodge), de context uit ?van= en de tracking van het
 * formulier precies zoals ze waren.
 *
 * - Klik op een link naar het anker op dezelfde pagina: paneel open, geen
 *   scroll. Andere klikhandlers (kiesLodge) lopen gewoon door.
 * - Aankomst met het anker in de URL (vanaf een landingspagina): paneel open
 *   en de pagina eronder terug naar boven, zodat sluiten op de homepage zelf
 *   uitkomt en niet halverwege.
 * - Sluiten: knop, klik naast het paneel, Escape of de terugknop van de
 *   telefoon.
 *
 * Boven de 768px verandert er niets. */

const ANKERS = ["reserveren", "verfugbarkeit"];
const MOBIEL = "(max-width: 768px)";
const SLUIT_DUUR = 220;

const LABELS = {
  nl: { sluiten: "Sluiten", titel: "Reserveringsaanvraag" },
  de: { sluiten: "Schließen", titel: "Anfrage" },
} as const;

function ankerSectie(): HTMLElement | null {
  for (const id of ANKERS) {
    const el = document.getElementById(id);
    if (el) return el;
  }
  return null;
}

export function BookingSheet() {
  const pathname = usePathname();
  const taal = pathname === "/de" || pathname?.startsWith("/de/") ? "de" : "nl";
  const open = useRef<HTMLElement | null>(null);
  const plek = useRef<HTMLDivElement | null>(null);
  const vorigeFocus = useRef<HTMLElement | null>(null);
  const eigenHistorie = useRef(false);
  const knopRef = useRef<HTMLButtonElement | null>(null);

  const sluitDirect = useCallback(() => {
    const sectie = open.current;
    if (!sectie) return;
    open.current = null;
    const root = document.documentElement;
    root.setAttribute("data-sheet-closing", "");
    window.setTimeout(() => {
      root.removeAttribute("data-sheet-open");
      root.removeAttribute("data-sheet-closing");
      sectie.removeAttribute("role");
      sectie.removeAttribute("aria-modal");
      sectie.removeAttribute("aria-label");
      sectie.scrollTop = 0;
      plek.current?.remove();
      plek.current = null;
      vorigeFocus.current?.focus?.({ preventScroll: true });
    }, SLUIT_DUUR);
  }, []);

  const sluit = useCallback(() => {
    if (!open.current) return;
    // Het paneel zette een eigen stap in de historie (voor de terugknop);
    // sluiten via de knop haalt die weer weg. popstate sluit dan.
    if (eigenHistorie.current) {
      eigenHistorie.current = false;
      window.history.back();
      return;
    }
    sluitDirect();
  }, [sluitDirect]);

  const openPaneel = useCallback((viaKlik: boolean) => {
    const sectie = ankerSectie();
    if (!sectie || open.current) return;
    open.current = sectie;
    vorigeFocus.current = document.activeElement as HTMLElement | null;

    // De sectie gaat uit de paginastroom; een lege plek van dezelfde hoogte
    // voorkomt dat alles eronder omhoog springt.
    const ph = document.createElement("div");
    ph.style.height = `${sectie.offsetHeight}px`;
    ph.setAttribute("aria-hidden", "true");
    sectie.before(ph);
    plek.current = ph;

    sectie.setAttribute("role", "dialog");
    sectie.setAttribute("aria-modal", "true");
    sectie.setAttribute("aria-label", LABELS[taal].titel);
    sectie.scrollTop = 0;
    document.documentElement.setAttribute("data-sheet-open", "");

    if (viaKlik) {
      window.history.pushState({ ...window.history.state, hthSheet: true }, "");
      eigenHistorie.current = true;
    }
    window.setTimeout(() => knopRef.current?.focus({ preventScroll: true }), 50);
  }, [taal]);

  // Klik op een link naar het anker op dezelfde pagina.
  useEffect(() => {
    const opKlik = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (!window.matchMedia(MOBIEL).matches) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname) return;
      if (!ANKERS.includes(url.hash.slice(1)) || !document.getElementById(url.hash.slice(1))) return;
      // Alleen de standaardactie (scrollen/navigeren) tegenhouden; de eigen
      // onClick van de link (bijv. kiesLodge) moet nog lopen.
      e.preventDefault();
      openPaneel(true);
    };
    document.addEventListener("click", opKlik, true);
    return () => document.removeEventListener("click", opKlik, true);
  }, [openPaneel]);

  // Aankomst met het anker in de URL.
  useEffect(() => {
    if (!window.matchMedia(MOBIEL).matches) return;
    if (!ANKERS.includes(window.location.hash.slice(1))) return;
    // Het anker uit de URL halen: verversen of terug opent het paneel niet
    // opnieuw, en de browser springt er niet alsnog heen.
    const { pathname: p, search } = window.location;
    window.history.replaceState(window.history.state, "", p + search);
    openPaneel(false);
    const naarBoven = () => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    naarBoven();
    const t = window.setTimeout(naarBoven, 60);
    return () => window.clearTimeout(t);
  }, [pathname, openPaneel]);

  // Terugknop, Escape, en sluiten bij paginawissel.
  useEffect(() => {
    const opTerug = () => {
      if (!open.current) return;
      eigenHistorie.current = false;
      sluitDirect();
    };
    const opToets = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open.current) sluit();
    };
    window.addEventListener("popstate", opTerug);
    window.addEventListener("keydown", opToets);
    return () => {
      window.removeEventListener("popstate", opTerug);
      window.removeEventListener("keydown", opToets);
    };
  }, [sluit, sluitDirect]);

  useEffect(() => () => {
    // Paginawissel: de sectie verdwijnt mee, de stand van <html> niet.
    const root = document.documentElement;
    root.removeAttribute("data-sheet-open");
    root.removeAttribute("data-sheet-closing");
    plek.current?.remove();
    plek.current = null;
    open.current = null;
    eigenHistorie.current = false;
  }, [pathname]);

  const t = LABELS[taal];
  return (
    <>
      <div className="hth-sheet-backdrop" onClick={sluit} aria-hidden />
      <button ref={knopRef} type="button" className="hth-sheet-close" onClick={sluit} aria-label={t.sluiten}>
        {t.sluiten} <span aria-hidden>✕</span>
      </button>
    </>
  );
}
