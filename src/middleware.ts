import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, parseSessionCookie } from "@/lib/admin-auth-edge";
import { STAY_COOKIE_NAME, parseStayCookie } from "@/lib/stay-auth-edge";

/* ═══ RATE LIMITER (in-memory, per serverless instance) ═══ */
const hits = new Map<string, { count: number; reset: number }>();

const LIMITS: Record<string, { max: number; window: number }> = {
  "/api/chat":                 { max: 10, window: 60000 },    // 10/min — OpenAI kosten
  "/api/booking":              { max: 5,  window: 3600000 },  // 5/hour
  "/api/terugkomen":           { max: 5,  window: 3600000 },  // 5/hour
  "/api/checkout":             { max: 10, window: 3600000 },  // 10/hour
  "/api/reviews":              { max: 10, window: 60000 },    // 10/min
  "/api/nuki/unlock":          { max: 3,  window: 60000 },    // 3/min
  "/api/bevestig":             { max: 10, window: 3600000 },  // 10/hour
  "/api/stay":                 { max: 30, window: 60000 },    // 30/min — token lookups
  "/api/admin/request-link":   { max: 5,  window: 3600000 },  // 5/hour — voorkomt e-mailspam per IP
  "/api/admin/verify":         { max: 10, window: 3600000 },  // 10/hour — tokens zijn one-time-use
  "/api/mollie/webhook":       { max: 30, window: 3600000 },  // 30/hour — elke call kost een Mollie API-request
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

async function hasValidAdminCookie(request: NextRequest): Promise<boolean> {
  const cookie = request.cookies.get(ADMIN_COOKIE_NAME);
  if (!cookie) return false;
  const parsed = await parseSessionCookie(cookie.value);
  return Boolean(parsed);
}

async function hasValidStaySession(request: NextRequest): Promise<boolean> {
  const cookie = request.cookies.get(STAY_COOKIE_NAME);
  if (!cookie) return false;
  try {
    const parsed = await parseStayCookie(cookie.value);
    return Boolean(parsed);
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // Redirect admin subdomain root to /admin
  if (hostname.startsWith("admin.") && pathname === "/") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Rate limit API routes.
  // Routes die niet in LIMITS staan krijgen geen limiet — authenticated admin-routes
  // (bijv. /api/admin/data) staan er bewust niet in en worden doorgelaten.
  if (pathname.startsWith("/api/")) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(ip, pathname)) {
      return NextResponse.json(
        { error: "Te veel verzoeken. Probeer het later opnieuw." },
        { status: 429 }
      );
    }
  }

  // Gast-app afscherming. /app rewrite naar /concierge in next.config.ts, dus
  // we moeten beide paden gaten — middleware draait vóór de rewrite.
  const isConciergeRoute =
    pathname === "/app" || pathname.startsWith("/app/") ||
    pathname === "/concierge" || pathname.startsWith("/concierge/");

  if (isConciergeRoute && pathname !== "/concierge/locked") {
    const hasToken = Boolean(request.nextUrl.searchParams.get("s"));
    if (!hasToken && !(await hasValidStaySession(request))) {
      return NextResponse.rewrite(new URL("/concierge/locked", request.url));
    }
  }

  // Pagina's die een admin-sessie vereisen.
  const requiresAdmin =
    (pathname.startsWith("/admin") && pathname !== "/admin/login") ||
    pathname.startsWith("/offerte");

  if (!requiresAdmin) return NextResponse.next();

  if (!(await hasValidAdminCookie(request))) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/app",
    "/app/:path*",
    "/concierge",
    "/concierge/:path*",
    "/admin/:path*",
    "/offerte/:path*",
    "/offerte",
    "/api/:path*",
  ],
};
