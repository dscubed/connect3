import { fetchUserDetails } from "@/lib/users/fetchUserDetails";
import OpenAI from "openai";
import { chunkResume } from "./chunkResume";

export const processResume = async (
  text: string,
  profileId: string,
  chunkTexts: string[],
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
  if (!validateResume(text, fullname, openai)) {
    throw new Error("Resume validation failed");
  }

  // Call chunkResume
  return chunkResume(text, chunkTexts, openai);
};

const validateResume = (
  resumeText: string,
  fullName: string,
  openai: OpenAI
): boolean => {
  // Validate..
  return true;
};
