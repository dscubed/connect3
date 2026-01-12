import { userCategoryDescriptionText } from "@/components/profile/chunks/ChunkUtils";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod.mjs";
import z from "zod";

// Schema for updated chunks
const updateChunkSchema = z.array(
  z.object({
    id: z.string(),
    category: z.string(),
    text: z.string(),
  })
);

export interface UpdateChunksResult {
  id: string;
  category: string;
  text: string;
}

const systemPrompt = `You are an expert at breaking down resumes into structured chunks for profile creation.
Given existing profile chunks and new resume text, identify and extract only updated information from the resume.

Category Descriptions:
${userCategoryDescriptionText}

- Respond in JSON format with an array of chunk objects that need to be updated
- Each chunk object should have "id", "category" and "text" fields
Example:
{ "id": "...", "category": "Education", "text": "Bachelor of Science in Computer Science from XYZ University, 2015-2019. Graduated with honors." }
{ "id": "...", "category": "Skills", "text": "Proficient in JavaScript, Python, and C++." }

- Only include chunks where information has changed (e.g. graduated, promoted, left job, additional skills, etc.)
- Do not include chunks where new information is not present
- Chunk text should be as concise as possible while retaining key information
- Chunk text should be no longer than 200 characters
Return only the JSON array, no additional text
`;

export const updateChunks = async (
  profileId: string,
  chunksText: string,
  openai: OpenAI
): Promise<UpdateChunksResult[]> => {
  const response = await openai.responses.parse({
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: systemPrompt },
      // You may want to add user input here, e.g.:
      // { role: "user", content: `Profile ID: ${profileId}\nExisting Chunks: ...\nResume Text: ${chunksText}` }
    ],
    text: {
      format: zodTextFormat(updateChunkSchema, "update_chunks_response"),
    },
  });

  if (!response.output_parsed) {
    throw new Error("Failed to parse chunk update response");
  }

  return response.output_parsed as UpdateChunksResult[];
};
