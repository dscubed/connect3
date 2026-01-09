import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { runSearch } from "@/lib/search/agent";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

const CHATMESSAGEID = "b4d148d2-f22a-4de4-93e4-318756d711c4";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { query } = await req.json();

  if (query) {
    const { error } = await supabase
      .from("chatmessages")
      .update({ query })
      .eq("id", CHATMESSAGEID);
    if (error) {
      return NextResponse.json(
        { error: "Failed to update chat message query" },
        { status: 500 }
      );
    }
  }

  try {
    const response = await runSearch(CHATMESSAGEID, openai, supabase);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/test/search:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
