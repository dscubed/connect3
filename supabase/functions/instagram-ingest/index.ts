// Setup type definitions for built-in Supabase Runtime APIs
import { createClient } from 'jsr:@supabase/supabase-js@2'

const MAX_REQUESTS_ALLOWED = 75;
const INSTAGRAM_API_BASE = "https://graph.instagram.com";

interface InstagramAccount {
  id: number;
  account_name: string;
  ig_user_id: string;
  access_token: string;
  token_expires_at: string;
  last_synced_at: string | null;
  priority: number;
  profile_id: string | null;
  created_at: string;
  updated_at: string;
}

interface InstagramPost {
  id: string;
  caption?: string;
  media_type: string;
  media_url?: string;
  permalink?: string;
  timestamp: string;
}

interface RequestContext {
  totalRequests: number;
}

Deno.serve(async (req) => {
  // 1. Authorization Check
  const authHeader = req.headers.get('Authorization');
  const cronSecret = Deno.env.get('CRON_SECRET');
  
  if (authHeader !== `Bearer ${cronSecret}`) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 2. Initialize Supabase Client
  const supabaseUrl = Deno.env.get('NEXT_PUBLIC_SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseKey) {
    return new Response(
      JSON.stringify({ error: 'Missing Supabase configuration' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const ctx: RequestContext = { totalRequests: 0 };

  try {
    console.log(`Starting batch run at ${new Date().toISOString()}`);

    // 3. Fetch Accounts
    const { data: accounts, error } = await supabase
      .from("instagram_accounts")
      .select("*")
      .order("priority", { ascending: false })
      .order("last_synced_at", { ascending: true, nullsFirst: true });

    if (error) throw error;

    if (!accounts || accounts.length === 0) {
      return new Response(
        JSON.stringify({ message: "No accounts found" }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${accounts.length} accounts to process.`);

    const results = [];

    // 4. Process Accounts
    for (const account of accounts) {
      if (ctx.totalRequests >= MAX_REQUESTS_ALLOWED) {
        console.log("Max requests allowed reached for this batch. Stopping.");
        break;
      }

      try {
        // Refresh Token
        await refreshAccessToken(supabase, account, ctx);

        if (ctx.totalRequests >= MAX_REQUESTS_ALLOWED) break;

        // Fetch Posts
        const postsCount = await fetchNewPosts(supabase, account, ctx);
        
        results.push({
          account: account.account_name,
          status: 'success',
          posts_fetched: postsCount
        });

        // Rate limiting pause
        await new Promise((resolve) => setTimeout(resolve, 2000));

      } catch (e: any) {
        console.error(`Error processing account ${account.account_name}: ${e}`);
        results.push({
          account: account.account_name,
          status: 'error',
          error: e.message
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        requests: ctx.totalRequests,
        results
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error("Batch run failed:", error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

// --- Helper Functions ---

async function refreshAccessToken(
  supabase: any,
  account: InstagramAccount,
  ctx: RequestContext
): Promise<boolean> {
  const { access_token, token_expires_at, account_name, id } = account;

  const expiresAt = new Date(token_expires_at);
  const now = new Date();
  const timeRemaining = expiresAt.getTime() - now.getTime();
  const maxLifetime = 60 * 24 * 60 * 60 * 1000; // ~60 days

  // Refresh if less than 10% of lifetime remains
  if (timeRemaining < maxLifetime * 0.1) {
    console.log(`Refreshing token for account ${account_name}...`);

    if (ctx.totalRequests >= MAX_REQUESTS_ALLOWED) return false;

    try {
      const url = new URL(`${INSTAGRAM_API_BASE}/refresh_access_token`);
      url.searchParams.append("grant_type", "ig_refresh_token");
      url.searchParams.append("access_token", access_token);

      const response = await fetch(url.toString());
      ctx.totalRequests++;

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to refresh token: ${errorText}`);
        return false;
      }

      const data = await response.json();
      const newAccessToken = data.access_token;
      const expiresInSeconds = data.expires_in || 5184000;
      const newExpiresAt = new Date(now.getTime() + expiresInSeconds * 1000);

      const { error } = await supabase
        .from("instagram_accounts")
        .update({
          access_token: newAccessToken,
          token_expires_at: newExpiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        console.error(`Error updating token in DB: ${error.message}`);
        return false;
      }

      account.access_token = newAccessToken;
      return true;
    } catch (error) {
      console.error(`Error refreshing token: ${error}`);
      return false;
    }
  }
  return true;
}

async function fetchNewPosts(
  supabase: any,
  account: InstagramAccount,
  ctx: RequestContext
): Promise<number> {
  const { ig_user_id, access_token, last_synced_at, account_name } = account;
  const lastSyncedDate = last_synced_at ? new Date(last_synced_at) : null;

  console.log(`Fetching posts for ${account_name}...`);

  // Limit of 50 posts per request

  let url: string | null = `${INSTAGRAM_API_BASE}/v24.0/${ig_user_id}/media?fields=id,caption,media_type,media_url,permalink,timestamp&limit=50&access_token=${access_token}`;
  let postsInserted = 0;
  let newestPostTimestamp: Date | null = null;

  while (url) {
    if (ctx.totalRequests >= MAX_REQUESTS_ALLOWED) break;

    try {
      const response: Response = await fetch(url);
      ctx.totalRequests++;

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error fetching posts: ${errorText}`);
        break;
      }

      const data: any = await response.json();
      const posts: InstagramPost[] = data.data || [];

      if (posts.length === 0) break;

      for (const post of posts) {
        const postTimestamp = new Date(post.timestamp);

        if (!newestPostTimestamp || postTimestamp > newestPostTimestamp) {
          newestPostTimestamp = postTimestamp;
        }

        if (lastSyncedDate && postTimestamp <= lastSyncedDate) {
          url = null;
          break;
        }

        const postRecord = {
          media_id: post.id,
          ig_user_id: ig_user_id,
          caption: post.caption,
          media_url: post.media_url || post.permalink,
          timestamp: post.timestamp,
          created_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from("instagram_posts")
          .upsert(postRecord, {
            onConflict: "media_id",
            ignoreDuplicates: true,
          });

        if (error) {
          console.error(`Error inserting post ${post.id}: ${error.message}`);
        } else {
          postsInserted++;
        }
      }

      if (url) {
        url = data.paging?.next || null;
      }
    } catch (error) {
      console.error(`Exception during fetch: ${error}`);
      break;
    }
  }

  // Update last_synced_at if we found new posts
  if (newestPostTimestamp) {
    await supabase
      .from("instagram_accounts")
      .update({ last_synced_at: newestPostTimestamp.toISOString() })
      .eq("id", account.id);
  }

  return postsInserted;
}
