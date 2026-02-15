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
import {
  universities as universityMap,
  University,
} from "@/components/profile/details/univeristies";
import type { ConversationMessage, OrchestratorResponse } from "./types";

/** Streaming callbacks for the agent run */
export interface StreamCallbacks {
  onTextDelta: (delta: string) => void;
  onReasoning: (text: string) => void;
  onReasoningDelta: (
    delta: string,
    meta?: { type?: string; itemId?: string; summaryIndex?: number },
  ) => void;
  onToolCall: (toolName: string, callId: string, args?: string) => void;
  onToolOutput: (toolName: string, callId: string) => void;
}

// Helper: search a vector store and return JSON
async function searchVectorStore(
  openai: OpenAI,
  vectorStoreId: string,
  query: string | string[],
  label: string,
  universityFilter?: string[],
): Promise<string> {
  console.log(
    `[${label}] Searching for:`,
    Array.isArray(query) ? query.join(", ") : query,
  );
  try {
    const searchParams: Record<string, unknown> = {
      query,
      max_num_results: 8,
      rewrite_query: true,
      ranking_options: {
        score_threshold: 0.1,
      },
    };

    if (universityFilter && universityFilter.length > 0) {
      searchParams.filters = {
        type: "in",
        key: "university",
        value: universityFilter,
      };
    }

    // @ts-expect-error — `in` filter operator not yet in the JS SDK types
    const results = await openai.vectorStores.search(vectorStoreId, searchParams);
    if (results.data.length === 0) {
      console.log(`[${label}] Found 0 results`);
      return JSON.stringify({
        results: [],
        message: "No matching results found.",
      });
    }
    const items = results.data
      .map((r) => {
        const text = r.content.map((c) => c.text).join("\n");
        if (!r.attributes) return null;

        const id = r.attributes.id as string;
        const type = r.attributes.type as string;
        return {
          marker: `@@@${type}:${id}@@@`,
          type: type,
          entityId: id,
          score: Math.round(r.score * 1000) / 1000,
          content: text,
        };
      })
      .filter((i) => i !== null);
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
  private selectedUniversities: string[];
  private agent!: Agent;

  constructor(
    openai: OpenAI,
    supabase: SupabaseClient,
    userUniversity?: string | null,
    userId?: string,
    selectedUniversities?: string[],
  ) {
    this.openai = openai;
    this.supabase = supabase;
    this.userUniversity = userUniversity ?? null;
    this.userId = userId ?? "";
    this.selectedUniversities = selectedUniversities ?? [];
    this.createAgent();
  }

  private createAgent(): void {
    const studentsVectorStoreId = process.env.OPENAI_USER_VECTOR_STORE_ID!;
    const clubsVectorStoreId = process.env.OPENAI_ORG_VECTOR_STORE_ID!;
    const eventsVectorStoreId = process.env.OPENAI_EVENTS_VECTOR_STORE_ID!;

    const openai = this.openai;
    const supabase = this.supabase;
    const currentUserId = this.userId;
    const uniFilter = this.selectedUniversities;

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
        query: z
          .union([z.string(), z.array(z.string()).min(1).max(5)])
          .describe(
            "The search query for people/students. You may pass a single query string, or a list of query strings to batch search.",
          ),
      }),
      execute: async ({ query }) =>
        searchVectorStore(openai, studentsVectorStoreId, query, "search_users", uniFilter),
    });

    const searchClubs = tool({
      name: "search_clubs",
      description: "Search for clubs, societies, and student organizations.",
      parameters: z.object({
        query: z
          .union([z.string(), z.array(z.string()).min(1).max(5)])
          .describe(
            "The search query for clubs/organizations. You may pass a single query string, or a list of query strings to batch search.",
          ),
      }),
      execute: async ({ query }) =>
        searchVectorStore(openai, clubsVectorStoreId, query, "search_clubs", uniFilter),
    });

    const searchEvents = tool({
      name: "search_events",
      description:
        "Search for events, hackathons, workshops, career fairs, socials, and activities.",
      parameters: z.object({
        query: z
          .union([z.string(), z.array(z.string()).min(1).max(5)])
          .describe(
            "The search query for events. You may pass a single query string, or a list of query strings to batch search.",
          ),
      }),
      execute: async ({ query }) =>
        searchVectorStore(openai, eventsVectorStoreId, query, "search_events", uniFilter),
    });

    this.agent = new Agent({
      name: "Connect3_Agent",
      model: "gpt-5-mini",
      modelSettings: {
        reasoning: {
          effort: "medium",
          summary: "concise",
        },
        parallelToolCalls: true,
      },
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

UNIVERSITY FILTER:
- The user may have a university filter applied (shown as [University: ...] in their message). When active, search results are restricted to ONLY those universities.
- If the user asks about a university that is NOT in their active filter, alert them: "Heads up — you currently have a filter set to [filtered universities]. Your search results won't include [asked university]. You can update your filter using the university selector."
- Do NOT silently return empty or irrelevant results when the filter excludes what the user is asking about.

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
- For a SINGLE category with multiple query phrasings, you MAY pass a list of query strings to the tool (query can be an array) to batch search.
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
    callbacks?: StreamCallbacks,
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

    const contextParts: string[] = [];
    if (userContext) {
      contextParts.push(`[About me: ${userContext}]`);
    }
    if (this.selectedUniversities.length > 0) {
      const uniNames = this.selectedUniversities.map(
        (key) => universityMap[key as University]?.name ?? key,
      );
      contextParts.push(`[University: ${uniNames.join(", ")}]`);
    }
    const userMessage =
      contextParts.length > 0
        ? `${contextParts.join("\n")}\n\n${query}`
        : query;
    messages.push({ role: "user", content: userMessage });

    console.log("[Connect3Agent] Running with query:", query);
    console.log("[Connect3Agent] Message count:", messages.length);

    if (callbacks) {
      const result = await run(this.agent, messages, { stream: true });
      let fullOutput = "";

      for await (const event of result) {
        if (event.type === "raw_model_stream_event") {
          const data = event.data;

          // Some reasoning streams (like reasoning_summary_text) come through as raw model events.
          if (data.type === "model") {
            const evt = data.event as
              | {
                  type?: string;
                  delta?: string;
                  item_id?: string;
                  summary_index?: number;
                }
              | undefined;

            const evtType = typeof evt?.type === "string" ? evt.type : "";
            const delta = typeof evt?.delta === "string" ? evt.delta : "";

            if (evtType === "response.reasoning_summary_text.delta" && delta) {
              callbacks.onReasoningDelta(delta, {
                type: evtType,
                itemId:
                  typeof evt?.item_id === "string" ? evt.item_id : undefined,
                summaryIndex:
                  typeof evt?.summary_index === "number"
                    ? evt.summary_index
                    : undefined,
              });
            }
          }

          // Text delta — stream to user
          if (data.type === "output_text_delta") {
            fullOutput += data.delta;
            callbacks.onTextDelta(data.delta);
          }
        } else if (event.type === "run_item_stream_event") {
          if (event.name === "reasoning_item_created") {
            // Extract reasoning text from the item
            const rawItem = event.item.rawItem as {
              type: string;
              content?: Array<{ type: string; text: string }>;
            };
            if (rawItem.content) {
              for (const part of rawItem.content) {
                if (part.text) {
                  callbacks.onReasoning(part.text);
                }
              }
            }
          } else if (event.name === "tool_called") {
            const rawItem = event.item.rawItem as {
              name?: string;
              type?: string;
              callId?: string;
              arguments?: string;
            };
            const toolName = rawItem.name ?? rawItem.type ?? "unknown";
            const callId = rawItem.callId ?? "";
            console.log(`[Connect3Agent] Tool called: ${toolName} (${callId})`);
            callbacks.onToolCall(toolName, callId, rawItem.arguments);
          } else if (event.name === "tool_output") {
            const rawItem = event.item.rawItem as {
              name?: string;
              type?: string;
              callId?: string;
            };
            const toolName = rawItem.name ?? rawItem.type ?? "unknown";
            const callId = rawItem.callId ?? "";
            console.log(`[Connect3Agent] Tool output: ${toolName} (${callId})`);
            callbacks.onToolOutput(toolName, callId);
          }
        }
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
