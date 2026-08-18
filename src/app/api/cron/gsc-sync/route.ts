import { NextRequest, NextResponse } from "next/server";
import { GscConfigError } from "@/lib/gsc";
import { syncMaanden, type SyncResultaat } from "@/lib/gsc-sync";

export const runtime = "nodejs";
// Twee dimensies ophalen en wegschrijven duurt langer dan de standaardlimiet.
export const maxDuration = 300;

/**
 * GET — maandelijks aangeroepen door Vercel Cron (zie vercel.json).
 *
 * Standaard wordt de vorige volledige kalendermaand opgehaald. Met
 * ?maanden=16 wordt de beschikbare historie teruggevuld — handig bij de
 * eerste run, want Search Console bewaart zestien maanden. Met ?force=1
 * worden ook al opgehaalde maanden opnieuw gedaan.
 *
 * Dezelfde logica zit achter de knop "Nu ophalen" in de admin.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const gevraagd = Number(request.nextUrl.searchParams.get("maanden") ?? "1");
  const aantal = Number.isFinite(gevraagd) ? Math.min(Math.max(Math.trunc(gevraagd), 1), 16) : 1;
  const force = request.nextUrl.searchParams.get("force") === "1";

  let gedaan: SyncResultaat[] = [];
  try {
    gedaan = await syncMaanden({ aantal, force });
  } catch (err) {
    if (err instanceof GscConfigError) {
      return NextResponse.json({ error: err.message, gedaan }, { status: 503 });
    }
    console.error("GSC-sync mislukt:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sync mislukt", gedaan },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, gedaan });
}
