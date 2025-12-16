import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const appId = process.env.INSTAGRAM_APP_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/instagram/callback`;
  
  // Scopes required for Instagram Graph API (Business)
  const scope = [
    "instagram_business_basic",
    "instagram_business_manage_messages",
    "instagram_business_manage_comments",
    "instagram_business_content_publish",
    "instagram_business_manage_insights",
  ].join(",");

  // State parameter to prevent CSRF
  const state = Math.random().toString(36).substring(7);
  
  // Store state in cookie for verification in callback
  const cookieStore = await cookies();
  cookieStore.set("instagram_auth_state", state, { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 5 // 5 minutes
  });

  // Instagram Basic Display API Authorization URL
  const url = `https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}`;
  // https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=841859971895550&redirect_uri=https://brooks-interepidemic-luciana.ngrok-free.dev/&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights
  console.log(url);

  return NextResponse.json({ url });
}
