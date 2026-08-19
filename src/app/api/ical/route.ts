import { NextRequest, NextResponse } from "next/server";
import { fetchIcalPeriods, confirmedPeriods, isKnownLodge } from "@/lib/availability";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const lodge = request.nextUrl.searchParams.get("lodge");
  if (!lodge || !isKnownLodge(lodge)) {
    return NextResponse.json({ error: "Ongeldige lodge" }, { status: 400 });
  }

  try {
    const [ical, confirmed] = await Promise.all([
      fetchIcalPeriods(lodge),
      confirmedPeriods(lodge),
    ]);

    const events = [...ical.periods, ...confirmed].map(p => ({ start: p.start, end: p.end }));

    /* Is de externe agenda onbereikbaar, dan geven we alsnog onze eigen
     * bevestigde reserveringen terug: te veel bezet tonen is minder erg dan
     * een dubbele boeking uitlokken. Niet cachen, want dit beeld is onvolledig. */
    if (!ical.ok) {
      return NextResponse.json(
        { events, error: "Agenda tijdelijk niet volledig — externe boekingen ontbreken" },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    return NextResponse.json({ events }, {
      headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch (e) {
    console.error("iCal route error:", e);
    return NextResponse.json({ events: [], error: "Agenda tijdelijk niet beschikbaar" });
  }
}
