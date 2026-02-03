// lib/search/general/runUniversityGeneral.ts
import OpenAI from "openai";
import { createHash } from "crypto";
import { SupabaseClient } from "@supabase/supabase-js";
import { countWebSearchCalls } from "./countWebSearches";
import { debugVectorSearch } from "./debug";
import type { SearchResponse } from "../types";
import type { KBIntent } from "./router";

const KB_YEAR = 2026;
const MAX_RESULTS = 8;
const MAX_HIT_EXCERPTS = 4;
const MAX_CHUNK_CHARS = 1200;
const MAX_CHUNKS_PER_DOC = 6;
const MAX_TOTAL_CHUNKS = MAX_RESULTS * MAX_HIT_EXCERPTS;
const MIN_RESULT_SCORE = 0.3;
const MIN_RESULTS = 6;
const MIN_DISTINCT_DOCS = 3;

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
  score: number;
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

function preferredCorpusForIntent(intent: KBIntent): "official" | "su" {
  return intent === "union" ? "su" : "official";
}

function fallbackCorpusForIntent(intent: KBIntent): "official" | "su" {
  return intent === "union" ? "official" : "su";
}

function buildKBFilters(
  uniSlug: string,
  year: number,
  corpus?: string,
): CompoundFilter {
  const filters: Array<ComparisonFilter | CompoundFilter> = [
    { type: "eq", key: "uni", value: uniSlug },
    { type: "eq", key: "year", value: year },
  ];

  if (corpus) {
    filters.push({ type: "eq", key: "corpus", value: corpus });
    filters.push({
      type: "eq",
      key: "kb_slug",
      value: kbSlugFor(uniSlug, corpus),
    });
  }

  return {
    type: "and",
    filters,
  };
}

