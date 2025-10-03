export interface DemoUseCase {
  id: string;
  label: string;
  queries: DemoQuery[];
}

export interface DemoQuery {
  query: string;
  response: QueryResponse;
}

export interface QueryResponse {
  result?: string;
  matches?: MatchDetails[];
  followUps?: string;
}

export interface MatchDetails {
  user_id: string;
  files: File[];
}

export interface File {
  file_id: string;
  description: string;
}

export interface UserDetails {
  user_id: string;
  full_name: string;
  avatar_url: string;
  status: string;
  location: string;
}

export interface MappedMatchDetails {
  user_id: string;
  full_name: string;
  avatar_url: string;
  files: File[];
}
