import { NextRequest, NextResponse } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";

export type BudgetTier = "anon" | "verified";

export const BUDGET_LIMITS: Record<BudgetTier, { maxPerWindow: number; windowMs: number }> = {
  anon:     { maxPerWindow: 100_000,   windowMs: 24 * 60 * 60 * 1000 },
  verified: { maxPerWindow: 1_000_000, windowMs: 24 * 60 * 60 * 1000 },
};

// --- Types ---

interface BudgetCheckSuccess {
  ok: true;
  remaining: number;
  resetsAt: Date;
}

interface BudgetCheckFailure {
  ok: false;
  response: NextResponse;
}

export type BudgetCheckResult = BudgetCheckSuccess | BudgetCheckFailure;

// --- Public API ---

/**
 * Check if the user has enough budget for an estimated token count.
 * Call this BEFORE the OpenAI API call.
 */
export async function checkTokenBudget(
  supabase: SupabaseClient,
  identity: string,
  tier: BudgetTier,
  estimatedTokens: number
): Promise<BudgetCheckResult> {
  const limits = BUDGET_LIMITS[tier];
  const now = new Date();

  const { data: record, error } = await supabase
    .from("token_usage")
    .select("tokens_used, window_start")
    .eq("identity", identity)
    .single();

  let tokensUsed = 0;
  let windowStart = now;

  if (record && !error) {
    const windowAge = now.getTime() - new Date(record.window_start).getTime();
    if (windowAge > limits.windowMs) {
      tokensUsed = 0;
      windowStart = now;
    } else {
      tokensUsed = record.tokens_used;
      windowStart = new Date(record.window_start);
    }
  }

  const remaining = limits.maxPerWindow - tokensUsed;
  const resetsAt = new Date(windowStart.getTime() + limits.windowMs);

  if (estimatedTokens > remaining) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Token budget exhausted",
          code: "TOKEN_BUDGET_EXCEEDED",
          detail: `You've used ${tokensUsed} of ${limits.maxPerWindow} tokens today. Resets at ${resetsAt.toISOString()}.`,
          remaining,
          resetsAt: resetsAt.toISOString(),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": String(remaining),
            "X-RateLimit-Reset": resetsAt.toISOString(),
            "Retry-After": String(Math.ceil((resetsAt.getTime() - now.getTime()) / 1000)),
          },
        }
      ),
    };
  }

  return { ok: true, remaining: remaining - estimatedTokens, resetsAt };
}

/**
 * Debit actual token usage after a successful OpenAI call.
 * Call this AFTER getting the API response.
 */
export async function debitTokens(
  supabase: SupabaseClient,
  identity: string,
  tier: BudgetTier,
  actualTokensUsed: number
): Promise<void> {
  try {
    const limits = BUDGET_LIMITS[tier];
    const now = new Date();

    const { data: existing } = await supabase
      .from("token_usage")
      .select("window_start")
      .eq("identity", identity)
      .single();

    const windowExpired = existing
      ? now.getTime() - new Date(existing.window_start).getTime() > limits.windowMs
      : true;

    if (!existing || windowExpired) {
      const { error: upsertError } = await supabase.from("token_usage").upsert({
        identity,
        tier,
        tokens_used: actualTokensUsed,
        window_start: now.toISOString(),
        updated_at: now.toISOString(),
      });
      if (upsertError) {
        console.error("[token-budget] Upsert failed:", upsertError);
      }
    } else {
      const { error: rpcError } = await supabase.rpc("increment_token_usage", {
        p_identity: identity,
        p_amount: actualTokensUsed,
      });
      if (rpcError) {
        console.error("[token-budget] increment_token_usage RPC failed:", rpcError);
      }
    }
  } catch (err) {
    console.error("[token-budget] Failed to debit tokens:", err);
  }
}

/**
 * Resolve a user identity string for budget tracking.
 */
export function resolveIdentity(
  userId: string | null,
  req?: NextRequest
): string {
  if (userId) return `user:${userId}`;

  const fingerprint = req?.headers.get("x-fingerprint");
  if (fingerprint) return `anon:${fingerprint}`;

  const ip = req?.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  return `anon:ip:${ip}`;
}
