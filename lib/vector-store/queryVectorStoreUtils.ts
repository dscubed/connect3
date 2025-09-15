import OpenAI from "openai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod.mjs";

export const QueryResultSchema = z.object({
  result: z.string(), // overall summary text
  matches: z.array(
    z.object({
      file_id: z.string(),
      description: z.string(),
    })
  ),
  followUps: z.string(),
});

export const SearchResultSchema = z.object({
  result: z.string(),
  matches: z.array(
    z.object({
      user_id: z.string(),
      files: z.array(
        z.object({
          file_id: z.string(),
          description: z.string(),
        })
      ),
    })
  ),
  followUps: z.string(),
});

export type SearchResult = z.infer<typeof SearchResultSchema>;

export type QueryResult = z.infer<typeof QueryResultSchema>;

interface FileInfo {
  file_id: string;
  description: string;
}

export async function queryVectorStore(
  query: string,
  vectorStoreId: string,
  openaiApiKey: string
): Promise<SearchResult> {
  const openai = new OpenAI({ apiKey: openaiApiKey });

  const apiResponse = await openai.responses.parse({
    model: "gpt-4o-mini",
    input: [
      {
        role: "system",
        content: `You are a vector store assistant. Rules:
  
  1. When a user queries, always provide:
     - result: 2-3 sentence summary of relevant content.
     - matches: an array of objects containing:
         * file_id: the actual file_id from the vector store attributes. FORMAT: "file-...", NO .TXT
         * description: short description of the content and how it relates to the query and describes the user don't mention document
         e.g. Has experience in building web applications using React and Node.js., Part of university coding club, developing teamwork skills.
     - followUps: a single natural language question to continue the conversation
  
  2. Ignore file_name. Never generate it.
  
  3. Only include files actually returned by the vector store with attributes.
  
  4. Return valid JSON strictly in this format:
  {
    "result": "...",
    "matches": [
      {"file_id": "...", "description": "..."}
    ],
    "followUps": "..."
  }
  
  5. If you cannot find results, return an empty matches array but still include result and followUps.
  `,
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
      format: zodTextFormat(QueryResultSchema, "search_results"),
    },
  });

  if (!apiResponse.output_parsed) {
    throw new Error("Failed to parse search results");
  }

  const response = apiResponse.output_parsed;

  const parsed = QueryResultSchema.safeParse(response);
  if (!parsed.success) {
    console.error("Validation failed:", parsed.error.format());
    throw new Error("Invalid search result format");
  }

  const matches = parsed.data.matches;

  const userMap = new Map<string, Array<FileInfo>>();
  for (const match of matches) {
    const fileId = match.file_id;
    const fileInfo = await openai.vectorStores.files.retrieve(fileId, {
      vector_store_id: vectorStoreId,
    });

    const userId = String(fileInfo.attributes?.userId);
    if (userId) {
      const existing = userMap.get(userId) || [];
      userMap.set(userId, [
        ...existing,
        { description: match.description, file_id: match.file_id },
      ]);
    }
  }

  const userResults = Array.from(userMap.entries()).map(([userId, files]) => ({
    user_id: userId,
    files: files.map((file) => ({
      file_id: file.file_id,
      description: file.description,
    })),
  }));

  return {
    result: parsed.data.result,
    matches: userResults,
    followUps: parsed.data.followUps,
  };
}
