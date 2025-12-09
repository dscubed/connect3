import { createClient } from "@/lib/supabase/server";
import { supabase as adminSupabase } from "@/lib/instagram/ingest";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
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

  // 1. Verify the user is logged in
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

    // 2. Exchange code for short-lived token
    const tokenUrl = `https://graph.facebook.com/v24.0/oauth/access_token?client_id=${appId}&redirect_uri=${redirectUri}&client_secret=${appSecret}&code=${code}`;

    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      console.error("Failed to get access token:", tokenData);
      throw new Error("Failed to get access token from Facebook");
    }

    const shortLivedToken = tokenData.access_token;

    // 3. Exchange for long-lived token
    const longLivedUrl = `https://graph.facebook.com/v24.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`;

    const longLivedRes = await fetch(longLivedUrl);
    const longLivedData = await longLivedRes.json();
    const longLivedToken = longLivedData.access_token || shortLivedToken;
    const expiresIn = longLivedData.expires_in || 5184000; // Default to 60 days

    // 4. Get User's Pages and linked Instagram Accounts
    // We need to find which Page has an Instagram Business Account connected
    const pagesUrl = `https://graph.facebook.com/v24.0/me/accounts?fields=name,instagram_business_account{id,name,username}&access_token=${longLivedToken}`;
    const pagesRes = await fetch(pagesUrl);
    const pagesData = await pagesRes.json();

    if (!pagesData.data || pagesData.data.length === 0) {
      throw new Error("No Facebook Pages found for this user.");
    }

    // Find the first page with an IG business account
    const pageWithIg = pagesData.data.find(
      (p: any) => p.instagram_business_account
    );

    if (!pageWithIg) {
      throw new Error(
        "No Instagram Business Account found linked to your Facebook Pages. Please ensure your Instagram account is a Business account and is linked to a Facebook Page."
      );
    }

    const igAccount = pageWithIg.instagram_business_account;
    const igUserId = igAccount.id;
    const igUsername = igAccount.username || igAccount.name;

    // 5. Save to Supabase using Admin Client (bypassing RLS)
    const { error: dbError } = await adminSupabase
      .from("instagram_accounts")
      .upsert(
        {
          ig_user_id: igUserId,
          account_name: igUsername,
          access_token: longLivedToken,
          token_expires_at: new Date(
            Date.now() + expiresIn * 1000
          ).toISOString(),
          profile_id: user.id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "ig_user_id" }
      );

    if (dbError) {
      console.error("DB Error:", dbError);
      throw new Error("Failed to save account to database.");
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/clubs?success=instagram_linked`
    );
  } catch (err: any) {
    console.error("Instagram Linking Error:", err);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/clubs?error=linking_failed&message=${encodeURIComponent(
        err.message
      )}`
    );
  }
}
