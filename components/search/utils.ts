import { SearchResponse } from "@/lib/search/types";

export interface UserProfile {
  id: string;
  name: string;
  status?: string;
  location?: string;
  tldr?: string;
  avatar_url?: string;
}

export interface ChatMessage {
  id: string;
  query: string;
  chatroom_id: string;
  content: SearchResponse | null;
  created_at: string;
  user_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress?: ProgressAction[];
}

// Streamable progress types for all search actions
export type ProgressSteps =
  | "plan"
  // RAG entity search
  | "filter"
  | "search"
  // General search
  | "routing"
  | "general_kb"
  | "websearch";

export type ProgressStatus = "start" | "complete";

export interface ProgressAction {
  step: ProgressSteps;
  message: string;
  status: ProgressStatus;
}

// Utility to format duration between two dates
export const formatDuration = (start: Date, end: Date) => {
  const endDate = new Date(end);
  const startDate = new Date(start);
  const durationMs = endDate.getTime() - startDate.getTime();
  const seconds = Math.floor((durationMs / 1000) % 60);
  const minutes = Math.floor(durationMs / (1000 * 60));
  return `${minutes}m ${seconds}s`;
};
