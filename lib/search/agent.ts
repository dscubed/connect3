import { SupabaseClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { planSearch } from "./plan";
import { filterSearch } from "./filter";
import { executeSearchPlan } from "./search";
import { EntityFilters, SearchResponse } from "./types";
import { generateResponse } from "./response";
import { getContext } from "./context";
import { runGeneral } from "./general/runGeneral";

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

  // Plan Search
  const searchPlan = await planSearch(openai, query, tldr, prevMessages);
  if (emit) emit("progress", "Planned Searched...");

  console.log("Search Plan:", searchPlan);

  // Route to general chatbot if no search required
  if (!searchPlan.requiresSearch) {
    if (emit) emit("progress", "Routed to General Chat...");

    const lastTurn =
      Array.isArray(prevMessages) && prevMessages.length >= 2
        ? prevMessages.slice(-2)
        : [];

    const generalResp = await runGeneral({
      openai,
      query,
      tldr,
      prevMessages: lastTurn,
      userUniversity,
      emit,
    });

    return generalResp;
  }

  // Filter searches if required
  let filters: EntityFilters = {
    organisation: null,
    user: null,
    events: null,
  };
  if (searchPlan.filterSearch) {
    if (emit) emit("progress", "Filtering Results...");

    filters = await filterSearch(
      query,
      searchPlan.searches,
      prevMessages,
      openai,
    );
  }

  if (emit) emit("progress", "Executing Search...");
  // Perform Search
  const { results, fileMap } = await executeSearchPlan(
    searchPlan,
    filters,
    supabase,
    openai,
  );
  if (emit) emit("progress", "Completed Search...");

  // Generate the final response
  const response = await generateResponse(
    results,
    searchPlan.context,
    openai,
    fileMap,
    emit,
  );

  return response;
};
