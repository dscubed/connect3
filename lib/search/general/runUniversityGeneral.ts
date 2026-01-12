import OpenAI from "openai";
import { countWebSearchCalls } from "./countWebSearches";
import type { SearchResponse } from "../types"; // adjust path if needed

type RunUniversityGeneralOpts = {
  traceId?: string;
  emit?: (event: string, data: unknown) => void;
};

// Detect if the model actually used KB (file_search citations exist)
function hasFileCitations(resp: any): boolean {
  const outputs = resp?.output ?? [];
  for (const o of outputs) {
    if (o?.type !== "message") continue;
    const content = o?.content ?? [];
    for (const c of content) {
      const anns = c?.annotations ?? [];
      if (anns.some((a: any) => a?.type === "file_citation")) return true;
    }
  }
  return false;
}

export async function runUniversityGeneral(
  openai: OpenAI,
  query: string,
  uniSlug: string,
  vectorStoreId: string,
  opts?: RunUniversityGeneralOpts
): Promise<SearchResponse> {
  const traceId = opts?.traceId ?? "uni_no_trace";
  const emit = opts?.emit;

  console.log("[runUniversityGeneral] start", { traceId, uniSlug, vectorStoreId });

  const uniKbSystem = `
You are a university help assistant for ${uniSlug}.
Use file_search results to answer.

Rules:
- You MAY include inline links naturally in the summary (e.g. "use the [application portal](...)").
- Do NOT add a separate "Key Links"/"Related Links" section.
- Do NOT invent URLs.
- If you can't find relevant info in KB, answer briefly and let the system fall back to web.
`.trim();

  const uniWebSystem = `
You are a university help assistant for ${uniSlug}.
Use web search. Prefer official university or government sources.

Rules:
- You MAY include inline links naturally in the summary.
- Do NOT add a separate "Key Links"/"Related Links" section.
- Do NOT invent URLs.
`.trim();

  // 1) KB attempt
  const kbResp = await openai.responses.create({
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: uniKbSystem },
      { role: "user", content: query },
    ],
    tools: [
      {
        type: "file_search",
        vector_store_ids: [vectorStoreId],
        max_num_results: 8,
      } as any,
    ],
  });

  const kbHit = hasFileCitations(kbResp);

  console.log("[runUniversityGeneral] kb_check", {
    traceId,
    kbHit,
    inputTokens: kbResp.usage?.input_tokens,
    outputTokens: kbResp.usage?.output_tokens,
    totalTokens: kbResp.usage?.total_tokens,
  });

  if (kbHit) {
    return {
      summary: (kbResp.output_text ?? "").trim(),
      results: [],
      followUps: "",
    };
  }

  // 2) Web fallback
  const webResp = await openai.responses.create({
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: uniWebSystem },
      { role: "user", content: query },
    ],
    tools: [{ type: "web_search_preview" as any }],
  });

  emit?.(
    "progress",
    `WEB SEARCH usage: calls=${countWebSearchCalls(webResp)} tokens=${webResp.usage?.total_tokens}`
  );

  console.log("[runUniversityGeneral] web_search_usage", {
    traceId,
    webCalls: countWebSearchCalls(webResp),
    inputTokens: webResp.usage?.input_tokens,
    outputTokens: webResp.usage?.output_tokens,
    totalTokens: webResp.usage?.total_tokens,
  });

  return {
    summary: (webResp.output_text ?? "").trim(),
    results: [],
    followUps: "",
  };
}