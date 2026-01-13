import crypto from "crypto";

export function sha1(s: string) {
  return crypto.createHash("sha1").update(s).digest("hex");
}

const ALWAYS_STRIP_PARAMS = new Set([
  // Common tracking
  "gclid",
  "dclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "msclkid",
  "yclid",
  "_gl",
  "mc_cid",
  "mc_eid",
  "mkt_tok",
  "igshid",
  "ref",
  "ref_src",
  "ref_url",
  "source",
  "cmpid",
  "campaign",
  "share",
  "amp",
]);

const ALWAYS_STRIP_PREFIXES = ["utm_"];

const SEARCH_PARAM_NAMES = new Set([
  "q",
  "query",
  "s",
  "search",
  "keyword",
  "keywords",
]);

function looksLikeSearchPath(pathname: string) {
  const p = pathname.toLowerCase();
  return (
    p === "/search" ||
    p.startsWith("/search/") ||
    p === "/global-search" ||
    p.startsWith("/global-search/") ||
    p.includes("/site-search")
  );
}

export function canonicalizeUrl(input: string): string {
  const u = new URL(input);

  // Only canonicalize http(s); otherwise return input as-is (or throw if you prefer)
  if (u.protocol !== "http:" && u.protocol !== "https:") return input;

  u.hostname = u.hostname.toLowerCase();
  if (u.hostname.startsWith("www.")) u.hostname = u.hostname.slice(4);

  // Remove fragment always
  u.hash = "";

  // Strip selected query params (instead of nuking all)
  const isSearchPage = looksLikeSearchPath(u.pathname);

  for (const key of Array.from(u.searchParams.keys())) {
    const lowerKey = key.toLowerCase();

    // 1) Always strip known tracking keys
    if (ALWAYS_STRIP_PARAMS.has(lowerKey)) {
      u.searchParams.delete(key);
      continue;
    }

    // 2) Always strip tracking prefixes (utm_*)
    if (ALWAYS_STRIP_PREFIXES.some((pfx) => lowerKey.startsWith(pfx))) {
      u.searchParams.delete(key);
      continue;
    }

    // 3) Strip search params on search-like pages only
    if (isSearchPage && SEARCH_PARAM_NAMES.has(lowerKey)) {
      u.searchParams.delete(key);
      continue;
    }
  }

  // If nothing left, clear search entirely
  if (Array.from(u.searchParams.keys()).length === 0) u.search = "";

  // Normalize trailing slash
  if (u.pathname !== "/" && u.pathname.endsWith("/")) u.pathname = u.pathname.slice(0, -1);

  return u.toString();
}

export function normalizeTextForHash(markdown: string) {
  return markdown
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}