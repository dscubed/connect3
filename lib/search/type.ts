// import { SearchProgress } from "@/components/search/types";

export type EntityType = "user" | "organisation" | "events";

// Planner Node

export type EntitySearch = {
  [type in EntityType]: string;
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

export interface EntityFilters {
  organisation: FilterObject | null;
  user: FilterObject | null;
  events: FilterObject | null;
}

// Search Node

export interface FileResult {
  fileId: string;
  text: string;
}

export interface EntitySearchResponse {
  fileIds: string[];
}

// Response Node
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

export interface SearchResponse {
  summary: string;
  results: ResultSection[];
  followUps: string;
}

export interface EntityResult {
  type: EntityType;
  id: string;
}
