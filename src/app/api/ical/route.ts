import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

// iCal tokens stored server-side — never exposed to the client
const ICAL_URLS: Record<string, string> = {
  lodge_1: process.env.ICAL_LODGE_1 || "https://ical.booking.com/v1/export?t=4ba3994f-bd1d-4b5a-9219-c1022a71b8bc",
  lodge_2: process.env.ICAL_LODGE_2 || "https://ical.booking.com/v1/export?t=aef0f4b7-7ef2-4acc-a558-f8c8cc8f70a6",
};

function formatDate(raw: string): string {
  const d = raw.replace(/[TZ].*/, "").replace(/-/g, "");
  return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
}

function parseICS(ics: string): { start: string; end: string }[] {
  const events: { start: string; end: string }[] = [];
  const lines = ics.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  let inEvent = false;
  let start = "";
  let end = "";
  for (const line of lines) {
    if (line.trim() === "BEGIN:VEVENT") { inEvent = true; start = ""; end = ""; }
    else if (line.trim() === "END:VEVENT") {
      if (start && end) events.push({ start: formatDate(start), end: formatDate(end) });
      inEvent = false;
    } else if (inEvent) {
      const [key, ...rest] = line.split(":");
      const val = rest.join(":");
      if (key.startsWith("DTSTART")) start = val;
      else if (key.startsWith("DTEND")) end = val;
    }
  }
  return events;
}

export async function GET(request: NextRequest) {
  const lodge = request.nextUrl.searchParams.get("lodge");
  if (!lodge || !ICAL_URLS[lodge]) {
    return NextResponse.json({ error: "Ongeldige lodge" }, { status: 400 });
  }

  try {
    const [icalRes, manualRes] = await Promise.all([
      fetch(ICAL_URLS[lodge], {
        headers: { "User-Agent": "HuisTermHuynen-Calendar/1.0" },
        next: { revalidate: 3600 },
      }),
      getSupabase()
        .from("booking_requests")
        .select("check_in, check_out")
        .eq("lodge", lodge)
        .in("status", ["bevestigd", "aanbetaling_verstuurd", "aanbetaling_betaald", "restbetaling_verstuurd", "volledig_betaald"])
        .not("check_in", "is", null)
        .not("check_out", "is", null),
    ]);

    if (!icalRes.ok) throw new Error(`HTTP ${icalRes.status}`);
    const ics = await icalRes.text();
    const events = parseICS(ics);

    const manual = (manualRes.data || []) as { check_in: string; check_out: string }[];
    for (const m of manual) {
      if (m.check_in && m.check_out) events.push({ start: m.check_in, end: m.check_out });
    }

    return NextResponse.json({ events }, {
      headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch (e) {
    console.error("iCal fetch error:", e);
    return NextResponse.json({ events: [], error: "Agenda tijdelijk niet beschikbaar" });
  }
}
