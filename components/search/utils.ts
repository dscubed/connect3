import { SearchResponse } from "@/lib/search/types";

export type ProgressEntry =
  | {
      kind: "reasoning";
      key: string;
      text: string;
    }
  | {
      kind: "search";
      key: string;
      queries: string[];
    };

export interface ChatMessage {
  id: string;
  query: string;
  chatroom_id: string;
  content: SearchResponse | null;
  created_at: string;
  user_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  /** Progress message from the agent, e.g. "Thinking" or "Searching CS clubs" */
  progress?: string;
  /** Streamed progress entries (reasoning blocks + search rows). */
  progressEntries?: ProgressEntry[];
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
