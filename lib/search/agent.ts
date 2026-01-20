import { SupabaseClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { planSearch } from "./plan";
import { filterSearch } from "./filter";
import { executeSearchPlan } from "./search";
import { EntityFilters, SearchResponse } from "./types";
import { generateResponse } from "./response";
import { getContext } from "./context";
import { runGeneral } from "./general/runGeneral";
import { ProgressAction } from "@/components/search/utils";

const updateProgress = (
  progress: ProgressAction[],
  step: ProgressAction,
  emit?: (event: string, data: unknown) => void,
): ProgressAction[] => {
  const updatedProgress = [...progress];
  const lastIndex = updatedProgress.map((p) => p.step).lastIndexOf(step.step);
  if (lastIndex !== -1) {
    updatedProgress[lastIndex] = step;
  } else {
    updatedProgress.push(step);
  }
  if (emit) emit("progress", updatedProgress);
  return updatedProgress;
};

export const runSearch = async (
  chatmessageId: string,
  openai: OpenAI,
  supabase: SupabaseClient,
  emit?: (event: string, data: unknown) => void,
): Promise<SearchResponse> => {
  let progress: ProgressAction[] = [];

  // Fetch chatmessage and related data
  const { query, tldr, prevMessages, userUniversity } = await getContext(
    chatmessageId,
    supabase,
  );

  // Plan Search
  progress = updateProgress(
    progress,
    { step: "plan", status: "start", message: "Planning Search" },
    emit,
  );
  const searchPlan = await planSearch(openai, query, tldr, prevMessages);
  progress = updateProgress(
    progress,
    { step: "plan", status: "complete", message: "Planned Search" },
    emit,
  );
  if (emit) emit("progress", progress);

  console.log("Search Plan:", searchPlan);

  // Route to general chatbot if no search required
  if (!searchPlan.requiresSearch) {
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
      progress,
      updateProgress,
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
    progress = updateProgress(
      progress,
      { step: "filter", status: "start", message: "Filtering Results..." },
      emit,
    );

    filters = await filterSearch(
      query,
      searchPlan.searches,
      prevMessages,
      openai,
    );

    progress = updateProgress(
      progress,
      { step: "filter", status: "complete", message: "Filtered Results..." },
      emit,
    );
  }

  progress = updateProgress(
    progress,
    { step: "search", status: "start", message: "Executing Search..." },
    emit,
  );
  // Perform Search
  const { results, fileMap } = await executeSearchPlan(
    searchPlan,
    filters,
    supabase,
    openai,
  );
  progress = updateProgress(
    progress,
    { step: "search", status: "complete", message: "Executed Search." },
    emit,
  );

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
