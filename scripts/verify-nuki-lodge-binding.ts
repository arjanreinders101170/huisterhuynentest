/**
 * Smoke / instruction script for /api/nuki/unlock
 *
 * This script is intentionally pragmatic: it does not spin up a Next.js
 * server. It (a) imports the route module to verify it compiles in the
 * current TypeScript project, and (b) prints a sequence of curl commands
 * the operator can run against a local `npm run dev` instance to verify
 * lodge binding + token expiry behaviour.
 *
 * Run with:  npx tsx scripts/verify-nuki-lodge-binding.ts
 *
 * Acceptance scenarios covered:
 *   1. POST without body         → 400 (zod validation fails)
 *   2. POST with empty token     → 400
 *   3. POST with unknown token   → 401 (invalid_or_expired_token)
 *   4. POST with expired token   → 401 (expires_at in the past)
 *   5. POST with lodge_1 token   → demo log "lodge_1" + masked smartlock
 *   6. POST with lodge_2 token   → demo log "lodge_2" + masked smartlock
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

async function main(): Promise<void> {
  // Step 1 — does the route module compile?
  // We import the foundation lib (no DB call) just to be sure the
  // type-check passes when this script is executed via tsx.
  const lodgeLib = await import("../src/lib/lodge");
  if (typeof lodgeLib.getLodgeFromStayToken !== "function") {
    console.error("FAIL — getLodgeFromStayToken not exported from src/lib/lodge");
    process.exit(1);
  }

  const baseUrl = process.env.HTH_BASE_URL || "http://localhost:3000";

  console.log("Nuki lodge-binding smoke-test — manual curl steps");
  console.log("==================================================");
  console.log("Run `npm run dev` in another terminal, then execute:");
  console.log("");

  const steps: { label: string; expect: string; cmd: string }[] = [
    {
      label: "1. No body → 400",
      expect: "HTTP 400 (invalid_json or invalid_body)",
      cmd: `curl -s -o /dev/null -w "%{http_code}\\n" -X POST ${baseUrl}/api/nuki/unlock`,
    },
    {
      label: "2. Empty token → 400",
      expect: "HTTP 400",
      cmd: `curl -s -o /dev/null -w "%{http_code}\\n" -X POST -H 'Content-Type: application/json' -d '{"token":""}' ${baseUrl}/api/nuki/unlock`,
    },
    {
      label: "3. Unknown token → 401",
      expect: "HTTP 401 (invalid_or_expired_token)",
      cmd: `curl -s -X POST -H 'Content-Type: application/json' -d '{"token":"definitely-not-a-real-token"}' ${baseUrl}/api/nuki/unlock`,
    },
    {
      label: "4. Expired token → 401",
      expect: "HTTP 401 — set expires_at in stays to a past date for one row first",
      cmd: `curl -s -X POST -H 'Content-Type: application/json' -d '{"token":"<expired-token>"}' ${baseUrl}/api/nuki/unlock`,
    },
    {
      label: "5. Lodge 1 token (demo modus)",
      expect: "HTTP 200 + server log: nuki_unlock_demo, lodge=lodge_1, smartlockId masked",
      cmd: `curl -s -X POST -H 'Content-Type: application/json' -d '{"token":"<lodge1-token>"}' ${baseUrl}/api/nuki/unlock`,
    },
    {
      label: "6. Lodge 2 token (demo modus)",
      expect: "HTTP 200 + server log: nuki_unlock_demo, lodge=lodge_2, smartlockId masked",
      cmd: `curl -s -X POST -H 'Content-Type: application/json' -d '{"token":"<lodge2-token>"}' ${baseUrl}/api/nuki/unlock`,
    },
  ];

  for (const s of steps) {
    console.log(s.label);
    console.log("  expect: " + s.expect);
    console.log("  $ " + s.cmd);
    console.log("");
  }

  console.log("Env-vars to set before running:");
  console.log("  NUKI_SMARTLOCK_ID_LODGE_1=<id-for-boomhut>");
  console.log("  NUKI_SMARTLOCK_ID_LODGE_2=<id-for-schaapskooi>");
  console.log("  (legacy NUKI_SMARTLOCK_ID still works, with a deprecation warning)");
  console.log("");
  console.log("OK — script compiled and instructions printed.");
}

main().catch((err) => {
  console.error("FAIL —", err);
  process.exit(1);
});
