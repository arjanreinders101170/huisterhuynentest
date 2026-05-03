import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const OWNER_EMAIL = "arjan@vvrvastgoedbv.nl";

function buildEmailHtml(from: string, to: string, email: string, name: string, persons: number, message: string): string {
  const nachten = Math.round((new Date(to).getTime() - new Date(from).getTime()) / (1000 * 60 * 60 * 24));
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#EAE3D2;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:500px;margin:0 auto;padding:32px 24px;">
    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-family:Georgia,serif;font-size:20px;font-weight:600;color:#52502E;">HUIS TER HUYNEN</div>
      <div style="font-size:9px;color:#B49A5E;letter-spacing:.2em;text-transform:uppercase;margin-top:4px;">Boutique Lodge · Zeijen</div>
    </div>
    <div style="background:#FDFBF6;border-radius:16px;border:1px solid #E0D8C8;padding:28px 24px;">
      <div style="font-family:Georgia,serif;font-size:22px;font-weight:600;color:#2A2418;margin-bottom:4px;">Terugkeer aanvraag</div>
      <div style="font-size:13px;color:#8A7D6A;margin-bottom:24px;">Een gast wil graag terugkomen!</div>
      <div style="background:rgba(47,79,62,.05);border-radius:12px;padding:16px 18px;margin-bottom:20px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <div><div style="font-size:10px;color:#8A7D6A;text-transform:uppercase;">Van</div><div style="font-family:Georgia,serif;font-size:16px;color:#2A2418;">${from}</div></div>
          <div style="text-align:right;"><div style="font-size:10px;color:#8A7D6A;text-transform:uppercase;">Tot</div><div style="font-family:Georgia,serif;font-size:16px;color:#2A2418;">${to}</div></div>
        </div>
        <div style="font-size:13px;color:#2F4F3E;font-weight:500;text-align:center;margin-top:4px;">${nachten} nachten · ${persons} ${persons === 1 ? "persoon" : "personen"}</div>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:10px 0;color:#8A7D6A;border-bottom:1px solid #E0D8C8;width:100px;">E-mail</td><td style="padding:10px 0;border-bottom:1px solid #E0D8C8;"><a href="mailto:${email}" style="color:#2F4F3E;">${email}</a></td></tr>
        ${name ? `<tr><td style="padding:10px 0;color:#8A7D6A;border-bottom:1px solid #E0D8C8;">Naam</td><td style="padding:10px 0;color:#2A2418;border-bottom:1px solid #E0D8C8;">${name}</td></tr>` : ""}
        ${message ? `<tr><td style="padding:10px 0;color:#8A7D6A;">Opmerking</td><td style="padding:10px 0;color:#2A2418;">${message}</td></tr>` : ""}
      </table>
      <div style="margin-top:20px;padding:14px 16px;background:rgba(180,154,94,.1);border-radius:10px;border-left:3px solid #B49A5E;">
        <strong style="font-size:13px;color:#2A2418;">Actie:</strong>
        <span style="font-size:13px;color:#2A2418;"> Stuur een persoonlijk aanbod naar deze gast.</span>
      </div>
      <div style="text-align:center;margin-top:24px;">
        <a href="mailto:${email}?subject=Persoonlijk%20aanbod%20Huis%20ter%20Huynen&body=Hoi${name ? "%20" + encodeURIComponent(name) : ""}%2C%0A%0ALeuk%20dat%20je%20terug%20wilt%20komen!%0A%0AVoor%20de%20periode%20${encodeURIComponent(from)}%20t%2Fm%20${encodeURIComponent(to)}%20hebben%20wij%20het%20volgende%20aanbod%3A%0A%0A..."
          style="display:inline-block;padding:12px 28px;background:#2F4F3E;color:#fff;text-decoration:none;border-radius:12px;font-size:14px;">
          Stuur aanbod
        </a>
      </div>
    </div>
    <div style="text-align:center;margin-top:24px;font-size:11px;color:#8A7D6A;">Via de Huis ter Huynen conciërge app</div>
  </div>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const { from, to, email, name, persons, message } = await request.json();

    if (!from || !to || !email) {
      return NextResponse.json({ error: "Periode en e-mail zijn verplicht" }, { status: 400 });
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: "Huis ter Huynen <onboarding@resend.dev>",
          to: [OWNER_EMAIL],
          subject: `Terugkeer aanvraag — ${name || email} · ${from} t/m ${to}`,
          html: buildEmailHtml(from, to, email, name || "", persons || 2, message || ""),
          replyTo: email,
        });
      } catch (e) { console.error("Email error:", e); }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Kon aanvraag niet verwerken" }, { status: 500 });
  }
}
