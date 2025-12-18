import { KBSearchResponse } from "./type";

/**
 * Best-effort partial JSON parsing while the model is streaming.
 * Returns a partial KBSearchResponse-like object that your UI can render progressively.
 */
export function partialParseKbResponse(text: string): Partial<KBSearchResponse> {
  // Fast path: try parse as-is
  try {
    const obj = JSON.parse(text);
    return sanitize(obj);
  } catch {
    // Best effort: try to close common truncations
    const fixed = tryFixJson(text);
    try {
      const obj = JSON.parse(fixed);
      return sanitize(obj);
    } catch {
      // If still not parseable, return nothing
      return {};
    }
  }
}

function sanitize(obj: any): Partial<KBSearchResponse> {
  const out: Partial<KBSearchResponse> = {};

  if (typeof obj?.summary === "string") out.summary = obj.summary;

  if (Array.isArray(obj?.results)) {
    out.results = obj.results
      .map((r: any) => {
        const header =
          r?.header === null || typeof r?.header === "string" ? r.header : null;

        const text = typeof r?.text === "string" ? r.text : "";
        const file_ids = Array.isArray(r?.file_ids)
          ? r.file_ids.map((x: any) => String(x))
          : [];

        return {
          header: header ?? undefined,
          text,
          file_ids,
        };
      })
      .filter((r: any) => r.text.length > 0);
  }

  if (typeof obj?.followUps === "string") out.followUps = obj.followUps;

  return out;
}

function tryFixJson(text: string): string {
  // Very lightweight “close braces” fixer for streaming JSON.
  // This is intentionally conservative.
  let t = text.trim();

  // If it doesn't even start with {, bail
  if (!t.startsWith("{")) return text;

  // Remove trailing commas
  t = t.replace(/,\s*([}\]])/g, "$1");

  // Close open quotes (rare)
  const quoteCount = (t.match(/"/g) ?? []).length;
  if (quoteCount % 2 === 1) t += '"';

  // Count brackets/braces and close them
  const openCurly = (t.match(/{/g) ?? []).length;
  const closeCurly = (t.match(/}/g) ?? []).length;
  const openSquare = (t.match(/\[/g) ?? []).length;
  const closeSquare = (t.match(/]/g) ?? []).length;

  t += "]".repeat(Math.max(0, openSquare - closeSquare));
  t += "}".repeat(Math.max(0, openCurly - closeCurly));

  return t;
}
