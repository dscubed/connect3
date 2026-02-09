/**
 * Handoff-Based Orchestrator Agent
 *
 * Uses the OpenAI Agents SDK handoff pattern for sequential sub-agent execution.
 *
 * Architecture:
 * - Orchestrator routes queries to sub-agents via handoffs
 * - Sub-agents search AND generate responses directly (no separate response step)
 * - Entity markers (@@@type:id@@@) are already at the top of each file in the vector store
 * - Sub-agents just need to include them in their response
 * - General agent uses web search and has NO entity markers
 */
import {
  Agent,
  handoff,
  run,
  tool,
  fileSearchTool,
  webSearchTool,
} from "@openai/agents";
import { RECOMMENDED_PROMPT_PREFIX } from "@openai/agents-core/extensions";
import OpenAI from "openai";
import { z } from "zod";
import type { ConversationMessage, OrchestratorResponse } from "./types";

// Minimal schema for handoffs (required when using onHandoff)
const HandoffInputSchema = z.object({});

// Shared response instructions for entity agents (students, clubs, events)
const ENTITY_RESPONSE_INSTRUCTIONS = `
RESPONSE FORMAT:
- Be concise: 2-4 sentences per entity
- Pick the 1-3 most relevant matches
- Each file in file_search results starts with a marker on the first line: @@@type:uuid@@@
- After describing each entity, place its marker on a NEW LINE immediately after
- NEVER announce or label the marker (wrong: "Here is the marker:", right: just put it on its own line)
- ONLY use markers found in the actual file_search results. NEVER invent or fabricate markers.
- If a file has no @@@ marker, do NOT create one

CORRECT example output format:
Michael is a Computing student with skills in React and TypeScript.
@@@user:6789c9fd-3fb4-4037-8383-0345dfc1d789@@@

DSCubed is a data science community with over 500 members.
@@@organisation:0f1a9639-7d9a-4584-a470-03ff95a9f8f4@@@

WRONG (never do these):
- "Here is the marker: @@@user:...@@@"
- "Relevant markers: @@@..."
- @@@event_some_filename.txt@@@ (this is a filename, not a marker)
- Making up UUIDs that don't exist in results

CONVERSATION STYLE:
- Be friendly and conversational
- After showing results, ask a follow-up question to keep the conversation going
  (e.g. "Would you like to know more about their projects?" or "Want me to find similar clubs?")
- If search results are poor or irrelevant, ask a clarifying question instead of showing bad results
  (e.g. "I couldn't find an exact match. Could you tell me more about what you're looking for?")`;

export class HandoffOrchestrator {
  private openai: OpenAI;
  private userUniversity: string | null;

  // Agents
  private orchestratorAgent!: Agent;
  private studentsAgent!: Agent;
  private clubsAgent!: Agent;
  private eventsAgent!: Agent;
  private generalAgent!: Agent;

  // Track which agents were called
  private calledAgents: Set<string> = new Set();

  constructor(openai: OpenAI, userUniversity?: string | null) {
    this.openai = openai;
    this.userUniversity = userUniversity ?? null;
    this.initializeAgents();
  }

  private initializeAgents(): void {
    this.createSubAgents();
    this.createOrchestrator();
  }

  private createSubAgents(): void {
    const studentsVectorStoreId = process.env.OPENAI_USER_VECTOR_STORE_ID!;
    const clubsVectorStoreId = process.env.OPENAI_ORG_VECTOR_STORE_ID!;
    const eventsVectorStoreId = process.env.OPENAI_EVENTS_VECTOR_STORE_ID!;

    this.studentsAgent = new Agent({
      name: "Students_Agent",
      model: "gpt-4o-mini",
      instructions: `You search for and describe student profiles on Connect3.
1. Use file_search to find relevant students matching the query.
2. Generate a helpful response describing the best matches.
${ENTITY_RESPONSE_INSTRUCTIONS}`,
      tools: [
        fileSearchTool([studentsVectorStoreId], {
          maxNumResults: 10,
          includeSearchResults: true,
        }),
      ],
    });

    this.clubsAgent = new Agent({
      name: "Clubs_Agent",
      model: "gpt-4o-mini",
      instructions: `You search for and describe clubs/organizations on Connect3.
1. Use file_search to find relevant clubs matching the query.
2. Generate a helpful response describing the best matches.
${ENTITY_RESPONSE_INSTRUCTIONS}`,
      tools: [
        fileSearchTool([clubsVectorStoreId], {
          maxNumResults: 10,
          includeSearchResults: true,
        }),
      ],
    });

    this.eventsAgent = new Agent({
      name: "Events_Agent",
      model: "gpt-4o-mini",
      instructions: `You search for and describe events on Connect3.
1. Use file_search to find relevant events matching the query.
2. Generate a helpful response describing the best matches.

RESPONSE FORMAT:
- Be concise: 2-4 sentences per event
- Pick the 1-3 most relevant matches
- Events may or may not have @@@events:uuid@@@ markers at the top of the file
- If a marker exists, include it on a new line after describing that event
- If NO marker exists in the file, do NOT create or invent one
- NEVER use filenames as markers
- If no relevant results found, ask a clarifying question instead of showing bad results
- Be friendly and conversational. After showing results, ask a follow-up question.`,
      tools: [
        fileSearchTool([eventsVectorStoreId], {
          maxNumResults: 10,
          includeSearchResults: true,
        }),
      ],
    });

    this.generalAgent = new Agent({
      name: "General_Agent",
      model: "gpt-4o-mini",
      instructions: `You search for general university information using web search.
1. Use web_search to find relevant information about universities, policies, dates, etc.
2. Generate a helpful, concise response summarizing what you found.
3. Focus on factual information like dates, policies, requirements.
4. Be friendly and conversational. After answering, ask if they need more details.
5. If results are poor, ask a clarifying question instead of guessing.

IMPORTANT: Do NOT include any @@@ markers in your response. You deal with general info only.`,
      tools: [webSearchTool()],
    });
  }

