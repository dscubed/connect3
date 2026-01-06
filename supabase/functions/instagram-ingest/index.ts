// Setup type definitions for built-in Supabase Runtime APIs
import { createClient } from 'jsr:@supabase/supabase-js@2'

const MAX_REQUESTS_ALLOWED = 25;
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
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
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
    console.log({ event: 'batch_start', timestamp: new Date().toISOString() });

    // 3. Fetch Accounts
    const { data: accounts, error } = await supabase
      .from("instagram_accounts")
      .select("*")
      .eq("is_connected", true)
      .order("priority", { ascending: false })
      .order("last_synced_at", { ascending: true, nullsFirst: true });

    if (error) throw error;

    if (!accounts || accounts.length === 0) {
      return new Response(
        JSON.stringify({ message: "No accounts found" }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log({ event: 'accounts_found', count: accounts.length });

    const results = [];

    // 4. Process Accounts
    for (const account of accounts) {
      console.log({ event: 'processing_account', account: account.account_name });
      if (ctx.totalRequests >= MAX_REQUESTS_ALLOWED) {
        console.log({ event: 'max_requests_reached', total_requests: ctx.totalRequests });
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

        console.log({ event: 'account_success', account: account.account_name, posts_fetched: postsCount });

        // Rate limiting pause
        await new Promise((resolve) => setTimeout(resolve, 2000));

      } catch (e: any) {
        console.error({ event: 'account_error', account: account.account_name, error: e.message });
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
    console.error({ event: 'batch_error', error: String(error) });
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
    console.log({ event: 'refreshing_token', account: account_name });

    if (ctx.totalRequests >= MAX_REQUESTS_ALLOWED) return false;

    try {
      const url = new URL(`${INSTAGRAM_API_BASE}/refresh_access_token`);
      url.searchParams.append("grant_type", "ig_refresh_token");
      url.searchParams.append("access_token", access_token);

      const response = await fetch(url.toString());
      ctx.totalRequests++;

      if (!response.ok) {
        const errorText = await response.text();
        console.error({ event: 'token_refresh_failed', account: account_name, error: errorText });
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
        console.error({ event: 'token_update_error', account: account_name, error: error.message });
        return false;
      }

      account.access_token = newAccessToken;
      return true;
    } catch (error) {
      console.error({ event: 'token_refresh_exception', account: account_name, error: error });
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

  console.log({ event: 'fetching_posts', account: account_name });

  const fields = ["id", "caption", "media_type", "media_url", "permalink", "timestamp"].join(",");
  const urlObj = new URL(`${INSTAGRAM_API_BASE}/v24.0/${ig_user_id}/media`);
  urlObj.searchParams.append("fields", fields);
  urlObj.searchParams.append("limit", "50");
  urlObj.searchParams.append("access_token", access_token);

  let url: string | null = urlObj.toString();
  let postsInserted = 0;
  let newestPostTimestamp: Date | null = null;

  // Only fetch one page (max depth of 1) to prevent timeouts
  if (url) {
    if (ctx.totalRequests >= MAX_REQUESTS_ALLOWED) return postsInserted;

    try {
      const response: Response = await fetch(url);
      ctx.totalRequests++;

      if (!response.ok) {
        const errorText = await response.text();
        console.error({ event: 'fetch_posts_error', account: account_name, error: errorText });
        return postsInserted;
      }

      const data: any = await response.json();
      const posts: InstagramPost[] = data.data || [];

      if (posts.length === 0) return postsInserted;

      for (const post of posts) {
        const postTimestamp = new Date(post.timestamp);

        if (!newestPostTimestamp || postTimestamp > newestPostTimestamp) {
          newestPostTimestamp = postTimestamp;
        }

        // Check for overlap
        if (lastSyncedDate && postTimestamp <= lastSyncedDate) {
          break; // Stop processing this batch at the overlap point
        }

        // Process the post (upload, insert, etc.)
        let finalMediaUrl = await uploadIntoStorage(supabase, post, ig_user_id, account_name);

        const postRecord = {
          media_id: post.id,
          ig_user_id: ig_user_id,
          caption: post.caption,
          media_url: finalMediaUrl,
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
          console.error({ event: 'insert_post_error', account: account_name, post_id: post.id, error: error.message });
        } else {
          postsInserted++;
        }
      }

      // If no overlap (gap scenario), process the batch but do NOT fetch next page
      // If overlap, we already stopped early
      url = null; // Prevent fetching next page

    } catch (error) {
      console.error({ event: 'fetch_exception', account: account_name, error: error });
      return postsInserted;
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

async function uploadIntoStorage(
  supabase: any,
  post: InstagramPost,
  ig_user_id: string,
  account_name: string
): Promise<string | undefined> {
  let finalMediaUrl = post.media_url || post.permalink;

  if (post.media_type === "IMAGE" && post.media_url) {
    try {
      const imageResponse = await fetch(post.media_url);
      if (imageResponse.ok) {
        const imageBlob = await imageResponse.blob();
        const filePath = `${ig_user_id}/${post.id}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('instagram_images')
          .upload(filePath, imageBlob, {
            contentType: 'image/jpeg',
            upsert: true
          });
        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('instagram_images')
            .getPublicUrl(filePath);
          finalMediaUrl = publicUrlData.publicUrl;
        } else {
          console.error({ event: 'image_upload_error', account: account_name, post_id: post.id, error: uploadError.message });
        }
      } else {
        console.error({ event: 'image_download_error', account: account_name, post_id: post.id, status: imageResponse.status });
      }
    } catch (error) {
      console.error({ event: 'image_processing_exception', account: account_name, post_id: post.id, error: error });
    }
  }


  return finalMediaUrl;
}
