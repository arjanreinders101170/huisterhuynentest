import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

// GET /api/stay?token=xxx — validate stay token and return guest info
export async function GET(request: NextRequest) {
  // ── Rate-limit (10/min per IP) ────────────────────────────────────
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  const rl = await checkRateLimit(`stay:${ip}`, 10, 60);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Te veel verzoeken. Probeer het later opnieuw." },
      {
        status: 429,
        headers: { "Retry-After": String(rl.resetIn) },
      }
    );
  }

  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Geen token" }, { status: 400 });
  }

  try {
    // Find stay by token (incl. lodge + expires_at + token, needed for client)
    const { data: stay } = await getSupabase()
      .from("stays")
      .select("*, expires_at")
      .eq("token", token)
      .single();

    if (!stay) {
      return NextResponse.json({ error: "Onbekende link" }, { status: 404 });
    }

    // Token expiry: prefer explicit expires_at; fall back to check_out + 1d 12:00
    const now = new Date();
    let expiresAt: Date | null = null;
    if (stay.expires_at) {
      expiresAt = new Date(stay.expires_at as string);
    } else if (stay.check_out) {
      const fb = new Date(stay.check_out as string);
      fb.setDate(fb.getDate() + 1);
      fb.setHours(12, 0, 0, 0);
      expiresAt = fb;
    }

    if (expiresAt && expiresAt < now) {
      return NextResponse.json(
        { error: "Dit verblijf is verlopen", expired: true },
        { status: 410 }
      );
    }

    // Get guest info
    const { data: guest } = await getSupabase()
      .from("guests")
      .select("naam, email")
      .eq("id", stay.guest_id)
      .single();

    return NextResponse.json({
      stay: {
        id: stay.id,
        token: stay.token,
        lodge: stay.lodge,
        check_in: stay.check_in,
        check_out: stay.check_out,
        door_code: stay.door_code,
        wifi_code: stay.wifi_code,
        status: stay.status,
        expires_at: expiresAt ? expiresAt.toISOString() : null,
      },
      guest: {
        naam: guest?.naam || "Gast",
      },
    });
  } catch (err) {
    console.error("Stay validation error:", err);
    return NextResponse.json({ error: "Kon verblijf niet ophalen" }, { status: 500 });
  }
}
