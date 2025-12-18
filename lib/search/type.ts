import { SearchProgress } from "@/components/search/types";

export type EntityType = "user" | "organisation";

export interface AgentState {
  // Search Results
  newFiles: SearchResult[];
  entities: EntityResult[];
  invalidEntities: EntityResult[];
  seenEntities: Record<EntityType, Set<string>>;

  // Context Summary
  summary: string | null;

  // Queries
  newQueries: string[];
  pastQueries: string[];

  // Iteration
  iteration: number;
  maxIterations: number;

  // Progress Tracking
  progress: SearchProgress;
}

// Context Types

export interface ContextSummary {
  summary: string;
  queries: string[];
}

// Vector Search Types

export interface SearchResult {
  file_id: string;
  text: string;
  name: string;
  type: EntityType;
  id: string;
  score: number;
}

export type EntityTypeFilter = {
  users: boolean;
  organisations: boolean;
};

export interface EntityGroup {
  type: EntityType;
  id: string;
  name: string;
  files: { file_id: string; text: string }[];
}

// Validation Types

export interface LLMValidationOutput {
  valid: boolean;
  reason: string;
  relevantFiles: FileMatch[];
}

export interface ValidationOutput {
  entity: EntityResult;
  isValid: boolean;
}

export interface FileMatch {
  file_id: string;
  summary: string;
}

export interface EntityResult {
  type: EntityType;
  id: string;
  name: string;
  reason: string;
  relevantFiles: FileMatch[];
}

export interface RefinementOutput {
  validEntities: EntityResult[];
  invalidEntities: EntityResult[];
}

// Reasoning Types
export interface ReasoningOutput {
  reasoning: string;
  newQueries: string[];
}

// Response Generation
export interface ResultSection {
  header?: string;
  text: string;
  matches: EntityResult[];
}

export interface SearchResponse {
  summary: string;
  results: ResultSection[];
  followUps: string;
}
