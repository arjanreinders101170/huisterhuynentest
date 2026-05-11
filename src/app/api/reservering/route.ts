import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const OWNER_EMAIL = "lodge@huisterhuynen.nl";
const LODGE_NAME = "Huis ter Huynen";
const LODGE_LABELS: Record<string, string> = {
  lodge_1: "Lodge De Heide",
  lodge_2: "Lodge De Eik",
};

function esc(s: string): string {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export async function POST(request: NextRequest) {
  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige request" }, { status: 400 });
  }

  const { naam, email, lodge, checkIn, checkOut, nights, totalPrice, priceLabel, bericht } = body;

  if (!naam || !email || !email.includes("@") || !lodge || !checkIn || !checkOut) {
    return NextResponse.json({ error: "Vereiste velden ontbreken" }, { status: 400 });
  }

  const lodgeLabel = LODGE_LABELS[lodge] || lodge;
  const checkInFmt = fmtDate(checkIn);
  const checkOutFmt = fmtDate(checkOut);
  const nightsNum = parseInt(nights) || 0;
  const totalNum = parseFloat(totalPrice) || 0;

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.log(`[RESERVERING] ${lodgeLabel} | ${checkIn} – ${checkOut} | ${naam} | ${email}`);
    return NextResponse.json({ success: true, emailSent: false });
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(resendKey);

    // E-mail naar eigenaar
    await resend.emails.send({
      from: `${LODGE_NAME} <lodge@huisterhuynen.nl>`,
      to: [OWNER_EMAIL],
      replyTo: email,
      subject: `Reserveringsaanvraag: ${esc(lodgeLabel)} — ${esc(naam)}`,
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#EAE3D2;font-family:Georgia,serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EAE3D2;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
<tr><td align="center" style="padding:0 0 24px;">
  <span style="font-size:22px;font-weight:bold;color:#52502E;letter-spacing:2px;font-family:Georgia,serif;">HUIS TER HUYNEN</span>
</td></tr>
<tr><td>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FDFBF6;border:1px solid #E0D8C8;border-radius:12px;">
<tr><td style="height:4px;background:#B49A5E;border-radius:12px 12px 0 0;">&nbsp;</td></tr>
<tr><td style="padding:28px;">
  <h1 style="margin:0 0 4px;font-size:22px;font-weight:bold;color:#2A2418;">Nieuwe reserveringsaanvraag</h1>
  <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:13px;color:#8A7D6A;">${esc(lodgeLabel)}</p>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F1E8;border-radius:8px;margin-bottom:24px;">
  <tr><td style="padding:18px 20px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:14px;">
      <tr><td style="padding:8px 0;color:#8A7D6A;border-bottom:1px solid #E0D8C8;">Lodge</td><td style="padding:8px 0;text-align:right;font-weight:bold;color:#2A2418;border-bottom:1px solid #E0D8C8;">${esc(lodgeLabel)}</td></tr>
      <tr><td style="padding:8px 0;color:#8A7D6A;border-bottom:1px solid #E0D8C8;">Aankomst</td><td style="padding:8px 0;text-align:right;font-weight:bold;color:#2A2418;border-bottom:1px solid #E0D8C8;">${esc(checkInFmt)}</td></tr>
      <tr><td style="padding:8px 0;color:#8A7D6A;border-bottom:1px solid #E0D8C8;">Vertrek</td><td style="padding:8px 0;text-align:right;font-weight:bold;color:#2A2418;border-bottom:1px solid #E0D8C8;">${esc(checkOutFmt)}</td></tr>
      <tr><td style="padding:8px 0;color:#8A7D6A;border-bottom:1px solid #E0D8C8;">Nachten</td><td style="padding:8px 0;text-align:right;font-weight:bold;color:#2A2418;border-bottom:1px solid #E0D8C8;">${nightsNum}</td></tr>
      <tr><td style="padding:8px 0;color:#8A7D6A;border-bottom:1px solid #E0D8C8;">Tarief</td><td style="padding:8px 0;text-align:right;color:#8A7D6A;border-bottom:1px solid #E0D8C8;">${esc(priceLabel || "")}</td></tr>
      <tr><td style="padding:8px 0;color:#8A7D6A;">Geschatte prijs</td><td style="padding:8px 0;text-align:right;font-weight:bold;color:#2F4F3E;font-size:18px;">€ ${totalNum.toFixed(2)}</td></tr>
    </table>
  </td></tr></table>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:14px;margin-bottom:24px;">
    <tr><td style="padding:8px 0;color:#8A7D6A;border-bottom:1px solid #E0D8C8;width:110px;">Naam</td><td style="padding:8px 0;font-weight:bold;color:#2A2418;border-bottom:1px solid #E0D8C8;">${esc(naam)}</td></tr>
    <tr><td style="padding:8px 0;color:#8A7D6A;border-bottom:1px solid #E0D8C8;">E-mail</td><td style="padding:8px 0;border-bottom:1px solid #E0D8C8;"><a href="mailto:${esc(email)}" style="color:#2F4F3E;font-weight:bold;">${esc(email)}</a></td></tr>
    ${bericht ? `<tr><td style="padding:8px 0;color:#8A7D6A;vertical-align:top;">Bericht</td><td style="padding:8px 0;color:#2A2418;">${esc(bericht)}</td></tr>` : ""}
  </table>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
  <tr><td style="padding:16px 18px;background:#F9F4E8;border-left:3px solid #B49A5E;border-radius:0 8px 8px 0;">
    <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#2A2418;line-height:1.5;">
      <strong>Actie:</strong> Bevestig of wijs af per e-mail aan de gast.
    </p>
  </td></tr></table>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
  <tr><td align="center">
    <a href="mailto:${esc(email)}?subject=Bevestiging%20reservering%20${esc(lodgeLabel)}%20%E2%80%94%20${encodeURIComponent(checkIn)}%20t%2Fm%20${encodeURIComponent(checkOut)}"
      style="display:inline-block;padding:14px 32px;background:#2F4F3E;color:#fff;text-decoration:none;border-radius:8px;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">
      Beantwoord gast &rarr;
    </a>
  </td></tr></table>
</td></tr></table>
</td></tr>
<tr><td align="center" style="padding:20px 0 0;">
  <p style="font-family:Arial,sans-serif;font-size:11px;color:#8A7D6A;">${LODGE_NAME} &middot; Zuiderstraat 6 &middot; Zeijen, Drenthe</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`,
    });

    // Bevestigingsmail aan gast
    await resend.emails.send({
      from: `${LODGE_NAME} <lodge@huisterhuynen.nl>`,
      to: [email],
      subject: `Aanvraag ontvangen — ${LODGE_NAME}`,
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#EAE3D2;font-family:Georgia,serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EAE3D2;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
<tr><td align="center" style="padding:0 0 24px;">
  <span style="font-size:22px;font-weight:bold;color:#52502E;letter-spacing:2px;font-family:Georgia,serif;">HUIS TER HUYNEN</span>
</td></tr>
<tr><td>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FDFBF6;border:1px solid #E0D8C8;border-radius:12px;">
<tr><td style="height:4px;background:#B49A5E;border-radius:12px 12px 0 0;">&nbsp;</td></tr>
<tr><td style="padding:28px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:0 0 16px;"><span style="font-size:22px;color:#B49A5E;letter-spacing:8px;">&#9830;</span></td></tr>
  </table>
  <h1 style="margin:0 0 8px;font-size:24px;font-weight:bold;color:#2A2418;text-align:center;">Bedankt, ${esc(naam)}!</h1>
  <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:14px;color:#8A7D6A;text-align:center;line-height:1.6;">
    We hebben je aanvraag ontvangen en nemen binnen 24 uur contact met je op.
  </p>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F1E8;border-radius:8px;margin-bottom:24px;">
  <tr><td style="padding:18px 20px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:14px;">
      <tr><td colspan="2" style="font-size:10px;color:#8A7D6A;text-transform:uppercase;letter-spacing:1px;padding-bottom:10px;">Jouw aanvraag</td></tr>
      <tr><td style="padding:6px 0;color:#8A7D6A;border-bottom:1px solid #E0D8C8;">Lodge</td><td style="padding:6px 0;text-align:right;font-weight:bold;color:#2A2418;border-bottom:1px solid #E0D8C8;">${esc(lodgeLabel)}</td></tr>
      <tr><td style="padding:6px 0;color:#8A7D6A;border-bottom:1px solid #E0D8C8;">Aankomst</td><td style="padding:6px 0;text-align:right;font-weight:bold;color:#2A2418;border-bottom:1px solid #E0D8C8;">${esc(checkInFmt)}</td></tr>
      <tr><td style="padding:6px 0;color:#8A7D6A;border-bottom:1px solid #E0D8C8;">Vertrek</td><td style="padding:6px 0;text-align:right;font-weight:bold;color:#2A2418;border-bottom:1px solid #E0D8C8;">${esc(checkOutFmt)}</td></tr>
      <tr><td style="padding:6px 0;color:#8A7D6A;">Geschatte prijs</td><td style="padding:6px 0;text-align:right;font-weight:bold;color:#2F4F3E;font-size:16px;">€ ${totalNum.toFixed(2)}</td></tr>
    </table>
  </td></tr></table>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
    <tr><td style="padding:5px 0;font-family:Arial,sans-serif;font-size:13px;color:#2F4F3E;">&#10003;&ensp;Persoonlijke bevestiging binnen 24 uur</td></tr>
    <tr><td style="padding:5px 0;font-family:Arial,sans-serif;font-size:13px;color:#2F4F3E;">&#10003;&ensp;Geen vooruitbetaling vereist voor de aanvraag</td></tr>
    <tr><td style="padding:5px 0;font-family:Arial,sans-serif;font-size:13px;color:#2F4F3E;">&#10003;&ensp;Vragen? Bel of WhatsApp ons gerust</td></tr>
  </table>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E0D8C8;">
  <tr><td style="padding:16px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#8A7D6A;text-align:center;">
    <a href="tel:+31642568603" style="color:#2F4F3E;font-weight:bold;text-decoration:none;">+31 6 42568603</a> &middot;
    <a href="https://wa.me/31642568603" style="color:#2F4F3E;font-weight:bold;text-decoration:none;">WhatsApp</a>
  </td></tr></table>
</td></tr></table>
</td></tr>
<tr><td align="center" style="padding:20px 0 0;">
  <p style="font-family:Arial,sans-serif;font-size:11px;color:#8A7D6A;">${LODGE_NAME} &middot; Zuiderstraat 6 &middot; Zeijen, Drenthe</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`,
    });

    return NextResponse.json({ success: true, emailSent: true });
  } catch (e) {
    console.error("Reservering email error:", e);
    return NextResponse.json({ success: true, emailSent: false });
  }
}
