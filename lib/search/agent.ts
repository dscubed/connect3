/**
 * Main search entry point
 *
 * Uses the new OpenAI Agents SDK-based system for routing and search.
 * Clarification is handled as part of the response generation.
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
  selectedUniversities?: string[],
): Promise<SearchResponse> => {
  const {
    query,
    tldr,
    prevMessages,
    userUniversity,
    userId,
    selectedUniversities: storedUniversities,
  } = await getContext(chatmessageId, supabase);

  const universities =
    selectedUniversities && selectedUniversities.length > 0
      ? selectedUniversities
      : storedUniversities;

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

  // Create agent system
  const agentSystem = new Connect3AgentSystem(openai, supabase);

  // Run the agent system
  const result = await agentSystem.run(
    query,
    tldr,
    conversationHistory,
    userUniversity,
    userId,
    emit,
    universities,
  );

  console.log("[runSearch] Agent system completed");

  // Return the response (clarification is now part of the response markdown)
  return {
    markdown: result.markdown ?? "",
  };
};
