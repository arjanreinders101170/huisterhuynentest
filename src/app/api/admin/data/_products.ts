import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function handleProductsGet(table: string): Promise<NextResponse | null> {
  if (table !== "products") return null;
  const { data } = await getSupabase()
    .from("products")
    .select("*")
    .order("volgorde", { ascending: true });
  return NextResponse.json({ data: data || [] });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function handleProductsPost(action: string, body: Record<string, unknown>, _request: NextRequest): Promise<NextResponse | null> {
  switch (action) {
    case "create_product": {
      const { id, naam, omschrijving, prijs, categorie, volgorde, btw_percentage, grootboek_code } = body;
      if (!id || !naam || prijs === undefined) {
        return NextResponse.json({ error: "ID, naam en prijs zijn verplicht" }, { status: 400 });
      }
      const { error } = await getSupabase().from("products").insert({
        id, naam, omschrijving: omschrijving || null,
        prijs: parseFloat(prijs as string),
        categorie: categorie || "upsell",
        volgorde: volgorde || 0,
        btw_percentage: (btw_percentage as number) ?? 21,
        grootboek_code: grootboek_code || "8020",
        actief: true,
      });
      if (error) {
        if (error.code === "23505") return NextResponse.json({ error: "Product ID bestaat al" }, { status: 400 });
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }
    case "update_product": {
      const { id, naam, omschrijving, prijs, categorie, volgorde, btw_percentage, grootboek_code } = body;
      if (!id) return NextResponse.json({ error: "Product ID is verplicht" }, { status: 400 });
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (naam !== undefined) updates.naam = naam;
      if (omschrijving !== undefined) updates.omschrijving = omschrijving;
      if (prijs !== undefined) updates.prijs = parseFloat(prijs as string);
      if (categorie !== undefined) updates.categorie = categorie;
      if (volgorde !== undefined) updates.volgorde = volgorde;
      if (btw_percentage !== undefined) updates.btw_percentage = btw_percentage;
      if (grootboek_code !== undefined) updates.grootboek_code = grootboek_code;
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
      await getSupabase().from("products").delete().eq("id", body.id);
      return NextResponse.json({ success: true });
    }
    default:
      return null;
  }
}
