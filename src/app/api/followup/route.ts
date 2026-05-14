import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { esc } from "@/lib/email";
import { verifyAdminSession } from "@/lib/admin-auth";
import { APP_URL_FALLBACK } from "@/data/lodge";

export const runtime = "nodejs";

const LODGE_NAME = "Huis ter Huynen";

function followUpEmailHtml(naam: string, appUrl: string): string {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:#EAE3D2;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#EAE3D2;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
        <!-- Header -->
        <tr><td align="center" style="padding:0 0 24px;">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:bold;color:#52502E;letter-spacing:2px;">HUIS TER HUYNEN</td></tr>
            <tr><td align="center" style="padding-top:6px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
              <td style="width:28px;height:1px;background-color:#B49A5E;"></td>
              <td style="padding:0 10px;font-family:Arial,sans-serif;font-size:9px;color:#B49A5E;letter-spacing:3px;text-transform:uppercase;">Boutique Lodge</td>
              <td style="width:28px;height:1px;background-color:#B49A5E;"></td>
            </tr></table></td></tr>
          </table>
        </td></tr>
        <!-- Card -->
        <tr><td>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FDFBF6;border:1px solid #E0D8C8;border-radius:12px;">
            <tr><td style="height:4px;background-color:#B49A5E;border-radius:12px 12px 0 0;font-size:0;line-height:0;">&nbsp;</td></tr>
            <tr><td style="padding:28px 28px 24px;">
              <!-- Accent -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr><td align="center" style="padding:0 0 20px;"><span style="font-size:22px;color:#B49A5E;letter-spacing:8px;">&#9679; &#9679; &#9679;</span></td></tr>
              </table>

              <h1 style="margin:0 0 8px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:bold;color:#2A2418;text-align:center;">
                Hoe kijk je terug?
              </h1>
              <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:15px;color:#8A7D6A;line-height:1.6;text-align:center;">
                ${naam ? `Hoi ${naam}, het` : "Het"} is alweer even geleden dat je bij ons was. We hopen dat je genoten hebt van Drenthe!
              </p>

              <!-- Review CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr><td style="padding:20px;background-color:#F5F1E8;border-radius:8px;">
                  <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#2F4F3E;">Vertel ons hoe het was</p>
                  <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:13px;color:#8A7D6A;line-height:1.5;">
                    Jouw ervaring helpt andere gasten en helpt ons om het nóg beter te maken.
                  </p>
                  <table role="presentation" cellpadding="0" cellspacing="0">
                    <tr><td align="center" style="background-color:#2F4F3E;border-radius:8px;">
                      <a href="${appUrl}" style="display:block;padding:12px 28px;color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">
                        Review achterlaten
                      </a>
                    </td></tr>
                  </table>
                </td></tr>
              </table>

              <!-- Terugkomen CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr><td style="padding:20px;background-color:#F9F4E8;border-radius:8px;text-align:center;">
                  <p style="margin:0 0 4px;font-family:Georgia,'Times New Roman',serif;font-size:18px;font-weight:bold;color:#2A2418;">Kom nog eens terug</p>
                  <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:13px;color:#8A7D6A;line-height:1.5;">
                    Als terugkerende gast ontvang je altijd een persoonlijk aanbod — scherper dan op boekingssites.
                  </p>
                  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                    <tr><td align="center" style="border:2px solid #2F4F3E;border-radius:8px;">
                      <a href="${appUrl}" style="display:block;padding:12px 28px;color:#2F4F3E;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">
                        Bekijk beschikbaarheid
                      </a>
                    </td></tr>
                  </table>
                </td></tr>
              </table>

              <!-- Trust -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E0D8C8;">
                <tr><td style="padding:16px 0 0;">
                  <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#8A7D6A;text-align:center;line-height:1.5;">
                    WhatsApp ons op <a href="tel:+31642568603" style="color:#2F4F3E;text-decoration:none;font-weight:bold;">+31 6 42568603</a>
                  </p>
                </td></tr>
              </table>
            </td></tr>
          </table>
        </td></tr>
        <!-- Footer -->
        <tr><td align="center" style="padding:24px 0 0;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:40px;height:1px;background-color:#B49A5E;"></td></tr></table>
          <p style="margin:12px 0 0;font-family:Arial,sans-serif;font-size:11px;color:#8A7D6A;">${LODGE_NAME} &middot; Zuiderstraat 6 &middot; Zeijen, Drenthe</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

// POST — send follow-up emails to guests who visited 14+ days ago
export async function POST(request: NextRequest) {
  if (!(await verifyAdminSession(request))) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || APP_URL_FALLBACK;
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return NextResponse.json({ error: "Resend niet geconfigureerd" }, { status: 500 });
    }

    // Find guests who visited 14+ days ago and haven't received follow-up
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 14);

    const { data: guests } = await getSupabase()
      .from("guests")
      .select("id, naam, email, laatste_bezoek")
      .lt("laatste_bezoek", cutoff.toISOString())
      .order("laatste_bezoek", { ascending: false })
      .limit(20);

    if (!guests || guests.length === 0) {
      return NextResponse.json({ sent: 0, message: "Geen gasten gevonden voor follow-up" });
    }

    // Check which guests already got a follow-up (check bookings metadata)
    const { Resend } = await import("resend");
    const resend = new Resend(resendKey);
    let sent = 0;

    for (const guest of guests) {
      if (!guest.email) continue;

      // Check if we already sent a follow-up (simple: check if there's a booking with product "follow-up")
      const { data: existing } = await getSupabase()
        .from("bookings")
        .select("id")
        .eq("guest_id", guest.id)
        .eq("product", "follow-up-email")
        .limit(1);

      if (existing && existing.length > 0) continue; // Already sent

      // Send follow-up
      try {
        await resend.emails.send({
          from: `${LODGE_NAME} <lodge@huisterhuynen.nl>`,
          to: [guest.email],
          subject: `Hoe was je verblijf? — ${LODGE_NAME}`,
          html: followUpEmailHtml(esc(guest.naam || ""), appUrl),
        });

        // Mark as sent
        await getSupabase().from("bookings").insert({
          guest_id: guest.id,
          product: "follow-up-email",
          prijs: 0,
          status: "betaald",
          metadata: { type: "follow-up", sent_at: new Date().toISOString() },
        });

        sent++;
      } catch (e) {
        console.error(`Follow-up failed for ${guest.id}:`, e);
      }
    }

    return NextResponse.json({ sent, message: `${sent} follow-up email(s) verstuurd` });
  } catch (err) {
    console.error("Follow-up error:", err);
    return NextResponse.json({ error: "Kon follow-ups niet versturen" }, { status: 500 });
  }
}
