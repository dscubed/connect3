// scripts/kb/rechunk-from-pages.ts
//
// Re-chunk already-scraped PAGE-LEVEL markdown files (no re-scrape needed).
//
// Usage:
//   tsx scripts/kb/rechunk-from-pages.ts <kbSlug> <pagesDir> <outChunksDir> [maxTokens] [overlapTokens]
//
// Example:
//   tsx scripts/kb/rechunk-from-pages.ts msa scripts/kb_scrapes/msa scripts/kb_scrapes/msa/chunks 380 60
//
// Notes:
// - This script expects each page .md to have YAML frontmatter with at least a URL (canonical_url/url).
// - It will skip anything under an existing "/chunks" directory by default.
// - Token counting is approximate (good enough for chunk sizing).

import fs from "node:fs";
import path from "node:path";
import { globSync } from "glob";

import { sha1, canonicalizeUrl, normalizeTextForHash } from "../kb/hash";

/* -------------------------- args -------------------------- */

function usageAndExit(): never {
  console.error(
    "Usage: tsx scripts/kb/rechunk-from-pages.ts <kbSlug> <pagesDir> <outChunksDir> [maxTokens] [overlapTokens]\n" +
      "Example: tsx scripts/kb/rechunk-from-pages.ts msa scripts/kb_scrapes/msa scripts/kb_scrapes/msa/chunks 380 60"
  );
  process.exit(1);
}

const [, , kbSlug, pagesDirArg, outChunksDirArg, maxTokensArg, overlapTokensArg] =
  process.argv;

if (!kbSlug || !pagesDirArg || !outChunksDirArg) usageAndExit();

const MAX_TOKENS = Number(maxTokensArg ?? "380"); // tune
const OVERLAP_TOKENS = Number(overlapTokensArg ?? "60"); // tune
const pagesDir = path.resolve(process.cwd(), pagesDirArg);
const outChunksDir = path.resolve(process.cwd(), outChunksDirArg);

if (!fs.existsSync(pagesDir)) throw new Error(`pagesDir not found: ${pagesDir}`);
fs.mkdirSync(outChunksDir, { recursive: true });

/* ---------------------- frontmatter ----------------------- */

// minimal frontmatter parser (key: value)
function readFrontmatter(md: string): { fm: Record<string, string>; body: string } {
  const out: Record<string, string> = {};
  const m = md.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!m) return { fm: out, body: md };
  for (const line of m[1].split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const idx = t.indexOf(":");
    if (idx === -1) continue;
    const k = t.slice(0, idx).trim();
    const v = t.slice(idx + 1).trim();
    if (k) out[k] = v;
  }
  const body = md.slice(m[0].length);
  return { fm: out, body };
}

function must(fm: Record<string, string>, keys: string[], filePath: string): string {
  for (const k of keys) {
    const v = fm[k];
    if (v) return v;
  }
  throw new Error(`Missing required frontmatter (${keys.join(" or ")}) in ${filePath}`);
}

function safeTrim(s: string) {
  return (s ?? "").toString().trim();
}

/* --------------------- token estimate --------------------- */

// Cheap & cheerful token estimate.
// - For English-ish text, tokens ~ chars/4 is a decent approximation.
function estTokens(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return Math.ceil(t.length / 4);
}

/* --------------------- markdown splitting --------------------- */

type Section = {
  headingPath: string[]; // e.g. ["Fees", "Payment options"]
  chunkTitle: string; // last heading or fallback
  content: string; // markdown under that heading
};

