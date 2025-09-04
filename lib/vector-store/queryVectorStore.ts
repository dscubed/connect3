// lib/vector-store/queryVectorStore.ts
import { queryVectorStore } from "./queryVectorStoreUtils";
import type { SearchResult } from "./queryVectorStoreUtils";

export async function runSearch(query: string): Promise<SearchResult> {
  try {
    const vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID;
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!vectorStoreId || !openaiApiKey) {
      throw new Error("Missing required environment variables");
    }
    
    const parsed = await queryVectorStore(query, vectorStoreId, openaiApiKey);
    return parsed;
  } catch (err) {
    console.error("Error querying vector store:", err);
    throw err;
  }
}
