/**
 * Smoke test for src/lib/sessions.ts
 *
 * Run:  npx tsx scripts/verify-sessions.ts
 *
 * Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local and the
 * `admin_sessions` table from migrations/2026_05_08_productiehardening.sql.
 */
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local manually — script runs outside Next's env resolution.
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
    // ignore — env may already be set
  }
}

loadEnv(".env.local");

async function main() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("FAIL — SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in .env.local");
    process.exit(1);
  }

  const { createSession, getSession, revokeSession } = await import(
    "../src/lib/sessions"
  );

  const created = await createSession("127.0.0.1", "verify-sessions/1.0");
  if (!created.id || !/^[0-9a-f]{64}$/.test(created.id)) {
    console.error("FAIL — createSession returned invalid id:", created.id);
    process.exit(1);
  }

  const fetched = await getSession(created.id);
  if (!fetched || fetched.id !== created.id) {
    console.error("FAIL — getSession could not find newly created session");
    process.exit(1);
  }

  await revokeSession(created.id);

  const afterRevoke = await getSession(created.id);
  if (afterRevoke !== null) {
    console.error("FAIL — getSession returned non-null after revokeSession");
    process.exit(1);
  }

  console.log("OK — sessions create/get/revoke roundtrip works");
}

main().catch((err) => {
  console.error("FAIL —", err);
  process.exit(1);
});
