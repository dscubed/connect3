import { EntityResult, EntityType, SearchResponse } from "./types";

// Regex to match entity markers: @@@type:id@@@
const ENTITY_MARKER_REGEX = /@@@(user|organisation|events):([a-f0-9-]+)@@@/gi;

/**
 * Parse markdown content and extract entity markers.
 * Entity markers use the format: @@@type:id@@@
 *
 * Example:
 * "Check out @@@user:abc-123@@@ and @@@organisation:def-456@@@"
 *
 * Returns both the original markdown and extracted entities.
 */
export function parseMarkdownEntities(markdown: string): {
  markdown: string;
  entities: EntityResult[];
} {
  const entities: EntityResult[] = [];
  const seen = new Set<string>();

  // Extract all entity markers
  let match;
  while ((match = ENTITY_MARKER_REGEX.exec(markdown)) !== null) {
    const type = match[1].toLowerCase() as EntityType;
    const id = match[2];
    const key = `${type}:${id}`;

    // Deduplicate entities
    if (!seen.has(key)) {
      seen.add(key);
      entities.push({ type, id });
    }
  }

  return { markdown, entities };
}

/**
 * Split markdown into segments: text and entity markers.
 * Useful for rendering markdown with inline entity cards.
 */
export type MarkdownSegment =
  | { type: "text"; content: string }
  | { type: "entity"; entity: EntityResult };

export function splitMarkdownIntoSegments(markdown: string): MarkdownSegment[] {
  const segments: MarkdownSegment[] = [];
  let lastIndex = 0;

  // Reset regex state
  ENTITY_MARKER_REGEX.lastIndex = 0;

  let match;
  while ((match = ENTITY_MARKER_REGEX.exec(markdown)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      const textContent = markdown.slice(lastIndex, match.index);
      if (textContent.trim()) {
        segments.push({ type: "text", content: textContent });
      }
    }

    // Add entity marker
    const entityType = match[1].toLowerCase() as EntityType;
    const entityId = match[2];
    segments.push({
      type: "entity",
      entity: { type: entityType, id: entityId },
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < markdown.length) {
    const textContent = markdown.slice(lastIndex);
    if (textContent.trim()) {
      segments.push({ type: "text", content: textContent });
    }
  }

  return segments;
}

/**
 * Convert legacy SearchResponse format (with summary/results/followUps)
 * to the new unified markdown format.
 *
 * This is for backwards compatibility during migration.
 * Handles:
 *  1) New format: {"markdown":"...","entities":[]}
 *  2) Legacy format: {"summary":"...","results":[],"followUps":""}
 *  3) Wrapped: {"result":{"summary":"..."}} or {"result":{"markdown":"..."}}
 *  4) Double-stringified JSON strings
 *  5) Plain text strings
 */
export function normalizeToMarkdownResponse(content: unknown): SearchResponse {
  // Handle null/undefined
  if (content == null) {
    return { markdown: "", entities: [] };
  }

  // If string, try to parse as JSON (handle double-stringified)
  if (typeof content === "string") {
    let s = content.trim();
    if (!s) return { markdown: "", entities: [] };

    // Try up to 2 parses to handle double-stringified JSON
    for (let i = 0; i < 2; i++) {
      try {
        const parsed = JSON.parse(s);
        if (typeof parsed === "string") {
          s = parsed.trim();
          continue;
        }
        // Recursively normalize the parsed object
        return normalizeToMarkdownResponse(parsed);
      } catch {
        // Not JSON => treat as plain markdown text
        const { entities } = parseMarkdownEntities(s);
        return { markdown: s, entities };
      }
    }
    // Fallback after loop
    const { entities } = parseMarkdownEntities(s);
    return { markdown: s, entities };
  }

  // Must be an object at this point
  if (typeof content !== "object") {
    return { markdown: "", entities: [] };
  }

  const obj = content as Record<string, unknown>;

  // Unwrap { result: ... } wrapper if present
  const unwrapped = obj.result !== undefined ? obj.result : obj;

  // If result is a string, it might be stringified JSON
  if (typeof unwrapped === "string") {
    return normalizeToMarkdownResponse(unwrapped);
  }

  if (typeof unwrapped !== "object" || unwrapped === null) {
    return { markdown: "", entities: [] };
  }

  const data = unwrapped as Record<string, unknown>;

  // Already in new format
  if ("markdown" in data && typeof data.markdown === "string") {
    const { entities } = parseMarkdownEntities(data.markdown);
    return {
      markdown: data.markdown,
      entities: (data.entities as EntityResult[]) ?? entities,
      quickLinks: data.quickLinks as SearchResponse["quickLinks"],
    };
  }

  // Legacy format with summary/results/followUps
  if ("summary" in data) {
    const legacy = data as {
      summary?: string;
      results?: Array<{
        header?: string;
        text?: string;
        matches?: EntityResult[];
      }>;
      followUps?: string;
      quickLinks?: SearchResponse["quickLinks"];
    };

    // Build markdown from legacy format
    let markdown = "";
    const entities: EntityResult[] = [];

    // Add summary
    if (legacy.summary) {
      markdown += legacy.summary + "\n\n";
    }

    // Convert results to markdown sections
    if (legacy.results && legacy.results.length > 0) {
      for (const result of legacy.results) {
        if (result.header) {
          markdown += `## ${result.header}\n\n`;
        }
        if (result.text) {
          markdown += result.text + "\n\n";
        }
        if (result.matches && result.matches.length > 0) {
          for (const match of result.matches) {
            markdown += `@@@${match.type}:${match.id}@@@\n`;
            entities.push(match);
          }
          markdown += "\n";
        }
      }
    }

    // Add follow-ups
    if (legacy.followUps) {
      markdown += legacy.followUps;
    }

    return {
      markdown: markdown.trim(),
      entities,
      quickLinks: legacy.quickLinks,
    };
  }

  // Fallback
  return { markdown: "", entities: [] };
}
