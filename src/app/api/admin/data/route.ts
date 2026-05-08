import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { adminActionSchema } from "@/lib/schemas";
import { auditLog, type AuditResourceType } from "@/lib/audit";
import { LODGES, type Lodge } from "@/lib/lodge";

export const runtime = "nodejs";

const SESSION_COOKIE = "hth-admin-session-v2";

function getSessionId(request: NextRequest): string | null {
  return request.cookies.get(SESSION_COOKIE)?.value ?? null;
}

/**
 * Resolve `?lodge=` query-param.
 * Returns one of LODGES, or `null` for "all" (no filter).
 */
function getLodgeFilter(request: NextRequest): Lodge | null {
  const raw = request.nextUrl.searchParams.get("lodge");
  if (!raw || raw === "all") return null;
  if ((LODGES as readonly string[]).includes(raw)) return raw as Lodge;
  return null;
}

// ── GET — fetch table data ────────────────────────────────────────
export async function GET(request: NextRequest) {
  // Auth: middleware already enforced session, but we double-check.
  const sessionId = getSessionId(request);
  if (!sessionId) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const action = request.nextUrl.searchParams.get("action");
  const table = request.nextUrl.searchParams.get("table");
  const lodge = getLodgeFilter(request);

  try {
    // ── Audit log read ────────────────────────────────────────────
    if (action === "audit_log") {
      const { data } = await getSupabase()
        .from("audit_log")
        .select("id, actor_session_id, action, resource_type, resource_id, payload, ip, user_agent, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      return NextResponse.json({ data: data || [] });
    }

    switch (table) {
      case "bookings": {
        let q = getSupabase()
          .from("bookings")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);
        if (lodge) q = q.eq("lodge", lodge);
        const { data } = await q;
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
        let q = getSupabase()
          .from("reviews")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);
        if (lodge) q = q.eq("lodge", lodge);
        const { data } = await q;
        return NextResponse.json({ data: data || [] });
      }
      case "aanvragen": {
        let q = getSupabase()
          .from("terugkeer_aanvragen")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);
        if (lodge) q = q.eq("lodge", lodge);
        const { data } = await q;
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
        let q = getSupabase()
          .from("invoices")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);
        if (lodge) q = q.eq("lodge", lodge);
        const { data } = await q;
        return NextResponse.json({ data: data || [] });
      }
      case "stays": {
        let q = getSupabase()
          .from("stays")
          .select("*")
          .order("check_in", { ascending: false })
          .limit(50);
        if (lodge) q = q.eq("lodge", lodge);
        const { data: staysRaw } = await q;
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
      default:
        return NextResponse.json({ error: "Onbekende tabel" }, { status: 400 });
    }
  } catch (err) {
    console.error("Admin data error:", err);
    return NextResponse.json({ error: "Kon data niet laden" }, { status: 500 });
  }
}

