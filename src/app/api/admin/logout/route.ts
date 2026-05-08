import { NextRequest, NextResponse } from "next/server";
import { revokeSession } from "@/lib/sessions";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get("hth-admin-session-v2")?.value;

  if (sessionId) {
    try {
      await revokeSession(sessionId);
    } catch (err) {
      console.error("[admin/logout] revokeSession failed:", err);
      // Continue — we still want to clear the cookie client-side.
    }
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete("hth-admin-session-v2");
  // Also delete the legacy cookie so any leftover session is cleared.
  response.cookies.delete("hth-admin-session");
  return response;
}
