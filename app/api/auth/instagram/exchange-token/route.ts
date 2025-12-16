import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/instagram/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: "Missing access token" },
        { status: 400 }
      );
    }

    // 1. Verify the user is logged in
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const appId = process.env.INSTAGRAM_APP_ID;
    const appSecret = process.env.INSTAGRAM_APP_SECRET;

    // 2. Exchange for long-lived token
    const longLivedUrl = `https://graph.facebook.com/v24.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${accessToken}`;

    const longLivedRes = await fetch(longLivedUrl);
    const longLivedData = await longLivedRes.json();

    if (longLivedData.error) {
      console.error("Error exchanging token:", longLivedData.error);
      throw new Error(longLivedData.error.message);
    }

    const longLivedToken = longLivedData.access_token || accessToken;
    const expiresIn = longLivedData.expires_in || 5184000; // Default to 60 days

    // 3. Get User's Pages and linked Instagram Accounts
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

    // 4. Save to Supabase using Admin Client (bypassing RLS)
    const { error: dbError } = await supabaseAdmin
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

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Instagram Linking Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to link Instagram account" },
      { status: 500 }
    );
  }
}
