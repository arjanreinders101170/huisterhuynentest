import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
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
