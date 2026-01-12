import crypto from "crypto";

function sha1(s: string) {
  return crypto.createHash("sha1").update(s).digest("hex");
}

function normalizeForHash(s: string) {
  return s
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export type Chunk = {
  chunk_id: string;
  chunk_hash: string;

  chunk_type: "page_overview" | "section";
  chunk_index: number;

  chunk_title: string;      // human readable
  heading_path: string;     // e.g. "What do I have to do? > Training"
  content: string;          // markdown body for this chunk (no frontmatter)
};

type Heading = { level: number; title: string };

function parseHeadings(md: string): { idx: number; level: number; title: string }[] {
  const lines = md.split("\n");
  const out: { idx: number; level: number; title: string }[] = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(#{1,6})\s+(.+?)\s*$/);
    if (!m) continue;
    out.push({ idx: i, level: m[1].length, title: m[2].trim() });
  }
  return out;
}

function buildHeadingPath(stack: Heading[]) {
  return stack.map(h => h.title).join(" > ");
}

function makeChunkId(doc_id: string, chunk_type: string, heading_path: string, chunk_index: number) {
  return sha1(`${doc_id}:${chunk_type}:${heading_path}:${chunk_index}`);
}

function buildOverview(md: string, docTitle: string) {
  const headings = parseHeadings(md).map(h => `${"  ".repeat(Math.max(0, h.level - 2))}- ${h.title}`);
  const outline = headings.length ? headings.join("\n") : "- (no headings detected)";

  // very lightweight “summary”: first ~2 blocks of text
  const blocks = md
    .replace(/^#\s+.*$/m, "") // drop first H1 if present
    .split(/\n{2,}/)
    .map(b => b.trim())
    .filter(Boolean);

  const summary = blocks.slice(0, 2).join("\n\n").slice(0, 800);

  const content =
`## Overview

${summary || "(no summary available)"}

## Page outline

${outline}
`.trim();

  return { title: `${docTitle} — Overview`, content };
}

/**
 * Heading-based chunking:
 * - Produces 1 page_overview chunk
 * - Produces section chunks split by headings (##/###/#### etc). H1 is treated as page title.
 * - If page is short, returns a single "section" chunk + overview.
 */
export function chunkMarkdown(args: {
  doc_id: string;
  docTitle: string;
  markdown: string;        // full page markdown, cleaned
  minSectionChars?: number; // default 250
  maxSectionChars?: number; // default 4000 (soft)
}): Chunk[] {
  const md = args.markdown.trim();
  const minSectionChars = args.minSectionChars ?? 250;
  const maxSectionChars = args.maxSectionChars ?? 4000;

  const chunks: Chunk[] = [];

  // Always add overview chunk
  const ov = buildOverview(md, args.docTitle);
  {
    const heading_path = "overview";
    const chunk_index = 0;
    const chunk_id = makeChunkId(args.doc_id, "page_overview", heading_path, chunk_index);
    const chunk_hash = sha1(normalizeForHash(ov.content));
    chunks.push({
      chunk_id,
      chunk_hash,
      chunk_type: "page_overview",
      chunk_index,
      chunk_title: ov.title,
      heading_path,
      content: ov.content,
    });
  }

  // If very short, keep whole page as one section chunk
  if (md.length < maxSectionChars) {
    const heading_path = "page";
    const chunk_index = 0;
    const chunk_id = makeChunkId(args.doc_id, "section", heading_path, chunk_index);
    const chunk_hash = sha1(normalizeForHash(md));
    chunks.push({
      chunk_id,
      chunk_hash,
      chunk_type: "section",
      chunk_index,
      chunk_title: args.docTitle,
      heading_path,
      content: md,
    });
    return chunks;
  }

  // Otherwise split by headings
  const lines = md.split("\n");
  const hs = parseHeadings(md);

  // No headings found → single section chunk
  if (hs.length === 0) {
    const heading_path = "page";
    const chunk_index = 0;
    const chunk_id = makeChunkId(args.doc_id, "section", heading_path, chunk_index);
    const chunk_hash = sha1(normalizeForHash(md));
    chunks.push({
      chunk_id,
      chunk_hash,
      chunk_type: "section",
      chunk_index,
      chunk_title: args.docTitle,
      heading_path,
      content: md,
    });
    return chunks;
  }

  // Treat first H1 as title line; we chunk from first heading onward anyway.
  const stack: Heading[] = [];
  let chunkIndex = 0;

  for (let i = 0; i < hs.length; i++) {
    const h = hs[i];
    const start = h.idx;
    const end = i + 1 < hs.length ? hs[i + 1].idx : lines.length;

    const level = h.level;
    const title = h.title;

    // Maintain heading stack
    while (stack.length && stack[stack.length - 1].level >= level) stack.pop();
    stack.push({ level, title });

    const sectionText = lines.slice(start, end).join("\n").trim();
    if (sectionText.length < minSectionChars) continue;

    // Soft split if section is huge: break into subchunks by blocks
    const blocks = sectionText.split(/\n{2,}/).map(b => b.trim()).filter(Boolean);
    let current = "";
    let part = 0;

    const flush = () => {
      const content = current.trim();
      if (content.length < minSectionChars) return;
      const heading_path = buildHeadingPath(stack) + (part > 0 ? ` (part ${part + 1})` : "");
      const chunk_id = makeChunkId(args.doc_id, "section", heading_path, chunkIndex);
      const chunk_hash = sha1(normalizeForHash(content));
      chunks.push({
        chunk_id,
        chunk_hash,
        chunk_type: "section",
        chunk_index: chunkIndex,
        chunk_title: buildHeadingPath(stack),
        heading_path,
        content,
      });
      chunkIndex += 1;
    };

    for (const b of blocks) {
      if ((current + "\n\n" + b).length > maxSectionChars && current.trim().length >= minSectionChars) {
        flush();
        current = b;
        part += 1;
      } else {
        current = current ? `${current}\n\n${b}` : b;
      }
    }
    flush();
  }

  // Fallback if we somehow produced no section chunks
  if (!chunks.some(c => c.chunk_type === "section")) {
    const heading_path = "page";
    const chunk_id = makeChunkId(args.doc_id, "section", heading_path, 0);
    const chunk_hash = sha1(normalizeForHash(md));
    chunks.push({
      chunk_id,
      chunk_hash,
      chunk_type: "section",
      chunk_index: 0,
      chunk_title: args.docTitle,
      heading_path,
      content: md,
    });
  }

  return chunks;
}