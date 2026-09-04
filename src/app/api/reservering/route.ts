import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { reserveringSchema } from "@/lib/schemas";
import { safeInsertBookingRequest, computeStayPrice } from "@/lib/pricing";
import {
  esc as escEmail, lodgeEmail, lodgePhoto, infoBlock, calloutBlock,
  checklist, detailsBlock,
} from "@/lib/email";
import { APP_URL_FALLBACK } from "@/data/lodge";
import { checkStayDates } from "@/lib/stay-dates";
import { attributieKolommen } from "@/lib/attributie";
import { normaliseerEmail } from "@/lib/gast-email";

export const runtime = "nodejs";

/* Dezelfde variabele als /api/terugkomen gebruikt. Stond hier hard
 * ingesteld, waardoor OWNER_EMAIL uit de omgeving wél de aanvragen van
 * terugkomers en de app bereikte, maar niet die van de homepage. Die gingen
 * altijd naar lodge@huisterhuynen.nl — en omdat de afzender hetzelfde adres
 * is, is dat ook nog eens het soort bericht dat een mailserver met DMARC
 * geneigd is stil te laten verdwijnen. */
const OWNER_EMAIL = process.env.OWNER_EMAIL || "lodge@huisterhuynen.nl";
const LODGE_NAME = "Huis ter Huynen";
const LODGE_LABELS: Record<string, string> = {
  lodge_1: "De Heide",
  lodge_2: "De Eik",
};

type DiscountCode = {
  id: string;
  type: "percentage" | "fixed";
  waarde: number;
  omschrijving: string | null;
  max_gebruik: number | null;
  gebruik_count: number;
  geldig_van: string | null;
  geldig_tot: string | null;
  min_nachten: number | null;
  actief: boolean;
};

async function validateAndApplyCode(
  code: string,
  nights: number,
): Promise<{ valid: true; discount: number; type: string; waarde: number; omschrijving: string | null; id: string } | { valid: false }> {
  /* Zie /api/discount/validate: ILIKE maakte van de code een patroon en
   * daarmee van dit endpoint een orakel. Exacte match op dezelfde
   * normalisatie als bij het opslaan. */
  const { data } = await getSupabase()
    .from("discount_codes")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .single<DiscountCode>();

  if (!data || !data.actief) return { valid: false };

  const today = new Date().toISOString().slice(0, 10);
  if (data.geldig_van && today < data.geldig_van) return { valid: false };
  if (data.geldig_tot && today > data.geldig_tot) return { valid: false };
  if (data.max_gebruik !== null && data.gebruik_count >= data.max_gebruik) return { valid: false };
  if (data.min_nachten !== null && nights < data.min_nachten) return { valid: false };

  return { valid: true, discount: data.waarde, type: data.type, waarde: data.waarde, omschrijving: data.omschrijving, id: data.id };
}

