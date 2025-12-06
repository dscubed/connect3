import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { runSearch } from "@/lib/search/agent";
import { generateResponse } from "@/lib/search/response";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const { chatmessageId } = await req.json();

    if (!chatmessageId) {
      return NextResponse.json(
        { success: false, error: "chatmessageId is required" },
        { status: 400 }
      );
    }

    const { query, state } = await runSearch(chatmessageId, openai, supabase);
    const response = await generateResponse(query, state, openai);

    return NextResponse.json({
      success: true,
      contextSummary: state.summary,
      query: query,
      entities: state.entities,
      invalidEntities: state.invalidEntities,
      response: response,
    });
  } catch (error) {
    console.error("Run search error:", error);
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}
