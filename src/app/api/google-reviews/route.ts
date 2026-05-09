import { NextResponse } from "next/server";

export const runtime = "nodejs";
// Cache 1 hour — Google Places API has quota limits
export const revalidate = 3600;

export interface GoogleReview {
  author: string;
  rating: number;
  text: string;
  time: number;
  profilePhoto?: string;
}

export async function GET() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    return NextResponse.json({ reviews: [], error: "not_configured" });
  }

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
    url.searchParams.set("place_id", placeId);
    url.searchParams.set("fields", "reviews,rating,user_ratings_total");
    url.searchParams.set("language", "nl");
    url.searchParams.set("key", apiKey);

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) {
      console.error("Google Places API error:", res.status);
      return NextResponse.json({ reviews: [], error: "api_error" });
    }

    const data = await res.json();
    if (data.status !== "OK") {
      console.error("Google Places status:", data.status, data.error_message);
      return NextResponse.json({ reviews: [], error: data.status });
    }

    const reviews: GoogleReview[] = (data.result?.reviews ?? [])
      .filter((r: { rating: number; text?: string }) => r.rating >= 4 && r.text)
      .slice(0, 6)
      .map((r: {
        author_name: string;
        rating: number;
        text: string;
        time: number;
        profile_photo_url?: string;
      }) => ({
        author: r.author_name,
        rating: r.rating,
        text: r.text,
        time: r.time,
        profilePhoto: r.profile_photo_url,
      }));

    return NextResponse.json({
      reviews,
      totalRating: data.result?.rating,
      totalCount: data.result?.user_ratings_total,
    });
  } catch (err) {
    console.error("Google reviews fetch failed:", err);
    return NextResponse.json({ reviews: [], error: "fetch_failed" });
  }
}
