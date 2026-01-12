import { fetchUserDetails } from "@/lib/users/fetchUserDetails";
import { SupabaseClient } from "@supabase/supabase-js";
import OpenAI from "openai";

export const parseResume = async (
  text: string,
  profileId: string,
  chunksText: string,
  openai: OpenAI
) => {
  // Get user name for validation
  const user = await fetchUserDetails(profileId);
  if (user === null) {
    throw new Error(`User with ID ${profileId} not found`);
  }
  if (user.account_type === "organisation") {
    throw new Error(
      `Profile ID ${profileId} is an organisation, expected a user`
    );
  }

  const fullname = user.full_name;

  // Call Validation

  // Call chunkResume
};
