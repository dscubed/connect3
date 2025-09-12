// lib/vector-store/queryVectorStore.ts
import { queryVectorStore } from "./queryVectorStoreUtils";
import type { SearchResult } from "./queryVectorStoreUtils";
import { fetchMultipleUsers, UserDetails } from "../users/fetchUserDetails";

export async function runSearch(query: string): Promise<SearchResult> {
  try {
    const vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID;
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!vectorStoreId || !openaiApiKey) {
      throw new Error("Missing required environment variables");
    }

    const parsed = await queryVectorStore(query, vectorStoreId, openaiApiKey);

    const userIds = Array.from(
      new Set(parsed.matches.map((match) => match.user_id))
    );
    console.log("Unique user IDs to fetch:", userIds);
    const userMap: Map<string, UserDetails> = await fetchMultipleUsers(userIds);

    // Map user details to matches
    const matchesWithUsers = parsed.matches.map((match) => {
      const user = userMap.get(match.user_id);
      return {
        ...match,
        full_name: user?.full_name || `User ${match.user_id.slice(0, 8)}`,
        avatar_url: user?.avatar_url || "",
      };
    });

    return {
      ...parsed,
      matches: matchesWithUsers,
    };
  } catch (err) {
    console.error("Error querying vector store:", err);
    throw err;
  }
}
