import { LODGE_LAT, LODGE_LON } from "@/data/lodge";

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

/* Place-ID van de Google Business Profile-vermelding. Bevestigd via het
 * itemrapport van de locatie-items in Google Ads (28-08-2026): daar staat
 * dezelfde ID onder "Plaats-ID", dus de reviewlinks in de mails en de
 * locatie-extensie in de advertenties wijzen naar één en dezelfde vermelding. */
const PLACE_ID = process.env.GOOGLE_PLACE_ID ?? "ChIJEZ3h8BUxyEcRqPvq9qnzXyk";
export const GOOGLE_REVIEW_URL = `https://search.google.com/local/writereview?placeid=${PLACE_ID}`;

/* Kaartlink naar de vermelding zelf (niet naar het dorp), voor hasMap in de
 * JSON-LD. Een place_id-URL laat Google de site en de vermelding aan elkaar
 * knopen; een zoek-URL op plaatsnaam doet dat niet. */
export const GOOGLE_MAPS_PLACE_URL = `https://www.google.com/maps/place/?q=place_id:${PLACE_ID}`;

/* Routebeschrijving voor aankomende gasten. Coördinaten én place_id: de
 * coördinaten wijzen de auto naar de oprit, de place_id laat Maps de vermelding
 * herkennen en "Huis ter Huynen" tonen in plaats van een naamloze speld. */
export const GOOGLE_MAPS_DIRECTIONS_URL =
  `https://www.google.com/maps/dir/?api=1&destination=${LODGE_LAT},${LODGE_LON}` +
  `&destination_place_id=${PLACE_ID}&travelmode=driving`;

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
