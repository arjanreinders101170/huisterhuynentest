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
      case "products": {
        const { data } = await getSupabase()
          .from("products")
          .select("*")
          .order("volgorde", { ascending: true });
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
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "toggle_review": {
        await getSupabase()
          .from("reviews")
          .update({ zichtbaar: body.visible })
          .eq("id", body.id);
        return NextResponse.json({ success: true });
      }
      case "create_product": {
        const { id, naam, omschrijving, prijs, categorie, volgorde } = body;
        if (!id || !naam || prijs === undefined) {
          return NextResponse.json({ error: "ID, naam en prijs zijn verplicht" }, { status: 400 });
        }
        const { error } = await getSupabase().from("products").insert({
          id, naam, omschrijving: omschrijving || null,
          prijs: parseFloat(prijs),
          categorie: categorie || "upsell",
          volgorde: volgorde || 0,
          actief: true,
        });
        if (error) {
          if (error.code === "23505") return NextResponse.json({ error: "Product ID bestaat al" }, { status: 400 });
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true });
      }
      case "update_product": {
        const { id, naam, omschrijving, prijs, categorie, volgorde } = body;
        if (!id) return NextResponse.json({ error: "Product ID is verplicht" }, { status: 400 });
        const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (naam !== undefined) updates.naam = naam;
        if (omschrijving !== undefined) updates.omschrijving = omschrijving;
        if (prijs !== undefined) updates.prijs = parseFloat(prijs);
        if (categorie !== undefined) updates.categorie = categorie;
        if (volgorde !== undefined) updates.volgorde = volgorde;
        await getSupabase().from("products").update(updates).eq("id", id);
        return NextResponse.json({ success: true });
      }
      case "toggle_product": {
        await getSupabase()
          .from("products")
          .update({ actief: body.actief, updated_at: new Date().toISOString() })
          .eq("id", body.id);
        return NextResponse.json({ success: true });
      }
      case "delete_product": {
        await getSupabase()
          .from("products")
          .delete()
          .eq("id", body.id);
        return NextResponse.json({ success: true });
      }
      default:
        return NextResponse.json({ error: "Onbekende actie" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Actie mislukt" }, { status: 500 });
  }
}
