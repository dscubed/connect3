import { createClient } from "@/lib/supabase/client";
import { getSiteUrl } from "@/lib/site-url";

export async function loginWithEmail({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const supabase = createClient();
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function loginWithGoogle() {
  const supabase = createClient();
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${getSiteUrl()}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });
}
