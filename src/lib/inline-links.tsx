/* Inline links in redactionele tekst.
 *
 * De teksten van de landingspagina's en de blogs zijn platte strings — in de
 * seed, in de database en in de admin. Er was daardoor geen enkele manier om
 * midden in een alinea naar een andere pagina te linken; alle interne links
 * stonden in blokken onderaan de pagina. Juist een link die contextueel in de
 * lopende tekst staat, telt voor Google zwaarder dan een link die op elke
 * pagina in dezelfde footer terugkomt.
 *
 * Notatie: [ankertekst](/pad) — bewust dezelfde als Markdown, zodat de tekst
 * ook leesbaar blijft in de admin en in de seed.
 *
 * Alleen interne paden worden een link. Een href die niet met een enkele
 * slash begint (dus ook geen "//host" of "javascript:") blijft letterlijke
 * tekst: deze content komt uit de database en mag geen sink zijn voor een
 * link naar buiten.
 */

import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";

const LINK_PATROON = /\[([^\]\n]+)\]\((\/[^)\s]*)\)/g;

/** Alleen een enkele leading slash: "/pad" mag, "//host" en "/\host" niet. */
function isInternPad(href: string): boolean {
  return /^\/(?![/\\])/.test(href) || href === "/";
}

/** Zet [tekst](/pad) om in echte links; de rest blijft platte tekst. */
export function metInlineLinks(tekst: string, stijl?: CSSProperties): ReactNode {
  if (!tekst.includes("](")) return tekst;

  const delen: ReactNode[] = [];
  let laatste = 0;
  let m: RegExpExecArray | null;
  LINK_PATROON.lastIndex = 0;

  while ((m = LINK_PATROON.exec(tekst)) !== null) {
    const [volledig, label, href] = m;
    if (m.index > laatste) delen.push(tekst.slice(laatste, m.index));
    if (isInternPad(href)) {
      delen.push(
        <Link key={`${href}-${m.index}`} href={href} style={stijl}>
          {label}
        </Link>,
      );
    } else {
      delen.push(volledig);
    }
    laatste = m.index + volledig.length;
  }

  if (laatste === 0) return tekst;
  if (laatste < tekst.length) delen.push(tekst.slice(laatste));
  return delen;
}

/** Dezelfde tekst zonder de linknotatie — voor plekken waar geen HTML mag
 *  staan, zoals de FAQ-antwoorden in de JSON-LD. Zonder dit belandt
 *  "[anker](/pad)" letterlijk in de structured data. */
export function zonderInlineLinks(tekst: string): string {
  return tekst.replace(LINK_PATROON, (volledig, label: string, href: string) =>
    isInternPad(href) ? label : volledig,
  );
}