  private createOrchestrator(): void {
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

    this.orchestratorAgent = Agent.create({
      name: "Connect3_Orchestrator",
      model: "gpt-4o-mini",
      tools: [planTool],
      handoffs: [studentsHandoff, clubsHandoff, eventsHandoff, generalHandoff],
      instructions: `${RECOMMENDED_PROMPT_PREFIX}
You are the Connect3 search orchestrator. You help users find people, clubs, events, and info.

STEP 1 - EVALUATE THE QUERY:
Before searching, decide if the query is clear enough to search.
- If the query is VAGUE or UNCLEAR (e.g. "help me", "I need something", "find stuff"):
  → Do NOT search. Instead, respond with a friendly clarifying question to understand what the user needs.
  → Ask about: what they're looking for (people, clubs, events?), specific interests, skills, etc.
- If the query is CLEAR enough to search → proceed to Step 2.

STEP 2 - SEARCH:
1. Use plan_search to decide which agents to call
2. Hand off to EACH required agent
3. The sub-agent will search and generate a response directly

ROUTING:
- students: Find PEOPLE - anyone by name, role, skills (e.g. "IT director", "president", "John")
- clubs: Find ORGANIZATIONS/CLUBS themselves (not people in them)
- events: Find events, workshops, hackathons
- general: University info, policies, dates

EXAMPLES:
- "who is the IT director at DSCubed" → students (looking for a PERSON with a role)
- "what is DSCubed" → clubs (looking for info about the ORG)
- "DSCubed events" → events
- "I want to get involved" → clarify: "What are you interested in? Are you looking for clubs to join, events to attend, or people to connect with?"

IMPORTANT:
- Execute handoffs SEQUENTIALLY (one at a time)
- Be conversational and friendly when asking clarifying questions.`,
    });
  }

  /**
   * Main entry point - single phase: orchestrator hands off, sub-agent responds
   */
  async run(
    query: string,
    userContext: string,
    conversationHistory: ConversationMessage[],
    onChunk?: (chunk: string) => void,
  ): Promise<OrchestratorResponse> {
    this.calledAgents.clear();

    // Build proper message input for the agent (AgentInputItem format)
    const messages: Array<
      | { role: "user"; content: string }
      | {
          role: "assistant";
          status: "completed";
          content: { type: "output_text"; text: string }[];
        }
    > = [];

    // Add conversation history as proper role-based messages
    for (const msg of conversationHistory) {
      if (msg.role === "user") {
        messages.push({ role: "user", content: msg.content });
      } else {
        messages.push({
          role: "assistant",
          status: "completed",
          content: [{ type: "output_text", text: msg.content }],
        });
      }
    }

    // Add current query with user context
    const currentMessage = `User Context: ${userContext}

User Query: ${query}

Use plan_search to decide which agents to call, then hand off to each one.`;
    messages.push({ role: "user", content: currentMessage });

    console.log("[Orchestrator] Starting search:", query);

    if (onChunk) {
      const result = await run(this.orchestratorAgent, messages, {
        stream: true,
      });
      let fullOutput = "";

      for await (const chunk of result.toTextStream()) {
        fullOutput += chunk;
        onChunk(chunk);
      }

      console.log("[Orchestrator] Complete. Called agents:", [
        ...this.calledAgents,
      ]);

      return { markdown: fullOutput };
    }

    const result = await run(this.orchestratorAgent, messages);

    console.log("[Orchestrator] Complete. Called agents:", [
      ...this.calledAgents,
    ]);

    return {
      markdown: result.finalOutput ?? "I couldn't generate a response.",
    };
  }
}
