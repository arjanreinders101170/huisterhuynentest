import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { createSession } from "@/lib/sessions";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

const loginSchema = z.object({
  password: z.string().min(1).max(256),
});

function readIp(request: NextRequest): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = request.headers.get("x-real-ip");
  return real?.trim() || "unknown";
}

export async function POST(request: NextRequest) {
  const ip = readIp(request);
  const ua = request.headers.get("user-agent") ?? "";

  // Rate-limit: 5 attempts per 10 minutes per IP
  const rl = await checkRateLimit(`admin-login:${ip}`, 5, 600);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Te veel inlogpogingen. Probeer het later opnieuw." },
      { status: 429, headers: { "Retry-After": String(rl.resetIn) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige request" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Wachtwoord ontbreekt" }, { status: 400 });
  }

  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    return NextResponse.json(
      { error: "Admin niet geconfigureerd" },
      { status: 503 },
    );
  }

  // Timing-safe comparison
  const a = Buffer.from(parsed.data.password);
  const b = Buffer.from(adminSecret);
  const ok = a.length === b.length && timingSafeEqual(a, b);

  if (!ok) {
    return NextResponse.json({ error: "Onjuist wachtwoord" }, { status: 401 });
  }

  let session: { id: string; expiresAt: Date };
  try {
    session = await createSession(ip, ua);
  } catch (err) {
    console.error("[admin/login] createSession failed:", err);
    return NextResponse.json(
      { error: "Sessie kon niet worden aangemaakt" },
      { status: 500 },
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("hth-admin-session-v2", session.id, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  return response;
}
