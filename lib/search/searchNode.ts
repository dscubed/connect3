import OpenAI from "openai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod.mjs";
import {
  SearchEntityType,
  SearchPlan,
  FilterObject,
  SearchFilters,
  FileResult,
  SearchResults,
  ResponseResult,
  GeneratedResponse,
  DEFAULT_FILTER,
} from "./type";

export type {
  SearchEntityType,
  SearchPlan,
  FilterObject,
  SearchFilters,
  FileResult,
  SearchResults,
  ResponseResult,
  GeneratedResponse,
};

export { DEFAULT_FILTER };

type VectorStoreFilter = FilterObject | undefined;

function getVectorStoreId(entityType: SearchEntityType): string {
  const vsIds: Record<SearchEntityType, string | undefined> = {
    user: process.env.OPENAI_USER_VECTOR_STORE_ID,
    organisation: process.env.OPENAI_ORG_VECTOR_STORE_ID,
    event: process.env.OPENAI_EVENTS_VECTOR_STORE_ID,
  };

  const vsId = vsIds[entityType];
  if (!vsId) {
    throw new Error(`No vector store ID configured for entity type: ${entityType}`);
  }
  return vsId;
}


export async function searchEntity(
  openai: OpenAI,
  query: string,
  entityType: SearchEntityType,
  filter: FilterObject
): Promise<SearchResults> {
  console.log(`Searching ${entityType} with query: "${query}"`);
  const vsId = getVectorStoreId(entityType);
  console.log(`Using vector store: ${vsId}`);

  const useApiFilter = filter.value.length > 0 && filter.value.length < 50;
  const searchFilter: VectorStoreFilter = useApiFilter ? filter : undefined;

  type OpenAIFilter = Parameters<typeof openai.vectorStores.search>[1]["filters"];

  const response = await openai.vectorStores.search(vsId, {
    query,
    rewrite_query: false,
    ranking_options: { score_threshold: 0.2 },
    ...(searchFilter && { filters: searchFilter as unknown as OpenAIFilter }),
    max_num_results: 15,
  });

  console.log(`Raw API response: ${response.data.length} items`);

  const results: FileResult[] = response.data
    .filter((item) => {
      const attributes = item.attributes as Record<string, string> | null;
      const id = attributes?.id ? String(attributes.id) : null;
      if (!id) return false;
      if (filter.value.includes(id)) return false;
      return true;
    })
    .map((item) => ({
      file_id: item.file_id,
      text: item.content[0].text,
    }));

  console.log(`Returning ${results.length} results`);
  return { results };
}

export async function executeSearchPlan(
  openai: OpenAI,
  searchPlan: SearchPlan,
  filters: SearchFilters
): Promise<SearchResults> {
  const searchPromises: Promise<SearchResults>[] = [];

  if (searchPlan.users) {
    searchPromises.push(
      searchEntity(openai, searchPlan.users, "user", filters.user_filter)
    );
  }

  if (searchPlan.organisations) {
    searchPromises.push(
      searchEntity(openai, searchPlan.organisations, "organisation", filters.org_filter)
    );
  }

  if (searchPlan.events) {
    searchPromises.push(
      searchEntity(openai, searchPlan.events, "event", filters.event_filter)
    );
  }

  const searchResultsArray = await Promise.all(searchPromises);

  const combinedResults: FileResult[] = [];
  for (const searchResult of searchResultsArray) {
    combinedResults.push(...searchResult.results);
  }

  return { results: combinedResults };
}

export function createEmptyFilters(): SearchFilters {
  return {
    org_filter: { ...DEFAULT_FILTER },
    event_filter: { ...DEFAULT_FILTER },
    user_filter: { ...DEFAULT_FILTER },
  };
}

// --- Response Generation ---

const ResponseSchema = z.object({
  summary: z.string(),
  results: z.array(
    z.object({
      header: z.string().nullable(),
      text: z.string(),
      file_ids: z.array(z.string()),
    })
  ),
  follow_ups: z.string(),
});

function formatSearchResultsForLLM(searchResults: SearchResults): string {
  return searchResults.results
    .map((r) => `File ID: ${r.file_id}\n${r.text}`)
    .join("\n\n");
}

const unescapeJsonString = (str: string): string => {
  return str
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
};

