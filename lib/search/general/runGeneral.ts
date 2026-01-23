/**
 * Main entry point for the general chatbot pipeline.
 *
 * Simplified architecture - uses LLM-based routing instead of regex heuristics.
 * Slightly more latency but much more robust and maintainable.
 */
import OpenAI from "openai";
import type { ResponseInput } from "openai/resources/responses/responses.mjs";

import { routeQuery } from "./router";
import { runUniversityGeneral } from "./runUniversityGeneral";
import { runConnect3General } from "./runConnect3General";
import { countWebSearchCalls } from "./countWebSearches";
import type { SearchResponse } from "../types";
import { ProgressAction } from "@/components/search/utils";
import { SupabaseClient } from "@supabase/supabase-js";

type RunGeneralArgs = {
  openai: OpenAI;
  query: string;
  tldr: string;
  prevMessages: ResponseInput;
  userUniversity?: string | null;
  supabase: SupabaseClient;
  emit?: (event: string, data: unknown) => void;
  progress: ProgressAction[];
  updateProgress: (
    progress: ProgressAction[],
    step: ProgressAction,
    emit?: (event: string, data: unknown) => void,
  ) => ProgressAction[];
};

export async function runGeneral({
  openai,
  query,
  tldr,
  prevMessages,
  userUniversity,
  supabase,
  emit,
  progress,
  updateProgress,
}: RunGeneralArgs): Promise<SearchResponse> {
  // Step 1: Route the query using LLM classification

  progress = updateProgress(
    progress,
    {
      step: "routing",
      status: "start",
      message: "Classifying query...",
    },
    emit,
  );
  const routing = await routeQuery(
    openai,
    query,
    prevMessages,
    userUniversity,
    tldr,
  );
  progress = updateProgress(
    progress,
    {
      step: "routing",
      status: "complete",
      message: "Classified query.",
    },
    emit,
  );

  console.log("[runGeneral] routing", routing);

  // Step 2: Execute based on route
  switch (routing.route) {
    // -------- Connect3 app help --------
    case "connect3": {
      const text = await runConnect3General(
        openai,
        query,
        prevMessages,
        emit,
        undefined,
        tldr,
      );
      return { markdown: text };
    }

    // -------- University-specific query --------
    case "university": {
      const centralVectorStoreId = process.env.OPENAI_UNI_VECTOR_STORE_ID;

      if (centralVectorStoreId) {
        progress = updateProgress(
          progress,
          {
            step: "general_kb",
            status: "start",
            message: "Querying university knowledge base...",
          },
          emit,
        );

        return runUniversityGeneral(
          openai,
          supabase,
          query,
          routing.university!,
          { emit, intent: routing.intent },
        );
      }

      // Fall through to web if no KB configured
      // Remove previous KB progress entry
      progress.pop();
      progress = updateProgress(
        progress,
        {
          step: "websearch",
          status: "start",
          message: "University KB not available, searching web...",
        },
        emit,
      );
      return webSearch(openai, query, emit);
    }

    // -------- General web search --------
    case "web":
    default: {
      progress = updateProgress(
        progress,
        {
          step: "websearch",
          status: "start",
          message: "Searching the web...",
        },
        emit,
      );
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
    "status",
    `WEB SEARCH: calls=${countWebSearchCalls(resp)} tokens=${resp.usage?.total_tokens}`,
  );

  return {
    markdown: (resp.output_text ?? "").trim(),
  };
}
