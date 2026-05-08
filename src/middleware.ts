import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/sessions";

/* ═══ RATE LIMITER (in-memory, per serverless instance) ═══ */
const hits = new Map<string, { count: number; reset: number }>();

const LIMITS: Record<string, { max: number; window: number }> = {
  "/api/chat":        { max: 20, window: 60000 },    // 20/min
  "/api/booking":     { max: 5,  window: 3600000 },   // 5/hour
  "/api/terugkomen":  { max: 5,  window: 3600000 },   // 5/hour
  "/api/checkout":    { max: 10, window: 3600000 },    // 10/hour
  "/api/reviews":     { max: 10, window: 60000 },      // 10/min
  "/api/nuki/unlock": { max: 3,  window: 60000 },      // 3/min
  "/api/offerte":     { max: 5,  window: 3600000 },    // 5/hour
  "/api/bevestig":    { max: 10, window: 3600000 },    // 10/hour
};

function checkRateLimit(ip: string, path: string): boolean {
  // Find matching limit
  const limitKey = Object.keys(LIMITS).find(k => path.startsWith(k));
  if (!limitKey) return true;

  const { max, window } = LIMITS[limitKey];
  const key = `${ip}:${limitKey}`;
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.reset) {
    hits.set(key, { count: 1, reset: now + window });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // Redirect admin subdomain root to /admin
  if (hostname.startsWith("admin.") && pathname === "/") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Rate limit API routes
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/admin/")) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(ip, pathname)) {
      return NextResponse.json(
        { error: "Te veel verzoeken. Probeer het later opnieuw." },
        { status: 429 }
      );
    }
  }

  // Protect /admin routes (except login + logout)
  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname === "/admin/login") return NextResponse.next();
  if (pathname.startsWith("/api/admin/login")) return NextResponse.next();
  if (pathname.startsWith("/api/admin/logout")) return NextResponse.next();

  const sessionId = request.cookies.get("hth-admin-session-v2")?.value;
  if (!sessionId) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const session = await getSession(sessionId);
  if (!session || session.revokedAt || session.expiresAt.getTime() <= Date.now()) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*", "/api/:path*"],
};
