import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  // Validate stay token before unlocking
  let token: string | undefined;
  try {
    const body = await request.json();
    token = body?.token;
  } catch {
    // no body
  }

  if (!token) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }

  const { data: stay } = await getSupabase()
    .from("stays")
    .select("check_out")
    .eq("token", token)
    .single();

  if (!stay) {
    return NextResponse.json({ error: "Onbekende sessie" }, { status: 403 });
  }

  const checkOut = new Date(stay.check_out);
  checkOut.setHours(23, 59, 59);
  if (Date.now() > checkOut.getTime()) {
    return NextResponse.json({ error: "Verblijf verlopen" }, { status: 403 });
  }

  const apiKey = process.env.NUKI_API_KEY;
  const smartlockId = process.env.NUKI_SMARTLOCK_ID;

  if (!apiKey || !smartlockId) {
    // Demo mode: simuleer unlock na 2 seconden
    await new Promise((r) => setTimeout(r, 2000));
    return NextResponse.json({
      success: true,
      message: "Deur geopend (demo modus)",
      demo: true,
    });
  }

  try {
    const response = await fetch(
      `https://api.nuki.io/smartlock/${smartlockId}/action/unlock`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: "Deur wordt geopend",
      });
    } else {
      const error = await response.text();
      return NextResponse.json(
        {
          success: false,
          message: "Kon deur niet openen",
          fallbackCode: "4821",
          error,
        },
        { status: 500 }
      );
    }
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Verbindingsfout",
        fallbackCode: "4821",
      },
      { status: 500 }
    );
  }
}
