import {
  esc, lodgeEmail, lodgePhoto, infoBlock, calloutBlock, checklist, detailsBlock, ctaButton,
} from "@/lib/email";
import { terugkomenSchema } from "@/lib/schemas";
import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { safeInsertBookingRequest, computeStayPrice } from "@/lib/pricing";
import { APP_URL_FALLBACK } from "@/data/lodge";

export const runtime = "nodejs";

const OWNER_EMAIL = process.env.OWNER_EMAIL || "arjan@vvrvastgoedbv.nl";
const LODGE_NAME = "Huis ter Huynen";

export async function POST(request: NextRequest) {
  try {
    let body;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Ongeldige request" }, { status: 400 });
    }

    const { from, to, fromIso, toIso, email, name, persons, message, voorkeursLodge, voorkeursLodgeNaam, wasFallback, bron: requestBron } = body;
    const bron: "terugkomer" | "app" = requestBron === "app" ? "app" : "terugkomer";

    const parsed = terugkomenSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Ongeldige invoer" }, { status: 400 });
    }

    let guestId = null;
    try {
      const { data } = await getSupabase().rpc("upsert_guest", { p_naam: name || "", p_email: email });
      guestId = data;
    } catch (e) { console.error("Guest upsert failed:", e); }

    // Combine lodge-preference into bericht so we don't need a DB migration
    const fullBericht = voorkeursLodge
      ? `[Lodge: ${voorkeursLodgeNaam || voorkeursLodge}${wasFallback ? " — fallback, voorkeur was bezet" : ""}]\n${message || ""}`.trim()
      : (message || null);

    // Alleen nog naar booking_requests. De oude terugkeer_aanvragen-tabel wordt
    // niet meer geschreven; admin werkt vanuit Aanvragen-tab op booking_requests.
    const nachten = fromIso && toIso
      ? Math.max(0, Math.round((new Date(toIso).getTime() - new Date(fromIso).getTime()) / 86400000))
      : null;

    let voorgesteldePrijs: number | null = null;
    let voorgesteldeLabel: string | null = null;
    if (fromIso && toIso && voorkeursLodge && nachten && nachten > 0) {
      try {
        const calc = await computeStayPrice({
          lodge: voorkeursLodge,
          checkIn: fromIso,
          checkOut: toIso,
          personen: persons || 2,
        });
        voorgesteldePrijs = calc.verblijf;
        voorgesteldeLabel = calc.voorstelLabel;
      } catch (e) { console.error("computeStayPrice (terugkomen) failed:", e); }
    }

    await safeInsertBookingRequest({
      bron,
      guest_id: guestId,
      gast_naam: name || "",
      gast_email: email,
      lodge: voorkeursLodge || null,
      check_in: fromIso || null,
      check_out: toIso || null,
      nachten,
      personen: persons || 2,
      bericht: fullBericht,
      periode_tekst: `${from} — ${to}`,
      voorgestelde_prijs: voorgesteldePrijs,
      voorgestelde_prijs_label: voorgesteldeLabel,
      status: "nieuw",
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || APP_URL_FALLBACK;
    const baseUrl = new URL(appUrl).origin;
    const { url: photoUrl } = lodgePhoto(baseUrl, voorkeursLodge);
    const lodgeLabel = voorkeursLodgeNaam ? esc(voorkeursLodgeNaam) : "—";
    const personen = persons || 2;
    const periodLine = `${esc(from)} &mdash; ${esc(to)}`;
    const subLine = `Lodge ${lodgeLabel}${wasFallback ? " <span style=\"color:#B49A5E;\">(alternatief, voorkeur was bezet)</span>" : ""} &middot; ${personen} ${personen === 1 ? "persoon" : "personen"}`;
    const firstName = esc((name || "").split(" ")[0] || name || "");

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);

        // E-mail naar eigenaar
        await resend.emails.send({
          from: `${LODGE_NAME} <lodge@huisterhuynen.nl>`,
          to: [OWNER_EMAIL],
          subject: `${bron === "app" ? "App-aanvraag" : "Terugkeer aanvraag"} — ${name || email} · ${from} t/m ${to}`,
          replyTo: email,
          html: lodgeEmail({
            photoUrl, photoAlt: `Lodge ${lodgeLabel}`,
            title: bron === "app" ? "Nieuwe aanvraag via app" : "Terugkeer aanvraag",
            intro: bron === "app"
              ? "Een gast heeft via de concierge-app een aanvraag gedaan. Open in admin om een persoonlijk aanbod op te bouwen."
              : "Een gast wil graag terugkomen. Open in admin om een persoonlijk aanbod op te bouwen.",
            blocks: [
              infoBlock("Gewenste periode", periodLine, subLine),
              detailsBlock("Gast", [
                ...(name ? [{ label: "Naam", value: esc(name) }] : []),
                { label: "E-mail", value: esc(email), href: `mailto:${esc(email)}` },
                ...(message ? [{ label: "Bericht", value: esc(message) }] : []),
              ]),
              calloutBlock("Volgende stap", "Open de admin en kies Reserveringen &rarr; Aanvragen om de offerte op te bouwen en te versturen."),
              ctaButton(`${baseUrl}/admin`, "Open admin"),
            ],
            footer: `Reageer rechtstreeks naar de gast: <a href="mailto:${esc(email)}" style="color:#2F4F3E;font-weight:bold;text-decoration:none;">${esc(email)}</a>`,
          }),
        });

        // Bevestigingsmail aan gast
        await resend.emails.send({
          from: `${LODGE_NAME} <lodge@huisterhuynen.nl>`,
          to: [email],
          subject: `Je aanvraag is ontvangen — ${LODGE_NAME}`,
          html: lodgeEmail({
            photoUrl, photoAlt: `Lodge ${lodgeLabel}`,
            title: `Dank je wel${firstName ? `, ${firstName}` : ""}`,
            intro: "Wat leuk dat je terug wilt komen! We stellen binnen 24 uur een persoonlijk aanbod voor je op.",
            blocks: [
              infoBlock("Gewenste periode", periodLine, voorkeursLodgeNaam ? `Lodge ${lodgeLabel}` : ""),
              calloutBlock("Wat kun je verwachten?", "Je ontvangt binnen 24 uur een persoonlijk aanbod per e-mail &mdash; altijd scherper dan op boekingssites."),
              checklist([
                "Beste prijs garantie",
                "Speciaal voor terugkerende gasten",
                "Geen verplichting",
              ]),
            ],
          }),
        });
      } catch (e) { console.error("Email failed:", e); }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Kon aanvraag niet verwerken" }, { status: 500 });
  }
}
