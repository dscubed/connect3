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

    // Parse body for userId, prompt (optional), currentTldr (optional)
    const body = await request.json();

    if (!body || typeof body !== "object" || Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const userId = body.userId;
    const userPrompt = body.userPrompt;
    const currentTldr = body.currentTldr || "";

    if (!userId || !user.id) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
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
      You are refining a student's profile summary ("TLDR") using their profile chunks.
      
      - Keep it 2-3 sentences.
      - Use clear, professional tone.
      - Emphasise recent skills, projects, roles, and notable awards.
      - You may rewrite the current TLDR for clarity, but keep key meaning.
      
      Current TLDR (may be empty):
      ${currentTldr || "(none provided)"}
      
      ${userPrompt ? `User's additional instructions: ${userPrompt}` : ""}
      
      Now produce the improved TLDR only as plain text (no bullets, no markdown).
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

    return NextResponse.json({
      success: true,
      tldr,
    });
  } catch (error) {
    console.error("Error generating TLDR:", error);
    return NextResponse.json(
      { error: "Failed to generate TLDR" },
      { status: 500 }
    );
  }
}
