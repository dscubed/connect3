/**
 * General Agent (Sub-agent)
 *
 * Searches university knowledge base (scraped university info).
 * NO entity markers needed - returns informational content.
 */
import { Agent, run, fileSearchTool, webSearchTool } from "@openai/agents";
import OpenAI from "openai";
import type { AgentSearchResponse } from "./types";
import { SUPPORTED_UNIVERSITIES, type UniversitySlug } from "../general/router";

export class GeneralAgent {
  private openai: OpenAI;
  private userUniversity: string | null;

  constructor(openai: OpenAI, userUniversity?: string | null) {
    this.openai = openai;
    this.userUniversity = userUniversity ?? null;
  }

  /**
   * Detect university from query or user context using LLM classification
   */
  private async detectUniversity(
    query: string,
    userContext: string,
  ): Promise<UniversitySlug | null> {
    // First check user's university context as a hint
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
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: classificationPrompt }],
        max_tokens: 10,
        temperature: 0,
      });

      const result = completion.choices[0]?.message?.content
        ?.trim()
        .toLowerCase();

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
      instructions: `You search the university knowledge base to answer questions.

Your job:
1. Use file_search to find relevant information
2. Look for official university information
3. Student union/guild information

Topics you can help with:
- Census dates, academic calendar
- Enrollment, course selection
- Special consideration, academic policies
- Campus services, facilities
- Student support services

Provide factual answers based on what you find.`,
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

Search the knowledge base to find relevant information.`;

    const result = await run(agent, searchPrompt);

    // For general queries, we return the agent's response as content
    // No entity markers needed
    return {
      results: [
        {
          fileId: "kb_result",
          content: result.finalOutput ?? "No information found.",
        },
      ],
    };
  }

  private async searchWeb(
    query: string,
    userContext: string,
  ): Promise<AgentSearchResponse> {
    const agent = new Agent({
      name: "Web Search Specialist",
      model: "gpt-4o-mini",
      instructions: `You search the web to answer general questions.

Your job:
1. Use web_search to find relevant information
2. Provide accurate, helpful answers
3. Cite sources when possible

Be concise and factual.`,
      tools: [webSearchTool()],
    });

    const searchPrompt = `
User Context: ${userContext}

Question: ${query}

Search the web to find relevant information.`;

    const result = await run(agent, searchPrompt);

    return {
      results: [
        {
          fileId: "web_result",
          content: result.finalOutput ?? "No information found.",
        },
      ],
    };
  }
}
