import OpenAI from "openai";
import { countWebSearchCalls } from "./countWebSearches";
import type { SearchResponse } from "../types"; // adjust path if needed
import type { UniStores } from "./universities";

type RunUniversityGeneralOpts = {
  traceId?: string;
  emit?: (event: string, data: unknown) => void;
  intent?: "official" | "union" | "both";
};

type RetrievedChunk = {
  file_id?: string;
  filename?: string;
  score?: number;
  text?: string;
  source: "Official" | "Student Union";
};

function extractTextFromResult(r: any): string {
  if (!r) return "";

  // Direct text
  if (typeof r.text === "string" && r.text.trim()) return r.text.trim();

  // content: [{ type:"text", text:"..." }, ...]
  const content = Array.isArray(r.content) ? r.content : null;
  if (content) {
    const parts = content
      .map((c: any) => {
        if (typeof c?.text === "string") return c.text;
        if (typeof c?.content === "string") return c.content;
        return "";
      })
      .filter(Boolean);

    const joined = parts.join("\n").trim();
    if (joined) return joined;
  }

  // Some SDKs nest the snippet under `document`
  if (r.document) {
    if (typeof r.document.text === "string" && r.document.text.trim())
      return r.document.text.trim();

    const dContent = Array.isArray(r.document.content) ? r.document.content : null;
    if (dContent) {
      const parts = dContent
        .map((c: any) => (typeof c?.text === "string" ? c.text : ""))
        .filter(Boolean);
      const joined = parts.join("\n").trim();
      if (joined) return joined;
    }
  }

  return "";
}

function looksLikeFileSearchResult(x: any): boolean {
  if (!x || typeof x !== "object") return false;
  const fileId = x.file_id ?? x.fileId;
  if (!fileId || typeof fileId !== "string") return false;
  // Most file_search results have at least one of these
  return (
    typeof x.score === "number" ||
    typeof x.filename === "string" ||
    typeof x.file_name === "string" ||
    typeof x.name === "string" ||
    Array.isArray(x.content) ||
    typeof x.text === "string" ||
    typeof x.snippet === "string"
  );
}

// Recursively find arrays named `results` that contain file_search result objects
function deepCollectResults(obj: any): any[] {
  const found: any[] = [];

  const visit = (node: any) => {
    if (!node) return;

    if (Array.isArray(node)) {
      for (const item of node) visit(item);
      return;
    }

    if (typeof node !== "object") return;

    // If this node has a `results` array, check if it looks like file_search results
    const maybeResults = (node as any).results;
    if (Array.isArray(maybeResults) && maybeResults.some(looksLikeFileSearchResult)) {
      found.push(...maybeResults);
    }

    // Keep traversing
    for (const key of Object.keys(node)) {
      visit((node as any)[key]);
    }
  };

  visit(obj);
  return found;
}

function deepCollectFileIdsFromAnnotations(
  resp: any
): Array<{ file_id?: string; filename?: string }> {
  const out: Array<{ file_id?: string; filename?: string }> = [];

  const visit = (node: any) => {
    if (!node) return;

    if (Array.isArray(node)) {
      for (const item of node) visit(item);
      return;
    }

    if (typeof node !== "object") return;

    const annotations = (node as any).annotations;
    if (Array.isArray(annotations)) {
      for (const a of annotations) {
        const file_id = a?.file_id ?? a?.fileId;
        const filename = a?.filename ?? a?.file_name ?? a?.name;
        if (typeof file_id === "string" && file_id) {
          out.push({ file_id, filename });
        }
      }
    }

    for (const key of Object.keys(node)) {
      visit((node as any)[key]);
    }
  };

  visit(resp);
  return out;
}

