import pLimit from "p-limit";
import { SITES } from "./config";
import { loadRobots } from "./robots";
import { fetchHtml } from "./fetch";
import { extractToMarkdown } from "./extract";
import { writePage } from "./write";

function shouldKeepUrl(url: string, allowPrefixes: string[], denySubstrings: string[]) {
  if (!allowPrefixes.some((p) => url.startsWith(p))) return false;
  if (denySubstrings.some((d) => url.includes(d))) return false;
  return true;
}

function extractLinks(baseUrl: string, html: string): string[] {
  const links: string[] = [];
  const re = /href="([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const raw = m[1];
    try {
      const u = new URL(raw, baseUrl).toString();
      links.push(u.split("#")[0]); // drop fragments
    } catch {
      // ignore
    }
  }
  return links;
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runSite(site: (typeof SITES)[number]) {
  console.log(`\n== Scraping ${site.siteId} ==`);
  const robots = await loadRobots(site.baseUrl);

  const queue = [...site.seeds];
  const seen = new Set<string>();
  const outDir = `kb_scrapes/${site.siteId}`;

  const limit = pLimit(2); // keep low
  let saved = 0;

  while (queue.length && saved < site.maxPages) {
    const batch: string[] = [];
    while (queue.length && batch.length < 5) {
      const u = queue.shift()!;
      if (seen.has(u)) continue;
      seen.add(u);
      if (!shouldKeepUrl(u, site.allowPrefixes, site.denySubstrings)) continue;
      batch.push(u);
    }

    await Promise.all(
      batch.map((url) =>
        limit(async () => {
          // robots check
          if (!robots.isAllowed(url, "Connect3KBCollector")) {
            return;
          }

          await sleep(site.delayMs);

          const html = await fetchHtml(url);
          const { title, markdown } = extractToMarkdown(html, url);

          if (markdown.trim().length < 200) return; // skip thin pages

          const filename = writePage({ outDir, siteId: site.siteId, url, title, markdown });
          saved += 1;
          console.log(`Saved (${saved}): ${filename}`);

          // discover more links
          const links = extractLinks(site.baseUrl, html);
          for (const l of links) {
            if (!seen.has(l) && shouldKeepUrl(l, site.allowPrefixes, site.denySubstrings)) {
              queue.push(l);
            }
          }
        })
      )
    );
  }

  console.log(`Done ${site.siteId}: saved ${saved} pages`);
}

async function main() {
  for (const site of SITES) {
    await runSite(site);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
