import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";
import { rateLimit } from "@/lib/api/rate-limit";
import { authenticateRequest } from "@/lib/api/auth-middleware";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Validation schema
const ValidationSchema = z.object({
  safe: z.boolean(),
  sensitive: z.boolean(),
  relevant: z.boolean(),
  categoryMatches: z.boolean(),
  reason: z.string(),
});

// Rate limiting per user
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
});

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { user } = authResult;

    // 2. Validate request body
    const body = await req.json();
    const { text, fullName, category, mode } = body as {
      text: string;
      fullName?: string;
      category?: string; // optional for summary validation
      mode?: "chunk" | "summary"; // optional hint
    };

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Invalid text content" },
        { status: 400 }
      );
    }

    if (text.length > 50000) {
      return NextResponse.json(
        { error: "Text content too large" },
        { status: 400 }
      );
    }

    // 3. Rate limiting
    try {
      await limiter.check(10, user.id);
    } catch {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    console.log(
      `Validation request from user ${user.id}, mode=${mode || "chunk"}, category=${
        category || "(none)"
      }, text length: ${text.length}`
    );

    // 4. Call OpenAI (SAFETY + RELEVANCE; category match only when category provided)
    const systemPrompt = `
You are a validation engine for a profile-building app.
We strongly prefer LOW false rejections.
If you are unsure, allow the content.

-----------------------
CHECKS
-----------------------

1) safe
- false ONLY if the content clearly contains hateful/violent content, explicit sexual content, or instructions for wrongdoing.
- Otherwise safe=true.

2) sensitive
- true ONLY if the content includes personal PII:
  - personal phone number
  - personal email address
  - exact street/home address
- City/state is allowed.
- Work/public organisational emails are allowed.
- If unsure, sensitive=false.

3) relevant
- true if the text plausibly belongs in a user profile (summary or highlight).
- false ONLY if it is clearly nonsense, random characters, empty filler, or totally unrelated.

Examples of clearly NOT relevant:
- "akjdfbskjdbfsln"
- "lol idk"
- a random rant unrelated to any profile info

4) categoryMatches
- Only evaluate this if a category is provided.
- If no category is provided, set categoryMatches=true.
- If a category is provided, set categoryMatches=true if the content reasonably fits the category.
- false ONLY if it clearly belongs to a different category.

-----------------------
OUTPUT RULES
-----------------------
- reason MUST be exactly one sentence explaining the main factor.
- If safe=false or sensitive=true, reason should focus on that.
- If relevant=false, reason should say it looks like nonsensical/unrelated text.
- If categoryMatches=false, reason should say the content doesn't match the selected category.

-----------------------
RESPONSE FORMAT
-----------------------
Respond ONLY as a JSON object:

{
  "safe": boolean,
  "sensitive": boolean,
  "relevant": boolean,
  "categoryMatches": boolean,
  "reason": string
}
`.trim();

    const response = await client.responses.parse({
      model: "gpt-4o-mini",
      input: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: category
            ? `Category: ${category}\n\nContent:\n${text}`
            : `Content:\n${text}`,
        },
      ],
      text: {
        format: zodTextFormat(ValidationSchema, "validation"),
      },
    });

    const result = response.output_parsed;

    console.log(
      `Validation result for user ${user.id}: safe=${result?.safe}, sensitive=${result?.sensitive}, relevant=${result?.relevant}, categoryMatches=${result?.categoryMatches}`
    );

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Validation API error:", err);

    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";

    return NextResponse.json(
      {
        safe: false,
        sensitive: false,
        relevant: false,
        categoryMatches: false,
        reason: `Validation failed: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
