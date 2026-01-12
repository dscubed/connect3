// scripts/kb/sync-kb-vector-store-chunks.ts
//
// Usage:
//   tsx scripts/kb/sync-kb-vector-store-chunks.ts <kbSlug> <chunksDir> <domain>
// Example:
//   tsx scripts/kb/sync-kb-vector-store-chunks.ts umsu scripts/kb_scrapes/umsu/chunks umsu.unimelb.edu.au

import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import OpenAI from "openai";
import pLimit from "p-limit";
import { globSync } from "glob";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

type KBChunkRow = {
  kb_slug: string;
  doc_id: string;
  chunk_id: string;

  canonical_url: string;
  section: string | null;
  title: string | null;
  chunk_title: string | null;
  chunk_type: string;
  heading_path: string | null;
  chunk_index: number;

  chunk_hash: string;

  vector_store_id: string;
  vector_store_file_id: string;

  last_fetched_at: string;
  is_active: boolean;
};

type LocalChunk = {
  filePath: string;
  kb_slug: string;
  doc_id: string;
  chunk_id: string;
  chunk_hash: string;

  canonical_url: string;
  section: string;
  title: string;
  chunk_title: string;
  chunk_type: string;
  heading_path: string;
  chunk_index: number;
};

const CONCURRENCY = 3;

function usageAndExit() {
  console.error(
    "Usage: tsx scripts/kb/sync-kb-vector-store-chunks.ts <kbSlug> <chunksDir> <domain>\n" +
      "Example: tsx scripts/kb/sync-kb-vector-store-chunks.ts umsu scripts/kb_scrapes/umsu/chunks umsu.unimelb.edu.au"
  );
  process.exit(1);
}

function envKeyForStoreId(kbSlug: string) {
  return `OPENAI_VECTOR_STORE_ID_${kbSlug.toUpperCase()}`;
}

// minimal frontmatter parser (key: value)
function readFrontmatter(md: string): Record<string, string> {
  const out: Record<string, string> = {};
  const m = md.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!m) return out;
  for (const line of m[1].split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const idx = t.indexOf(":");
    if (idx === -1) continue;
    const k = t.slice(0, idx).trim();
    const v = t.slice(idx + 1).trim();
    if (k) out[k] = v;
  }
  return out;
}

function must(fm: Record<string, string>, k: string, filePath: string) {
  const v = fm[k];
  if (!v) throw new Error(`Missing frontmatter "${k}" in ${filePath}`);
  return v;
}

function makeSupabaseAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!serviceKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

async function fetchAllChunkRows(supabase: SupabaseClient, kbSlug: string): Promise<KBChunkRow[]> {
  const rows: KBChunkRow[] = [];
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from("kb_chunks")
      .select("*")
      .eq("kb_slug", kbSlug)
      .range(from, to);

    if (error) throw error;
    if (!data || data.length === 0) break;

    rows.push(...(data as KBChunkRow[]));
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return rows;
}

async function ensureVectorStore(openai: OpenAI, kbSlug: string, domain: string): Promise<string> {
  const envKey = envKeyForStoreId(kbSlug);
  const existing = process.env[envKey];

  if (existing) {
    const vs = await openai.vectorStores.retrieve(existing);
    console.log(`Using existing vector store: ${vs.id} (status=${vs.status})`);
    return vs.id;
  }

  const name = `kb_${kbSlug}`;
  const vs = await openai.vectorStores.create({
    name,
    metadata: { kb: kbSlug, source: "scrape", domain },
  });

  console.log(`Created vector store: ${vs.id} (${name})`);
  console.log(`\nSet this for next runs:\n  ${envKey}=${vs.id}\n`);
  return vs.id;
}

async function attachFile(openai: OpenAI, vectorStoreId: string, filePath: string, attributes: Record<string, string>) {
  const created = await openai.files.create({
    file: fs.createReadStream(filePath),
    purpose: "assistants",
  });

  const vsFile = await openai.vectorStores.files.create(vectorStoreId, {
    file_id: created.id,
    attributes,
  });

  return { vector_store_file_id: vsFile.id };
}

