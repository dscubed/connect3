import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";
import { rateLimit } from "@/lib/api/rate-limit";
import { authenticateRequest } from "@/lib/api/auth-middleware";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define schema for validation result
const ValidationSchema = z.object({
  safe: z.boolean(),
  relevant: z.boolean(),
  sensitive: z.boolean(),
  reason: z.string(),
});

// Rate limiting per user
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
});

export async function POST(req: NextRequest) {
  try {
    // Authenticate user via Supabase Auth
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) {
      return authResult; // Return error response
    }
    const { user } = authResult;

    // Validate request body
    const body = await req.json();
    const { text, fullName } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Invalid text content" },
        { status: 400 }
      );
    }

    if (text.length > 50000) {
      // Limit text size
      return NextResponse.json(
        { error: "Text content too large" },
        { status: 400 }
      );
    }

    // Rate limiting per user
    try {
      await limiter.check(10, user.id); // 10 requests per minute per user
    } catch {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    console.log(
      `Validation request from user: ${user.id}, text length: ${text.length}`
    );

    // Call OpenAI API
    const response = await client.responses.parse({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content: `
You are a validation engine for a profile-building app. 
You are validating a chunk for user: ${fullName || "..."}.
A chunk contains a category and content describing the user's personal or professional profile.

Given user-uploaded chunk, you must determine:
1. Is it SAFE (no harmful, illegal, NSFW, or disallowed content)?
2. Is it RELEVANT (does it contain information that could help describe a user's personal or professional profile?
e.g. contains work experience, education, skills, interests, or bio)
- Don't be too strict on personal interests if they're not professional, as long as they're not disallowed.
- Is this chunk for user: "${fullName || "user"}"? NOT ANOTHER USER?
- Does the category and the content match each other in a reasonable way?
- Is the category a valid category?
3. Does it contain SENSITIVE info (PII like phone numbers, emails, addresses, or other private info)?
- Broad addresses like city or state are OK, but not specific street addresses.
- Business contact info like work email or phone is OK.

Respond only in the structured format defined. Reason should just be one sentence only justifying why the text was safe, relevant, sensitive etc.
          `,
        },
        {
          role: "user",
          content: text,
        },
      ],
      text: {
        format: zodTextFormat(ValidationSchema, "validation"),
      },
    });

    const result = response.output_parsed;

    // Log the validation result for monitoring
    console.log(
      `Validation result for user ${user.id}: safe=${result?.safe}, relevant=${result?.relevant}`
    );

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Validation API error:", err);

    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";

    return NextResponse.json(
      {
        safe: false,
        relevant: false,
        reason: `Validation failed: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
