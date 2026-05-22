// Edge-veilige stay-session helpers (Web Crypto). Gebruikt door middleware
// om /app en /concierge af te schermen voor niet-gasten. De cookie zelf
// wordt gezet door /api/stay zodra een welkomstmail-token (?s=...) wordt
// gevalideerd tegen de stays-tabel.

export const STAY_COOKIE_NAME = "hth-stay-session";

function bytesToHex(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let out = "";
  for (let i = 0; i < arr.length; i++) out += arr[i].toString(16).padStart(2, "0");
  return out;
}

async function hmacSha256Hex(secret: string, data: string): Promise<string> {
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

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function staySecret(): string {
  const s = process.env.STAY_COOKIE_SECRET;
  if (!s || s.length < 16) {
    throw new Error("STAY_COOKIE_SECRET ontbreekt of is te kort (minimaal 16 tekens).");
  }
  return s;
}

export async function buildStayCookie(stayId: string, expiresAtMs: number): Promise<string> {
  const payload = `${stayId}.${expiresAtMs}`;
  const sig = await hmacSha256Hex(staySecret(), payload);
  return `${payload}.${sig}`;
}

export async function parseStayCookie(
  value: string
): Promise<{ stayId: string; expiresAtMs: number } | null> {
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const [stayId, expiresAtStr, sig] = parts;
  const expiresAtMs = Number(expiresAtStr);
  if (!Number.isFinite(expiresAtMs) || expiresAtMs <= Date.now()) return null;
  if (!stayId || !sig) return null;
  let expected: string;
  try {
    expected = await hmacSha256Hex(staySecret(), `${stayId}.${expiresAtMs}`);
  } catch {
    return null;
  }
  if (!timingSafeEqualHex(sig, expected)) return null;
  return { stayId, expiresAtMs };
}
