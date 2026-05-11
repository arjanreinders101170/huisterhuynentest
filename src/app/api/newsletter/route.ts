import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabase } from "@/lib/supabase";

const schema = z.object({
  naam: z.string().min(1).max(100),
  email: z.string().email(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ongeldig verzoek." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Vul een geldig e-mailadres in." }, { status: 400 });
  }

  const { naam, email } = parsed.data;

  try {
    const supabase = getSupabase();

    // Silently ignore duplicate emails
    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert({ naam, email, source: "landing" }, { onConflict: "email" });

    if (error) throw error;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Log but don't expose internal errors to the client
    console.error("[newsletter] Supabase error:", msg);
    return NextResponse.json(
      { error: "Er ging iets mis aan onze kant. Probeer het later opnieuw." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
