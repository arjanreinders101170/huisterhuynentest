import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/*
 * In-memory review store — works for demo/testing.
 * For production: replace with Vercel KV, Supabase, or any database.
 *
 * Reviews persist within a single server instance but reset on cold start.
 * This is fine for a boutique lodge with low traffic.
 */

type Review = {
  id: string;
  naam: string;
  sterren: number;
  tekst: string;
  datum: string;
};

const reviews: Review[] = [
  // Seed with a few example reviews
  {
    id: "seed-1",
    naam: "Martijn & Lisa",
    sterren: 5,
    tekst: "Prachtige locatie, heerlijk rustig. De boomhut is uniek. We komen zeker terug!",
    datum: "2025-04-18",
  },
  {
    id: "seed-2",
    naam: "Familie De Vries",
    sterren: 5,
    tekst: "Kinderen vonden het fantastisch. De app met tips was super handig.",
    datum: "2025-04-25",
  },
  {
    id: "seed-3",
    naam: "Anke",
    sterren: 4,
    tekst: "Heerlijk weekend gehad. De wellness-tip was top. Aanrader!",
    datum: "2025-05-01",
  },
];

// GET — return last 5 reviews, newest first
export async function GET() {
  const last5 = reviews.slice(-5).reverse();
  return NextResponse.json({ reviews: last5 });
}

// POST — add a new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { naam, sterren, tekst } = body;

    if (!naam || !sterren || !tekst) {
      return NextResponse.json(
        { error: "Naam, sterren en tekst zijn verplicht" },
        { status: 400 }
      );
    }

    if (sterren < 1 || sterren > 5) {
      return NextResponse.json(
        { error: "Sterren moet tussen 1 en 5 zijn" },
        { status: 400 }
      );
    }

    const review: Review = {
      id: `rev-${Date.now()}`,
      naam: String(naam).slice(0, 50),
      sterren: Number(sterren),
      tekst: String(tekst).slice(0, 500),
      datum: new Date().toISOString().split("T")[0],
    };

    reviews.push(review);

    // Keep max 50 reviews in memory
    if (reviews.length > 50) {
      reviews.splice(0, reviews.length - 50);
    }

    return NextResponse.json({ success: true, review });
  } catch {
    return NextResponse.json(
      { error: "Kon review niet opslaan" },
      { status: 500 }
    );
  }
}
