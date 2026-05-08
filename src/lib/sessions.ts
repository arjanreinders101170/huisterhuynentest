import { randomBytes } from "crypto";
import { getSupabase } from "@/lib/supabase";

const SESSION_TTL_DAYS = 7;

export type AdminSession = {
  id: string;
  expiresAt: Date;
  revokedAt: Date | null;
};

/**
 * Create a new admin session and persist it in `admin_sessions`.
 * Returns the new session id (32-byte hex) plus the absolute expiry.
 */
export async function createSession(
  ip: string,
  ua: string,
): Promise<{ id: string; expiresAt: Date }> {
  const id = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  const { error } = await getSupabase().from("admin_sessions").insert({
    id,
    expires_at: expiresAt.toISOString(),
    ip: ip || null,
    user_agent: ua || null,
  });

  if (error) {
    throw new Error(`createSession failed: ${error.message}`);
  }

  return { id, expiresAt };
}

/**
 * Look up an admin session by id. Returns `null` when:
 *  - the row does not exist
 *  - the session has been revoked
 *  - the session has expired
 */
export async function getSession(id: string): Promise<AdminSession | null> {
  if (!id) return null;

  const { data, error } = await getSupabase()
    .from("admin_sessions")
    .select("id, expires_at, revoked_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  const expiresAt = new Date(data.expires_at as string);
  const revokedAt = data.revoked_at ? new Date(data.revoked_at as string) : null;

  if (revokedAt) return null;
  if (expiresAt.getTime() <= Date.now()) return null;

  return { id: data.id as string, expiresAt, revokedAt };
}

/**
 * Mark a session as revoked. Idempotent: revoking an unknown id is a no-op.
 */
export async function revokeSession(id: string): Promise<void> {
  if (!id) return;
  await getSupabase()
    .from("admin_sessions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id)
    .is("revoked_at", null);
}

/**
 * Hard-delete sessions whose `expires_at` is in the past. Safe to run periodically.
 */
export async function cleanupExpired(): Promise<{ deleted: number }> {
  const now = new Date().toISOString();
  const { count, error } = await getSupabase()
    .from("admin_sessions")
    .delete({ count: "exact" })
    .lt("expires_at", now);

  if (error) return { deleted: 0 };
  return { deleted: count ?? 0 };
}
