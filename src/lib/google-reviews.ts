export type GoogleReview = {
  author_name: string;
  rating: number;
  text: string;
  time: number;
  relative_time_description: string;
  profile_photo_url?: string;
};

export type GoogleReviewsData = {
  reviews: GoogleReview[];
  rating: number;
  total: number;
  reviewUrl: string;
};

const PLACE_ID = process.env.GOOGLE_PLACE_ID ?? "ChIJEZ3h8BUxyEcRqPvq9qnzXyk";
export const GOOGLE_REVIEW_URL = `https://search.google.com/local/writereview?placeid=${PLACE_ID}`;

export async function fetchGoogleReviews(): Promise<GoogleReviewsData> {
  const fallback: GoogleReviewsData = { reviews: [], rating: 0, total: 0, reviewUrl: GOOGLE_REVIEW_URL };

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return fallback;

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=reviews,rating,user_ratings_total&language=nl&key=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 3600 } } as RequestInit);
    if (!res.ok) return fallback;

    const data = await res.json();
    if (data.status !== "OK") return fallback;

    const result = data.result ?? {};
    return {
      reviews: (result.reviews ?? []) as GoogleReview[],
      rating: result.rating ?? 0,
      total: result.user_ratings_total ?? 0,
      reviewUrl: GOOGLE_REVIEW_URL,
    };
  } catch {
    return fallback;
  }
}
