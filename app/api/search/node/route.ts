import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  executeSearchPlan,
  generateResponse,
  SearchPlan,
  SearchFilters,
  createEmptyFilters,
} from "@/lib/search/searchNode";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const searchPlan: SearchPlan = {
      events: body.search_plan?.events ?? null,
      users: body.search_plan?.users ?? null,
      organisations: body.search_plan?.organisations ?? null,
    };

    const filters: SearchFilters = body.filters ?? createEmptyFilters();
    const query: string = body.query ?? "";
    const context: string = body.context ?? "";
    const withResponse: boolean = body.with_response ?? false;

    const searchResults = await executeSearchPlan(openai, searchPlan, filters);

    if (!withResponse) {
      return NextResponse.json(searchResults);
    }

    const response = await generateResponse(openai, query, searchResults, context);

    return NextResponse.json({ searchResults, response });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Search failed" },
      { status: 500 }
    );
  }
}