const esc = escEmail;

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export async function POST(request: NextRequest) {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige request" }, { status: 400 });
  }

  const parsed = reserveringSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige invoer" }, { status: 400 });
  }

  const { naam, lodge, checkIn, checkOut, totalPrice, priceLabel, bericht, aantalPersonen, huisdieren, promoCode, locale, _meta, _attr } = parsed.data;
  // Altijd in dezelfde vorm de database in, anders wordt dezelfde gast twee gasten.
  const email = normaliseerEmail(parsed.data.email);

  /* Datumcontrole hoort hier thuis: het `min`-attribuut op de datumvelden in
   * het formulier beperkt alleen de datumkiezer, niet wat er verstuurd wordt. */
  const dateCheck = checkStayDates(checkIn, checkOut, { locale });
  if (!dateCheck.ok) {
    return NextResponse.json({ error: dateCheck.error }, { status: 400 });
  }

  /* Tracking signals — for Meta CAPI deduplication when the booking later
   * converts to a paid Mollie transaction. fbp/fbc come from cookies set
   * by the Pixel; anonymous_id from localStorage via _meta. */
  const fbp = request.cookies.get("_fbp")?.value ?? null;
  const fbc = request.cookies.get("_fbc")?.value ?? null;

  const lodgeLabel = LODGE_LABELS[lodge] || lodge;
  const checkInFmt = fmtDate(checkIn);
  const checkOutFmt = fmtDate(checkOut);
  // Nachten uit de gevalideerde datums, niet uit het meegestuurde veld.
  const nightsNum = dateCheck.nights;

  /* De prijs komt van de server, niet uit het formulier.
   *
   * `totalPrice` is een veld dat de browser meestuurt, en die waarde belandde
   * als voorgestelde_prijs in de aanvraag — precies het bedrag dat in de admin
   * al is voorgevuld wanneer de host de offerte opmaakt. Wie 89 in plaats van
   * 890 instuurde, gokte erop dat dat niet wordt nagekeken.
   *
   * Dezelfde berekening als /api/terugkomen gebruikt. Faalt hij (bijvoorbeeld
   * omdat er geen prijsperiodes voor deze lodge staan), dan gaat er 0 in en
   * ziet de host meteen dat er handmatig een prijs bepaald moet worden. */
  const personenNum = aantalPersonen ? parseInt(aantalPersonen) || 2 : 2;
  let totalNum = 0;
  let berekendLabel: string | null = null;
  try {
    const calc = await computeStayPrice({
      lodge,
      checkIn,
      checkOut,
      personen: personenNum,
      huisdier: huisdieren === "ja",
    });
    totalNum = calc.verblijf;
    berekendLabel = calc.voorstelLabel;
  } catch (e) {
    console.error("computeStayPrice (reservering) failed:", e);
  }

  /* Wat de browser toonde bewaren we niet als prijs, maar we signaleren het
   * wel: wijkt het af, dan klopt of de kalender of de prijstabel niet. */
  const getoondePrijs = parseFloat(totalPrice) || 0;
  if (totalNum > 0 && Math.abs(getoondePrijs - totalNum) > 1) {
    console.warn(
      `[reservering] prijsafwijking: browser toonde ${getoondePrijs}, server berekende ${totalNum} ` +
      `(${lodge} ${checkIn}–${checkOut})`
    );
  }

  // Server-side promo code validation and use-count increment
  let promoInfo: { label: string; discount: number } | null = null;
  if (promoCode) {
    const result = await validateAndApplyCode(promoCode, nightsNum).catch(() => ({ valid: false as const }));
    if (result.valid) {
      const discountAmt = result.type === "percentage"
        ? Math.round(totalNum * result.waarde / 100 * 100) / 100
        : Math.min(result.waarde, totalNum);
      totalNum = Math.max(0, totalNum - discountAmt);
      promoInfo = { label: promoCode.toUpperCase(), discount: discountAmt };
      // Atomic increment — fire-and-forget
      void getSupabase().rpc("increment_discount_usage", { code_id: result.id });
    }
  }

  // Upsert guest, then store request in unified funnel
  let guestId: string | null = null;
  try {
    const { data } = await getSupabase().rpc("upsert_guest", { p_naam: naam, p_email: email });
    guestId = data;
  } catch (e) { console.error("Guest upsert failed:", e); }

  const aanvraagId = await safeInsertBookingRequest({
    bron: "homepage",
    guest_id: guestId,
    gast_naam: naam,
    gast_email: email,
    lodge,
    check_in: checkIn,
    check_out: checkOut,
    nachten: nightsNum,
    personen: personenNum,
    huisdieren: huisdieren === "ja",
    bericht: bericht || null,
    voorgestelde_prijs: totalNum,
    voorgestelde_prijs_label: berekendLabel ?? priceLabel ?? null,
    promo_code: promoInfo?.label || null,
    status: "nieuw",
    meta_event_id: _meta?.event_id ?? null,
    anonymous_id: _meta?.anonymous_id ?? null,
    fbp,
    fbc,
    // Herkomst: welk kanaal deze aanvraag heeft opgeleverd.
    ...attributieKolommen(_attr),
  });

  /* De insert mag de aanvraag niet opeten. Lukt hij niet, dan bestaat deze
   * aanvraag alleen nog in deze mail — en dan moet dat er ook in staan,
   * anders wacht de gast op een aanbod dat nooit in de admin verschijnt. */
  const nietOpgeslagen = !aanvraagId;
  if (nietOpgeslagen) {
    console.error(`[reservering] aanvraag niet opgeslagen — alleen per e-mail bekend (${lodge} ${checkIn}–${checkOut})`);
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.log(`[RESERVERING] ${lodgeLabel} | ${checkIn} – ${checkOut} | ${naam} | ***@${email.split("@")[1] ?? "?"}`);
    return NextResponse.json({ success: true, emailSent: false });
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(resendKey);

    // Gedeelde lodge-context
    const appUrlRv = process.env.NEXT_PUBLIC_APP_URL || APP_URL_FALLBACK;
    const baseUrlRv = new URL(appUrlRv).origin;
    const { url: photoUrl } = lodgePhoto(baseUrlRv, lodge);
    const priceKnown = totalNum > 0;
    const periodLine = `${esc(checkInFmt)} t/m ${esc(checkOutFmt)}`;
    const subLine = `Lodge ${esc(lodgeLabel)} &middot; ${nightsNum} ${nightsNum === 1 ? "nacht" : "nachten"} &middot; ${esc(aantalPersonen || "—")} ${aantalPersonen === "1" ? "persoon" : "personen"}${huisdieren === "ja" ? " &middot; 🐾" : ""}`;
    const prijsLine = priceKnown
      ? `Geschatte prijs: <strong>&euro; ${totalNum.toFixed(2)}</strong>${promoInfo ? ` <span style="color:#2E7D32;">(promo ${esc(promoInfo.label)} &minus; &euro; ${promoInfo.discount.toFixed(2)})</span>` : ""}`
      : `Prijs nog te bepalen &mdash; bouw een persoonlijk aanbod op in admin.`;

    // E-mail naar eigenaar
    await resend.emails.send({
      from: `${LODGE_NAME} <lodge@huisterhuynen.nl>`,
      to: [OWNER_EMAIL],
      replyTo: email,
      subject: `Reserveringsaanvraag: Lodge ${esc(lodgeLabel)} — ${esc(naam)}`,
      html: lodgeEmail({
        photoUrl, photoAlt: `Lodge ${lodgeLabel}`,
        title: "Nieuwe reserveringsaanvraag",
        intro: `Een nieuwe aanvraag voor Lodge ${esc(lodgeLabel)} via de homepage. Beoordeel in admin en stuur een offerte.`,
        blocks: [
          ...(nietOpgeslagen ? [calloutBlock(
            "⚠️ Niet opgeslagen in de admin",
            "Deze aanvraag kon niet in de database worden gezet en staat dus <strong>niet</strong> in de Aanvragen-tab. " +
            "Neem hem handmatig over of reageer rechtstreeks op deze mail.",
          )] : []),
          infoBlock("Aanvraag", periodLine, subLine),
          calloutBlock("Geschatte prijs", prijsLine),
          detailsBlock("Gast", [
            { label: "Naam", value: esc(naam) },
            { label: "E-mail", value: esc(email), href: `mailto:${esc(email)}` },
            ...(bericht ? [{ label: "Bericht", value: esc(bericht) }] : []),
          ]),
          calloutBlock("Actie", "Open in admin &rarr; Aanvragen v2 om een offerte op te bouwen en te versturen."),
        ],
        footer: `Reageer rechtstreeks naar de gast: <a href="mailto:${esc(email)}" style="color:#2F4F3E;font-weight:bold;text-decoration:none;">${esc(email)}</a>`,
      }),
    });

    // Bevestigingsmail aan gast
    await resend.emails.send({
      from: `${LODGE_NAME} <lodge@huisterhuynen.nl>`,
      to: [email],
      subject: `Aanvraag ontvangen — ${LODGE_NAME}`,
      html: lodgeEmail({
        photoUrl, photoAlt: `Lodge ${lodgeLabel}`,
        title: `Bedankt, ${naam}`,
        intro: "We hebben je aanvraag ontvangen en nemen binnen 24 uur contact met je op met een persoonlijk aanbod.",
        blocks: [
          infoBlock("Jouw aanvraag", periodLine, subLine),
          priceKnown
            ? calloutBlock("Geschatte prijs", `&euro; ${totalNum.toFixed(2)}${promoInfo ? ` <span style="color:#2E7D32;">(promo ${esc(promoInfo.label)} &minus; &euro; ${promoInfo.discount.toFixed(2)})</span>` : ""}<br/><span style="font-size:11px;color:#8A7D6A;">Definitief bedrag volgt in onze persoonlijke offerte.</span>`)
            : calloutBlock("Persoonlijk aanbod", `We stellen een aanbod op maat voor je samen en sturen het binnen 24 uur. Zo krijg je altijd de beste prijs voor jouw data.`),
          ...(bericht ? [calloutBlock("Jouw bericht aan ons", esc(bericht), { background: "muted" })] : []),
          checklist([
            "Persoonlijke bevestiging binnen 24 uur",
            "Geen vooruitbetaling vereist voor de aanvraag",
            "Vragen? Bel of WhatsApp ons gerust",
          ]),
        ],
      }),
    });

    return NextResponse.json({ success: true, emailSent: true });
  } catch (e) {
    console.error("Reservering email error:", e);
    return NextResponse.json({ success: true, emailSent: false });
  }
}
