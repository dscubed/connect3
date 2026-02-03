// scripts/kb/build-vs-files-from-pages.ts
//
// Build VECTOR-STORE INGESTION files from already-scraped PAGE-LEVEL markdown files.
// - Normal pages -> 1 file per page (section_key="__full__").
// - Large pages  -> split into H2 (then H3 if needed) section files and/or parts.
//
// Usage:
//   tsx scripts/kb/build-vs-files-from-pages.ts <kbSlug> <pagesDir> <outVsDir> [chunkMaxTokens] [largeChunkThreshold] [sectionMaxTokens] [sectionOverlapTokens] [year]
//
// Example:
//   tsx scripts/kb/build-vs-files-from-pages.ts msa scripts/kb_scrapes/msa scripts/kb_scrapes/msa/vs_files 380 40 1600 0 2026
//
// Notes:
// - Expects each page .md to have YAML frontmatter with at least canonical_url or url.
// - Skips anything under an existing "/chunks" or "/vs_files" directory by default.
// - Token counting is approximate (chars/4).
//
// Output:
// - Writes .md ingestion files to outVsDir
// - Writes manifest.json to outVsDir with per-file attributes

import fs from "node:fs";
import path from "node:path";
import { globSync } from "glob";

import { sha1, canonicalizeUrl, normalizeTextForHash } from "./hash";

/* -------------------------- args -------------------------- */

function usageAndExit(): never {
  console.error(
    "Usage: tsx scripts/kb/build-vs-files-from-pages.ts <kbSlug> <pagesDir> <outVsDir> [chunkMaxTokens] [largeChunkThreshold] [sectionMaxTokens] [sectionOverlapTokens] [year]\n" +
      "Example: tsx scripts/kb/build-vs-files-from-pages.ts msa scripts/kb_scrapes/msa scripts/kb_scrapes/msa/vs_files 380 40 1600 0 2026"
  );
  process.exit(1);
}

const [
  ,
  ,
  kbSlug,
  pagesDirArg,
  outVsDirArg,
  chunkMaxTokensArg,
  largeChunkThresholdArg,
  sectionMaxTokensArg,
  sectionOverlapTokensArg,
  yearArg,
] = process.argv;

if (!kbSlug || !pagesDirArg || !outVsDirArg) usageAndExit();

const CHUNK_MAX_TOKENS = Number(chunkMaxTokensArg ?? "380"); // matches your chunker default
const LARGE_CHUNK_THRESHOLD = Number(largeChunkThresholdArg ?? "40"); // pages w/ > this chunks are "large"
const SECTION_MAX_TOKENS = Number(sectionMaxTokensArg ?? "1600"); // per section file / part cap
const SECTION_OVERLAP_TOKENS = Number(sectionOverlapTokensArg ?? "0"); // overlap between section parts
const YEAR = Number(yearArg ?? "2026");

const pagesDir = path.resolve(process.cwd(), pagesDirArg);
const outVsDir = path.resolve(process.cwd(), outVsDirArg);

if (!fs.existsSync(pagesDir)) throw new Error(`pagesDir not found: ${pagesDir}`);
fs.mkdirSync(outVsDir, { recursive: true });

/* ---------------------- frontmatter ----------------------- */

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

function inferTitleFromFrontmatter(fm: Record<string, string>, fallbackUrl: string) {
  return safeTrim(fm["title"] || fm["page_title"] || fm["name"] || fallbackUrl);
}

function inferSectionFromFrontmatter(fm: Record<string, string>) {
  return safeTrim(fm["section"] || fm["category"] || fm["site_section"] || "unknown");
}

function inferSiteFromFrontmatter(fm: Record<string, string>) {
  return safeTrim(fm["site"] || fm["source_site"] || fm["kb_site"] || kbSlug);
}

/* --------------------- token estimate --------------------- */

function estTokens(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return Math.ceil(t.length / 4);
}

/* --------------------- markdown splitting --------------------- */

type Section = {
  headingPath: string[]; // e.g. ["Uniride | Bike Shop", "Workshop", "Basic Service"]
  chunkTitle: string; // last heading
  content: string; // markdown under that heading (includes heading line)
};

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
      flush();
      const level = m[1].length;
      const title = safeTrim(m[2].replace(/\s+#*\s*$/, ""));
      headingPath = headingPath.slice(0, Math.max(0, level - 1));
      headingPath.push(title || "(untitled)");
      buf.push(line);
      continue;
    }
    buf.push(line);
  }

  flush();

  if (sections.length === 0) {
    const content = md.trim();
    if (content) sections.push({ headingPath: [], chunkTitle: "", content });
  }

  return sections;
}

