import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

// GET — called by Vercel Cron (zie vercel.json).
// Zet blog posts waarvan de geplande_publicatie inmiddels gepasseerd is op
// gepubliceerd = true.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = getSupabase();
  const nowIso = new Date().toISOString();
  const todayIso = nowIso.slice(0, 10);

  const { data: due, error: dueErr } = await sb
    .from("blog_posts")
    .select("id, slug, titel")
    .eq("gepubliceerd", false)
    .not("geplande_publicatie", "is", null)
    .lte("geplande_publicatie", nowIso);

  if (dueErr) return NextResponse.json({ error: dueErr.message }, { status: 500 });
  if (!due || due.length === 0) return NextResponse.json({ published: 0 });

  const ids = due.map(p => p.id);
  const { error: updErr } = await sb
    .from("blog_posts")
    .update({
      gepubliceerd: true,
      gepubliceerd_op: todayIso,
      geplande_publicatie: null,
      updated_at: nowIso,
    })
    .in("id", ids);

  if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });

  return NextResponse.json({
    published: due.length,
    posts: due.map(p => ({ slug: p.slug, titel: p.titel })),
  });
}
