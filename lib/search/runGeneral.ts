import z from "zod";
import OpenAI from "openai";
import { SupabaseClient } from "@supabase/supabase-js";
import { zodTextFormat } from "openai/helpers/zod.mjs";
import { KBSearchResponse } from "./type";
import { partialParseKbResponse } from "./streamParserKb";

const KBSearchResponseSchema = z.object({
  summary: z.string(),
  results: z.array(
    z.object({
      header: z.string().nullable(),
      text: z.string(),
      file_ids: z.array(z.string()),
    })
  ),
  followUps: z.string(),
});

type RunGeneralInput = {
  chatmessageId: string;
  university_slug: string | null;
  confidence: number;
};

function getUniversityVectorStoreId(university_slug: string | null): string | null {
  // For now you said you’re focusing on UniMelb first.
  if (university_slug === "unimelb") {
    return process.env.OPENAI_UNIMELB_KB_VECTOR_STORE_ID ?? null;
  }
  return null;
}

export const runGeneral = async (
  input: RunGeneralInput,
  openai: OpenAI,
  supabase: SupabaseClient,
  emit: (event: string, data: unknown) => void
): Promise<KBSearchResponse> => {
  const { chatmessageId, university_slug, confidence } = input;

  // Guard: don’t route to a uni KB if we're unsure
  if (!university_slug || confidence < 0.6) {
    return {
      summary: "I’m not sure which university you mean.",
      results: [
        {
          header: "Clarify your university",
          text: "Which university are you asking about (e.g., UniMelb, Monash, UWA)?",
          file_ids: [],
        },
      ],
      followUps: "Tell me your university name and I’ll answer using the right KB.",
    };
  }

  const vectorStoreId = getUniversityVectorStoreId(university_slug);
  if (!vectorStoreId) {
    return {
      summary: `I don’t have a knowledge base for ${university_slug} yet.`,
      results: [
        {
          header: "Try the general Connect3 KB",
          text: "I can try a general answer, or you can tell me the official page you want me to use.",
          file_ids: [],
        },
      ],
      followUps:
        "Do you want a general answer, or can you share the official university/union page link?",
    };
  }

  // 1) Load the user question
  const { data, error } = await supabase
    .from("chatmessages")
    .select("query")
    .eq("id", chatmessageId)
    .single();

  if (error || !data?.query) {
    throw new Error("Failed to load chatmessages.query for runGeneral");
  }

  const query = String(data.query).trim();
  if (!query) {
    return {
      summary: "I didn’t receive a question.",
      results: [],
      followUps: "Try asking again with your question.",
    };
  }

  await emit("status", {
    step: "kb_search",
    message: `Searching ${university_slug} knowledge base...`,
  });

  // 2) Retrieve KB chunks from OpenAI vector store
  const search = await openai.vectorStores.search(vectorStoreId, {
    query,
    rewrite_query: false,
    ranking_options: { score_threshold: 0.2 },
    max_num_results: 10,
  });

  const kbExcerpts = search.data
    .map((r) => {
      const text = r.content?.[0]?.text ? String(r.content[0].text).trim() : "";
      if (!text) return null;

      const title =
        r.attributes && typeof (r.attributes as any).title === "string"
          ? String((r.attributes as any).title)
          : "";

      return {
        file_id: r.file_id,
        score: r.score,
        title,
        text,
      };
    })
    .filter(Boolean) as Array<{ file_id: string; score: number; title: string; text: string }>;

  // 3) Build prompt in the same “summarise results” pattern
  const prompt = `You are to answer a university-related user query using ONLY the provided KB excerpts.

Structure of JSON response:
{
  "summary": "A brief summary of the answer grounded in the KB excerpts.",
  "results": [
    {
      "header": "Optional header for this result section",
      "text": "Detailed answer text grounded in the KB excerpts.",
      "file_ids": ["file-..."] // file ids you used for this section
    }
  ],
  "followUps": "Suggested follow-up questions or actions for the user."
}

Rules:
- Use ONLY the KB excerpts below. Do not invent policies or procedures.
- If the KB excerpts do not contain the answer, say so and suggest a next step (official site / student union / ask for a link).
- Results should be ranked most relevant first.
- For simple queries, return ONE result section.
- For multi-part queries, return multiple sections.
`;

  const context = kbExcerpts
    .slice(0, 8)
    .map(
      (e, i) =>
        `[KB#${i + 1} | file_id=${e.file_id}] ${e.title ? `title: ${e.title}\n` : ""}${e.text}`
    )
    .join("\n\n");

  const stream = await openai.responses.create({
    model: "gpt-5-mini",
    reasoning: { effort: "low" },
    input: [
      { role: "system", content: prompt },
      { role: "system", content: `KB Excerpts:\n${context || "(none)"}` },
      { role: "user", content: `User Query: ${query}` },
    ],
    text: { format: zodTextFormat(KBSearchResponseSchema, "kb_search_response") },
    stream: true,
  });

  // 4) Stream handling (same style as generateResponse)
  let textContent = "";
  for await (const event of stream) {
    if (event.type === "response.output_text.delta" && "delta" in event) {
      textContent += event.delta;

      const partial = partialParseKbResponse(textContent);
      emit("response", { partial });
    }
  }

  // 5) Parse JSON and validate with zod (same style)
  let parsed: unknown;
  try {
    parsed = JSON.parse(textContent);
  } catch {
    throw new Error(`Failed to parse JSON response: ${textContent}`);
  }

  const validated = KBSearchResponseSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error(`Invalid response schema: ${validated.error.message}`);
  }

  // 6) Return in your expected format
  return {
    summary: validated.data.summary,
    results: validated.data.results.map((r) => ({
      header: r.header ?? undefined,
      text: r.text,
      file_ids: r.file_ids,
    })),
    followUps: validated.data.followUps,
  };
};
