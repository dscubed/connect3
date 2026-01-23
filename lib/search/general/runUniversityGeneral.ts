// lib/search/general/runUniversityGeneral.ts
import OpenAI from "openai";
import { SupabaseClient } from "@supabase/supabase-js";
import { countWebSearchCalls } from "./countWebSearches";
import type { SearchResponse } from "../types";
import type { KBIntent } from "./router";

const KB_YEAR = 2026;
const MAX_RESULTS = 5;
const MAX_HIT_EXCERPTS = 4;
const MAX_CHUNK_CHARS = 1200;
const MIN_RESULT_SCORE = 0.3;

type RunUniversityGeneralOpts = {
  traceId?: string;
  emit?: (event: string, data: unknown) => void;
  intent?: KBIntent;
};

type ComparisonFilter = {
  type: "eq";
  key: string;
  value: string | number | boolean;
};

type CompoundFilter = {
  type: "and" | "or";
  filters: Array<ComparisonFilter | CompoundFilter>;
};

type KBDocumentFileRow = {
  file_id: string | null;
  kb_slug: string;
  doc_id: string;
  section_key: string;
  canonical_url: string | null;
  title: string | null;
  site: string | null;
  uni: string | null;
  corpus: string | null;
  year: number | null;
};

type VectorStoreHit = {
  file_id: string;
  score: number;
  filename: string;
  content: Array<{ text: string; type: "text" }>;
  attributes: Record<string, string | number | boolean> | null;
};

type SourceChunk = {
  label: string;
  snippet: string;
};

type SourceContext = {
  doc: KBDocumentFileRow;
  fileId: string;
  corpus: string;
  chunks: SourceChunk[];
};

function corpusLabel(corpus: string) {
  if (corpus === "official") return "Official";
  if (corpus === "su") return "Student Union";
  return corpus;
}

function kbSlugFor(uniSlug: string, corpus: string) {
  return `${uniSlug}_${corpus}`;
}

function corporaForIntent(intent: KBIntent): string[] {
  if (intent === "official") return ["official"];
  if (intent === "union") return ["su"];
  return ["official", "su"];
}

function buildKBFilters(
  uniSlug: string,
  corpora: string[],
  year: number,
): CompoundFilter {
  const corpusFilter: CompoundFilter | ComparisonFilter =
    corpora.length === 1
      ? { type: "eq", key: "corpus", value: corpora[0] }
      : {
          type: "or",
          filters: corpora.map((c) => ({ type: "eq", key: "corpus", value: c })),
        };

  const kbSlugFilter: CompoundFilter | ComparisonFilter =
    corpora.length === 1
      ? { type: "eq", key: "kb_slug", value: kbSlugFor(uniSlug, corpora[0]) }
      : {
          type: "or",
          filters: corpora.map((c) => ({
            type: "eq",
            key: "kb_slug",
            value: kbSlugFor(uniSlug, c),
          })),
        };

  return {
    type: "and",
    filters: [
      { type: "eq", key: "uni", value: uniSlug },
      { type: "eq", key: "year", value: year },
      corpusFilter,
      kbSlugFilter,
    ],
  };
}

