import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, ADMIN_SESSION_TTL_MS } from "@/lib/admin-auth-edge";
import { consumeMagicToken, createAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") || "";
  if (!token) {
    return NextResponse.redirect(new URL("/admin/login?error=invalid", request.url));
  }

  const claim = await consumeMagicToken(token);
  if (!claim) {
    return NextResponse.redirect(new URL("/admin/login?error=expired", request.url));
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;
  const userAgent = request.headers.get("user-agent") || undefined;

  const { cookieValue } = await createAdminSession(claim.email, { ip, userAgent });

  const response = NextResponse.redirect(new URL("/admin", request.url));
  response.cookies.set(ADMIN_COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: Math.floor(ADMIN_SESSION_TTL_MS / 1000),
  });

  console.log(JSON.stringify({ event: "admin_session_created", email: claim.email }));

  return response;
}