function clampSnippet(text: string, maxChars: number) {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars).trim()}...`;
}

function cleanChunkText(text: string, title?: string | null) {
  const rawLines = text.split(/\r?\n/).map((line) => line.trim());
  const filtered: string[] = [];
  const sourceOrSection = /^(source|section)\s*:/i;

  for (const line of rawLines) {
    if (!line) continue;
    if (sourceOrSection.test(line)) continue;
    filtered.push(line);
  }

  const normalizedTitle = title?.trim().toLowerCase() ?? "";
  const collapsed: string[] = [];
  let prev = "";

  for (const line of filtered) {
    const normalized = line.toLowerCase();
    if (collapsed.length === 0 && normalizedTitle && normalized === normalizedTitle) {
      collapsed.push(line);
      prev = normalized;
      continue;
    }
    if (normalized === prev) continue;
    collapsed.push(line);
    prev = normalized;
  }

  // Remove repeated title lines at the top (keep first if present).
  if (normalizedTitle) {
    let firstTitleIndex = -1;
    for (let i = 0; i < collapsed.length; i++) {
      if (collapsed[i].toLowerCase() === normalizedTitle) {
        firstTitleIndex = i;
        break;
      }
    }
    if (firstTitleIndex > 0) {
      collapsed.splice(0, firstTitleIndex);
    }
    while (
      collapsed.length > 1 &&
      collapsed[0].toLowerCase() === normalizedTitle &&
      collapsed[1].toLowerCase() === normalizedTitle
    ) {
      collapsed.splice(1, 1);
    }
  }

  return collapsed.join("\n").trim();
}

function normalizeForFingerprint(text: string) {
  const rawLines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const filtered: string[] = [];
  const sourceOrSection = /^(source|section)\s*:/i;
  let prev = "";

  for (const line of rawLines) {
    if (sourceOrSection.test(line)) continue;
    const normalized = line.toLowerCase();
    if (normalized === prev) continue;
    filtered.push(normalized);
    prev = normalized;
  }

  return filtered.join(" ").replace(/\s+/g, " ").trim();
}

function fingerprintChunk(text: string) {
  const normalized = normalizeForFingerprint(text);
  const head = normalized.slice(0, MAX_CHUNK_CHARS);
  return createHash("sha1").update(head).digest("hex");
}

function formatSourceContext(source: SourceContext, index: number) {
  const lines: string[] = [];
  lines.push(`[Document ${index}]`);
  lines.push(`title: ${source.doc.title ?? "Untitled"}`);
  if (source.doc.canonical_url) lines.push(`url: ${source.doc.canonical_url}`);
  lines.push(`corpus: ${corpusLabel(source.corpus)}`);
  lines.push(`section: ${source.doc.section_key}`);
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

  const preferredCorpus = preferredCorpusForIntent(intent);
  const fallbackCorpus = fallbackCorpusForIntent(intent);
  const kbDebug = process.env.KB_DEBUG === "1";

  if (kbDebug) {
    console.log("[runUniversityGeneral] kb_corpus_preference", {
      uniSlug,
      intent,
      preferredCorpus,
      fallbackCorpus,
      year: KB_YEAR,
    });
  }

  const runSearch = async (corpus?: string) => {
    const filter = buildKBFilters(uniSlug, KB_YEAR, corpus);
    const searchPage = await openai.vectorStores.search(vectorStoreId, {
      query,
      filters: filter,
      max_num_results: MAX_RESULTS,
      rewrite_query: true,
    });
    const hits = (searchPage?.data ?? []) as VectorStoreHit[];
    const filtered = hits.filter((hit) => hit.score >= MIN_RESULT_SCORE);
    return { hits, filtered };
  };

  emit?.("status", {
    step: "uni_kb_search",
    message: `Searching university KB (${preferredCorpus})...`,
  });

  if (process.env.DEBUG_KB_VECTOR_SEARCH === "1") {
    console.log("[runUniversityGeneral] debug_kb_vector_search", {
      uniSlug,
      corpus: preferredCorpus,
      year: KB_YEAR,
    });
    await debugVectorSearch({
      openai,
      vectorStoreId,
      query,
      topK: 5,
      filters: {
        uni: uniSlug,
        corpus: preferredCorpus,
        year: KB_YEAR,
        kb_slug: kbSlugFor(uniSlug, preferredCorpus),
      },
      label: "kb-central",
    });
  }

  const preferredSearch = await runSearch(preferredCorpus);
  let mergedHits = preferredSearch.filtered.slice();

  const distinctDocsPreferred = new Set(
    mergedHits.map((h) => h.attributes?.doc_id).filter(Boolean),
  );
  const insufficientPreferred =
    mergedHits.length < MIN_RESULTS ||
    distinctDocsPreferred.size < MIN_DISTINCT_DOCS;

  if (kbDebug) {
    console.log("[runUniversityGeneral] kb_search_pass", {
      pass: "preferred",
      corpus: preferredCorpus,
      totalHits: preferredSearch.hits.length,
      filteredHits: preferredSearch.filtered.length,
      distinctDocs: distinctDocsPreferred.size,
      insufficient: insufficientPreferred,
      reason: insufficientPreferred
        ? mergedHits.length < MIN_RESULTS
          ? "min_results"
          : "min_distinct_docs"
        : null,
    });
  }

  let usedFallback = false;
  let usedNoCorpus = false;

  if (insufficientPreferred) {
    emit?.("status", {
      step: "uni_kb_search",
      message: `KB results low, retrying (${fallbackCorpus})...`,
    });

    if (process.env.DEBUG_KB_VECTOR_SEARCH === "1") {
      console.log("[runUniversityGeneral] debug_kb_vector_search", {
        uniSlug,
        corpus: fallbackCorpus,
        year: KB_YEAR,
      });
      await debugVectorSearch({
        openai,
        vectorStoreId,
        query,
        topK: 5,
        filters: {
          uni: uniSlug,
          corpus: fallbackCorpus,
          year: KB_YEAR,
          kb_slug: kbSlugFor(uniSlug, fallbackCorpus),
        },
        label: "kb-central",
      });
    }

    const fallbackSearch = await runSearch(fallbackCorpus);
    mergedHits = mergedHits.concat(fallbackSearch.filtered);
    usedFallback = true;

    const distinctDocsAfterFallback = new Set(
      mergedHits.map((h) => h.attributes?.doc_id).filter(Boolean),
    );
    const insufficientAfterFallback =
      mergedHits.length < MIN_RESULTS ||
      distinctDocsAfterFallback.size < MIN_DISTINCT_DOCS;

    if (kbDebug) {
      console.log("[runUniversityGeneral] kb_search_pass", {
        pass: "fallback",
        corpus: fallbackCorpus,
        totalHits: fallbackSearch.hits.length,
        filteredHits: fallbackSearch.filtered.length,
        distinctDocs: distinctDocsAfterFallback.size,
        insufficient: insufficientAfterFallback,
        reason: insufficientAfterFallback
          ? mergedHits.length < MIN_RESULTS
            ? "min_results"
            : "min_distinct_docs"
          : null,
      });
    }

    if (insufficientAfterFallback) {
      emit?.("status", {
        step: "uni_kb_search",
        message: "KB results low, retrying without corpus filter...",
      });

      const openSearch = await runSearch();
      mergedHits = mergedHits.concat(openSearch.filtered);
      usedNoCorpus = true;

      if (kbDebug) {
        const distinctDocsOpen = new Set(
          mergedHits.map((h) => h.attributes?.doc_id).filter(Boolean),
        );
        console.log("[runUniversityGeneral] kb_search_pass", {
          pass: "no_corpus",
          totalHits: openSearch.hits.length,
          filteredHits: openSearch.filtered.length,
          distinctDocs: distinctDocsOpen.size,
        });
      }
    }
  }

  const hits = mergedHits;
  const filteredHits = mergedHits;

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

  if (kbDebug) {
    console.log("[runUniversityGeneral] kb_corpus_fallback", {
      preferredCorpus,
      fallbackCorpus,
      usedFallback,
      usedNoCorpus,
    });
  }

  const seenFileIds = new Set<string>();
  const seenDocs = new Set<string>();
  const dedupedHits = filteredHits.filter((hit) => {
    if (!hit.file_id) return false;
    if (seenFileIds.has(hit.file_id)) return false;
    const docId =
      typeof hit.attributes?.doc_id === "string" ? hit.attributes.doc_id : "";
    const canonical =
      typeof hit.attributes?.canonical_url === "string"
        ? hit.attributes.canonical_url
        : "";
    const docKey = (canonical || docId).trim();
    if (docKey && seenDocs.has(docKey)) return false;
    seenFileIds.add(hit.file_id);
    if (docKey) seenDocs.add(docKey);
    return true;
  });

  const hitByFileId = new Map(dedupedHits.map((h) => [h.file_id, h]));
  const fileIds = dedupedHits.map((h) => h.file_id);

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

  const missingHits = dedupedHits.filter((h) => !docByFileId.has(h.file_id));
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
  const orderedMatches = dedupedHits
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

  type ChunkCandidate = {
    doc: KBDocumentFileRow;
    fileId: string;
    corpus: string;
    label: string;
    snippet: string;
    score: number;
  };

  const chunkCandidates: ChunkCandidate[] = [];
  for (const { doc, fileId } of orderedMatches) {
    const hit = hitByFileId.get(fileId);
    const content = hit?.content ?? [];
    const score = hit?.score ?? 0;
    const selected = content.slice(0, MAX_HIT_EXCERPTS);

    if (!selected.length) {
      console.warn("[runUniversityGeneral] empty_vector_content", {
        kb_slug: doc.kb_slug,
        doc_id: doc.doc_id,
        file_id: fileId,
      });
    }

    for (const [idx, chunk] of selected.entries()) {
      const cleaned = cleanChunkText(chunk.text, doc.title);
      const snippet = clampSnippet(cleaned, MAX_CHUNK_CHARS);
      if (!snippet) continue;
      chunkCandidates.push({
        doc,
        fileId,
        corpus: doc.corpus ?? "unknown",
        label: `vector_store_excerpt_${idx + 1}`,
        snippet,
        score,
      });
    }
  }

  chunkCandidates.sort((a, b) => b.score - a.score);

  const seenFingerprints = new Set<string>();
  const grouped = new Map<
    string,
    { doc: KBDocumentFileRow; corpus: string; chunks: SourceChunk[]; topScore: number }
  >();

  let totalChunks = 0;
  for (const candidate of chunkCandidates) {
    if (totalChunks >= MAX_TOTAL_CHUNKS) break;

    const fingerprint = fingerprintChunk(candidate.snippet);
    if (seenFingerprints.has(fingerprint)) continue;
    seenFingerprints.add(fingerprint);

    const docKey = candidate.doc.canonical_url?.trim() || candidate.doc.doc_id;
    const existing = grouped.get(docKey);
    const chunk: SourceChunk = {
      label: candidate.label,
      snippet: candidate.snippet,
      score: candidate.score,
    };

    if (!existing) {
      grouped.set(docKey, {
        doc: candidate.doc,
        corpus: candidate.corpus,
        chunks: [chunk],
        topScore: candidate.score,
      });
      totalChunks += 1;
      continue;
    }

    if (existing.chunks.length >= MAX_CHUNKS_PER_DOC) continue;

    existing.chunks.push(chunk);
    if (candidate.score > existing.topScore) {
      existing.topScore = candidate.score;
    }
    totalChunks += 1;
  }

  const sources: SourceContext[] = Array.from(grouped.values())
    .sort((a, b) => b.topScore - a.topScore)
    .map((group) => ({
      doc: group.doc,
      fileId: group.doc.file_id ?? "",
      corpus: group.corpus,
      chunks: group.chunks.sort((a, b) => b.score - a.score),
    }));

  if (kbDebug) {
    const perDocCounts = sources
      .map((source) => ({
        doc_id: source.doc.doc_id,
        title: source.doc.title ?? "Untitled",
        url: source.doc.canonical_url ?? null,
        chunks: source.chunks.length,
        topScore: source.chunks[0]?.score ?? 0,
      }))
      .sort((a, b) => b.topScore - a.topScore)
      .slice(0, 8);

    console.log("[runUniversityGeneral] kb_dedupe_stats", {
      rawHits: hits.length,
      filteredHits: filteredHits.length,
      dedupedHits: dedupedHits.length,
      chunkCandidates: chunkCandidates.length,
      uniqueChunks: seenFingerprints.size,
      totalChunksAfterCap: totalChunks,
      perDocCap: MAX_CHUNKS_PER_DOC,
      totalCap: MAX_TOTAL_CHUNKS,
      topDocs: perDocCounts,
    });
  }

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
