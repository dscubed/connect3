/**
 * Club data fetched from Supabase profiles table
 * where account_type = 'organisation'
 */
export interface Club {
  id: string;
  first_name: string;
  university: string | null;
  avatar_url: string | null;
}