function clampSnippet(text: string, maxChars: number) {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars).trim()}...`;
}

function formatSourceContext(source: SourceContext, index: number) {
  const lines: string[] = [];
  lines.push(`[Source ${index}]`);
  lines.push(`title: ${source.doc.title ?? "Untitled"}`);
  if (source.doc.canonical_url) lines.push(`url: ${source.doc.canonical_url}`);
  lines.push(`uni: ${source.doc.uni ?? "unknown"}`);
  lines.push(`corpus: ${corpusLabel(source.corpus)}`);
  lines.push(`section_key: ${source.doc.section_key}`);
  if (!source.chunks.length) {
    lines.push("excerpts: (no chunk text available)");
  } else {
    lines.push("excerpts:");
    for (const chunk of source.chunks) {
      lines.push(`- ${chunk.label}: ${chunk.snippet}`);
    }
  }
  return lines.join("\n");
}

function toQuickLinkLabel(url: string, title?: string | null) {
  if (title && title.trim()) return title.trim().slice(0, 64);
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    const path = u.pathname === "/" ? "" : u.pathname;
    return `${host}${path}`.slice(0, 64);
  } catch {
    return url.slice(0, 64);
  }
}

async function webFallback(
  openai: OpenAI,
  query: string,
  uniSlug: string,
  emit?: (event: string, data: unknown) => void,
): Promise<SearchResponse> {
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
    tools: [{ type: "web_search_preview" }],
  });

  emit?.(
    "status",
    `WEB SEARCH usage: calls=${countWebSearchCalls(webResp)} tokens=${webResp.usage?.total_tokens}`,
  );

  return {
    markdown: (webResp.output_text ?? "").trim(),
  };
}

export async function runUniversityGeneral(
  openai: OpenAI,
  supabase: SupabaseClient,
  query: string,
  uniSlug: string,
  opts?: RunUniversityGeneralOpts,
): Promise<SearchResponse> {
  const emit = opts?.emit;
  const intent = opts?.intent ?? "both";
  const vectorStoreId = process.env.OPENAI_UNI_VECTOR_STORE_ID;

  if (!vectorStoreId) {
    return webFallback(openai, query, uniSlug, emit);
  }

  const corpora = corporaForIntent(intent);
  const filter = buildKBFilters(uniSlug, corpora, KB_YEAR);

  emit?.("status", {
    step: "uni_kb_search",
    message: `Searching university KB (${corpora.join(" + ")})...`,
  });

  const searchPage = await openai.vectorStores.search(vectorStoreId, {
    query,
    filters: filter,
    max_num_results: MAX_RESULTS,
    rewrite_query: true,
  });

  const hits = (searchPage?.data ?? []) as VectorStoreHit[];
  const filteredHits = hits.filter((hit) => hit.score >= MIN_RESULT_SCORE);

  if (!filteredHits.length) {
    console.warn("[runUniversityGeneral] no_vector_hits", {
      uniSlug,
      intent,
      query,
      minScore: MIN_RESULT_SCORE,
      totalHits: hits.length,
    });
    return webFallback(openai, query, uniSlug, emit);
  }

  const hitByFileId = new Map(filteredHits.map((h) => [h.file_id, h]));
  const fileIds = Array.from(
    new Set(filteredHits.map((h) => h.file_id).filter(Boolean)),
  );

  if (fileIds.length === 0) {
    console.warn("[runUniversityGeneral] no_file_ids_from_hits", {
      uniSlug,
      intent,
      query,
    });
    return webFallback(openai, query, uniSlug, emit);
  }

  const { data: docFiles, error: docFilesError } = await supabase
    .from("kb_document_files")
    .select(
      "file_id,kb_slug,doc_id,section_key,canonical_url,title,site,uni,corpus,year",
    )
    .in("file_id", fileIds)
    .eq("is_active", true);

  if (docFilesError) {
    console.error("[runUniversityGeneral] kb_document_files lookup failed", {
      error: docFilesError.message,
      query,
      uniSlug,
    });
    return webFallback(openai, query, uniSlug, emit);
  }

  const docByFileId = new Map<string, KBDocumentFileRow>();
  for (const row of docFiles ?? []) {
    if (row.file_id) docByFileId.set(row.file_id, row as KBDocumentFileRow);
  }

  const missingHits = filteredHits.filter(
    (h) => !docByFileId.has(h.file_id),
  );
  await Promise.all(
    missingHits.map(async (hit) => {
      const attrs = hit.attributes ?? {};
      const kb_slug = typeof attrs.kb_slug === "string" ? attrs.kb_slug : "";
      const doc_id = typeof attrs.doc_id === "string" ? attrs.doc_id : "";
      const section_key =
        typeof attrs.section_key === "string" ? attrs.section_key : "";

      if (!kb_slug || !doc_id || !section_key) {
        console.warn("[runUniversityGeneral] kb_document_files missing", {
          file_id: hit.file_id,
          attrs,
          query,
        });
        return;
      }

      const { data: fallbackRow, error: fallbackError } = await supabase
        .from("kb_document_files")
        .select(
          "file_id,kb_slug,doc_id,section_key,canonical_url,title,site,uni,corpus,year",
        )
        .eq("kb_slug", kb_slug)
        .eq("doc_id", doc_id)
        .eq("section_key", section_key)
        .eq("is_active", true)
        .maybeSingle();

      if (fallbackError || !fallbackRow) {
        console.warn("[runUniversityGeneral] kb_document_files fallback miss", {
          file_id: hit.file_id,
          kb_slug,
          doc_id,
          section_key,
          error: fallbackError?.message,
        });
        return;
      }

      docByFileId.set(hit.file_id, fallbackRow as KBDocumentFileRow);
    }),
  );

  const seenHits = new Set<string>();
  const orderedMatches = filteredHits
    .map((hit) => {
      if (seenHits.has(hit.file_id)) return null;
      seenHits.add(hit.file_id);
      const doc = docByFileId.get(hit.file_id);
      if (!doc) return null;
      return { doc, fileId: hit.file_id };
    })
    .filter(
      (row): row is { doc: KBDocumentFileRow; fileId: string } => Boolean(row),
    );

  if (!orderedMatches.length) {
    console.warn("[runUniversityGeneral] no_kb_document_files", {
      uniSlug,
      intent,
      query,
    });
    return webFallback(openai, query, uniSlug, emit);
  }

  const sources: SourceContext[] = orderedMatches.map(({ doc, fileId }) => {
    const hit = hitByFileId.get(fileId);
    const content = hit?.content ?? [];
    const selected = content.slice(0, MAX_HIT_EXCERPTS).map((c, idx) => ({
      label: `vector_store_excerpt_${idx + 1}`,
      snippet: clampSnippet(c.text, MAX_CHUNK_CHARS),
    }));

    if (!selected.length) {
      console.warn("[runUniversityGeneral] empty_vector_content", {
        kb_slug: doc.kb_slug,
        doc_id: doc.doc_id,
        file_id: fileId,
      });
    }

    return {
      doc,
      fileId,
      corpus: doc.corpus ?? "unknown",
      chunks: selected,
    };
  });

  const contextText = sources
    .map((source, idx) => formatSourceContext(source, idx + 1))
    .join("\n\n");

  const system = `
