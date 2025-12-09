import { NextResponse } from "next/server";

export async function GET() {
  const appId = process.env.INSTAGRAM_APP_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/instagram/callback`;
  
  // Scopes required for Instagram Business API
  // instagram_basic: to read basic profile info
  // instagram_manage_insights: to read insights (optional but good for future)
  // pages_show_list: to list pages the user manages (needed to find the linked IG account)
  // pages_read_engagement: to read content posted to the page
  // business_management: often required for token access
  const scope = [
    "instagram_basic",
    "pages_show_list",
    "pages_read_engagement",
    "business_management" // Sometimes needed, check if strictly required
  ].join(",");

  // State parameter to prevent CSRF (optional but recommended)
  // For simplicity in this MVP, we might skip complex state validation or use a simple random string
  const state = Math.random().toString(36).substring(7);

  const url = `https://www.facebook.com/v24.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}&response_type=code`;

  return NextResponse.json({ url });
}
