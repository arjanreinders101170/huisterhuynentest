import { createClient, SupabaseClient } from "@supabase/supabase-js";

let serviceClient: SupabaseClient | null = null;
let anonClient: SupabaseClient | null = null;

/** Service-role client — bypasses RLS. Use only in authenticated/server routes. */
export function getSupabase() {
  if (!serviceClient) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("Supabase not configured");
    serviceClient = createClient(url, key);
  }
  return serviceClient;
}

/** Anon client — respects RLS policies. Use for public-facing reads. */
export function getPublicSupabase() {
  if (!anonClient) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error("SUPABASE_URL en SUPABASE_ANON_KEY zijn verplicht");
    anonClient = createClient(url, key);
  }
  return anonClient;
}
