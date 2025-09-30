import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { authenticateRequest } from "@/lib/api/auth-middleware";

export const config = {
  runtime: "edge",
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    // Parse body for userId (and optionally chunks)
    const body = await request.json();

    console.log("body:", body);
    if (!body || typeof body !== "object" || Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const userId = body.userId;
    const userPrompt = body.userPrompt;
    const currentTldr = body.currentTldr || "";

    console.log(userId);

    if (!userId || !user.id) {
      return NextResponse.json({ error: "User ID required" }, { status: 401 });
    }
    if (userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Fetch chunks from DB
    const { data: chunks, error } = await supabase
      .from("user_files")
      .select("summary_text")
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("created_at", { ascending: false });

    console.error(error);
    if (error) throw error;

    // Prepare prompt for LLM
    const summaries = (chunks ?? [])
      .map((c, i) => `Chunk ${i + 1}: ${c.summary_text}`)
      .join("\n");
    const prompt = `
    Summarize the following profile chunks into a concise TLDR
    Make it 2-3 sentences, focus on any recent skills and experience and anything notable.
    Sentences should be short and concise and have one or two references no more.
    You don't have to reference every single chunk

    ${currentTldr ? `Current TLDR: ${currentTldr}` : ""}
    
    ${userPrompt ? `User's Instructions: ${userPrompt}` : ""}

    -DON'T GENERATE ANY OTHER TEXT, MARKDOWNS, ETC. JUST THE RAW TEXT
    `;

    // Use OpenAI responses API for structured output
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content: prompt,
        },
        {
          role: "user",
          content: summaries,
        },
      ],
    });

    const tldr = response.output_text || "Failed to generate TLDR.";

    return NextResponse.json(
      {
        tldr,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating TLDR:", error);
    return NextResponse.json(
      { error: "Failed to generate TLDR" },
      { status: 500 }
    );
  }
}
