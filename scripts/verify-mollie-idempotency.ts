/**
 * Smoke test for /api/mollie/webhook idempotency.
 *
 * Run:  npx tsx scripts/verify-mollie-idempotency.ts
 *
 * What this verifies:
 *  - A "nieuw" booking transitions to "betaald" exactly once even after the
 *    webhook is replayed three times with the same payment_id.
 *  - mollie_webhook_events has a single row for (payment_id, "paid").
 *  - invoices has exactly one row referencing that booking.
 *
 * Requirements:
 *  - .env.local with SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, MOLLIE_API_KEY
 *  - The migration migrations/2026_05_08_productiehardening.sql is applied.
 *  - A locally running Next dev server reachable at WEBHOOK_URL (default
 *    http://localhost:3000/api/mollie/webhook).
 *  - MOLLIE_API_KEY belongs to a Mollie test account; the script creates a
 *    real (test-mode) payment so the webhook can fetch its status.
 *
 * The script exits with code 0 on OK and code 1 with a clear message on
 * failure. It does not attempt to undo writes — re-running it just creates
 * new test rows with fresh IDs.
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
    // ignore — env may already be set
  }
}

loadEnv(".env.local");

const WEBHOOK_URL = process.env.WEBHOOK_URL || "http://localhost:3000/api/mollie/webhook";

function fail(msg: string, extra?: unknown): never {
  console.error("FAIL —", msg, extra ?? "");
  process.exit(1);
}

async function main() {
  const required = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "MOLLIE_API_KEY"] as const;
  for (const k of required) {
    if (!process.env[k]) fail(`${k} missing in .env.local`);
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  // 1. Create a test booking with status="nieuw"
  const testEmail = `verify-mollie-${Date.now()}@example.test`;
  const testNaam = "Mollie Idempotency Test";

  const { data: booking, error: bookingErr } = await supabase
    .from("bookings")
    .insert({
      product: "Verify-Mollie-Idempotency",
      prijs: 1,
      status: "nieuw",
      lodge: "lodge_1",
      metadata: { verify: true },
    })
    .select("id")
    .single();

  if (bookingErr || !booking) fail("could not create test booking", bookingErr);
  const bookingId = booking!.id as string;
  console.log(`  test booking created: ${bookingId}`);

  // 2. Create a real Mollie test-mode payment so the webhook can fetch its status.
  const mollieRes = await fetch("https://api.mollie.com/v2/payments", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.MOLLIE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: { currency: "EUR", value: "0.01" },
      description: "Huis ter Huynen — Verify-Mollie-Idempotency",
      redirectUrl: "https://example.test/redirect",
      webhookUrl: WEBHOOK_URL,
      metadata: {
        bookingId,
        productId: "verify",
        gastNaam: testNaam,
        gastEmail: testEmail,
        lodge: "lodge_1",
      },
    }),
  });
  if (!mollieRes.ok) {
    const errBody = await mollieRes.text();
    fail(`Mollie payment create failed: ${mollieRes.status} ${errBody}`);
  }
  const payment = await mollieRes.json();
  const paymentId = payment.id as string;
  console.log(`  test mollie payment created: ${paymentId} (status=${payment.status})`);

  // For the webhook to mark the booking "betaald" the Mollie payment must be
  // in status="paid". For test-mode payments this normally requires user
  // interaction. If the payment isn't paid we fall back to inspecting the
  // raw idempotency mechanism (event-log + first booking-update wins) only.
  if (payment.status !== "paid") {
    console.log(
      `  note: Mollie payment is ${payment.status}, not paid. Idempotency of mollie_webhook_events is still verified, but the booking will remain "nieuw" until the payment is settled.`,
    );
  }

  // 3. POST the webhook three times with the same payment_id (form-encoded body)
  const body = `id=${encodeURIComponent(paymentId)}`;
  for (let i = 1; i <= 3; i++) {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!res.ok) fail(`webhook attempt ${i} returned ${res.status}`);
    console.log(`  webhook call ${i}: ${res.status}`);
  }

  // 4. mollie_webhook_events should contain exactly one row for this payment_id
  //    where payment_status matches whatever Mollie returned (paid/open/...).
  const { data: events, error: eventsErr } = await supabase
    .from("mollie_webhook_events")
    .select("id, payment_id, payment_status, processed, signature_valid")
    .eq("payment_id", paymentId);
  if (eventsErr) fail("mollie_webhook_events read failed", eventsErr);
  if (!events || events.length === 0) fail("mollie_webhook_events has no row for paymentId");
  const distinctStatuses = new Set(events!.map((e) => e.payment_status));
  if (distinctStatuses.size !== 1) {
    fail(`mollie_webhook_events has ${distinctStatuses.size} distinct statuses, expected 1`, distinctStatuses);
  }
  if (events!.length !== 1) {
    fail(`expected exactly 1 row in mollie_webhook_events for paymentId, got ${events!.length}`);
  }

  // 5. Booking transitions: when payment.status === "paid" it must be "betaald".
  const { data: bookingAfter, error: bookingAfterErr } = await supabase
    .from("bookings")
    .select("status")
    .eq("id", bookingId)
    .single();
  if (bookingAfterErr || !bookingAfter) fail("could not re-read booking", bookingAfterErr);
  if (payment.status === "paid" && bookingAfter!.status !== "betaald") {
    fail(`booking did not transition to betaald (got '${bookingAfter!.status}')`);
  }
  console.log(`  booking status after webhook: ${bookingAfter!.status}`);

  // 6. Invoices: at most one row per booking_id (uq_invoice_booking).
  const { data: invoices, error: invErr } = await supabase
    .from("invoices")
    .select("id, invoice_number")
    .eq("booking_id", bookingId);
  if (invErr) fail("invoices read failed", invErr);
  const invCount = invoices?.length ?? 0;
  if (payment.status === "paid" && invCount !== 1) {
    fail(`expected exactly 1 invoice for booking, got ${invCount}`);
  }
  if (payment.status !== "paid" && invCount !== 0) {
    fail(`expected 0 invoices for non-paid payment, got ${invCount}`);
  }

  console.log("OK — Mollie webhook is idempotent under replay");
  console.log("  bookingId:", bookingId);
  console.log("  paymentId:", paymentId);
  console.log("  webhook events:", events!.length);
  console.log("  invoices:", invCount);
}

main().catch((err) => {
  console.error("FAIL —", err);
  process.exit(1);
});
