import {
  esc, lodgeEmail, lodgePhoto, infoBlock, calloutBlock, checklist,
  teaserBlock, detailsBlock,
} from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { APP_URL_FALLBACK, lodgeName } from "@/data/lodge";

export const runtime = "nodejs";

const OWNER_EMAIL = process.env.OWNER_EMAIL || "arjan@vvrvastgoedbv.nl";
const LODGE_NAME = "Huis ter Huynen";

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

    // Update status in de juiste tabel
    if (a.source === "v2") {
      await getSupabase().from("booking_requests").update({ status: "bevestigd" }).eq("id", id);
    } else {
      await getSupabase().from("terugkeer_aanvragen").update({
        status: "geboekt",
        updated_at: new Date().toISOString(),
      }).eq("id", id);
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
