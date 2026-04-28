import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client for server-only API work.
 * Never import this from client components.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
);
