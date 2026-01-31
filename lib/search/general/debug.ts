import type { Response } from "openai/resources/responses/responses.mjs";

export type EmitFn = (event: string, data: unknown) => void;

export function mkTraceId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function dbg(
  emit: EmitFn | undefined,
  traceId: string,
  stage: string,
  data: Record<string, unknown> = {},
) {
  const payload = { traceId, stage, ts: new Date().toISOString(), ...data };
  // Always log to console as fallback
  console.log(`[${traceId}] ${stage}`, payload);
  emit?.("debug", payload);
}

export function preview(str: string | null | undefined, n = 140) {
  const s = (str ?? "").replace(/\s+/g, " ").trim();
  return s.length <= n ? s : `${s.slice(0, n)}…`;
}

/**
 * Robustly extract text even when output_text is empty but output[] contains message content.
 */
export function extractOutputText(resp: Response): string {
  const ot = resp?.output_text;
  if (typeof ot === "string" && ot.trim()) return ot.trim();

  const parts: string[] = [];
  for (const item of resp?.output ?? []) {
    if (item?.type !== "message") continue;
    for (const c of item?.content ?? []) {
      if (c?.type === "output_text" && "text" in c && typeof c?.text === "string")
        parts.push(c.text);
    }
  }
  return parts.join("\n").trim();
}

type KBSearchFilters = {
  uni?: string;
  corpus?: "su" | "official";
  year?: number;
  kb_slug?: string;
};

function pretty(obj: any) {
  return JSON.stringify(obj, null, 2);
}

export async function debugVectorSearch(opts: {
  openai: any; // OpenAI client
  vectorStoreId: string;
  query: string;
  topK?: number;
  filters: KBSearchFilters;
  label?: string;
}) {
  const { openai, vectorStoreId, query, topK = 5, filters, label } = opts;

  // 1) LOG THE INPUTS (this answers your “what filters were applied?” question)
  console.log(
    "\n[KB VS SEARCH] " +
      (label ? `${label} ` : "") +
      `query=${JSON.stringify(query)} topK=${topK}\n` +
      `[KB VS SEARCH] vectorStoreId=${vectorStoreId}\n` +
      `[KB VS SEARCH] filters=\n${pretty(filters)}\n`
  );

  // 2) RUN THE SEARCH (adjust to your SDK call shape)
  // If your code uses openai.vectorStores.search(...) or openai.responses with tool=file_search,
  // keep the actual call you already have, but add logs before/after.
  const res = await openai.vectorStores.search(vectorStoreId, {
    query,
    top_k: topK,
    // If your SDK supports metadata filtering here, pass it through.
    // Different SDK versions may call this 'filter' or 'filters'. Keep whatever your current code uses.
    filter: filters,
  });

  // 3) LOG WHAT CAME BACK (esp. attributes)
  const results = res?.data ?? res?.results ?? [];
  console.log(`[KB VS SEARCH] results=${results.length}`);

  for (let i = 0; i < Math.min(results.length, topK); i++) {
    const r = results[i];
    const fileId = r?.file_id ?? r?.file?.id ?? r?.id;
    const attrs = r?.attributes ?? r?.file?.attributes ?? {};
    const score = r?.score ?? r?.relevance_score;

    console.log(
      `\n[KB VS SEARCH] #${i + 1} file_id=${fileId} score=${score}\n` +
        `[KB VS SEARCH] attrs=${pretty({
          uni: attrs.uni,
          corpus: attrs.corpus,
          kb_slug: attrs.kb_slug,
          site: attrs.site,
          year: attrs.year,
          canonical_url: attrs.canonical_url,
          doc_id: attrs.doc_id,
          section_key: attrs.section_key,
        })}`
    );
  }

  return res;
}
