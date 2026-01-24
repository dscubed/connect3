import { EntityResult, EntityType, SearchResponse } from "./types";

// Regex to match entity markers: @@@type:id@@@ or [@@@type:id@@@]
// The AI sometimes wraps markers in square brackets, so this handles both cases
const ENTITY_MARKER_REGEX = /\[?@@@(user|organisation|events):([a-f0-9-]+)@@@\]?/gi;

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
 * Normalize various SearchResponse formats to the markdown format.
 */
export function normalizeToMarkdownResponse(
  content: Partial<SearchResponse>,
): SearchResponse {
  // Handle null/undefined
  if (content == null) {
    return { markdown: "" };
  }

  // Must be an object at this point
  if (typeof content !== "object") {
    return { markdown: "" };
  }

  // new markdown format
  if ("markdown" in content && typeof content.markdown === "string") {
    return {
      markdown: content.markdown,
      quickLinks: content.quickLinks as SearchResponse["quickLinks"],
    };
  }

  // Fallback
  return { markdown: "" };
}
