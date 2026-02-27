export interface AdminClub {
  id: string;
  first_name: string;
  avatar_url: string | null;
}

export interface InstagramFetchRow {
  instagram_slug: string;
  profile_id: string | null;
  last_fetched: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  results: string[];
}

export interface InstagramPost {
  id: string;
  posted_by: string | null;
  caption: string;
  timestamp: number | null;
  location: string | null;
  images: string[];
  collaborators: string[];
  fetched_at: string;
}
