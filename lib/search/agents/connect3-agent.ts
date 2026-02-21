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
  extraFilter?: Record<string, unknown>,
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

    const hasUniFilter = universityFilter && universityFilter.length > 0;
    const uniCondition = hasUniFilter
      ? { type: "in", key: "university", value: universityFilter }
      : null;

    if (uniCondition && extraFilter) {
      // Merge both filters under a top-level `and`
      searchParams.filters = {
        type: "and",
        filters: [extraFilter, uniCondition],
      };
    } else if (uniCondition) {
      searchParams.filters = uniCondition;
    } else if (extraFilter) {
      searchParams.filters = extraFilter;
    }

    const results = await openai.vectorStores.search(
      vectorStoreId,
      // @ts-expect-error — `in` filter operator not yet in the JS SDK types
      searchParams,
    );
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

    const searchEventsByDate = tool({
      name: "search_events_by_date",
      description:
        "Search for events within a specific date range. Use this when the user asks about events on a particular date, this week, this weekend, next month, etc. Provide a search query describing what kind of events they want, plus the date window.",
      parameters: z.object({
        query: z
          .union([z.string(), z.array(z.string()).min(1).max(5)])
          .describe(
            "The search query describing the type of events (e.g. 'hackathon', 'social', 'career fair'). Can be a single string or array of strings.",
          ),
        startDate: z
          .string()
          .describe(
            "The start of the date range in ISO 8601 format (e.g. '2026-02-22T00:00:00Z'). Events on or after this date will be included.",
          ),
        endDate: z
          .string()
          .nullable()
          .describe(
            "The end of the date range in ISO 8601 format (e.g. '2026-02-28T23:59:59Z'). Pass null to return all events from startDate onwards.",
          ),
      }),
      execute: async ({ query, startDate, endDate }) => {
        const startTs = Math.floor(new Date(startDate).getTime() / 1000);

        // Build the date filter
        let dateFilter: Record<string, unknown>;
        if (endDate) {
          const endTs = Math.floor(new Date(endDate).getTime() / 1000);
          dateFilter = {
            type: "and",
            filters: [
              { type: "gte", key: "start", value: startTs },
              { type: "lte", key: "start", value: endTs },
            ],
          };
        } else {
          dateFilter = { type: "gte", key: "start", value: startTs };
        }

        // Merge with university filter if active
        let combinedFilter: Record<string, unknown>;
        if (uniFilter && uniFilter.length > 0) {
          combinedFilter = {
            type: "and",
            filters: [
              dateFilter,
              { type: "in", key: "university", value: uniFilter },
            ],
          };
        } else {
          combinedFilter = dateFilter;
        }

        const label = "search_events_by_date";
        const endTs = endDate
          ? Math.floor(new Date(endDate).getTime() / 1000)
          : null;
        console.log(
          `[${label}] Date range: ${startDate}${endDate ? ` -> ${endDate}` : "+"} (unix: ${startTs}${endTs ? ` -> ${endTs}` : "+"})`,
        );

        try {
          const searchParams: Record<string, unknown> = {
            query,
            max_num_results: 8,
            rewrite_query: true,
            ranking_options: { score_threshold: 0.1 },
            filters: combinedFilter,
          };

          const results = await openai.vectorStores.search(
            eventsVectorStoreId,
            // @ts-expect-error — compound filter not yet in the JS SDK types
            searchParams,
          );

          if (results.data.length === 0) {
            console.log(`[${label}] Found 0 results`);
            return JSON.stringify({
              results: [],
              message: "No events found in that date range.",
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
                type,
                entityId: id,
                score: Math.round(r.score * 1000) / 1000,
                content: text,
              };
            })
            .filter((i) => i !== null);

          console.log(`[${label}] Found ${items.length} results`);
          return JSON.stringify({ results: items });
        } catch (err) {
          console.error(`[${label}] Error:`, err);
          return JSON.stringify({
            results: [],
            message: `Search failed: ${String(err)}`,
          });
        }
      },
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
        searchVectorStore(
          openai,
          studentsVectorStoreId,
          query,
          "search_users",
          uniFilter,
        ),
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
        searchVectorStore(
          openai,
          clubsVectorStoreId,
          query,
          "search_clubs",
          uniFilter,
        ),
    });

    const searchEvents = tool({
      name: "search_events",
      description:
        "Search for upcoming events, hackathons, workshops, career fairs, socials, and activities. A default filter of start >= now is automatically applied, so results will only include future events.",
      parameters: z.object({
        query: z
          .union([z.string(), z.array(z.string()).min(1).max(5)])
          .describe(
            "The search query for events. You may pass a single query string, or a list of query strings to batch search.",
          ),
      }),
      execute: async ({ query }) => {
        const nowTs = Math.floor(Date.now() / 1000);
        return searchVectorStore(
          openai,
          eventsVectorStoreId,
          query,
          "search_events",
          uniFilter,
          { type: "gte", key: "start", value: nowTs },
        );
      },
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
        searchEventsByDate,
        getMyProfile,
        webSearchTool(),
        getCurrentDate,
      ],
      instructions: `You are Connect3, a friendly chatbot that helps university students find people, clubs, and events.

You are NOT a general assistant, tutor, or life coach. Your job is to SEARCH and CONNECT students with the right people, clubs, and events. Do not give study tips, career advice, or general guidance.

UNIVERSITY:
- Check the user context for university info before searching.
- If their university is unknown, casually mention it as part of your response, e.g. "By the way, which uni are you at? That'll help me find the most relevant results for you."
- You can still attempt a general search while asking, but note that results will be better once you know their university.

UNIVERSITY FILTER:
- The user may have a university filter applied (shown as [University: ...] in their message). When active, search results are restricted to ONLY those universities.
- If the user asks about a university that is NOT in their active filter, alert them: "Heads up — you currently have a filter set to [filtered universities]. Your search results won't include [asked university]. You can update your filter using the university selector."
- Do NOT silently return empty or irrelevant results when the filter excludes what the user is asking about.

CONVERSATION FLOW FOR VAGUE QUERIES:
- If the query is vague ("I'm struggling", "I want to meet people", "help me find my people"), ask 1-2 SHORT clarifying questions. Do not search yet.
- Keep clarifying responses SHORT: 2-3 sentences max. No bullet-point advice dumps.
- Once you understand what they need, THEN search.
- In clarifying questions keep it brief and conversational. Don't ask for too much info at once. For example, if they say "I want to meet people", you could ask "What are you interested in? Clubs, events, or just meeting other students?" rather than asking them to list specific interests right away.
- NEVER give unsolicited advice, study plans, or motivational speeches. Just search and show results.
- After showing results for a vague query, you can briefly ask if they'd like to explore a different direction.

TOOL ROUTING:
- People -> search_users
- Clubs -> search_clubs
- Upcoming events (default) -> search_events. This ALWAYS filters to future events only (start >= now). Use this for all standard event searches.
- Events in a specific date range -> search_events_by_date. Use this when the user asks about a specific date, day, week, or month window.
- Past events -> search_events_by_date with endDate set to now (call get_current_date first). Only do this if the user explicitly asks about past events or past events help answering the query.
- Multiple categories -> call ALL relevant tools in parallel.
- Retry with different queries if first results are poor.
- For a SINGLE category with multiple query phrasings, you MAY pass a list of query strings to the tool (query can be an array) to batch search.
- Use get_my_profile to understand the current user for personalized results.
- General uni info -> web_search

EVENT DATE BEHAVIOUR:
- By default, event searches ONLY return upcoming/future events. Do NOT mention this to the user unless relevant.
- If the user asks for past or historical events, use search_events_by_date with endDate = now to find events that have already occurred.
- If the user asks about events "this week" or "this weekend", call get_current_date first to get today's date, then use search_events_by_date with the correct start/end window.

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
