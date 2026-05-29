import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function handleDiscountCodesGet(table: string): Promise<NextResponse | null> {
  if (table !== "discount_codes") return null;
  const { data, error } = await getSupabase()
    .from("discount_codes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ data: [], error: error.message });
  return NextResponse.json({ data: data || [] });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function handleDiscountCodesPost(action: string, body: Record<string, unknown>, _request: NextRequest): Promise<NextResponse | null> {
  switch (action) {
    case "create_discount_code": {
      const { code, omschrijving, type, waarde, geldig_van, geldig_tot, max_gebruik, min_nachten } = body;
      if (!code || !type || !waarde) return NextResponse.json({ error: "Code, type en waarde zijn verplicht" }, { status: 400 });
      const { data, error } = await getSupabase().from("discount_codes").insert({
        code: String(code).toUpperCase().trim(),
        omschrijving: omschrijving || null,
        type,
        waarde: parseFloat(waarde as string),
        geldig_van: geldig_van || null,
        geldig_tot: geldig_tot || null,
        max_gebruik: max_gebruik ? parseInt(max_gebruik as string) : null,
        min_nachten: min_nachten ? parseInt(min_nachten as string) : null,
        actief: true,
      }).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true, data });
    }
    case "update_discount_code": {
      const { id, code, omschrijving, type, waarde, geldig_van, geldig_tot, max_gebruik, min_nachten } = body;
      if (!id) return NextResponse.json({ error: "ID verplicht" }, { status: 400 });
      const { error } = await getSupabase().from("discount_codes").update({
        code: String(code).toUpperCase().trim(),
        omschrijving: omschrijving || null,
        type,
        waarde: parseFloat(waarde as string),
        geldig_van: geldig_van || null,
        geldig_tot: geldig_tot || null,
        max_gebruik: max_gebruik ? parseInt(max_gebruik as string) : null,
        min_nachten: min_nachten ? parseInt(min_nachten as string) : null,
      }).eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true });
    }
    case "toggle_discount_code": {
      if (!body.id) return NextResponse.json({ error: "ID verplicht" }, { status: 400 });
      await getSupabase().from("discount_codes").update({ actief: body.actief === "true" || body.actief === true }).eq("id", body.id);
      return NextResponse.json({ success: true });
    }
    case "delete_discount_code": {
      if (!body.id) return NextResponse.json({ error: "ID verplicht" }, { status: 400 });
      await getSupabase().from("discount_codes").delete().eq("id", body.id);
      return NextResponse.json({ success: true });
    }
    case "reset_discount_usage": {
      if (!body.id) return NextResponse.json({ error: "ID verplicht" }, { status: 400 });
      await getSupabase().from("discount_codes").update({ gebruik_count: 0 }).eq("id", body.id);
      return NextResponse.json({ success: true });
    }
    default:
      return null;
  }
}
