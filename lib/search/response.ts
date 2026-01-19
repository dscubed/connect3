import OpenAI from "openai";
import {
  EntityResult,
  FileMap,
  FileResult,
  ResultSection,
  SearchResponse,
} from "./types";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod.mjs";
import { partialParseResponse } from "./streamParser";

const LLMSearchResultSchema = z.object({
  summary: z.string(),
  results: z.array(
    z.object({
      header: z.string(),
      text: z.string(),
      fileIds: z.array(z.string()),
    })
  ),
  followUps: z.string(),
});

export const generateResponse = async (
  searchResults: FileResult[],
  context: string,
  openai: OpenAI,
  fileMap: FileMap,
  emit?: (event: string, data: unknown) => void
): Promise<SearchResponse> => {
  const results = searchResults
    .map((res) => `${res.fileId}:\n${res.text}`)
    .join("\n\n");
  const systemPrompt = `You are an expert search result summarizer. Given a user query and a set of search results, you will generate a concise summary and suggest follow-up questions.

        Your task is to analyze the search results and return a JSON object in the following format:
        {
            "summary": "<concise summary of the search results>",
            "results": [
                {
                    "header": "<header for result>",
                    "text": "<detailed text for result>",
                    "fileIds": [<list of file IDs that contributed to this result>]
                },
                ...
            ],
            "followUps": "<suggested follow-up questions>"
        }
        Each result section should have no more than 3 matches.

        Text should be short and concise (max 2 sentences per result) use bullet points if necessary.
        summary and followUps should be no more than 2 sentences each.

        Search responses were designed to capture as many relevant documents as possible.
        You do not need to use all search results only pick results that allow you to best generate a response to the user's query.
        Only pick the search results which fit in with what the user is looking for.

        If there are no matches you can identify any partial matches and indicate that in the summary.
        If there are no matches thats fine just indicate that in the summary.`;

  const stream = await openai.responses.create({
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: systemPrompt },
      { role: "system", content: `Search Context: ${context}` },
      { role: "user", content: `Search Results:\n${results}` },
    ],
    text: {
      format: zodTextFormat(LLMSearchResultSchema, "search_response"),
    },
    stream: true,
  });

  // Accumulate streamed text
  let textContent = "";
  for await (const event of stream) {
    if (event.type === "response.output_text.delta" && "delta" in event) {
      textContent += event.delta;
      const partial = partialParseResponse(textContent, fileMap);
      if (emit) emit("response", { partial });
    }
  }

  // Parse JSON and validate with zod
  let parsed;
  try {
    parsed = JSON.parse(textContent);
  } catch {
    throw new Error(`Failed to parse JSON response: ${textContent}`);
  }

  const validated = LLMSearchResultSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error(`Invalid response schema: ${validated.error.message}`);
  }

  // Convert to SearchResponse format
  const outputResults: ResultSection[] = [];
  for (const result of validated.data.results) {
    outputResults.push({
      header: result.header ?? undefined,
      text: result.text,
      matches: result.fileIds
        .map((id) => fileMap[id])
        .filter(Boolean) as EntityResult[],
    });
  }

  return {
    summary: validated.data.summary,
    results: outputResults,
    followUps: validated.data.followUps,
  };
};
