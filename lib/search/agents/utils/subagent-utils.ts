/**
 * Shared utilities for sub-agents (events, students, clubs, general)
 */
import type { RunItem } from "@openai/agents";
import type { EntityType, SearchResult } from "../types";

// Type for file search results with attributes (from providerData)
export interface FileSearchResult {
  file_id: string;
  filename: string;
  score: number;
  text: string;
  attributes?: {
    id?: string;
    name?: string;
    type?: string;
  };
}

// Type for hosted tool call raw item with file search results
export interface HostedToolCallRawItem {
  type: "hosted_tool_call";
  name: string;
  providerData?: {
    results?: FileSearchResult[];
  };
}

/**
 * Extract relevant file IDs from the agent's final output.
 * The agent should respond with a JSON array of file IDs like: ["file-abc...", "file-def..."]
 */
export function extractRelevantFileIds(
  finalOutput: string | undefined,
  agentName: string,
): Set<string> {
  const fileIds = new Set<string>();
  if (!finalOutput) return fileIds;

  try {
    // Try to parse JSON array from the response
    const jsonMatch = finalOutput.match(/\[([^\]]*)\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed)) {
        for (const id of parsed) {
          if (typeof id === "string" && id.trim()) {
            fileIds.add(id.trim());
          }
        }
      }
    }
  } catch {
    console.log(
      `[${agentName}] Could not parse relevant file IDs, including all results`,
    );
  }

  return fileIds;
}

/**
 * Extract search results from the agent's run items, filtering by relevant file IDs.
 * This is shared across all sub-agents (events, students, clubs).
 */
export function extractSearchResults(
  newItems: RunItem[],
  relevantFileIds: Set<string>,
  entityType: EntityType,
): SearchResult[] {
  const results: SearchResult[] = [];
  const seenFileIds = new Set<string>();

  for (const item of newItems) {
    if ("rawItem" in item && item.rawItem) {
      const raw = item.rawItem as HostedToolCallRawItem;

      // Look for hosted_tool_call with file_search_call
      if (
        raw.type === "hosted_tool_call" &&
        raw.name === "file_search_call" &&
        raw.providerData?.results
      ) {
        const fileResults = raw.providerData.results;

        for (const fileResult of fileResults) {
          const fileId = fileResult.file_id;
          const entityId = fileResult.attributes?.id;
          if (!fileId || !entityId || seenFileIds.has(fileId)) continue;

          // Only include if agent marked as relevant (or if no filtering was done)
          if (relevantFileIds.size > 0 && !relevantFileIds.has(fileId)) {
            continue;
          }

          seenFileIds.add(fileId);

          // Build content with entity metadata at top
          const content = `ENTITY_ID: ${entityId}
ENTITY_TYPE: ${entityType}
---
${fileResult.text}`;

          results.push({
            fileId,
            content,
          });
        }
      }
    }
  }

  return results;
}

/**
 * Extract general/KB search results from run items.
 * Unlike entity search results, these don't have entity markers - just raw content.
 * Used by GeneralAgent for knowledge base and web search results.
 */
export function extractGeneralSearchResults(
  newItems: RunItem[],
  relevantFileIds: Set<string>,
  source: "kb" | "web",
): SearchResult[] {
  const results: SearchResult[] = [];
  const seenFileIds = new Set<string>();

  for (const item of newItems) {
    if ("rawItem" in item && item.rawItem) {
      const raw = item.rawItem as HostedToolCallRawItem;

      // Look for hosted_tool_call with file_search_call
      if (
        raw.type === "hosted_tool_call" &&
        raw.name === "file_search_call" &&
        raw.providerData?.results
      ) {
        const fileResults = raw.providerData.results;

        for (const fileResult of fileResults) {
          const fileId = fileResult.file_id;
          if (!fileId || seenFileIds.has(fileId)) continue;

          // Only include if agent marked as relevant (or if no filtering was done)
          if (relevantFileIds.size > 0 && !relevantFileIds.has(fileId)) {
            continue;
          }

          seenFileIds.add(fileId);

          // For general content, mark as CONTENT_TYPE: general with source info
          const content = `CONTENT_TYPE: general
SOURCE: ${source}
FILENAME: ${fileResult.filename}
---
${fileResult.text}`;

          results.push({
            fileId,
            content,
          });
        }
      }
    }
  }

  return results;
}

/**
 * Extract web search results from run items.
 * Web search has a different structure than file search.
 */
export function extractWebSearchResults(newItems: RunItem[]): SearchResult[] {
  const results: SearchResult[] = [];

  for (const item of newItems) {
    if ("rawItem" in item && item.rawItem) {
      const raw = item.rawItem as {
        type: string;
        name: string;
        output?: string;
      };

      // Look for hosted_tool_call with web_search
      if (
        raw.type === "hosted_tool_call" &&
        raw.name === "web_search_preview" &&
        raw.output
      ) {
        // Web search output is typically a string with the search results
        results.push({
          fileId: `web_${Date.now()}`,
          content: `CONTENT_TYPE: general
SOURCE: web
---
${raw.output}`,
        });
      }
    }
  }

  return results;
}
