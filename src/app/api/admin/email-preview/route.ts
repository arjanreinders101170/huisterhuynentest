import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin-auth";
import { newsletterWelcomeEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!(await verifyAdminSession(request))) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const template = request.nextUrl.searchParams.get("template") ?? "";
  let html: string;

  switch (template) {
    case "newsletter-welcome":
      html = newsletterWelcomeEmail({
        firstName: "Arjan",
        photoUrl: `${SITE_URL}/lodge-heide.jpg`,
        siteUrl: SITE_URL,
      });
      break;
    default:
      return NextResponse.json({ error: "Onbekende template" }, { status: 400 });
  }

  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
