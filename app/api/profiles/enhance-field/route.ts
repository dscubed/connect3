import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { authenticateRequest } from "@/lib/api/auth-middleware";
import { createClient } from "@supabase/supabase-js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate the request (same pattern as your other routes)
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult; // 401 / error response from auth-middleware
    }
    const { user } = authResult;

    // 2. Fetch some of the user's visible chunks as context for the model
    const { data: chunks, error: chunksError } = await supabase
    .from("user_files")
    .select("summary_text, category, visible")
    .eq("user_id", user.id)
    .eq("visible", true)
    .order("created_at", { ascending: false })
    .limit(30);

    if (chunksError) {
    console.error("Error fetching chunks for enhance-field:", chunksError);
    }

    // Build a compact text context from summary_text + category
    const chunksText = (chunks ?? [])
    .filter((c) => c.summary_text && c.summary_text.trim().length > 0)
    .map(
    (c) =>
        `- [${c.category ?? "general"}] ${c.summary_text}`
    )
    .join("\n")
    .slice(0, 4000);

    // 3. Parse body
    const body = await request.json();
    const {
      fieldType,
      text,
      messages,
    }: {
      fieldType: "external_tldr" | "chunk";
      text: string;
      messages: { role: "user" | "assistant"; content: string }[];
    } = body;

    const fieldLabel =
      fieldType === "chunk"
        ? "profile highlight"
        : "external TLDR";


    const systemPrompt = `
    You are an AI writing coach helping a university student improve a short ${fieldLabel}.
    Your role is to polish the user's writing - not to rewrite it.

    Editing principles (very important):
    - Preserve the user's existing voice, tone, formality level, and point of view unless the user explicitly asks for a change.
    - Keep the core phrasing, rhythm, and personal style of the user's text. Only adjust wording when it clearly improves clarity, correctness, or flow.
    - Do NOT replace simple words with overly formal or corporate ones unless requested.
    - Do NOT shift from first-person to third-person or vice versa unless the user asks.
    - Aim to keep the structure and meaning of each sentence the same.
    - Think of this as a **light editorial pass**, not a transformation.

    Content guidelines:
    - For TLDRs: keep the final output to around 2-3 sentences.
    - For highlights: keep it to 1-3 concise sentences.
    - Emphasise concrete skills, outcomes, and impact when they are already present in the text.
    - Do not invent achievements or add details that the user did not provide.

    You must respond with a pure JSON object of the form:
    {
    "reply": "<what you say back in chat (feedback, explanation)>",
    "improvedText": "<the improved version of the user's text>"
    }
    Do NOT wrap this JSON in backticks and do NOT add any extra commentary.
    `.trim();

    const openaiMessages = [
      { role: "system" as const, content: systemPrompt },
      {
        role: "user" as const,
        content:
          chunksText.length > 0
            ? `Here are some of my profile chunks and highlights for context:\n${chunksText}`
            : "I don't have extra chunks available, just use the text I provide.",
      },
      ...messages,
      {
        role: "user" as const,
        content: `Here is the current ${fieldLabel} we are editing:\n\n"""${text}"""`,
      },
    ];

    // 3. Call OpenAI
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: openaiMessages,
      temperature: 0.4,
    });

    const raw = completion.choices[0].message.content ?? "{}";

    let parsed: { reply: string; improvedText: string };
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {
        reply:
          "I had trouble formatting a full suggestion, but you can keep refining your text manually.",
        improvedText: text,
      };
    }

    // 4. Return JSON to the client
    return NextResponse.json(
      {
        reply: parsed.reply,
        improvedText: parsed.improvedText || text,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("enhance-field error:", error);
    return NextResponse.json(
      { error: "Something went wrong while enhancing the text." },
      { status: 500 }
    );
  }
}
