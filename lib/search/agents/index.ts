/**
 * Connect3 Agent System
 *
 * Single agent with tools — one LLM call.
 * Handles tracing, progress, and streaming events.
 */
import OpenAI from "openai";
import { SupabaseClient } from "@supabase/supabase-js";
import { withTrace } from "@openai/agents";
import { Connect3Agent } from "./connect3-agent";
import type { AgentSystemResponse, ConversationMessage } from "./types";

/** Search tools that should emit a search row */
const SEARCH_TOOLS = new Set([
  "search_users",
  "search_clubs",
  "search_events",
  "web_search",
]);

export class Connect3AgentSystem {
  private openai: OpenAI;
  private supabase: SupabaseClient;

  constructor(openai: OpenAI, supabase: SupabaseClient) {
    this.openai = openai;
    this.supabase = supabase;
  }

  async run(
    query: string,
    userContext: string,
    conversationHistory: ConversationMessage[],
    userUniversity: string | null,
    userId: string,
    emit?: (event: string, data: unknown) => void,
  ): Promise<AgentSystemResponse> {
    return withTrace("Connect3 Search", async (trace) => {
      console.log(
        `[Trace] View at: https://platform.openai.com/traces/trace?trace_id=${trace.traceId}`,
      );

      const agent = new Connect3Agent(
        this.openai,
        this.supabase,
        userUniversity,
        userId,
      );

      // Track active searches: callId -> query string
      const activeSearches = new Map<string, string>();

      const emitProgress = (
        emitter: (event: string, data: unknown) => void,
      ) => {
        emitter("progress", { message: "Thinking" });
      };

      // Start with "Thinking"
      if (emit) emit("progress", { message: "Thinking" });

      let fullMarkdown = "";

      const response = await agent.run(
        query,
        userContext,
        conversationHistory,
        emit
          ? {
              onTextDelta: (delta: string) => {
                fullMarkdown += delta;
                emit("response", {
                  partial: { markdown: fullMarkdown },
                });
              },
              // Avoid emitting reasoning_item_created text because it duplicates
              // the reasoning_summary_text delta stream.
              onReasoning: () => {},
              onReasoningDelta: (
                delta: string,
                meta?: {
                  type?: string;
                  itemId?: string;
                  summaryIndex?: number;
                },
              ) => {
                emit("reasoning", { delta, meta });
              },
              onToolCall: (toolName: string, callId: string, args?: string) => {
                if (SEARCH_TOOLS.has(toolName) && args) {
                  try {
                    const parsed = JSON.parse(args);
                    const q = parsed?.query;
                    if (Array.isArray(q)) {
                      activeSearches.set(callId, q.join(", "));
                      emit("reasoning", {
                        meta: { type: "search", queries: q, callId },
                      });
                    } else if (typeof q === "string" && q.trim().length > 0) {
                      activeSearches.set(callId, q);
                      emit("reasoning", {
                        meta: { type: "search", queries: [q], callId },
                      });
                    } else {
                      activeSearches.set(callId, toolName);
                      emit("reasoning", {
                        meta: { type: "search", queries: [toolName], callId },
                      });
                    }
                  } catch {
                    activeSearches.set(callId, toolName);
                    emit("reasoning", {
                      meta: { type: "search", queries: [toolName], callId },
                    });
                  }
                }
                emitProgress(emit);
              },
              onToolOutput: (_toolName: string, callId: string) => {
                activeSearches.delete(callId);
                emitProgress(emit);
              },
            }
          : undefined,
      );

      // Final progress: done
      if (emit) emit("progress", { message: "" });

      return {
        type: "response",
        markdown: response.markdown,
      };
    });
  }
}

// Re-export types
export type { ConversationMessage, AgentSystemResponse } from "./types";
