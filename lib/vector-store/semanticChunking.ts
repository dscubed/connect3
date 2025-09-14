import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Use GPT to semantically chunk text before uploading.
 */
export async function semanticChunkText(text: string) {
  const response = await client.responses.create({
    model: "gpt-4o-mini", // lightweight + good at structuring
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
