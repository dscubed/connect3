import { SupabaseClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { analyseContext } from "./context";
import { runSearch } from "./agent";
import { generateResponse } from "./response";
import { runGeneral } from "./runGeneral";

// Unified shape your UI expects
export type AssistantResponse = {
  summary: string;
  results: {
    header?: string;
    text: string;
    file_ids: string[];
  }[];
  followUps: string;
};

function uniq(xs: string[]) {
  return Array.from(new Set(xs));
}

function adaptSearchResponseToAssistantResponse(searchResponse: {
  summary: string;
  results: { header?: string; text: string; matches: Array<{ relevantFiles: Array<{ file_id: string }> }> }[];
  followUps: string;
}): AssistantResponse {
  return {
    summary: searchResponse.summary,
    followUps: searchResponse.followUps,
    results: searchResponse.results.map((r) => {
      const file_ids = uniq(
        (r.matches ?? []).flatMap((m) => (m.relevantFiles ?? []).map((f) => f.file_id))
      );

      return {
        header: r.header,
        text: r.text,
        file_ids,
      };
    }),
  };
}

export async function runRouted(
  chatmessageId: string,
  openai: OpenAI,
  supabase: SupabaseClient,
  emit: (event: string, data: unknown) => void
): Promise<AssistantResponse> {
  const { contextSummary, query } = await analyseContext(chatmessageId, supabase, openai);

  console.log(
    `Routing: mode=${(contextSummary as any).mode} domain=${(contextSummary as any).domain} uni=${(contextSummary as any).university_slug} conf=${(contextSummary as any).confidence}`
  );

  // University KB path (UniMelb for now)
  if (
    (contextSummary as any).mode === "general" &&
    (contextSummary as any).domain === "university" &&
    (contextSummary as any).university_slug === "unimelb" &&
    ((contextSummary as any).confidence ?? 0) >= 0.6
  ) {
    const kbResp = await runGeneral(
      {
        chatmessageId,
        university_slug: (contextSummary as any).university_slug,
        confidence: (contextSummary as any).confidence,
      },
      openai,
      supabase,
      emit
    );

    // runGeneral should already return {summary, results[{header,text,file_ids}], followUps}
    return kbResp;
  }

  // Existing entity search path
  const { state } = await runSearch(chatmessageId, openai, supabase, emit);
  const searchResponse = await generateResponse(query, state, openai, emit);

  // Convert entity-based response into the same "file_ids" response shape the UI expects
  return adaptSearchResponseToAssistantResponse(searchResponse);
}
