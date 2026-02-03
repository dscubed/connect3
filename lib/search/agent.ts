/**
 * Main search entry point
 *
 * Uses the new OpenAI Agents SDK-based system for routing and search.
 */
import { SupabaseClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { SearchResponse } from "./types";
import { getContext } from "./context";
import { Connect3AgentSystem, ConversationMessage } from "./agents";

export const runSearch = async (
  chatmessageId: string,
  openai: OpenAI,
  supabase: SupabaseClient,
  emit?: (event: string, data: unknown) => void,
): Promise<SearchResponse> => {
  // Fetch chatmessage and related data
  const { query, tldr, prevMessages, userUniversity } = await getContext(
    chatmessageId,
    supabase,
  );

  console.log("[runSearch] Starting agent system with query:", query);

  // Convert prevMessages to agent format
  const conversationHistory: ConversationMessage[] = [];
  for (const msg of prevMessages) {
    if ("role" in msg && "content" in msg) {
      const role = msg.role as string;
      const content = msg.content as string;
      if (role === "user" || role === "assistant") {
        conversationHistory.push({ role, content });
      }
    }
  }

  // Create agent system with user university context
  const agentSystem = new Connect3AgentSystem(openai, userUniversity);

  // Run the agent system
  const result = await agentSystem.run(query, tldr, conversationHistory, emit);

  console.log("[runSearch] Agent system response type:", result.type);

  // Handle clarification requests
  if (result.type === "clarification") {
    return {
      markdown: result.question ?? "Could you please clarify your question?",
    };
  }

  // Return the response
  return {
    markdown: result.markdown ?? "",
  };
};
