import { getSupabase } from "@/lib/supabase";

export type AuditResourceType =
  | "product"
  | "stay"
  | "review"
  | "booking"
  | "aanvraag"
  | "session";

export type AuditLogOptions = {
  sessionId: string | null;
  action: string;
  resourceType: AuditResourceType;
  resourceId?: string | null;
  payload?: Record<string, unknown> | null;
  req: Request;
};

function readIp(req: Request): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get("x-real-ip");
  return real ? real.trim() : null;
}

/**
 * Append a row to `audit_log`. NEVER throws — audit must not block user flow.
 * Failures are logged to stderr for ops visibility.
 */
export async function auditLog(opts: AuditLogOptions): Promise<void> {
  try {
    const ip = readIp(opts.req);
    const ua = opts.req.headers.get("user-agent");

    const { error } = await getSupabase().from("audit_log").insert({
      actor_session_id: opts.sessionId,
      action: opts.action,
      resource_type: opts.resourceType,
      resource_id: opts.resourceId ?? null,
      payload: opts.payload ?? null,
      ip,
      user_agent: ua,
    });

    if (error) {
      console.error("[audit] insert failed:", error.message);
    }
  } catch (err) {
    console.error("[audit] unexpected error:", err);
  }
}
