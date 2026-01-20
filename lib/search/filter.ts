import { EntityFilters, EntitySearch, EntityType } from "./types";
import OpenAI from "openai";
import { ResponseInput } from "openai/resources/responses/responses.mjs";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod.mjs";

const FilterSearchResponseSchema = z.object({
  include: z.boolean(),
  entity_ids: z.array(z.string()),
});

// Filter Search Function
export const filterSearch = async (
  query: string,
  entities: EntitySearch,
  prevMessages: ResponseInput,
  openai: OpenAI,
): Promise<EntityFilters> => {
  // Determine which entity types to filter based on received plan
  const entitiesIncluded = [];
  for (const entityType of Object.keys(entities)) {
    if (entities[entityType as EntityType]) {
      entitiesIncluded.push(entityType as EntityType);
    }
  }
  const entityContext = `Only consider the following entity types for inclusion/exclusion: ${entitiesIncluded.join(
    ", ",
  )}`;

  // System prompt for filtering logic
  const systemPrompt = `You are an expert search result filter. Given a user query and previous search results, you will determine which entities to include or exclude from the previous results to best answer the user's query.

Your task is to analyze the query and previous results, and return a JSON object in the following format:
{
    "include": <boolean indicating if entities should be included>,
    "entityIds": [<list of entity IDs to include or exclude>]
}

entity IDs should be listed as "type_id" e.g. "user_10", "organisation_5", "events_3"

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
      ...prevMessages,
      { role: "system", content: entityContext },
      { role: "user", content: `User Query: ${query}` },
    ],
    text: {
      format: zodTextFormat(FilterSearchResponseSchema, "filter_response"),
    },
  });

  if (!response.output_parsed) {
    throw new Error("Failed to parse filter search response");
  }

  return buildFilterObject(response.output_parsed.entity_ids);
};

// Helper function to build OpenAI filter object
const buildFilterObject = (entityIds: string[]): EntityFilters => {
  const filterObject: EntityFilters = {
    organisation: null,
    user: null,
    events: null,
  };

  if (entityIds.length === 0) {
    return filterObject;
  }

  for (const id of entityIds) {
    if (!id.includes("_")) {
      throw new Error(`Invalid entity ID format: ${id}`);
    }

    const [type, entityId] = id.split("_");

    if (type !== "user" && type !== "organisation" && type !== "events") {
      throw new Error(`Unknown entity type: ${type}`);
    }

    if (!filterObject[type as EntityType]) {
      filterObject[type as EntityType] = {
        type: "nin",
        key: "id",
        value: [entityId],
      };
    } else {
      filterObject[type as EntityType]!.value.push(entityId);
    }
  }

  return filterObject;
};