You are a university help assistant for ${uniSlug}.

Use ONLY the provided KB excerpts to answer the user's question.
If the KB does not contain the answer, say what is missing and suggest what to search for next.

  Grounding rules:
  - Prefer official information over student union if there is any conflict.
  - If both sources are used, label key claims with [Official] or [Student Union].
  - When helpful, include brief quoted snippets from the KB excerpts to support key facts.

Formatting rules:
- For lists, use Markdown bullets with a blank line before the list.
- You MAY include inline links if they appear in the KB excerpts.
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

KB excerpts:
${contextText}
`.trim(),
      },
    ],
    temperature: 0.2,
  });

  emit?.("status", {
    step: "uni_kb_answer",
    message: "Answered from university KB.",
  });

  const seenLinks = new Set<string>();
  const quickLinks = sources
    .map((s) => {
      if (!s.doc.canonical_url) return null;
      const url = s.doc.canonical_url;
      if (seenLinks.has(url)) return null;
      seenLinks.add(url);
      return {
        url,
        label: toQuickLinkLabel(url, s.doc.title),
        source: "kb" as const,
      };
    })
    .filter(
      (
        l,
      ): l is {
        url: string;
        label: string;
        source: "kb";
      } => Boolean(l),
    );

  return {
    markdown: (answerResp.output_text ?? "").trim(),
    quickLinks,
  };
}