const parsePartialResultObject = (objContent: string): Partial<ResponseResult> => {
  const partial: Partial<ResponseResult> = {};

  const headerNullMatch = objContent.match(/"header"\s*:\s*null/);
  if (headerNullMatch) {
    partial.header = null;
  } else {
    const headerMatch = objContent.match(/"header"\s*:\s*"((?:[^"\\]|\\.)*)(")?/);
    if (headerMatch) {
      partial.header = unescapeJsonString(headerMatch[1]);
    }
  }

  const textMatch = objContent.match(/"text"\s*:\s*"((?:[^"\\]|\\.)*)(")?/);
  if (textMatch) {
    partial.text = unescapeJsonString(textMatch[1]);
  }

  const fileIdsMatch = objContent.match(/"file_ids"\s*:\s*\[([^\]]*)\]?/);
  if (fileIdsMatch) {
    const ids = [...fileIdsMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    partial.file_ids = ids;
  }

  return partial;
};

const parsePartialResults = (resultsContent: string): Partial<ResponseResult>[] => {
  const results: Partial<ResponseResult>[] = [];
  let depth = 0;
  let currentObj = "";
  let inObject = false;

  for (let i = 0; i < resultsContent.length; i++) {
    const char = resultsContent[i];
    if (char === "{") {
      if (depth === 0) {
        inObject = true;
        currentObj = "";
      } else {
        currentObj += char;
      }
      depth++;
    } else if (char === "}") {
      depth--;
      if (depth === 0 && inObject) {
        results.push(parsePartialResultObject(currentObj));
        inObject = false;
        currentObj = "";
      } else if (depth > 0) {
        currentObj += char;
      }
    } else if (inObject) {
      currentObj += char;
    }
  }

  if (inObject && currentObj.trim().length > 0) {
    results.push(parsePartialResultObject(currentObj));
  }

  return results;
};

export const parsePartialResponse = (text: string): Partial<GeneratedResponse> => {
  const response: Partial<GeneratedResponse> = {};

  const summaryMatch = text.match(/"summary"\s*:\s*"((?:[^"\\]|\\.)*)(")?/);
  if (summaryMatch) {
    response.summary = unescapeJsonString(summaryMatch[1]);
  }

  const resultsMatch = text.match(/"results"\s*:\s*\[([\s\S]*)/);
  if (resultsMatch) {
    const parsedResults = parsePartialResults(resultsMatch[1]);
    if (parsedResults.length > 0) {
      response.results = parsedResults.map((r) => ({
        header: r.header ?? null,
        text: r.text ?? "",
        file_ids: r.file_ids ?? [],
      }));
    }
  }

  const followUpsMatch = text.match(/"follow_ups"\s*:\s*"((?:[^"\\]|\\.)*)(")?/);
  if (followUpsMatch) {
    response.follow_ups = unescapeJsonString(followUpsMatch[1]);
  }

  return response;
};

export async function generateResponse(
  openai: OpenAI,
  query: string,
  searchResults: SearchResults,
  context: string,
  onPartial?: (partial: Partial<GeneratedResponse>) => void
): Promise<GeneratedResponse> {
  const searchResultsText = formatSearchResultsForLLM(searchResults);

  const stream = await openai.responses.create({
    model: "gpt-4o-mini",
    instructions: `You are an expert search result summarizer. Given a user query and search results, generate a concise summary and suggest follow-up questions.

Return a JSON object:
{
    "summary": "<concise summary of search results>",
    "results": [
        {
            "header": "<header for result section>",
            "text": "<detailed text for result>",
            "file_ids": ["<file IDs that contributed to this result>"]
        }
    ],
    "follow_ups": "<suggested follow-up questions>"
}

Guidelines:
- Each result section should have no more than 3 file_ids
- Text should be short and concise (max 2 sentences per result)
- summary and follow_ups should be no more than 2 sentences each
- Only pick search results that best answer the user's query
- If no matches, indicate that in the summary`,
    input: [
      { role: "system", content: `Search Results:\n${searchResultsText}` },
      { role: "system", content: `Context: ${context}` },
      { role: "user", content: `User query: ${query}` },
    ],
    text: { format: zodTextFormat(ResponseSchema, "SearchResponse") },
    stream: true,
  });

  let textContent = "";
  for await (const event of stream) {
    if (event.type === "response.output_text.delta" && "delta" in event) {
      textContent += event.delta;
      if (onPartial) {
        const partial = parsePartialResponse(textContent);
        onPartial(partial);
      }
    }
  }

  let parsed;
  try {
    parsed = JSON.parse(textContent);
  } catch {
    throw new Error(`Failed to parse JSON response: ${textContent}`);
  }

  const validated = ResponseSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error(`Invalid response schema: ${validated.error.message}`);
  }

  return {
    summary: validated.data.summary,
    results: validated.data.results.map((r) => ({
      header: r.header,
      text: r.text,
      file_ids: r.file_ids,
    })),
    follow_ups: validated.data.follow_ups,
  };
}
