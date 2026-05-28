import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

/**
 * Geeft het UTC-tijdstip terug dat overeenkomt met 15:00 Amsterdam local time
 * op de opgegeven datum. Handelt automatisch zomer/wintertijd af via Intl.
 */
function checkInAccessTime(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  // Start op 13:00 UTC — dat is 14:00 of 15:00 Amsterdam afhankelijk van seizoen
  const candidate = new Date(Date.UTC(y, m - 1, d, 13, 0, 0));
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Amsterdam",
    hour: "numeric",
    hour12: false,
  }).formatToParts(candidate);
  const amsterdamHour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "14");
  // Schuif op zodat we precies op 15:00 Amsterdam uitkomen
  return new Date(candidate.getTime() + (15 - amsterdamHour) * 3_600_000);
}

/**
 * Kiest het juiste Nuki smartlock-ID op basis van lodge.
 * Lodge-specifieke vars hebben voorrang; NUKI_SMARTLOCK_ID is de legacy fallback
 * voor enkelvoudige installaties.
 */
function resolveSmartlockId(lodge: string): string | null {
  if (lodge === "lodge_1") {
    return process.env.NUKI_SMARTLOCK_ID_LODGE_1 ?? process.env.NUKI_SMARTLOCK_ID ?? null;
  }
  if (lodge === "lodge_2") {
    return process.env.NUKI_SMARTLOCK_ID_LODGE_2 ?? null;
  }
  return process.env.NUKI_SMARTLOCK_ID ?? null;
}

async function writeLog(opts: {
  stayId: string | null;
  lodge: string | null;
  success: boolean;
  ip: string;
  errorMsg?: string;
}): Promise<void> {
  try {
    await getSupabase().from("nuki_unlock_log").insert({
      stay_id: opts.stayId,
      lodge: opts.lodge,
      success: opts.success,
      ip: opts.ip,
      error_msg: opts.errorMsg ?? null,
    });
  } catch {
    // Log-fout mag de unlock-flow nooit blokkeren
  }
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

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
    .select("id, lodge, check_in, check_out, status")
    .eq("token", token)
    .single();

  if (!stay) {
    await writeLog({ stayId: null, lodge: null, success: false, ip, errorMsg: "token_niet_gevonden" });
    return NextResponse.json({ error: "Onbekende sessie" }, { status: 403 });
  }

  if (stay.status === "vertrokken") {
    await writeLog({ stayId: stay.id, lodge: stay.lodge, success: false, ip, errorMsg: "verblijf_afgesloten" });
    return NextResponse.json({ error: "Verblijf afgesloten" }, { status: 403 });
  }

  // Toegang pas vanaf 15:00 op de check-in dag (Amsterdam local time)
  const accessFrom = checkInAccessTime(stay.check_in);
  if (Date.now() < accessFrom.getTime()) {
    await writeLog({ stayId: stay.id, lodge: stay.lodge, success: false, ip, errorMsg: "voor_incheck_tijd" });
    return NextResponse.json({ error: "Verblijf nog niet begonnen" }, { status: 403 });
  }

  // Toegang tot einde van de check-out dag
  const checkOut = new Date(stay.check_out);
  checkOut.setHours(23, 59, 59);
  if (Date.now() > checkOut.getTime()) {
    await writeLog({ stayId: stay.id, lodge: stay.lodge, success: false, ip, errorMsg: "verblijf_verlopen" });
    return NextResponse.json({ error: "Verblijf verlopen" }, { status: 403 });
  }

  const apiKey = process.env.NUKI_API_KEY;
  const smartlockId = resolveSmartlockId(stay.lodge);

  if (!apiKey || !smartlockId) {
    // Demo mode: simuleer unlock
    await new Promise((r) => setTimeout(r, 2000));
    await writeLog({ stayId: stay.id, lodge: stay.lodge, success: true, ip, errorMsg: "demo_mode" });
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
      await writeLog({ stayId: stay.id, lodge: stay.lodge, success: true, ip });
      return NextResponse.json({
        success: true,
        message: "Deur wordt geopend",
      });
    } else {
      const errorText = await response.text();
      await writeLog({
        stayId: stay.id,
        lodge: stay.lodge,
        success: false,
        ip,
        errorMsg: errorText.slice(0, 200),
      });
      return NextResponse.json(
        { success: false, message: "Kon deur niet openen" },
        { status: 500 }
      );
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await writeLog({
      stayId: stay.id,
      lodge: stay.lodge,
      success: false,
      ip,
      errorMsg: msg.slice(0, 200),
    });
    return NextResponse.json(
      { success: false, message: "Verbindingsfout" },
      { status: 500 }
    );
  }
}
