import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import {
  esc, buildOfferteHtmlV2, type OfferteRegel,
  lodgeEmail, lodgePhoto, infoBlock, calloutBlock, ctaButton,
} from "@/lib/email";
import { WIFI_SSID, WIFI_PASSWORD, APP_URL_FALLBACK, lodgeName } from "@/data/lodge";
import { verifyAdminSession } from "@/lib/admin-auth";
import { computeStayPrice } from "@/lib/pricing";

export const runtime = "nodejs";

// GET — fetch table data
export async function GET(request: NextRequest) {
  if (!(await verifyAdminSession(request))) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const table = request.nextUrl.searchParams.get("table");

  try {
    switch (table) {
      case "bookings": {
        const { data } = await getSupabase()
          .from("bookings")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);
        return NextResponse.json({ data: data || [] });
      }
      case "guests": {
        const { data } = await getSupabase()
          .from("guests")
          .select("*")
          .order("laatste_bezoek", { ascending: false })
          .limit(50);
        return NextResponse.json({ data: data || [] });
      }
      case "reviews": {
        const { data } = await getSupabase()
          .from("reviews")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);
        return NextResponse.json({ data: data || [] });
      }
      case "products": {
        const { data } = await getSupabase()
          .from("products")
          .select("*")
          .order("volgorde", { ascending: true });
        return NextResponse.json({ data: data || [] });
      }
      case "invoices": {
        const { data } = await getSupabase()
          .from("invoices")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);
        return NextResponse.json({ data: data || [] });
      }
      case "pricing_periods": {
        const { data, error } = await getSupabase()
          .from("pricing_periods")
          .select("*")
          .order("start_date", { ascending: true });
        if (error) return NextResponse.json({ data: [], error: error.message });
        return NextResponse.json({ data: data || [] });
      }
      case "pricing_config": {
        const { data, error } = await getSupabase()
          .from("pricing_config")
          .select("*");
        if (error) return NextResponse.json({ data: [], error: error.message });
        return NextResponse.json({ data: data || [] });
      }
      case "availability_discounts": {
        const lodge = request.nextUrl.searchParams.get("lodge_id");
        const query = getSupabase().from("availability_discounts").select("*").order("days_before", { ascending: true });
        const { data, error } = lodge ? await query.eq("lodge_id", lodge) : await query;
        if (error) return NextResponse.json({ data: [], error: error.message });
        return NextResponse.json({ data: data || [] });
      }
      case "discount_codes": {
        const { data, error } = await getSupabase()
          .from("discount_codes")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) return NextResponse.json({ data: [], error: error.message });
        return NextResponse.json({ data: data || [] });
      }
      case "stays": {
        const { data: staysRaw } = await getSupabase()
          .from("stays")
          .select("*")
          .order("check_in", { ascending: false })
          .limit(50);
        // Enrich with guest names
        const staysList = staysRaw || [];
        const guestIds = [...new Set(staysList.map((s: { guest_id: string }) => s.guest_id).filter(Boolean))];
        let guestLookup: Record<string, { naam: string; email: string }> = {};
        if (guestIds.length > 0) {
          const { data: guestsData } = await getSupabase().from("guests").select("id, naam, email").in("id", guestIds);
          if (guestsData) {
            guestLookup = Object.fromEntries(guestsData.map((g: { id: string; naam: string; email: string }) => [g.id, { naam: g.naam, email: g.email }]));
          }
        }
        const enriched = staysList.map((s: { guest_id: string }) => ({ ...s, guests: guestLookup[s.guest_id] || null }));
        return NextResponse.json({ data: enriched });
      }
      case "blog_posts": {
        const { data, error } = await getSupabase()
          .from("blog_posts")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) return NextResponse.json({ data: [], error: error.message });
        return NextResponse.json({ data: data || [] });
      }
      case "booking_requests": {
        const { data: raw, error } = await getSupabase()
          .from("booking_requests")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);
        if (error) return NextResponse.json({ data: [], error: error.message });
        const list = raw || [];
        const guestIds = [...new Set(list.map((r: { guest_id: string | null }) => r.guest_id).filter(Boolean))] as string[];
        let guestLookup: Record<string, { naam: string; email: string }> = {};
        if (guestIds.length > 0) {
          const { data: gd } = await getSupabase().from("guests").select("id, naam, email").in("id", guestIds);
          if (gd) guestLookup = Object.fromEntries(gd.map((g: { id: string; naam: string; email: string }) => [g.id, { naam: g.naam, email: g.email }]));
        }
        const enriched = list.map((r: { guest_id: string | null }) => ({ ...r, guest: r.guest_id ? guestLookup[r.guest_id] || null : null }));
        return NextResponse.json({ data: enriched });
      }
      case "fee_templates": {
        const { data, error } = await getSupabase()
          .from("fee_templates")
          .select("*")
          .order("volgorde", { ascending: true });
        if (error) return NextResponse.json({ data: [], error: error.message });
        return NextResponse.json({ data: data || [] });
      }
      default:
        return NextResponse.json({ error: "Onbekende tabel" }, { status: 400 });
    }
  } catch (err) {
    console.error("Admin data error:", err);
    return NextResponse.json({ error: "Kon data niet laden" }, { status: 500 });
  }
}

