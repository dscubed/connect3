import { createClient } from "@/lib/supabase/client";

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
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent'
      }
    },
  });
}
