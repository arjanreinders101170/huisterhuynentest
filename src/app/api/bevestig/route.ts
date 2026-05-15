import { esc, emailWrap } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

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

      // To owner
      await resend.emails.send({
        from: `${LODGE_NAME} <lodge@huisterhuynen.nl>`,
        to: [OWNER_EMAIL],
        subject: `Reservering bevestigd! — ${esc(gastNaam)} · ${esc(a.van)} t/m ${esc(a.tot)}`,
        html: emailWrap(`
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:0 0 20px;"><span style="font-size:22px;color:#2E7D32;letter-spacing:8px;">◆</span></td></tr></table>
          <h1 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:bold;color:#2A2418;text-align:center;">Reservering bevestigd!</h1>
          <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:15px;color:#8A7D6A;text-align:center;">${esc(gastNaam)} heeft het aanbod geaccepteerd.</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F1E8;border-radius:8px;margin-bottom:20px;">
            <tr><td style="padding:18px 20px;" align="center">
              <p style="margin:0 0 4px;font-family:Georgia,'Times New Roman',serif;font-size:18px;color:#2A2418;font-weight:bold;">${esc(a.van)} t/m ${esc(a.tot)}</p>
              <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#2F4F3E;font-weight:bold;">${a.personen} personen &middot; ${bedrag}</p>
            </td></tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:14px;">
            <tr><td style="padding:10px 0;color:#8A7D6A;border-bottom:1px solid #E0D8C8;width:80px;">E-mail</td><td style="padding:10px 0;border-bottom:1px solid #E0D8C8;"><a href="mailto:${esc(a.gastEmail)}" style="color:#2F4F3E;font-weight:bold;text-decoration:none;">${esc(a.gastEmail)}</a></td></tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
            <tr><td style="padding:16px 18px;background-color:#F9F4E8;border-left:3px solid #2F4F3E;border-radius:0 8px 8px 0;">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#2A2418;"><strong>Actie:</strong> Maak een verblijf aan in admin met deurcode en stuur de welkomstmail.</p>
            </td></tr>
          </table>
        `),
        replyTo: a.gastEmail,
      });

      // To guest
      await resend.emails.send({
        from: `${LODGE_NAME} <lodge@huisterhuynen.nl>`,
        to: [a.gastEmail],
        subject: `Reservering bevestigd — ${LODGE_NAME}`,
        html: emailWrap(`
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:0 0 20px;"><span style="font-size:22px;color:#B49A5E;letter-spacing:8px;">◆</span></td></tr></table>
          <h1 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:bold;color:#2A2418;text-align:center;">Je reservering is bevestigd!</h1>
          <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:15px;color:#8A7D6A;text-align:center;line-height:1.6;">
            Wat fijn${gastNaam !== "Gast" ? `, ${esc(gastNaam)}` : ""}! We verheugen ons op jullie komst.
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F1E8;border-radius:8px;margin-bottom:24px;">
            <tr><td style="padding:18px 20px;" align="center">
              <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:10px;color:#8A7D6A;text-transform:uppercase;letter-spacing:1px;">Je verblijf</p>
              <p style="margin:0 0 4px;font-family:Georgia,'Times New Roman',serif;font-size:18px;color:#2A2418;font-weight:bold;">${esc(a.van)} t/m ${esc(a.tot)}</p>
              <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#2F4F3E;font-weight:bold;">${a.personen} personen</p>
            </td></tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr><td style="padding:18px 20px;background-color:#F9F4E8;border-radius:8px;">
              <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#2F4F3E;">Wat nu?</p>
              <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:#2A2418;line-height:1.6;">We nemen binnenkort contact op met praktische informatie over je verblijf: check-in, route, en tips voor je bezoek aan Drenthe.</p>
            </td></tr>
          </table>

          <!-- ► Mini-teaser for the gast-app (arrives T-3) -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr><td style="padding:14px 18px;background-color:#FDFBF6;border:1px solid #E0D8C8;border-radius:8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                <td style="vertical-align:middle;font-family:Arial,sans-serif;font-size:24px;width:42px;">&#127969;</td>
                <td style="vertical-align:middle;">
                  <p style="margin:0 0 2px;font-family:Georgia,serif;font-size:14px;font-weight:bold;color:#2A2418;">Een paar dagen voor aankomst</p>
                  <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#8A7D6A;line-height:1.5;">Krijg je je persoonlijke gast-app: deur, wi-fi, route en tips &mdash; alles op &eacute;&eacute;n plek.</p>
                </td>
              </tr></table>
            </td></tr>
          </table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
            <tr><td style="padding:6px 0;font-family:Arial,sans-serif;font-size:13px;color:#2F4F3E;">&#10003;&ensp;Bevestiging ontvangen</td></tr>
            <tr><td style="padding:6px 0;font-family:Arial,sans-serif;font-size:13px;color:#2F4F3E;">&#10003;&ensp;Praktische info volgt per e-mail</td></tr>
            <tr><td style="padding:6px 0;font-family:Arial,sans-serif;font-size:13px;color:#2F4F3E;">&#10003;&ensp;Vragen? We staan voor je klaar</td></tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E0D8C8;">
            <tr><td style="padding:16px 0 0;"><p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#8A7D6A;">Bel of WhatsApp: <a href="tel:+31642568603" style="color:#2F4F3E;text-decoration:none;font-weight:bold;">+31 6 42568603</a></p></td></tr>
          </table>
        `),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Bevestig error:", err);
    return NextResponse.json({ error: "Kon reservering niet bevestigen" }, { status: 500 });
  }
}
