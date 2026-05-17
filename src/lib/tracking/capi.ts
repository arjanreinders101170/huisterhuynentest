/* ═══ Server-side Meta Conversions API client ═══
 * Sends events to graph.facebook.com directly. Used from:
 *   • /api/meta/capi route (mirroring browser events)
 *   • /api/mollie/webhook (server-of-record Purchase)
 *
 * Browser + server events sharing the same event_id are deduplicated by Meta.
 */

import {
  hashEmail,
  hashPhone,
  hashName,
  hashCountry,
  hashExternalId,
} from "./hash";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
const TEST_CODE = process.env.META_CAPI_TEST_EVENT_CODE;

export interface CapiUserData {
  em?: string;
  ph?: string;
  fn?: string;
  ln?: string;
  country?: string;
  external_id?: string;
  client_ip_address?: string;
  client_user_agent?: string;
  fbp?: string;
  fbc?: string;
}

export interface CapiEvent {
  event_name: string;
  event_time: number;
  event_id: string;
  event_source_url: string;
  action_source: "website" | "system_generated" | "email";
  user_data: CapiUserData;
  custom_data?: Record<string, unknown>;
}

export interface RawUserInput {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  externalId?: string;
  ip?: string;
  ua?: string;
  fbp?: string;
  fbc?: string;
}

export function buildUser(raw: RawUserInput): CapiUserData {
  const user: CapiUserData = {};
  const em = hashEmail(raw.email);
  if (em) user.em = em;
  const ph = hashPhone(raw.phone);
  if (ph) user.ph = ph;
  const fn = hashName(raw.firstName);
  if (fn) user.fn = fn;
  const ln = hashName(raw.lastName);
  if (ln) user.ln = ln;
  const country = hashCountry(raw.country);
  if (country) user.country = country;
  const external_id = hashExternalId(raw.externalId);
  if (external_id) user.external_id = external_id;
  if (raw.ip) user.client_ip_address = raw.ip;
  if (raw.ua) user.client_user_agent = raw.ua;
  if (raw.fbp) user.fbp = raw.fbp;
  if (raw.fbc) user.fbc = raw.fbc;
  return user;
}

export async function sendCapi(events: CapiEvent[]): Promise<{ ok: boolean; error?: string }> {
  if (!PIXEL_ID || !TOKEN) {
    /* Silent no-op until credentials are configured. Logged for ops visibility. */
    console.log("[CAPI] skipped — META credentials not configured");
    return { ok: false, error: "not-configured" };
  }
  if (events.length === 0) return { ok: true };

  const url = `https://graph.facebook.com/v20.0/${PIXEL_ID}/events?access_token=${TOKEN}`;
  const body: Record<string, unknown> = { data: events };
  if (TEST_CODE) body.test_event_code = TEST_CODE;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error("[CAPI] error", res.status, txt);
      return { ok: false, error: `http_${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("[CAPI] network error", err);
    return { ok: false, error: "network" };
  }
}
