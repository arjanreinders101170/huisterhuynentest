import type { kv as KVType } from "@vercel/kv";

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetIn: number; // seconds
};

// ── In-memory fallback ─────────────────────────────────────────────
type Bucket = { count: number; resetAt: number };
const memoryStore = new Map<string, Bucket>();

function checkInMemory(key: string, limit: number, windowSec: number): RateLimitResult {
  const now = Date.now();
  const bucket = memoryStore.get(key);

  if (!bucket || bucket.resetAt <= now) {
    const resetAt = now + windowSec * 1000;
    memoryStore.set(key, { count: 1, resetAt });
    return { ok: true, remaining: Math.max(0, limit - 1), resetIn: windowSec };
  }

  bucket.count += 1;
  const resetIn = Math.max(0, Math.ceil((bucket.resetAt - now) / 1000));

  if (bucket.count > limit) {
    return { ok: false, remaining: 0, resetIn };
  }
  return { ok: true, remaining: Math.max(0, limit - bucket.count), resetIn };
}

// Periodic best-effort cleanup so the in-memory map doesn't leak.
let lastSweep = 0;
function sweepMemoryStore() {
  const now = Date.now();
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [k, v] of memoryStore) {
    if (v.resetAt <= now) memoryStore.delete(k);
  }
}

// ── Vercel KV path ────────────────────────────────────────────────
let kvClient: typeof KVType | null = null;
let kvInitTried = false;

async function getKv(): Promise<typeof KVType | null> {
  if (kvClient) return kvClient;
  if (kvInitTried) return null;
  kvInitTried = true;
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return null;
  }
  try {
    const mod = await import("@vercel/kv");
    kvClient = mod.kv;
    return kvClient;
  } catch (err) {
    console.warn("[rateLimit] @vercel/kv not available, falling back to memory:", err);
    return null;
  }
}

async function checkInKv(
  kv: typeof KVType,
  key: string,
  limit: number,
  windowSec: number,
): Promise<RateLimitResult> {
  // Sliding window via incr + first-time expire.
  const count = await kv.incr(key);
  if (count === 1) {
    await kv.expire(key, windowSec);
  }
  // Best-effort fetch of remaining TTL; KV returns -1 / -2 for missing.
  let resetIn = windowSec;
  try {
    const ttl = await kv.ttl(key);
    if (typeof ttl === "number" && ttl > 0) resetIn = ttl;
  } catch {
    // ignore — windowSec is a safe upper bound
  }
  if (count > limit) {
    return { ok: false, remaining: 0, resetIn };
  }
  return { ok: true, remaining: Math.max(0, limit - count), resetIn };
}

/**
 * Sliding-window rate limiter.
 *
 * Uses Vercel KV when `KV_REST_API_URL` + `KV_REST_API_TOKEN` are set, otherwise
 * falls back to an in-memory map (per-instance). Keys should be namespaced by
 * caller, e.g. `ratelimit:nuki:${ip}`.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSec: number,
): Promise<RateLimitResult> {
  const kv = await getKv();
  if (kv) {
    try {
      return await checkInKv(kv, key, limit, windowSec);
    } catch (err) {
      console.warn("[rateLimit] KV failed, degrading to memory:", err);
      // fall through to memory
    }
  }
  sweepMemoryStore();
  return checkInMemory(key, limit, windowSec);
}
