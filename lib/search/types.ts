// Search agent types - matching Colab architecture

export type EntityType = "user" | "organisation" | "event";

export interface EntitySearch {
  user: string | null;
  organisation: string | null;
  event: string | null;
}

export interface SearchPlan {
  requiresSearch: boolean;
  filterSearch: boolean;
  context: string;
  searches: EntitySearch;
}

export interface FilterSearchResponse {
  include: boolean;
  entityIds: string[]; // Format: "type_id" e.g. "user_10", "organisation_5", "event_3"
}

export interface ExcludeFilters {
  user: string[];
  organisation: string[];
  event: string[];
}

export interface SearchResult {
  id: string;
  name: string;
  type: EntityType;
  text: string;
  score: number;
  file_id: string;
  userId?: string;
}

export interface FileResult {
  file_id: string;
  text: string;
}

export interface SearchResults {
  results: FileResult[];
}

export interface Result {
  header: string;
  text: string;
  file_ids: string[];
}

export interface SearchResponse {
  summary: string;
  results: Result[];
  follow_ups: string;
}

export interface ChatMessage {
  role: string;
  content: string;
}

