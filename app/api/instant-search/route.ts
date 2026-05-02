import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const VECTOR_STORES = [
  { id: process.env.OPENAI_USER_VECTOR_STORE_ID!, label: "users" },
  { id: process.env.OPENAI_ORG_VECTOR_STORE_ID!, label: "clubs" },
  { id: process.env.OPENAI_EVENTS_VECTOR_STORE_ID!, label: "events" },
];

// RRF constant — 60 is standard; higher = less aggressive reranking
const RRF_K = 60;

export interface InstantSearchResult {
  id: string;
  result_type: "user" | "organisation" | "event" | "instagram_post";
  name: string;
  snippet: string;
  avatar_url: string | null;
  sub_label: string | null;
  score: number;
}

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 20;

// Returns id → vector score (best score across all stores)
async function getVectorScores(q: string): Promise<Map<string, number>> {
  const scoreMap = new Map<string, number>();
  await Promise.all(
    VECTOR_STORES.map(async (store) => {
      try {
        const res = await openai.vectorStores.search(store.id, {
          query: q,
          max_num_results: 20,
          rewrite_query: true,
          ranking_options: { score_threshold: 0.3 },
        });
        for (const r of res.data) {
          const id = r.attributes?.id as string | undefined;
          if (!id) continue;
          const best = scoreMap.get(id) ?? 0;
          if (r.score > best) scoreMap.set(id, r.score);
        }
      } catch (err) {
        console.error(
          `[instant-search] Vector store ${store.label} error:`,
          err,
        );
      }
    }),
  );
  return scoreMap;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const limitParam = parseInt(req.nextUrl.searchParams.get("limit") ?? "", 10);
  const limit = isNaN(limitParam)
    ? DEFAULT_LIMIT
    : Math.min(limitParam, MAX_LIMIT);

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const supabase = await createClient();

    // Fetch more BM25 candidates than we'll show so RRF has room to rerank
    const bm25Limit = Math.min(limit * 4, MAX_LIMIT);

    const [bm25Data, vectorScores] = await Promise.all([
      supabase.rpc("instant_search_bm25", {
        query_text: q,
        result_limit: bm25Limit,
      }),
      getVectorScores(q),
    ]);

    if (bm25Data.error) {
      console.error("[instant-search] RPC error:", bm25Data.error);
      return NextResponse.json({ results: [] });
    }

    const bm25Results = (bm25Data.data ?? []) as InstantSearchResult[];

    // Build vector ranking: id → rank (0-based, sorted by score desc)
    const vectorRanking = new Map<string, number>(
      [...vectorScores.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([id], rank) => [id, rank]),
    );

    // RRF: hybrid_score = 1/(k + bm25_rank) + 1/(k + vector_rank)
    // If not in vector list, the vector term is omitted (pure BM25 rank)
    const reranked = bm25Results.map((result, bm25Rank) => {
      const vectorRank = vectorRanking.get(result.id);
      const bm25Term = 1 / (RRF_K + bm25Rank);
      const vectorTerm =
        vectorRank !== undefined ? 1 / (RRF_K + vectorRank) : 0;
      return { ...result, score: bm25Term + vectorTerm };
    });

    reranked.sort((a, b) => b.score - a.score);

    return NextResponse.json(
      { results: reranked.slice(0, limit) },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      },
    );
  } catch (err) {
    console.error("[instant-search] Unexpected error:", err);
    return NextResponse.json({ results: [] });
  }
}
