import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { WIFI_SSID, WIFI_PASSWORD } from "@/data/lodge";

export const runtime = "nodejs";

// GET /api/stay?token=xxx — validate stay token and return guest info
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Geen token" }, { status: 400 });
  }

  try {
    // Find stay by token
    const { data: stay } = await getSupabase()
      .from("stays")
      .select("*")
      .eq("token", token)
      .single();

    if (!stay) {
      return NextResponse.json({ error: "Onbekende link" }, { status: 404 });
    }

    // Check if stay is still valid (not expired)
    const now = new Date();
    const checkOut = new Date(stay.check_out);
    checkOut.setHours(23, 59, 59); // Allow until end of checkout day

    if (now > checkOut) {
      return NextResponse.json({ error: "Dit verblijf is verlopen", expired: true }, { status: 410 });
    }

    // Get guest info
    const { data: guest } = await getSupabase()
      .from("guests")
      .select("naam, email")
      .eq("id", stay.guest_id)
      .single();

    const lodgeNaam = stay.lodge === "lodge_1" ? "Boomhut Lodge" : "Schaapskooi Lodge";

    return NextResponse.json({
      stay: {
        id: stay.id,
        lodge: stay.lodge,
        lodgeNaam,
        check_in: stay.check_in,
        check_out: stay.check_out,
        door_code: stay.door_code,
        wifi_ssid: WIFI_SSID,
        wifi_password: WIFI_PASSWORD,
        status: stay.status,
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
