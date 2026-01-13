/**
 * Convert any university identifier (LLM output, user text, DB value) into a canonical slug.
 * Canonical slugs should be lowercase and stable, e.g.:
 *  - unimelb
 *  - monash
 *  - uwa
 *  - rmit
 */
export function normalizeUniversitySlug(input: string | null | undefined): string | null {
    if (!input) return null;
  
    const s = input.trim().toLowerCase();
    if (!s) return null;
  
    // Common aliases -> canonical slugs
    const ALIASES: Record<string, string> = {
      // UniMelb
      "unimelb": "unimelb",
      "uni melb": "unimelb",
      "uni-melb": "unimelb",
      "uom": "unimelb",
      "melbourne uni": "unimelb",
      "melbourne university": "unimelb",
      "university of melbourne": "unimelb",
      "the university of melbourne": "unimelb",
  
      // Monash
      "monash": "monash",
      "monash uni": "monash",
      "monash university": "monash",
  
      // UWA
      "uwa": "uwa",
      "university of western australia": "uwa",

      // RMIT
      "rmit": "rmit",
      "rmit university": "rmit",
    };
  
    // Exact match
    if (ALIASES[s]) return ALIASES[s];
  
    // Remove punctuation, collapse spaces, then match
    const cleaned = s
      .replace(/[^\p{L}\p{N}\s]/gu, "") // strip punctuation (unicode-safe)
      .replace(/\s+/g, " ")
      .trim();
  
    if (ALIASES[cleaned]) return ALIASES[cleaned];
  
    // If it already looks like a slug (e.g., "korea-university"), keep it
    if (/^[a-z0-9_-]+$/.test(s)) return s;
  
    return null;
  }
  