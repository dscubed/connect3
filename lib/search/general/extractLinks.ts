export type ExtractedLink = {
    url: string;
    label: string;
    source: "summary" | "followUps" | "result";
  };
  
  function normalizeUrl(url: string) {
    // trim trailing punctuation that often sticks to links in LLM output
    return url.replace(/[).,;!?]+$/g, "");
  }
  
  function defaultLabel(url: string) {
    try {
      const u = new URL(url);
      const host = u.hostname.replace(/^www\./, "");
      const path = u.pathname === "/" ? "" : u.pathname;
      return `${host}${path}`.slice(0, 48);
    } catch {
      return url.slice(0, 48);
    }
  }
  
  export function extractLinksFromMarkdown(
    md: string,
    source: ExtractedLink["source"]
  ): ExtractedLink[] {
    if (!md) return [];
  
    const out: ExtractedLink[] = [];
  
    // [label](url)
    const mdLinkRe = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
    let m: RegExpExecArray | null;
    while ((m = mdLinkRe.exec(md)) !== null) {
      out.push({ label: m[1].trim(), url: normalizeUrl(m[2]), source });
    }
  
    // bare URLs (fallback)
    const bareUrlRe = /(https?:\/\/[^\s<>()]+)\b/g;
    while ((m = bareUrlRe.exec(md)) !== null) {
      const url = normalizeUrl(m[1]);
      out.push({ label: defaultLabel(url), url, source });
    }
  
    // de-dupe by url, keep first label encountered
    const seen = new Set<string>();
    return out.filter((l) => (seen.has(l.url) ? false : (seen.add(l.url), true)));
  }
  