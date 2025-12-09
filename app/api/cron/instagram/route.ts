import { NextResponse } from "next/server";
import {
  supabase,
  MAX_REQUESTS_ALLOWED,
  InstagramAccount,
  RequestContext,
  refreshAccessToken,
  fetchNewPosts,
} from "@/lib/instagram/ingest";

// Main Handler
export async function GET(request: Request) {
  // Verify secret if needed 
  // const authHeader = request.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) { ... }

  const ctx: RequestContext = { totalRequests: 0 };
  console.log(`Starting batch run at ${new Date().toISOString()}`);

  try {
    // Fetch accounts
    const { data: accounts, error } = await supabase
      .from("instagram_accounts")
      .select("*")
      .order("priority", { ascending: false })
      .order("last_synced_at", { ascending: true });

    if (error) {
      throw error;
    }

    if (!accounts) {
      return NextResponse.json({ message: "No accounts found" });
    }

    console.log(`Found ${accounts.length} accounts to process.`);

    for (const account of accounts) {
      if (ctx.totalRequests >= MAX_REQUESTS_ALLOWED) {
        console.log("Max requests allowed reached for this batch. Stopping.");
        break;
      }

      try {
        // 1. Refresh Token
        await refreshAccessToken(account, ctx);

        // Check limit again
        if (ctx.totalRequests >= MAX_REQUESTS_ALLOWED) {
          break;
        }

        // 2. Fetch New Posts
        await fetchNewPosts(account, ctx);

        // Sleep 2 seconds for rate limiting
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (e) {
        console.error(`Error processing account ${account.account_name}: ${e}`);
        continue;
      }
    }

    return NextResponse.json({
      success: true,
      requests: ctx.totalRequests,
      message: "Batch run completed",
    });
  } catch (error) {
    console.error("Batch run failed:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
