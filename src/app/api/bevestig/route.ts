import {
  esc, lodgeEmail, lodgePhoto, infoBlock, calloutBlock, checklist,
  teaserBlock, detailsBlock,
} from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { APP_URL_FALLBACK, lodgeName } from "@/data/lodge";
import { todayISO } from "@/lib/offer-expiry";
import { findConflict, openOffersOverlapping, type Period } from "@/lib/availability";

export const runtime = "nodejs";

const OWNER_EMAIL = process.env.OWNER_EMAIL || "arjan@vvrvastgoedbv.nl";
const LODGE_NAME = "Huis ter Huynen";
const REJECTED_MESSAGE =
  "Deze aanvraag is inmiddels vervallen. Je hebt hierover een e-mail van ons ontvangen — " +
  "neem gerust contact op als je vragen hebt of andere datums wilt bekijken.";
const EXPIRED_MESSAGE =
  "Dit aanbod is verlopen en de datums zijn weer vrijgegeven. Stuur ons gerust een bericht — " +
  "zijn ze nog vrij, dan maken we het aanbod zo weer voor je in orde.";

const TAKEN_MESSAGE =
  "Deze datums zijn helaas net vergeven — iemand anders was je voor. We hebben je aanvraag " +
  "doorgegeven; we nemen zo snel mogelijk contact met je op om mee te denken over een alternatief.";

/**
 * De gast klikte op bevestigen terwijl de datums net bezet zijn geraakt.
 * Dat is precies het moment waarop de host het moet weten — niet later.
 */
async function notifyOwnerOfConflict(a: LoadedAanvraag, conflict: Period): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(resendKey);
    const lodgeNaam = lodgeName(a.lodge || "lodge_1");
    await resend.emails.send({
      from: `${LODGE_NAME} <lodge@huisterhuynen.nl>`,
      to: [OWNER_EMAIL],
      replyTo: a.gastEmail || undefined,
      subject: `Bevestiging geblokkeerd — datums al bezet (${esc(a.gastNaam || "gast")})`,
      html: lodgeEmail({
        title: "Bevestiging geblokkeerd",
        intro: `${esc(a.gastNaam || "Een gast")} probeerde zojuist het aanbod te bevestigen, maar de datums zijn inmiddels bezet. De reservering is niet doorgezet.`,
        blocks: [
          infoBlock("Aangevraagd", `${esc(a.van)} t/m ${esc(a.tot)}`, `Lodge ${esc(lodgeNaam)}`),
          detailsBlock("Gast", [
            { label: "Naam", value: esc(a.gastNaam || "—") },
            ...(a.gastEmail ? [{ label: "E-mail", value: esc(a.gastEmail), href: `mailto:${esc(a.gastEmail)}` }] : []),
            { label: "Conflict", value: esc(conflict.bron || "bestaande reservering") },
            { label: "Bezet van", value: `${esc(conflict.start)} t/m ${esc(conflict.end)}` },
          ]),
          calloutBlock(
            "Actie",
            "De gast heeft te horen gekregen dat je contact opneemt over een alternatief. Bied andere datums of de andere lodge aan, of wijs de aanvraag netjes af met een bericht.",
          ),
        ],
        footer: a.gastEmail
          ? `Reageer rechtstreeks naar de gast: <a href="mailto:${esc(a.gastEmail)}" style="color:#2F4F3E;font-weight:bold;text-decoration:none;">${esc(a.gastEmail)}</a>`
          : undefined,
      }),
    });
  } catch (e) {
    console.error("[bevestig] conflictmail naar host faalde:", e);
  }
}

/** Verlopen: door de cron afgehandeld, of de vervaldatum is net gepasseerd. */
function isExpired(a: LoadedAanvraag): boolean {
  if (a.rawStatus === "verlopen") return true;
  return a.rawStatus === "offerte_verstuurd" && !!a.vervaltOp && a.vervaltOp < todayISO();
}

type LoadedAanvraag = {
  source: "v2" | "legacy";
  id: string;
  van: string;
  tot: string;
  personen: number;
  status: string;          // genormaliseerd voor de frontend (bevestigd → geboekt)
  rawStatus: string;
  offerte_bedrag: number | null;
  gastNaam: string;
  gastEmail: string;
  lodge: string | null;    // bv. "lodge_1" / "lodge_2"
  guestId: string | null;
  checkInIso: string | null;
  checkOutIso: string | null;
  /** Geldig t/m deze dag (alleen v2). */
  vervaltOp: string | null;
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
}

