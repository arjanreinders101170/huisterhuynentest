import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

const OWNER_EMAIL = "arjan@vvrvastgoedbv.nl";
const LODGE_NAME = "Huis ter Huynen";

function ownerEmailHtml(van: string, tot: string, email: string, naam: string, personen: number, bericht: string): string {
  const nachten = (() => {
    try {
      // Parse Dutch date "5 juni" style
      return Math.max(1, Math.round((new Date(tot).getTime() - new Date(van).getTime()) / 86400000));
    } catch { return "?"; }
  })();
  return `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#EAE3D2;font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="max-width:500px;margin:0 auto;padding:32px 24px;">
  <div style="text-align:center;margin-bottom:28px;">
    <div style="font-family:Georgia,serif;font-size:20px;font-weight:600;color:#52502E;">HUIS TER HUYNEN</div>
    <div style="font-size:9px;color:#B49A5E;letter-spacing:.2em;text-transform:uppercase;margin-top:4px;">Boutique Lodge · Zeijen</div>
  </div>
  <div style="background:#FDFBF6;border-radius:16px;border:1px solid #E0D8C8;padding:28px 24px;">
    <div style="font-family:Georgia,serif;font-size:22px;font-weight:600;color:#2A2418;margin-bottom:4px;">Terugkeer aanvraag</div>
    <div style="font-size:13px;color:#8A7D6A;margin-bottom:24px;">Een gast wil graag terugkomen!</div>
    <div style="background:rgba(47,79,62,.05);border-radius:12px;padding:16px 18px;margin-bottom:20px;text-align:center;">
      <div style="font-family:Georgia,serif;font-size:16px;color:#2A2418;">${van} — ${tot}</div>
      <div style="font-size:13px;color:#2F4F3E;font-weight:500;margin-top:4px;">${nachten} nachten · ${personen} ${personen === 1 ? "persoon" : "personen"}</div>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:10px 0;color:#8A7D6A;border-bottom:1px solid #E0D8C8;width:100px;">E-mail</td><td style="padding:10px 0;border-bottom:1px solid #E0D8C8;"><a href="mailto:${email}" style="color:#2F4F3E;">${email}</a></td></tr>
      ${naam ? `<tr><td style="padding:10px 0;color:#8A7D6A;border-bottom:1px solid #E0D8C8;">Naam</td><td style="padding:10px 0;color:#2A2418;border-bottom:1px solid #E0D8C8;">${naam}</td></tr>` : ""}
      ${bericht ? `<tr><td style="padding:10px 0;color:#8A7D6A;">Opmerking</td><td style="padding:10px 0;color:#2A2418;">${bericht}</td></tr>` : ""}
    </table>
    <div style="margin-top:20px;padding:14px 16px;background:rgba(180,154,94,.1);border-radius:10px;border-left:3px solid #B49A5E;">
      <strong style="font-size:13px;color:#2A2418;">Actie:</strong>
      <span style="font-size:13px;color:#2A2418;"> Stuur een persoonlijk aanbod naar deze gast.</span>
    </div>
    <div style="text-align:center;margin-top:24px;">
      <a href="mailto:${email}?subject=Persoonlijk%20aanbod%20${LODGE_NAME}&body=Hoi${naam ? "%20" + encodeURIComponent(naam) : ""}%2C%0A%0ALeuk%20dat%20je%20terug%20wilt%20komen!%0A%0AVoor%20de%20periode%20${encodeURIComponent(van)}%20t%2Fm%20${encodeURIComponent(tot)}%20bieden%20wij%20je%3A%0A%0A..."
        style="display:inline-block;padding:12px 28px;background:#2F4F3E;color:#fff;text-decoration:none;border-radius:12px;font-size:14px;">Stuur aanbod</a>
    </div>
  </div>
</div></body></html>`;
}

