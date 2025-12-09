import { OpenAI } from "openai";
import { EntityTypeFilter, EntityType, SearchResult } from "./type";

interface SearchFilter {
  vsId: string;
  entityIds: Set<string>;
}

export const searchVectorStores = async (
  queries: string[],
  entities: EntityTypeFilter,
  entititesSeen: Record<EntityType, Set<string>>,
  openai: OpenAI
): Promise<SearchResult[]> => {
  // Build vector store ids
  const searchFilters: Record<EntityType, SearchFilter> = {} as Record<
    EntityType,
    SearchFilter
  >;

  if (entities.users) {
    searchFilters["user"] = {
      entityIds: entititesSeen["user"] || new Set<string>(),
      vsId: process.env.OPENAI_USER_VECTOR_STORE_ID!,
    };
  }
  if (entities.organisations) {
    searchFilters["organisation"] = {
      entityIds: entititesSeen["organisation"] || new Set<string>(),
      vsId: process.env.OPENAI_ORG_VECTOR_STORE_ID!,
    };
  }

  // Search each vector store in parallel
  const allResults: SearchResult[] = [];

  await Promise.all(
    Object.values(searchFilters).map(async (filter) => {
      const results = await searchSingleVectorStore(queries, filter, openai);
      allResults.push(...results);
    })
  );
  return allResults;
};

const searchSingleVectorStore = async (
  queries: string[],
  search_filter: SearchFilter,
  openai: OpenAI
): Promise<SearchResult[]> => {
  const filters =
    search_filter.entityIds.size > 0
      ? {
          type: "nin",
          key: "id",
          value: Array.from(search_filter.entityIds),
        }
      : undefined;

  const response = await openai.vectorStores.search(search_filter.vsId, {
    query: queries,
    rewrite_query: true,
    ranking_options: {
      score_threshold: 0.2,
    },
    // @ts-expect-error: OpenAI nin type is supported but SDK is out of date
    filters,
    max_num_results: 15,
  });

  const results: SearchResult[] = response.data.map((item) => {
    const attributes = item.attributes as Record<string, string> | null;
    if (!attributes) {
      console.error("Missing attributes in vector store item:", item);
    }

    return {
      file_id: item.file_id,
      text: item.content[0].text,
      name: attributes && attributes.name ? String(attributes.name) : "unknown",
      type:
        attributes && attributes.type
          ? (attributes.type as EntityType)
          : "user",
      id: attributes && attributes.id ? String(attributes.id) : "unknown",
      score: item.score,
    };
  });
  return results;
};
