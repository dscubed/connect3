import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createServiceClient } from "@/lib/supabase/service";

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
          max_num_results: 20,
          rewrite_query: true,
          ranking_options: { score_threshold: 0.35 },
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

    // Search instagram_posts via Supabase FTS
    const instagramSearch = async (): Promise<VectorResult[]> => {
      try {
        const supabase = createServiceClient();
        const { data, error } = await supabase
          .from("instagram_posts")
          .select("id, caption")
          .textSearch("caption", q, { type: "websearch", config: "english" })
          .order("timestamp", { ascending: false })
          .limit(20);

        if (error || !data) return [];

        return data.map((post) => ({
          id: post.id,
          type: "instagram_post",
          score: 0.5,
          content: post.caption ?? "",
        }));
      } catch (err) {
        console.error("[search] Error searching instagram_posts:", err);
        return [];
      }
    };

    // Name-match boost: profiles and events whose names contain the query
    // get a high score so they always rank above semantic-only matches.
    const nameMatchSearch = async (): Promise<VectorResult[]> => {
      try {
        const supabase = createServiceClient();
        const term = q.trim().toLowerCase();

        const [{ data: profiles }, { data: events }] = await Promise.all([
          supabase
            .from("profiles")
            .select("id, account_type, first_name")
            .ilike("first_name", `%${term}%`)
            .limit(10),
          supabase
            .from("events")
            .select("id, name")
            .ilike("name", `%${term}%`)
            .eq("status", "published")
            .limit(10),
        ]);

        const profileResults: VectorResult[] = (profiles ?? []).map((p) => ({
          id: p.id,
          type: p.account_type === "organisation" ? "organisation" : "user",
          // Exact prefix match scores higher than a mid-string match
          score: p.first_name?.toLowerCase().startsWith(term) ? 1.0 : 0.92,
          content: p.first_name ?? "",
        }));

        const eventResults: VectorResult[] = (events ?? []).map((e) => ({
          id: e.id,
          type: "events",
          score: e.name?.toLowerCase().startsWith(term) ? 1.0 : 0.92,
          content: e.name ?? "",
        }));

        return [...profileResults, ...eventResults];
      } catch (err) {
        console.error("[search] Error in name-match search:", err);
        return [];
      }
    };

    const allResults = (
      await Promise.all([...searches, instagramSearch(), nameMatchSearch()])
    ).flat();

    // Deduplicate by id — keep whichever occurrence has the highest score
    const deduped = new Map<string, VectorResult>();
    for (const r of allResults) {
      const existing = deduped.get(r.id);
      if (!existing || r.score > existing.score) {
        deduped.set(r.id, r);
      }
    }

    const finalResults = [...deduped.values()].sort(
      (a, b) => b.score - a.score,
    );

    return NextResponse.json({ results: finalResults });
  } catch (err) {
    console.error("[search] Unexpected error:", err);
    return NextResponse.json(
      { results: [], error: "Search failed" },
      { status: 500 },
    );
  }
}
