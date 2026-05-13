// Node-zijde admin-auth helpers: Supabase-backed sessie- en magic-link-flow.
// Voor Edge-runtime imports (middleware): zie src/lib/admin-auth-edge.ts.

import type { NextRequest } from "next/server";
import { getSupabase } from "@/lib/supabase";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_TTL_MS,
  ADMIN_TOKEN_TTL_MS,
  buildSessionCookie,
  parseSessionCookie,
  randomTokenHex,
  sha256Hex,
} from "@/lib/admin-auth-edge";

export { ADMIN_COOKIE_NAME, ADMIN_SESSION_TTL_MS, ADMIN_TOKEN_TTL_MS } from "@/lib/admin-auth-edge";

export type AdminSession = { sessionId: string; email: string };

/** Verifieer cookie HMAC + check sessie tegen DB (revocatie, expiry). */
export async function verifyAdminSession(request: NextRequest): Promise<AdminSession | null> {
  const cookie = request.cookies.get(ADMIN_COOKIE_NAME);
  if (!cookie) return null;
  const parsed = await parseSessionCookie(cookie.value);
  if (!parsed) return null;

  const { data } = await getSupabase()
    .from("admin_sessions")
    .select("session_id, email, expires_at, revoked_at")
    .eq("session_id", parsed.sessionId)
    .maybeSingle();

  if (!data) return null;
  if (data.revoked_at) return null;
  if (new Date(data.expires_at as string).getTime() <= Date.now()) return null;

  return { sessionId: parsed.sessionId, email: data.email as string };
}

/** Maak een nieuwe magic-link token aan en sla de hash op. Retourneert de plain token. */
export async function issueMagicToken(
  email: string,
  meta: { ip?: string; userAgent?: string } = {}
): Promise<{ token: string; expiresAt: Date }> {
  const token = randomTokenHex(32);
  const tokenHash = await sha256Hex(token);
  const expiresAt = new Date(Date.now() + ADMIN_TOKEN_TTL_MS);

  const { error } = await getSupabase().from("admin_magic_tokens").insert({
    token_hash: tokenHash,
    email: email.trim().toLowerCase(),
    expires_at: expiresAt.toISOString(),
    ip: meta.ip || null,
    user_agent: meta.userAgent || null,
  });
  if (error) throw new Error(`Token opslaan mislukt: ${error.message}`);

  return { token, expiresAt };
}

/** Consumeer een magic-link token: één keer bruikbaar, niet verlopen. */
export async function consumeMagicToken(token: string): Promise<{ email: string } | null> {
  const tokenHash = await sha256Hex(token);
  const now = new Date().toISOString();

  // Atomic claim: zet used_at, alleen als nog niet gebruikt en niet verlopen.
  const { data, error } = await getSupabase()
    .from("admin_magic_tokens")
    .update({ used_at: now })
    .eq("token_hash", tokenHash)
    .is("used_at", null)
    .gt("expires_at", now)
    .select("email")
    .maybeSingle();

  if (error || !data) return null;
  return { email: data.email as string };
}

/** Maak een nieuwe admin-sessie en retourneer de cookie-waarde. */
export async function createAdminSession(
  email: string,
  meta: { ip?: string; userAgent?: string } = {}
): Promise<{ cookieValue: string; expiresAt: Date }> {
  const sessionId = randomTokenHex(32);
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_TTL_MS);

  const { error } = await getSupabase().from("admin_sessions").insert({
    session_id: sessionId,
    email: email.trim().toLowerCase(),
    expires_at: expiresAt.toISOString(),
    ip: meta.ip || null,
    user_agent: meta.userAgent || null,
  });
  if (error) throw new Error(`Sessie aanmaken mislukt: ${error.message}`);

  const cookieValue = await buildSessionCookie(sessionId, expiresAt.getTime());
  return { cookieValue, expiresAt };
}

/** Markeer een sessie als ingetrokken. */
export async function revokeAdminSession(sessionId: string): Promise<void> {
  await getSupabase()
    .from("admin_sessions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("session_id", sessionId)
    .is("revoked_at", null);
}
