import pLimit from "p-limit";
import * as cheerio from "cheerio";

import { SITES } from "./config";
import { loadRobots } from "./robots";
import { fetchHtml } from "./fetch";
import { extractToMarkdown } from "./extract";
import { writePage } from "./write";

function shouldKeepUrl(
  url: string,
  allowPrefixes: string[],
  denySubstrings: string[]
) {
  if (!allowPrefixes.some((p) => url.startsWith(p))) return false;
  if (denySubstrings.some((d) => url.includes(d))) return false;
  return true;
}

function normalizeUrl(absolute: string): string {
  const u = new URL(absolute);
  u.hash = "";
  u.search = ""; // strip query params
  return u.toString();
}

function isClubContentUrl(url: string): boolean {
  try {
    const u = new URL(url);
    const p = u.pathname.toLowerCase();

    if (!p.startsWith("/buddy-up/clubs/clubs-listing")) return false;

    const parts = p.split("/").filter(Boolean); // e.g. ["buddy-up","clubs","mathematics-statistics-society"]

    // Exclude the section landing page itself: /buddy-up/clubs/
    if (parts.length <= 2) return false;

    return true; // looks like an individual club page
  } catch {
    return false;
  }
}

function extractLinks(baseUrl: string, html: string): string[] {
  const $ = cheerio.load(html);
  const out = new Set<string>();

  $("a[href]").each((_, el) => {
    const raw = String($(el).attr("href") ?? "").trim();
    if (!raw) return;

    // Skip non-page URLs
    if (
      raw.startsWith("mailto:") ||
      raw.startsWith("tel:") ||
      raw.startsWith("javascript:") ||
      raw.startsWith("#")
    ) {
      return;
    }

    // Skip common file types (PDFs, images, docs, archives, etc.)
    if (
      /\.(pdf|jpg|jpeg|png|gif|webp|svg|doc|docx|ppt|pptx|xls|xlsx|zip|rar)$/i.test(
        raw
      )
    ) {
      return;
    }

    try {
      const absolute = new URL(raw, baseUrl).toString();
      out.add(normalizeUrl(absolute));
    } catch {
      // ignore malformed
    }
  });

  return Array.from(out);
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runSite(site: (typeof SITES)[number]) {
  console.log(`\n== Scraping ${site.siteId} ==`);
  const robots = await loadRobots(site.baseUrl);

  // Priority queues: clubs first, then everything else
  const hiQueue: string[] = [];
  const loQueue: string[] = [];

  // Seed queues
  for (const s of site.seeds) {
    const n = normalizeUrl(s);
    if (isClubContentUrl(n)) hiQueue.push(n);
    else loQueue.push(n);
  }

  const seen = new Set<string>();

  const outDir = `scripts/kb_scrapes/${site.siteId}`;

  // Keep concurrency low to be polite
  const limit = pLimit(2);

  let saved = 0;
  let fetched = 0;

  const takeNext = () => (hiQueue.length ? hiQueue.shift()! : loQueue.shift()!);
  const queueLength = () => hiQueue.length + loQueue.length;

  while (queueLength() > 0 && saved < site.maxPages) {
    const batch: string[] = [];

    // Build a small batch of URLs to fetch
    while (queueLength() > 0 && batch.length < 5) {
      const u = takeNext();

      if (seen.has(u)) continue;
      seen.add(u);

      if (!shouldKeepUrl(u, site.allowPrefixes, site.denySubstrings)) continue;

      batch.push(u);
    }

    if (!batch.length) continue;

    await Promise.all(
      batch.map((url) =>
        limit(async () => {
          // Respect robots.txt
          if (!robots.isAllowed(url, "Connect3KBCollector")) return;

          // Politeness delay (add a bit of jitter)
          await sleep(site.delayMs + Math.floor(Math.random() * 300));

          const html = await fetchHtml(url);
          if (!html) return;
          fetched += 1;

          // ALWAYS discover links, even if we skip saving this page
          const links = extractLinks(site.baseUrl, html);
          for (const l of links) {
            if (seen.has(l)) continue;
            if (!shouldKeepUrl(l, site.allowPrefixes, site.denySubstrings)) continue;

            if (isClubContentUrl(l)) hiQueue.push(l);
            else loQueue.push(l);
          }

          // Extract readable content to markdown
          let title = url;
          let markdown = "";
          try {
            const extracted = extractToMarkdown(html, url);
            title = extracted.title;
            markdown = extracted.markdown;
          } catch (e) {
            console.warn(`Extract failed: ${url}`, e);
            return;
          }

          // Skip saving very thin pages (but links have already been queued)
          if (markdown.trim().length < 200) return;

          const filename = writePage({
            outDir,
            siteId: site.siteId,
            url,
            title,
            markdown,
          });

          saved += 1;
          console.log(
            `Saved (${saved}) [fetched=${fetched}, hi=${hiQueue.length}, lo=${loQueue.length}]: ${filename}`
          );
        })
      )
    );
  }

  console.log(`Done ${site.siteId}: saved ${saved} pages (fetched ${fetched})`);
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
