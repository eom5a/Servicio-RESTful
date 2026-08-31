import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client: bypasses RLS entirely. Import this ONLY from
// server-only code that must write data on behalf of the system rather
// than the signed-in user — currently just the Stripe webhook handler,
// which needs to write `subscriptions` rows for a user who isn't the one
// making the request (Stripe is).
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
