import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabase } from "@/lib/supabase";
import { newsletterWelcomeEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/site";

const LODGE_NAME = "Huis ter Huynen";

const schema = z.object({
  naam: z.string().min(1).max(100),
  email: z.string().email(),
  _pot: z.string().max(0).optional(), // moet leeg zijn — bots vullen dit in
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

  const { naam, email, _pot } = parsed.data;

  // Honeypot gevuld → stille weigering (bot ziet geen fout)
  if (_pot) {
    return NextResponse.json({ ok: true });
  }

  let isNewSubscriber = false;
  try {
    const supabase = getSupabase();

    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("email")
      .eq("email", email)
      .maybeSingle();
    isNewSubscriber = !existing;

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

  // Welkomstmail — alleen bij een nieuwe aanmelding, en alleen als Resend is geconfigureerd
  const resendKey = process.env.RESEND_API_KEY;
  if (isNewSubscriber && resendKey) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: `${LODGE_NAME} <lodge@huisterhuynen.nl>`,
        to: [email],
        subject: `Welkom bij ${LODGE_NAME}`,
        html: newsletterWelcomeEmail({
          firstName: naam,
          photoUrl: `${SITE_URL}/lodge-heide.jpg`,
          siteUrl: SITE_URL,
        }),
      });
    } catch (e) {
      console.error("[newsletter] welcome email error:", e);
    }
  }

  return NextResponse.json({ ok: true });
}
