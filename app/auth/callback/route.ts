import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import {
  getUniversityFromEmail,
  validateUniversityEmail,
} from "@/lib/auth/validateUniversityEmail";
import { isAllowedRedirect } from "@/lib/auth/sso";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const redirectTo = searchParams.get("redirect_to");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Validate university email for new sign-ups (created in last 2 min)
        const isNewSignUp =
          user.email &&
          user.created_at &&
          Date.now() - new Date(user.created_at).getTime() < 120_000;
        if (isNewSignUp && user.email) {
          const emailValidation = validateUniversityEmail(user.email);
          if (!emailValidation.valid) {
            await supabase.auth.signOut();
            return NextResponse.redirect(
              `${origin}/auth/sign-up?error=university_email_required`,
            );
          }
        }

        if (user.user_metadata?.anonymousId) {
          try {
            await supabase.rpc("migrate_anonymous_user_data", {
              old_anonymous_id: user.user_metadata.anonymousId,
              new_user_id: user.id,
            });
            await supabase.auth.updateUser({
              data: { anonymousId: null },
            });
          } catch (err) {
            console.error("Failed to migrate anonymous data:", err);
          }
        }

        // Auto-assign university for student sign-ups based on email domain
        const accountType = user.user_metadata?.account_type;
        if (accountType !== "organisation" && user.email) {
          const university = getUniversityFromEmail(user.email);
          if (university) {
            await supabase
              .from("profiles")
              .update({
                university,
                updated_at: new Date().toISOString(),
              })
              .eq("id", user.id);
          }
        }

        if (redirectTo && isAllowedRedirect(redirectTo)) {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session) {
            const target = new URL(redirectTo);
            target.searchParams.set("access_token", session.access_token);
            target.searchParams.set("refresh_token", session.refresh_token);

            const ssoRedirectUrl = new URL("/auth/sso/redirect", origin);
            ssoRedirectUrl.searchParams.set("target", target.toString());
            return NextResponse.redirect(ssoRedirectUrl.toString());
          }
        }

        return NextResponse.redirect(`${origin}${next ?? "/"}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/login`);
}
