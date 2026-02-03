import path from "node:path";
import dotenv from "dotenv";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const KB_YEAR = 2026;

type ComparisonFilter = {
  type: "eq";
  key: string;
  value: string | number | boolean;
};

type CompoundFilter = {
  type: "and" | "or";
  filters: Array<ComparisonFilter | CompoundFilter>;
};

function corporaForIntent(intent: string): string[] {
  if (intent === "official") return ["official"];
  if (intent === "su" || intent === "union") return ["su"];
  return ["official", "su"];
}

function kbSlugFor(uniSlug: string, corpus: string) {
  return `${uniSlug}_${corpus}`;
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

function normalizeSlug(s: string) {
  return s
    .toLowerCase()
    .replace(/__part_\d+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function chunkMatchesSection(
  chunk: { heading_path?: string | null; chunk_title?: string | null },
  sectionKey: string,
) {
  if (!sectionKey || sectionKey === "__full__") return true;
  const target = normalizeSlug(sectionKey);
  if (!target) return false;
  const heading = [chunk.heading_path, chunk.chunk_title]
    .filter((v) => typeof v === "string")
    .join(" ");
  const haystack = normalizeSlug(heading);
  return haystack.includes(target);
}

async function main() {
  const [, , query, uniSlug, intentArg] = process.argv;
  if (!query || !uniSlug) {
    console.error(
      "Usage: tsx scripts/kb/validate-central-kb-search.ts <query> <uniSlug> [official|su|both]",
    );
    process.exit(1);
  }

  const intent = intentArg ?? "both";
  const vectorStoreId = process.env.OPENAI_UNI_VECTOR_STORE_ID;
  if (!vectorStoreId) throw new Error("Missing OPENAI_UNI_VECTOR_STORE_ID");

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing Supabase service credentials");
  }

  const openai = new OpenAI({ apiKey });
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  const corpora = corporaForIntent(intent);
  const filters = buildKBFilters(uniSlug, corpora, KB_YEAR);

  const searchPage = await openai.vectorStores.search(vectorStoreId, {
    query,
    filters,
    max_num_results: 6,
    rewrite_query: true,
  });

  console.log(`Vector store results: ${searchPage.data.length}`);

  const fileIds = Array.from(new Set(searchPage.data.map((h) => h.file_id)));
  console.log("file_ids:", fileIds);

  const { data: docFiles, error: docError } = await supabase
    .from("kb_document_files")
    .select(
      "file_id,kb_slug,doc_id,section_key,canonical_url,title,site,uni,corpus,year",
    )
    .in("file_id", fileIds)
    .eq("is_active", true);

  if (docError) throw docError;

  for (const row of docFiles ?? []) {
    console.log("doc_file:", row.file_id, row.kb_slug, row.doc_id, row.section_key);
  }

  if (!docFiles || docFiles.length === 0) {
    console.log("No kb_document_files rows matched.");
    return;
  }

  const doc = docFiles[0];
  const { data: chunks, error: chunkError } = await supabase
    .from("kb_chunks")
    .select("*")
    .eq("kb_slug", doc.kb_slug)
    .eq("doc_id", doc.doc_id)
    .eq("is_active", true)
    .order("chunk_index", { ascending: true });

  if (chunkError) throw chunkError;

  const sectionChunks = (chunks ?? []).filter((c) =>
    chunkMatchesSection(
      {
        heading_path: c.heading_path,
        chunk_title: c.chunk_title,
      },
      doc.section_key,
    ),
  );

  console.log(
    `chunks: ${chunks?.length ?? 0}, section-matched: ${sectionChunks.length}`,
  );

  const firstChunk = sectionChunks[0] ?? chunks?.[0];
  if (firstChunk) {
    const text =
      firstChunk.content ||
      firstChunk.chunk_content ||
      firstChunk.chunk_text ||
      firstChunk.text ||
      firstChunk.markdown ||
      "";
    if (typeof text === "string" && text.trim()) {
      console.log("chunk snippet:", text.trim().slice(0, 240));
    } else {
      console.log("chunk metadata:", {
        heading_path: firstChunk.heading_path,
        chunk_title: firstChunk.chunk_title,
      });
    }
  }
}

main().catch((err) => {
  console.error("Validation failed:", err);
  process.exit(1);
});
