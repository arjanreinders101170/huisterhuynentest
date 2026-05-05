import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

function isAuthed(request: NextRequest): boolean {
  const session = request.cookies.get("hth-admin-session");
  return session?.value === process.env.ADMIN_SECRET;
}

// GET — fetch table data
export async function GET(request: NextRequest) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const table = request.nextUrl.searchParams.get("table");

  try {
    switch (table) {
      case "bookings": {
        const { data } = await getSupabase()
          .from("bookings")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);
        return NextResponse.json({ data: data || [] });
      }
      case "guests": {
        const { data } = await getSupabase()
          .from("guests")
          .select("*")
          .order("laatste_bezoek", { ascending: false })
          .limit(50);
        return NextResponse.json({ data: data || [] });
      }
      case "reviews": {
        const { data } = await getSupabase()
          .from("reviews")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);
        return NextResponse.json({ data: data || [] });
      }
      case "aanvragen": {
        const { data } = await getSupabase()
          .from("terugkeer_aanvragen")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);
        return NextResponse.json({ data: data || [] });
      }
      default:
        return NextResponse.json({ error: "Onbekende tabel" }, { status: 400 });
    }
  } catch (err) {
    console.error("Admin data error:", err);
    return NextResponse.json({ error: "Kon data niet laden" }, { status: 500 });
  }
}

// POST — admin actions
export async function POST(request: NextRequest) {
  if (!isAuthed(request)) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  try {
    const { action, id, visible } = await request.json();

    switch (action) {
      case "toggle_review": {
        await getSupabase()
          .from("reviews")
          .update({ zichtbaar: visible })
          .eq("id", id);
        return NextResponse.json({ success: true });
      }
      default:
        return NextResponse.json({ error: "Onbekende actie" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Actie mislukt" }, { status: 500 });
  }
}
