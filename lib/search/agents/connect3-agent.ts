/**
 * Connect3 Agent — single agent with tools
 *
 * One LLM call with search tools + web_search + utility tools.
 * No handoffs, no sub-agents, no orchestrator.
 */
import { Agent, run, webSearchTool, tool } from "@openai/agents";
import OpenAI from "openai";
import { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { getFileText } from "@/lib/users/getFileText";
import type { ConversationMessage, OrchestratorResponse } from "./types";

// Helper: search a vector store and return JSON
async function searchVectorStore(
  openai: OpenAI,
  vectorStoreId: string,
  query: string,
  label: string,
): Promise<string> {
  console.log(`[${label}] Searching for:`, query);
  try {
    const results = await openai.vectorStores.search(vectorStoreId, {
      query,
      max_num_results: 10,
      rewrite_query: true,
    });
    if (results.data.length === 0) {
      console.log(`[${label}] Found 0 results`);
      return JSON.stringify({
        results: [],
        message: "No matching results found.",
      });
    }
    const items = results.data.map((r) => {
      const text = r.content.map((c) => c.text).join("\n");
      const markerMatch = text.match(/@@@(\w+):([a-f0-9-]+)@@@/);
      return {
        marker: markerMatch ? markerMatch[0] : null,
        type: markerMatch ? markerMatch[1] : null,
        entityId: markerMatch ? markerMatch[2] : null,
        score: Math.round(r.score * 1000) / 1000,
        content: text,
      };
    });
    console.log(`[${label}] Found ${results.data.length} results`);
    return JSON.stringify({ results: items });
  } catch (err) {
    console.error(`[${label}] Error:`, err);
    return JSON.stringify({
      results: [],
      message: `Search failed: ${String(err)}`,
    });
  }
}

export class Connect3Agent {
  private openai: OpenAI;
  private supabase: SupabaseClient;
  private userUniversity: string | null;
  private userId: string;
  private agent!: Agent;

  constructor(
    openai: OpenAI,
    supabase: SupabaseClient,
    userUniversity?: string | null,
    userId?: string,
  ) {
    this.openai = openai;
    this.supabase = supabase;
    this.userUniversity = userUniversity ?? null;
    this.userId = userId ?? "";
    this.createAgent();
  }

  private createAgent(): void {
    const studentsVectorStoreId = process.env.OPENAI_USER_VECTOR_STORE_ID!;
    const clubsVectorStoreId = process.env.OPENAI_ORG_VECTOR_STORE_ID!;
    const eventsVectorStoreId = process.env.OPENAI_EVENTS_VECTOR_STORE_ID!;

    const openai = this.openai;
    const supabase = this.supabase;
    const currentUserId = this.userId;

    const getCurrentDate = tool({
      name: "get_current_date",
      description: "Get the current date and time.",
      parameters: z.object({}),
      execute: async () => ({
        date: new Date().toISOString(),
        timezone: "UTC",
      }),
    });

    const getMyProfile = tool({
      name: "get_my_profile",
      description:
        "Get the current user's full profile including their skills, interests, university, and background. Use this to understand who the user is so you can give personalized recommendations.",
      parameters: z.object({}),
      execute: async () => {
        if (!currentUserId)
          return JSON.stringify({
            profile: null,
            message: "No user ID available.",
          });
        try {
          console.log("[get_my_profile] Fetching profile for:", currentUserId);
          const text = await getFileText(currentUserId, supabase);
          return JSON.stringify({ profile: text });
        } catch (err) {
          console.error("[get_my_profile] Error:", err);
          return JSON.stringify({
            profile: null,
            message: "User has not set up their profile yet.",
          });
        }
      },
    });

    const searchUsers = tool({
      name: "search_users",
      description:
        "Search for students and people by skills, interests, name, or background.",
      parameters: z.object({
        query: z.string().describe("The search query for people/students"),
      }),
      execute: async ({ query }) =>
        searchVectorStore(openai, studentsVectorStoreId, query, "search_users"),
    });

    const searchClubs = tool({
      name: "search_clubs",
      description: "Search for clubs, societies, and student organizations.",
      parameters: z.object({
        query: z.string().describe("The search query for clubs/organizations"),
      }),
      execute: async ({ query }) =>
        searchVectorStore(openai, clubsVectorStoreId, query, "search_clubs"),
    });

    const searchEvents = tool({
      name: "search_events",
      description:
        "Search for events, hackathons, workshops, career fairs, socials, and activities.",
      parameters: z.object({
        query: z.string().describe("The search query for events"),
      }),
      execute: async ({ query }) =>
        searchVectorStore(openai, eventsVectorStoreId, query, "search_events"),
    });

    this.agent = new Agent({
      name: "Connect3_Agent",
      model: "gpt-5-mini",
      tools: [
        searchUsers,
        searchClubs,
        searchEvents,
        getMyProfile,
        webSearchTool(),
        getCurrentDate,
      ],
      instructions: `You are Connect3, a friendly chatbot that helps university students find people, clubs, and events.

You are NOT a general assistant, tutor, or life coach. Your job is to SEARCH and CONNECT students with the right people, clubs, and events. Do not give study tips, career advice, or general guidance.

UNIVERSITY — MANDATORY:
- You MUST know the user's university before searching. Check the user context for university info.
- If their university is unknown, your FIRST response must ask: "Which university are you at?"
- Do NOT search or give results until you know the university.

CONVERSATION FLOW FOR VAGUE QUERIES:
- If the query is vague ("I'm struggling", "I want to meet people", "help me find my people"), ask 1-2 SHORT clarifying questions. Do not search yet.
- Keep clarifying responses SHORT: 2-3 sentences max. No bullet-point advice dumps.
- Once you understand what they need, THEN search.
- NEVER give unsolicited advice, study plans, or motivational speeches. Just search and show results.

DIRECT QUERIES:
- If the query is specific ("data science clubs", "find react developers", "hackathons") and university is known, search immediately.

TOOL ROUTING:
- People -> search_users
- Clubs -> search_clubs
- Events -> search_events
- Multiple categories -> call ALL relevant tools in parallel.
- Retry with different queries if first results are poor.
- Use get_my_profile to understand the current user for personalized results.
- General uni info -> web_search

ENTITY MARKERS:
- Each search result has a "marker" field (e.g. "@@@user:uuid@@@").
- After describing a result, put its exact marker on a NEW LINE by itself.
- ONLY use markers from the results. NEVER invent them.

RELEVANCE:
- ONLY include results that DIRECTLY match the query.
- 1 good result > 3 weak ones.
- If nothing matches, say so and suggest a different query.
- NEVER hallucinate or make up info. NEVER use general knowledge to fill gaps.

FORMAT:
- Use markdown: **bold names**, bullet points.
- NEVER use emdashes. Use commas or periods instead.
- Max 3 results. Fewer is fine.
- 2-3 sentences per result. Keep it short.
- If a result has links (Instagram, LinkedIn, website, etc.), include them as markdown links.
  - One entity: [Instagram](url)
  - Multiple entities: [CISSA Instagram](url), [DSCubed LinkedIn](url)
- End with a short follow-up question.
- Your total response should be under 150 words unless showing search results.`,
    });
  }

  async run(
    query: string,
    userContext: string,
    conversationHistory: ConversationMessage[],
    onChunk?: (chunk: string) => void,
  ): Promise<OrchestratorResponse> {
    const messages: Array<
      | { role: "user"; content: string }
      | {
          role: "assistant";
          status: "completed";
          content: { type: "output_text"; text: string }[];
        }
    > = [];

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

    const userMessage = userContext
      ? `[About me: ${userContext}]\n\n${query}`
      : query;
    messages.push({ role: "user", content: userMessage });

    console.log("[Connect3Agent] Running with query:", query);
    console.log("[Connect3Agent] Message count:", messages.length);

    if (onChunk) {
      const result = await run(this.agent, messages, { stream: true });
      let fullOutput = "";

      for await (const chunk of result.toTextStream()) {
        fullOutput += chunk;
        onChunk(chunk);
      }

      for (const item of result.newItems) {
        const raw = item.rawItem as Record<string, unknown>;
        console.log(
          `[Connect3Agent] Item: type=${item.type}, rawType=${raw.type}, rawName=${raw.name}`,
        );
      }

      console.log(
        "[Connect3Agent] Complete (streamed), length:",
        fullOutput.length,
      );
      return { markdown: fullOutput };
    }

    const result = await run(this.agent, messages);

    for (const item of result.newItems) {
      if (item.type === "tool_call_item") {
        const raw = item.rawItem as Record<string, unknown>;
        console.log(`[Connect3Agent] ✅ TOOL CALLED: ${raw.name ?? raw.type}`);
      }
    }

    console.log("[Connect3Agent] Complete");
    return {
      markdown: result.finalOutput ?? "I couldn't generate a response.",
    };
  }
}
