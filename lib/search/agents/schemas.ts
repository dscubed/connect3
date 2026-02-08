/**
 * Zod schemas for handoff data contracts between orchestrator and sub-agents.
 */
import { z } from "zod";

/**
 * Input schema for sub-agent handoffs.
 * Orchestrator passes query and context to sub-agents.
 */
export const SubAgentInputSchema = z.object({
  query: z.string().describe("The search query to execute"),
  userContext: z.string().describe("Context about the user making the query"),
});
export type SubAgentInput = z.infer<typeof SubAgentInputSchema>;

/**
 * Schema for a single search result.
 */
export const SearchResultSchema = z.object({
  fileId: z.string(),
  content: z.string(),
});

/**
 * Output schema for sub-agent handoffs back to orchestrator.
 * Sub-agents return their search results.
 */
export const SubAgentOutputSchema = z.object({
  agentType: z.enum(["students", "clubs", "events", "general"]),
  results: z.array(SearchResultSchema),
});
export type SubAgentOutput = z.infer<typeof SubAgentOutputSchema>;

/**
 * Schema for orchestrator's internal state tracking collected results.
 */
export const OrchestratorStateSchema = z.object({
  query: z.string(),
  userContext: z.string(),
  conversationHistory: z.string(),
  pendingAgents: z.array(z.enum(["students", "clubs", "events", "general"])),
  collectedResults: z.array(SubAgentOutputSchema),
});
export type OrchestratorState = z.infer<typeof OrchestratorStateSchema>;
