/**
 * Events Agent (Sub-agent)
 *
 * Searches event listings in the vector store.
 * Uses the attributes from file search results directly - no Supabase lookup needed!
 */
import { Agent, run, fileSearchTool } from "@openai/agents";
import OpenAI from "openai";
import type { AgentSearchResponse } from "./types";
import {
  extractRelevantFileIds,
  extractSearchResults,
} from "./utils/subagent-utils";

export class EventsAgent {
  private agent: Agent;
  private vectorStoreId: string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_openai: OpenAI) {
    this.vectorStoreId = process.env.OPENAI_EVENTS_VECTOR_STORE_ID!;

    this.agent = new Agent({
      name: "Events Search Specialist",
      model: "gpt-4o-mini",
      instructions: `You search event listings in the Connect3 vector store.

Your job:
1. Use the file_search tool to find events
2. Review the results and select ONLY the most relevant ones
3. Respond with a list of the RELEVANT file IDs

Event listings contain:
- Name, type, category
- Date, time, location
- Host organization
- Price, booking info
- Description, university

If the query is too vague (e.g., "show me events"), indicate that more information is needed.

When evaluating relevance, consider:
- Date relevance (upcoming events are usually preferred)
- Location relevance
- Category/type matches
- Host organization matches
- How well the event matches the user's query intent

AFTER searching, respond with ONLY a JSON array of the relevant file IDs (format: file-XXXX...):
["file-abc123...", "file-def456..."]

Be selective! Only include events that are truly relevant to the query.
If no events are relevant, respond with: []`,
      tools: [
        fileSearchTool([this.vectorStoreId], {
          maxNumResults: 10,
          includeSearchResults: true,
        }),
      ],
    });
  }

  async search(
    query: string,
    userContext: string,
  ): Promise<AgentSearchResponse> {
    const searchPrompt = `
User Context: ${userContext}

Search for events matching: ${query}

Use file_search to find relevant event listings.
After reviewing results, respond with ONLY a JSON array of relevant file IDs (e.g. ["file-abc...", "file-def..."]).`;

    const result = await run(this.agent, searchPrompt);

    // Extract the relevant file IDs from the agent's response
    const relevantFileIds = extractRelevantFileIds(
      result.finalOutput,
      "EventsAgent",
    );
    console.log(
      `[EventsAgent] Agent selected ${relevantFileIds.size} relevant file IDs`,
    );

    // Extract results and filter to only relevant ones
    const searchResults = extractSearchResults(
      result.newItems,
      relevantFileIds,
      "events",
    );

    console.log(`[EventsAgent] Found ${searchResults.length} results`);

    return { results: searchResults };
  }
}
