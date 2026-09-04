import Link from "next/link";
import { DESTINATIONS } from "@/lib/wadweids/content";
import { Logo } from "./Logo";

/* De footer haalt de bestemmingen uit dezelfde bron als de rest van de
   site: een nieuwe regio verschijnt hier vanzelf. */
export function SiteFooter() {
  return (
    <footer className="ww-footer" id="contact">
      <div className="ww-wrap">
        <div className="ww-footer__top">
          <div>
            <Logo tagline />
            <p className="ww-footer__intro">
              Een kleine collectie vakantiehuizen op plekken waar de horizon nog vrij is.
              Persoonlijk verhuurd, zorgvuldig onderhouden, direct te boeken.
            </p>
            <form className="ww-newsletter" aria-label="Nieuwsbrief">
              <input type="email" placeholder="Je e-mailadres" aria-label="E-mailadres" />
              <button type="button" className="ww-btn ww-btn--light">Aanmelden</button>
            </form>
          </div>
          <div>
            <h4>Bestemmingen</h4>
            <ul>
              {DESTINATIONS.map((d) => (
                <li key={d.slug}>
                  <Link href={`/wad-weids/bestemmingen/${d.slug}`}>{d.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Platform</h4>
            <ul>
              <li><Link href="/wad-weids/verblijven">Alle verblijven</Link></li>
              <li><Link href="/wad-weids#waarom">Over Wad &amp; Weids</Link></li>
              <li><Link href="/wad-weids/merk">Merk &amp; designsysteem</Link></li>
              <li><Link href="/wad-weids/mobiel">Mobiele weergave</Link></li>
              <li><Link href="/wad-weids#inspiratie">Inspiratie</Link></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li>Reserveringen: 058 — 000 00 00</li>
              <li>hallo@wadenweids.nl</li>
              <li>Ma t/m vr 09.00 – 17.30 uur</li>
              <li>Zaterdag 10.00 – 14.00 uur</li>
            </ul>
            <p style={{ marginTop: 22, fontSize: ".88rem", lineHeight: 1.7 }}>
              Je boekt rechtstreeks bij de eigenaar. Geen tussenpartij, geen servicekosten.
            </p>
          </div>
        </div>
        <div className="ww-footer__bottom">
          <span>© {new Date().getFullYear()} Wad &amp; Weids — visuele mock-up</span>
          <span>Beschikbaarheid, tarieven en reserveringen via MyTourist</span>
          <span>Algemene voorwaarden · Privacy · Cookies</span>
        </div>
      </div>
    </footer>
  );
}
