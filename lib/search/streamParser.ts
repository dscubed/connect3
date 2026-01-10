import { ResultSection, SearchResponse, EntityResult, FileMap } from "./types";

type PartialResult = {
  header?: string | null;
  text?: string;
  entity_ids?: string[];
};

// Handle escaped characters in JSON strings
const unescapeJsonString = (str: string): string => {
  return str
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
};

const parsePartialResultObject = (objContent: string): PartialResult => {
  const partial: PartialResult = {};

  // Parse header - check for null first, then string value
  const headerNullMatch = objContent.match(/"header"\s*:\s*null/);
  if (headerNullMatch) {
    partial.header = null;
  } else {
    const headerMatch = objContent.match(
      /"header"\s*:\s*"((?:[^"\\]|\\.)*)(")?/
    );
    if (headerMatch) {
      partial.header = unescapeJsonString(headerMatch[1]);
    }
  }

  // Parse text
  const textMatch = objContent.match(/"text"\s*:\s*"((?:[^"\\]|\\.)*)(")?/);
  if (textMatch) {
    partial.text = unescapeJsonString(textMatch[1]);
  }

  // Parse entity_ids array - only capture complete string values
  const entityIdsMatch = objContent.match(/"entity_ids"\s*:\s*\[([^\]]*)\]?/);
  if (entityIdsMatch) {
    // Only match complete strings (with closing quotes)
    const ids = [...entityIdsMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    partial.entity_ids = ids;
  }

  return partial;
};

const parsePartialResults = (resultsContent: string): PartialResult[] => {
  const results: PartialResult[] = [];

  let depth = 0;
  let currentObj = "";
  let inObject = false;

  for (let i = 0; i < resultsContent.length; i++) {
    const char = resultsContent[i];

    if (char === "{") {
      if (depth === 0) {
        inObject = true;
        currentObj = "";
      } else {
        currentObj += char;
      }
      depth++;
    } else if (char === "}") {
      depth--;
      if (depth === 0 && inObject) {
        // Complete object found
        results.push(parsePartialResultObject(currentObj));
        inObject = false;
        currentObj = "";
      } else if (depth > 0) {
        currentObj += char;
      }
    } else if (inObject) {
      currentObj += char;
    }
  }

  // Handle incomplete object at the end (no closing brace yet)
  if (inObject && currentObj.trim().length > 0) {
    results.push(parsePartialResultObject(currentObj));
  }

  return results;
};

export const partialParseResponse = (
  text: string,
  fileMap: FileMap
): Partial<SearchResponse> => {
  const response: Partial<SearchResponse> = {
    summary: "",
    results: [],
    followUps: "",
  };

  // summary
  const summaryMatch = text.match(/"summary"\s*:\s*"((?:[^"\\]|\\.)*)(")?/);
  if (summaryMatch) {
    response.summary = unescapeJsonString(summaryMatch[1]);
  }

  // results
  const resultsMatch = text.match(/"results"\s*:\s*\[([\s\S]*)/);
  if (resultsMatch) {
    const parsedResults = parsePartialResults(resultsMatch[1]);

    // ✅ set [] even if empty
    response.results = parsedResults.map(
      (r): ResultSection => ({
        header: r.header ?? undefined,
        text: r.text ?? "",
        matches: fileMap
          ? ((r.entity_ids ?? [])
              .map((id) => fileMap[id])
              .filter(Boolean) as EntityResult[])
          : [],
      })
    );
  }

  // followUps
  const followUpsMatch = text.match(/"followUps"\s*:\s*"((?:[^"\\]|\\.)*)(")?/);
  if (followUpsMatch) {
    response.followUps = unescapeJsonString(followUpsMatch[1]);
  }

  return response;
};

