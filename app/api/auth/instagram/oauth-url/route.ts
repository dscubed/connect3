import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const appId = process.env.INSTAGRAM_APP_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/instagram/callback`;
  
  // Scopes required for Instagram Basic Display API
  // instagram_basic: to read basic profile info and media
  // instagram_graph_user_profile: to read user profile
  const scope = [
    "instagram_basic",
    // "instagram_graph_user_profile"
  ].join(",");

  // State parameter to prevent CSRF
  // const state = Math.random().toString(36).substring(7);
  
  // Store state in cookie for verification in callback
  // const cookieStore = await cookies();
  // cookieStore.set("instagram_auth_state", state, { 
  //   httpOnly: true, 
  //   secure: process.env.NODE_ENV === "production",
  //   maxAge: 60 * 5 // 5 minutes
  // });

  // Instagram Basic Display API Authorization URL
  // const url = `https://api.instagram.com/oauth/authorize?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}&response_type=code`;
  const url = `https://api.instagram.com/oauth/authorize?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
  console.log(url);

  return NextResponse.json({ url });
}