function splitIntoBlocks(md: string): string[] {
  const normalized = md.replace(/\r\n/g, "\n");
  const blocks = normalized
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  return blocks.length ? blocks : [normalized.trim()];
}

function joinHeadingPath(pathParts: string[]): string {
  return pathParts.map((p) => p.replace(/\s+/g, " ").trim()).filter(Boolean).join(" > ");
}

/* --------------------- ids / hashes --------------------- */

function makeDocId(canonicalUrl: string) {
  return sha1(canonicalUrl);
}

function makeContentHash(content: string) {
  return sha1(normalizeTextForHash(content));
}

/* --------------------- helpers --------------------- */

function slugify(s: string): string {
  const t = safeTrim(s)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return t || "untitled";
}

function clampAttribute(s: string, maxLen: number): string {
  const t = safeTrim(s);
  if (t.length <= maxLen) return t;
  const prefix = t.slice(0, Math.max(0, maxLen - 1 - 10));
  const h = sha1(t).slice(0, 8);
  return `${prefix}|${h}`.slice(0, maxLen);
}

function rmDirContents(dir: string) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    fs.rmSync(path.join(dir, f), { recursive: true, force: true });
  }
}

function findPageMarkdownFiles(root: string) {
  const all = globSync(path.join(root, "**/*.md"), { nodir: true });
  return all.filter((p) => {
    const norm = p.split(path.sep).join("/");
    if (norm.includes("/chunks/")) return false;
    if (norm.includes("/vs_files/")) return false;
    return true;
  });
}

function getDomain(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.toLowerCase();
  } catch {
    return "";
  }
}

/* --------------------- uni/corpus mapping --------------------- */

// IMPORTANT: These are defaults. You'll likely want to expand/override.
const SU_SITE_CODES = new Set<string>([
  "msa", // Monash Student Association
  "rusu", // RMIT University Student Union
  "umsu", // UoM Student Union
  "uwa_guild",  // UWA Student Guild
  "umsu",
  // add: "umsu", "rusu", "uwa_guild", etc.
]);

function inferCorpus(site: string, canonicalUrl: string): "su" | "official" {
  if (SU_SITE_CODES.has(site.toLowerCase())) return "su";
  const d = getDomain(canonicalUrl);
  // heuristic: student union domains often differ; adjust as needed
  if (d.includes("msa.monash.edu")) return "su";
  return "official";
}

function inferUni(site: string, canonicalUrl: string, kbSlugLocal: string): string {
  const d = getDomain(canonicalUrl);
  if (d.includes("monash")) return "monash";
  if (d.includes("unimelb")) return "unimelb";
  if (d.includes("rmit")) return "rmit";
  if (d.includes("uwa")) return "uwa";

  // fallback: site/kbSlug hints
  const s = site.toLowerCase();
  if (s === "msa") return "monash";
  const k = kbSlugLocal.toLowerCase();
  if (k.includes("monash")) return "monash";
  if (k.includes("unimelb")) return "unimelb";
  if (k.includes("rmit")) return "rmit";
  if (k.includes("uwa")) return "uwa";

  return "unknown";
}

function inferKbSlugUnified(uni: string, corpus: "su" | "official"): string {
  // If you already have your own kb slug convention, replace this.
  return `${uni}_${corpus}`;
}

/* --------------------- VS unit build --------------------- */

type VsAttributes = Record<string, string | number | boolean>;

type VsUnit = {
  kb_slug: string;
  doc_id: string;
  canonical_url: string;
  title: string;
  section: string;
  site: string;

  uni: string;
  corpus: "su" | "official";
  year: number;

  section_key: string; // "__full__" or derived slug / slug__part_N
  content_hash: string;

  content: string;
};

