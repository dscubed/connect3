/**
 * Shared types for the Connect3 Agent System
 */

/** Message in conversation history */
export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

/** Response from the agent system */
export interface AgentSystemResponse {
  type: "response" | "clarification";
  markdown?: string;
  question?: string;
}

/** Response shape from the agent's run method */
export interface OrchestratorResponse {
  markdown: string;
}
