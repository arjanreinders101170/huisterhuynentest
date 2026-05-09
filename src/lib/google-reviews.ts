export interface GoogleReview {
  author: string;
  rating: number;
  text: string;
  time: number;
  profilePhoto?: string;
}

export interface GoogleReviewsResult {
  reviews: GoogleReview[];
  totalRating: number | null;
  totalCount: number | null;
}

export async function fetchGoogleReviews(): Promise<GoogleReviewsResult> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    return { reviews: [], totalRating: null, totalCount: null };
  }

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
    url.searchParams.set("place_id", placeId);
    url.searchParams.set("fields", "reviews,rating,user_ratings_total");
    url.searchParams.set("language", "nl");
    url.searchParams.set("key", apiKey);

    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) return { reviews: [], totalRating: null, totalCount: null };

    const data = await res.json();
    if (data.status !== "OK") return { reviews: [], totalRating: null, totalCount: null };

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

    return {
      reviews,
      totalRating: data.result?.rating ?? null,
      totalCount: data.result?.user_ratings_total ?? null,
    };
  } catch {
    return { reviews: [], totalRating: null, totalCount: null };
  }
}
