/**
 * Connect3 Agent System
 *
 * Main entry point for the agent-based search system.
 * Routes queries to specialist agents and generates responses.
 */
import OpenAI from "openai";
import { withTrace } from "@openai/agents";
import { OrchestratorAgent } from "./orchestrator";
import { StudentsAgent } from "./students-agent";
import { ClubsAgent } from "./clubs-agent";
import { EventsAgent } from "./events-agent";
import { GeneralAgent } from "./general-agent";
import type {
  AgentSearchResponse,
  AgentSystemResponse,
  ConversationMessage,
} from "./types";
import { ProgressAction } from "@/components/search/utils";

export class Connect3AgentSystem {
  private orchestrator: OrchestratorAgent;
  private studentsAgent: StudentsAgent;
  private clubsAgent: ClubsAgent;
  private eventsAgent: EventsAgent;
  private openai: OpenAI;
  private userUniversity: string | null;

  constructor(openai: OpenAI, userUniversity?: string | null) {
    this.openai = openai;
    this.userUniversity = userUniversity ?? null;

    this.orchestrator = new OrchestratorAgent(openai);
    this.studentsAgent = new StudentsAgent(openai);
    this.clubsAgent = new ClubsAgent(openai);
    this.eventsAgent = new EventsAgent(openai);
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
      // Log trace URL for debugging
      console.log(
        `[Trace] View at: https://platform.openai.com/traces/trace?trace_id=${trace.traceId}`,
      );

      let progress: ProgressAction[] = [];

      // Step 1: Route to appropriate agent
      progress = this.updateProgress(
        progress,
        { step: "routing", status: "start", message: "Analyzing query..." },
        emit,
      );

      const routing = await this.orchestrator.route(
        query,
        userContext,
        conversationHistory,
      );

      progress = this.updateProgress(
        progress,
        { step: "routing", status: "complete", message: "Query analyzed" },
        emit,
      );

      console.log("[Connect3AgentSystem] Routing decision:", routing);

      // Step 2: If needs clarification, return early
      if (routing.needsClarification) {
        return {
          type: "clarification",
          question: routing.clarificationQuestion,
        };
      }

      // Step 3: Call appropriate sub-agents IN PARALLEL
      progress = this.updateProgress(
        progress,
        { step: "search", status: "start", message: "Searching..." },
        emit,
      );

      // Build array of search promises based on routing
      const searchPromises: Promise<AgentSearchResponse>[] = [];
      const agentNames: string[] = [];

      for (const agentType of routing.agents) {
        switch (agentType) {
          case "students":
            console.log("[Connect3AgentSystem] Queuing students search...");
            searchPromises.push(this.studentsAgent.search(query, userContext));
            agentNames.push("students");
            break;

          case "clubs":
            console.log("[Connect3AgentSystem] Queuing clubs search...");
            searchPromises.push(this.clubsAgent.search(query, userContext));
            agentNames.push("clubs");
            break;

          case "events":
            console.log("[Connect3AgentSystem] Queuing events search...");
            searchPromises.push(this.eventsAgent.search(query, userContext));
            agentNames.push("events");
            break;

          case "general":
            console.log(
              "[Connect3AgentSystem] Queuing general knowledge search...",
            );
            const generalAgent = new GeneralAgent(
              this.openai,
              this.userUniversity,
            );
            searchPromises.push(generalAgent.search(query, userContext));
            agentNames.push("general");
            break;
        }
      }

      // Execute all searches in parallel
      console.log(
        `[Connect3AgentSystem] Running ${searchPromises.length} agent(s) in parallel: ${agentNames.join(", ")}`,
      );
      const searchResultsArray = await Promise.all(searchPromises);

      // Merge all results
      const allResults: AgentSearchResponse = {
        results: searchResultsArray.flatMap((r) => r.results),
      };

      this.updateProgress(
        progress,
        { step: "search", status: "complete", message: "Search complete" },
        emit,
      );

      console.log(
        `[Connect3AgentSystem] Found ${allResults.results.length} total results`,
      );

      // Step 4: For general-only queries, return the content directly
      if (routing.agents.length === 1 && routing.agents[0] === "general") {
        const generalContent = allResults.results[0]?.content ?? "";
        if (emit) emit("response", { partial: { markdown: generalContent } });
        return {
          type: "response",
          markdown: generalContent,
        };
      }

      // Step 5: Orchestrator generates conversational response with STREAMING
      let fullMarkdown = "";

      const response = await this.orchestrator.generateResponse(
        {
          query,
          userContext,
          searchResults: allResults.results,
          conversationHistory,
        },
        // Stream callback
        (chunk) => {
          fullMarkdown += chunk;
          if (emit) emit("response", { partial: { markdown: fullMarkdown } });
        },
      );

      return {
        type: "response",
        markdown: response.markdown,
      };
    }); // End withTrace
  }
}

// Re-export types
export * from "./types";
