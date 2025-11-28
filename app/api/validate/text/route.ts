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
  belongsToUser: z.boolean(),
  detectedNames: z.array(z.string()),
  reason: z.string(),
});

// Rate limiting per user
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
});

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user via Supabase Auth
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) {
      return authResult; // Return error response
    }
    const { user } = authResult;

    // 3. Rate limiting per user
    try {
      await limiter.check(10, user.id); // 10 requests per minute per user
    } catch {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    // 4. Validate request body
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

    console.log(
      `Validation request from user: ${user.id}, text length: ${text.length}`
    );

    // 6. Call OpenAI API
    const systemPrompt = `
    You are a validation engine for a profile-building app. 
The user's legal full name is: "${fullName}".

Your job is to analyse the user-uploaded text (provided in the user message) 
and fill in the following fields:

- "Safe": whether the text avoids harmful, illegal, NSFW, or disallowed content.
- "Relevant": whether the text contains information that could help describe a personal or professional profile
  (e.g. work experience, education, skills, interests, biography, portfolio description).
- "detectedNames": an array of all human person names you find in the text.
- "belongsToUser": whether the text appears to be primarily about this user ("${fullName}"), and not another person.
- "reason": a single short sentence explaining why you set "belongsToUser" / "isSafe" / "isRelevant" the way you did.

Rules for "belongsToUser":
- If the main person described in the text has a different name from "${fullName}", set "belongsToUser": false.
- If the text clearly describes "${fullName}" (or a very close variant like including a middle name or initials), set "belongsToUser": true.
- If you are uncertain who the text is about, set "belongsToUser": false.
- Do NOT guess that a different full name refers to the same user.

Respond ONLY as a single JSON object matching this schema:
{
  "Safe": boolean,
  "Relevant": boolean,
  "belongsToUser": boolean,
  "detectedNames": string[],
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
      text: { format: zodTextFormat(ValidationSchema, "validation") },
    });

    const result = response.output_parsed;

    // 7. Log the validation result for monitoring
    console.log(
      `Validation result for user ${user.id}: safe=${result?.safe}, relevant=${result?.relevant}, belongs to user=${result?.belongsToUser}`
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
        belongsToUser: false,
        reason: `Validation failed: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
