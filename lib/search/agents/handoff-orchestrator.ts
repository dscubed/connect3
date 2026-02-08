/**
 * Handoff-Based Orchestrator Agent
 *
 * Uses the OpenAI Agents SDK handoff pattern for sequential sub-agent execution.
 *
 * Architecture:
 * - Orchestrator routes queries to sub-agents via handoffs
 * - Sub-agents ONLY perform search (no response generation)
 * - onHandoff callbacks just track, don't run agents manually
 * - Handoffs naturally run sub-agents
 * - After run completes, extract file_search results from ALL run items
 * - Use separate response agent for final synthesis
 */
import {
  Agent,
  handoff,
  run,
  tool,
  fileSearchTool,
  webSearchTool,
  RunResult,
} from "@openai/agents";
import { RECOMMENDED_PROMPT_PREFIX } from "@openai/agents-core/extensions";
import OpenAI from "openai";
import { z } from "zod";
import type {
  ConversationMessage,
  OrchestratorResponse,
  SearchResult,
  EntityType,
} from "./types";
import { HostedToolCallRawItem } from "./utils/subagent-utils";

// Minimal schema for handoffs (required when using onHandoff)
// All properties must be required for OpenAI function schemas
const HandoffInputSchema = z.object({});

export class HandoffOrchestrator {
  private openai: OpenAI;
  private userUniversity: string | null;

  // Agents
  private orchestratorAgent!: Agent;
  private responseAgent!: Agent;
  private studentsAgent!: Agent;
  private clubsAgent!: Agent;
  private eventsAgent!: Agent;
  private generalAgent!: Agent;

  // Track which agents were called (for result extraction)
  private calledAgents: Set<string> = new Set();

  constructor(openai: OpenAI, userUniversity?: string | null) {
    this.openai = openai;
    this.userUniversity = userUniversity ?? null;
    this.initializeAgents();
  }

  private initializeAgents(): void {
    this.createSubAgents();
    this.createOrchestrator();
    this.createResponseAgent();
  }

  private createSubAgents(): void {
    const studentsVectorStoreId = process.env.OPENAI_USER_VECTOR_STORE_ID!;
    const clubsVectorStoreId = process.env.OPENAI_ORG_VECTOR_STORE_ID!;
    const eventsVectorStoreId = process.env.OPENAI_EVENTS_VECTOR_STORE_ID!;

    // Sub-agents ONLY search - they handoff back to orchestrator when done
    // Their instructions tell them to just search and return file IDs

    this.studentsAgent = new Agent({
      name: "Students_Search",
      model: "gpt-4o-mini",
      instructions: `You are a student profile search agent. 
1. Use file_search to find relevant students
2. After search completes, respond with ONLY relevant file IDs as JSON: ["file-xxx", "file-yyy"]
3. If no results, respond with: []
DO NOT generate prose or explanations.`,
      tools: [
        fileSearchTool([studentsVectorStoreId], {
          maxNumResults: 10,
          includeSearchResults: true,
        }),
      ],
    });

    this.clubsAgent = new Agent({
      name: "Clubs_Search",
      model: "gpt-4o-mini",
      instructions: `You are a club/organization search agent.
1. Use file_search to find relevant clubs
2. After search completes, respond with ONLY relevant file IDs as JSON: ["file-xxx", "file-yyy"]
3. If no results, respond with: []
DO NOT generate prose or explanations.`,
      tools: [
        fileSearchTool([clubsVectorStoreId], {
          maxNumResults: 10,
          includeSearchResults: true,
        }),
      ],
    });

    this.eventsAgent = new Agent({
      name: "Events_Search",
      model: "gpt-4o-mini",
      instructions: `You are an event search agent.
1. Use file_search to find relevant events
2. After search completes, respond with ONLY relevant file IDs as JSON: ["file-xxx", "file-yyy"]
3. If no results, respond with: []
DO NOT generate prose or explanations.`,
      tools: [
        fileSearchTool([eventsVectorStoreId], {
          maxNumResults: 10,
          includeSearchResults: true,
        }),
      ],
    });

    // General agent - uses web search
    this.generalAgent = new Agent({
      name: "General_Search",
      model: "gpt-4o-mini",
      instructions: `You are a university knowledge search agent.
1. Use web_search to find relevant information about universities, policies, dates, etc.
2. After searching, provide a brief summary of what you found
3. Focus on factual information like dates, policies, requirements

Be helpful and find the most relevant information for the user's question.`,
      tools: [webSearchTool()],
    });
  }

