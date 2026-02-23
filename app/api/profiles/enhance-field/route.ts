import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { authenticateRequest } from "@/lib/api/auth-middleware";
import { validateTokenLimit, Tier } from "@/lib/api/token-guard";
import { checkTokenBudget, debitTokens, resolveIdentity } from "@/lib/api/token-budget";
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

    // 2. Parse request body
    const body = await request.json();
    const {
      fieldType,
      text,
      messages,
    }: {
      fieldType: "external_tldr" | "chunk" | "event_description";
      text: string;
      messages: { role: "user" | "assistant"; content: string }[];
    } = body;

    const fullInput = [
      text,
      ...(messages ?? []).map((m: { content: string }) => m.content),
    ].join("\n");
    const tier: Tier = user.is_anonymous ? "anon" : "verified";
    const tokenCheck = validateTokenLimit(fullInput, tier);
    if (!tokenCheck.ok) return tokenCheck.response;

    const identity = resolveIdentity(user.id, request);
    const budgetCheck = await checkTokenBudget(supabase, identity, tier, tokenCheck.tokenCount, request.nextUrl.pathname);
    if (!budgetCheck.ok) return budgetCheck.response;

    const isEventDescription = fieldType === "event_description";
    let chunksText = "";
    if (!isEventDescription) {
      // 3. Fetch the user's visible profile chunks as context
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
      chunksText = (chunks ?? [])
        .filter((c) => c.summary_text && c.summary_text.trim().length > 0)
        .map((c) => `- [${c.category ?? "general"}] ${c.summary_text}`)
        .join("\n")
        .slice(0, 4000);
    }
    const fieldLabel =
      fieldType === "chunk"
        ? "profile highlight"
        : isEventDescription
        ? "club event description"
        : "external TLDR";
    const draftLabel = isEventDescription ? "event description" : fieldLabel;

    // 4. Decide whether to EDIT or GENERATE
    const draft = (text ?? "").trim();

    const looksPlaceholder =
      draft.length === 0 ||
      draft.length < 20 ||
      /^(n\/a|na|none|tbd|todo|placeholder|\(none provided\))$/i.test(draft);

    const generateRequested = (messages ?? []).some((m) => {
      if (m.role !== "user") return false;
      if (isEventDescription) {
        return /(write|generate|create).*(event|description|blurb|invite|overview)/i.test(
          m.content
        );
      }
      return /(write|generate|create).*(tldr|summary)|write something engaging|make (me )?(an )?(engaging )?(tldr|summary)/i.test(
        m.content
      );
    });

    // Never generate new content for individual chunks
    const mode: "EDIT" | "GENERATE" =
      fieldType === "chunk"
        ? "EDIT"
        : looksPlaceholder || generateRequested
        ? "GENERATE"
        : "EDIT";

    // 5. System prompt (supports EDIT and GENERATE modes)
    const systemPrompt = (isEventDescription
      ? `
You are an AI writing coach helping a university club write a clear, engaging event description.

You must operate in TWO modes:

MODE 1 — EDIT:
- If the user provides a meaningful draft, do a light editorial pass.
- Preserve the club's tone (student-friendly and inclusive) unless explicitly asked to change.
- Keep the structure and meaning of each sentence largely the same.
- Improve clarity, flow, and correctness only.
- Do NOT invent details like date, time, location, speakers, costs, or links.

MODE 2 — GENERATE:
- If the draft is empty or placeholder, OR the user asks you to write one, generate a new event description.
- Use ONLY details provided in the chat history and/or the draft.
- If important details are missing, keep it general instead of fabricating specifics.
- Follow the user's requested style (e.g. engaging, confident, formal).

Length guidelines:
- Event descriptions: 2–4 sentences.

You must respond with a pure JSON object of the form:
{
  "reply": "<NON-EMPTY. 1–2 sentences describing what you did and asking what tone they want if relevant>",
  "improvedText": "<the final edited or generated text>"
}
Rules:
- "reply" must be a non-empty string (at least 10 characters).
- "improvedText" must be a non-empty string.
Do NOT wrap this JSON in backticks and do NOT add any extra commentary.
    `
      : `
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
    `
    ).trim();

    // 6. Build inputs for OpenAI Responses API
    const contextMessage = isEventDescription
      ? {
          role: "user" as const,
          content:
            "EVENT CONTEXT: Use only details explicitly provided in the chat or draft. Do not invent missing specifics.",
        }
      : {
          role: "user" as const,
          content:
            chunksText.length > 0
              ? `PROFILE CHUNKS (use these as the factual source of truth):\n${chunksText}`
              : "PROFILE CHUNKS: (none available)",
        };

    const draftMessage = {
      role: "user" as const,
      content: isEventDescription
        ? `Draft ${draftLabel} (may be empty or placeholder; if so, generate from chat details):\n\n"""${text ?? ""}"""`
        : `Draft ${draftLabel} (may be empty or placeholder; if so, generate from chunks):\n\n"""${text ?? ""}"""`,
    };

    const inputMessages = [
      // Explicitly state which mode to use
      { role: "user" as const, content: `Mode: ${mode}` },

      // Provide context
      contextMessage,

      // Conversation history (style and intent)
      ...messages,

      // Current draft (may be empty)
      draftMessage,
    ];

    // 7. Call OpenAI (Responses API)
    const response = await client.responses.create({
      model: "gpt-5-mini",
      instructions: systemPrompt,
      input: inputMessages,
      temperature: 0.4,
    });

    const actualTokens = response.usage?.total_tokens ?? tokenCheck.tokenCount;
    await debitTokens(supabase, identity, tier, actualTokens, request.nextUrl.pathname);

    const raw = response.output_text ?? "{}";

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
