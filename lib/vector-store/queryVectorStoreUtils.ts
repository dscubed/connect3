import OpenAI from "openai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod.mjs";

export const SearchResultSchema = z.object({
  result: z.string(), // overall summary text
  matches: z.array(
    z.object({
      file_id: z.string(),
      description: z.string(),
    })
  ),
});

export type SearchResult = z.infer<typeof SearchResultSchema>;

export async function queryVectorStore(
  query: string,
  vectorStoreId: string,
  openaiApiKey: string
): Promise<SearchResult> {
  const openai = new OpenAI({ apiKey: openaiApiKey });

  const response = await openai.responses.parse({
    model: "o4-mini",
    input: [
      {
        role: "system",
        content:
          "You are a search assistant. Return JSON strictly matching the schema. Don't include filename or file_id in the description.",
      },
      {
        role: "user",
        content: `Query: ${query}`,
      },
    ],
    tools: [
      {
        type: "file_search",
        vector_store_ids: [vectorStoreId],
      },
    ],
    text: {
      format: zodTextFormat(SearchResultSchema, "search_results"),
    },
  });

  if (!response.output_parsed) {
    throw new Error("Failed to parse search results");
  }

  return response.output_parsed;
}