  private createOrchestrator(): void {
    // Tool to plan which agents to call
    const planTool = tool({
      name: "plan_search",
      description: "Decide which search agents to call for this query",
      parameters: z.object({
        agents: z.array(z.enum(["students", "clubs", "events", "general"])),
      }),
      execute: async (params) => {
        console.log("[Orchestrator] Planning to call:", params.agents);
        return { planned: params.agents };
      },
    });

    // Create handoffs - onHandoff just tracks, doesn't run manually
    // Handoffs automatically inherit conversation context
    const studentsHandoff = handoff(this.studentsAgent, {
      toolNameOverride: "search_students",
      toolDescriptionOverride:
        "Search for PEOPLE - students, club members, officers, directors, anyone with a role.",
      inputType: HandoffInputSchema,
      onHandoff: () => {
        console.log("[Orchestrator] Handing off to students agent");
        this.calledAgents.add("students");
      },
    });

    const clubsHandoff = handoff(this.clubsAgent, {
      toolNameOverride: "search_clubs",
      toolDescriptionOverride:
        "Search for ORGANIZATIONS - clubs, societies, groups (not people in them).",
      inputType: HandoffInputSchema,
      onHandoff: () => {
        console.log("[Orchestrator] Handing off to clubs agent");
        this.calledAgents.add("clubs");
      },
    });

    const eventsHandoff = handoff(this.eventsAgent, {
      toolNameOverride: "search_events",
      toolDescriptionOverride:
        "Search for EVENTS - workshops, hackathons, meetups, talks.",
      inputType: HandoffInputSchema,
      onHandoff: () => {
        console.log("[Orchestrator] Handing off to events agent");
        this.calledAgents.add("events");
      },
    });

    const generalHandoff = handoff(this.generalAgent, {
      toolNameOverride: "search_general",
      toolDescriptionOverride:
        "Search for university INFO - policies, dates, requirements, general knowledge.",
      inputType: HandoffInputSchema,
      onHandoff: () => {
        console.log("[Orchestrator] Handing off to general agent");
        this.calledAgents.add("general");
      },
    });

    // Orchestrator with handoffs to sub-agents
    // Sub-agents need to handoff BACK to orchestrator
    this.orchestratorAgent = Agent.create({
      name: "Connect3_Orchestrator",
      model: "gpt-4o-mini",
      tools: [planTool],
      handoffs: [studentsHandoff, clubsHandoff, eventsHandoff, generalHandoff],
      instructions: `${RECOMMENDED_PROMPT_PREFIX}
You are the Connect3 search orchestrator.

WORKFLOW:
1. Use plan_search to decide which agents to call
2. Hand off to EACH required agent with the query and userContext
3. After all handoffs, say "SEARCH_COMPLETE"

ROUTING:
- students: Find PEOPLE - anyone by name, role, skills (e.g. "IT director", "president", "John")
- clubs: Find ORGANIZATIONS/CLUBS themselves (not people in them)
- events: Find events, workshops, hackathons
- general: University info, policies, dates

EXAMPLES:
- "who is the IT director at DSCubed" → students (looking for a PERSON with a role)
- "what is DSCubed" → clubs (looking for info about the ORG)
- "DSCubed events" → events

IMPORTANT:
- Execute handoffs SEQUENTIALLY (one at a time)
- After ALL handoffs done, respond with ONLY: SEARCH_COMPLETE

DO NOT generate user-facing responses. Just orchestrate searches.`,
    });
  }

  private createResponseAgent(): void {
    this.responseAgent = new Agent({
      name: "Connect3_Response_Generator",
      model: "gpt-4o-mini",
      instructions: `You generate conversational responses for Connect3 search results.

ABSOLUTE RULES FOR MARKERS:

1. ONLY copy markers that ALREADY EXIST in the Search Results section below
2. Markers have format: @@@type:id@@@ (three @ signs on each side)
3. If Search Results has ZERO @@@ markers, your response has ZERO @@@ markers
4. NEVER invent, create, or generate new markers

HOW TO HANDLE RESULTS:
- If a result starts with @@@ → it's an entity. Copy that exact marker after describing it.
- If a result has NO @@@ → it's general info. Just summarize it. NO markers.

BE CONCISE: 2-4 sentences per result. Pick the most relevant matches.`,
    });
  }

