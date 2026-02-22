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
    const { text } = body;

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
    const systemPrompt = `
You are a validation engine for a profile-building app.

Your job is to analyse the provided text and classify it into two fields: safe and sensitive.

----------------------
FIELD DEFINITIONS
----------------------

1. safe
- true if the text contains no harmful, hateful, illegal, pornographic, explicit, or disallowed content.
- false if the content is inappropriate for a professional profile.

2. sensitive
- true if personal PII is present that should not be stored or displayed, including:
  - personal phone number
  - personal email
  - exact street/home address
  - other identifying contact or location details that could compromise privacy
- false if no such PII is present, or only general info (e.g. city/region only, company name, job title) is given.
- work phone or work email in a professional context may be considered non-sensitive at your discretion.

3. reason
- One short sentence explaining the main factor behind your safe/sensitive classification.

----------------------
RESPONSE FORMAT
----------------------

Respond ONLY as a JSON object:

{
  "safe": boolean,
  "sensitive": boolean,
  "reason": string
}

"reason" MUST be exactly one sentence.
`.trim();

    const response = await client.responses.parse({
      model: "gpt-4o-mini",
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      text: {
        format: zodTextFormat(ValidationSchema, "validation"),
      },
    });

    const result = response.output_parsed;

    // Log the validation result for monitoring
    console.log(
      `Validation result for user ${user.id}: safe=${result?.safe}, sensitive=${result?.sensitive}`
    );

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Validation API error:", err);

    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";

    return NextResponse.json(
      {
        safe: false,
        sensitive: true,
        reason: `Validation failed: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