async function deleteVSFile(openai: OpenAI, vectorStoreId: string, vsFileId: string) {
  try {
    await openai.vectorStores.files.delete(vsFileId, { vector_store_id: vectorStoreId });
  } catch (e: any) {
    console.warn(`Warning: failed to delete vs file ${vsFileId}:`, e?.message ?? e);
  }
}

async function upsertChunkRow(supabase: SupabaseClient, row: Omit<KBChunkRow, "last_fetched_at">) {
  const { error } = await supabase
    .from("kb_chunks")
    .upsert(
      { ...row, last_fetched_at: new Date().toISOString() },
      { onConflict: "kb_slug,doc_id,chunk_id" }
    );
  if (error) throw error;
}

async function markChunkInactive(supabase: SupabaseClient, kbSlug: string, docId: string, chunkId: string) {
  const { error } = await supabase
    .from("kb_chunks")
    .update({ is_active: false, last_fetched_at: new Date().toISOString() })
    .eq("kb_slug", kbSlug)
    .eq("doc_id", docId)
    .eq("chunk_id", chunkId);
  if (error) throw error;
}

function loadLocalChunks(chunksDirAbs: string): LocalChunk[] {
  const mdPaths = globSync(path.join(chunksDirAbs, "**/*.md"), { nodir: true });
  if (mdPaths.length === 0) throw new Error(`No .md files found under ${chunksDirAbs}`);

  const out: LocalChunk[] = [];

  for (const p of mdPaths) {
    const raw = fs.readFileSync(p, "utf-8");
    const fm = readFrontmatter(raw);

    const kb_slug = fm["kb_slug"] || fm["site"] || "";
    const doc_id = must(fm, "doc_id", p);
    const chunk_id = must(fm, "chunk_id", p);
    const chunk_hash = must(fm, "chunk_hash", p);

    const canonical_url = fm["canonical_url"] || fm["url"] || "";
    if (!canonical_url) throw new Error(`Missing canonical_url/url in ${p}`);

    out.push({
      filePath: p,
      kb_slug: kb_slug || "unknown",
      doc_id,
      chunk_id,
      chunk_hash,
      canonical_url,
      section: (fm["section"] || "unknown").trim(),
      title: (fm["title"] || canonical_url).trim(),
      chunk_title: (fm["chunk_title"] || "").trim(),
      chunk_type: (fm["chunk_type"] || "section").trim(),
      heading_path: (fm["heading_path"] || "").trim(),
      chunk_index: Number(fm["chunk_index"] || "0"),
    });
  }

  return out;
}

