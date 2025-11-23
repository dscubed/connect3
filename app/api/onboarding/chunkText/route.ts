import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api/auth-middleware";
import { z } from "zod";
import OpenAI from "openai";
import {
  WORD_LIMIT,
  CATEGORY_LIMIT,
} from "@/components/onboarding/chunks/utils/ChunkUtils";

// Define chunk schema (no chunk_id)
const ResponseChunkSchema = z.object({
  category: z
    .string()
    .max(
      CATEGORY_LIMIT,
      `Category must be ${CATEGORY_LIMIT} characters or less`
    ),
  content: z
    .string()
    .refine((val) => val.trim().split(/\s+/).length <= WORD_LIMIT, {
      message: `Content must be ${WORD_LIMIT} words or less`,
    }),
});

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content: `
You are a semantic chunker for documents about users/organisations.
Split the given document into logical, coherent chunks.
Include as much relevant information as possible in each chunk separate them if necessary.
Each chunk should have:
- a "category" (no more than ${CATEGORY_LIMIT} characters, e.g. Experience, Skills, Education, Leadership, Achievements, etc.)
- a "content" field (the actual text for that chunk, no more than ${WORD_LIMIT} words, do not cut sentences in half)
- Include the user/organisation's name in every chunk and where possible a relevant timeframes (e.g. years, dates) in the content.

CATEGORIES:
- Ensure category has no more than ${CATEGORY_LIMIT} characters and content has no more than ${WORD_LIMIT} words.
- Use consistent category names across chunks (e.g. do not use "Work Experience" and "Professional Experience" for different chunks)
- Use general categories like "Events", "Competitions", "Volunteering" rather than specific names.

- FOR USERS: Don't incluude any PII such as emails, phone numbers, or addresses. (Use general locations like city or country are fine)
- Do not include any harmful or sensitive content.
Return ONLY a JSON array in this format:
USERS:
[
  { "category": "Experience", "content": "John Doe has worked at XYZ Corp as a Software Engineer from 2015-2020 achieving ..." },
  { "category": "Skills", "content": "John is proficient in JavaScript, TypeScript, and React." }
]
ORGANISATIONS:
[
  { "category": "Events", "content": "XYZ Corp is hosting ABC Conference in ..." },
  { "category": "Events", "content": "XYZ Corp hosts DEF hackathons" },
  { "category": "Competitions", "content": "XYZ Corp organises DEF hackathons" }
]
Do not include any explanation or extra text, NO JSON MARKDOWNS.
`,
        },
        { role: "user", content: text },
      ],
    });

    const raw = response.output_text;
    let chunks = [];
    try {
      chunks = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse chunks" },
        { status: 502 }
      );
    }

    // Validate chunks array
    const chunksResult = z.array(ResponseChunkSchema).safeParse(chunks);
    if (!chunksResult.success) {
      return NextResponse.json(
        { error: "Invalid chunk format", details: chunksResult.error.errors },
        { status: 502 }
      );
    }

    // Add chunk_id to each chunk
    const chunksWithId = chunksResult.data.map((chunk) => ({
      ...chunk,
      chunk_id: crypto.randomUUID(),
    }));

    return NextResponse.json({ success: true, chunks: chunksWithId });
  } catch (error) {
    console.error("Semantic chunking error:", error);
    return NextResponse.json({ error: "Chunking failed" }, { status: 500 });
  }
}
