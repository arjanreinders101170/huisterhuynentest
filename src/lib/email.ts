export function esc(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const LODGE_NAME = "Huis ter Huynen";

/* ═══════════════════════════════════════════════════════════════
   Gedeelde e-mail templates
   ───────────────────────────────────────────────────────────────
   Alle uitgaande mails gebruiken `lodgeEmail()` als basis zodat ze
   dezelfde header, kaart, foto-positie en footer hebben. Per mail
   bouw je de inhoud als array van EmailBlock-strings via de
   `*Block`-helpers hieronder.
   ═══════════════════════════════════════════════════════════════ */

export type EmailBlock = string;

/** Grijze info-kaart, bijv. voor verblijf-overzicht. */
export function infoBlock(label: string, mainLine: string, subLine?: string): EmailBlock {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F1E8;border-radius:10px;margin-bottom:20px;">
      <tr><td style="padding:18px 20px;" align="center">
        <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;color:#8A7D6A;text-transform:uppercase;letter-spacing:1px;">${label}</p>
        <p style="margin:0${subLine ? " 0 6px" : ""};font-family:Georgia,'Times New Roman',serif;font-size:18px;color:#2A2418;font-weight:bold;">${mainLine}</p>
        ${subLine ? `<p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#2F4F3E;font-weight:bold;">${subLine}</p>` : ""}
      </td></tr>
    </table>`;
}

/** Goud-getinte callout met titel + body. Optioneel een CTA-knop binnenin. */
export function calloutBlock(
  title: string,
  body: string,
  opts?: { cta?: { href: string; text: string; style?: "primary" | "secondary" }; background?: "gold" | "muted" },
): EmailBlock {
  const bg = opts?.background === "muted" ? "#F5F1E8" : "#F9F4E8";
  const cta = opts?.cta;
  const ctaHtml = cta
    ? `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;">
          <tr><td align="center" style="background:#2F4F3E;border-radius:8px;">
            <a href="${cta.href}" style="display:block;padding:12px 28px;color:#fff;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;text-align:center;">${cta.text}</a>
          </td></tr>
        </table>`
    : "";
  const padding = cta ? "20px" : "18px 20px";
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${bg};border-radius:10px;margin-bottom:20px;">
      <tr><td style="padding:${padding};">
        <p style="margin:0 0 4px;font-family:Georgia,'Times New Roman',serif;font-size:16px;font-weight:bold;color:#2A2418;">${title}</p>
        <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#8A7D6A;line-height:1.5;">${body}</p>
        ${ctaHtml}
      </td></tr>
    </table>`;
}

/** Groene vinkjes-lijst. */
export function checklist(items: string[]): EmailBlock {
  const rows = items.map(i =>
    `<tr><td style="padding:3px 0;font-family:Arial,sans-serif;font-size:13px;color:#2F4F3E;">&#10003;&ensp;${i}</td></tr>`
  ).join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">${rows}</table>`;
}

/** Kleine kaart met emoji-icoon + titel + body (gast-app teaser). */
export function teaserBlock(emoji: string, title: string, body: string): EmailBlock {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr><td style="padding:14px 18px;background:#FDFBF6;border:1px solid #E0D8C8;border-radius:10px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="vertical-align:middle;font-family:Arial,sans-serif;font-size:24px;width:42px;">${emoji}</td>
          <td style="vertical-align:middle;">
            <p style="margin:0 0 2px;font-family:Georgia,'Times New Roman',serif;font-size:14px;font-weight:bold;color:#2A2418;">${title}</p>
            <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#8A7D6A;line-height:1.5;">${body}</p>
          </td>
        </tr></table>
      </td></tr>
    </table>`;
}

/** Witte kaart met label + rij(en) met label/waarde, bijv. voor gast-gegevens. */
export type DetailRow = {
  label: string;
  value: string;
  href?: string;
  /** Accent geeft de waarde een groene kleur en letter-spacing — geschikt voor codes als deurcode. */
  accent?: boolean;
};
export function detailsBlock(label: string, rows: DetailRow[], opts?: { background?: "card" | "muted"; compact?: boolean }): EmailBlock {
  const bg = opts?.background === "muted" ? "#F5F1E8" : "#FDFBF6";
  const border = opts?.background === "muted" ? "transparent" : "#E0D8C8";
  const rowPadding = opts?.compact ? "5px 0" : "4px 0";
  const tr = rows.map(r => {
    const valColor = r.accent ? "#2F4F3E" : "#2A2418";
    const valExtra = r.accent ? "letter-spacing:1px;" : "";
    const v = r.href
      ? `<a href="${r.href}" style="color:#2F4F3E;font-weight:bold;text-decoration:none;">${r.value}</a>`
      : `<span style="color:${valColor};font-weight:bold;${valExtra}">${r.value}</span>`;
    const align = opts?.compact ? `style="padding:${rowPadding};text-align:right;"` : `style="padding:${rowPadding};"`;
    return `<tr><td style="padding:${rowPadding};color:#8A7D6A;">${r.label}</td><td ${align}>${v}</td></tr>`;
  }).join("");
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${bg};${border !== "transparent" ? `border:1px solid ${border};` : ""}border-radius:10px;margin-bottom:20px;">
      <tr><td style="padding:16px 20px;">
        ${label ? `<p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:10px;color:#8A7D6A;text-transform:uppercase;letter-spacing:1px;">${label}</p>` : ""}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:${opts?.compact ? "13" : "14"}px;">${tr}</table>
      </td></tr>
    </table>`;
}

/** Kleine genuanceerde tekst, bijv. een tip onder een CTA-knop. */
export function smallNote(html: string): EmailBlock {
  return `<p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:12px;color:#8A7D6A;line-height:1.5;text-align:center;">${html}</p>`;
}

/** Groene CTA-knop. `prominent: true` geeft een grotere full-width versie (voor primaire calls-to-action zoals "Open gast-app"). */
export function ctaButton(href: string, text: string, opts?: { prominent?: boolean; marginBottom?: number }): EmailBlock {
  const prominent = opts?.prominent === true;
  const padding = prominent ? "18px 24px" : "14px 28px";
  const radius = prominent ? "14px" : "10px";
  const fontSize = prominent ? "17px" : "15px";
  const innerWidth = prominent ? ' style="width:100%;"' : "";
  const mb = opts?.marginBottom ?? 20;
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:${mb}px;">
      <tr><td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0"${innerWidth}><tr>
          <td align="center" style="background:#2F4F3E;border-radius:${radius};">
            <a href="${href}" style="display:block;padding:${padding};color:#fff;text-decoration:none;font-family:Georgia,'Times New Roman',serif;font-size:${fontSize};font-weight:bold;border-radius:${radius};">${text}</a>
          </td>
        </tr></table>
      </td></tr>
    </table>`;
}

/** Eenvoudige paragraaf. Default gecentreerd en in muted kleur. */
export function paragraph(html: string, opts?: { align?: "left" | "center"; color?: "muted" | "text" }): EmailBlock {
  const align = opts?.align ?? "center";
  const color = opts?.color === "text" ? "#2A2418" : "#8A7D6A";
  return `<p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:15px;color:${color};line-height:1.6;text-align:${align};">${html}</p>`;
}

export function lodgePhoto(baseUrl: string, lodge: string | null | undefined): { url: string; key: string } {
  const key = lodge === "lodge_2" ? "lodge_2" : "lodge_1";
  const file = key === "lodge_2" ? "lodge-eik.jpg" : "lodge-heide.jpg";
  return { url: `${baseUrl}/${file}`, key };
}

export type LodgeEmailOpts = {
  /** Volledige URL naar de hero-foto. Geef niets door om de foto weg te laten. */
  photoUrl?: string;
  photoAlt?: string;
  /** H1-tekst (al ge-escape'd). */
  title: string;
  /** Optionele intro-paragraaf direct onder de titel, gecentreerd. */
  intro?: string;
  /** Pre-gerenderde HTML-blokken (via *Block-helpers). */
  blocks: EmailBlock[];
  /** Footer-regel direct onder de divider. Default: WhatsApp-contact. */
  footer?: string;
};

const DEFAULT_FOOTER = `Vragen? WhatsApp ons op <a href="tel:+31642568603" style="color:#2F4F3E;font-weight:bold;text-decoration:none;">+31 6 42568603</a>`;

/** Hoofd-template. Alle uitgaande mails moeten hier doorheen. */
export function lodgeEmail(opts: LodgeEmailOpts): string {
  const photo = opts.photoUrl
    ? `<tr><td style="padding:0;font-size:0;line-height:0;"><img src="${opts.photoUrl}" alt="${opts.photoAlt || "Huis ter Huynen"}" width="600" style="display:block;width:100%;max-width:600px;height:auto;" /></td></tr>`
    : "";
  const intro = opts.intro ? paragraph(opts.intro) : "";
  const footer = opts.footer ?? DEFAULT_FOOTER;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#EAE3D2;font-family:Georgia,'Times New Roman',serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EAE3D2;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <tr><td align="center" style="padding:0 0 24px;">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:bold;color:#52502E;letter-spacing:2px;">HUIS TER HUYNEN</td>
    </tr><tr><td align="center" style="padding-top:6px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td style="width:28px;height:1px;background:#B49A5E;"></td>
      <td style="padding:0 10px;font-family:Arial,sans-serif;font-size:9px;color:#B49A5E;letter-spacing:3px;text-transform:uppercase;">Boutique Lodge</td>
      <td style="width:28px;height:1px;background:#B49A5E;"></td>
    </tr></table></td></tr></table>
  </td></tr>

  <tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FDFBF6;border:1px solid #E0D8C8;border-radius:12px;overflow:hidden;">
    ${photo}
    <tr><td style="padding:32px 28px 28px;">
      <h1 style="margin:0 0 14px;font-size:28px;color:#2A2418;text-align:center;font-family:Georgia,'Times New Roman',serif;line-height:1.2;">${opts.title}</h1>
      ${intro}
      ${opts.blocks.join("\n")}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E0D8C8;">
        <tr><td style="padding:16px 0 0;font-family:Arial,sans-serif;font-size:13px;color:#8A7D6A;text-align:center;">${footer}</td></tr>
      </table>
    </td></tr>
  </table></td></tr>

  <tr><td align="center" style="padding:24px 0 0;">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:40px;height:1px;background:#B49A5E;"></td></tr></table>
    <p style="margin:12px 0 0;font-family:Arial,sans-serif;font-size:11px;color:#8A7D6A;">${LODGE_NAME} &middot; Zuiderstraat 6 &middot; Zeijen, Drenthe</p>
  </td></tr>

</table>
</td></tr></table>
</body></html>`;
}

export function emailWrap(content: string): string {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:#EAE3D2;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#EAE3D2;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td align="center" style="padding:0 0 24px;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:bold;color:#52502E;letter-spacing:2px;">HUIS TER HUYNEN</td></tr>
            <tr><td align="center" style="padding-top:6px;">
              <table role="presentation" cellpadding="0" cellspacing="0"><tr>
                <td style="width:28px;height:1px;background-color:#B49A5E;"></td>
                <td style="padding:0 10px;font-family:Arial,sans-serif;font-size:9px;color:#B49A5E;letter-spacing:3px;text-transform:uppercase;">Boutique Lodge</td>
                <td style="width:28px;height:1px;background-color:#B49A5E;"></td>
              </tr></table>
            </td></tr>
          </table>
        </td></tr>
        <tr><td>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FDFBF6;border:1px solid #E0D8C8;border-radius:12px;">
            <tr><td style="height:4px;background-color:#B49A5E;border-radius:12px 12px 0 0;font-size:0;line-height:0;">&nbsp;</td></tr>
            <tr><td style="padding:28px 28px 24px;">${content}</td></tr>
          </table>
        </td></tr>
        <tr><td align="center" style="padding:24px 0 0;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:40px;height:1px;background-color:#B49A5E;"></td></tr></table>
          <p style="margin:12px 0 0;font-family:Arial,sans-serif;font-size:11px;color:#8A7D6A;">${LODGE_NAME} &middot; Zuiderstraat 6 &middot; Zeijen, Drenthe</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

/* ═══════════════════════════════════════════════════════════════
   Specifieke mails — wrappers rond lodgeEmail()
   ═══════════════════════════════════════════════════════════════ */

export type WelcomeEmailOpts = {
  firstName: string;
  lodgeNaam: string;
  photoUrl: string;
  checkInDate: string;     // bv. "maandag 14 mei"
  checkOutDate: string;    // bv. "vrijdag 18 mei"
  appLink: string;
  doorCode: string;
};

/** Welkomstmail (T-3 of handmatig vanuit admin). */
export function welcomeEmail(opts: WelcomeEmailOpts): string {
  return lodgeEmail({
    photoUrl: opts.photoUrl,
    photoAlt: `Lodge ${opts.lodgeNaam}`,
    title: `Welkom${opts.firstName ? `, ${opts.firstName}` : ""}`,
    intro: `Jullie Lodge ${opts.lodgeNaam} staat klaar voor ${opts.checkInDate}. We hebben een persoonlijke gast-app voor jullie ingericht &mdash; één klik en alles staat op zijn plek.`,
    blocks: [
      ctaButton(opts.appLink, "Open jullie gast-app &#8594;", { prominent: true, marginBottom: 14 }),
      smallNote("Tip: zet 'm op je beginscherm zodat je 'm bij aankomst direct paraat hebt."),
      detailsBlock("", [
        { label: "Aankomst",  value: `${opts.checkInDate} · vanaf 15:00` },
        { label: "Vertrek",   value: `${opts.checkOutDate} · voor 11:00` },
        { label: "Lodge",     value: `Lodge ${opts.lodgeNaam}` },
        { label: "Deurcode",  value: opts.doorCode, accent: true },
      ], { background: "muted", compact: true }),
      checklist([
        "Inchecken vanaf 15:00, sleutel niet nodig",
        "Laadpaal beschikbaar op locatie",
        "Tips, route en extra's regelen via de app",
      ]),
    ],
    footer: `<strong style="color:#2A2418;">Route:</strong> A28 → afslag Zeijen → Zuiderstraat 6<br/>Vragen? WhatsApp ons op <a href="tel:+31642568603" style="color:#2F4F3E;font-weight:bold;text-decoration:none;">+31 6 42568603</a>`,
  });
}

export type LateCheckoutEmailOpts = {
  firstName: string;
  lodgeNaam: string;
  photoUrl: string;
  appLink: string;
};

/** Late-checkout reminder mail (avond voor vertrek). */
export function lateCheckoutEmail(opts: LateCheckoutEmailOpts): string {
  return lodgeEmail({
    photoUrl: opts.photoUrl,
    photoAlt: `Lodge ${opts.lodgeNaam}`,
    title: "Nog één nacht",
    intro: `${opts.firstName ? `${opts.firstName}, nog` : "Nog"} één nacht en dan zit het er weer op. We hopen dat jullie een heerlijk verblijf hebben gehad. Geniet vanavond nog even van de stilte.`,
    blocks: [
      calloutBlock("Nog niet klaar om te gaan?", "Boek een late check-out &mdash; ideaal voor een lekker lang ontbijt of nog even een boswandeling."),
      ctaButton(opts.appLink, "Vraag late check-out aan"),
      checklist([
        "Standaard check-out tot 11:00",
        "Late check-out tot 13:00 via de app",
        "Vergeet niet om de checklist in de app af te vinken",
      ]),
    ],
  });
}

export type ThankYouEmailOpts = {
  firstName: string;
  photoUrl: string;
  reviewLink: string;
};

/** Bedankt-na-vertrek mail. Verstuurd dag na check-out door cron, of handmatig vanuit admin. */
export function thankYouEmail(opts: ThankYouEmailOpts): string {
  return lodgeEmail({
    photoUrl: opts.photoUrl,
    photoAlt: "Huis ter Huynen",
    title: `Tot snel${opts.firstName ? `, ${opts.firstName}` : ""}`,
    intro: "De heide kleurt, het bos ruist, en de hottub dampt zachtjes in de ochtendlucht. Zo gaat het hier elke dag verder &mdash; ook als je er even niet bent. We hopen dat Drenthe je goed heeft gedaan.",
    blocks: [
      calloutBlock(
        "Vertel ons hoe het was",
        "Jouw ervaring helpt andere gasten en helpt ons om het n&oacute;g beter te maken. Het kost maar een paar minuten.",
        { cta: { href: opts.reviewLink, text: "Review achterlaten", style: "primary" }, background: "muted" },
      ),
    ],
    footer: "Mocht je ooit terug willen &mdash; je bent altijd welkom. Het Huynen team",
  });
}

export type FollowUpEmailOpts = {
  firstName: string;
  photoUrl: string;
  reviewLink: string;
  bookLink: string;
};

/** Follow-up mail (~14+ dagen na vertrek). Twee CTAs: review en opnieuw boeken. */
export function followUpEmail(opts: FollowUpEmailOpts): string {
  return lodgeEmail({
    photoUrl: opts.photoUrl,
    photoAlt: "Huis ter Huynen",
    title: "Hoe kijk je terug?",
    intro: `${opts.firstName ? `Hoi ${opts.firstName}, het` : "Het"} is alweer even geleden dat je bij ons was. We hopen dat je genoten hebt van Drenthe!`,
    blocks: [
      calloutBlock(
        "Vertel ons hoe het was",
        "Jouw ervaring helpt andere gasten en helpt ons om het n&oacute;g beter te maken.",
        { cta: { href: opts.reviewLink, text: "Review achterlaten", style: "primary" }, background: "muted" },
      ),
      calloutBlock(
        "Kom nog eens terug",
        "Als terugkerende gast ontvang je altijd een persoonlijk aanbod &mdash; scherper dan op boekingssites.",
        { cta: { href: opts.bookLink, text: "Bekijk beschikbaarheid", style: "secondary" } },
      ),
    ],
  });
}

export type OfferteRegel = { label: string; bedrag: number; soort: "toeslag" | "korting" | "belasting" | "verblijf" };

export function buildOfferteHtmlV2(
  gastNaam: string, van: string, tot: string, personen: number,
  regels: OfferteRegel[], totaal: number, bericht: string,
  aanvraagId: string, appUrl: string, confirmToken: string,
): string {
  const rows = regels.map((r, i) => {
    const isLast = i === regels.length - 1;
    const isKorting = r.soort === "korting";
    const bedragColor = isKorting ? "#2E7D32" : "#2A2418";
    const sign = isKorting ? "&minus; " : "";
    return `
      <tr>
        <td style="padding:14px 0;color:#2A2418;${isLast ? "" : "border-bottom:1px solid #E0D8C8;"}">${esc(r.label)}</td>
        <td align="right" style="padding:14px 0;color:${bedragColor};font-weight:bold;${isLast ? "" : "border-bottom:1px solid #E0D8C8;"}">${sign}&euro; ${Math.abs(r.bedrag).toFixed(2)}</td>
      </tr>`;
  }).join("");

  return emailWrap(`
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center" style="padding:0 0 20px;"><span style="font-size:22px;color:#B49A5E;letter-spacing:8px;">◆</span></td></tr>
    </table>

    <h1 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:bold;color:#2A2418;text-align:center;">
      Persoonlijk aanbod
    </h1>
    <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:15px;color:#8A7D6A;text-align:center;">
      Speciaal voor ${gastNaam || "jou"}
    </p>
    <p style="margin:0 0 28px;font-family:Arial,sans-serif;font-size:12px;color:#B49A5E;text-align:center;letter-spacing:1px;text-transform:uppercase;">
      Exclusief &middot; Beste prijs garantie
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F1E8;border-radius:8px;margin-bottom:24px;">
      <tr><td style="padding:18px 20px;" align="center">
        <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:10px;color:#8A7D6A;text-transform:uppercase;letter-spacing:1px;">Je verblijf</p>
        <p style="margin:0 0 4px;font-family:Georgia,'Times New Roman',serif;font-size:18px;color:#2A2418;font-weight:bold;">${van} t/m ${tot}</p>
        <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#2F4F3E;font-weight:bold;">${personen} ${personen === 1 ? "persoon" : "personen"}</p>
      </td></tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:14px;margin-bottom:4px;">
      ${rows}
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;margin-bottom:24px;">
      <tr>
        <td style="padding:16px 0;font-size:18px;font-weight:bold;color:#2A2418;">Totaal</td>
        <td align="right" style="padding:16px 0;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:bold;color:#2F4F3E;">&euro; ${totaal.toFixed(2)}</td>
      </tr>
    </table>

    ${bericht ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr><td style="padding:18px 20px;background-color:#F9F4E8;border-radius:8px;">
        <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:10px;color:#8A7D6A;text-transform:uppercase;letter-spacing:1px;">Persoonlijk bericht</p>
        <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:#2A2418;line-height:1.6;">${esc(bericht)}</p>
      </td></tr>
    </table>
    ` : ""}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr><td style="padding:3px 0;font-family:Arial,sans-serif;font-size:13px;color:#2F4F3E;line-height:1.4;">&#10003;&ensp;Beste prijs garantie &mdash; altijd scherper dan boekingssites</td></tr>
      <tr><td style="padding:3px 0;font-family:Arial,sans-serif;font-size:13px;color:#2F4F3E;line-height:1.4;">&#10003;&ensp;Persoonlijk afgestemd op jouw verblijf</td></tr>
      <tr><td style="padding:3px 0;font-family:Arial,sans-serif;font-size:13px;color:#2F4F3E;line-height:1.4;">&#10003;&ensp;Geen verplichting &mdash; neem rustig de tijd</td></tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr><td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="background-color:#2F4F3E;border-radius:10px;">
              <a href="${appUrl}/bevestig?id=${aanvraagId}&t=${confirmToken}"
                style="display:block;padding:18px 48px;color:#ffffff;text-decoration:none;font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:bold;border-radius:10px;">
                Bevestig reservering &#8594;
              </a>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E0D8C8;">
      <tr><td style="padding:16px 0 0;">
        <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#8A7D6A;">
          Vragen? WhatsApp ons op <a href="tel:+31642568603" style="color:#2F4F3E;text-decoration:none;font-weight:bold;">+31 6 42568603</a>
        </p>
      </td></tr>
    </table>
  `);
}