async function loadFromBookingRequests(id: string, token: string | null): Promise<LoadedAanvraag | null> {
  const { data, error } = await getSupabase().from("booking_requests").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  if (data.confirm_token && data.confirm_token !== token) return null;

  // Gast info: eerst van guests-tabel (via guest_id), anders direct uit kolommen
  let gastNaam = data.gast_naam || "";
  let gastEmail = data.gast_email || "";
  if (data.guest_id) {
    const { data: g } = await getSupabase().from("guests").select("naam, email").eq("id", data.guest_id).maybeSingle();
    if (g) {
      gastNaam = g.naam || gastNaam;
      gastEmail = g.email || gastEmail;
    }
  }

  const van = data.check_in ? fmtDate(data.check_in)
    : (data.periode_tekst?.split("—")[0]?.trim() || data.periode_tekst || "");
  const tot = data.check_out ? fmtDate(data.check_out)
    : (data.periode_tekst?.split("—")[1]?.trim() || "");

  return {
    source: "v2",
    id: data.id,
    van, tot,
    personen: data.personen || 2,
    status: data.status === "bevestigd" ? "geboekt" : data.status,
    rawStatus: data.status,
    offerte_bedrag: data.totaal != null ? Number(data.totaal) : null,
    gastNaam, gastEmail,
    lodge: data.lodge || null,
    guestId: data.guest_id || null,
    checkInIso: data.check_in || null,
    checkOutIso: data.check_out || null,
    vervaltOp: data.offerte_vervalt_op || null,
  };
}

async function loadFromLegacy(id: string, token: string | null): Promise<LoadedAanvraag | null> {
  const { data, error } = await getSupabase().from("terugkeer_aanvragen").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  if (data.confirm_token && data.confirm_token !== token) return null;

  let gastNaam = "";
  let gastEmail = "";
  if (data.guest_id) {
    const { data: g } = await getSupabase().from("guests").select("naam, email").eq("id", data.guest_id).maybeSingle();
    if (g) {
      gastNaam = g.naam || "";
      gastEmail = g.email || "";
    }
  }

  // Legacy-records bewaarden lodge als "[Lodge: De Heide]..." prefix in het bericht.
  let lodge: string | null = null;
  if (typeof data.bericht === "string") {
    const m = data.bericht.match(/\[Lodge:\s*([^\]\n]+?)(?:\s*—|]\s*)/i);
    if (m) {
      const txt = m[1].toLowerCase();
      if (txt.includes("heide")) lodge = "lodge_1";
      else if (txt.includes("eik")) lodge = "lodge_2";
    }
  }

  return {
    source: "legacy",
    id: data.id,
    van: data.van || "",
    tot: data.tot || "",
    personen: data.personen || 2,
    status: data.status,
    rawStatus: data.status,
    offerte_bedrag: data.offerte_bedrag != null ? Number(data.offerte_bedrag) : null,
    gastNaam, gastEmail,
    lodge,
    guestId: data.guest_id || null,
    checkInIso: null,    // legacy heeft geen ISO datums
    checkOutIso: null,
    vervaltOp: null,     // legacy-offertes kennen geen vervaldatum
  };
}

async function load(id: string, token: string | null): Promise<LoadedAanvraag | null> {
  return (await loadFromBookingRequests(id, token)) || (await loadFromLegacy(id, token));
}

// GET — load aanvraag data for confirmation page
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  const token = request.nextUrl.searchParams.get("t");
  if (!id) return NextResponse.json({ error: "Geen aanvraag gevonden" }, { status: 400 });

  try {
    const a = await load(id, token);
    if (!a) return NextResponse.json({ error: "Aanvraag niet gevonden of ongeldige link" }, { status: 404 });
    if (a.rawStatus === "afgewezen") {
      return NextResponse.json({ error: REJECTED_MESSAGE }, { status: 410 });
    }
    if (isExpired(a)) {
      return NextResponse.json({ error: EXPIRED_MESSAGE }, { status: 410 });
    }

    return NextResponse.json({
      id: a.id,
      van: a.van,
      tot: a.tot,
      personen: a.personen,
      status: a.status,
      offerte_bedrag: a.offerte_bedrag,
      gastNaam: a.gastNaam,
      gastEmail: a.gastEmail,
    });
  } catch (err) {
    console.error("Bevestig GET catch:", err);
    return NextResponse.json({ error: "Kon aanvraag niet laden" }, { status: 500 });
  }
}

