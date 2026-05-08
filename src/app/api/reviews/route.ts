import { NextRequest, NextResponse } from "next/server";
import { getSupabase, getPublicSupabase } from "@/lib/supabase";
import { reviewSchema } from "@/lib/schemas";
import { LodgeSchema, getLodgeFromStayToken } from "@/lib/lodge";

export const runtime = "nodejs";

// GET — last 5 visible reviews, optionally filtered by lodge
export async function GET(request: NextRequest) {
  try {
    const lodgeParam = request.nextUrl.searchParams.get("lodge");
    const parsedLodge = lodgeParam ? LodgeSchema.safeParse(lodgeParam) : null;

    let query = getPublicSupabase()
      .from("reviews")
      .select("id, naam, sterren, tekst, created_at, lodge")
      .eq("zichtbaar", true)
      .order("created_at", { ascending: false })
      .limit(5);

    if (parsedLodge?.success) {
      query = query.eq("lodge", parsedLodge.data);
    }

    const { data, error } = await query;

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

// POST — add new review. A review must be tied to a lodge: either via a valid
// stay-token (preferred — derives lodge server-side) or by sending an explicit
// `lodge` value. Rate-limiting is handled in middleware.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Ongeldige invoer" }, { status: 400 });
    }

    const { naam, sterren, tekst, email, lodge: explicitLodge, stayToken } = parsed.data;

    // Resolve lodge: stay-token wins (server-derived, can't be spoofed).
    let lodge = explicitLodge ?? null;
    if (stayToken) {
      const derived = await getLodgeFromStayToken(stayToken);
      if (!derived) {
        return NextResponse.json({ error: "Ongeldige stay-token" }, { status: 400 });
      }
      lodge = derived;
    }

    if (!lodge) {
      return NextResponse.json(
        { error: "Lodge ontbreekt — geef stayToken of lodge mee" },
        { status: 400 },
      );
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
        lodge,
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
