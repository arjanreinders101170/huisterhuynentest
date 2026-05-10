import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const lodge = request.nextUrl.searchParams.get("lodge");
  if (!lodge) {
    return NextResponse.json({ error: "lodge parameter verplicht" }, { status: 400 });
  }

  try {
    const { data, error } = await getSupabase()
      .from("pricing_periods")
      .select("id, label, start_date, end_date, price_per_night")
      .eq("lodge_id", lodge)
      .order("start_date", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ data: data || [] });
  } catch (e) {
    console.error("Pricing fetch error:", e);
    return NextResponse.json({ data: [], error: "Tarieven tijdelijk niet beschikbaar" });
  }
}
