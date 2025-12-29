// Filter node - matches Colab implementation with include/exclude modes
import OpenAI from "openai";
import { FilterSearchResponse, EntitySearch, ExcludeFilters, ChatMessage } from "./types";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod.mjs";
import type { SupabaseClient } from "@supabase/supabase-js";

const FilterSearchResponseSchema = z.object({
  include: z.boolean(),
  entityIds: z.array(z.string()),
});

export const filterSearchResults = async (
  query: string,
  chatHistory: ChatMessage[],
  searches: EntitySearch,
  openai: OpenAI
): Promise<FilterSearchResponse> => {
  const entitiesInSearch: string[] = [];
  if (searches.organisation) entitiesInSearch.push("organisation");
  if (searches.event) entitiesInSearch.push("event");
  if (searches.user) entitiesInSearch.push("user");

  const entityContext = `Only consider the following entity types for inclusion/exclusion: ${entitiesInSearch.join(", ")}.`;

  console.log("Filtering search results for entities:", entityContext);

  const systemPrompt = `You are an expert search result filter. Given a user query and previous search results, you will determine which entities to include or exclude from the previous results to best answer the user's query.

Your task is to analyze the query and previous results, and return a JSON object in the following format:
{
    "include": <boolean indicating if entities should be included>,
    "entityIds": [<list of entity IDs to include or exclude>]
}

entity IDs should be listed as "type_id" e.g. "user_10", "organisation_5", "event_3"

You MUST decide:
- If the user wants to EXCLUDE entities (pagination), set "include" to false and list the entities to exclude in "entityIds".
- If the user wants to INCLUDE specific entities, set "include" to true and list the entities to include in "entityIds".

NEVER return null for "entityIds". Use an empty list if needed.

When to exclude entities:
Pagination: If the user requests "show me more" or "next", exclude entities already shown.
IF EXCLUDE ENTITIES set include to FALSE
e.g. "Show me more", "Next", "More results"

When to include entities:
Specific Requests: If the user asks about a specific entity(ies) mentioned in previous results, include that entity.
e.g. "Tell me more about X's achievements", "What events is Y hosting?"
ONLY if the entities were mentioned in previous results.

include should only be true or false, not null or other values.
return an empty list for entityIds if there are no relevant entities to include or exclude.
NEVER RETURN NULL FOR INCLUDE OR ENTITYIDS.`;

  const response = await openai.responses.parse({
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: systemPrompt },
      ...chatHistory.map((msg) => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
      })),
      { role: "system", content: entityContext },
      { role: "user", content: `User query: ${query}` },
    ],
    text: {
      format: zodTextFormat(FilterSearchResponseSchema, "filter_response"),
    },
  });

  if (!response.output_parsed) {
    throw new Error("Failed to parse filter response");
  }

  return response.output_parsed as FilterSearchResponse;
};

export const buildExcludeFilters = (
  filterResponse: FilterSearchResponse
): ExcludeFilters => {
  const filters: ExcludeFilters = {
    user: [],
    organisation: [],
    event: [],
  };

  for (const key of filterResponse.entityIds) {
    if (!key.includes("_")) {
      throw new Error(`Invalid entity ID format: ${key}`);
    }
    const [type, id] = key.split("_");
    if (type === "user") {
      filters.user.push(id);
    } else if (type === "organisation") {
      filters.organisation.push(id);
    } else if (type === "event") {
      filters.event.push(id);
    } else {
      throw new Error(`Unknown entity type: ${type}`);
    }
  }

  return filters;
};

/**
 * Fetch included entities directly from database when filter returns include: true
 * Matches Colab's included_entities() function
 */
export const getIncludedEntities = async (
  filterResponse: FilterSearchResponse,
  supabase: SupabaseClient
): Promise<string> => {
  let text = "";

  for (const key of filterResponse.entityIds) {
    if (!key.includes("_")) {
      console.warn(`Invalid entity ID format: ${key}`);
      continue;
    }

    const [type, id] = key.split("_");

    try {
      if (type === "user") {
        // Fetch user files from database
        const { data, error } = await supabase
          .from("user_files")
          .select("openai_file_id, summary_text")
          .eq("user_id", id)
          .eq("status", "completed")
          .limit(5); // Limit files per entity

        if (error || !data || data.length === 0) {
          console.warn(`No data found for ${type}_${id}`);
          continue;
        }

        // Format entity data
        text += `\n=== ${type}_${id} ===\n`;
        for (const item of data) {
          if (item.summary_text) {
            text += `File ID: ${item.openai_file_id}\n`;
            text += `${item.summary_text}\n\n`;
          }
        }
      } else if (type === "organisation" || type === "event") {
        // For organisations and events, we'd need to check if there's a table for them
        // For now, log a warning - you may need to add tables for these entity types
        console.warn(`Entity type ${type} not yet supported for direct fetching`);
        // TODO: Implement organisation and event fetching when tables are available
      } else {
        console.warn(`Unknown entity type: ${type}`);
      }
    } catch (err) {
      console.error(`Error fetching entity ${key}:`, err);
    }
  }

  return text;
};

