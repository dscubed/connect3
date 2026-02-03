/**
 * Shared types for the Connect3 Agent System
 */

export type AgentRoute = "students" | "clubs" | "events" | "general";

export type EntityType = "user" | "organisation" | "events";

export interface SearchResult {
  fileId: string;
  content: string; // File content with ENTITY_ID embedded
}

export interface AgentSearchResponse {
  results: SearchResult[];
}

export interface OrchestratorResponse {
  markdown: string; // Final response with entity markers
}

export interface RouteDecision {
  agents: AgentRoute[]; // Can route to multiple agents for parallel search
  needsClarification: boolean;
  clarificationQuestion: string; // Empty string when not needed
}

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AgentSystemResponse {
  type: "response" | "clarification";
  markdown?: string;
  question?: string;
}

export interface FileMapEntry {
  id: string;
  type: EntityType;
}

export interface FileMap {
  [fileId: string]: FileMapEntry;
}
