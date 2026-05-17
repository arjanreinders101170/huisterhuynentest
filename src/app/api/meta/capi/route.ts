/* ═══ Browser → CAPI mirror route ═══
 * Accepts the same dataLayer event shape the client pushed, enriches it
 * with server-only signals (ip, ua, _fbp, _fbc) and forwards to Meta.
 * Same event_id = Meta deduplicates against the browser Pixel event.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendCapi, buildUser, type CapiEvent } from "@/lib/tracking/capi";

export const runtime = "nodejs";

const SITE_URL = "https://www.huisterhuynen.nl";

const pageSchema = z.object({
  path: z.string().max(2048),
  title: z.string().max(300).optional(),
  locale: z.enum(["nl", "de"]).optional(),
});

const consentSchema = z.object({
  statistics: z.boolean(),
  marketing: z.boolean(),
});

const userSchema = z
  .object({
    em: z.string().email().optional(),
    ph: z.string().max(40).optional(),
    fn: z.string().max(80).optional(),
    ln: z.string().max(80).optional(),
    country: z.enum(["NL", "DE"]).optional(),
    external_id: z.string().max(80).optional(),
  })
  .optional();

const bodySchema = z.object({
  event: z.string().min(1).max(64),
  event_id: z.string().min(8).max(80),
  event_time: z.number().int().positive(),
  page: pageSchema,
  consent_snapshot: consentSchema,
  user: userSchema,
  ecommerce: z.record(z.string(), z.unknown()).optional(),
  booking: z.record(z.string(), z.unknown()).optional(),
  contact: z.record(z.string(), z.unknown()).optional(),
  outbound: z.record(z.string(), z.unknown()).optional(),
  lead: z.record(z.string(), z.unknown()).optional(),
  subscription: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const data = parsed.data;

  /* GDPR/TTDSG: do not forward without marketing consent. */
  if (!data.consent_snapshot.marketing) {
    return NextResponse.json({ ok: true, skipped: "no-consent" });
  }

  const fbp = request.cookies.get("_fbp")?.value;
  const fbc = request.cookies.get("_fbc")?.value;
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || undefined;
  const ua = request.headers.get("user-agent") ?? undefined;

  const custom: Record<string, unknown> = {};
  if (data.ecommerce) Object.assign(custom, data.ecommerce);
  if (data.booking) custom.booking = data.booking;
  if (data.contact) custom.contact = data.contact;
  if (data.outbound) custom.outbound = data.outbound;
  if (data.lead) custom.lead = data.lead;
  if (data.subscription) custom.subscription = data.subscription;

  const event: CapiEvent = {
    event_name: data.event,
    event_time: data.event_time,
    event_id: data.event_id,
    event_source_url: `${SITE_URL}${data.page.path.startsWith("/") ? data.page.path : "/" + data.page.path}`,
    action_source: "website",
    user_data: buildUser({
      email: data.user?.em,
      phone: data.user?.ph,
      firstName: data.user?.fn,
      lastName: data.user?.ln,
      country: data.user?.country,
      externalId: data.user?.external_id,
      ip,
      ua,
      fbp,
      fbc,
    }),
    custom_data: Object.keys(custom).length > 0 ? custom : undefined,
  };

  const result = await sendCapi([event]);
  return NextResponse.json({ ok: result.ok });
}
