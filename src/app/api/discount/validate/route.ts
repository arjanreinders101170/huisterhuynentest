import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

type DiscountCode = {
  id: string;
  code: string;
  omschrijving: string | null;
  type: "percentage" | "fixed";
  waarde: number;
  geldig_van: string | null;
  geldig_tot: string | null;
  max_gebruik: number | null;
  gebruik_count: number;
  min_nachten: number | null;
  actief: boolean;
};

export async function POST(request: NextRequest) {
  let body: { code?: string; nights?: number; checkIn?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ valid: false, error: "Ongeldige aanvraag" }, { status: 400 });
  }

  const rawCode = String(body.code || "").trim().toUpperCase();
  if (!rawCode || rawCode.length > 50) {
    return NextResponse.json({ valid: false, error: "Ongeldige code" });
  }

  const nights = typeof body.nights === "number" ? body.nights : null;
  const checkIn: string | null = typeof body.checkIn === "string" ? body.checkIn : null;

  const { data, error } = await getSupabase()
    .from("discount_codes")
    .select("*")
    .ilike("code", rawCode)
    .single<DiscountCode>();

  if (error || !data) {
    return NextResponse.json({ valid: false, error: "Code niet gevonden" });
  }

  if (!data.actief) {
    return NextResponse.json({ valid: false, error: "Code is niet meer geldig" });
  }

  const stayDate = checkIn ?? new Date().toISOString().slice(0, 10);
  if (data.geldig_van && stayDate < data.geldig_van) {
    return NextResponse.json({ valid: false, error: "Code is niet geldig voor deze periode" });
  }
  if (data.geldig_tot && stayDate > data.geldig_tot) {
    return NextResponse.json({ valid: false, error: "Code is niet geldig voor deze periode" });
  }
  if (data.max_gebruik !== null && data.gebruik_count >= data.max_gebruik) {
    return NextResponse.json({ valid: false, error: "Code is al volledig gebruikt" });
  }
  if (data.min_nachten !== null && nights !== null && nights < data.min_nachten) {
    return NextResponse.json({
      valid: false,
      error: `Code geldig vanaf ${data.min_nachten} nachten`,
    });
  }

  return NextResponse.json({
    valid: true,
    id: data.id,
    type: data.type,
    waarde: data.waarde,
    omschrijving: data.omschrijving,
  });
}
