import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, parseSessionCookie } from "@/lib/admin-auth-edge";
import { revokeAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const cookie = request.cookies.get(ADMIN_COOKIE_NAME);
  if (cookie) {
    const parsed = await parseSessionCookie(cookie.value);
    if (parsed) {
      try {
        await revokeAdminSession(parsed.sessionId);
      } catch (e) {
        console.error("[admin-logout] revoke failed:", e);
      }
    }
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
