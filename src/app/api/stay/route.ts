import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { WIFI_SSID, WIFI_PASSWORD, lodgeName } from "@/data/lodge";
import { STAY_COOKIE_NAME, buildStayCookie } from "@/lib/stay-auth-edge";

export const runtime = "nodejs";

function clearStayCookie(res: NextResponse): NextResponse {
  res.cookies.set(STAY_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}

// GET /api/stay?token=xxx — validate stay token and return guest info.
// On success, sets a signed HttpOnly cookie so subsequent visits to /app
// (without the token in the URL) remain authorized until check_out + 1 day.
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return clearStayCookie(NextResponse.json({ error: "Geen token" }, { status: 400 }));
  }

  try {
    const { data: stay } = await getSupabase()
      .from("stays")
      .select("*")
      .eq("token", token)
      .single();

    if (!stay) {
      return clearStayCookie(NextResponse.json({ error: "Onbekende link" }, { status: 404 }));
    }

    if (stay.status === "vertrokken") {
      return clearStayCookie(NextResponse.json({ error: "Dit verblijf is afgesloten", expired: true }, { status: 410 }));
    }

    const now = new Date();
    const checkOut = new Date(stay.check_out);
    checkOut.setHours(23, 59, 59);

    if (now > checkOut) {
      return clearStayCookie(NextResponse.json({ error: "Dit verblijf is verlopen", expired: true }, { status: 410 }));
    }

    const { data: guest } = await getSupabase()
      .from("guests")
      .select("naam, email")
      .eq("id", stay.guest_id)
      .single();

    const lodgeNaam = lodgeName(stay.lodge);
    const expiresAtMs = checkOut.getTime() + 24 * 60 * 60 * 1000; // check_out + 1 dag

    const response = NextResponse.json({
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

    const cookieValue = await buildStayCookie(stay.id, expiresAtMs);
    response.cookies.set(STAY_COOKIE_NAME, cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: Math.max(0, Math.floor((expiresAtMs - now.getTime()) / 1000)),
    });

    return response;
  } catch (err) {
    console.error("Stay validation error:", err);
    return clearStayCookie(NextResponse.json({ error: "Kon verblijf niet ophalen" }, { status: 500 }));
  }
}
