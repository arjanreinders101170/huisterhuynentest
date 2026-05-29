import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { verifyAdminSession } from "@/lib/admin-auth";

import { handleStaysGet, handleStaysPost } from "./_stays";
import { handleProductsGet, handleProductsPost } from "./_products";
import { handlePricingGet, handlePricingPost } from "./_pricing";
import { handleContentGet, handleContentPost } from "./_content";
import { handleBookingRequestsGet, handleBookingRequestsPost } from "./_booking-requests";
import { handleDiscountCodesGet, handleDiscountCodesPost } from "./_discount-codes";

export const runtime = "nodejs";

// GET — fetch table data
export async function GET(request: NextRequest) {
  if (!(await verifyAdminSession(request))) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const table = request.nextUrl.searchParams.get("table") ?? "";

  try {
    const response =
      (await handleStaysGet(table)) ??
      (await handleProductsGet(table)) ??
      (await handlePricingGet(table, request)) ??
      (await handleContentGet(table)) ??
      (await handleBookingRequestsGet(table)) ??
      (await handleDiscountCodesGet(table)) ??
      (await handleMiscGet(table));

    return response ?? NextResponse.json({ error: "Onbekende tabel" }, { status: 400 });
  } catch (err) {
    console.error("Admin data error:", err);
    return NextResponse.json({ error: "Kon data niet laden" }, { status: 500 });
  }
}

async function handleMiscGet(table: string): Promise<NextResponse | null> {
  switch (table) {
    case "bookings": {
      const { data } = await getSupabase()
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      return NextResponse.json({ data: data || [] });
    }
    case "guests": {
      const { data } = await getSupabase()
        .from("guests")
        .select("*")
        .order("laatste_bezoek", { ascending: false })
        .limit(50);
      return NextResponse.json({ data: data || [] });
    }
    case "reviews": {
      const { data } = await getSupabase()
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      return NextResponse.json({ data: data || [] });
    }
    case "invoices": {
      const { data } = await getSupabase()
        .from("invoices")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      return NextResponse.json({ data: data || [] });
    }
    default:
      return null;
  }
}

// POST — admin actions
export async function POST(request: NextRequest) {
  if (!(await verifyAdminSession(request))) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action } = body;

    const response =
      (await handleStaysPost(action, body, request)) ??
      (await handleProductsPost(action, body, request)) ??
      (await handlePricingPost(action, body, request)) ??
      (await handleContentPost(action, body, request)) ??
      (await handleBookingRequestsPost(action, body, request)) ??
      (await handleDiscountCodesPost(action, body, request)) ??
      (await handleMiscPost(action, body));

    return response ?? NextResponse.json({ error: "Onbekende actie" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Actie mislukt" }, { status: 500 });
  }
}

async function handleMiscPost(action: string, body: Record<string, unknown>): Promise<NextResponse | null> {
  if (action !== "toggle_review") return null;
  await getSupabase()
    .from("reviews")
    .update({ zichtbaar: body.visible })
    .eq("id", body.id);
  return NextResponse.json({ success: true });
}
