import { SearchResponse } from "./types";

/**
 * Parse streaming markdown response and extract entities as they appear.
 * This is called during streaming to provide partial updates to the UI.
 *
 * @param markdown - The accumulated markdown text from the stream
 * @returns Partial SearchResponse with current markdown
 */
export const partialParseMarkdown = (
  markdown: string,
): Partial<SearchResponse> => {
  return {
    markdown,
  };
};

/**
 * @deprecated Use partialParseMarkdown instead.
 * This legacy parser handled the old JSON format with summary/results/followUps.
 * Kept for backward compatibility during migration.
 */
export const partialParseResponse = partialParseMarkdown;
