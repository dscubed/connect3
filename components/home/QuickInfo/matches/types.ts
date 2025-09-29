export interface MatchData {
  user_id: string;
  chatroom_id: string;
  chatmessage_id: string;
  openai_file_id: string;
  queried_by: string;
  created_at: string;
}

export interface AvatarDetails {
  userId: string;
  avatarUrl: string;
}

export interface MatchedUsersDetails {
  matchData: MatchData[];
  avatarDetails: AvatarDetails[];
}

export interface LastMatchDetails {
  query: string;
  created_at: string;
}

export type FilterType = "all" | "month" | "week" | "day";
