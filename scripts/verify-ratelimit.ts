/**
 * Smoke test for src/lib/rateLimit.ts
 *
 * Run:  npx tsx scripts/verify-ratelimit.ts
 *
 * Calls checkRateLimit("test", 3, 60) four times. The first three must
 * return ok=true; the fourth must return ok=false.
 */
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv(file: string): void {
  try {
    const txt = readFileSync(resolve(process.cwd(), file), "utf8");
    for (const line of txt.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      if (!(key in process.env)) process.env[key] = val;
    }
  } catch {
    // ignore
  }
}

loadEnv(".env.local");

async function main() {
  const { checkRateLimit } = await import("../src/lib/rateLimit");

  // Use a unique key per run so KV-backed dev environments don't collide.
  const key = `verify-ratelimit:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;

  const r1 = await checkRateLimit(key, 3, 60);
  const r2 = await checkRateLimit(key, 3, 60);
  const r3 = await checkRateLimit(key, 3, 60);
  const r4 = await checkRateLimit(key, 3, 60);

  if (!r1.ok || !r2.ok || !r3.ok) {
    console.error("FAIL — first three calls should all be ok=true:", { r1, r2, r3 });
    process.exit(1);
  }
  if (r4.ok) {
    console.error("FAIL — fourth call should be ok=false but was:", r4);
    process.exit(1);
  }

  console.log("OK — rate limit blocks after limit reached", { r1, r2, r3, r4 });
}

main().catch((err) => {
  console.error("FAIL —", err);
  process.exit(1);
});
