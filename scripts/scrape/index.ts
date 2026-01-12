import pLimit from "p-limit";
import * as cheerio from "cheerio";
import path from "node:path";

import { SITES } from "./config";
import { loadRobots } from "./robots";
import { fetchHtml } from "./fetch";
import { extractToMarkdown } from "./extract";
import { writePage } from "./write";
import { canonicalizeUrl, sha1 } from "../kb/hash";
import { writeChunksFromPage } from "../kb/writeChunks";

import { MaxPriorityQueue } from "../kb/priorityQueue";
import { collectBlockStats, removeBoilerplate } from "../kb/boilerplate";

/* -------------------- helpers -------------------- */

function classifySection(url: string): string {
  const u = url.toLowerCase();
  if (u.includes("/support/")) return "support";
  if (u.includes("/buddy-up/clubs/")) return "clubs";
  if (u.includes("/buddy-up/")) return "buddy-up";
  if (u.includes("/express-yourself/")) return "express-yourself";
  if (u.includes("/about/")) return "about";
  return "unknown";
}

function startsWithPrefix(url: string, prefix: string) {
  return url === prefix || url.startsWith(prefix + "/");
}

function shouldKeepUrl(
  url: string,
  allowPrefixes: string[],
  allowPrefixesCanonical: string[],
  denySubstrings: string[]
) {
  const allowed =
    allowPrefixes.some((p) => startsWithPrefix(url, p)) ||
    allowPrefixesCanonical.some((p) => startsWithPrefix(url, p));

  if (!allowed) return false;
  if (denySubstrings.some((d) => url.includes(d))) return false;
  return true;
}

function canonicalizeUrlSafe(input: string): string | null {
  try {
    return canonicalizeUrl(input);
  } catch {
    return null;
  }
}

function scoreUrl(url: string): number {
  const u = url.toLowerCase();
  let score = 0;
  if (u.includes("/support/")) score += 10;
  if (u.includes("/clubs/")) score += 8;
  if (u.includes("/volunteer")) score += 6;
  if (u.split("/").filter(Boolean).length > 5) score += 3;
  if (u.endsWith("/")) score -= 1;
  return score;
}

function extractLinks(baseUrl: string, html: string): string[] {
  const $ = cheerio.load(html);
  const out = new Set<string>();

  $("a[href]").each((_, el) => {
    const raw = String($(el).attr("href") ?? "").trim();
    if (!raw) return;

    if (
      raw.startsWith("mailto:") ||
      raw.startsWith("tel:") ||
      raw.startsWith("javascript:") ||
      raw.startsWith("#")
    ) return;

    if (
      /\.(pdf|jpg|jpeg|png|gif|webp|svg|doc|docx|ppt|pptx|xls|xlsx|zip|rar)$/i.test(
        raw
      )
    ) return;

    try {
      const abs = new URL(raw, baseUrl).toString();
      const canonical = canonicalizeUrlSafe(abs);
      if (canonical) out.add(canonical);
    } catch {}
  });

  return Array.from(out);
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/* -------------------- main -------------------- */

type ExtractedPage = {
  url: string;
  title: string;
  markdown: string;
  section: string;
};

async function runSite(site: (typeof SITES)[number]) {
  console.log(`\n=== SCRAPING ${site.siteId.toUpperCase()} ===`);

  const robots = await loadRobots(site.baseUrl);

  const allowPrefixesCanonical = site.allowPrefixes
    .map((p) => canonicalizeUrlSafe(p))
    .filter((p): p is string => Boolean(p));

  const pq = new MaxPriorityQueue<string>();
  const enqueue = (url: string) => pq.push(url, scoreUrl(url));

  for (const s of site.seeds) {
    const canonical = canonicalizeUrlSafe(s);
    if (canonical) enqueue(canonical);
  }

  const seen = new Set<string>();
  const outDir = `scripts/kb_scrapes/${site.siteId}`;
  console.log("OUT DIR (absolute):", path.resolve(outDir));

  const limit = pLimit(2);

  let fetched = 0;
  let extractedCount = 0;

  const extractedPages: ExtractedPage[] = [];

  while (pq.size() > 0 && extractedCount < site.maxPages) {
    const batch: string[] = [];

    while (pq.size() > 0 && batch.length < 5) {
      const u = pq.pop();
      if (!u) break;

      if (seen.has(u)) continue;
      seen.add(u);

      if (
        !shouldKeepUrl(
          u,
          site.allowPrefixes,
          allowPrefixesCanonical,
          site.denySubstrings
        )
      ) continue;

      batch.push(u);
    }

    if (!batch.length) continue;

    await Promise.all(
      batch.map((url) =>
        limit(async () => {
          if (!robots.isAllowed(url, "Connect3KBCollector")) return;

          await sleep(site.delayMs + Math.floor(Math.random() * 300));

          let html = "";
          try {
            html = await fetchHtml(url);
          } catch (e) {
            console.warn("FETCH FAILED:", url);
            return;
          }

          fetched += 1;

          const links = extractLinks(site.baseUrl, html);
          for (const l of links) {
            if (!seen.has(l)) enqueue(l);
          }

          let title = url;
          let markdown = "";

          try {
            const extracted = extractToMarkdown(html, url);
            title = extracted.title;
            markdown = extracted.markdown;
          } catch (e) {
            console.warn("EXTRACT FAILED:", url);
            return;
          }

          if (markdown.trim().length < 200) {
            console.log("SKIPPED (thin pre-debloat):", url);
            return;
          }

          extractedPages.push({
            url,
            title,
            markdown,
            section: classifySection(url),
          });

          extractedCount += 1;
          console.log(`EXTRACTED ${extractedCount}:`, url);
        })
      )
    );
  }

  console.log("\n--- PHASE 2 STATS ---");
  console.log("Fetched pages:", fetched);
  console.log("Extracted pages:", extractedPages.length);

  if (extractedPages.length === 0) {
    console.warn("⚠️  NO PAGES EXTRACTED — NOTHING TO WRITE");
    return;
  }

  const stats = collectBlockStats(extractedPages);

  let written = 0;
  let skippedAfterDebloat = 0;

  for (const p of extractedPages) {
    const { cleaned, removedBlocks } = removeBoilerplate(p.markdown, stats, {
      minPages: 8,
      minPct: 0.06,
      minBlockChars: 60,
    });

    if (cleaned.trim().length < 150) {
      skippedAfterDebloat += 1;
      console.log("SKIPPED (thin post-debloat):", p.url);
      continue;
    }

    const canonical_url = canonicalizeUrl(p.url);
    const doc_id = sha1(canonical_url);

    // keep writing the page-level md if you want (optional)
    const filename = writePage({
      outDir,
      siteId: site.siteId,
      url: p.url,
      title: p.title,
      markdown: cleaned,
      section: p.section,
    });

    // NEW: write chunk files
    writeChunksFromPage({
      siteId: site.siteId,
      outDir,
      canonical_url,
      doc_id,
      title: p.title,
      section: p.section,
      markdown: cleaned,
    });

    written += 1;
    console.log("WROTE FILE:", filename, `(removed blocks: ${removedBlocks})`);
  }

  console.log("\n--- WRITE SUMMARY ---");
  console.log("Written files:", written);
  console.log("Skipped after debloat:", skippedAfterDebloat);
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