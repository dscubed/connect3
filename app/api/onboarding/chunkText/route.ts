import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api/auth-middleware";
import OpenAI from "openai";

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
You are a semantic chunker. 
Split the given document into logical, coherent chunks.
Rules:
- Each chunk should be 300-800 tokens long.
- Do not cut sentences in half.
- Group sentences by topic or section (paragraphs, bullet lists, headings).
- Return JSON only in this format:
[
  { "chunk_index": 0, "content": "..." },
  { "chunk_index": 1, "content": "..." }
]
          `,
        },
        { role: "user", content: text },
      ],
    });

    const raw = response.output_text;
    const chunks = JSON.parse(raw);

    return NextResponse.json({ success: true, chunks });
  } catch (error) {
    console.error("Semantic chunking error:", error);
    return NextResponse.json({ error: "Chunking failed" }, { status: 500 });
  }
}
