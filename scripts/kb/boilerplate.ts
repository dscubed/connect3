// scripts/kb/boilerplate.ts
// Phase 2: global boilerplate removal via block fingerprinting (two-pass).
import crypto from "crypto";

function sha1(s: string) {
  return crypto.createHash("sha1").update(s).digest("hex");
}

export function splitBlocks(md: string): string[] {
  return md
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);
}

export function normalizeBlock(block: string): string {
  return block
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[“”‘’]/g, "'")
    .replace(/[^\p{L}\p{N}\s]/gu, "") // letters/numbers/spaces only
    .trim();
}

export type BlockStats = {
  blockCounts: Map<string, number>; // blockHash -> count of pages containing it
  totalPages: number;
};

export function collectBlockStats(pages: { markdown: string }[]): BlockStats {
  const blockCounts = new Map<string, number>();

  for (const p of pages) {
    const seenInPage = new Set<string>();
    for (const b of splitBlocks(p.markdown)) {
      const norm = normalizeBlock(b);
      if (norm.length < 60) continue; // ignore tiny blocks
      seenInPage.add(sha1(norm));
    }
    for (const h of seenInPage) {
      blockCounts.set(h, (blockCounts.get(h) ?? 0) + 1);
    }
  }

  return { blockCounts, totalPages: pages.length };
}

export type BoilerplateConfig = {
  minPages?: number;      // absolute threshold (e.g. 8)
  minPct?: number;        // pct threshold (e.g. 0.06)
  minBlockChars?: number; // normalized chars threshold
};

export function removeBoilerplate(
  markdown: string,
  stats: BlockStats,
  cfg: BoilerplateConfig = {}
): { cleaned: string; removedBlocks: number } {
  const minBlockChars = cfg.minBlockChars ?? 60;
  const minPages =
    cfg.minPages ??
    Math.max(8, Math.ceil((cfg.minPct ?? 0.06) * stats.totalPages));

  let removedBlocks = 0;
  const kept: string[] = [];

  for (const b of splitBlocks(markdown)) {
    const norm = normalizeBlock(b);
    if (norm.length < minBlockChars) {
      kept.push(b);
      continue;
    }
    const h = sha1(norm);
    const count = stats.blockCounts.get(h) ?? 0;

    if (count >= minPages) {
      removedBlocks += 1;
      continue;
    }

    kept.push(b);
  }

  return { cleaned: kept.join("\n\n").trim(), removedBlocks };
}

// Optional debug helper: show top-N most common blocks (hashes only)
export function topCommonBlocks(stats: BlockStats, topN = 20) {
  return Array.from(stats.blockCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN);
}