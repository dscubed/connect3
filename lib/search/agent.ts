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
  supabase: SupabaseClient,
  emit: (event: string, data: unknown) => void
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
    progress: {
      iterations: [],
    },
  };

  // Get context summary and initial queries
  console.log("Analysing context...");

  state.progress.context = { start: new Date() };
  emit("progress", state.progress);
  const { contextSummary, query } = await analyseContext(
    chatroomId,
    supabase,
    openai
  );

  // Update state with context summary and queries
  state.summary = contextSummary.summary;
  state.newQueries = contextSummary.queries;
  console.log(`Gathered Context: ${state.summary}`);
  console.log(`Entity Types: users=${contextSummary.entityTypes.users}, organisations=${contextSummary.entityTypes.organisations}`);

  // Store entity type filter for use in iterations
  const entityTypeFilter = contextSummary.entityTypes;

  // Update progress
  state.progress.context.end = new Date();
  state.progress.context.data = state.summary;
  emit("progress", state.progress);

  // Main Loop
  while (state.newQueries.length > 0 && state.iteration < state.maxIterations) {
    state.iteration += 1;
    console.log(`Iteration ${state.iteration}: Searching ${state.newQueries}`);

    // Update progress
    state.progress.iterations.push({});
    const currentIterationProgress =
      state.progress.iterations[state.iteration - 1];

    currentIterationProgress.searching = {
      start: new Date(),
      data: state.newQueries,
    };
    emit("progress", state.progress);

    // Search vector stores with detected entity types
    const searchResults = await searchVectorStores(
      state.newQueries.slice(0, 5),
      entityTypeFilter,
      state.seenEntities,
      openai
    );

    // Update state and progress
    state.pastQueries.push(...state.newQueries);
    state.newQueries = [];

    currentIterationProgress.searching.end = new Date();
    emit("progress", state.progress);

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
    currentIterationProgress.refining = { start: new Date() };
    emit("progress", state.progress);
    const { validEntities, invalidEntities } = await refineSearchResults(
      Object.values(entities),
      supabase,
      query,
      contextSummary.summary,
      openai
    );

    // Update state and progress
    state.entities.push(...validEntities);
    state.invalidEntities.push(...invalidEntities);
    console.log(`Refinement finished ${validEntities.length} results found`);

    currentIterationProgress.refining.end = new Date();
    currentIterationProgress.refining.data = validEntities.length;
    emit("progress", state.progress);

    // Update seen entities
    for (const entity of validEntities) {
      state.seenEntities[entity.type].add(entity.id);
    }

    // Reason and plan next steps
    console.log("Reasoning next steps...");
    currentIterationProgress.reasoning = { start: new Date() };
    emit("progress", state.progress);
    const { reasoning, newQueries } = await reasonAndPlan(state, query, openai);
    console.log(`Reasoned: ${reasoning}`);
    state.newQueries = newQueries;

    // Update progress
    currentIterationProgress.reasoning.data = reasoning;
    currentIterationProgress.reasoning.end = new Date();
    emit("progress", state.progress);
  }
  return { query, state };
};
