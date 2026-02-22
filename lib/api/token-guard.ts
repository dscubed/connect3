import { encode } from "gpt-tokenizer";
import { NextResponse } from "next/server";

export type Tier = "anon" | "verified";

const TOKEN_LIMITS: Record<Tier, number> = {
  anon: 500,
  verified: 1500,
};

interface TokenGuardSuccess {
  ok: true;
  tokenCount: number;
  tier: Tier;
}

interface TokenGuardFailure {
  ok: false;
  response: NextResponse;
}

export type TokenGuardResult = TokenGuardSuccess | TokenGuardFailure;

export function validateTokenLimit(
  text: string,
  tier: Tier
): TokenGuardResult {
  const maxTokens = TOKEN_LIMITS[tier];
  const tokenCount = encode(text).length;

  if (tokenCount > maxTokens) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Message too long",
          detail: `Your message is ${tokenCount} tokens. The maximum for your account tier is ${maxTokens}.`,
          tokenCount,
          maxTokens,
        },
        { status: 413 }
      ),
    };
  }

  return { ok: true, tokenCount, tier };
}
