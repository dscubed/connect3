import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export interface InstantSearchResult {
  id: string;
  result_type: "user" | "organisation" | "event";
  name: string;
  snippet: string;
  avatar_url: string | null;
  sub_label: string | null;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("instant_search", {
      query_text: q,
      result_limit: 4,
    });

    if (error) {
      console.error("[instant-search] RPC error:", error);
      return NextResponse.json({ results: [] });
    }

    return NextResponse.json(
      { results: (data ?? []) as InstantSearchResult[] },
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
