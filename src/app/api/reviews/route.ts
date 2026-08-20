import { NextRequest, NextResponse } from "next/server";
import { getSupabase, getPublicSupabase } from "@/lib/supabase";
import { reviewSchema } from "@/lib/schemas";

export const runtime = "nodejs";

// GET — last 5 visible reviews
export async function GET() {
  try {
    const { data, error } = await getPublicSupabase()
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

    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Ongeldige invoer" }, { status: 400 });
    }

    const { naam, sterren, tekst, email } = parsed.data;

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
        /* Expliciet, want deze route is onbeveiligd: iedereen kan een review
         * insturen. De tabel staat in geen enkele migratie in deze repo, dus
         * de kolomdefault is hier niet te controleren — en op een default
         * vertrouwen die je niet kunt zien, is geen moderatie. Zichtbaar
         * maken gebeurt in de admin (actie toggle_review). */
        zichtbaar: false,
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
