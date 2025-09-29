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
You are a semantic chunker for resumes.
Split the given document into logical, coherent chunks.
Include as much relevant information as possible in each chunk separate them if necessary.
Each chunk should have:
- a "category" (no more than ${CATEGORY_LIMIT} characters, e.g. Experience, Skills, Education, Leadership, Achievements, etc.)
- a "content" field (the actual text for that chunk, no more than ${WORD_LIMIT} words, do not cut sentences in half)
- Include the user's name in every chunk and where possible a relevant timeframes (e.g. years, dates) in the content.
- Ensure category has no more than ${CATEGORY_LIMIT} characters and content has no more than ${WORD_LIMIT} words.
Return ONLY a JSON array in this format:
[
  { "category": "Experience", "content": "John Doe has worked at XYZ Corp as a Software Engineer from 2015-2020 achieving ..." },
  { "category": "Skills", "content": "John is proficient in JavaScript, TypeScript, and React." }
]
Do not include any explanation or extra text.
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
        { status: 500 }
      );
    }

    // Validate chunks array
    const chunksResult = z.array(ResponseChunkSchema).safeParse(chunks);
    if (!chunksResult.success) {
      return NextResponse.json(
        { error: "Invalid chunk format", details: chunksResult.error.errors },
        { status: 400 }
      );
    }

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