function normalizeFileSearchResults(maybe: any): any[] {
  if (!maybe) return [];

  // Ideal: already an array
  if (Array.isArray(maybe)) return maybe;

  // Common wrappers
  if (Array.isArray(maybe.results)) return maybe.results;
  if (Array.isArray(maybe.data)) return maybe.data;
  if (Array.isArray(maybe.items)) return maybe.items;
  if (Array.isArray(maybe.documents)) return maybe.documents;

  // Sometimes it's an object whose values contain arrays
  if (typeof maybe === "object") {
    for (const v of Object.values(maybe)) {
      if (Array.isArray(v)) return v;
      if (v && typeof v === "object") {
        if (Array.isArray((v as any).results)) return (v as any).results;
        if (Array.isArray((v as any).data)) return (v as any).data;
        if (Array.isArray((v as any).items)) return (v as any).items;
      }
    }
  }

  return [];
}

function extractFileSearchResults(
  resp: any,
  source: RetrievedChunk["source"]
): RetrievedChunk[] {
  const out: RetrievedChunk[] = [];
  const outputs = Array.isArray(resp?.output) ? resp.output : [];

  // 1) Normal tool result paths
  for (const o of outputs) {
    const toolName = o?.tool_name ?? o?.tool?.name ?? o?.name;

    const isFileSearchLike =
      toolName === "file_search" ||
      o?.type === "file_search_call" ||
      o?.type === "file_search" ||
      o?.type === "file_search_result" ||
      (o?.type === "tool_result" && toolName === "file_search") ||
      (o?.type === "tool_call" && toolName === "file_search");

    if (!isFileSearchLike) continue;

    const results =
    normalizeFileSearchResults(o?.results) ||
    normalizeFileSearchResults(o?.output?.results) ||
    normalizeFileSearchResults(o?.output) ||
    normalizeFileSearchResults(o?.result?.results) ||
    normalizeFileSearchResults(o?.content?.results) ||
    [];

    for (const r of results) {
      out.push({
        file_id: r?.file_id ?? r?.fileId,
        filename: r?.filename ?? r?.file_name ?? r?.name,
        score: typeof r?.score === "number" ? r.score : undefined,
        text: extractTextFromResult(r),
        source,
      });
    }
  }

  // 2) Deep scan for hidden `.results`
  if (out.length === 0) {
    const deep = deepCollectResults(resp);
    for (const r of deep) {
      out.push({
        file_id: r?.file_id ?? r?.fileId,
        filename: r?.filename ?? r?.file_name ?? r?.name,
        score: typeof r?.score === "number" ? r.score : undefined,
        text: extractTextFromResult(r),
        source,
      });
    }
  }

  // 3) FINAL fallback: annotations / file pills (what your screenshot shows)
  if (out.length === 0) {
    const ids = deepCollectFileIdsFromAnnotations(resp);
    for (const x of ids) {
      out.push({
        file_id: x.file_id,
        filename: x.filename,
        score: undefined,
        text: "",
        source,
      });
    }
  }

  // de-dupe
  const seen = new Set<string>();
  return out.filter((r) => {
    const key = `${r.source}::${r.file_id ?? "nofile"}::${(r.text ?? "").slice(
      0,
      120
    )}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildContextPack(chunks: RetrievedChunk[], maxChars = 12000): string {
  let buf = "";

  for (const c of chunks) {
    const text = (c.text ?? "").trim();

    const header = `\n---\nSOURCE: ${c.source}\nfile_id: ${
      c.file_id ?? "unknown"
    }\nfilename: ${c.filename ?? "unknown"}\nscore: ${
      c.score ?? "n/a"
    }\n---\n`;

    const body = text
      ? text + "\n"
      : "(file cited but no snippet text returned)\n";

    const addition = header + body;

    if (buf.length + addition.length > maxChars) break;
    buf += addition;
  }

  return buf.trim();
}

async function retrieveFromStore(args: {
  openai: OpenAI;
  query: string;
  vectorStoreId: string;
  source: RetrievedChunk["source"];
  maxNumResults: number;
}) {
  const { openai, query, vectorStoreId, source, maxNumResults } = args;

  const resp = await openai.responses.create({
    model: "gpt-4o-mini",
    input: [
      {
        role: "system",
        content: `
You are a retriever. Use file_search to find the most relevant passages.
Do NOT answer the question.
You MUST return the file_search results.
`.trim(),
      },
      { role: "user", content: query },
    ],
    tools: [
      {
        type: "file_search",
        vector_store_ids: [vectorStoreId],
        max_num_results: maxNumResults,
      } as any,
    ],
    include: ["file_search_call.results"] as any,
  });

  const chunks = extractFileSearchResults(resp, source);
  return { chunks, usage: resp.usage };
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
  const intent = opts?.intent ?? "both";

  const uniKbSystem = `
You are a university help assistant for ${uniSlug}.
Use ONLY the provided CONTEXT to answer.

Rules:
- If you list items, you MUST use Markdown list syntax with a blank line before the list:
  Example:
  Some intro sentence:

  - Item one
  - Item two
- You MAY include inline links naturally in the summary (e.g. "use the [application portal](...)").
- Do NOT add a separate "Key Links"/"Related Links" section.
- Do NOT invent URLs.
- If you can't find relevant info in CONTEXT, say so briefly.
`.trim();

  const uniWebSystem = `
You are a university help assistant for ${uniSlug}.
Use web search. Prefer official university or government sources.

Rules:
- If you list items, you MUST use Markdown list syntax with a blank line before the list:
  Example:
  Some intro sentence:

  - Item one
  - Item two
- You MAY include inline links naturally in the summary.
- Do NOT add a separate "Key Links"/"Related Links" section.
- Do NOT invent URLs.
`.trim();

  // 1) KB attempt
  const storesToQuery: { id: string; source: RetrievedChunk["source"] }[] = [];
  if (intent === "official") {
    if (vectorStores.official) {
      storesToQuery.push({ id: vectorStores.official, source: "Official" });
    } else if (vectorStores.union) {
      storesToQuery.push({ id: vectorStores.union, source: "Student Union" });
    }
  } else if (intent === "union") {
    if (vectorStores.union) {
      storesToQuery.push({ id: vectorStores.union, source: "Student Union" });
    } else if (vectorStores.official) {
      storesToQuery.push({ id: vectorStores.official, source: "Official" });
    }
  } else {
    if (vectorStores.official) {
      storesToQuery.push({ id: vectorStores.official, source: "Official" });
    }
    if (vectorStores.union) {
      storesToQuery.push({ id: vectorStores.union, source: "Student Union" });
    }
  }

  if (storesToQuery.length > 0) {
    const searchMsg =
      storesToQuery.length === 2
        ? "Searching official and student union sources..."
        : storesToQuery[0].source === "Official"
        ? "Searching official university sources..."
        : "Searching student union sources...";
    emit?.("status", { step: "uni_kb_search", message: searchMsg });
  }

  const allChunks: RetrievedChunk[] = [];
  for (const store of storesToQuery) {
    const { chunks, usage } = await retrieveFromStore({
      openai,
      query,
      vectorStoreId: store.id,
      source: store.source,
      maxNumResults: 8,
    });
    allChunks.push(...chunks);
    console.log("[runUniversityGeneral] retrieval", {
      traceId,
      source: store.source,
      retrievedCount: chunks.length,
      usage,
    });
  }

  const contextPack = buildContextPack(allChunks);

  if (contextPack.length > 0) {
    const hasOfficial = allChunks.some((c) => c.source === "Official");
    const hasUnion = allChunks.some((c) => c.source === "Student Union");
    const sourceRule =
      hasOfficial && hasUnion
        ? "Label key facts with [Official] or [Student Union] based on SOURCE, and prefer [Official] when conflicts exist."
        : "Prefer Official sources over Student Union sources if any conflict exists.";

    emit?.("status", {
      step: "uni_kb_answer",
      message: "Generating answer from university KB...",
    });
    const answerResp = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        { role: "system", content: `${uniKbSystem}\n\n${sourceRule}` },
        {
          role: "user",
          content: `USER QUESTION:\n${query}\n\nCONTEXT:\n${contextPack}`,
        },
      ],
    });
    return {
      summary: (answerResp.output_text ?? "").trim(),
      results: [],
      followUps: "",
    };
  }

  // 2) Web fallback
  emit?.("status", {
    step: "uni_web_fallback",
    message: "No KB match, searching the web...",
  });
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

  return {
    summary: (webResp.output_text ?? "").trim(),
    results: [],
    followUps: "",
  };
}
