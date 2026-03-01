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

export async function loginWithGoogle(redirectTo?: string) {
  const supabase = createClient();

  const callbackUrl = new URL("/auth/callback", getSiteUrl());
  if (redirectTo) {
    callbackUrl.searchParams.set("redirect_to", redirectTo);
  }

  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });
}
