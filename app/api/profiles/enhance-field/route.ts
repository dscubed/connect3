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
    // 1. Authenticate the request
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { user } = authResult;

    // 2. Fetch the user's visible profile chunks as context
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

    // Build a compact context string from the chunks
    const chunksText = (chunks ?? [])
      .filter((c) => c.summary_text && c.summary_text.trim().length > 0)
      .map(
        (c) => `- [${c.category ?? "general"}] ${c.summary_text}`
      )
      .join("\n")
      .slice(0, 4000);

    // 3. Parse request body
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

    // 4. Decide whether to EDIT or GENERATE
    const draft = (text ?? "").trim();

    const looksPlaceholder =
      draft.length === 0 ||
      draft.length < 20 ||
      /^(n\/a|na|none|tbd|todo|placeholder|\(none provided\))$/i.test(draft);

    const generateRequested = (messages ?? []).some(
      (m) =>
        m.role === "user" &&
        /(write|generate|create).*(tldr|summary)|write something engaging|make (me )?(an )?(engaging )?(tldr|summary)/i.test(
          m.content
        )
    );

    // Never generate new content for individual chunks
    const mode: "EDIT" | "GENERATE" =
      fieldType === "chunk"
        ? "EDIT"
        : looksPlaceholder || generateRequested
        ? "GENERATE"
        : "EDIT";

    // 5. System prompt (supports EDIT and GENERATE modes)
    const systemPrompt = `
You are an AI writing coach helping a university student produce a short ${fieldLabel}.

You must operate in TWO modes:

MODE 1 — EDIT:
- If the user provides a meaningful draft, do a light editorial pass.
- Preserve the user's voice, tone, formality level, and point of view unless explicitly asked to change.
- Keep the structure and meaning of each sentence largely the same.
- Improve clarity, flow, and correctness only.
- Do NOT over-formalise or introduce new information.

MODE 2 — GENERATE:
- If the draft is empty or placeholder, OR the user asks you to write one, generate a new ${fieldLabel}.
- Use ONLY the provided profile chunks as factual grounding.
- Do NOT invent achievements, metrics, employers, dates, or skills.
- If something is uncertain, omit it or phrase it generally.
- Follow the user's requested style (e.g. engaging, confident, formal).

Length guidelines:
- TLDRs: 2–3 sentences.
- Highlights: 1–3 concise sentences.

You must respond with a pure JSON object of the form:
{
  "reply": "<NON-EMPTY. 1–2 sentences describing what you did and asking what tone they want if relevant>",
  "improvedText": "<the final edited or generated text>"
}
Rules:
- "reply" must be a non-empty string (at least 10 characters).
- "improvedText" must be a non-empty string.
Do NOT wrap this JSON in backticks and do NOT add any extra commentary.
    `.trim();

    // 6. Build messages for OpenAI
    const openaiMessages = [
      { role: "system" as const, content: systemPrompt },

      // Explicitly state which mode to use
      { role: "user" as const, content: `Mode: ${mode}` },

      // Provide profile chunks as the factual source of truth
      {
        role: "user" as const,
        content:
          chunksText.length > 0
            ? `PROFILE CHUNKS (use these as the factual source of truth):\n${chunksText}`
            : "PROFILE CHUNKS: (none available)",
      },

      // Conversation history (style and intent)
      ...messages,

      // Current draft (may be empty)
      {
        role: "user" as const,
        content: `Draft ${fieldLabel} (may be empty or placeholder; if so, generate from chunks):\n\n"""${text ?? ""}"""`,
      },
    ];

    // 7. Call OpenAI
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

    // 8. Return response to client
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
