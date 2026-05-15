import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { verifyAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

/**
 * Diagnostische endpoint om te achterhalen waarom booking_requests
 * niet gevuld wordt. Probeert: SELECT count, kolom-listing, en
 * een test-insert. Geeft de exacte Supabase-error terug.
 */
export async function GET(request: NextRequest) {
  if (!(await verifyAdminSession(request))) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const result: Record<string, unknown> = {};
  const sb = getSupabase();

  // 1. Bestaat de tabel? Probeer een count.
  const countRes = await sb.from("booking_requests").select("*", { count: "exact", head: true });
  result.count = countRes.count;
  result.countError = countRes.error ? { message: countRes.error.message, code: countRes.error.code, details: countRes.error.details, hint: countRes.error.hint } : null;

  // 2. Bestaat fee_templates?
  const ftRes = await sb.from("fee_templates").select("*", { count: "exact", head: true });
  result.feeTemplatesCount = ftRes.count;
  result.feeTemplatesError = ftRes.error ? { message: ftRes.error.message, code: ftRes.error.code } : null;

  // 3. Probeer een test-insert met dezelfde velden als /api/reservering
  const testRow = {
    bron: "homepage" as const,
    gast_naam: "DIAGNOSE-TEST",
    gast_email: "diagnose@test.local",
    lodge: "lodge_1",
    check_in: "2099-01-01",
    check_out: "2099-01-03",
    nachten: 2,
    personen: 2,
    huisdieren: false,
    bericht: "[diagnose] dit is een testinsertie, mag verwijderd worden",
    voorgestelde_prijs: 1,
    voorgestelde_prijs_label: "diagnose",
    status: "nieuw",
  };

  const insertRes = await sb.from("booking_requests").insert(testRow).select("id").single();
  result.testInsert = {
    success: !insertRes.error,
    id: insertRes.data?.id || null,
    error: insertRes.error ? {
      message: insertRes.error.message,
      code: insertRes.error.code,
      details: insertRes.error.details,
      hint: insertRes.error.hint,
    } : null,
    payload: testRow,
  };

  // 4. Cleanup test-row
  if (insertRes.data?.id) {
    const delRes = await sb.from("booking_requests").delete().eq("id", insertRes.data.id);
    result.testCleanup = { success: !delRes.error, error: delRes.error?.message || null };
  }

  // 5. Laatste 5 echte rijen (om te zien of er ECHT niets binnenkomt)
  const recentRes = await sb
    .from("booking_requests")
    .select("id, bron, gast_naam, gast_email, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);
  result.recent = recentRes.data || [];

  return NextResponse.json(result, { status: 200 });
}
