import { NextRequest, NextResponse } from "next/server";
import { aanbodVoorLodges } from "@/lib/mytourist";
import { checkStayDates } from "@/lib/stay-dates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Prijs en beschikbaarheid van beide lodges uit MyTourist.
 *
 * Bestaat naast /api/beschikbaarheid, niet in plaats ervan. Die blijft de
 * Booking.com-agenda en onze eigen bevestigde reserveringen bewaken; het
 * formulier combineert de twee. Zolang de eigen aanvraagflow nog draait, kan
 * een bij ons bevestigde reservering ontbreken in MyTourist — en dan is een
 * "vrij" van MyTourist alleen niet genoeg.
 *
 * Zonder MYTOURIST_API_TOKEN geeft deze route voor beide lodges "unknown", en
 * gedraagt het formulier zich precies zoals voorheen. */
export async function GET(request: NextRequest) {
  const checkIn = request.nextUrl.searchParams.get("checkIn");
  const checkOut = request.nextUrl.searchParams.get("checkOut");

  const datums = checkStayDates(checkIn, checkOut);
  if (!datums.ok) {
    return NextResponse.json({ error: datums.error }, { status: 400 });
  }

  const lodges = await aanbodVoorLodges({
    checkIn: checkIn as string,
    checkOut: checkOut as string,
    nights: datums.nights,
  });

  /* Een minuut cachen als beide antwoorden definitief zijn: MyTourist cachet
   * zelf ook, en het scheelt requests onder de limiet van tien per tien
   * seconden. De Booking Engine controleert bij het boeken opnieuw. Een
   * onvolledig antwoord wordt niet vastgelegd. */
  const definitief = Object.values(lodges).every(a => a.status !== "unknown");
  return NextResponse.json(
    { lodges },
    {
      headers: {
        "Cache-Control": definitief ? "s-maxage=60, stale-while-revalidate=120" : "no-store",
      },
    },
  );
}
