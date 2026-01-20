import { SearchResponse } from "./types";
import { parseMarkdownEntities } from "./markdownParser";

/**
 * Parse streaming markdown response and extract entities as they appear.
 * This is called during streaming to provide partial updates to the UI.
 *
 * @param markdown - The accumulated markdown text from the stream
 * @returns Partial SearchResponse with current markdown and extracted entities
 */
export const partialParseMarkdown = (
  markdown: string,
): Partial<SearchResponse> => {
  const { entities } = parseMarkdownEntities(markdown);

  return {
    markdown,
    entities,
  };
};

/**
 * @deprecated Use partialParseMarkdown instead.
 * This legacy parser handled the old JSON format with summary/results/followUps.
 * Kept for backward compatibility during migration.
 */
export const partialParseResponse = partialParseMarkdown;