function guestEmailHtml(naam: string, van: string, tot: string): string {
  return `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#EAE3D2;font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="max-width:500px;margin:0 auto;padding:32px 24px;">
  <div style="text-align:center;margin-bottom:28px;">
    <div style="font-family:Georgia,serif;font-size:20px;font-weight:600;color:#52502E;">HUIS TER HUYNEN</div>
    <div style="font-size:9px;color:#B49A5E;letter-spacing:.2em;text-transform:uppercase;margin-top:4px;">Boutique Lodge · Zeijen</div>
  </div>
  <div style="background:#FDFBF6;border-radius:16px;border:1px solid #E0D8C8;padding:28px 24px;text-align:center;">
    <div style="font-size:36px;margin-bottom:16px;">🌿</div>
    <div style="font-family:Georgia,serif;font-size:24px;font-weight:600;color:#2A2418;margin-bottom:8px;">
      Dank je wel${naam ? `, ${naam}` : ""}
    </div>
    <p style="font-size:15px;color:#8A7D6A;line-height:1.6;margin:0 0 20px;">
      Wat leuk dat je terug wilt komen naar onze lodge! We gaan een persoonlijk aanbod voor je samenstellen.
    </p>
    <div style="background:rgba(47,79,62,.05);border-radius:12px;padding:16px 18px;margin-bottom:20px;">
      <div style="font-size:11px;color:#8A7D6A;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px;">Gewenste periode</div>
      <div style="font-family:Georgia,serif;font-size:16px;color:#2A2418;">${van} — ${tot}</div>
    </div>
    <div style="padding:16px 18px;background:rgba(180,154,94,.08);border-radius:12px;text-align:left;">
      <div style="font-size:14px;color:#2A2418;line-height:1.6;">
        <strong style="color:#2F4F3E;">Wat kun je verwachten?</strong><br>
        Je ontvangt binnen 24 uur een persoonlijk aanbod per e-mail — altijd scherper dan op boekingssites.
      </div>
    </div>
    <div style="margin-top:20px;text-align:left;">
      <div style="font-size:13px;color:#2F4F3E;line-height:1.8;">
        ✓ Beste prijs garantie<br>
        ✓ Speciaal voor terugkerende gasten<br>
        ✓ Geen verplichting
      </div>
    </div>
  </div>
  <div style="text-align:center;margin-top:24px;">
    <div style="width:40px;height:1px;background:#B49A5E;opacity:.4;margin:0 auto 12px;"></div>
    <div style="font-size:11px;color:#8A7D6A;">${LODGE_NAME} · Zuiderstraat 6 · Zeijen, Drenthe</div>
  </div>
</div></body></html>`;
}

export async function POST(request: NextRequest) {
  try {
    let body;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Ongeldige request" }, { status: 400 });
    }

    const { from, to, email, name, persons, message } = body;

    if (!from || !to || !email) {
      return NextResponse.json({ error: "Periode en e-mail zijn verplicht" }, { status: 400 });
    }

    // 1. Upsert guest
    let guestId = null;
    try {
      const { data } = await getSupabase().rpc("upsert_guest", {
        p_naam: name || "",
        p_email: email,
      });
      guestId = data;
    } catch (e) {
      console.error("Guest upsert failed:", e);
    }

    // 2. Insert terugkeer aanvraag
    try {
      await getSupabase().from("terugkeer_aanvragen").insert({
        guest_id: guestId,
        van: from,
        tot: to,
        personen: persons || 2,
        bericht: message || null,
        status: "nieuw",
      });
    } catch (e) {
      console.error("Terugkeer insert failed:", e);
    }

    // 3. Send emails
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);

        // To owner
        await resend.emails.send({
          from: `${LODGE_NAME} <lodge@huisterhuynen.nl>`,
          to: [OWNER_EMAIL],
          subject: `Terugkeer aanvraag — ${name || email} · ${from} t/m ${to}`,
          html: ownerEmailHtml(from, to, email, name || "", persons || 2, message || ""),
          replyTo: email,
        });

        // To guest
        await resend.emails.send({
          from: `${LODGE_NAME} <lodge@huisterhuynen.nl>`,
          to: [email],
          subject: `Je aanvraag is ontvangen — ${LODGE_NAME}`,
          html: guestEmailHtml(name || "", from, to),
        });
      } catch (e) {
        console.error("Email failed:", e);
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Kon aanvraag niet verwerken" }, { status: 500 });
  }
}
