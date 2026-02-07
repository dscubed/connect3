/**
 * General Agent (Sub-agent)
 *
 * Searches university knowledge base (scraped university info) and web.
 * Returns raw search results to orchestrator for consistent response generation.
 */
import { Agent, run, fileSearchTool, webSearchTool } from "@openai/agents";
import OpenAI from "openai";
import type { AgentSearchResponse } from "./types";
import { SUPPORTED_UNIVERSITIES, type UniversitySlug } from "../general/router";
import {
  extractRelevantFileIds,
  extractGeneralSearchResults,
  extractWebSearchResults,
} from "./utils/subagent-utils";

export class GeneralAgent {
  private openai: OpenAI;
  private userUniversity: string | null;

  constructor(openai: OpenAI, userUniversity?: string | null) {
    this.openai = openai;
    this.userUniversity = userUniversity ?? null;
  }

  /**
   * Detect university from query or user context using Responses API
   */
  private async detectUniversity(
    query: string,
    userContext: string,
  ): Promise<UniversitySlug | null> {
    const userUniHint = this.userUniversity
      ? `User's university: ${this.userUniversity}`
      : "";

    const classificationPrompt = `Analyze this query and context to determine if it targets a specific Australian university.

Query: ${query}
Context: ${userContext}
${userUniHint}

Universities to detect:
- University of Melbourne (unimelb, melb uni) → "unimelb"
- Monash University → "monash"
- RMIT University → "rmit"
- University of Western Australia (UWA) → "uwa"

Rules:
- If the query explicitly mentions a university, return that code
- If the query is generic BUT user's university is known, return user's university code
- If truly ambiguous with no university context, return "none"

Respond with ONLY the code: unimelb, monash, rmit, uwa, or none`;

    try {
      // Use Responses API instead of completions
      const response = await this.openai.responses.create({
        model: "gpt-4o-mini",
        input: classificationPrompt,
        max_output_tokens: 10,
        temperature: 0,
      });

      const result = response.output_text?.trim().toLowerCase();

      if (result && result !== "none") {
        const validSlugs: UniversitySlug[] = [
          "unimelb",
          "monash",
          "rmit",
          "uwa",
        ];
        if (validSlugs.includes(result as UniversitySlug)) {
          console.log(`[GeneralAgent] Detected university: ${result}`);
          return result as UniversitySlug;
        }
      }

      return null;
    } catch (err) {
      console.error("[GeneralAgent] University detection failed:", err);
      // Fallback to simple user context check
      if (this.userUniversity) {
        const uniLower = this.userUniversity.toLowerCase();
        for (const [slug, data] of Object.entries(SUPPORTED_UNIVERSITIES)) {
          if (uniLower.includes(data.name.toLowerCase())) {
            return slug as UniversitySlug;
          }
        }
      }
      return null;
    }
  }

  async search(
    query: string,
    userContext: string,
  ): Promise<AgentSearchResponse> {
    const university = await this.detectUniversity(query, userContext);

    // If we have a university KB, use file search
    if (university && SUPPORTED_UNIVERSITIES[university]) {
      const uniConfig = SUPPORTED_UNIVERSITIES[university];
      const vectorStoreIds: string[] = [];

      if (uniConfig.official) vectorStoreIds.push(uniConfig.official);
      if (uniConfig.union) vectorStoreIds.push(uniConfig.union);

      if (vectorStoreIds.length > 0) {
        return this.searchKnowledgeBase(query, userContext, vectorStoreIds);
      }
    }

    // Fall back to web search
    return this.searchWeb(query, userContext);
  }

  private async searchKnowledgeBase(
    query: string,
    userContext: string,
    vectorStoreIds: string[],
  ): Promise<AgentSearchResponse> {
    const agent = new Agent({
      name: "University KB Specialist",
      model: "gpt-4o-mini",
      instructions: `You search the university knowledge base to find relevant information.

Your job:
1. Use file_search to find relevant information
2. Review the results and select ONLY the most relevant ones
3. Respond with a list of the RELEVANT file IDs

Topics in the knowledge base:
- Census dates, academic calendar
- Enrollment, course selection
- Special consideration, academic policies
- Campus services, facilities
- Student support services

AFTER searching, respond with ONLY a JSON array of the relevant file IDs (format: file-XXXX...):
["file-abc123...", "file-def456..."]

Be selective! Only include documents that are truly relevant to the query.
If no documents are relevant, respond with: []`,
      tools: [
        fileSearchTool(vectorStoreIds, {
          maxNumResults: 10,
          includeSearchResults: true,
        }),
      ],
    });

    const searchPrompt = `
User Context: ${userContext}

Question: ${query}

Search the knowledge base to find relevant information.
After reviewing results, respond with ONLY a JSON array of relevant file IDs (e.g. ["file-abc...", "file-def..."]).`;

    const result = await run(agent, searchPrompt);

    // Extract the relevant file IDs from the agent's response
    const relevantFileIds = extractRelevantFileIds(
      result.finalOutput,
      "GeneralAgent",
    );
    console.log(
      `[GeneralAgent] Agent selected ${relevantFileIds.size} relevant file IDs`,
    );

    // Extract results and filter to only relevant ones
    const searchResults = extractGeneralSearchResults(
      result.newItems,
      relevantFileIds,
      "kb",
    );

    console.log(`[GeneralAgent] Found ${searchResults.length} KB results`);

    return { results: searchResults };
  }

  private async searchWeb(
    query: string,
    userContext: string,
  ): Promise<AgentSearchResponse> {
    const agent = new Agent({
      name: "Web Search Specialist",
      model: "gpt-4o-mini",
      instructions: `You search the web to find relevant information.

Your job:
1. Use web_search to find relevant information
2. Return the search results

Be thorough in your search to find helpful information.`,
      tools: [webSearchTool()],
    });

    const searchPrompt = `
User Context: ${userContext}

Question: ${query}

Search the web to find relevant information.`;

    const result = await run(agent, searchPrompt);

    // Extract web search results
    const searchResults = extractWebSearchResults(result.newItems);

    // If no structured results, fall back to final output
    if (searchResults.length === 0 && result.finalOutput) {
      searchResults.push({
        fileId: `web_${Date.now()}`,
        content: `CONTENT_TYPE: general
SOURCE: web
---
${result.finalOutput}`,
      });
    }

    console.log(`[GeneralAgent] Found ${searchResults.length} web results`);

    return { results: searchResults };
  }
}
