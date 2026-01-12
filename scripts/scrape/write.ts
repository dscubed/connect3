import fs from "fs";
import path from "path";
import { sha1, canonicalizeUrl, normalizeTextForHash } from "./hash"; // adjust path

export function writePage(args: {
  outDir: string;
  siteId: string;
  url: string;       // fetched URL
  title: string;
  markdown: string;  // cleaned markdown
  section?: string | null;
}) {
  fs.mkdirSync(args.outDir, { recursive: true });

  const canonical_url = canonicalizeUrl(args.url);
  const doc_id = sha1(canonical_url);
  const content_hash = sha1(normalizeTextForHash(args.markdown));

  // Stable filename: title changes won't create a new file
  const filename = `${args.siteId}__${doc_id}.md`;

  const safeTitle = args.title.replace(/\n/g, " ").trim();
  const section = (args.section ?? "unknown").trim();

  const body = `---
site: ${args.siteId}
url: ${args.url}
canonical_url: ${canonical_url}
doc_id: ${doc_id}
title: ${safeTitle}
section: ${section}
content_hash: ${content_hash}
fetched_at: ${new Date().toISOString()}
---

# ${safeTitle}

${args.markdown}
`;

  fs.writeFileSync(path.join(args.outDir, filename), body, "utf-8");
  return filename;
}