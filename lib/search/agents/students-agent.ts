/**
 * Students Agent (Sub-agent)
 *
 * Searches student profiles in the vector store.
 * Uses the attributes from file search results directly - no Supabase lookup needed!
 */
import { Agent, run, fileSearchTool } from "@openai/agents";
import OpenAI from "openai";
import type { AgentSearchResponse } from "./types";
import {
  extractRelevantFileIds,
  extractSearchResults,
} from "./utils/subagent-utils";

export class StudentsAgent {
  private agent: Agent;
  private vectorStoreId: string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_openai: OpenAI) {
    this.vectorStoreId = process.env.OPENAI_USER_VECTOR_STORE_ID!;

    this.agent = new Agent({
      name: "Students Search Specialist",
      model: "gpt-4o-mini",
      instructions: `You search student profiles in the Connect3 vector store.

Your job:
1. Use the file_search tool to find students
2. Review the results and select ONLY the most relevant ones
3. Respond with a list of the RELEVANT file IDs

Student profiles contain:
- Name, role, skills, projects, interests
- Education, experience, clubs they're in
- Subjects taken, hobbies, languages, certifications

If the query is too vague (e.g., "find good students"), indicate that more information is needed.

When evaluating relevance, consider:
- How well the student's skills match the query
- How well their interests/projects align
- How directly they relate to the search criteria

AFTER searching, respond with ONLY a JSON array of the relevant file IDs (format: file-XXXX...):
["file-abc123...", "file-def456..."]

Be selective! Only include students that are truly relevant to the query.
If no students are relevant, respond with: []`,
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

Search for students matching: ${query}

Use file_search to find relevant student profiles.
After reviewing results, respond with ONLY a JSON array of relevant file IDs (e.g. ["file-abc...", "file-def..."]).`;

    const result = await run(this.agent, searchPrompt);

    // Extract the relevant file IDs from the agent's response
    const relevantFileIds = extractRelevantFileIds(
      result.finalOutput,
      "StudentsAgent",
    );
    console.log(
      `[StudentsAgent] Agent selected ${relevantFileIds.size} relevant file IDs`,
    );

    // Extract results and filter to only relevant ones
    const searchResults = extractSearchResults(
      result.newItems,
      relevantFileIds,
      "user",
    );

    console.log(`[StudentsAgent] Found ${searchResults.length} results`);

    return { results: searchResults };
  }
}
