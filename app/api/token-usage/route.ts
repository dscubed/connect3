import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { resolveIdentity, BUDGET_LIMITS, BudgetTier } from "@/lib/api/token-budget";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
);

export async function GET(req: NextRequest) {
  // Resolve user identity (authenticated or anonymous)
  let userId: string | null = null;
  let tier: BudgetTier = "anon";

  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const {
      data: { user },
    } = await supabase.auth.getUser(token);
    if (user) {
      userId = user.id;
      tier = user.is_anonymous ? "anon" : "verified";
    }
  }

  const identity = resolveIdentity(userId, req);
  const limits = BUDGET_LIMITS[tier];
  const now = new Date();

  const { data: record } = await supabase
    .from("token_usage")
    .select("tokens_used, window_start")
    .eq("identity", identity)
    .single();

  let tokensUsed = 0;
  let windowStart = now;

  if (record) {
    const windowAge = now.getTime() - new Date(record.window_start).getTime();
    if (windowAge > limits.windowMs) {
      // Window expired — fresh budget
      tokensUsed = 0;
      windowStart = now;
    } else {
      tokensUsed = record.tokens_used;
      windowStart = new Date(record.window_start);
    }
  }

  const maxTokens = limits.maxPerWindow;
  const remaining = maxTokens - tokensUsed;
  const resetsAt = new Date(windowStart.getTime() + limits.windowMs);

  return NextResponse.json({
    tokensUsed,
    maxTokens,
    remaining,
    resetsAt: resetsAt.toISOString(),
    tier,
  });
}
