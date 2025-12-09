import { SearchResponse } from "@/lib/search/type";

export interface UserProfile {
  id: string;
  name: string;
  status?: string;
  location?: string;
  tldr?: string;
  avatar_url?: string;
}

// export interface SearchResults {
//   result: string;
//   matches: {
//     user_id: string;
//     full_name: string;
//     avatar_url?: string;
//     files: { file_id: string; description: string }[];
//   }[];
//   followUps: string;
// }

export interface ChatMessage {
  id: string;
  query: string;
  chatroom_id: string;
  content: SearchResponse | null;
  created_at: string;
  user_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress?: SearchProgress;
}

export interface SearchAction {
  searching?: string[];
  refining?: string;
  reasoning?: string;
}

export interface SearchProgress {
  context?: string;
  actions: SearchAction[];
  generating: boolean;
}
