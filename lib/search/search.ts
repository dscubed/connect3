import OpenAI from "openai";
import {
  EntityFilters,
  EntitySearchResponse,
  EntityType,
  FileMap,
  FileResult,
  FilterObject,
  SearchPlan,
} from "./types";
import { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod.mjs";
import { getFileText } from "../users/getFileText";

const FileSearchResponseSchema = z.object({
  fileIds: z.array(z.string()),
});

const searchSingleEntity = async (
  query: string,
  context: string,
  filters: FilterObject,
  entityType: EntityType,
  supabase: SupabaseClient,
  openai: OpenAI
): Promise<{ results: FileResult[]; fileMap: FileMap }> => {
  let vectorStoreId = "";

  if (entityType === "user")
    vectorStoreId = process.env.OPENAI_USER_VECTOR_STORE_ID!;
  else if (entityType === "organisation")
    vectorStoreId = process.env.OPENAI_ORG_VECTOR_STORE_ID!;
  else if (entityType === "events")
    vectorStoreId = process.env.OPENAI_EVENTS_VECTOR_STORE_ID!;
  else throw new Error(`Unknown entity type: ${entityType}`);

  const systemPrompt = `You are an expert search engine querying a vector store for relevant documents based on the user's query.
      Given the user's query, return a list of fileIds of relevant documents from the vector store.

      Return a JSON object with a single key "fileIds" containing the list of file IDs, e.g.:
      {"fileIds": ["file-id1", "file-id2", ...]}
      Return as many relevant file IDs as possible.
      ensure that the response is valid JSON.
      FILE IDs are in the format file-id1, file-id2, etc. DON'T USE THE FILENAME e.g. user_10.txt, event_5.txt
      The id following file- should be 22 characters long make sure file ids you include are valid.

      RETURN the full id including the 'file-' prefix.
      e.g. file-abcdefghijklmn12345678, file-zyxwvutsrqponm98765432.

      If no files are relevant to the query, return an empty list:
      {"fileIds": []}`;

  const vectorSearchTool = {
    type: "file_search" as const,
    vector_store_ids: [vectorStoreId],
    filters,
  };

  console.log(`Vector Search Tool for ${entityType}:`, vectorSearchTool);

  const response = await openai.responses.parse({
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: systemPrompt },
      { role: "system", content: `Context: ${context}` },
      { role: "user", content: `Search Query: ${query}` },
    ],
    // @ts-expect-error - filter type "nin" not recognized in SDK yet
    tools: [vectorSearchTool],
    max_tool_calls: 3,
    text: {
      format: zodTextFormat(FileSearchResponseSchema, "file_search_response"),
    },
  });

  if (!response.output_parsed) {
    return { results: [], fileMap: {} };
  }

  const outputParsed = response.output_parsed as EntitySearchResponse;

  const fileMap: FileMap = {};

  const fileResults = await Promise.all(
    outputParsed.fileIds.map(async (fileId) => {
      console.log(`Found file ID: ${fileId}`);
      const { fileContent, id } = await getFileContent(
        fileId,
        supabase,
        entityType
      );

      fileMap[fileId] = { id, type: entityType };

      return { fileId, text: fileContent };
    })
  );

  return { results: fileResults, fileMap };
};

const getFileContent = async (
  fileId: string,
  supabase: SupabaseClient,
  entityType: EntityType
): Promise<{ fileContent: string; id: string }> => {
  if (entityType === "user" || entityType === "organisation") {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("openai_file_id", fileId)
      .single();
    if (error || !data) {
      throw new Error(
        `Error fetching profile for file ID ${fileId}: ${error.message}`
      );
    }
    const fileContent = await getFileText(data.id, supabase);
    return { fileContent, id: data.id };
  } else if (entityType === "events") {
    // TODO: Implement event file content retrieval
    const { data, error } = await supabase
      .from("events")
      .select("id")
      .eq("openai_file_id", fileId)
      .single();
    if (error || !data) {
      throw new Error(
        `Error fetching profile for file ID ${fileId}: ${error.message}`
      );
    }

    // Placeholder until event content retrieval is implemented
    return { fileContent: "", id: data.id };
  }
  throw new Error(`Unknown entity type: ${entityType}`);
};

export const executeSearchPlan = async (
  searchPlan: SearchPlan,
  filters: EntityFilters,
  supabase: SupabaseClient,
  openai: OpenAI
): Promise<{ results: FileResult[]; fileMap: FileMap }> => {
  const allResults: FileResult[] = [];
  const mergedFileMap: FileMap = {};

  const entityTypes = Object.keys(searchPlan.searches) as EntityType[];

  await Promise.all(
    entityTypes.map(async (entityType) => {
      if (
        searchPlan.searches[entityType] == null ||
        searchPlan.searches[entityType] === ""
      )
        return;

      const query = searchPlan.searches[entityType];
      const { results, fileMap } = await searchSingleEntity(
        query,
        searchPlan.context,
        filters[entityType]!,
        entityType,
        supabase,
        openai
      );

      allResults.push(...results);
      Object.assign(mergedFileMap, fileMap);
    })
  );

  return { results: allResults, fileMap: mergedFileMap };
};
