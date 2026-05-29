import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function handlePricingGet(table: string, request: NextRequest): Promise<NextResponse | null> {
  switch (table) {
    case "pricing_periods": {
      const { data, error } = await getSupabase()
        .from("pricing_periods")
        .select("*")
        .order("start_date", { ascending: true });
      if (error) return NextResponse.json({ data: [], error: error.message });
      return NextResponse.json({ data: data || [] });
    }
    case "pricing_config": {
      const { data, error } = await getSupabase().from("pricing_config").select("*");
      if (error) return NextResponse.json({ data: [], error: error.message });
      return NextResponse.json({ data: data || [] });
    }
    case "availability_discounts": {
      const lodge = request.nextUrl.searchParams.get("lodge_id");
      const query = getSupabase().from("availability_discounts").select("*").order("days_before", { ascending: true });
      const { data, error } = lodge ? await query.eq("lodge_id", lodge) : await query;
      if (error) return NextResponse.json({ data: [], error: error.message });
      return NextResponse.json({ data: data || [] });
    }
    case "fee_templates": {
      const { data, error } = await getSupabase()
        .from("fee_templates")
        .select("*")
        .order("volgorde", { ascending: true });
      if (error) return NextResponse.json({ data: [], error: error.message });
      return NextResponse.json({ data: data || [] });
    }
    default:
      return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function handlePricingPost(action: string, body: Record<string, unknown>, _request: NextRequest): Promise<NextResponse | null> {
  switch (action) {
    case "save_pricing_config": {
      const { lodge_id, base_price, surcharge_config } = body;
      if (!lodge_id || base_price === undefined) {
        return NextResponse.json({ error: "lodge_id en base_price zijn verplicht" }, { status: 400 });
      }
      const { error } = await getSupabase().from("pricing_config").upsert({
        lodge_id,
        base_price: parseFloat(base_price as string),
        surcharge_config: surcharge_config ?? {},
        updated_at: new Date().toISOString(),
      }, { onConflict: "lodge_id" });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }
    case "save_availability_discounts": {
      const { lodge_id, discounts } = body as { lodge_id: string; discounts: Array<{ days_before: number; discount_pct: number }> };
      if (!lodge_id || !Array.isArray(discounts)) {
        return NextResponse.json({ error: "lodge_id en discounts zijn verplicht" }, { status: 400 });
      }
      await getSupabase().from("availability_discounts").delete().eq("lodge_id", lodge_id);
      if (discounts.length > 0) {
        const { error } = await getSupabase().from("availability_discounts").insert(
          discounts.map(d => ({ lodge_id, days_before: d.days_before, discount_pct: d.discount_pct }))
        );
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }
    case "create_pricing_period": {
      const { lodge_id, label, start_date, end_date, price_per_night } = body;
      if (!lodge_id || !label || !start_date || !end_date || price_per_night === undefined) {
        return NextResponse.json({ error: "Alle velden zijn verplicht" }, { status: 400 });
      }
      const { error } = await getSupabase().from("pricing_periods").insert({
        lodge_id, label, start_date, end_date,
        price_per_night: parseFloat(price_per_night as string),
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }
    case "update_pricing_period": {
      const { id, lodge_id, label, start_date, end_date, price_per_night } = body;
      if (!id) return NextResponse.json({ error: "ID verplicht" }, { status: 400 });
      const updates: Record<string, unknown> = {};
      if (lodge_id !== undefined) updates.lodge_id = lodge_id;
      if (label !== undefined) updates.label = label;
      if (start_date !== undefined) updates.start_date = start_date;
      if (end_date !== undefined) updates.end_date = end_date;
      if (price_per_night !== undefined) updates.price_per_night = parseFloat(price_per_night as string);
      await getSupabase().from("pricing_periods").update(updates).eq("id", id);
      return NextResponse.json({ success: true });
    }
    case "delete_pricing_period": {
      if (!body.id) return NextResponse.json({ error: "ID verplicht" }, { status: 400 });
      await getSupabase().from("pricing_periods").delete().eq("id", body.id);
      return NextResponse.json({ success: true });
    }
    case "create_fee_template": {
      const { label, soort, bedrag, percentage, basis, volgorde } = body;
      if (!label || !soort || !basis) {
        return NextResponse.json({ error: "Label, soort en basis zijn verplicht" }, { status: 400 });
      }
      if (!["toeslag", "korting", "belasting"].includes(soort as string)) {
        return NextResponse.json({ error: "Ongeldige soort" }, { status: 400 });
      }
      if (!["eenmalig", "per_nacht", "per_persoon", "per_persoon_per_nacht"].includes(basis as string)) {
        return NextResponse.json({ error: "Ongeldige basis" }, { status: 400 });
      }
      const { data, error } = await getSupabase().from("fee_templates").insert({
        label: String(label).trim(),
        soort,
        bedrag: bedrag !== undefined && bedrag !== "" ? parseFloat(bedrag as string) : null,
        percentage: percentage !== undefined && percentage !== "" ? parseFloat(percentage as string) : null,
        basis,
        volgorde: volgorde !== undefined ? parseInt(volgorde as string) || 0 : 0,
        actief: true,
      }).select().single();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true, data });
    }
    case "update_fee_template": {
      const { id, label, soort, bedrag, percentage, basis, volgorde } = body;
      if (!id) return NextResponse.json({ error: "ID verplicht" }, { status: 400 });
      const updates: Record<string, unknown> = {};
      if (label !== undefined) updates.label = String(label).trim();
      if (soort !== undefined) updates.soort = soort;
      if (bedrag !== undefined) updates.bedrag = bedrag === "" ? null : parseFloat(bedrag as string);
      if (percentage !== undefined) updates.percentage = percentage === "" ? null : parseFloat(percentage as string);
      if (basis !== undefined) updates.basis = basis;
      if (volgorde !== undefined) updates.volgorde = parseInt(volgorde as string) || 0;
      const { error } = await getSupabase().from("fee_templates").update(updates).eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true });
    }
    case "toggle_fee_template": {
      if (!body.id) return NextResponse.json({ error: "ID verplicht" }, { status: 400 });
      await getSupabase().from("fee_templates").update({ actief: body.actief === true || body.actief === "true" }).eq("id", body.id);
      return NextResponse.json({ success: true });
    }
    case "delete_fee_template": {
      if (!body.id) return NextResponse.json({ error: "ID verplicht" }, { status: 400 });
      await getSupabase().from("fee_templates").delete().eq("id", body.id);
      return NextResponse.json({ success: true });
    }
    default:
      return null;
  }
}
