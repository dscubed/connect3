import { NextResponse } from "next/server";
import { uploadToVectorStoreAndDatabase } from "@/lib/vector-store/vectorStoreUtils";

export async function POST(req: Request) {
  try {
    const { userId, summaryText } = await req.json();

    if (!userId || !summaryText) {
      return NextResponse.json(
        {
          error: "Missing required fields: userId, summaryText",
        },
        { status: 400 }
      );
    }

    const chunks = await semanticChunkText(summaryText, userId);
    const uploadResults = [];
    
    for (const chunk of chunks) {
      const result = await uploadToVectorStoreAndDatabase(userId, chunk.content);
      if (!result.success) {
        return NextResponse.json(
          { 
            success: false, 
            error: result.error,
            uploadedChunks: uploadResults.length
          },
          { status: 500 }
        );
      }
      uploadResults.push(result);
    }

    return NextResponse.json({
      success: true,
      totalChunks: uploadResults.length,
      firstFileId: uploadResults[0]?.uploadedFileId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Use GPT to semantically chunk text before uploading.
 */
export async function semanticChunkText(text: string, fileId: string) {
  const response = await client.responses.create({
    model: "gpt-4.1-mini", // lightweight + good at structuring
    input: [
      {
        role: "system",
        content: `
You are a semantic chunker. 
Split the given document into logical, coherent chunks.
Rules:
- Each chunk should be 300–800 tokens long.
- Do not cut sentences in half.
- Group sentences by topic or section (paragraphs, bullet lists, headings).
- Return JSON only in this format:
[
  { "chunk_index": 0, "file_id": "FILE_ID", "content": "..." },
  { "chunk_index": 1, "file_id": "FILE_ID", "content": "..." }
]
        `,
      },
      { role: "user", content: text },
    ],
  });

  // LLM returns structured JSON text
  const raw = response.output_text;
  const chunks = JSON.parse(raw) as {
    chunk_index: number;
    file_id: string;
    content: string;
  }[];

  return chunks;
}
