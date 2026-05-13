import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email")?.toLowerCase().trim();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ known: false });
  }

  try {
    const { data } = await getSupabase()
      .from("guests")
      .select("naam, laatste_bezoek")
      .ilike("email", email)
      .single();

    if (!data) return NextResponse.json({ known: false });

    const voornaam = (data.naam || "").split(" ")[0] || data.naam || "";
    return NextResponse.json({ known: true, naam: voornaam });
  } catch {
    return NextResponse.json({ known: false });
  }
}
