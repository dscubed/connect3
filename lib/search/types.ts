// import { SearchProgress } from "@/components/search/types";

export type EntityType = "user" | "organisation" | "events";

// Planner Node

export type EntitySearch = {
  [type in EntityType]: string | null;
};

export interface SearchPlan {
  requiresSearch: boolean;
  filterSearch: boolean;
  context: string;
  searches: EntitySearch;
}

// Filter Node

export interface FilterSearchResponse {
  include: boolean;
  entityIds: string[];
}

export interface FilterObject {
  type: string; // This should always be "nin"
  key: string; // This should always be "id"
  value: string[]; // List of entity IDs to filter
}

export type EntityFilters = {
  [type in EntityType]: FilterObject | null;
};

// Search Node

export interface FileResult {
  fileId: string;
  text: string;
}

export interface EntitySearchResponse {
  fileIds: string[];
}

export interface FileMap {
  [fileId: string]: EntityResult;
}

// Response Node - Legacy JSON format (deprecated)
export interface LLMResultSection {
  header: string | undefined;
  text: string;
  fileIds: string[];
}

export interface LLMSearchResponse {
  summary: string;
  results: LLMResultSection[];
  followUps: string;
}

export interface ResultSection {
  header: string | undefined;
  text: string;
  matches: EntityResult[];
}

// Unified Markdown Response Format
// Entity markers use @@@type:id@@@ inline in markdown
export interface SearchResponse {
  /** The full markdown response including inline @@@type:id@@@ entity markers */
  markdown: string;
  /** Optional quick links extracted from the response */
  quickLinks?: { url: string; label: string; source: "kb" | "web" }[];
}

export interface EntityResult {
  type: EntityType;
  id: string;
}