// ── POST — admin actions ──────────────────────────────────────────
export async function POST(request: NextRequest) {
  const sessionId = getSessionId(request);
  if (!sessionId) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON" }, { status: 400 });
  }

  const parsed = adminActionSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ongeldige actie of velden", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const body = parsed.data;

  // Helper to fire-and-forget audit row.
  const audit = async (
    action: string,
    resourceType: AuditResourceType,
    resourceId: string | null,
    payload: Record<string, unknown> | null,
  ) => {
    await auditLog({
      sessionId,
      action,
      resourceType,
      resourceId,
      payload,
      req: request,
    });
  };

  try {
    switch (body.action) {
      case "toggle_review": {
        // Atomic: only flip if current value is the inverse of `visible`.
        const expectedCurrent = !body.visible;
        const { data, error } = await getSupabase()
          .from("reviews")
          .update({ zichtbaar: body.visible })
          .eq("id", body.id)
          .eq("zichtbaar", expectedCurrent)
          .select()
          .maybeSingle();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        if (!data) {
          return NextResponse.json(
            { error: "Review is al in deze status (concurrent update)" },
            { status: 409 },
          );
        }

        await audit("toggle_review", "review", body.id, { visible: body.visible });
        return NextResponse.json({ success: true });
      }

      case "create_product": {
        const { id, naam, omschrijving, prijs, categorie, volgorde, btw_percentage, grootboek_code } = body;
        const { error } = await getSupabase().from("products").insert({
          id,
          naam,
          omschrijving: omschrijving || null,
          prijs: typeof prijs === "string" ? parseFloat(prijs) : prijs,
          categorie: categorie || "upsell",
          volgorde: volgorde ?? 0,
          btw_percentage: btw_percentage ?? 21,
          grootboek_code: grootboek_code || "8020",
          actief: true,
        });
        if (error) {
          if (error.code === "23505") {
            return NextResponse.json({ error: "Product ID bestaat al" }, { status: 400 });
          }
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        await audit("create_product", "product", id, { naam, prijs, categorie });
        return NextResponse.json({ success: true });
      }

      case "update_product": {
        const { id, naam, omschrijving, prijs, categorie, volgorde, btw_percentage, grootboek_code } = body;
        const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (naam !== undefined) updates.naam = naam;
        if (omschrijving !== undefined) updates.omschrijving = omschrijving;
        if (prijs !== undefined) updates.prijs = typeof prijs === "string" ? parseFloat(prijs) : prijs;
        if (categorie !== undefined) updates.categorie = categorie;
        if (volgorde !== undefined) updates.volgorde = volgorde;
        if (btw_percentage !== undefined) updates.btw_percentage = btw_percentage;
        if (grootboek_code !== undefined) updates.grootboek_code = grootboek_code;
        const { error } = await getSupabase().from("products").update(updates).eq("id", id);
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        await audit("update_product", "product", id, updates);
        return NextResponse.json({ success: true });
      }

      case "toggle_product": {
        const { error } = await getSupabase()
          .from("products")
          .update({ actief: body.actief, updated_at: new Date().toISOString() })
          .eq("id", body.id);
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        await audit("toggle_product", "product", body.id, { actief: body.actief });
        return NextResponse.json({ success: true });
      }

      case "delete_product": {
        const { error } = await getSupabase()
          .from("products")
          .delete()
          .eq("id", body.id);
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        await audit("delete_product", "product", body.id, null);
        return NextResponse.json({ success: true });
      }

      case "create_stay": {
        const { naam, email, lodge, check_in, check_out } = body;

        // Upsert guest
        let guestId: string | null = null;
        try {
          const { data } = await getSupabase().rpc("upsert_guest", { p_naam: naam, p_email: email });
          guestId = data;
        } catch {
          const { data: existing } = await getSupabase().from("guests").select("id").eq("email", email).single();
          if (existing) {
            guestId = existing.id;
          } else {
            const { data: created } = await getSupabase().from("guests").insert({ naam, email, profiel: "gast" }).select("id").single();
            guestId = created?.id ?? null;
          }
        }

        if (!guestId) {
          return NextResponse.json({ error: "Kon gast niet aanmaken" }, { status: 500 });
        }

        // Generate codes
        const { randomBytes, randomInt } = await import("crypto");
        const token = randomBytes(24).toString("hex");
        const door_code = String(randomInt(1000, 9999));
        const wifi_code = "Huynen" + randomInt(1000, 9999);

        const { data: created, error } = await getSupabase()
          .from("stays")
          .insert({
            guest_id: guestId,
            lodge,
            check_in,
            check_out,
            token,
            door_code,
            wifi_code,
            status: "gepland",
            welcome_sent: false,
          })
          .select("id")
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        await audit("create_stay", "stay", created?.id ?? null, { lodge, check_in, check_out });
        return NextResponse.json({ success: true });
      }

      case "send_welcome": {
        const stayId = body.id;

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

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.huisterhuynen.nl";
        const lodgeNaam = stay.lodge === "lodge_1" ? "Boomhut Lodge" : "Schaapskooi Lodge";
        const checkInDate = new Date(stay.check_in).toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });

        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);

        const esc = (s: string) => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));

        await resend.emails.send({
          from: "Huis ter Huynen <lodge@huisterhuynen.nl>",
          to: [guest.email],
          subject: `Welkom bij Huis ter Huynen — ${checkInDate}`,
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
<tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FDFBF6;border:1px solid #E0D8C8;border-radius:12px;">
<tr><td style="height:4px;background:#B49A5E;border-radius:12px 12px 0 0;">&nbsp;</td></tr>
<tr><td style="padding:28px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:0 0 20px;"><span style="font-size:22px;color:#B49A5E;letter-spacing:8px;">&#9830;</span></td></tr>
  </table>
  <h1 style="margin:0 0 8px;font-size:26px;color:#2A2418;text-align:center;">Welkom, ${esc(guest.naam)}!</h1>
  <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:15px;color:#8A7D6A;line-height:1.6;text-align:center;">
    Over een paar uur mag je genieten van rust en natuur in Drenthe. Hier is alles wat je nodig hebt.
  </p>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F1E8;border-radius:8px;margin-bottom:16px;">
    <tr><td style="padding:18px 20px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:14px;">
        <tr><td style="padding:6px 0;color:#8A7D6A;">Lodge</td><td style="padding:6px 0;text-align:right;font-weight:bold;color:#2A2418;">${esc(lodgeNaam)}</td></tr>
        <tr><td style="padding:6px 0;color:#8A7D6A;">Aankomst</td><td style="padding:6px 0;text-align:right;font-weight:bold;color:#2A2418;">${checkInDate}</td></tr>
        <tr><td style="padding:6px 0;color:#8A7D6A;">Deurcode</td><td style="padding:6px 0;text-align:right;font-weight:bold;color:#2F4F3E;font-size:18px;letter-spacing:2px;">${stay.door_code}</td></tr>
        <tr><td style="padding:6px 0;color:#8A7D6A;">Wi-Fi</td><td style="padding:6px 0;text-align:right;font-weight:bold;color:#2F4F3E;">${stay.wifi_code}</td></tr>
      </table>
    </td></tr>
  </table>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
    <tr><td style="padding:3px 0;font-family:Arial,sans-serif;font-size:13px;color:#2F4F3E;">&#10003; Laadpaal beschikbaar op locatie</td></tr>
    <tr><td style="padding:3px 0;font-family:Arial,sans-serif;font-size:13px;color:#2F4F3E;">&#10003; Inchecken vanaf 15:00</td></tr>
    <tr><td style="padding:3px 0;font-family:Arial,sans-serif;font-size:13px;color:#2F4F3E;">&#10003; Zuiderstraat 6, Zeijen</td></tr>
  </table>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
    <tr><td align="center" style="padding:10px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>
        <td align="center" style="background:#2F4F3E;border-radius:10px;">
          <a href="${appUrl}/?s=${stay.token}" style="display:block;padding:16px 40px;color:#fff;text-decoration:none;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;border-radius:10px;">
            Open de gast-app &#8594;
          </a>
        </td>
      </tr></table>
    </td></tr>
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

        await audit("send_welcome", "stay", stayId, { lodge: stay.lodge });
        return NextResponse.json({ success: true });
      }

      case "send_thankyou": {
        const stayId = body.id;

        const { data: stay } = await getSupabase().from("stays").select("*").eq("id", stayId).single();
        if (!stay) return NextResponse.json({ error: "Verblijf niet gevonden" }, { status: 404 });

        const { data: guest } = await getSupabase().from("guests").select("naam, email").eq("id", stay.guest_id).single();
        if (!guest?.email) return NextResponse.json({ error: "Geen emailadres" }, { status: 404 });

        const resendKey = process.env.RESEND_API_KEY;
        if (!resendKey) return NextResponse.json({ error: "Resend niet geconfigureerd" }, { status: 500 });

        const esc = (s: string) => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!));
        const naam = esc(guest.naam || "");

        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);

        await resend.emails.send({
          from: "Huis ter Huynen <lodge@huisterhuynen.nl>",
          to: [guest.email],
          subject: "Bedankt voor je bezoek — Huis ter Huynen",
          html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:#EAE3D2;font-family:Georgia,'Times New Roman',serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#EAE3D2;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">

  <!-- Header -->
  <tr><td align="center" style="padding:0 0 20px;">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td align="center" style="font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:bold;color:#52502E;letter-spacing:2px;">HUIS TER HUYNEN</td>
    </tr><tr><td align="center" style="padding-top:6px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td style="width:28px;height:1px;background-color:#B49A5E;"></td>
      <td style="padding:0 10px;font-family:Arial,sans-serif;font-size:9px;color:#B49A5E;letter-spacing:3px;text-transform:uppercase;">Boutique Lodge</td>
      <td style="width:28px;height:1px;background-color:#B49A5E;"></td>
    </tr></table></td></tr></table>
  </td></tr>

  <!-- Hero image + Content card in single container -->
  <tr><td>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FDFBF6;border:1px solid #E0D8C8;border-radius:12px;overflow:hidden;">
    <tr><td style="padding:0;font-size:0;line-height:0;">
      <img src="https://www.huisterhuynen.nl/heide3.jpg" alt="Drentse heide" width="520" style="display:block;width:100%;height:auto;" />
    </td></tr>
    <tr><td style="padding:32px 32px 28px;">

      <h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:bold;color:#2A2418;line-height:1.3;">
        Tot snel, ${naam}
      </h1>

      <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:15px;color:#8A7D6A;line-height:1.7;">
        De heide kleurt, het bos ruist, en de hottub dampt zachtjes in de ochtendlucht. Zo gaat het hier elke dag verder &mdash; ook als je er even niet bent.
      </p>

      <p style="margin:0 0 28px;font-family:Arial,sans-serif;font-size:15px;color:#8A7D6A;line-height:1.7;">
        We hopen dat Drenthe je goed heeft gedaan. Mocht je ooit terug willen &mdash; je bent altijd welkom.
      </p>

      <!-- Sign-off -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E0D8C8;">
      <tr><td style="padding:20px 0 0;">
        <p style="margin:0 0 4px;font-family:Georgia,'Times New Roman',serif;font-size:14px;color:#2A2418;font-weight:bold;">Het Huynen team</p>
        <p style="margin:0 0 0;font-family:Arial,sans-serif;font-size:13px;color:#8A7D6A;">Zuiderstraat 6 &middot; Zeijen, Drenthe</p>
        <p style="margin:8px 0 0;font-family:Arial,sans-serif;font-size:13px;color:#8A7D6A;">
          WhatsApp ons op <a href="tel:+31642568603" style="color:#2F4F3E;font-weight:bold;text-decoration:none;">+31 6 42568603</a>
        </p>
      </td></tr>
      </table>

    </td></tr>
    </table>
  </td></tr>

  <!-- Footer -->
  <tr><td align="center" style="padding:24px 0 0;">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:40px;height:1px;background-color:#B49A5E;"></td></tr></table>
    <p style="margin:12px 0 0;font-family:Arial,sans-serif;font-size:11px;color:#8A7D6A;">Huis ter Huynen &middot; Zuiderstraat 6 &middot; Zeijen, Drenthe</p>
  </td></tr>

</table>
</td></tr></table>
</body></html>`,
        });

        // Update stay status
        await getSupabase().from("stays").update({ status: "vertrokken" }).eq("id", stayId);

        await audit("send_thankyou", "stay", stayId, { lodge: stay.lodge });
        return NextResponse.json({ success: true });
      }
    }
  } catch (err) {
    console.error("[admin/data] action failed:", err);
    return NextResponse.json({ error: "Actie mislukt" }, { status: 500 });
  }
}
