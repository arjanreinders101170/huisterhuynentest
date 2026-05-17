import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { reserveringSchema } from "@/lib/schemas";
import { safeInsertBookingRequest } from "@/lib/pricing";
import {
  esc as escEmail, lodgeEmail, lodgePhoto, infoBlock, calloutBlock,
  checklist, detailsBlock,
} from "@/lib/email";
import { APP_URL_FALLBACK } from "@/data/lodge";

export const runtime = "nodejs";

const OWNER_EMAIL = "lodge@huisterhuynen.nl";
const LODGE_NAME = "Huis ter Huynen";
const LODGE_LABELS: Record<string, string> = {
  lodge_1: "Lodge De Heide",
  lodge_2: "Lodge De Eik",
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
  const { data } = await getSupabase()
    .from("discount_codes")
    .select("*")
    .ilike("code", code)
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

  const { naam, email, lodge, checkIn, checkOut, nights, totalPrice, priceLabel, bericht, aantalPersonen, huisdieren, promoCode, _meta } = parsed.data;

  /* Tracking signals — for Meta CAPI deduplication when the booking later
   * converts to a paid Mollie transaction. fbp/fbc come from cookies set
   * by the Pixel; anonymous_id from localStorage via _meta. */
  const fbp = request.cookies.get("_fbp")?.value ?? null;
  const fbc = request.cookies.get("_fbc")?.value ?? null;

  const lodgeLabel = LODGE_LABELS[lodge] || lodge;
  const checkInFmt = fmtDate(checkIn);
  const checkOutFmt = fmtDate(checkOut);
  const nightsNum = parseInt(nights) || 0;
  let totalNum = parseFloat(totalPrice) || 0;

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

  await safeInsertBookingRequest({
    bron: "homepage",
    guest_id: guestId,
    gast_naam: naam,
    gast_email: email,
    lodge,
    check_in: checkIn,
    check_out: checkOut,
    nachten: nightsNum,
    personen: aantalPersonen ? parseInt(aantalPersonen) || 2 : 2,
    huisdieren: huisdieren === "ja",
    bericht: bericht || null,
    voorgestelde_prijs: totalNum,
    voorgestelde_prijs_label: priceLabel || null,
    promo_code: promoInfo?.label || null,
    status: "nieuw",
    meta_event_id: _meta?.event_id ?? null,
    anonymous_id: _meta?.anonymous_id ?? null,
    fbp,
    fbc,
  });

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.log(`[RESERVERING] ${lodgeLabel} | ${checkIn} – ${checkOut} | ${naam} | ${email}`);
    return NextResponse.json({ success: true, emailSent: false });
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(resendKey);

    // Gedeelde lodge-context
    const appUrlRv = process.env.NEXT_PUBLIC_APP_URL || APP_URL_FALLBACK;
    const baseUrlRv = new URL(appUrlRv).origin;
    const { url: photoUrl } = lodgePhoto(baseUrlRv, lodge);
    const periodLine = `${esc(checkInFmt)} t/m ${esc(checkOutFmt)}`;
    const subLine = `Lodge ${esc(lodgeLabel)} &middot; ${nightsNum} ${nightsNum === 1 ? "nacht" : "nachten"} &middot; ${esc(aantalPersonen || "—")} ${aantalPersonen === "1" ? "persoon" : "personen"}${huisdieren === "ja" ? " &middot; 🐾" : ""}`;
    const prijsLine = `Geschatte prijs: <strong>&euro; ${totalNum.toFixed(2)}</strong>${promoInfo ? ` <span style="color:#2E7D32;">(promo ${esc(promoInfo.label)} &minus; &euro; ${promoInfo.discount.toFixed(2)})</span>` : ""}`;

    // E-mail naar eigenaar
    await resend.emails.send({
      from: `${LODGE_NAME} <lodge@huisterhuynen.nl>`,
      to: [OWNER_EMAIL],
      replyTo: email,
      subject: `Reserveringsaanvraag: ${esc(lodgeLabel)} — ${esc(naam)}`,
      html: lodgeEmail({
        photoUrl, photoAlt: `Lodge ${esc(lodgeLabel)}`,
        title: "Nieuwe reserveringsaanvraag",
        intro: `Een nieuwe aanvraag voor Lodge ${esc(lodgeLabel)} via de homepage. Beoordeel in admin en stuur een offerte.`,
        blocks: [
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
        photoUrl, photoAlt: `Lodge ${esc(lodgeLabel)}`,
        title: `Bedankt, ${esc(naam)}`,
        intro: "We hebben je aanvraag ontvangen en nemen binnen 24 uur contact met je op met een persoonlijk aanbod.",
        blocks: [
          infoBlock("Jouw aanvraag", periodLine, subLine),
          calloutBlock("Geschatte prijs", `&euro; ${totalNum.toFixed(2)}${promoInfo ? ` <span style="color:#2E7D32;">(promo ${esc(promoInfo.label)} &minus; &euro; ${promoInfo.discount.toFixed(2)})</span>` : ""}<br/><span style="font-size:11px;color:#8A7D6A;">Definitief bedrag volgt in onze persoonlijke offerte.</span>`),
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
