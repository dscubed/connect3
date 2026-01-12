// src/lib/search/general/runUniversityGeneral.ts
import OpenAI from "openai";
import { countWebSearchCalls } from "./countWebSearches";
import { planUniRetrieval } from "./planUniRetrieval";

export type SearchResponse = {
  summary: string;
  results: any[];
  followUps: string;
};

type RunUniversityGeneralOpts = {
  traceId?: string;
  emit?: (event: string, data: unknown) => void;
};

function buildChunkTypeFilters(chunkTypes: string[]) {
  if (!chunkTypes?.length) return undefined;
  return chunkTypes.length === 1
    ? { type: "eq", key: "chunk_type", value: chunkTypes[0] }
    : {
        type: "or",
        filters: chunkTypes.map((ct) => ({
          type: "eq",
          key: "chunk_type",
          value: ct,
        })),
      };
}

type RetrievedChunk = {
  file_id?: string;
  filename?: string;
  score?: number;
  text?: string;
};

function extractTextFromResult(r: any): string {
  if (!r) return "";
  if (typeof r.text === "string" && r.text.trim()) return r.text.trim();

  // Sometimes: content: [{ type:"text", text:"..." }, ...]
  const content = Array.isArray(r.content) ? r.content : null;
  if (content) {
    const parts = content
      .map((c: any) => (typeof c?.text === "string" ? c.text : ""))
      .filter(Boolean);
    const joined = parts.join("\n").trim();
    if (joined) return joined;
  }
  return "";
}

function extractFileSearchResults(resp: any): RetrievedChunk[] {
  const out: RetrievedChunk[] = [];
  const outputs = Array.isArray(resp?.output) ? resp.output : [];

  for (const o of outputs) {
    if (o?.type === "file_search_call") {
      const results = Array.isArray(o?.results) ? o.results : [];
      for (const r of results) {
        out.push({
          file_id: r?.file_id ?? r?.fileId,
          filename: r?.filename ?? r?.file_name ?? r?.name,
          score: typeof r?.score === "number" ? r.score : undefined,
          text: extractTextFromResult(r),
        });
      }
    }
  }

  // de-dupe
  const seen = new Set<string>();
  return out.filter((r) => {
    const key = `${r.file_id ?? "nofile"}::${(r.text ?? "").slice(0, 120)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildContextPack(chunks: RetrievedChunk[], maxChars = 12000): string {
  let buf = "";
  for (const c of chunks) {
    const text = (c.text ?? "").trim();
    if (!text) continue;

    const header = `\n---\nSOURCE\nfile_id: ${c.file_id ?? "unknown"}\nfilename: ${
      c.filename ?? "unknown"
    }\nscore: ${c.score ?? "n/a"}\n---\n`;

    const addition = header + text + "\n";
    if (buf.length + addition.length > maxChars) break;
    buf += addition;
  }
  return buf.trim();
}

// Optional: strip accidental "Key Links" sections while keeping inline links
function stripStandaloneLinksSection(md: string): string {
  if (!md) return md;
  // Remove headings like "Key Links" / "Related Links" and the list right after.
  return md.replace(
    /\n#{2,6}\s*(key links|related links|links)\s*\n([\s\S]*?)(?=\n#{2,6}\s|\n$)/gi,
    "\n"
  ).trim();
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

  const retrievalPlan = planUniRetrieval(query);

  console.log("[runUniversityGeneral] start", {
    traceId,
    uniSlug,
    vectorStoreId,
    retrievalPlan,
  });

  // --------------------
  // Step A: Retrieval (file_search)
  // --------------------
  const retrievalResp = await openai.responses.create({
    model: "gpt-4o-mini",
    input: [
      {
        role: "system",
        content:
          "You are a retriever. Use file_search to find relevant passages. Do not answer the question.",
      },
      { role: "user", content: query },
    ],
    tools: [
      {
        type: "file_search",
        vector_store_ids: [vectorStoreId],
        max_num_results: retrievalPlan.maxNumResults,
        ...(retrievalPlan.chunkTypes?.length
          ? { filters: buildChunkTypeFilters(retrievalPlan.chunkTypes) }
          : {}),
      } as any,
    ],
  });

  const retrieved = extractFileSearchResults(retrievalResp);
  const contextPack = buildContextPack(retrieved);

  console.log("[runUniversityGeneral] retrieval_done", {
    traceId,
    retrievedCount: retrieved.length,
    contextChars: contextPack.length,
    usage: retrievalResp.usage,
  });

  const kbHit = retrieved.length > 0 && contextPack.length > 0;

  // --------------------
  // Step B: Answer (no tools, use context only)
  // --------------------
  if (kbHit) {
    const answerSystem = `
You are a university help assistant for ${uniSlug}.

Use ONLY the provided CONTEXT. If the context doesn't contain the answer, say so.

Rules:
- Include inline markdown links naturally ONLY if the URL appears in the CONTEXT.
- Do NOT add a separate "Key Links" / "Related Links" section.
- Do NOT invent URLs.

Write the answer as markdown (not JSON).
Be structured and actionable (steps/bullets are fine).
`.trim();

    const answerResp = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        { role: "system", content: answerSystem },
        {
          role: "user",
          content: `USER QUESTION:\n${query}\n\nCONTEXT:\n${contextPack}`,
        },
      ],
    });

    const summary = stripStandaloneLinksSection(
      (answerResp.output_text ?? "").trim()
    );

    return { summary, results: [], followUps: "" };
  }

  // --------------------
  // Web fallback (no parse; still returns object)
  // --------------------
  const webSystem = `
You are a university help assistant for ${uniSlug}.
The KB didn't have relevant info. Use web search.

Rules:
- Prefer official university / student union / government sources.
- Include inline markdown links naturally where relevant.
- Do NOT add a separate "Key Links" / "Related Links" section.
- Do NOT invent URLs.
`.trim();

  const webResp = await openai.responses.create({
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: webSystem },
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
    usage: webResp.usage,
  });

  const summary = stripStandaloneLinksSection((webResp.output_text ?? "").trim());
  return { summary, results: [], followUps: "" };
}