import { NextResponse } from "next/server";
import { fetchGoogleReviews } from "@/lib/google-reviews";

export const runtime = "nodejs";
export const revalidate = 3600;

export async function GET() {
  const result = await fetchGoogleReviews();
  return NextResponse.json(result);
}
