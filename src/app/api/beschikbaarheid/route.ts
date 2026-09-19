import { NextRequest, NextResponse } from "next/server";
import { vrijeLodges } from "@/lib/availability";
import { checkStayDates } from "@/lib/stay-dates";

export const runtime = "nodejs";

/* Beschikbaarheid van beide lodges voor één periode.
 *
 * Bestaat naast /api/ical, dat de kalender op de homepage per lodge voedt met
 * losse periodes. Het aanvraagformulier heeft een andere vraag: niet "welke
 * nachten zijn bezet" maar "kan dit verblijf, en zo niet, kan het dan in de
 * andere lodge". Die vraag hier beantwoorden scheelt het formulier twee
 * fetches en een eigen overlap-berekening — en zorgt dat het antwoord uit
 * dezelfde findConflict komt als de controle bij het versturen.
 */
export async function GET(request: NextRequest) {
  const checkIn = request.nextUrl.searchParams.get("checkIn");
  const checkOut = request.nextUrl.searchParams.get("checkOut");

  /* Dezelfde datumregels als de aanvraag zelf. Zonder deze check zou elke
   * willekeurige datumreeks een agenda-fetch en een databasequery opleveren. */
  const datums = checkStayDates(checkIn, checkOut);
  if (!datums.ok) {
    return NextResponse.json({ error: datums.error }, { status: 400 });
  }

  try {
    const { vrij, volledig } = await vrijeLodges({
      checkIn: checkIn as string,
      checkOut: checkOut as string,
    });

    /* Kort cachen als het beeld compleet is: de externe agenda eronder wordt
     * al een uur gecachet, dus een minuut extra verandert weinig aan de
     * versheid maar scheelt een databasequery per toetsaanslag in het
     * formulier. Is het beeld onvolledig, dan niets vastleggen. */
    return NextResponse.json(
      { vrij, volledig },
      {
        headers: {
          "Cache-Control": volledig
            ? "s-maxage=60, stale-while-revalidate=300"
            : "no-store",
        },
      },
    );
  } catch (e) {
    console.error("beschikbaarheid route error:", e);
    /* Geen lege uitkomst teruggeven: "niets bezet" is hier de gevaarlijkste
     * aanname. Het formulier laat de melding dan weg en de serverkant-check
     * bij het versturen vangt het alsnog af. */
    return NextResponse.json(
      { error: "Beschikbaarheid tijdelijk niet op te halen" },
      { status: 503 },
    );
  }
}
