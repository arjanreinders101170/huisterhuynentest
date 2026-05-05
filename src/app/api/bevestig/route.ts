import { esc } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

const OWNER_EMAIL = "arjan@vvrvastgoedbv.nl";
const LODGE_NAME = "Huis ter Huynen";

function emailWrap(content: string): string {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:#EAE3D2;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#EAE3D2;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
        <tr><td align="center" style="padding:0 0 24px;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:bold;color:#52502E;letter-spacing:2px;">HUIS TER HUYNEN</td></tr>
            <tr><td align="center" style="padding-top:6px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:28px;height:1px;background-color:#B49A5E;"></td><td style="padding:0 10px;font-family:Arial,sans-serif;font-size:9px;color:#B49A5E;letter-spacing:3px;text-transform:uppercase;">Boutique Lodge</td><td style="width:28px;height:1px;background-color:#B49A5E;"></td></tr></table></td></tr>
          </table>
        </td></tr>
        <tr><td>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FDFBF6;border:1px solid #E0D8C8;border-radius:12px;">
            <tr><td style="height:4px;background-color:#B49A5E;border-radius:12px 12px 0 0;font-size:0;line-height:0;">&nbsp;</td></tr>
            <tr><td style="padding:28px 28px 24px;">${content}</td></tr>
          </table>
        </td></tr>
        <tr><td align="center" style="padding:24px 0 0;"><p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#8A7D6A;">${LODGE_NAME} &middot; Zuiderstraat 6 &middot; Zeijen, Drenthe</p></td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

// GET — load aanvraag data for confirmation page
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Geen aanvraag gevonden" }, { status: 400 });

  try {
    // First get the aanvraag
    const { data: aanvraag, error } = await getSupabase()
      .from("terugkeer_aanvragen")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !aanvraag) {
      console.error("Bevestig GET error:", error);
      return NextResponse.json({ error: "Aanvraag niet gevonden" }, { status: 404 });
    }

    // Then get guest info if available
    let gastNaam = "";
    let gastEmail = "";
    if (aanvraag.guest_id) {
      const { data: guest } = await getSupabase()
        .from("guests")
        .select("naam, email")
        .eq("id", aanvraag.guest_id)
        .single();
      if (guest) {
        gastNaam = guest.naam || "";
        gastEmail = guest.email || "";
      }
    }

    return NextResponse.json({
      id: aanvraag.id,
      van: aanvraag.van,
      tot: aanvraag.tot,
      personen: aanvraag.personen,
      status: aanvraag.status,
      offerte_bedrag: aanvraag.offerte_bedrag,
      gastNaam,
      gastEmail,
    });
  } catch (err) {
    console.error("Bevestig GET catch:", err);
    return NextResponse.json({ error: "Kon aanvraag niet laden" }, { status: 500 });
  }
}

// POST — confirm the booking
export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "Geen ID" }, { status: 400 });

    // Load aanvraag
    const { data, error } = await getSupabase()
      .from("terugkeer_aanvragen")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Aanvraag niet gevonden" }, { status: 404 });
    }

    if (data.status === "geboekt") {
      return NextResponse.json({ error: "Deze reservering is al bevestigd" }, { status: 400 });
    }

    // Update status
    await getSupabase().from("terugkeer_aanvragen").update({
      status: "geboekt",
      updated_at: new Date().toISOString(),
    }).eq("id", id);

    // Get guest info separately
    let gastNaam = "Gast";
    let gastEmail = "";
    if (data.guest_id) {
      const { data: guest } = await getSupabase()
        .from("guests")
        .select("naam, email")
        .eq("id", data.guest_id)
        .single();
      if (guest) {
        gastNaam = guest.naam || "Gast";
        gastEmail = guest.email || "";
      }
    }

    // Send confirmation emails
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey && gastEmail) {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);

      // To owner
      await resend.emails.send({
        from: `${LODGE_NAME} <lodge@huisterhuynen.nl>`,
        to: [OWNER_EMAIL],
        subject: `Reservering bevestigd! — ${esc(gastNaam)} · ${esc(data.van)} t/m ${esc(data.tot)}`,
        html: emailWrap(`
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:0 0 20px;"><span style="font-size:22px;color:#2E7D32;letter-spacing:8px;">◆</span></td></tr></table>
          <h1 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:bold;color:#2A2418;text-align:center;">Reservering bevestigd!</h1>
          <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:15px;color:#8A7D6A;text-align:center;">${esc(gastNaam)} heeft het aanbod geaccepteerd.</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F1E8;border-radius:8px;margin-bottom:20px;">
            <tr><td style="padding:18px 20px;" align="center">
              <p style="margin:0 0 4px;font-family:Georgia,'Times New Roman',serif;font-size:18px;color:#2A2418;font-weight:bold;">${esc(data.van)} t/m ${esc(data.tot)}</p>
              <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#2F4F3E;font-weight:bold;">${data.personen} personen &middot; &euro; ${data.offerte_bedrag || "—"}</p>
            </td></tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:14px;">
            <tr><td style="padding:10px 0;color:#8A7D6A;border-bottom:1px solid #E0D8C8;width:80px;">E-mail</td><td style="padding:10px 0;border-bottom:1px solid #E0D8C8;"><a href="mailto:${esc(gastEmail)}" style="color:#2F4F3E;font-weight:bold;text-decoration:none;">${esc(gastEmail)}</a></td></tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
            <tr><td style="padding:16px 18px;background-color:#F9F4E8;border-left:3px solid #2F4F3E;border-radius:0 8px 8px 0;">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#2A2418;"><strong>Actie:</strong> Stuur een bevestigingsmail met praktische informatie.</p>
            </td></tr>
          </table>
        `),
        replyTo: gastEmail,
      });

      // To guest
      await resend.emails.send({
        from: `${LODGE_NAME} <lodge@huisterhuynen.nl>`,
        to: [gastEmail],
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
              <p style="margin:0 0 4px;font-family:Georgia,'Times New Roman',serif;font-size:18px;color:#2A2418;font-weight:bold;">${esc(data.van)} t/m ${esc(data.tot)}</p>
              <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#2F4F3E;font-weight:bold;">${data.personen} personen</p>
            </td></tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr><td style="padding:18px 20px;background-color:#F9F4E8;border-radius:8px;">
              <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#2F4F3E;">Wat nu?</p>
              <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:#2A2418;line-height:1.6;">We nemen binnenkort contact op met praktische informatie over je verblijf: check-in, route, en tips voor je bezoek aan Drenthe.</p>
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
