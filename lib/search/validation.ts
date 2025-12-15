import { SupabaseClient } from "@supabase/supabase-js";
import {
  EntityGroup,
  EntityResult,
  EntityType,
  RefinementOutput,
  ValidationOutput,
} from "./type";
import OpenAI from "openai";
import z from "zod";
import { zodTextFormat } from "openai/helpers/zod.mjs";

const getEntityInfo = async (
  id: string,
  type: EntityType,
  supabase: SupabaseClient
) => {
  let text: string = "";
  if (type === "user" || type === "organisation") {
    const { data, error } = await supabase
      .from("user_files")
      .select("summary_text, openai_file_id")
      .eq("user_id", id);

    if (error || !data || data.length === 0) {
      console.error("Error occurred fetching entity info:", error, data);
      return "No additional information available.";
    }

    for (const item of data) {
      if (item.summary_text) {
        text += `File ID: ${item.openai_file_id}\n`;
        text += item.summary_text + "\n\n";
      }
    }
  }

  return text;
};

const ValidationSchema = z.object({
  valid: z.boolean(),
  reason: z.string(),
  relevantFiles: z.array(
    z.object({
      file_id: z.string(),
      summary: z.string(),
    })
  ),
});

const validateEntity = async (
  entity: EntityGroup,
  supabase: SupabaseClient,
  query: string,
  context: string,
  openai: OpenAI
): Promise<ValidationOutput> => {
  const type = entity.type;
  const name = entity.name;
  const id = entity.id;

  const chunksInfo = await getEntityInfo(id, type, supabase);
  const entityInfo = `Entity Information: ${name} (${type})
    ${chunksInfo}
    `;
  const prompt = `You are validating if a SINGLE entity matches a user's search query.

    YOUR ONLY JOB: Check if this entity satisfies the criteria in the query.
    
    CORRECT THINKING:
    - Query: "Who goes to unimelb?" → Does THIS PERSON attend UniMelb? Yes/No
    - Query: "What clubs are at UWA?" → Is THIS CLUB at UWA? Yes/No
    - Query: "Find Python developers" → Does THIS PERSON know Python? Yes/No

    WRONG THINKING (DO NOT DO THIS):
    - "This person attends UniMelb but doesn't represent the whole population" → INVALID LOGIC
    - "This is just one example" → THAT'S THE POINT, WE WANT EXAMPLES    
    - "The query is too broad" → NOT YOUR CONCERN
    * You are building a LIST of results. Each valid entity is ONE result in that list.

    MULTI-PART QUERIES:
    If the query has multiple parts like "What is X? Who can I contact about X?"
    → Mark as VALID if the entity answers ANY part (what X is OR who to contact)
    → Different entities can answer different parts of the query.    

    If the query specifies one entity like "Data science clubs in Melbourne"
    → Check if THIS ENTITY matches ALL parts of the query.
    → Data Science? Yes/No AND in Melbourne? Yes/No

    NAME MATCHING:
    If the query mentions a SPECIFIC name/acronym (e.g. "dscubed", "CISSA", "MAC"):
    → Look for matches of that acronym aswell as full names but make sure they're exact.
      e.g. DSCubed -> Data Science Students Society
      e.g. DSC -> Data Science Club of UWA
    → Similar-sounding or similar-category entities are NOT matches
    → Look for EXPLICIT mentions of the exact name in the entity's files

    ENSURE YOU CHECK THE ENTITY'S FILE SUMMARIES THOROUGHLY AND NOT LOOK FOR PREDOMINANT KEYWORDS ONLY.
    
    Return JSON:
    {
        "valid": true/false,
        "reason": "Does/Does not [criteria from query] because [evidence]",
        "relevantFiles": [{"file_id": "file_...", "summary": "summary of the file content"}, {...} ]
    }

    valid: True if the entity matches the user's query, False otherwise. **
    reason: One sentence justification for the validity decision. **
    relevantFiles: List of file IDs which explain your decision and summaries of each file's content. **
        - for valid entities include file IDs that support why this entity is relevant to the query.
        - summaries should be concise, 1-2 sentences max and explain the relevance of the file to the query.
        - include specific entity mentions if applicable.
        - for invalid entities, leave this list empty don't waste time summarising the files.
    File IDs start with "file_" and are already prefixed in the entity information.`;

  const response = await openai.responses.parse({
    model: "gpt-5-mini",
    reasoning: {
      effort: "low",
    },
    input: [
      { role: "system", content: prompt },
      { role: "system", content: entityInfo },
      { role: "user", content: `Query: ${query}, Context: ${context}` },
    ],
    text: {
      format: zodTextFormat(ValidationSchema, "validation_output"),
    },
  });
  if (!response.output_parsed) {
    throw new Error("Failed to parse validation output");
  }
  return {
    entity: {
      type: entity.type,
      id: entity.id,
      name: entity.name,
      reason: response.output_parsed.reason,
      relevantFiles: response.output_parsed.relevantFiles,
    },
    isValid: response.output_parsed.valid,
  };
};

export const refineSearchResults = async (
  entities: EntityGroup[],
  supabase: SupabaseClient,
  query: string,
  context: string,
  openai: OpenAI
): Promise<RefinementOutput> => {
  const validEntities: EntityResult[] = [];
  const invalidEntities: EntityResult[] = [];
  // Validate entities in parallel
  const validationPromises = entities.map((entity) =>
    validateEntity(entity, supabase, query, context, openai)
  );
  const validationResults = await Promise.all(validationPromises);
  for (let i = 0; i < entities.length; i++) {
    const validation = validationResults[i];
    if (validation.isValid) {
      validEntities.push(validation.entity);
    } else {
      invalidEntities.push(validation.entity);
    }
  }

  return {
    validEntities,
    invalidEntities,
  };
};
