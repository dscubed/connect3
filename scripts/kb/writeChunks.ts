// scripts/kb/writeChunks.ts
import fs from "node:fs";
import path from "node:path";
import { chunkMarkdown } from "./chunkMarkdown";

export type PageForChunking = {
  siteId: string;
  outDir: string;            // e.g. scripts/kb_scrapes/umsu
  canonical_url: string;
  doc_id: string;
  title: string;
  section: string;
  markdown: string;          // cleaned page markdown (after Phase 2)
};

export function writeChunksFromPage(p: PageForChunking) {
  const chunksDir = path.join(p.outDir, "chunks");
  fs.mkdirSync(chunksDir, { recursive: true });

  const chunks = chunkMarkdown({
    doc_id: p.doc_id,
    docTitle: p.title,
    markdown: p.markdown,
  });

  const written: { chunk_id: string; filePath: string; chunk_hash: string; chunk_type: string; chunk_title: string; heading_path: string; chunk_index: number }[] = [];

  for (const c of chunks) {
    const filename = `${p.siteId}__${p.doc_id}__${c.chunk_id}.md`;
    const filePath = path.join(chunksDir, filename);

    const body = `---
site: ${p.siteId}
kb_slug: ${p.siteId}
doc_id: ${p.doc_id}
chunk_id: ${c.chunk_id}
chunk_type: ${c.chunk_type}
chunk_index: ${c.chunk_index}
chunk_hash: ${c.chunk_hash}
canonical_url: ${p.canonical_url}
title: ${p.title.replace(/\n/g, " ").trim()}
section: ${p.section}
chunk_title: ${c.chunk_title.replace(/\n/g, " ").trim()}
heading_path: ${c.heading_path.replace(/\n/g, " ").trim()}
---

# ${p.title}

## ${c.chunk_title}

${c.content}
`;

    fs.writeFileSync(filePath, body, "utf-8");
    written.push({
      chunk_id: c.chunk_id,
      filePath,
      chunk_hash: c.chunk_hash,
      chunk_type: c.chunk_type,
      chunk_title: c.chunk_title,
      heading_path: c.heading_path,
      chunk_index: c.chunk_index,
    });
  }

  return written;
}