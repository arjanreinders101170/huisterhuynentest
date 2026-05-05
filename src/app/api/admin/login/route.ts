import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const adminSecret = process.env.ADMIN_SECRET;

    if (!adminSecret) {
      return NextResponse.json({ error: "Admin niet geconfigureerd" }, { status: 500 });
    }

    if (password !== adminSecret) {
      return NextResponse.json({ error: "Onjuist wachtwoord" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });

    response.cookies.set("hth-admin-session", adminSecret, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Ongeldige request" }, { status: 400 });
  }
}