// POST — confirm the booking
export async function POST(request: NextRequest) {
  try {
    const { id, token } = await request.json();
    if (!id) return NextResponse.json({ error: "Geen ID" }, { status: 400 });

    const a = await load(id, token);
    if (!a) return NextResponse.json({ error: "Aanvraag niet gevonden of ongeldige link" }, { status: 404 });

    if (a.status === "geboekt") {
      return NextResponse.json({ error: "Deze reservering is al bevestigd" }, { status: 400 });
    }

    // Een afgewezen aanvraag mag niet alsnog via een oude offerte-link bevestigd worden.
    if (a.rawStatus === "afgewezen") {
      return NextResponse.json({ error: REJECTED_MESSAGE }, { status: 410 });
    }
    // Idem voor een verlopen aanbod — de datums zijn weer vrijgegeven.
    if (isExpired(a)) {
      return NextResponse.json({ error: EXPIRED_MESSAGE }, { status: 410 });
    }

    /* Twee gasten kunnen tegelijk een aanbod voor dezelfde nachten hebben —
     * een offerte blokkeert de agenda immers niet. Wie het eerst bevestigt
     * krijgt de plek; hier vangen we de tweede op vóór de dubbele boeking. */
    let icalIncompleet = false;
    if (a.source === "v2" && a.lodge && a.checkInIso && a.checkOutIso) {
      const { conflict, icalOk } = await findConflict({
        lodge: a.lodge,
        checkIn: a.checkInIso,
        checkOut: a.checkOutIso,
        excludeRequestId: id,
      });
      icalIncompleet = !icalOk;
      if (conflict) {
        console.warn(`[bevestig] conflict voor aanvraag ${id}: ${conflict.bron ?? "onbekend"} (${conflict.start}–${conflict.end})`);
        await notifyOwnerOfConflict(a, conflict);
        return NextResponse.json({ error: TAKEN_MESSAGE }, { status: 409 });
      }
    }

    // Update status in de juiste tabel
    if (a.source === "v2") {
      await getSupabase().from("booking_requests").update({ status: "bevestigd" }).eq("id", id);
    } else {
      await getSupabase().from("terugkeer_aanvragen").update({
        status: "geboekt",
        updated_at: new Date().toISOString(),
      }).eq("id", id);
    }

    /* Alternatieven opruimen. Kreeg deze gast twee aanbiedingen voor dezelfde
     * nachten (bijvoorbeeld beide lodges), dan vervalt de niet-gekozen optie
     * zodra er één bevestigd is — anders kan hij die later alsnog aanklikken.
     * Openstaande offertes van ándere gasten blijven staan: die kunnen niet
     * meer bevestigd worden en zijn aan de host om af te handelen. */
    const ingetrokken: string[] = [];
    const blijvenStaan: { naam: string; email: string }[] = [];
    if (a.source === "v2" && a.checkInIso && a.checkOutIso) {
      try {
        const others = await openOffersOverlapping({
          checkIn: a.checkInIso,
          checkOut: a.checkOutIso,
          excludeRequestId: id,
        });
        for (const o of others) {
          const zelfdeGast =
            (a.guestId && o.guest_id && o.guest_id === a.guestId) ||
            (!!a.gastEmail && !!o.gast_email && o.gast_email.toLowerCase() === a.gastEmail.toLowerCase());
          if (zelfdeGast) {
            await getSupabase().from("booking_requests").update({
              status: "verlopen",
              verlopen_op: new Date().toISOString(),
            }).eq("id", o.id).eq("status", "offerte_verstuurd");
            ingetrokken.push(lodgeName(o.lodge || "lodge_1"));
          } else if (o.lodge === a.lodge) {
            blijvenStaan.push({ naam: o.gast_naam || "onbekend", email: o.gast_email || "" });
          }
        }
      } catch (e) {
        console.error("[bevestig] opruimen alternatieven faalde:", e);
      }
    }

    // Auto-create stays record voor v2 met volledige data. De welkomstmail
    // wordt door /api/cron/emails op T-3 automatisch verstuurd.
    if (a.source === "v2" && a.guestId && a.lodge && a.checkInIso && a.checkOutIso) {
      try {
        // Check of er al een stays-record bestaat voor deze gast + datums (bv. door dubbele klik)
        const { data: existing } = await getSupabase()
          .from("stays")
          .select("id")
          .eq("guest_id", a.guestId)
          .eq("check_in", a.checkInIso)
          .eq("check_out", a.checkOutIso)
          .maybeSingle();
        if (!existing) {
          const { randomBytes, randomInt } = await import("crypto");
          const token = randomBytes(24).toString("hex");
          const door_code = String(randomInt(1000, 9999));
          await getSupabase().from("stays").insert({
            guest_id: a.guestId,
            lodge: a.lodge,
            check_in: a.checkInIso,
            check_out: a.checkOutIso,
            token,
            door_code,
            status: "gepland",
            welcome_sent: false,
          });
        }
      } catch (e) {
        console.error("[bevestig] auto-create stay failed:", e);
        // Niet falen — status is al op bevestigd, admin kan handmatig stay aanmaken
      }
    }

    // Send confirmation emails
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey && a.gastEmail) {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);

      const bedrag = a.offerte_bedrag != null ? `&euro; ${a.offerte_bedrag.toFixed(2)}` : "—";
      const gastNaam = a.gastNaam || "Gast";

      // Gedeelde lodge-variabelen voor beide e-mails
      const appUrlBv = process.env.NEXT_PUBLIC_APP_URL || APP_URL_FALLBACK;
      const baseUrlBv = new URL(appUrlBv).origin;
      const { url: photoUrl } = lodgePhoto(baseUrlBv, a.lodge);
      const lodgeNaamBv = lodgeName(a.lodge || "lodge_1");
      const firstName = esc((gastNaam || "").split(" ")[0] || gastNaam || "");
      const periodLine = `${esc(a.van)} t/m ${esc(a.tot)}`;
      const subLine = `Lodge ${esc(lodgeNaamBv)} &middot; ${a.personen} ${a.personen === 1 ? "persoon" : "personen"}${a.offerte_bedrag != null ? ` &middot; ${bedrag}` : ""}`;

      // To owner
      await resend.emails.send({
        from: `${LODGE_NAME} <lodge@huisterhuynen.nl>`,
        to: [OWNER_EMAIL],
        subject: `Reservering bevestigd! — ${esc(gastNaam)} · ${esc(a.van)} t/m ${esc(a.tot)}`,
        replyTo: a.gastEmail,
        html: lodgeEmail({
          photoUrl, photoAlt: `Lodge ${esc(lodgeNaamBv)}`,
          title: "Reservering bevestigd",
          intro: `${esc(gastNaam)} heeft het aanbod geaccepteerd. Hieronder vind je de details om het verblijf in admin in te plannen.`,
          blocks: [
            infoBlock("Reservering", periodLine, subLine),
            detailsBlock("Gast", [
              { label: "Naam", value: esc(gastNaam) },
              { label: "E-mail", value: esc(a.gastEmail), href: `mailto:${esc(a.gastEmail)}` },
            ]),
            calloutBlock("Volgende stap", "Maak een verblijf aan in admin met deurcode en stuur de welkomstmail enkele dagen voor aankomst."),
            ...(ingetrokken.length > 0 ? [calloutBlock(
              "Alternatief ingetrokken",
              `Deze gast had ook een openstaand aanbod voor ${ingetrokken.map(l => `Lodge ${esc(l)}`).join(" en ")} in dezelfde periode. Dat staat nu op &lsquo;verlopen&rsquo;, zodat het niet alsnog bevestigd kan worden.`,
              { background: "muted" },
            )] : []),
            ...(blijvenStaan.length > 0 ? [calloutBlock(
              "Let op: nog een open offerte",
              `Voor deze lodge en periode staat nog een aanbod open bij ${blijvenStaan.map(o => esc(o.naam)).join(", ")}. Bevestigen kan niet meer &mdash; laat het ze weten of bied een alternatief aan.`,
            )] : []),
            ...(icalIncompleet ? [calloutBlock(
              "Agenda niet volledig gecontroleerd",
              "De agenda van Booking.com was tijdens het bevestigen niet bereikbaar. De eigen reserveringen zijn wel gecontroleerd &mdash; controleer voor de zekerheid of deze datums daar ook vrij waren.",
            )] : []),
            checklist([
              "Aanbod door gast geaccepteerd",
              "Status in admin op &lsquo;bevestigd&rsquo;",
              "Bevestigingsmail naar gast verstuurd",
            ]),
          ],
          footer: `Reageer rechtstreeks naar de gast: <a href="mailto:${esc(a.gastEmail)}" style="color:#2F4F3E;font-weight:bold;text-decoration:none;">${esc(a.gastEmail)}</a>`,
        }),
      });

      // To guest
      await resend.emails.send({
        from: `${LODGE_NAME} <lodge@huisterhuynen.nl>`,
        to: [a.gastEmail],
        subject: `Reservering bevestigd — ${LODGE_NAME}`,
        html: lodgeEmail({
          photoUrl, photoAlt: `Lodge ${esc(lodgeNaamBv)}`,
          title: `Bevestigd${firstName ? `, ${firstName}` : ""}`,
          intro: `Jullie reservering voor Lodge ${esc(lodgeNaamBv)} staat klaar. We verheugen ons op de komst en nemen een paar dagen voor aankomst contact op met alle praktische informatie.`,
          blocks: [
            infoBlock("Je verblijf", periodLine, subLine),
            calloutBlock("Wat nu?", "We sturen jullie een paar dagen voor aankomst een persoonlijke gast-app met deurcode, wi-fi, routebeschrijving en tips voor de omgeving."),
            teaserBlock("&#127969;", "Een paar dagen voor aankomst", "Krijg je je gast-app: deurcode, wi-fi, route en lokale tips &mdash; alles op &eacute;&eacute;n plek."),
            checklist([
              "Reservering bevestigd",
              "Bevestigingsmail is dit bericht",
              "Praktische info volgt per gast-app",
            ]),
          ],
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Bevestig error:", err);
    return NextResponse.json({ error: "Kon reservering niet bevestigen" }, { status: 500 });
  }
}
