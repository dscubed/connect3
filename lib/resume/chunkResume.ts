import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod.mjs";
import z from "zod";
import { userCategoryDescriptionText } from "@/components/profile/chunks/ChunkUtils";

// Schema for the combined result
const chunkResumeSchema = z.object({
  updatedChunks: z.array(
    z.object({
      id: z.string(),
      category: z.string(),
      text: z.string(),
    })
  ),
  newChunks: z.array(
    z.object({
      category: z.string(),
      text: z.string(),
    })
  ),
});

export interface UpdateChunksResult {
  id: string;
  category: string;
  text: string;
}

export interface GenerateChunksResult {
  category: string;
  text: string;
}

export interface ChunkResumeResult {
  updatedChunks: UpdateChunksResult[];
  newChunks: GenerateChunksResult[];
}

const systemPrompt = `You are an expert at breaking down resumes into structured chunks for profile creation.
Given a list of existing profile chunks and new resume text, return a JSON object with two arrays:
- "updatedChunks": chunks from the existing list that should be updated (changed information, improved details, etc.)
- "newChunks": chunks that are new and should be added (not present in the existing list)

Category Descriptions:
${userCategoryDescriptionText}

Instructions:
- Respond in JSON format with an object containing "updatedChunks" and "newChunks" arrays.
- Each "updatedChunks" object should have "id", "category", and "text" fields.
- Each "newChunks" object should have "category" and "text" fields.
- Only include updated chunks in "updatedChunks" (e.g. graduated, promoted, left job, additional skills, etc.)
- Only include truly new chunks in "newChunks" (not present in the existing list).
- Chunk text should be concise, max 200 characters, and retain key information.
- Use only the provided categories.
- Return only the JSON object, no extra text.

Example:
{
  "updatedChunks": [
    { "id": "123", "category": "Education", "text": "Bachelor of Science in Computer Science from XYZ University, 2015-2019. Graduated with honors." }
  ],
  "newChunks": [
    { "category": "Skills", "text": "Proficient in JavaScript, Python, and C++." }
  ]
}
`;

export const chunkResume = async (
  resumeText: string,
  chunkTexts: string[],
  openai: OpenAI
): Promise<ChunkResumeResult> => {
  // Format existing chunks for the prompt
  const existingChunksText = chunkTexts.join("\n---\n");
  const userPrompt = `Existing Chunks:\n${existingChunksText}\n\nResume Text:\n${resumeText}`;

  const response = await openai.responses.parse({
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    text: {
      format: zodTextFormat(chunkResumeSchema, "chunk_resume_response"),
    },
  });

  if (!response.output_parsed) {
    throw new Error("Failed to parse chunk resume response");
  }

  return response.output_parsed as ChunkResumeResult;
};
