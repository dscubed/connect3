/**
 * Connect3 Agent System (Handoff-Based)
 *
 * Main entry point for the agent-based search system.
 * Uses the handoff pattern for sequential sub-agent execution.
 */
import OpenAI from "openai";
import { withTrace } from "@openai/agents";
import { HandoffOrchestrator } from "./handoff-orchestrator";
import type { AgentSystemResponse, ConversationMessage } from "./types";
import { ProgressAction } from "@/components/search/utils";

export class Connect3AgentSystem {
  private orchestrator: HandoffOrchestrator;
  private openai: OpenAI;

  constructor(openai: OpenAI, userUniversity?: string | null) {
    this.openai = openai;
    this.orchestrator = new HandoffOrchestrator(openai, userUniversity);
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
        { step: "routing", status: "start", message: "Analyzing query..." },
        emit,
      );

      // Run the orchestrator (handles routing, search, and response generation)
      let fullMarkdown = "";

      const response = await this.orchestrator.run(
        query,
        userContext,
        conversationHistory,
        // Stream callback
        (chunk) => {
          fullMarkdown += chunk;
          if (emit) emit("response", { partial: { markdown: fullMarkdown } });
        },
      );

      // Update progress
      this.updateProgress(
        progress,
        { step: "routing", status: "complete", message: "Complete" },
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
