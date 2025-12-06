import { SupabaseClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { AgentState, EntityGroup } from "./type";
import { analyseContext } from "./context";
import { searchVectorStores } from "./vectorSearch";
import { refineSearchResults } from "./validation";
import { reasonAndPlan } from "./reasoning";

const MAX_ITERATIONS = 3;

export const runSearch = async (
  chatroomId: string,
  openai: OpenAI,
  supabase: SupabaseClient
): Promise<{ query: string; state: AgentState }> => {
  // Initialize agent state
  const state: AgentState = {
    newFiles: [],
    entities: [],
    invalidEntities: [],
    seenEntities: {
      user: new Set<string>(),
      organisation: new Set<string>(),
    },
    summary: "",
    newQueries: [],
    pastQueries: [],
    iteration: 0,
    maxIterations: MAX_ITERATIONS,
  };

  // Get context summary and initial queries
  console.log("Analysing context...");
  const { contextSummary, query } = await analyseContext(
    chatroomId,
    supabase,
    openai
  );
  state.summary = contextSummary.summary;
  state.newQueries = contextSummary.queries;
  console.log(`Gathered Context: ${state.summary}`);

  // Main Loop
  while (state.newQueries.length > 0 && state.iteration < state.maxIterations) {
    state.iteration += 1;
    console.log(`Iteration ${state.iteration}: Searching ${state.newQueries}`);

    // Search vector stores
    const searchResults = await searchVectorStores(
      state.newQueries,
      { users: true, organisations: true },
      state.seenEntities,
      openai
    );
    console.log("Search finished, refining results...");
    state.pastQueries.push(...state.newQueries);
    state.newQueries = [];

    // Group results by entity
    const entities = {} as Record<string, EntityGroup>;
    for (const result of searchResults) {
      const key = `${result.type}_${result.id}`;
      if (!entities[key]) {
        entities[key] = {
          type: result.type,
          id: result.id,
          name: result.name,
          files: [],
        };
      }
      entities[key].files.push({
        file_id: result.file_id,
        text: result.text,
      });
    }

    // Validate and refine results
    console.log("Refining search results...");
    const { validEntities, invalidEntities } = await refineSearchResults(
      Object.values(entities),
      supabase,
      query,
      contextSummary.summary,
      openai
    );
    state.entities.push(...validEntities);
    state.invalidEntities.push(...invalidEntities);
    console.log(`Refinement finished ${validEntities.length} results found`);

    // Update seen entities
    for (const entity of validEntities) {
      state.seenEntities[entity.type].add(entity.id);
    }

    // Reason and plan next steps
    console.log("Reasoning next steps...");
    const { reasoning, newQueries } = await reasonAndPlan(state, query, openai);
    console.log(`Reasoned: ${reasoning}`);
    state.newQueries = newQueries;
  }
  return { query, state };
};
