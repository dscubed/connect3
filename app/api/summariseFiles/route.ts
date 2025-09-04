import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { parsedFiles } = await req.json();
    if (!parsedFiles || parsedFiles.length === 0) {
      return NextResponse.json(
        { error: "No parsed files provided" },
        { status: 400 }
      );
    }

    // Combine all parsed text into a single string
    const combinedText = parsedFiles
      .map((f: { text: string }) => f.text)
      .join("\n\n");

    // Call OpenAI to generate a profile summary
    const response = await client.responses.create({
      model: "o4-mini",
      input: [
        {
          role: "system",
          content: `
You are an assistant that creates a detailed user profile summary.
The user has uploaded document(s) containing their resume, work history, skills, education, or personal background.
Write a narrative, story-like summary of the user, weaving together their professional and personal experiences into a flowing text. The summary should read naturally, as if introducing the user in a biography or feature article, not as a bullet-point resume.

IMPORTANT:
- Do NOT include any sensitive personal information like phone numbers, email addresses, or physical addresses (only general location like city/country)
- Focus on professional and relevant personal details only 
- Remove any personally identifiable information (PII) from the summary
- VERY IMPORTANT: DO NOT GENERATE ANY HARMFUL, NSFW, DISALLOWED, CONTENT.
        `,
        },
        {
          role: "user",
          content: combinedText,
        },
      ],
      max_output_tokens: 2000,
    });

    const summary = response.output_text;

    return NextResponse.json({ summary });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "AI processing failed";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
