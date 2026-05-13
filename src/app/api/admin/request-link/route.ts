import { NextRequest, NextResponse } from "next/server";
import { isAllowedAdminEmail, ADMIN_TOKEN_TTL_MS } from "@/lib/admin-auth-edge";
import { issueMagicToken } from "@/lib/admin-auth";

export const runtime = "nodejs";

// In-memory rate limit per e-mail (5/uur). Voldoende voor 2 admins.
const recent = new Map<string, number[]>();
const LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;

function tooMany(email: string): boolean {
  const now = Date.now();
  const arr = (recent.get(email) || []).filter(t => now - t < WINDOW_MS);
  if (arr.length >= LIMIT) {
    recent.set(email, arr);
    return true;
  }
  arr.push(now);
  recent.set(email, arr);
  return false;
}

export async function POST(request: NextRequest) {
  let body: { email?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige request" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "E-mailadres ontbreekt" }, { status: 400 });
  }

  // Antwoord identiek of e-mail bekend is of niet, om enumeratie te voorkomen.
  const okResponse = NextResponse.json({
    success: true,
    message: "Als dit adres toegang heeft, ontvang je een inloglink.",
  });

  if (!isAllowedAdminEmail(email)) return okResponse;
  if (tooMany(email)) return okResponse;

  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;
    const userAgent = request.headers.get("user-agent") || undefined;

    const { token, expiresAt } = await issueMagicToken(email, { ip, userAgent });

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://huisterhuynen.nl";
    const link = `${appUrl}/api/admin/verify?token=${encodeURIComponent(token)}`;

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      // Geen Resend → log alleen (dev). In productie altijd resend nodig.
      console.warn("[admin-magic-link] RESEND_API_KEY ontbreekt");
      return okResponse;
    }

    const { Resend } = await import("resend");
    const resend = new Resend(resendKey);

    const minutes = Math.round(ADMIN_TOKEN_TTL_MS / 60000);

    await resend.emails.send({
      from: "Huis ter Huynen <lodge@huisterhuynen.nl>",
      to: [email],
      subject: "Je inloglink voor Huis ter Huynen admin",
      html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#EAE3D2;font-family:Georgia,serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#FDFBF6;border-radius:12px;">
<tr><td style="padding:32px;">
<h1 style="font-size:22px;color:#2A2418;margin:0 0 12px;">Inloglink</h1>
<p style="font-family:Arial,sans-serif;font-size:15px;color:#2A2418;line-height:1.6;margin:0 0 20px;">
Klik op onderstaande knop om in te loggen op het admin-paneel. De link is ${minutes} minuten geldig en kan één keer gebruikt worden.
</p>
<p style="text-align:center;margin:24px 0;">
<a href="${link}" style="display:inline-block;background:#2F4F3E;color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">Inloggen</a>
</p>
<p style="font-family:Arial,sans-serif;font-size:12px;color:#8A7D6A;line-height:1.5;margin:24px 0 0;word-break:break-all;">
Als de knop niet werkt, kopieer deze link in je browser:<br>${link}
</p>
<p style="font-family:Arial,sans-serif;font-size:12px;color:#8A7D6A;line-height:1.5;margin:16px 0 0;">
Heb je deze link niet aangevraagd? Negeer dan deze mail — er gebeurt niets.
</p>
</td></tr></table></td></tr></table></body></html>`,
      replyTo: "lodge@huisterhuynen.nl",
    });

    console.log(JSON.stringify({
      event: "admin_magic_link_sent",
      email,
      expiresAt: expiresAt.toISOString(),
    }));
  } catch (e) {
    console.error("[admin-magic-link] failed:", e);
  }

  return okResponse;
}
