import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod.mjs";
import z from "zod";
import { userCategoryDescriptionText } from "@/components/profile/chunks/ChunkUtils";

const generateChunkSchema = z.array(
  z.object({
    category: z.string(),
    text: z.string(),
  })
);

export interface GenerateChunksResult {
  category: string;
  text: string;
}

const systemPrompt = `You are an expert at breaking down resumes into structured chunks for profile creation.
Given the text of a resume extract resume into categories and text chunks.

Only respond with the following categories:
${userCategoryDescriptionText}
  
- Respond in JSON format with an array of chunk objects
- Each chunk object should have "category" and "text" fields
Example:
{category: "Education", text: "Bachelor of Science in Computer Science from XYZ University, 2015-2019. Graduated with honors."}
{category: "Skills", text: "Proficient in JavaScript, Python, and C++."}
{category: "Experience", text: "Software Engineer at ABC Corp from 2019-2022. Developed web applications using React and Node.js."}

- Ensure categories are only from the provided list
- Chunk text should be as concise as possible while retaining key information
- Chunk text should be no longer than 200 characters
Return only the JSON array, no additional text`;

export const generateChunks = async (
  text: string,
  chunksText: string,
  openai: OpenAI
): Promise<GenerateChunksResult[]> => {
  const response = await openai.responses.parse({
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Existing Chunks:\n\n${chunksText}` },
      { role: "user", content: `Resume Text:\n\n${text}` },
    ],
    text: {
      format: zodTextFormat(generateChunkSchema, "generate_chunks_response"),
    },
  });

  if (!response.output_parsed) {
    throw new Error("Failed to parse chunk generation response");
  }

  return response.output_parsed as GenerateChunksResult[];
};
