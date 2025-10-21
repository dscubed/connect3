import { createClient } from "@/lib/supabase/client";

export async function signUpWithEmail({
  email,
  password,
  firstName,
  lastName,
  accountType,
  anonymousId,
}: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  accountType: "user" | "organisation";
  anonymousId?: string | null;
}) {
  const supabase = createClient();

  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      data: {
        first_name: firstName,
        last_name: lastName,
        name_provided: true,
        account_type: accountType,
        anonymousId,
      },
    },
  });
}

export async function resendVerificationEmail(email: string) {
  const supabase = createClient();

  return supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });
}

export async function signUpWithGoogle() {
  const supabase = createClient();
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });
}
