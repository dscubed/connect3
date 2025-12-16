import { createClient } from "@supabase/supabase-js";

// Configuration
export const MAX_REQUESTS_ALLOWED = 75;
export const INSTAGRAM_API_BASE = "https://graph.instagram.com";

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types
export interface InstagramAccount {
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

export interface InstagramPost {
  id: string;
  caption?: string;
  media_type: string;
  media_url?: string;
  permalink?: string;
  timestamp: string;
}

export interface RequestContext {
  totalRequests: number;
}

// Helper Functions
export async function refreshAccessToken(
  account: InstagramAccount,
  ctx: RequestContext
): Promise<boolean> {
  const { access_token, token_expires_at, account_name, id } = account;

  // Parse expiration date
  const expiresAt = new Date(token_expires_at);
  const now = new Date();

  // Calculate remaining lifetime
  const timeRemaining = expiresAt.getTime() - now.getTime();
  const maxLifetime = 60 * 24 * 60 * 60 * 1000; // ~60 days in ms

  // Refresh if less than 10% of lifetime remains
  if (timeRemaining < maxLifetime * 0.1) {
    console.log(`Refreshing token for account ${account_name}...`);

    if (ctx.totalRequests >= MAX_REQUESTS_ALLOWED) {
      console.log("Rate limit reached, skipping refresh.");
      return false;
    }

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
      const expiresInSeconds = data.expires_in || 5184000; // Default to 60 days
      const newExpiresAt = new Date(now.getTime() + expiresInSeconds * 1000);

      // Update DB
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

      // Update local account object for subsequent use
      account.access_token = newAccessToken;
      console.log(`Token refreshed successfully for ${account_name}.`);
      return true;
    } catch (error) {
      console.error(`Error refreshing token: ${error}`);
      return false;
    }
  } else {
    console.log(`Token for ${account_name} is still valid.`);
    return true;
  }
}

export async function fetchNewPosts(account: InstagramAccount, ctx: RequestContext) {
  const { ig_user_id, access_token, last_synced_at, account_name } = account;
  let lastSyncedDate: Date | null = last_synced_at
    ? new Date(last_synced_at)
    : null;

  console.log(`Fetching posts for ${account_name}...`);

  let url:
    | string
    | null = `${INSTAGRAM_API_BASE}/v24.0/${ig_user_id}/media?fields=id,caption,media_type,media_url,permalink,timestamp&limit=50&access_token=${access_token}`;

  let newestPostTimestamp: Date | null = null;
  let postsInserted = 0;

  while (url) {
    if (ctx.totalRequests >= MAX_REQUESTS_ALLOWED) {
      console.log("Rate limit reached, stopping fetch.");
      break;
    }

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

      if (posts.length === 0) {
        break;
      }

      for (const post of posts) {
        const postTimestamp = new Date(post.timestamp);

        // Track newest timestamp seen in this run
        if (!newestPostTimestamp || postTimestamp > newestPostTimestamp) {
          newestPostTimestamp = postTimestamp;
        }

        // Stop if we reach posts older than last sync
        if (lastSyncedDate && postTimestamp <= lastSyncedDate) {
          console.log("Reached previously synced posts.");
          url = null; // Stop pagination
          break;
        }

        // Prepare record
        const postRecord = {
          media_id: post.id,
          ig_user_id: ig_user_id,
          caption: post.caption,
          media_url: post.media_url || post.permalink, // Fallback
          timestamp: post.timestamp,
          created_at: new Date().toISOString(),
        };

        // Upsert
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

      // Pagination
      if (url) {
        // Only check pagination if we haven't manually stopped
        url = data.paging?.next || null;
      }
    } catch (error) {
      console.error(`Exception during fetch: ${error}`);
      break;
    }
  }

  // Update last_synced_at if we found new posts
  if (newestPostTimestamp) {
    // Only update if newest_post_timestamp is newer than what we had
    if (!lastSyncedDate || newestPostTimestamp > lastSyncedDate) {
      await supabase
        .from("instagram_accounts")
        .update({
          last_synced_at: newestPostTimestamp.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", account.id);
      console.log(`Updated last_synced_at for ${account_name}`);
    }
  }

  console.log(
    `Finished processing ${account_name}. Inserted ${postsInserted} new posts.`
  );
}

export async function refreshPostMediaUrl(
  mediaId: string,
  accessToken: string,
  ctx: RequestContext
): Promise<boolean> {
  console.log(`Refreshing media URL for post ${mediaId}...`);

  if (ctx.totalRequests >= MAX_REQUESTS_ALLOWED) {
    console.log("Rate limit reached, cannot refresh media URL.");
    return false;
  }

  const url = new URL(`${INSTAGRAM_API_BASE}/${mediaId}`);
  url.searchParams.append("fields", "media_url,permalink");
  url.searchParams.append("access_token", accessToken);

  try {
    const response = await fetch(url.toString());
    ctx.totalRequests++;

    if (response.ok) {
      const data = await response.json();
      const newMediaUrl = data.media_url || data.permalink;

      if (newMediaUrl) {
        // Update DB
        const { error } = await supabase
          .from("instagram_posts")
          .update({
            media_url: newMediaUrl,
          })
          .eq("media_id", mediaId);

        if (error) {
          console.error(`Error updating media URL in DB: ${error.message}`);
          return false;
        }

        console.log(`Successfully refreshed media URL for post ${mediaId}.`);
        return true;
      } else {
        console.log(`No media_url found for post ${mediaId}.`);
        return false;
      }
    } else {
      const errorText = await response.text();
      console.error(`Failed to refresh media URL: ${errorText}`);
      return false;
    }
  } catch (error) {
    console.error(`Error refreshing media URL: ${error}`);
    return false;
  }
}