// Parse into sections by headings. Keeps heading lines as context in content.
function splitByHeadings(md: string): Section[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");

  const sections: Section[] = [];
  let headingPath: string[] = [];
  let buf: string[] = [];

  const flush = () => {
    const content = buf.join("\n").trim();
    if (content) {
      const chunkTitle = headingPath.length ? headingPath[headingPath.length - 1] : "";
      sections.push({ headingPath: [...headingPath], chunkTitle, content });
    }
    buf = [];
  };

  for (const line of lines) {
    const m = line.match(/^(#{1,6})\s+(.*)$/);
    if (m) {
      // new heading starts: flush previous section
      flush();

      const level = m[1].length; // 1..6
      const title = safeTrim(m[2].replace(/\s+#*\s*$/, "")); // remove trailing hashes

      // adjust path to heading level
      // level 1 => path length 1, level 2 => path length 2, etc.
      headingPath = headingPath.slice(0, Math.max(0, level - 1));
      headingPath.push(title || "(untitled)");

      // keep the heading line as part of section content for context
      buf.push(line);
      continue;
    }

    buf.push(line);
  }

  flush();

  // If no headings were found, treat entire doc as one section.
  if (sections.length === 0) {
    const content = md.trim();
    if (content) sections.push({ headingPath: [], chunkTitle: "", content });
  }

  return sections;
}

// Split a section into paragraph-ish blocks.
function splitIntoBlocks(md: string): string[] {
  const normalized = md.replace(/\r\n/g, "\n");
  // Split on blank lines, but keep code fences reasonably intact by being conservative.
  const blocks = normalized
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  return blocks.length ? blocks : [normalized.trim()];
}

function joinHeadingPath(pathParts: string[]): string {
  const s = pathParts.map((p) => p.replace(/\s+/g, " ").trim()).filter(Boolean).join(" > ");
  return s;
}

function clampAttribute(s: string, maxLen: number): string {
  const t = safeTrim(s);
  if (t.length <= maxLen) return t;
  // Keep a readable prefix + hash suffix for stability/debuggability
  const prefix = t.slice(0, Math.max(0, maxLen - 1 - 10)); // leave room for "|" + 8 chars
  const h = sha1(t).slice(0, 8);
  return `${prefix}|${h}`.slice(0, maxLen);
}

/* ---------------------- chunk writing ---------------------- */

type ChunkMeta = {
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

function toFrontmatter(meta: ChunkMeta): string {
  // YAML-ish, one-line values only (safe for your current parser)
  const lines = [
    "---",
    `kb_slug: ${meta.kb_slug}`,
    `doc_id: ${meta.doc_id}`,
    `chunk_id: ${meta.chunk_id}`,
    `chunk_hash: ${meta.chunk_hash}`,
    `canonical_url: ${meta.canonical_url}`,
    `section: ${meta.section}`,
    `title: ${meta.title}`,
    `chunk_title: ${meta.chunk_title}`,
    `chunk_type: ${meta.chunk_type}`,
    `heading_path: ${meta.heading_path}`,
    `chunk_index: ${meta.chunk_index}`,
    "---",
    "",
  ];
  return lines.join("\n");
}

function writeChunkFile(outDir: string, meta: ChunkMeta, content: string) {
  const safeDoc = meta.doc_id.replace(/[^a-zA-Z0-9_-]/g, "_");
  const safeChunk = meta.chunk_id.replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `${meta.kb_slug}__${safeDoc}__${safeChunk}.md`;
  const filePath = path.join(outDir, filename);
  fs.writeFileSync(filePath, toFrontmatter(meta) + content.trim() + "\n", "utf-8");
}

/* -------------------------- rechunk -------------------------- */

function makeDocId(canonicalUrl: string) {
  return sha1(canonicalUrl);
}

function makeChunkId(docId: string, idx: number, headingPath: string) {
  // Stable but short; includes headingPath hash to avoid collisions.
  const hp = sha1(headingPath || "").slice(0, 8);
  return `${docId.slice(0, 10)}_${idx}_${hp}`;
}

function makeChunkHash(content: string) {
  return sha1(normalizeTextForHash(content));
}

function makeChunkBody(pageTitle: string, canonicalUrl: string, sectionLabel: string, body: string) {
  // Optional: lightweight header for retrieval clarity
  return [
    `# ${pageTitle}`,
    ``,
    `Source: ${canonicalUrl}`,
    sectionLabel ? `Section: ${sectionLabel}` : ``,
    ``,
    body.trim(),
  ]
    .filter(Boolean)
    .join("\n");
}

type PageMeta = {
  canonical_url: string;
  title: string;
  section: string;
};

function inferSectionFromFrontmatter(fm: Record<string, string>) {
  return safeTrim(fm["section"] || fm["category"] || fm["site_section"] || "unknown");
}

function inferTitleFromFrontmatter(fm: Record<string, string>, fallbackUrl: string) {
  return safeTrim(fm["title"] || fm["page_title"] || fm["name"] || fallbackUrl);
}

function rechunkPage(pageMdPath: string, pageMeta: PageMeta, pageBody: string) {
  const canonical_url = canonicalizeUrl(pageMeta.canonical_url);
  const doc_id = makeDocId(canonical_url);
  const pageTitle = pageMeta.title;
  const sectionLabel = pageMeta.section;

  const sections = splitByHeadings(pageBody);
  const chunksWritten: { chunk_id: string; tokens: number }[] = [];

  let globalChunkIndex = 0;

  for (const sec of sections) {
    const heading_path_raw = joinHeadingPath(sec.headingPath);
    const heading_path = clampAttribute(heading_path_raw, 512);

    const blocks = splitIntoBlocks(sec.content);

    let acc: string[] = [];
    let accTokens = 0;

    const flushChunk = () => {
      const body = acc.join("\n\n").trim();
      if (!body) return;

      const chunkBody = makeChunkBody(pageTitle, canonical_url, sectionLabel, body);
      const chunk_title = clampAttribute(
        safeTrim(sec.chunkTitle) || pageTitle,
        200
      );

      const chunk_type = sec.headingPath.length ? "section" : "page_overview";

      const chunk_index = globalChunkIndex++;
      const chunk_id = makeChunkId(doc_id, chunk_index, heading_path);
      const chunk_hash = makeChunkHash(chunkBody);

      writeChunkFile(outChunksDir, {
        kb_slug: kbSlug,
        doc_id,
        chunk_id,
        chunk_hash,
        canonical_url,
        section: clampAttribute(sectionLabel, 128),
        title: clampAttribute(pageTitle, 200),
        chunk_title,
        chunk_type,
        heading_path,
        chunk_index,
      }, chunkBody);

      chunksWritten.push({ chunk_id, tokens: estTokens(chunkBody) });

      // overlap: keep last OVERLAP_TOKENS worth of content for next chunk
      if (OVERLAP_TOKENS > 0) {
        const joined = acc.join("\n\n");
        const overlap = takeLastTokensApprox(joined, OVERLAP_TOKENS);
        acc = overlap ? [overlap] : [];
        accTokens = estTokens(acc.join("\n\n"));
      } else {
        acc = [];
        accTokens = 0;
      }
    };

    for (const block of blocks) {
      const blockTokens = estTokens(block);

      // If a single block is huge, hard-split it
      if (blockTokens > MAX_TOKENS) {
        // flush what we have
        flushChunk();
        // split the big block into smaller slices
        const slices = hardSplitByChars(block, MAX_TOKENS);
        for (const s of slices) {
          acc = [s];
          accTokens = estTokens(s);
          flushChunk();
        }
        continue;
      }

      if (accTokens + blockTokens > MAX_TOKENS && acc.length > 0) {
        flushChunk();
      }

      acc.push(block);
      accTokens += blockTokens;
    }

    flushChunk();
  }

  return { doc_id, chunksWritten };
}

// Take last N tokens (approx) from a string by chars.
function takeLastTokensApprox(text: string, tokens: number) {
  const maxChars = tokens * 4;
  if (text.length <= maxChars) return text.trim();
  return text.slice(text.length - maxChars).trim();
}

// Split a big string into slices of ~MAX_TOKENS (approx) by chars.
function hardSplitByChars(text: string, maxTokens: number): string[] {
  const maxChars = maxTokens * 4;
  const out: string[] = [];
  let i = 0;
  while (i < text.length) {
    out.push(text.slice(i, i + maxChars).trim());
    i += maxChars;
  }
  return out.filter(Boolean);
}

/* -------------------------- main -------------------------- */

function findPageMarkdownFiles(root: string) {
  const all = globSync(path.join(root, "**/*.md"), { nodir: true });
  // Skip chunk outputs if pagesDir points at a scrape root
  return all.filter((p) => !p.includes(`${path.sep}chunks${path.sep}`));
}

function rmDirContents(dir: string) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    fs.rmSync(path.join(dir, f), { recursive: true, force: true });
  }
}

(async function main() {
  const pagePaths = findPageMarkdownFiles(pagesDir);
  if (pagePaths.length === 0) throw new Error(`No page .md files found under: ${pagesDir}`);

  console.log("Rechunking KB:", kbSlug);
  console.log("Pages dir:", pagesDir);
  console.log("Chunks out:", outChunksDir);
  console.log(`maxTokens=${MAX_TOKENS} overlapTokens=${OVERLAP_TOKENS}`);
  console.log(`Found ${pagePaths.length} page files`);

  // If you're writing to the same chunks dir, it’s usually best to clear it.
  // Comment this out if you prefer to write to a fresh /chunks_v2.
  rmDirContents(outChunksDir);

  let pagesOk = 0;
  let pagesFailed = 0;
  let totalChunks = 0;

  for (const p of pagePaths) {
    try {
      const raw = fs.readFileSync(p, "utf-8");
      const { fm, body } = readFrontmatter(raw);

      const canonical_url = must(fm, ["canonical_url", "url"], p);
      const title = inferTitleFromFrontmatter(fm, canonical_url);
      const section = inferSectionFromFrontmatter(fm);

      const { chunksWritten } = rechunkPage(p, { canonical_url, title, section }, body);
      pagesOk += 1;
      totalChunks += chunksWritten.length;

      if (pagesOk % 25 === 0) {
        console.log(`...processed ${pagesOk}/${pagePaths.length} pages (chunks=${totalChunks})`);
      }
    } catch (e: any) {
      pagesFailed += 1;
      console.warn("FAILED:", p, "-", e?.message ?? e);
    }
  }

  console.log("\nDone.");
  console.log("Pages ok:", pagesOk);
  console.log("Pages failed:", pagesFailed);
  console.log("Total chunks written:", totalChunks);
})();