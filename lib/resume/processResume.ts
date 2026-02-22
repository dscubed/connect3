import { fetchUserDetails } from "@/lib/users/fetchUserDetails";
import OpenAI from "openai";
import { chunkResume } from "./chunkResume";
import { sanitizeResumeText } from "./sanitizeResume";
import { validateResume } from "./validateResume";
import { ProfileChunk } from "@/components/profile/chunks/ChunkUtils";

export const processResume = async (
  text: string,
  profileId: string,
  chunks: ProfileChunk[],
  openai: OpenAI,
) => {
  // Convert existing chunks to text format for context
  const chunksText = chunksToText(chunks);

  console.log("Received Resume Text:", `${text.slice(0, 500)}...`);
  console.log("Received Chunks", `${chunksText.slice(0, 500)}...`);

  // Get user name for validation
  const user = await fetchUserDetails(profileId);
  if (user === null) {
    throw new Error(`User with ID ${profileId} not found`);
  }
  if (user.account_type === "organisation") {
    throw new Error(
      `Profile ID ${profileId} is an organisation, expected a user`,
    );
  }

  const fullname = user.full_name;

  // Sanitize resume text (remove sensitive info)
  const sanitizedText = sanitizeResumeText(text);

  console.log("Sanitized Resume Text:", sanitizedText.slice(0, 500) + "...");

  // Validate sanitized resume
  const validationResult = await validateResume(
    sanitizedText,
    fullname,
    openai,
  );

  if (!validationResult.safe || !validationResult.relevant) {
    throw new Error(`Resume validation failed: ${validationResult.reason}`);
  }

  // Call chunkResume with sanitized text
  return chunkResume(sanitizedText, chunksText, openai);
};

const chunksToText = (chunks: ProfileChunk[]) => {
  if (chunks.length === 0) return "";

  // Order Chunks by alphabetical category then by order within category
  const orderedChunks = [...chunks].sort((a, b) => {
    if (a.category === b.category) {
      return a.order - b.order;
    }
    return a.category.localeCompare(b.category);
  });

  // Group chunks by category
  const grouped: Record<string, ProfileChunk[]> = {};
  for (const chunk of orderedChunks) {
    if (!grouped[chunk.category]) grouped[chunk.category] = [];
    grouped[chunk.category].push(chunk);
  }

  // Build the text output
  const sections = Object.entries(grouped).map(([category, chunks]) => {
    const lines = [
      category,
      "---",
      ...chunks.map((chunk) => `- ID: ${chunk.id}\n${chunk.text}`),
    ];
    return lines.join("\n");
  });

  return sections.join("\n\n");
};
