// Edge-veilige admin-auth helpers (Web Crypto, geen Node/Supabase imports).
// Gebruikt door middleware.ts. Volle DB-check zit in src/lib/admin-auth.ts.

export const ADMIN_COOKIE_NAME = "hth-admin-session-v2";
export const ADMIN_SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 uur
export const ADMIN_TOKEN_TTL_MS = 15 * 60 * 1000;         // 15 minuten

function bytesToHex(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let out = "";
  for (let i = 0; i < arr.length; i++) out += arr[i].toString(16).padStart(2, "0");
  return out;
}

export async function hmacSha256Hex(secret: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return bytesToHex(sig);
}

export async function sha256Hex(data: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(data));
  return bytesToHex(buf);
}

export function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function randomTokenHex(byteLen = 32): string {
  const bytes = new Uint8Array(byteLen);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

export function allowedAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedAdminEmail(email: string): boolean {
  return allowedAdminEmails().includes(email.trim().toLowerCase());
}

function sessionSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error("ADMIN_SESSION_SECRET ontbreekt of is te kort (minimaal 16 tekens).");
  }
  return s;
}

export async function buildSessionCookie(sessionId: string, expiresAtMs: number): Promise<string> {
  const payload = `${sessionId}.${expiresAtMs}`;
  const sig = await hmacSha256Hex(sessionSecret(), payload);
  return `${payload}.${sig}`;
}

export async function parseSessionCookie(
  value: string
): Promise<{ sessionId: string; expiresAtMs: number } | null> {
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const [sessionId, expiresAtStr, sig] = parts;
  const expiresAtMs = Number(expiresAtStr);
  if (!Number.isFinite(expiresAtMs) || expiresAtMs <= Date.now()) return null;
  if (!sessionId || !sig) return null;
  let expected: string;
  try {
    expected = await hmacSha256Hex(sessionSecret(), `${sessionId}.${expiresAtMs}`);
  } catch {
    return null;
  }
  if (!timingSafeEqualHex(sig, expected)) return null;
  return { sessionId, expiresAtMs };
}
