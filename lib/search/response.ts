import z from "zod";
import { AgentState, EntityResult, QueryResult, SearchResponse } from "./type";
import { OpenAI } from "openai";
import { zodTextFormat } from "openai/helpers/zod.mjs";

const formatEntitiesSummary = (entities: EntityResult[]): string => {
  if (entities.length === 0) {
    return "No entities were found.";
  }
  let summary = "Entities found:\n";
  for (const entity of entities) {
    summary += `ID: ${entity.id} (${entity.type}): ${entity.reason}\n`;
    for (const file of entity.relevantFiles) {
      summary += `\t-File ID: ${file.file_id}, Summary: ${file.summary}\n`;
    }
  }
  return summary;
};

const SearchResponseSchema = z.object({
  summary: z.string(),
  results: z.array(
    z.object({
      header: z.string().nullable(),
      text: z.string(),
      entity_ids: z.array(z.string()),
    })
  ),
  followUps: z.string(),
});

export const generateResponse = async (
  query: string,
  state: AgentState,
  openai: OpenAI
): Promise<SearchResponse> => {
  console.log("Generating response for user...");

  const prompt = `You are to summarise the search results for a user query. 
    
    Structure of JSON response:
    {{
        "summary": "A brief summary of the search results.",
        "results": [
            {{
                "header": "Optional header for this result section",
                "text": "Detailed text about this result section.",
                "entity_ids": [ // List ids of entities found in this section ]
            }}
        ],
        "followUps": "Suggested follow-up questions or actions for the user."
    }}

    Results should be ranked from most relevant to least relevant.
    Each separate result section should have a separation of concerns.
    Only use sections for complex queries with each section addressing a different part of the query.
    If the query is simple, return a single result section summarising all findings.
    `;
  const entities_summary = formatEntitiesSummary(state.entities);

  const response = await openai.responses.parse({
    model: "gpt-5-mini",
    reasoning: {
      effort: "low",
    },
    input: [
      { role: "system", content: prompt },
      { role: "system", content: `Context Summary: ${state.summary}` },
      { role: "system", content: `Entities Found: \n${entities_summary}` },
      { role: "user", content: `User Query: ${query}` },
    ],
    text: { format: zodTextFormat(SearchResponseSchema, "search_response") },
  });

  if (!response.output_parsed) {
    throw new Error("Failed to parse search response");
  }

  // Convert to SearchResposne format
  const searchResults: QueryResult[] = [];
  for (const result of response.output_parsed.results) {
    searchResults.push({
      header: result.header ?? undefined,
      text: result.text,
      matches: state.entities.filter((entity) =>
        result.entity_ids.includes(entity.id)
      ),
    });
  }
  return {
    summary: response.output_parsed.summary,
    results: searchResults,
    followUps: response.output_parsed.followUps,
  };
};
