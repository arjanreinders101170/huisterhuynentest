import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

/** Voortgang van de marketingplanning. Eén rij per afgevinkte taak:
 *  aanwezig = afgerond, verwijderd = open. Zie migrations/2026_08_18_marketing_task_status.sql */

export async function handleMarketingGet(table: string): Promise<NextResponse | null> {
  if (table !== "marketing_tasks") return null;
  const { data, error } = await getSupabase()
    .from("marketing_task_status")
    .select("task_id");
  if (error) return NextResponse.json({ data: [], error: error.message });
  return NextResponse.json({ data: (data || []).map(r => r.task_id) });
}

/** Taak-ids zijn constanten uit MarketingTab, geen vrije invoer. Toch begrenzen we
 *  lengte en aantal zodat een kapotte client de tabel niet kan volschrijven. */
const MAX_ID_LEN = 40;
const MAX_BULK = 500;

function cleanId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const id = value.trim();
  return id && id.length <= MAX_ID_LEN ? id : null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function handleMarketingPost(action: string, body: Record<string, unknown>, _request: NextRequest): Promise<NextResponse | null> {
  switch (action) {
    case "toggle_marketing_task": {
      const id = cleanId(body.id);
      if (!id) return NextResponse.json({ error: "Taak-id verplicht" }, { status: 400 });

      if (body.done === true || body.done === "true") {
        const { error } = await getSupabase()
          .from("marketing_task_status")
          .upsert({ task_id: id, afgerond_op: new Date().toISOString() }, { onConflict: "task_id" });
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      } else {
        const { error } = await getSupabase()
          .from("marketing_task_status")
          .delete()
          .eq("task_id", id);
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    /** Meerdere taken tegelijk: de bulkknoppen in de tab, en de eenmalige
     *  overzet van de oude localStorage-status bij het eerste laden.
     *  Idempotent: upsert respectievelijk delete op de primaire sleutel. */
    case "bulk_marketing_tasks": {
      const raw = Array.isArray(body.ids) ? body.ids : [];
      const ids = [...new Set(raw.map(cleanId).filter((id): id is string => id !== null))].slice(0, MAX_BULK);
      if (ids.length === 0) return NextResponse.json({ success: true, aantal: 0 });

      if (body.done === true || body.done === "true") {
        const now = new Date().toISOString();
        const { error } = await getSupabase()
          .from("marketing_task_status")
          .upsert(ids.map(task_id => ({ task_id, afgerond_op: now })), { onConflict: "task_id" });
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      } else {
        const { error } = await getSupabase()
          .from("marketing_task_status")
          .delete()
          .in("task_id", ids);
        if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, aantal: ids.length });
    }

    default:
      return null;
  }
}
