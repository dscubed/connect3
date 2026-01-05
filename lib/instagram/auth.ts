import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin Client (Service Role)
// We use the service role key to bypass RLS when managing system-wide instagram accounts
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET!;

export const getInstagramApiUrl = (endpoint: string) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `https://graph.instagram.com/v24.0/${cleanEndpoint}`;
};

export async function exchangeForLongLivedToken(shortLivedToken: string) {
  const params = new URLSearchParams({
    grant_type: 'ig_exchange_token',
    client_secret: INSTAGRAM_APP_SECRET,
    access_token: shortLivedToken,
  });

  const response = await fetch(`https://graph.instagram.com/access_token?${params.toString()}`);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to exchange token: ${errorText}`);
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    expires_in: data.expires_in, // Seconds
  };
}

export async function refreshLongLivedToken(accessToken: string) {
    const params = new URLSearchParams({
    grant_type: 'ig_refresh_token',
    access_token: accessToken,
  });

  const response = await fetch(`https://graph.instagram.com/refresh_access_token?${params.toString()}`);
   if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to refresh token: ${errorText}`);
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    expires_in: data.expires_in,
  };
}

export async function seedAccount(igUserId: string, shortLivedToken: string, profileId: string) {
    console.log(`Seeding account for User ID: ${igUserId}`);

    // 1. Exchange for Long-Lived Token first
    console.log('Exchanging short-lived token for long-lived token...');
    const longLivedData = await exchangeForLongLivedToken(shortLivedToken);
    const longLivedToken = longLivedData.access_token;
    const expiresIn = longLivedData.expires_in; // seconds
    
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    console.log(`Token exchanged. Expires in ${expiresIn} seconds (at ${expiresAt.toISOString()})`);

    // 2. Fetch Account Name using long-lived token 
    console.log('Fetching account name from Instagram...');
    const userUrl = getInstagramApiUrl(`${igUserId}?fields=username,account_type&access_token=${longLivedToken}`);
    const userResponse = await fetch(userUrl);

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error(`Failed to fetch user info: ${errorText}`);
      throw new Error(`Failed to fetch user info: ${errorText}`);
    }

    const userData = await userResponse.json();
    const accountName = userData.username || "Unknown";
    console.log(`Fetched account name: ${accountName}`);

    
    // 3. Upsert into Database
    const { error } = await supabaseAdmin
        .from('instagram_accounts')
        .upsert({
            ig_user_id: igUserId,
            account_name: accountName,
            access_token: longLivedToken,
            token_expires_at: expiresAt.toISOString(),
            priority: 2,
            updated_at: new Date().toISOString(),
            profile_id: profileId,
            is_connected: true,
        }, { onConflict: 'ig_user_id' });

    if (error) {
        console.error(`Database error: ${error.message}`);
        throw new Error(`Database error: ${error.message}`);
    }

    console.log(`Account ${accountName} (${igUserId}) seeded successfully.`);
    return { success: true, accountName };
}