function buildVsBody(pageTitle: string, canonicalUrl: string, sectionLabel: string, body: string) {
  // Keep a lightweight header for retrieval clarity.
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

function estimateChunkCountForPage(pageBody: string): number {
  // Mirrors your chunk flushing logic at a high level (no overlap)
  const sections = splitByHeadings(pageBody);
  let count = 0;

  for (const sec of sections) {
    const blocks = splitIntoBlocks(sec.content);
    let accTokens = 0;

    for (const block of blocks) {
      const bt = estTokens(block);

      if (bt > CHUNK_MAX_TOKENS) {
        // hard-split big blocks into multiple chunk-equivalents
        const slices = hardSplitByChars(block, CHUNK_MAX_TOKENS);
        count += slices.length;
        accTokens = 0;
        continue;
      }

      if (accTokens + bt > CHUNK_MAX_TOKENS) {
        count += 1;
        accTokens = 0;
      }

      accTokens += bt;
    }

    if (accTokens > 0) count += 1;
  }

  return count;
}

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

function takeLastTokensApprox(text: string, tokens: number) {
  const maxChars = tokens * 4;
  if (text.length <= maxChars) return text.trim();
  return text.slice(text.length - maxChars).trim();
}

function splitIntoPartsWithCap(md: string, maxTokens: number, overlapTokens: number): string[] {
  const blocks = splitIntoBlocks(md);
  const parts: string[] = [];

  let acc: string[] = [];
  let accTokens = 0;

  const flush = () => {
    const body = acc.join("\n\n").trim();
    if (!body) return;
    parts.push(body);

    if (overlapTokens > 0) {
      const joined = acc.join("\n\n");
      const overlap = takeLastTokensApprox(joined, overlapTokens);
      acc = overlap ? [overlap] : [];
      accTokens = estTokens(acc.join("\n\n"));
    } else {
      acc = [];
      accTokens = 0;
    }
  };

  for (const block of blocks) {
    const bt = estTokens(block);

    if (bt > maxTokens) {
      flush();
      // hard split huge block into slices
      const slices = hardSplitByChars(block, maxTokens);
      for (const s of slices) {
        acc = [s];
        accTokens = estTokens(s);
        flush();
      }
      continue;
    }

    if (accTokens + bt > maxTokens && acc.length > 0) {
      flush();
    }

    acc.push(block);
    accTokens += bt;
  }

  flush();

  return parts.length ? parts : [md.trim()];
}

function buildUnitsFromPage(
  kbSlugLocal: string,
  pageMeta: { canonical_url: string; title: string; section: string; site: string },
  pageBody: string
): { doc_id: string; chunkCountEstimate: number; units: VsUnit[] } {
  const canonical_url = canonicalizeUrl(pageMeta.canonical_url);
  const title = pageMeta.title;
  const section = pageMeta.section;
  const site = pageMeta.site;

  const doc_id = makeDocId(canonical_url);

  const corpus = inferCorpus(site, canonical_url);
  const uni = inferUni(site, canonical_url, kbSlugLocal);
  const kb_slug = inferKbSlugUnified(uni, corpus);

  const chunkCountEstimate = estimateChunkCountForPage(pageBody);

  // Normal: single unit
  if (chunkCountEstimate <= LARGE_CHUNK_THRESHOLD) {
    const body = buildVsBody(title, canonical_url, section, pageBody);
    const content_hash = makeContentHash(body);

    const unit: VsUnit = {
      kb_slug,
      doc_id,
      canonical_url,
      title,
      section,
      site,
      uni,
      corpus,
      year: YEAR,
      section_key: "__full__",
      content_hash,
      content: body,
    };
    return { doc_id, chunkCountEstimate, units: [unit] };
  }

  // Large: split into H2 sections (fallback to intro)
  const sections = splitByHeadings(pageBody);

  // Group content by top-level section key.
  // Convention:
  // - H1 title is usually headingPath[0]
  // - H2 is headingPath[1]
  // If absent, group into "__intro__".
  const groups = new Map<string, { headingLabel: string; contents: string[] }>();

  for (const sec of sections) {
    const h2 = sec.headingPath.length >= 2 ? sec.headingPath[1] : "__intro__";
    const key = slugify(h2);
    const label = h2 === "__intro__" ? "__intro__" : h2;

    const g = groups.get(key) ?? { headingLabel: label, contents: [] };
    g.contents.push(sec.content);
    groups.set(key, g);
  }

  const units: VsUnit[] = [];

  for (const [key, g] of groups.entries()) {
    const combined = g.contents.join("\n\n").trim();
    if (!combined) continue;

    // Cap each section into parts, if needed
    const parts = splitIntoPartsWithCap(combined, SECTION_MAX_TOKENS, SECTION_OVERLAP_TOKENS);

    for (let i = 0; i < parts.length; i++) {
      const partKey = parts.length === 1 ? key : `${key}__part_${i}`;
      const body = buildVsBody(title, canonical_url, section, parts[i]);
      const content_hash = makeContentHash(body);

      units.push({
        kb_slug,
        doc_id,
        canonical_url,
        title,
        section,
        site,
        uni,
        corpus,
        year: YEAR,
        section_key: clampAttribute(partKey, 200),
        content_hash,
        content: body,
      });
    }
  }

  // If something went wrong and we produced none, fallback to full doc.
  if (units.length === 0) {
    const body = buildVsBody(title, canonical_url, section, pageBody);
    const content_hash = makeContentHash(body);
    units.push({
      kb_slug,
      doc_id,
      canonical_url,
      title,
      section,
      site,
      uni,
      corpus,
      year: YEAR,
      section_key: "__full__",
      content_hash,
      content: body,
    });
  }

  return { doc_id, chunkCountEstimate, units };
}

/* --------------------- output writing --------------------- */

function toVsFrontmatter(u: VsUnit): string {
  const lines = [
    "---",
    `kb_slug: ${u.kb_slug}`,
    `doc_id: ${u.doc_id}`,
    `canonical_url: ${u.canonical_url}`,
    `title: ${clampAttribute(u.title, 200)}`,
    `section: ${clampAttribute(u.section, 128)}`,
    `site: ${clampAttribute(u.site, 64)}`,
    `uni: ${u.uni}`,
    `corpus: ${u.corpus}`,
    `year: ${u.year}`,
    `section_key: ${u.section_key}`,
    `content_hash: ${u.content_hash}`,
    "---",
    "",
  ];
  return lines.join("\n");
}

function writeVsFile(outDir: string, u: VsUnit): string {
  const safeDoc = u.doc_id.replace(/[^a-zA-Z0-9_-]/g, "_");
  const safeKey = u.section_key.replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `${u.kb_slug}__${safeDoc}__${safeKey}.md`;
  const filePath = path.join(outDir, filename);
  fs.writeFileSync(filePath, toVsFrontmatter(u) + u.content.trim() + "\n", "utf-8");
  return filePath;
}

function buildAttributes(u: VsUnit): VsAttributes {
  // These are the attributes you should attach onto the vector-store file.
  // Keep values simple (string/number/bool).
  return {
    uni: u.uni,
    corpus: u.corpus,
    year: u.year,
    kb_slug: u.kb_slug,
    doc_id: u.doc_id,
    site: u.site,
    section_key: u.section_key,
    canonical_url: u.canonical_url, // optional but useful for debugging
    content_hash: u.content_hash,   // useful for idempotency
  };
}

/* -------------------------- main -------------------------- */

(async function main() {
  const pagePaths = findPageMarkdownFiles(pagesDir);
  if (pagePaths.length === 0) throw new Error(`No page .md files found under: ${pagesDir}`);

  console.log("Building VS files for:", kbSlug);
  console.log("Pages dir:", pagesDir);
  console.log("VS out:", outVsDir);
  console.log(
    `chunkMaxTokens=${CHUNK_MAX_TOKENS} largeChunkThreshold=${LARGE_CHUNK_THRESHOLD} sectionMaxTokens=${SECTION_MAX_TOKENS} sectionOverlapTokens=${SECTION_OVERLAP_TOKENS} year=${YEAR}`
  );
  console.log(`Found ${pagePaths.length} page files`);

  // Clear destination directory by default (matches your chunk script behavior)
  rmDirContents(outVsDir);

  const manifest: Array<{
    page_path: string;
    vs_file_path: string;
    attributes: VsAttributes;
  }> = [];

  let pagesOk = 0;
  let pagesFailed = 0;
  let totalVsFiles = 0;
  let totalLargePages = 0;

  for (const p of pagePaths) {
    try {
      const raw = fs.readFileSync(p, "utf-8");
      const { fm, body } = readFrontmatter(raw);

      const canonical_url = must(fm, ["canonical_url", "url"], p);
      const title = inferTitleFromFrontmatter(fm, canonical_url);
      const section = inferSectionFromFrontmatter(fm);
      const site = inferSiteFromFrontmatter(fm);

      const { units, chunkCountEstimate } = buildUnitsFromPage(
        kbSlug,
        { canonical_url, title, section, site },
        body
      );

      if (chunkCountEstimate > LARGE_CHUNK_THRESHOLD) totalLargePages += 1;

      for (const u of units) {
        const vsPath = writeVsFile(outVsDir, u);
        manifest.push({
          page_path: p,
          vs_file_path: vsPath,
          attributes: buildAttributes(u),
        });
      }

      pagesOk += 1;
      totalVsFiles += units.length;

      if (pagesOk % 25 === 0) {
        console.log(
          `...processed ${pagesOk}/${pagePaths.length} pages (vs_files=${totalVsFiles}, large_pages=${totalLargePages})`
        );
      }
    } catch (e: any) {
      pagesFailed += 1;
      console.warn("FAILED:", p, "-", e?.message ?? e);
    }
  }

  const manifestPath = path.join(outVsDir, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");

  console.log("\nDone.");
  console.log("Pages ok:", pagesOk);
  console.log("Pages failed:", pagesFailed);
  console.log("Large pages:", totalLargePages);
  console.log("Total VS files written:", totalVsFiles);
  console.log("Manifest:", manifestPath);
})();