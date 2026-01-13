// lib/search/general/runUniversityGeneral.ts
import OpenAI from "openai";
import { countWebSearchCalls } from "./countWebSearches";
import type { SearchResponse } from "../types";
import type { UniStores } from "./universities";

type RunUniversityGeneralOpts = {
  traceId?: string;
  emit?: (event: string, data: unknown) => void;
  intent?: "official" | "union" | "both";
};

// ---------- heuristics (no extra LLM node) ----------
function intentFromQuery(q: string): "official" | "union" | "both" {
  const s = q.toLowerCase();

  // official-first topics
  const official =
    /(special consideration|spec(ial)? consid|extension|defer|withdraw|enrol|enroll|re-enrol|fees|census|handbook|policy|policies|procedure|procedures|appeal|complaint|misconduct|plagiarism|academic integrity|graduation|visa|co(e)?|prereq|timetable|assessment policy|result release|transcript|stop\s*1|student admin|application|apply|admissions)/i;

  // union-first topics
  const union =
    /(advocacy|student union|guild|umsu|msa\b|rusu\b|welfare|wellbeing|food|free food|legal|tenancy|housing|accommodation help|clubs?|societ(y|ies)|events?|volunteer|volunteering|representation|student reps|safer community|peer support|counselling support|financial aid advice)/i;

  const o = official.test(s);
  const u = union.test(s);

  if (o && !u) return "official";
  if (u && !o) return "union";
  if (o && u) return "both";
  return "both";
}

export async function runUniversityGeneral(
  openai: OpenAI,
  query: string,
  uniSlug: string,
  vectorStores: UniStores,
  opts?: RunUniversityGeneralOpts
): Promise<SearchResponse> {
  const traceId = opts?.traceId ?? "uni_no_trace";
  const emit = opts?.emit;

  // Decide store intent without an LLM node
  const heuristicIntent = intentFromQuery(query);
  const intent = opts?.intent ?? heuristicIntent;

  // Choose store order
  const storesToQuery: { id: string; source: "Official" | "Student Union" }[] = [];

  const officialId = vectorStores.official;
  const unionId = vectorStores.union;

  if (intent === "official") {
    if (officialId) storesToQuery.push({ id: officialId, source: "Official" });
    if (unionId) storesToQuery.push({ id: unionId, source: "Student Union" }); // fallback
  } else if (intent === "union") {
    if (unionId) storesToQuery.push({ id: unionId, source: "Student Union" });
    if (officialId) storesToQuery.push({ id: officialId, source: "Official" }); // fallback
  } else {
    // "both": prefer official first, then union
    if (officialId) storesToQuery.push({ id: officialId, source: "Official" });
    if (unionId) storesToQuery.push({ id: unionId, source: "Student Union" });
  }

  // If no KB stores configured, go straight to web fallback
  if (storesToQuery.length === 0) {
    emit?.("status", {
      step: "uni_web_fallback",
      message: "No university KB configured, searching the web...",
    });

    const webResp = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content: `
You are a university help assistant for ${uniSlug}.
Use web search. Prefer official university or government sources.

Rules:
- For lists, use Markdown bullets with a blank line before the list:
  Example:
  Some intro sentence:

  - Item one
  - Item two
- You MAY include inline links naturally in the summary.
- Do NOT add a separate "Key Links"/"Related Links" section.
- Do NOT invent URLs.
`.trim(),
        },
        { role: "user", content: query },
      ],
      tools: [{ type: "web_search_preview" as any }],
    });

    emit?.(
      "progress",
      `WEB SEARCH usage: calls=${countWebSearchCalls(webResp)} tokens=${webResp.usage?.total_tokens}`
    );

    return { summary: (webResp.output_text ?? "").trim(), results: [], followUps: "" };
  }

  // Status message
  const searchMsg =
    storesToQuery.length === 2
      ? `Searching ${storesToQuery[0].source} then ${storesToQuery[1].source}...`
      : `Searching ${storesToQuery[0].source}...`;
  emit?.("status", { step: "uni_kb_search", message: searchMsg });

  /**
   * ONE LLM CALL:
   * - model calls file_search tools itself (for one or two stores)
   * - model produces the final answer (no retriever pass, no contextPack building)
   *
   * Key: you must pass BOTH vector store IDs to tools list, because a single tool call
   * can only target one store. The model will choose to call one or both.
   */
  const storeTooling = storesToQuery.map((s) => ({
    type: "file_search",
    // IMPORTANT: single store per tool call; the model can call multiple tools
    vector_store_ids: [s.id],
    max_num_results: 6,
  })) as any[];

  const system = `
You are a university help assistant for ${uniSlug}.

You MUST use file_search to retrieve relevant passages, then answer the user's question.

Grounding rules:
- Prefer [Official] information over [Student Union] if there is any conflict.
- If both sources are used, label key claims with [Official] or [Student Union].
- If information is missing from KB, say what is missing briefly and suggest what to search for next (do not invent details).

Formatting rules:
- For lists, use Markdown bullets with a blank line before the list.
- You MAY include inline links if they appear in retrieved content.
- Do NOT invent URLs.
- Do NOT add a separate "Key Links"/"Related Links" section.
`.trim();

  const answerResp = await openai.responses.create({
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: system },
      {
        role: "user",
        content: `
User question:
${query}

Source preference:
- Primary: ${storesToQuery[0].source}
${storesToQuery[1] ? `- Secondary: ${storesToQuery[1].source}` : ""}
`.trim(),
      },
    ],
    tools: storeTooling,
    temperature: 0.2,
  });

  // (Optional) log token usage
  console.log("[runUniversityGeneral] one_call", {
    traceId,
    intent,
    primary: storesToQuery[0].source,
    secondary: storesToQuery[1]?.source,
    usage: answerResp.usage,
  });

  // If the model failed to use KB at all, do a web fallback
  // (lightweight check: did any file_citation appear?)
  const usedKB = (() => {
    const outputs = answerResp?.output ?? [];
    for (const o of outputs) {
      if (o?.type !== "message") continue;
      const content = Array.isArray(o?.content) ? o.content : [];
      for (const c of content) {
        const anns = Array.isArray((c as any)?.annotations)
          ? (c as any).annotations
          : [];
        if (anns.some((a: any) => a?.type === "file_citation")) return true;
      }
    }
    return false;
  })();

  if (usedKB) {
    emit?.("status", { step: "uni_kb_answer", message: "Answered from university KB." });
    return { summary: (answerResp.output_text ?? "").trim(), results: [], followUps: "" };
  }

  emit?.("status", {
    step: "uni_web_fallback",
    message: "No KB match, searching the web...",
  });

  const webResp = await openai.responses.create({
    model: "gpt-4o-mini",
    input: [
      {
        role: "system",
        content: `
You are a university help assistant for ${uniSlug}.
Use web search. Prefer official university or government sources.

Rules:
- For lists, use Markdown bullets with a blank line before the list:
  Example:
  Some intro sentence:

  - Item one
  - Item two
- You MAY include inline links naturally in the summary.
- Do NOT add a separate "Key Links"/"Related Links" section.
- Do NOT invent URLs.
`.trim(),
      },
      { role: "user", content: query },
    ],
    tools: [{ type: "web_search_preview" as any }],
  });

  emit?.(
    "progress",
    `WEB SEARCH usage: calls=${countWebSearchCalls(webResp)} tokens=${webResp.usage?.total_tokens}`
  );

  return { summary: (webResp.output_text ?? "").trim(), results: [], followUps: "" };
}
