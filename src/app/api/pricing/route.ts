import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const lodge = request.nextUrl.searchParams.get("lodge");
  if (!lodge) {
    return NextResponse.json({ error: "lodge parameter verplicht" }, { status: 400 });
  }

  try {
    const sb = getSupabase();
    const [periodsRes, configRes, discountsRes] = await Promise.all([
      sb.from("pricing_periods")
        .select("id, label, start_date, end_date, price_per_night")
        .eq("lodge_id", lodge)
        .order("start_date", { ascending: true }),
      sb.from("pricing_config")
        .select("base_price")
        .eq("lodge_id", lodge)
        .single(),
      sb.from("availability_discounts")
        .select("id, days_before, discount_pct")
        .eq("lodge_id", lodge)
        .order("days_before", { ascending: true }),
    ]);

    return NextResponse.json({
      base_price: configRes.data?.base_price ?? 0,
      periods: periodsRes.data || [],
      availability_discounts: discountsRes.data || [],
    });
  } catch (e) {
    console.error("Pricing fetch error:", e);
    return NextResponse.json({ base_price: 0, periods: [], availability_discounts: [] });
  }
}
