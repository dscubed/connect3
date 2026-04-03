import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const VECTOR_STORES = [
  { id: process.env.OPENAI_USER_VECTOR_STORE_ID!, label: "users" },
  { id: process.env.OPENAI_ORG_VECTOR_STORE_ID!, label: "clubs" },
  { id: process.env.OPENAI_EVENTS_VECTOR_STORE_ID!, label: "events" },
];

interface VectorResult {
  id: string;
  type: string;
  score: number;
  content: string;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q || !q.trim()) {
    return NextResponse.json(
      { results: [], error: "Missing query parameter 'q'" },
      { status: 400 },
    );
  }

  try {
    // Search all vector stores in parallel
    const searches = VECTOR_STORES.map(async (store) => {
      try {
        const results = await openai.vectorStores.search(store.id, {
          query: q,
          max_num_results: 5,
          rewrite_query: true,
          ranking_options: { score_threshold: 0.1 },
        });

        return results.data
          .map((r): VectorResult | null => {
            if (!r.attributes) return null;
            const id = r.attributes.id as string;
            const type = r.attributes.type as string;
            return {
              id,
              type,
              score: Math.round(r.score * 1000) / 1000,
              content: r.content.map((c) => c.text).join("\n"),
            };
          })
          .filter((i): i is VectorResult => i !== null);
      } catch (err) {
        console.error(`[search] Error searching ${store.label}:`, err);
        return [];
      }
    });

    const allResults = (await Promise.all(searches)).flat();

    // Sort by score descending and take top 10
    allResults.sort((a, b) => b.score - a.score);
    const top = allResults.slice(0, 10);

    return NextResponse.json({ results: top });
  } catch (err) {
    console.error("[search] Unexpected error:", err);
    return NextResponse.json(
      { results: [], error: "Search failed" },
      { status: 500 },
    );
  }
}
