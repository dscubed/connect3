import { createClient } from "@/lib/supabase/client";
import { getSiteUrl } from "@/lib/site-url";
import {
  getUniversityFromEmail,
  validateUniversityEmail,
} from "@/lib/auth/validateUniversityEmail";

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
  // Only validate university email for user accounts, not organisations
  if (accountType === "user") {
    const emailValidation = validateUniversityEmail(email);
    if (!emailValidation.valid) {
      return {
        data: { user: null, session: null },
        error: {
          message: emailValidation.error ?? "Invalid email",
          name: "ValidationError",
          status: 400,
        },
      };
    }
  }

  const supabase = createClient();
  const siteUrl = getSiteUrl();

  const university =
    accountType === "user" ? getUniversityFromEmail(email) : null;

  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
      data: {
        first_name: firstName,
        last_name: lastName,
        name_provided: true,
        account_type: accountType,
        anonymousId,
        origin: siteUrl,
        ...(university && { university }),
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
      emailRedirectTo: `${getSiteUrl()}/auth/callback`,
    },
  });
}

export async function signUpWithGoogle() {
  const supabase = createClient();
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${getSiteUrl()}/auth/callback`,
    },
  });
}
