"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { IconClose, IconMenu, IconSearch, IconUser } from "./Icons";

/* De navigatie van het platform. Eén plek waar het menu staat; elke
   nieuwe bestemming of pagina komt hier binnen en verschijnt overal. */
const NAV = [
  { label: "Verblijven", href: "/wad-weids/verblijven" },
  { label: "Bestemmingen", href: "/wad-weids/bestemmingen" },
  { label: "Over Wad & Weids", href: "/wad-weids#waarom" },
  { label: "Inspiratie", href: "/wad-weids#inspiratie" },
  { label: "Contact", href: "/wad-weids#contact" },
];

/** variant "over" begint transparant over de hero; "solid" staat op een
 *  lichte pagina. Bij het scrollen wordt de balk in beide gevallen compact. */
export function SiteHeader({ variant = "solid" }: { variant?: "over" | "solid" }) {
  const [compact, setCompact] = useState(false);
  const [menu, setMenu] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenu(false), [pathname]);

  return (
    <>
      <header className={`ww-header ww-header--${variant}${compact ? " is-compact" : ""}`}>
        <div className="ww-wrap ww-wrap--wide ww-header__inner">
          <Logo />
          <nav className="ww-header__nav">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ww-header__tools">
            <Link href="/wad-weids/verblijven" className="ww-header__icon" aria-label="Zoeken">
              <IconSearch />
              <span className="ww-header__icon--label">Zoek</span>
            </Link>
            <Link href="/wad-weids#contact" className="ww-header__icon ww-hide-mobile" aria-label="Mijn boeking">
              <IconUser />
              <span className="ww-header__icon--label">Mijn boeking</span>
            </Link>
            <Link href="/wad-weids/verblijven" className="ww-btn ww-btn--primary ww-hide-mobile">
              Bekijk verblijven
            </Link>
            <button className="ww-header__burger" onClick={() => setMenu(true)} aria-label="Menu openen">
              <IconMenu />
            </button>
          </div>
        </div>
      </header>

      {menu && (
        <div className="ww-menu" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="ww-menu__top">
            <Logo />
            <button onClick={() => setMenu(false)} aria-label="Menu sluiten"><IconClose size={22} /></button>
          </div>
          <nav>
            {NAV.map((item) => (
              <Link key={item.href} href={item.href}>{item.label}</Link>
            ))}
          </nav>
          <div className="ww-menu__foot">
            <Link href="/wad-weids/verblijven" className="ww-btn ww-btn--primary ww-btn--block">Bekijk verblijven</Link>
            <Link href="/wad-weids#contact" className="ww-btn ww-btn--ghost ww-btn--block">Mijn boeking</Link>
          </div>
        </div>
      )}
    </>
  );
}
