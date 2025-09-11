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
  followUps: z.string(), // MUST be a single natural language question
});

export type SearchResult = z.infer<typeof SearchResultSchema>;

export async function queryVectorStore(
  query: string,
  vectorStoreId: string,
  openaiApiKey: string
): Promise<SearchResult> {
  const openai = new OpenAI({ apiKey: openaiApiKey });

  const response = await openai.responses.parse({
    model: "gpt-4o-mini",
    input: [{
        role: "system",
        content: `You MUST include ALL these fields in your JSON response:
1. result: Summary text (2-3 sentences)
2. matches:
    - file_id: The ID of the file
    - description: A description of the file (DONT INCLUDE FILE NAMES)
3. followUps: A SINGLE QUESTION to continue the conversation

Failure to include ALL fields will result in an error.`
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

  console.log("Raw API response:", JSON.stringify(response.output_parsed, null, 2));

  const resultWithFollowUp = {
    ...response.output_parsed,
    followUps: response.output_parsed.followUps || 
      "Would you like more details about any of these findings?"
  };

  const parsed = SearchResultSchema.safeParse(resultWithFollowUp);
  if (!parsed.success) {
    console.error("Validation failed:", parsed.error.format());
    throw new Error("Invalid search result format");
  }

  return parsed.data;
}
