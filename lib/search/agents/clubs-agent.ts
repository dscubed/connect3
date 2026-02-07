/**
 * Clubs Agent (Sub-agent)
 *
 * Searches club/organization profiles in the vector store.
 * Uses the attributes from file search results directly - no Supabase lookup needed!
 */
import { Agent, run, fileSearchTool } from "@openai/agents";
import OpenAI from "openai";
import type { AgentSearchResponse } from "./types";
import {
  extractRelevantFileIds,
  extractSearchResults,
} from "./utils/subagent-utils";

export class ClubsAgent {
  private agent: Agent;
  private vectorStoreId: string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_openai: OpenAI) {
    this.vectorStoreId = process.env.OPENAI_ORG_VECTOR_STORE_ID!;

    this.agent = new Agent({
      name: "Clubs Search Specialist",
      model: "gpt-4o-mini",
      instructions: `You search club and organization profiles in the Connect3 vector store.

Your job:
1. Use the file_search tool to find clubs/organizations
2. Review the results and select ONLY the most relevant ones
3. Respond with a list of the RELEVANT file IDs

Club profiles contain:
- Name, description, focus areas
- Members count, activities
- Events they host, projects
- Roles/positions, recruitment info
- Affiliations, contact details

If the query is too vague (e.g., "show me clubs"), indicate that more information is needed.

When evaluating relevance, consider:
- How well the club's focus areas match the query
- How their activities/events align with what's being searched
- How directly they relate to the search criteria

AFTER searching, respond with ONLY a JSON array of the relevant file IDs (format: file-XXXX...):
["file-abc123...", "file-def456..."]

Be selective! Only include clubs that are truly relevant to the query.
If no clubs are relevant, respond with: []`,
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

Search for clubs/organizations matching: ${query}

Use file_search to find relevant club profiles.
After reviewing results, respond with ONLY a JSON array of relevant file IDs (e.g. ["file-abc...", "file-def..."]).`;

    const result = await run(this.agent, searchPrompt);

    // Extract the relevant file IDs from the agent's response
    const relevantFileIds = extractRelevantFileIds(
      result.finalOutput,
      "ClubsAgent",
    );
    console.log(
      `[ClubsAgent] Agent selected ${relevantFileIds.size} relevant file IDs`,
    );

    // Extract results and filter to only relevant ones
    const searchResults = extractSearchResults(
      result.newItems,
      relevantFileIds,
      "organisation",
    );

    console.log(`[ClubsAgent] Found ${searchResults.length} results`);

    return { results: searchResults };
  }
}
