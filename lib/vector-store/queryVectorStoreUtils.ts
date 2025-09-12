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
      )
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

  const developmentTesting = true;
  let response : QueryResult;
  
  if (developmentTesting) {
    response =
      {
        result: "Students at the University of Melbourne, like Tanat Chanwangsa, showcase a strong programming background and interest in Software Engineering (SWE) roles. Tanat, majoring in Computing and Software Systems, is proficient in multiple programming languages and aims to leverage software to solve complex challenges. His experiences in internships further enhance his readiness for SWE positions by developing practical skills.",
        matches: [
        {
          file_id: "file-HQbTtn4Jc84bVNUaCDAhwP",
          description: "This document highlights Tanat Chanwangsa's role at DSCubed, where he contributes to projects linking data science theory to practical applications, showcasing the skills that are desirable in SWE roles."
        },
        {
          file_id: "file-FkeGHrV61WrLFcT5B2ayeb",
          description: "This document traces Tanat's academic journey, emphasizing his strong performance in STEM subjects and his leadership in tutoring, indicating a solid background for pursuing SWE roles."
        },
        {
          file_id: "file-MUDBA5QuWuirNVEmgBsmF4",
          description: "This document discusses Tanat's extensive programming skills and passion for technology, aligning with the qualifications typically sought in Software Engineering candidates."
        }
      ],
      followUps: "Would you like more details about Tanat's background?",
    };
  }
  else {
    const apiResponse = await openai.responses.parse({
      model: "gpt-4o-mini",
      input: [{
          role: "system",
          content: `You are a vector store assistant. Rules:
  
  1. When a user queries, always provide:
     - result: 2-3 sentence summary of relevant content.
     - matches: an array of objects containing:
         * file_id: the actual file_id from the vector store attributes. FORMAT: "file-...", NO .TXT
         * description: short description of the content and how it relates to the query
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
  `
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

    response = apiResponse.output_parsed;

  }

  const parsed = QueryResultSchema.safeParse(response);
  if (!parsed.success) {
    console.error("Validation failed:", parsed.error.format());
    throw new Error("Invalid search result format");
  }

  const matches = parsed.data.matches;

  const userMap = new Map<string, Array<FileInfo>>();
  for (const match of matches) {
    const fileId = match.file_id;
    const fileInfo = await openai.vectorStores.files.retrieve(
      fileId, {
        vector_store_id: vectorStoreId,
      }
    );

    const userId = String(fileInfo.attributes?.userId);
    if (userId) {
      const existing = userMap.get(userId) || [];
      userMap.set(userId, [...existing, {description: match.description, file_id: match.file_id }]);
    }
  }
  
  const userResults = Array.from(userMap.entries()).map(([userId, files]) => ({
    user_id: userId,
    files: files.map(file => ({
      file_id: file.file_id,
      description: file.description
    }))
  }));

  return {
    result: parsed.data.result,
    matches: userResults,
    followUps: parsed.data.followUps
  };
}
