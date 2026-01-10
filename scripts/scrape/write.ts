import fs from "fs";
import path from "path";
import crypto from "crypto";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/https?:\/\//g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 120);
}

export function writePage(args: {
  outDir: string;
  siteId: string;
  url: string;
  title: string;
  markdown: string;
}) {
  fs.mkdirSync(args.outDir, { recursive: true });

  const hash = crypto.createHash("sha1").update(args.url).digest("hex").slice(0, 10);
  const filename = `${args.siteId}__${slugify(args.title)}__${hash}.md`;

  const body = `---
site: ${args.siteId}
url: ${args.url}
title: ${args.title.replace(/\n/g, " ")}
fetched_at: ${new Date().toISOString()}
---

# ${args.title}

${args.markdown}
`;

  fs.writeFileSync(path.join(args.outDir, filename), body, "utf-8");
  return filename;
}
