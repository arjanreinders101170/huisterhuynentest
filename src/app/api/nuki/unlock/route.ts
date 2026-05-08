import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getLodgeFromStayToken, type Lodge } from "@/lib/lodge";

export const runtime = "nodejs";

const unlockSchema = z.object({
  token: z.string().min(1).max(128),
});

function maskSmartlockId(id: string | undefined | null): string {
  if (!id) return "<unset>";
  if (id.length <= 4) return `***${id}`;
  return `***${id.slice(-4)}`;
}

function smartlockIdForLodge(lodge: Lodge): string | null {
  if (lodge === "lodge_1") {
    const v = process.env.NUKI_SMARTLOCK_ID_LODGE_1;
    if (v) return v;
  }
  if (lodge === "lodge_2") {
    const v = process.env.NUKI_SMARTLOCK_ID_LODGE_2;
    if (v) return v;
  }
  // Legacy fallback — single smartlock for both lodges.
  const legacy = process.env.NUKI_SMARTLOCK_ID;
  if (legacy) {
    console.warn(
      "[nuki/unlock] NUKI_SMARTLOCK_ID is deprecated; set NUKI_SMARTLOCK_ID_LODGE_1 and NUKI_SMARTLOCK_ID_LODGE_2 instead."
    );
    return legacy;
  }
  return null;
}

export async function POST(request: NextRequest) {
  // 1. Parse + validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json" },
      { status: 400 }
    );
  }

  const parsed = unlockSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_body", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { token } = parsed.data;

  // 2. Resolve token → lodge (also enforces expiry)
  const lodge = await getLodgeFromStayToken(token);
  if (!lodge) {
    return NextResponse.json(
      { error: "invalid_or_expired_token" },
      { status: 401 }
    );
  }

  // 3. Pick the smartlock for this lodge
  const smartlockId = smartlockIdForLodge(lodge);
  const apiKey = process.env.NUKI_API_KEY;

  // Demo modus: geen Nuki API key → simuleer unlock
  if (!apiKey) {
    await new Promise((r) => setTimeout(r, 2000));
    console.log({
      event: "nuki_unlock_demo",
      lodge,
      smartlockId: maskSmartlockId(smartlockId),
    });
    return NextResponse.json({
      success: true,
      message: "Deur geopend (demo modus)",
      demo: true,
      lodge,
    });
  }

  // Real mode requires a smartlock id; without it the server cannot proceed.
  if (!smartlockId) {
    console.error("[nuki/unlock] no smartlock id configured for", lodge);
    return NextResponse.json(
      {
        success: false,
        error: "smartlock_not_configured",
        message: "Server kan deur niet openen (configuratie ontbreekt).",
      },
      { status: 503 }
    );
  }

  console.log({
    event: "nuki_unlock_attempt",
    lodge,
    smartlockId: maskSmartlockId(smartlockId),
  });

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
        lodge,
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