  /**
   * Extract all file search results from run items
   */
  private extractResultsFromRun(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    runResult: RunResult<any, any>,
  ): SearchResult[] {
    const results: SearchResult[] = [];
    const seenFileIds = new Set<string>();

    // Helper to determine entity type from agent name
    const getEntityType = (agentName: string): EntityType | "general" => {
      if (agentName.includes("Students")) return "user";
      if (agentName.includes("Clubs")) return "organisation";
      if (agentName.includes("Events")) return "events";
      return "general";
    };

    // Track current agent context
    let currentAgent = "Orchestrator";

    // Debug: log all item types we receive
    console.log(
      "[Orchestrator] Run items received:",
      runResult.newItems.map((i) => ({
        type: i.type,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rawType: (i as any).rawItem?.type,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rawName: (i as any).rawItem?.name,
      })),
    );

    // Process all items including nested ones from handoffs
    for (const item of runResult.newItems) {
      // Track agent transitions via handoff items
      if (item.type === "handoff_call_item" && "rawItem" in item) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawItem = item.rawItem as any;
        if (rawItem?.name) {
          const handoffName = rawItem.name as string;
          if (handoffName.includes("students")) currentAgent = "Students";
          if (handoffName.includes("clubs")) currentAgent = "Clubs";
          if (handoffName.includes("events")) currentAgent = "Events";
          if (handoffName.includes("general")) currentAgent = "General";
        }
      }

      // Extract file search results
      if ("rawItem" in item && item.rawItem) {
        const raw = item.rawItem as HostedToolCallRawItem;

        if (
          raw.type === "hosted_tool_call" &&
          raw.name === "file_search_call" &&
          raw.providerData?.results
        ) {
          const entityType = getEntityType(currentAgent);
          const fileResults = raw.providerData.results;

          for (const fileResult of fileResults) {
            const fileId = fileResult.file_id;
            if (!fileId || seenFileIds.has(fileId)) continue;
            seenFileIds.add(fileId);

            const entityId = fileResult.attributes?.id;

            // Build content based on type
            let content: string;
            if (entityType === "general") {
              // General KB content - no entity markers
              content = fileResult.text;
            } else {
              // Entity content - include marker at top for easy copying
              content = `@@@${entityType}:${entityId || fileId}@@@
${fileResult.text}`;
            }

            results.push({ fileId, content });
          }
        }

        // Also handle web search results - check multiple possible names/formats
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawAny = item.rawItem as any;

        // Web search can have different names
        const isWebSearch =
          rawAny.type === "hosted_tool_call" &&
          (rawAny.name === "web_search_preview" ||
            rawAny.name === "web_search" ||
            rawAny.name?.includes("web"));

        if (isWebSearch && rawAny.output) {
          console.log("[Orchestrator] Found web search result:", rawAny.name);
          results.push({
            fileId: `web_${Date.now()}`,
            // Web search - no entity markers, just content
            content: rawAny.output,
          });
        }
      }

      // Also capture message outputs from general agent (the agent's response text)
      if (item.type === "message_output_item" && currentAgent === "General") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawItem = item.rawItem as any;
        const content = rawItem?.content;
        if (Array.isArray(content)) {
          for (const part of content) {
            if (part.type === "output_text" && part.text) {
              console.log("[Orchestrator] Found general agent text output");
              results.push({
                fileId: `general_${Date.now()}`,
                // General content - no entity markers, just content
                content: part.text,
              });
            }
          }
        }
      }
    }

    console.log(`[Orchestrator] Extracted ${results.length} results from run`);
    return results;
  }

  /**
   * Main entry point
   */
  async run(
    query: string,
    userContext: string,
    conversationHistory: ConversationMessage[],
    onChunk?: (chunk: string) => void,
  ): Promise<OrchestratorResponse> {
    // Reset state
    this.calledAgents.clear();

    const historyText = conversationHistory
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");

    // Phase 1: Run orchestrator to trigger handoffs
    const searchPrompt = `User Context: ${userContext}

Conversation History:
${historyText}

User Query: ${query}

Use plan_search to decide which agents to call, then hand off to each one.`;

    console.log("[Orchestrator] Phase 1 - Starting search:", query);

    const searchResult = await run(this.orchestratorAgent, searchPrompt);

    console.log("[Orchestrator] Search phase complete. Called agents:", [
      ...this.calledAgents,
    ]);

    // Phase 2: Extract results from the run
    const collectedResults = this.extractResultsFromRun(searchResult);

    console.log(
      `[Orchestrator] Phase 2 - Collected ${collectedResults.length} results`,
    );

    // Phase 3: Generate response
    const resultsText =
      collectedResults.length > 0
        ? collectedResults.map((r) => r.content).join("\n\n---\n\n")
        : "No results found.";

    // Check if any results contain entity markers
    const hasEntityMarkers = resultsText.includes("@@@");

    const markerInstruction = hasEntityMarkers
      ? "Some results contain entity markers (@@@type:id@@@). Copy those EXACT markers after describing each entity."
      : "These results are general information. Do NOT add any @@@ markers to your response.";

    const responsePrompt = `User Context: ${userContext}

Conversation History:
${historyText}

User Query: ${query}

Search Results:
${resultsText}

IMPORTANT: ${markerInstruction}

Generate a helpful, concise response based on the search results above.`;

    console.log("[Orchestrator] Phase 3 - Generating response");

    if (onChunk) {
      const result = await run(this.responseAgent, responsePrompt, {
        stream: true,
      });
      let fullOutput = "";

      for await (const chunk of result.toTextStream()) {
        fullOutput += chunk;
        onChunk(chunk);
      }

      return { markdown: fullOutput };
    }

    const result = await run(this.responseAgent, responsePrompt);
    return {
      markdown: result.finalOutput ?? "I couldn't generate a response.",
    };
  }
}
