import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin-auth";
import { newsletterWelcomeEmail, offerExpiredEmail, offerReminderEmail } from "@/lib/email";
import { formatDateNl, graceEndDate, offerExpiryDate, todayISO, addDaysISO } from "@/lib/offer-expiry";
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
    case "offer-reminder":
    case "offer-expired": {
      const vervalt = offerExpiryDate(null, addDaysISO(todayISO(), -7));
      const gemeen = {
        firstName: "Lian",
        lodgeNaam: "De Heide",
        photoUrl: `${SITE_URL}/lodge-heide.jpg`,
        periodeLabel: "28 maart 2027 t/m 4 april 2027",
        totaal: 1521.15,
        geldigTot: formatDateNl(vervalt),
      };
      const confirmUrl = `${SITE_URL}/bevestig?id=voorbeeld&t=voorbeeld`;
      html = template === "offer-reminder"
        ? offerReminderEmail({ ...gemeen, confirmUrl, dagenResterend: 2 })
        : offerExpiredEmail({
          ...gemeen,
          siteUrl: SITE_URL,
          confirmUrl,
          coulanceTot: formatDateNl(graceEndDate(vervalt)),
        });
      break;
    }
    default:
      return NextResponse.json({ error: "Onbekende template" }, { status: 400 });
  }

  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
