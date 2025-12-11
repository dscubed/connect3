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

  // Combine queries into a single search string
  const combinedQuery = queries.join(" ");
  console.log(`Searching with combined query: "${combinedQuery}"`);

  // Search each vector store in parallel
  const allResults: SearchResult[] = [];

  await Promise.all(
    Object.entries(searchFilters).map(async ([type, filter]) => {
      console.log(`Searching ${type} vector store: ${filter.vsId}`);
      const results = await searchSingleVectorStore(combinedQuery, filter, openai);
      console.log(`Found ${results.length} results in ${type} vector store`);
      allResults.push(...results);
    })
  );

  console.log(`Total results: ${allResults.length}`);
  return allResults;
};

const searchSingleVectorStore = async (
  query: string,
  search_filter: SearchFilter,
  openai: OpenAI
): Promise<SearchResult[]> => {
  try {
    // Hybrid approach: Only use API filter if exclusion set is small
    // Large exclusion sets cause performance issues with nin filters
    const useApiFilter = search_filter.entityIds.size > 0 && search_filter.entityIds.size < 50;
    const requestedResults = useApiFilter ? 15 : 20;

    console.log(`Entity exclusion set size: ${search_filter.entityIds.size}, using API filter: ${useApiFilter}`);

    // Build filter if safe to use
    // @ts-expect-error: OpenAI nin type is supported but SDK is out of date
    const filters = useApiFilter
      ? {
          type: "nin",
          key: "id",
          value: Array.from(search_filter.entityIds),
        }
      : undefined;

    const response = await openai.vectorStores.search(search_filter.vsId, {
      query: query,
      rewrite_query: false,
      ranking_options: {
        score_threshold: 0.2,
      },
      ...(filters && { filters }),
      max_num_results: requestedResults,
    });

    console.log(`Raw API response: ${response.data.length} items`);

    // Always apply in-memory filter as safety net
    const results: SearchResult[] = response.data
      .filter((item) => {
        const attributes = item.attributes as Record<string, string> | null;
        const id = attributes?.id ? String(attributes.id) : null;

        // Skip items without valid IDs
        if (!id) {
          console.warn("Skipping item without valid ID:", item);
          return false;
        }

        if (search_filter.entityIds.has(id)) {
          console.log(`Filtering out seen entity: ${id}`);
          return false;
        }

        return true;
      })
      .slice(0, 15) // Always trim to 15
      .map((item) => {
        const attributes = item.attributes as Record<string, string> | null;
        if (!attributes) {
          console.error("Missing attributes in vector store item:", item);
        }

        return {
          file_id: item.file_id,
          text: item.content[0].text,
          name: attributes?.name ? String(attributes.name) : "unknown",
          type: attributes?.type ? (attributes.type as EntityType) : "user",
          id: attributes?.id ? String(attributes.id) : "unknown",
          score: item.score,
        };
      });

    return results;
  } catch (error) {
    console.error("Vector store search error:", error);
    throw error;
  }
};
