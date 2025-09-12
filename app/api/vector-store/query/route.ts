// app/api/vector-store/query/route.ts
import { NextResponse } from "next/server";
import { runSearch } from "@/lib/vector-store/queryVectorStore";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json(
        { error: "Missing required field: query" },
        { status: 400 }
      );
    }

    const results = await runSearch(query);

    console.log("Search Results:", results);

    if (!results) {
      return NextResponse.json({ error: "Search failed" }, { status: 500 });
    } else {
      return NextResponse.json({
        success: true,
        result: results.result,
        matches: results.matches,
        followUps: results.followUps,
      });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Search failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
