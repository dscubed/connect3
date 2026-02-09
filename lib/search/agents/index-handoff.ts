/**
 * Connect3 Agent System
 *
 * Single agent with tools — one LLM call.
 */
import OpenAI from "openai";
import { SupabaseClient } from "@supabase/supabase-js";
import { withTrace } from "@openai/agents";
import { Connect3Agent } from "./connect3-agent";
import type { AgentSystemResponse, ConversationMessage } from "./types";
import { ProgressAction } from "@/components/search/utils";

export class Connect3AgentSystem {
  private openai: OpenAI;
  private supabase: SupabaseClient;

  constructor(openai: OpenAI, supabase: SupabaseClient) {
    this.openai = openai;
    this.supabase = supabase;
  }

  private updateProgress(
    progress: ProgressAction[],
    step: ProgressAction,
    emit?: (event: string, data: unknown) => void,
  ): ProgressAction[] {
    const updatedProgress = [...progress];
    const lastIndex = updatedProgress.map((p) => p.step).lastIndexOf(step.step);
    if (lastIndex !== -1) {
      updatedProgress[lastIndex] = step;
    } else {
      updatedProgress.push(step);
    }
    if (emit) emit("progress", updatedProgress);
    return updatedProgress;
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

      let progress: ProgressAction[] = [];

      // Start progress
      progress = this.updateProgress(
        progress,
        { step: "search", status: "start", message: "Searching..." },
        emit,
      );

      const agent = new Connect3Agent(
        this.openai,
        this.supabase,
        userUniversity,
        userId,
      );

      let fullMarkdown = "";

      const response = await agent.run(
        query,
        userContext,
        conversationHistory,
        (chunk: string) => {
          fullMarkdown += chunk;
          if (emit) emit("response", { partial: { markdown: fullMarkdown } });
        },
      );

      // Update progress
      this.updateProgress(
        progress,
        { step: "search", status: "complete", message: "Complete" },
        emit,
      );

      return {
        type: "response",
        markdown: response.markdown,
      };
    });
  }
}

// Re-export types
export * from "./types";
