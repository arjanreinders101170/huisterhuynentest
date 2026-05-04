import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

// GET — last 5 visible reviews
export async function GET() {
  try {
    const { data, error } = await getSupabase()
      .from("reviews")
      .select("id, naam, sterren, tekst, created_at")
      .eq("zichtbaar", true)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Reviews fetch error:", error);
      return NextResponse.json({ reviews: [] });
    }

    const reviews = (data || []).map(r => ({
      ...r,
      datum: new Date(r.created_at).toLocaleDateString("nl-NL", {
        day: "numeric", month: "long", year: "numeric",
      }),
    }));

    return NextResponse.json({ reviews });
  } catch {
    return NextResponse.json({ reviews: [] });
  }
}

// POST — add new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { naam, sterren, tekst, email } = body;

    if (!naam || !sterren || !tekst) {
      return NextResponse.json({ error: "Naam, sterren en tekst zijn verplicht" }, { status: 400 });
    }

    if (sterren < 1 || sterren > 5) {
      return NextResponse.json({ error: "Sterren moet tussen 1 en 5 zijn" }, { status: 400 });
    }

    // Link to guest if email provided
    let guestId = null;
    if (email) {
      const { data } = await getSupabase().rpc("upsert_guest", {
        p_naam: String(naam).slice(0, 50),
        p_email: email,
      });
      guestId = data;
    }

    const { data, error } = await getSupabase()
      .from("reviews")
      .insert({
        guest_id: guestId,
        naam: String(naam).slice(0, 50),
        sterren: Number(sterren),
        tekst: String(tekst).slice(0, 500),
      })
      .select()
      .single();

    if (error) {
      console.error("Review insert error:", error);
      return NextResponse.json({ error: "Kon review niet opslaan" }, { status: 500 });
    }

    return NextResponse.json({ success: true, review: data });
  } catch {
    return NextResponse.json({ error: "Kon review niet opslaan" }, { status: 500 });
  }
}
