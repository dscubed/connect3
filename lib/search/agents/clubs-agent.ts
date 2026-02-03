/**
 * Clubs Agent (Sub-agent)
 *
 * Searches club/organization profiles in the vector store.
 * Uses the attributes from file search results directly - no Supabase lookup needed!
 */
import { Agent, run, fileSearchTool } from "@openai/agents";
import OpenAI from "openai";
import type { AgentSearchResponse, SearchResult } from "./types";

// Type for file search results with attributes
interface FileSearchResultWithAttributes {
  file_id: string;
  filename: string;
  score: number;
  text: string;
  attributes?: {
    id?: string;
    name?: string;
    type?: string;
  };
}

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

Your ONLY job:
1. Use the file_search tool to find relevant club/organization profiles
2. Be selective - only return strong matches

Club profiles contain:
- Name, description, focus areas
- Members count, activities
- Events they host, projects
- Roles/positions, recruitment info
- Affiliations, contact details

If the query is too vague (e.g., "show me clubs"), indicate that more information is needed.

When searching, focus on the most relevant aspects of the query.`,
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

Use file_search to find relevant club profiles.`;

    const result = await run(this.agent, searchPrompt);

    // Extract results directly from file_search response - no Supabase lookup needed!
    const searchResults = this.extractSearchResults(result);

    console.log(`[ClubsAgent] Found ${searchResults.length} results`);

    return { results: searchResults };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private extractSearchResults(agentResult: any): SearchResult[] {
    const results: SearchResult[] = [];
    const seenIds = new Set<string>();

    // Check newItems for file_search_call with results
    const newItems = agentResult.newItems || [];
    for (const item of newItems) {
      if ("rawItem" in item && item.rawItem) {
        const raw = item.rawItem;

        // Look for hosted_tool_call with file_search_call
        if (
          typeof raw === "object" &&
          raw !== null &&
          raw.type === "hosted_tool_call" &&
          raw.name === "file_search_call" &&
          raw.providerData?.results
        ) {
          const fileResults = raw.providerData
            .results as FileSearchResultWithAttributes[];

          for (const fileResult of fileResults) {
            // Use attributes.id as the entity ID
            const entityId = fileResult.attributes?.id;
            if (!entityId || seenIds.has(entityId)) continue;
            seenIds.add(entityId);

            // Build content with entity metadata at top
            const content = `ENTITY_ID: ${entityId}
ENTITY_TYPE: organisation
---
${fileResult.text}`;

            results.push({
              fileId: fileResult.file_id,
              content,
            });
          }
        }
      }
    }

    return results;
  }
}
