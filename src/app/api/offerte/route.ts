import { esc, buildOfferteHtml } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { verifyAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

const LODGE_NAME = "Huis ter Huynen";

export async function POST(request: NextRequest) {
  if (!(await verifyAdminSession(request))) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  try {
    let body;
    try { body = await request.json(); } catch {
      return NextResponse.json({ error: "Ongeldige request" }, { status: 400 });
    }

    const { aanvraagId, gastEmail, gastNaam, van, tot, personen, prijsVerblijf, toeristenbelasting, schoonmaak, bericht } = body;

    if (!gastEmail || !prijsVerblijf) {
      return NextResponse.json({ error: "E-mail en prijs zijn verplicht" }, { status: 400 });
    }

    const verblijf = parseFloat(prijsVerblijf) || 0;
    const belasting = parseFloat(toeristenbelasting) || 0;
    const cleaning = parseFloat(schoonmaak) || 0;
    const totaal = (verblijf + belasting + cleaning).toFixed(2);

    // Generate confirm token for secure bevestig link
    const { randomBytes } = await import("crypto");
    const confirmToken = randomBytes(32).toString("hex");

    // Update aanvraag status in database
    if (aanvraagId) {
      try {
        await getSupabase().from("terugkeer_aanvragen").update({
          status: "offerte_verstuurd",
          offerte_bedrag: parseFloat(totaal),
          confirm_token: confirmToken,
          updated_at: new Date().toISOString(),
        }).eq("id", aanvraagId);
      } catch (e) { console.error("Update failed:", e); }
    }

    // Send offerte email to guest
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return NextResponse.json({ error: "E-mail niet geconfigureerd" }, { status: 500 });
    }

    const { Resend } = await import("resend");
    const resend = new Resend(resendKey);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://huisterhuynen.nl";

    await resend.emails.send({
      from: `${LODGE_NAME} <lodge@huisterhuynen.nl>`,
      to: [gastEmail],
      subject: `Persoonlijk aanbod — ${LODGE_NAME}`,
      html: buildOfferteHtml(
        esc(gastNaam || ""), esc(van || ""), esc(tot || ""),
        personen || 2,
        verblijf.toFixed(2), belasting.toFixed(2), cleaning.toFixed(2), totaal,
        esc(bericht || ""), aanvraagId || "", appUrl, confirmToken,
      ),
      replyTo: "lodge@huisterhuynen.nl",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Offerte error:", err);
    return NextResponse.json({ error: "Kon offerte niet versturen" }, { status: 500 });
  }
}
