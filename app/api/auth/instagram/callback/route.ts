import { createClient } from "@/lib/supabase/server";
import { seedAccount } from "@/lib/instagram/auth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const error = requestUrl.searchParams.get("error");
  const errorReason = requestUrl.searchParams.get("error_reason");
  const errorDescription = requestUrl.searchParams.get("error_description");

  if (error) {
    console.error("Instagram OAuth Error:", error, errorReason, errorDescription);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/clubs?error=${error}&description=${errorDescription}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/clubs?error=no_code`
    );
  }

  console.log("WORKS")

  // 1. Verify State
  const cookieStore = await cookies();
  const storedState = cookieStore.get("instagram_auth_state")?.value;
  
  // We can be strict about state verification to prevent CSRF
  if (!storedState || state !== storedState) {
     console.warn("State mismatch or missing in Instagram callback");
     // TODO fail here in production
  }
  // Clear state cookie
  cookieStore.delete("instagram_auth_state");

  // 2. Verify the user is logged in
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/auth/login?next=/clubs`
    );
  }

  try {
    const appId = process.env.INSTAGRAM_APP_ID;
    const appSecret = process.env.INSTAGRAM_APP_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/instagram/callback`;

    // 3. Exchange code for short-lived token (Basic Display API)
    const formData = new FormData();
    formData.append("client_id", appId!);
    formData.append("client_secret", appSecret!);
    formData.append("grant_type", "authorization_code");
    formData.append("redirect_uri", redirectUri);
    formData.append("code", code);

    const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      body: formData,
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      console.error("Failed to get access token:", tokenData);
      throw new Error(`Failed to get access token: ${tokenData.error_message || "Unknown error"}`);
    }

    const shortLivedToken = tokenData.access_token;
    const igUserId = tokenData.user_id; // Basic Display returns user_id here

    // 4. Seed Account (Fetch info, Exchange for Long-Lived, Save to DB)
    await seedAccount(igUserId.toString(), shortLivedToken);

    // 5. Redirect Success
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/clubs?success=instagram_connected`
    );

  } catch (err: any) {
    console.error("Instagram Callback Error:", err);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/clubs?error=server_error&description=${encodeURIComponent(err.message)}`
    );
  }
}   
