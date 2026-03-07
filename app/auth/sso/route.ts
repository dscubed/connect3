import { createClient } from "@/lib/supabase/server";
import { isAllowedRedirect } from "@/lib/auth/sso";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const redirectTo = searchParams.get("redirect_to");
  const next = searchParams.get("next");

  if (!redirectTo || !isAllowedRedirect(redirectTo)) {
    return NextResponse.redirect(`${origin}/auth/login`);
  }

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isAuthenticated = session?.user && !session.user.is_anonymous;

  if (!isAuthenticated || !session) {
    const loginUrl = new URL("/auth/login", origin);
    loginUrl.searchParams.set("redirect_to", redirectTo);
    if (next) loginUrl.searchParams.set("next", next);
    return NextResponse.redirect(loginUrl.toString());
  }

  const target = new URL(redirectTo);
  target.searchParams.set("access_token", session.access_token);
  target.searchParams.set("refresh_token", session.refresh_token);
  if (next) target.searchParams.set("next", next);

  const ssoRedirectUrl = new URL("/auth/sso/redirect", origin);
  ssoRedirectUrl.searchParams.set("target", target.toString());

  return NextResponse.redirect(ssoRedirectUrl.toString());
}
