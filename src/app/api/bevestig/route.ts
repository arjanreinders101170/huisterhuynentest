import { esc, emailWrap } from "@/lib/email";
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

      // To guest — zelfde stijl als send_late_checkout (lodge-foto bovenin de kaart)
      const appUrlBv = process.env.NEXT_PUBLIC_APP_URL || APP_URL_FALLBACK;
      const baseUrlBv = new URL(appUrlBv).origin;
      const lodgeKey = a.lodge || "lodge_1";
      const lodgePhotoBv = lodgeKey === "lodge_2"
        ? `${baseUrlBv}/lodge-eik.jpg`
        : `${baseUrlBv}/lodge-heide.jpg`;
      const lodgeNaamBv = lodgeName(lodgeKey);
      const firstName = esc((gastNaam || "").split(" ")[0] || gastNaam || "");

      await resend.emails.send({
        from: `${LODGE_NAME} <lodge@huisterhuynen.nl>`,
        to: [a.gastEmail],
        subject: `Reservering bevestigd — ${LODGE_NAME}`,
        html: `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#EAE3D2;font-family:Georgia,serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EAE3D2;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
<tr><td align="center" style="padding:0 0 24px;">
  <table role="presentation" cellpadding="0" cellspacing="0"><tr>
    <td style="font-size:22px;font-weight:bold;color:#52502E;letter-spacing:2px;">HUIS TER HUYNEN</td>
  </tr><tr><td align="center" style="padding-top:6px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
    <td style="width:28px;height:1px;background:#B49A5E;"></td>
    <td style="padding:0 10px;font-family:Arial,sans-serif;font-size:9px;color:#B49A5E;letter-spacing:3px;text-transform:uppercase;">Boutique Lodge</td>
    <td style="width:28px;height:1px;background:#B49A5E;"></td>
  </tr></table></td></tr></table>
</td></tr>
<tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FDFBF6;border:1px solid #E0D8C8;border-radius:12px;overflow:hidden;">
<tr><td style="padding:0;font-size:0;line-height:0;">
  <img src="${lodgePhotoBv}" alt="Lodge ${esc(lodgeNaamBv)}" width="480" style="display:block;width:100%;height:auto;" />
</td></tr>
<tr><td style="padding:32px 28px 28px;">

  <h1 style="margin:0 0 14px;font-size:28px;color:#2A2418;text-align:center;font-family:Georgia,serif;line-height:1.2;">
    Bevestigd${firstName ? `, ${firstName}` : ""}
  </h1>
  <p style="margin:0 0 28px;font-family:Arial,sans-serif;font-size:15px;color:#8A7D6A;line-height:1.6;text-align:center;">
    Jullie reservering voor Lodge ${esc(lodgeNaamBv)} staat klaar. We verheugen ons op de komst en nemen een paar dagen voor aankomst contact op met alle praktische informatie.
  </p>

  <!-- ► Verblijf-block -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F1E8;border-radius:10px;margin-bottom:20px;">
    <tr><td style="padding:18px 20px;" align="center">
      <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:10px;color:#8A7D6A;text-transform:uppercase;letter-spacing:1px;">Je verblijf</p>
      <p style="margin:0 0 6px;font-family:Georgia,serif;font-size:18px;color:#2A2418;font-weight:bold;">${esc(a.van)} t/m ${esc(a.tot)}</p>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#2F4F3E;font-weight:bold;">Lodge ${esc(lodgeNaamBv)} &middot; ${a.personen} ${a.personen === 1 ? "persoon" : "personen"}${a.offerte_bedrag != null ? ` &middot; &euro; ${a.offerte_bedrag.toFixed(2)}` : ""}</p>
    </td></tr>
  </table>

  <!-- ► Wat nu? -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F9F4E8;border-radius:10px;margin-bottom:20px;">
    <tr><td style="padding:18px 20px;">
      <p style="margin:0 0 4px;font-family:Georgia,serif;font-size:16px;font-weight:bold;color:#2A2418;">Wat nu?</p>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#8A7D6A;line-height:1.5;">
        We sturen jullie een paar dagen voor aankomst een persoonlijke gast-app met deurcode, wi-fi, routebeschrijving en tips voor de omgeving.
      </p>
    </td></tr>
  </table>

  <!-- ► Mini-teaser voor gast-app -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
    <tr><td style="padding:14px 18px;background:#FDFBF6;border:1px solid #E0D8C8;border-radius:10px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="vertical-align:middle;font-family:Arial,sans-serif;font-size:24px;width:42px;">&#127969;</td>
        <td style="vertical-align:middle;">
          <p style="margin:0 0 2px;font-family:Georgia,serif;font-size:14px;font-weight:bold;color:#2A2418;">Een paar dagen voor aankomst</p>
          <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#8A7D6A;line-height:1.5;">Krijg je je gast-app: deurcode, wi-fi, route en lokale tips &mdash; alles op &eacute;&eacute;n plek.</p>
        </td>
      </tr></table>
    </td></tr>
  </table>

  <!-- ► Trust-checklist -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
    <tr><td style="padding:3px 0;font-family:Arial,sans-serif;font-size:13px;color:#2F4F3E;">&#10003;&ensp;Reservering bevestigd</td></tr>
    <tr><td style="padding:3px 0;font-family:Arial,sans-serif;font-size:13px;color:#2F4F3E;">&#10003;&ensp;Bevestigingsmail is dit bericht</td></tr>
    <tr><td style="padding:3px 0;font-family:Arial,sans-serif;font-size:13px;color:#2F4F3E;">&#10003;&ensp;Praktische info volgt per gast-app</td></tr>
  </table>

  <!-- ► Footer -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E0D8C8;">
    <tr><td style="padding:16px 0 0;font-family:Arial,sans-serif;font-size:13px;color:#8A7D6A;text-align:center;">
      Vragen? WhatsApp ons op <a href="tel:+31642568603" style="color:#2F4F3E;font-weight:bold;text-decoration:none;">+31 6 42568603</a>
    </td></tr>
  </table>
</td></tr></table></td></tr>
<tr><td align="center" style="padding:24px 0 0;">
  <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:40px;height:1px;background:#B49A5E;"></td></tr></table>
  <p style="margin:12px 0 0;font-family:Arial,sans-serif;font-size:11px;color:#8A7D6A;">Huis ter Huynen &middot; Zuiderstraat 6 &middot; Zeijen, Drenthe</p>
</td></tr>
</table></td></tr></table></body></html>`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Bevestig error:", err);
    return NextResponse.json({ error: "Kon reservering niet bevestigen" }, { status: 500 });
  }
}
