import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // Redirect admin subdomain root to /admin
  if (hostname.startsWith("admin.") && pathname === "/") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Only protect /admin routes (except login page and login API)
  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname === "/admin/login") return NextResponse.next();
  if (pathname.startsWith("/api/admin/login")) return NextResponse.next();

  // Check for session cookie
  const session = request.cookies.get("hth-admin-session");
  if (!session || session.value !== process.env.ADMIN_SECRET) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*"],
};
