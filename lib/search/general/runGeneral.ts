/**
 * Main entry point for the general chatbot pipeline.
 *
 * Simplified architecture - uses LLM-based routing instead of regex heuristics.
 * Slightly more latency but much more robust and maintainable.
 */
import OpenAI from "openai";
import type { ResponseInput } from "openai/resources/responses/responses.mjs";

import { routeQuery, getVectorStores } from "./router";
import { runUniversityGeneral } from "./runUniversityGeneral";
import { runConnect3General } from "./runConnect3General";
import { countWebSearchCalls } from "./countWebSearches";
import type { SearchResponse } from "../types";

type RunGeneralArgs = {
  openai: OpenAI;
  query: string;
  tldr: string;
  prevMessages: ResponseInput;
  userUniversity?: string | null;
  emit?: (event: string, data: unknown) => void;
};

export async function runGeneral({
  openai,
  query,
  tldr,
  prevMessages,
  userUniversity,
  emit,
}: RunGeneralArgs): Promise<SearchResponse> {
  // Step 1: Route the query using LLM classification
  const routing = await routeQuery(
    openai,
    query,
    prevMessages,
    userUniversity,
    emit,
    tldr,
  );

  console.log("[runGeneral] routing", routing);

  // Step 2: Execute based on route
  switch (routing.route) {
    // -------- Connect3 app help --------
    case "connect3": {
      emit?.("status", {
        step: "general_connect3",
        message: "Answering as Connect3 assistant...",
      });
      const text = await runConnect3General(
        openai,
        query,
        prevMessages,
        emit,
        undefined,
        tldr,
      );
      return { markdown: text, entities: [] };
    }

    // -------- University-specific query --------
    case "university": {
      const vectorStores = getVectorStores(routing.university);

      if (vectorStores.official || vectorStores.union) {
        emit?.("status", {
          step: "general_kb",
          message: `Searching ${routing.university} knowledge base...`,
        });
        return runUniversityGeneral(
          openai,
          query,
          routing.university!,
          vectorStores,
          { emit, intent: routing.intent },
        );
      }

      // Fall through to web if no KB configured
      emit?.("status", {
        step: "general_web_fallback",
        message: "University KB not available, searching web...",
      });
      return webSearch(openai, query, emit);
    }

    // -------- General web search --------
    case "web":
    default: {
      emit?.("status", {
        step: "general_web",
        message: "Searching the web...",
      });
      return webSearch(openai, query, emit);
    }
  }
}

// ============================================================================
// Web Search Helper
// ============================================================================

async function webSearch(
  openai: OpenAI,
  query: string,
  emit?: (event: string, data: unknown) => void,
): Promise<SearchResponse> {
  const resp = await openai.responses.create({
    model: "gpt-4o-mini",
    input: [
      {
        role: "system",
        content: `You are a helpful assistant. Use web search to find accurate, up-to-date information. 
Prefer official sources (university websites, government sites) when relevant.
Format your response in clear markdown.`,
      },
      { role: "user", content: query },
    ],
    tools: [{ type: "web_search_preview" }],
  });

  emit?.(
    "progress",
    `WEB SEARCH: calls=${countWebSearchCalls(resp)} tokens=${resp.usage?.total_tokens}`,
  );

  return {
    markdown: (resp.output_text ?? "").trim(),
    entities: [],
  };
}
