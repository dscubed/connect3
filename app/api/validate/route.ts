import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log('OpenAI client initialized:', !!client);
console.log('API Key present:', !!process.env.OPENAI_API_KEY);

// Define schema for validation result
const ValidationSchema = z.object({
  safe: z.boolean(),
  relevant: z.boolean(),
  reason: z.string(),
});

export async function POST(req: Request) {
  console.log('Validation API called');
  const { text, fullName } = await req.json();
  console.log('Received text length:', text?.length);
  console.log(text);  
  try {
    // Use structured output parsing
    const response = await client.responses.parse({
      model: "o4-mini",
      input: [
        {
          role: "system",
          content: `
You are a validation engine for a profile-building app. 
You are validating documents for user ${fullName}.
Given user-uploaded text, you must determine:
1. Is it SAFE 
- no harmful, illegal, NSFW, or disallowed content)?
2. Is it RELEVANT 
- does it contain information that could help describe a user's professional or personal profile?
e.g. (contains work experience, education, skills, interests, or bio)
- iS that document is for user: "${fullName}"? NOT ANOTHER USER?

Respond only in the structured format defined. Reason should just be one sentence only justifying why the text was safe, relevant, or both.
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

    // The parsed result will already be strongly typed
    const result = response.output_parsed;

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Validation API error:', err);
    return NextResponse.json(
      {
        safe: false,
        relevant: false,
        reason: `Validation failed: ${err.message}`,
      },
      { status: 500 }
    );
  }
}