// POST — admin actions
export async function POST(request: NextRequest) {
  if (!(await verifyAdminSession(request))) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "toggle_review": {
        await getSupabase()
          .from("reviews")
          .update({ zichtbaar: body.visible })
          .eq("id", body.id);
        return NextResponse.json({ success: true });
      }
      case "create_product": {
        const { id, naam, omschrijving, prijs, categorie, volgorde, btw_percentage, grootboek_code } = body;
        if (!id || !naam || prijs === undefined) {
          return NextResponse.json({ error: "ID, naam en prijs zijn verplicht" }, { status: 400 });
        }
        const { error } = await getSupabase().from("products").insert({
          id, naam, omschrijving: omschrijving || null,
          prijs: parseFloat(prijs),
          categorie: categorie || "upsell",
          volgorde: volgorde || 0,
          btw_percentage: btw_percentage ?? 21,
          grootboek_code: grootboek_code || "8020",
          actief: true,
        });
        if (error) {
          if (error.code === "23505") return NextResponse.json({ error: "Product ID bestaat al" }, { status: 400 });
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true });
      }
      case "update_product": {
        const { id, naam, omschrijving, prijs, categorie, volgorde, btw_percentage, grootboek_code } = body;
        if (!id) return NextResponse.json({ error: "Product ID is verplicht" }, { status: 400 });
        const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (naam !== undefined) updates.naam = naam;
        if (omschrijving !== undefined) updates.omschrijving = omschrijving;
        if (prijs !== undefined) updates.prijs = parseFloat(prijs);
        if (categorie !== undefined) updates.categorie = categorie;
        if (volgorde !== undefined) updates.volgorde = volgorde;
        if (btw_percentage !== undefined) updates.btw_percentage = btw_percentage;
        if (grootboek_code !== undefined) updates.grootboek_code = grootboek_code;
        await getSupabase().from("products").update(updates).eq("id", id);
        return NextResponse.json({ success: true });
      }
      case "toggle_product": {
        await getSupabase()
          .from("products")
          .update({ actief: body.actief, updated_at: new Date().toISOString() })
          .eq("id", body.id);
        return NextResponse.json({ success: true });
      }
      case "delete_product": {
        await getSupabase()
          .from("products")
          .delete()
          .eq("id", body.id);
        return NextResponse.json({ success: true });
      }
      case "create_stay": {
        const { naam, email, lodge, check_in, check_out } = body;
        if (!naam || !email || !lodge || !check_in || !check_out) {
          return NextResponse.json({ error: "Alle velden zijn verplicht" }, { status: 400 });
        }

        // Upsert guest
        let guestId = null;
        try {
          const { data } = await getSupabase().rpc("upsert_guest", { p_naam: naam, p_email: email });
          guestId = data;
        } catch {
          // Fallback: check if guest exists, then insert or use existing
          const { data: existing } = await getSupabase().from("guests").select("id").eq("email", email).single();
          if (existing) {
            guestId = existing.id;
          } else {
            const { data: created } = await getSupabase().from("guests").insert({ naam, email, profiel: "gast" }).select("id").single();
            guestId = created?.id;
          }
        }

        if (!guestId) {
          return NextResponse.json({ error: "Kon gast niet aanmaken" }, { status: 500 });
        }

        // Generate codes (wifi is static per lodge — see src/data/lodge.ts)
        const { randomBytes, randomInt } = await import("crypto");
        const token = randomBytes(24).toString("hex");
        const door_code = String(randomInt(1000, 9999));

        const { error } = await getSupabase().from("stays").insert({
          guest_id: guestId,
          lodge,
          check_in,
          check_out,
          token,
          door_code,
          status: "gepland",
          welcome_sent: false,
        });

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true });
      }
      case "send_welcome": {
        const stayId = body.id;
        if (!stayId) return NextResponse.json({ error: "Stay ID verplicht" }, { status: 400 });

        // Fetch stay
        const { data: stay, error: stayErr } = await getSupabase()
          .from("stays")
          .select("*")
          .eq("id", stayId)
          .single();

        if (stayErr || !stay) {
          console.error("Stay fetch error:", stayErr);
          return NextResponse.json({ error: "Verblijf niet gevonden" }, { status: 404 });
        }

        // Fetch guest separately (avoids join issues)
        const { data: guest } = await getSupabase()
          .from("guests")
          .select("naam, email")
          .eq("id", stay.guest_id)
          .single();

        if (!guest || !guest.email) {
          return NextResponse.json({ error: "Gast niet gevonden of geen emailadres" }, { status: 404 });
        }
        const resendKey = process.env.RESEND_API_KEY;
        if (!resendKey) {
          return NextResponse.json({ error: "Resend niet geconfigureerd" }, { status: 500 });
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || APP_URL_FALLBACK;
        const baseUrl = new URL(appUrl).origin;
        const lodgeNaam = lodgeName(stay.lodge);
        const lodgePhoto = stay.lodge === "lodge_1"
          ? `${baseUrl}/lodge-heide.jpg`
          : `${baseUrl}/lodge-eik.jpg`;
        const checkInDate = new Date(stay.check_in).toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });
        const checkOutDate = new Date(stay.check_out).toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });
        const appLink = `${appUrl}?s=${stay.token}`;

        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);

        const esc = (s: string) => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));
        const firstName = esc((guest.naam || "").split(" ")[0] || guest.naam || "");

        await resend.emails.send({
          from: "Huis ter Huynen <lodge@huisterhuynen.nl>",
          to: [guest.email],
          subject: `Jouw gast-app staat klaar — ${checkInDate}`,
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
  <img src="${lodgePhoto}" alt="Lodge ${esc(lodgeNaam)}" width="480" style="display:block;width:100%;height:auto;" />
</td></tr>
<tr><td style="padding:32px 28px 28px;">

  <!-- ► Personal greeting first -->
  <h1 style="margin:0 0 14px;font-size:28px;color:#2A2418;text-align:center;font-family:Georgia,serif;line-height:1.2;">
    Welkom${firstName ? `, ${firstName}` : ""}
  </h1>
  <p style="margin:0 0 28px;font-family:Arial,sans-serif;font-size:15px;color:#8A7D6A;line-height:1.6;text-align:center;">
    Jullie Lodge ${esc(lodgeNaam)} staat klaar voor ${checkInDate}. We hebben een persoonlijke gast-app voor jullie ingericht &mdash; één tik en alles staat op zijn plek.
  </p>

  <!-- ► Dominant CTA: open de gast-app -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;"><tr>
        <td align="center" style="background:#2F4F3E;border-radius:14px;">
          <a href="${appLink}" style="display:block;padding:18px 24px;color:#fff;text-decoration:none;font-family:Georgia,serif;font-size:17px;font-weight:bold;border-radius:14px;">
            Open jullie gast-app &#8594;
          </a>
        </td>
      </tr></table>
    </td></tr>
  </table>
  <p style="margin:0 0 28px;font-family:Arial,sans-serif;font-size:12px;color:#8A7D6A;text-align:center;line-height:1.5;">
    Tip: zet 'm op je beginscherm zodat je 'm bij aankomst direct paraat hebt.
  </p>

  <!-- ► Quick logistics — smaller, secondary -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F1E8;border-radius:10px;margin-bottom:20px;">
    <tr><td style="padding:16px 20px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:13px;">
        <tr><td style="padding:5px 0;color:#8A7D6A;">Aankomst</td><td style="padding:5px 0;text-align:right;font-weight:bold;color:#2A2418;">${checkInDate} · vanaf 15:00</td></tr>
        <tr><td style="padding:5px 0;color:#8A7D6A;">Vertrek</td><td style="padding:5px 0;text-align:right;font-weight:bold;color:#2A2418;">${checkOutDate} · voor 11:00</td></tr>
        <tr><td style="padding:5px 0;color:#8A7D6A;">Lodge</td><td style="padding:5px 0;text-align:right;font-weight:bold;color:#2A2418;">Lodge ${esc(lodgeNaam)}</td></tr>
        <tr><td style="padding:5px 0;color:#8A7D6A;">Deurcode</td><td style="padding:5px 0;text-align:right;font-weight:bold;color:#2F4F3E;letter-spacing:1px;">${stay.door_code}</td></tr>
      </table>
    </td></tr>
  </table>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
    <tr><td style="padding:3px 0;font-family:Arial,sans-serif;font-size:13px;color:#2F4F3E;">&#10003; Inchecken vanaf 15:00, sleutel niet nodig</td></tr>
    <tr><td style="padding:3px 0;font-family:Arial,sans-serif;font-size:13px;color:#2F4F3E;">&#10003; Laadpaal beschikbaar op locatie</td></tr>
    <tr><td style="padding:3px 0;font-family:Arial,sans-serif;font-size:13px;color:#2F4F3E;">&#10003; Tips, route en extra's regelen via de app</td></tr>
  </table>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E0D8C8;">
    <tr><td style="padding:16px 0 0;font-family:Arial,sans-serif;font-size:13px;color:#8A7D6A;text-align:center;">
      <strong style="color:#2A2418;">Route:</strong> A28 → afslag Zeijen → Zuiderstraat 6<br/>
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

        // Mark as sent
        await getSupabase().from("stays").update({
          welcome_sent: true,
          welcome_sent_at: new Date().toISOString(),
        }).eq("id", stayId);

        return NextResponse.json({ success: true });
      }
      case "send_late_checkout": {
        // Evening-before-departure reminder with one-tap booking link
        const stayId = body.id;
        if (!stayId) return NextResponse.json({ error: "Stay ID verplicht" }, { status: 400 });

        const { data: stay } = await getSupabase().from("stays").select("*").eq("id", stayId).single();
        if (!stay) return NextResponse.json({ error: "Verblijf niet gevonden" }, { status: 404 });

        const { data: guest } = await getSupabase().from("guests").select("naam, email").eq("id", stay.guest_id).single();
        if (!guest?.email) return NextResponse.json({ error: "Geen emailadres" }, { status: 404 });

        const resendKey = process.env.RESEND_API_KEY;
        if (!resendKey) return NextResponse.json({ error: "Resend niet geconfigureerd" }, { status: 500 });

        const appUrlLc = process.env.NEXT_PUBLIC_APP_URL || APP_URL_FALLBACK;
        const appLinkLc = `${appUrlLc}?s=${stay.token}`;
        const baseUrlLc = new URL(appUrlLc).origin;
        const lodgePhotoLc = stay.lodge === "lodge_1" ? `${baseUrlLc}/lodge-heide.jpg` : `${baseUrlLc}/lodge-eik.jpg`;
        const lodgeNaamLc = lodgeName(stay.lodge);
        const esc = (s: string) => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));
        const firstName = esc((guest.naam || "").split(" ")[0] || guest.naam || "");

        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);

        await resend.emails.send({
          from: "Huis ter Huynen <lodge@huisterhuynen.nl>",
          to: [guest.email],
          subject: `Nog één nacht — tot morgen 11:00`,
          html: `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
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
  <img src="${lodgePhotoLc}" alt="Lodge ${esc(lodgeNaamLc)}" width="480" style="display:block;width:100%;height:auto;" />
</td></tr>
<tr><td style="padding:32px 28px 28px;">
  <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:15px;color:#8A7D6A;line-height:1.6;text-align:center;">
    ${firstName ? `${firstName}, nog` : "Nog"} één nacht en dan zit het er weer op. We hopen dat jullie een heerlijk verblijf hebben gehad. Geniet vanavond nog even van de stilte.
  </p>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F9F4E8;border-radius:10px;margin-bottom:20px;">
    <tr><td style="padding:18px 20px;">
      <p style="margin:0 0 4px;font-family:Georgia,serif;font-size:16px;font-weight:bold;color:#2A2418;">Nog niet klaar om te gaan?</p>
      <p style="margin:0 0 14px;font-family:Arial,sans-serif;font-size:13px;color:#8A7D6A;line-height:1.5;">
        Boek een late check-out &mdash; ideaal voor een lekker lang ontbijt of nog even een boswandeling.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>
        <td align="center" style="background:#2F4F3E;border-radius:10px;">
          <a href="${appLinkLc}" style="display:block;padding:12px 24px;color:#fff;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;border-radius:10px;">
            Vraag late check-out aan
          </a>
        </td>
      </tr></table>
    </td></tr>
  </table>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
    <tr><td style="padding:3px 0;font-family:Arial,sans-serif;font-size:13px;color:#2F4F3E;">&#10003; Standaard check-out tot 11:00</td></tr>
    <tr><td style="padding:3px 0;font-family:Arial,sans-serif;font-size:13px;color:#2F4F3E;">&#10003; Late check-out tot 13:00 via de app</td></tr>
    <tr><td style="padding:3px 0;font-family:Arial,sans-serif;font-size:13px;color:#2F4F3E;">&#10003; Vergeet niet om de checklist in de app af te vinken</td></tr>
  </table>

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

        return NextResponse.json({ success: true });
      }
      case "send_thankyou": {
        const stayId = body.id;
        if (!stayId) return NextResponse.json({ error: "Stay ID verplicht" }, { status: 400 });

        const { data: stay } = await getSupabase().from("stays").select("*").eq("id", stayId).single();
        if (!stay) return NextResponse.json({ error: "Verblijf niet gevonden" }, { status: 404 });

        const { data: guest } = await getSupabase().from("guests").select("naam, email").eq("id", stay.guest_id).single();
        if (!guest?.email) return NextResponse.json({ error: "Geen emailadres" }, { status: 404 });

        const resendKey = process.env.RESEND_API_KEY;
        if (!resendKey) return NextResponse.json({ error: "Resend niet geconfigureerd" }, { status: 500 });

        const appUrlTy = process.env.NEXT_PUBLIC_APP_URL || APP_URL_FALLBACK;
        const baseUrlTy = new URL(appUrlTy).origin;
        const naam = esc(guest.naam || "");
        const firstName = naam.split(" ")[0] || naam;
        const { url: photoUrlTy } = lodgePhoto(baseUrlTy, stay.lodge);

        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);

        await resend.emails.send({
          from: "Huis ter Huynen <lodge@huisterhuynen.nl>",
          to: [guest.email],
          subject: "Bedankt voor je bezoek — Huis ter Huynen",
          html: lodgeEmail({
            photoUrl: photoUrlTy, photoAlt: "Huis ter Huynen",
            title: `Tot snel${firstName ? `, ${firstName}` : ""}`,
            intro: "De heide kleurt, het bos ruist, en de hottub dampt zachtjes in de ochtendlucht. Zo gaat het hier elke dag verder &mdash; ook als je er even niet bent. We hopen dat Drenthe je goed heeft gedaan.",
            blocks: [
              calloutBlock("Vertel ons hoe het was", "Jouw ervaring helpt andere gasten en helpt ons om het n&oacute;g beter te maken. Het kost maar een paar minuten."),
              ctaButton(appUrlTy, "Review achterlaten"),
            ],
            footer: "Mocht je ooit terug willen &mdash; je bent altijd welkom. Het Huynen team",
          }),
        });

        // Update stay status
        await getSupabase().from("stays").update({ status: "vertrokken" }).eq("id", stayId);

        return NextResponse.json({ success: true });
      }
      case "save_pricing_config": {
        const { lodge_id, base_price, surcharge_config } = body;
        if (!lodge_id || base_price === undefined) {
          return NextResponse.json({ error: "lodge_id en base_price zijn verplicht" }, { status: 400 });
        }
        const { error } = await getSupabase().from("pricing_config").upsert({
          lodge_id,
          base_price: parseFloat(base_price),
          surcharge_config: surcharge_config ?? {},
          updated_at: new Date().toISOString(),
        }, { onConflict: "lodge_id" });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
      }
      case "save_availability_discounts": {
        const { lodge_id, discounts } = body as { lodge_id: string; discounts: Array<{ days_before: number; discount_pct: number }> };
        if (!lodge_id || !Array.isArray(discounts)) {
          return NextResponse.json({ error: "lodge_id en discounts zijn verplicht" }, { status: 400 });
        }
        await getSupabase().from("availability_discounts").delete().eq("lodge_id", lodge_id);
        if (discounts.length > 0) {
          const { error } = await getSupabase().from("availability_discounts").insert(
            discounts.map(d => ({ lodge_id, days_before: d.days_before, discount_pct: d.discount_pct }))
          );
          if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true });
      }
      case "create_pricing_period": {
        const { lodge_id, label, start_date, end_date, price_per_night } = body;
        if (!lodge_id || !label || !start_date || !end_date || price_per_night === undefined) {
          return NextResponse.json({ error: "Alle velden zijn verplicht" }, { status: 400 });
        }
        const { error } = await getSupabase().from("pricing_periods").insert({
          lodge_id, label, start_date, end_date,
          price_per_night: parseFloat(price_per_night),
        });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
      }
      case "update_pricing_period": {
        const { id, lodge_id, label, start_date, end_date, price_per_night } = body;
        if (!id) return NextResponse.json({ error: "ID verplicht" }, { status: 400 });
        const updates: Record<string, unknown> = {};
        if (lodge_id !== undefined) updates.lodge_id = lodge_id;
        if (label !== undefined) updates.label = label;
        if (start_date !== undefined) updates.start_date = start_date;
        if (end_date !== undefined) updates.end_date = end_date;
        if (price_per_night !== undefined) updates.price_per_night = parseFloat(price_per_night);
        await getSupabase().from("pricing_periods").update(updates).eq("id", id);
        return NextResponse.json({ success: true });
      }
      case "delete_pricing_period": {
        if (!body.id) return NextResponse.json({ error: "ID verplicht" }, { status: 400 });
        await getSupabase().from("pricing_periods").delete().eq("id", body.id);
        return NextResponse.json({ success: true });
      }
      case "create_discount_code": {
        const { code, omschrijving, type, waarde, geldig_van, geldig_tot, max_gebruik, min_nachten } = body;
        if (!code || !type || !waarde) return NextResponse.json({ error: "Code, type en waarde zijn verplicht" }, { status: 400 });
        const { data, error } = await getSupabase().from("discount_codes").insert({
          code: String(code).toUpperCase().trim(),
          omschrijving: omschrijving || null,
          type,
          waarde: parseFloat(waarde),
          geldig_van: geldig_van || null,
          geldig_tot: geldig_tot || null,
          max_gebruik: max_gebruik ? parseInt(max_gebruik) : null,
          min_nachten: min_nachten ? parseInt(min_nachten) : null,
          actief: true,
        }).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json({ success: true, data });
      }
      case "update_discount_code": {
        const { id, code, omschrijving, type, waarde, geldig_van, geldig_tot, max_gebruik, min_nachten } = body;
        if (!id) return NextResponse.json({ error: "ID verplicht" }, { status: 400 });
        const { error } = await getSupabase().from("discount_codes").update({
          code: String(code).toUpperCase().trim(),
          omschrijving: omschrijving || null,
          type,
          waarde: parseFloat(waarde),
          geldig_van: geldig_van || null,
          geldig_tot: geldig_tot || null,
          max_gebruik: max_gebruik ? parseInt(max_gebruik) : null,
          min_nachten: min_nachten ? parseInt(min_nachten) : null,
        }).eq("id", id);
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json({ success: true });
      }
      case "toggle_discount_code": {
        if (!body.id) return NextResponse.json({ error: "ID verplicht" }, { status: 400 });
        await getSupabase().from("discount_codes").update({ actief: body.actief === "true" || body.actief === true }).eq("id", body.id);
        return NextResponse.json({ success: true });
      }
      case "delete_discount_code": {
        if (!body.id) return NextResponse.json({ error: "ID verplicht" }, { status: 400 });
        await getSupabase().from("discount_codes").delete().eq("id", body.id);
        return NextResponse.json({ success: true });
      }
      case "reset_discount_usage": {
        if (!body.id) return NextResponse.json({ error: "ID verplicht" }, { status: 400 });
        await getSupabase().from("discount_codes").update({ gebruik_count: 0 }).eq("id", body.id);
        return NextResponse.json({ success: true });
      }
      case "create_blog_post": {
        const { slug, titel, intro, inhoud, categorie, leestijd, auteur } = body;
        if (!slug || !titel || !inhoud) return NextResponse.json({ error: "Slug, titel en inhoud zijn verplicht" }, { status: 400 });
        const { data, error } = await getSupabase().from("blog_posts").insert({
          slug: String(slug).toLowerCase().trim().replace(/\s+/g, "-"),
          titel, intro, inhoud,
          categorie: categorie || "Verhaal",
          leestijd: leestijd || "4 minuten",
          auteur: auteur || "Arjan Reinders",
          gepubliceerd: false,
        }).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json({ success: true, data });
      }
      case "update_blog_post": {
        const { id, slug, titel, intro, inhoud, categorie, leestijd, auteur } = body;
        if (!id) return NextResponse.json({ error: "ID verplicht" }, { status: 400 });
        const { error } = await getSupabase().from("blog_posts").update({
          slug: String(slug).toLowerCase().trim().replace(/\s+/g, "-"),
          titel, intro, inhoud, categorie, leestijd, auteur,
          updated_at: new Date().toISOString(),
        }).eq("id", id);
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json({ success: true });
      }
      case "publish_blog_post": {
        if (!body.id) return NextResponse.json({ error: "ID verplicht" }, { status: 400 });
        const gepubliceerd = body.gepubliceerd === true || body.gepubliceerd === "true";
        await getSupabase().from("blog_posts").update({
          gepubliceerd,
          gepubliceerd_op: gepubliceerd ? new Date().toISOString().slice(0, 10) : null,
          updated_at: new Date().toISOString(),
        }).eq("id", body.id);
        return NextResponse.json({ success: true });
      }
      case "delete_blog_post": {
        if (!body.id) return NextResponse.json({ error: "ID verplicht" }, { status: 400 });
        await getSupabase().from("blog_posts").delete().eq("id", body.id);
        return NextResponse.json({ success: true });
      }
      case "prefill_offerte": {
        const { requestId } = body;
        if (!requestId) return NextResponse.json({ error: "requestId verplicht" }, { status: 400 });

        const sb = getSupabase();
        const { data: req, error: reqErr } = await sb.from("booking_requests").select("*").eq("id", requestId).single();
        if (reqErr || !req) return NextResponse.json({ error: "Aanvraag niet gevonden" }, { status: 404 });

        const personen = req.personen || 2;
        const nachten = req.nachten || (req.check_in && req.check_out
          ? Math.max(0, Math.round((new Date(req.check_out).getTime() - new Date(req.check_in).getTime()) / 86400000))
          : 0);

        // 1. Verblijf: bereken server-side voor zekerheid; val terug op voorgestelde_prijs
        let verblijf = Number(req.voorgestelde_prijs) || 0;
        if (req.lodge && req.check_in && req.check_out && nachten > 0) {
          try {
            const calc = await computeStayPrice({
              lodge: req.lodge,
              checkIn: req.check_in,
              checkOut: req.check_out,
              personen,
              huisdier: req.huisdieren || false,
            });
            verblijf = calc.verblijf;
          } catch (e) { console.error("computeStayPrice failed:", e); }
        }

        // 2. Fee templates ophalen
        const { data: feesData } = await sb.from("fee_templates").select("*").eq("actief", true).order("volgorde", { ascending: true });
        const fees = (feesData || []) as Array<{ id: string; label: string; soort: string; bedrag: number | null; basis: string }>;

        const feeAmount = (basis: string, bedrag: number) => {
          switch (basis) {
            case "eenmalig": return bedrag;
            case "per_nacht": return bedrag * nachten;
            case "per_persoon": return bedrag * personen;
            case "per_persoon_per_nacht": return bedrag * personen * nachten;
            default: return 0;
          }
        };

        // 3. Splits: schoonmaak en toeristenbelasting krijgen eigen kolom; rest gaat naar extra_regels
        let schoonmaak = 0;
        let toeristenbelasting = 0;
        const extraRegels: Array<{ label: string; bedrag: number; soort: string; fee_template_id: string }> = [];

        for (const f of fees) {
          const base = f.bedrag ?? 0;
          if (base === 0) continue;
          const amt = Math.round(feeAmount(f.basis, base) * 100) / 100;
          if (amt === 0) continue;

          // Huisdier alleen toepassen als gast huisdier meeneemt
          if (/huisdier/i.test(f.label) && !req.huisdieren) continue;

          if (/schoonmaak/i.test(f.label) && f.soort === "toeslag") {
            schoonmaak = amt;
          } else if (/toeristenbelasting/i.test(f.label) && f.soort === "belasting") {
            toeristenbelasting = amt;
          } else {
            extraRegels.push({ label: f.label, bedrag: amt, soort: f.soort, fee_template_id: f.id });
          }
        }

        return NextResponse.json({
          success: true,
          prefill: {
            verblijf,
            schoonmaak,
            toeristenbelasting,
            extraRegels,
            nachten,
            personen,
            // Context
            gast_naam: req.gast_naam,
            gast_email: req.gast_email,
            check_in: req.check_in,
            check_out: req.check_out,
            periode_tekst: req.periode_tekst,
            lodge: req.lodge,
            huisdieren: req.huisdieren,
            bron: req.bron,
            bericht: req.bericht,
          },
        });
      }
      case "send_offerte_v2": {
        const { requestId, prijsVerblijf, schoonmaak, toeristenbelasting, extraRegels, bericht } = body;
        if (!requestId) return NextResponse.json({ error: "requestId verplicht" }, { status: 400 });

        const verblijf = parseFloat(prijsVerblijf) || 0;
        const cleaning = parseFloat(schoonmaak) || 0;
        const tax = parseFloat(toeristenbelasting) || 0;
        const extras = Array.isArray(extraRegels) ? extraRegels : [];

        if (verblijf <= 0) return NextResponse.json({ error: "Verblijfprijs is verplicht" }, { status: 400 });

        // Sanitize extra regels
        const cleanRegels = extras
          .map((r: { label?: string; bedrag?: number | string; soort?: string }) => ({
            label: String(r.label || "").slice(0, 80),
            bedrag: parseFloat(String(r.bedrag ?? "0")) || 0,
            soort: ["toeslag", "korting", "belasting"].includes(String(r.soort || "")) ? String(r.soort) : "toeslag",
          }))
          .filter((r) => r.label && r.bedrag !== 0);

        const sb = getSupabase();
        const { data: req, error: reqErr } = await sb.from("booking_requests").select("*").eq("id", requestId).single();
        if (reqErr || !req) return NextResponse.json({ error: "Aanvraag niet gevonden" }, { status: 404 });
        if (!req.gast_email) return NextResponse.json({ error: "Aanvraag heeft geen e-mailadres" }, { status: 400 });

        // Bereken totaal: kortingen worden afgetrokken (zo opgeslagen in cleanRegels)
        const extraSum = cleanRegels.reduce((s, r) => s + (r.soort === "korting" ? -Math.abs(r.bedrag) : Math.abs(r.bedrag)), 0);
        const totaal = Math.max(0, Math.round((verblijf + cleaning + tax + extraSum) * 100) / 100);

        const { randomBytes } = await import("crypto");
        const confirmToken = randomBytes(32).toString("hex");

        const { error: updErr } = await sb.from("booking_requests").update({
          status: "offerte_verstuurd",
          prijs_verblijf: verblijf,
          schoonmaak: cleaning,
          toeristenbelasting: tax,
          extra_regels: cleanRegels,
          totaal,
          confirm_token: confirmToken,
        }).eq("id", requestId);
        if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

        // Verstuur e-mail
        const resendKey = process.env.RESEND_API_KEY;
        if (!resendKey) {
          return NextResponse.json({ success: true, totaal, emailSent: false, warning: "Resend niet geconfigureerd, offerte is wel opgeslagen" });
        }

        // Format periode voor e-mail
        const fmt = (iso: string | null) => iso
          ? new Date(iso).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })
          : "";
        const van = req.check_in ? fmt(req.check_in) : (req.periode_tekst?.split("—")[0]?.trim() || "");
        const tot = req.check_out ? fmt(req.check_out) : (req.periode_tekst?.split("—")[1]?.trim() || "");

        // Bouw regels voor e-mail (verblijf eerst, dan schoonmaak, toeristenbelasting, dan extras)
        const emailRegels: OfferteRegel[] = [
          { label: "Verblijf", bedrag: verblijf, soort: "verblijf" },
        ];
        if (cleaning > 0) emailRegels.push({ label: "Eindschoonmaak", bedrag: cleaning, soort: "toeslag" });
        if (tax > 0) emailRegels.push({ label: "Toeristenbelasting", bedrag: tax, soort: "belasting" });
        for (const r of cleanRegels) {
          emailRegels.push({
            label: r.label,
            bedrag: Math.abs(r.bedrag),
            soort: r.soort as OfferteRegel["soort"],
          });
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || APP_URL_FALLBACK;
        const bevestigBase = new URL(appUrl).origin;

        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);
        try {
          await resend.emails.send({
            from: "Huis ter Huynen <lodge@huisterhuynen.nl>",
            to: [req.gast_email],
            subject: "Persoonlijk aanbod — Huis ter Huynen",
            html: buildOfferteHtmlV2(
              esc(req.gast_naam || ""), esc(van), esc(tot),
              req.personen || 2, emailRegels, totaal, bericht || "",
              requestId, bevestigBase, confirmToken,
            ),
            replyTo: "lodge@huisterhuynen.nl",
          });
        } catch (e) {
          console.error("Offerte v2 email failed:", e);
          return NextResponse.json({ success: true, totaal, emailSent: false, warning: "Offerte opgeslagen, maar e-mail versturen faalde" });
        }

        return NextResponse.json({ success: true, totaal, emailSent: true });
      }
      case "reject_booking_request": {
        if (!body.id) return NextResponse.json({ error: "ID verplicht" }, { status: 400 });
        await getSupabase().from("booking_requests").update({ status: "afgewezen" }).eq("id", body.id);
        return NextResponse.json({ success: true });
      }
      case "mark_booking_in_behandeling": {
        if (!body.id) return NextResponse.json({ error: "ID verplicht" }, { status: 400 });
        await getSupabase().from("booking_requests").update({ status: "in_behandeling" }).eq("id", body.id);
        return NextResponse.json({ success: true });
      }
      case "create_fee_template": {
        const { label, soort, bedrag, percentage, basis, volgorde } = body;
        if (!label || !soort || !basis) {
          return NextResponse.json({ error: "Label, soort en basis zijn verplicht" }, { status: 400 });
        }
        if (!["toeslag", "korting", "belasting"].includes(soort)) {
          return NextResponse.json({ error: "Ongeldige soort" }, { status: 400 });
        }
        if (!["eenmalig", "per_nacht", "per_persoon", "per_persoon_per_nacht"].includes(basis)) {
          return NextResponse.json({ error: "Ongeldige basis" }, { status: 400 });
        }
        const { data, error } = await getSupabase().from("fee_templates").insert({
          label: String(label).trim(),
          soort,
          bedrag: bedrag !== undefined && bedrag !== "" ? parseFloat(bedrag) : null,
          percentage: percentage !== undefined && percentage !== "" ? parseFloat(percentage) : null,
          basis,
          volgorde: volgorde !== undefined ? parseInt(volgorde) || 0 : 0,
          actief: true,
        }).select().single();
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json({ success: true, data });
      }
      case "update_fee_template": {
        const { id, label, soort, bedrag, percentage, basis, volgorde } = body;
        if (!id) return NextResponse.json({ error: "ID verplicht" }, { status: 400 });
        const updates: Record<string, unknown> = {};
        if (label !== undefined) updates.label = String(label).trim();
        if (soort !== undefined) updates.soort = soort;
        if (bedrag !== undefined) updates.bedrag = bedrag === "" ? null : parseFloat(bedrag);
        if (percentage !== undefined) updates.percentage = percentage === "" ? null : parseFloat(percentage);
        if (basis !== undefined) updates.basis = basis;
        if (volgorde !== undefined) updates.volgorde = parseInt(volgorde) || 0;
        const { error } = await getSupabase().from("fee_templates").update(updates).eq("id", id);
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
        return NextResponse.json({ success: true });
      }
      case "toggle_fee_template": {
        if (!body.id) return NextResponse.json({ error: "ID verplicht" }, { status: 400 });
        await getSupabase().from("fee_templates").update({ actief: body.actief === true || body.actief === "true" }).eq("id", body.id);
        return NextResponse.json({ success: true });
      }
      case "delete_fee_template": {
        if (!body.id) return NextResponse.json({ error: "ID verplicht" }, { status: 400 });
        await getSupabase().from("fee_templates").delete().eq("id", body.id);
        return NextResponse.json({ success: true });
      }
      default:
        return NextResponse.json({ error: "Onbekende actie" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Actie mislukt" }, { status: 500 });
  }
}
