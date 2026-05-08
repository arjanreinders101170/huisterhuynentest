import { NextResponse } from "next/server";
import { fetchGoogleReviews } from "@/lib/google-reviews";

export const runtime = "nodejs";

export type { GoogleReview, GoogleReviewsData } from "@/lib/google-reviews";

export async function GET() {
  const data = await fetchGoogleReviews();
  return NextResponse.json(data);
}