async function main() {
  const [, , kbSlug, chunksDirArg, domain] = process.argv;
  if (!kbSlug || !chunksDirArg || !domain) usageAndExit();

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

  const chunksDirAbs = path.resolve(process.cwd(), chunksDirArg);
  if (!fs.existsSync(chunksDirAbs)) throw new Error(`Chunks directory not found: ${chunksDirAbs}`);

  const openai = new OpenAI({ apiKey });
  const supabase = makeSupabaseAdminClient();

  const vectorStoreId = await ensureVectorStore(openai, kbSlug, domain);

  const local = loadLocalChunks(chunksDirAbs).filter(c => c.kb_slug === kbSlug || kbSlug === "umsu");
  console.log(`Found ${local.length} chunk files in ${chunksDirAbs}`);

  const existingRows = await fetchAllChunkRows(supabase, kbSlug);
  const existingByKey = new Map(existingRows.map(r => [`${r.doc_id}:${r.chunk_id}`, r]));
  const activeExistingKeys = new Set(existingRows.filter(r => r.is_active).map(r => `${r.doc_id}:${r.chunk_id}`));

  const localByKey = new Map(local.map(c => [`${c.doc_id}:${c.chunk_id}`, c]));
  const localKeys = new Set(localByKey.keys());

  const toAdd: LocalChunk[] = [];
  const toUpdate: { local: LocalChunk; existing: KBChunkRow }[] = [];
  const toSkip: LocalChunk[] = [];

  for (const c of local) {
    const key = `${c.doc_id}:${c.chunk_id}`;
    const ex = existingByKey.get(key);
    if (!ex) {
      toAdd.push(c);
      continue;
    }
    if (!ex.is_active || ex.chunk_hash !== c.chunk_hash) {
      toUpdate.push({ local: c, existing: ex });
    } else {
      toSkip.push(c);
    }
  }

  const toDelete: KBChunkRow[] = [];
  for (const key of activeExistingKeys) {
    if (!localKeys.has(key)) {
      const ex = existingByKey.get(key);
      if (ex) toDelete.push(ex);
    }
  }

  console.log(
    `\nPlan for kb=${kbSlug}:\n  Add:    ${toAdd.length}\n  Update: ${toUpdate.length}\n  Delete: ${toDelete.length}\n  Skip:   ${toSkip.length}\n`
  );

  const limit = pLimit(CONCURRENCY);

  // Delete missing first
  await Promise.all(
    toDelete.map(ex =>
      limit(async () => {
        await deleteVSFile(openai, vectorStoreId, ex.vector_store_file_id);
        await markChunkInactive(supabase, kbSlug, ex.doc_id, ex.chunk_id);
      })
    )
  );

  // Update changed
  await Promise.all(
    toUpdate.map(u =>
      limit(async () => {
        await deleteVSFile(openai, vectorStoreId, u.existing.vector_store_file_id);

        const attrs = {
          kb: kbSlug,
          domain,
          doc_id: u.local.doc_id,
          chunk_id: u.local.chunk_id,
          chunk_type: u.local.chunk_type,
          canonical_url: u.local.canonical_url,
          section: u.local.section,
          chunk_hash: u.local.chunk_hash,
          heading_path: u.local.heading_path,
        };

        const { vector_store_file_id } = await attachFile(openai, vectorStoreId, u.local.filePath, attrs);

        await upsertChunkRow(supabase, {
          kb_slug: kbSlug,
          doc_id: u.local.doc_id,
          chunk_id: u.local.chunk_id,
          canonical_url: u.local.canonical_url,
          section: u.local.section,
          title: u.local.title,
          chunk_title: u.local.chunk_title,
          chunk_type: u.local.chunk_type,
          heading_path: u.local.heading_path,
          chunk_index: u.local.chunk_index,
          chunk_hash: u.local.chunk_hash,
          vector_store_id: vectorStoreId,
          vector_store_file_id,
          is_active: true,
        });
      })
    )
  );

  // Add new
  await Promise.all(
    toAdd.map(c =>
      limit(async () => {
        const attrs = {
          kb: kbSlug,
          domain,
          doc_id: c.doc_id,
          chunk_id: c.chunk_id,
          chunk_type: c.chunk_type,
          canonical_url: c.canonical_url,
          section: c.section,
          chunk_hash: c.chunk_hash,
          heading_path: c.heading_path,
        };

        const { vector_store_file_id } = await attachFile(openai, vectorStoreId, c.filePath, attrs);

        await upsertChunkRow(supabase, {
          kb_slug: kbSlug,
          doc_id: c.doc_id,
          chunk_id: c.chunk_id,
          canonical_url: c.canonical_url,
          section: c.section,
          title: c.title,
          chunk_title: c.chunk_title,
          chunk_type: c.chunk_type,
          heading_path: c.heading_path,
          chunk_index: c.chunk_index,
          chunk_hash: c.chunk_hash,
          vector_store_id: vectorStoreId,
          vector_store_file_id,
          is_active: true,
        });
      })
    )
  );

  const finalStore = await openai.vectorStores.retrieve(vectorStoreId);
  console.log(
    "\nSync complete.\nVector store:",
    finalStore.id,
    "status:",
    finalStore.status,
    "file_counts:",
    finalStore.file_counts
  );
  console.log(`Summary for kb=${kbSlug}: added=${toAdd.length}, updated=${toUpdate.length}, deleted=${toDelete.length}, skipped=${toSkip.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});