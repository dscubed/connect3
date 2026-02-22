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
    }),
  ),
  newChunks: z.array(
    z.object({
      category: z.string(),
      text: z.string(),
    }),
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

CRITICAL INSTRUCTIONS FOR CONCISE CHUNKS:
- Chunk text MUST be concise: maximum 200 characters, ideally 100-150 characters.
- Extract only the most essential information: key facts, achievements, skills, or responsibilities.
- Remove filler words, redundant phrases, and unnecessary details.
- Focus on what makes this information unique and valuable.
- Use bullet-point style or short sentences when possible.

SENSITIVE INFORMATION EXCLUSION:
- DO NOT include phone numbers, email addresses, physical addresses, or academic marks (WAM/GPA).
- If the resume text contains such information, exclude it from the chunk text entirely.
- Focus on professional achievements, skills, education (without marks), and experience.

Instructions:
- Respond in JSON format with an object containing "updatedChunks" and "newChunks" arrays.
- Each "updatedChunks" object should have "id", "category", and "text" fields.
- Each "newChunks" object should have "category" and "text" fields.
- Only include updated chunks in "updatedChunks" (e.g. graduated, promoted, left job, additional skills, etc.)
- Only include truly new chunks in "newChunks" (not present in the existing list).
- Use only the provided categories.
- Return only the JSON object, no extra text.

Examples of GOOD concise chunks:
- "Software Engineer at Tech Corp (2020-2023). Built scalable APIs using Node.js and React."
- "Bachelor of Computer Science from University of Melbourne, 2016-2020."
- "Proficient in Python, JavaScript, TypeScript, and cloud platforms (AWS, GCP)."

Examples of BAD verbose chunks (too long):
- "I worked as a Software Engineer at Tech Corp from 2020 to 2023. During my time there, I was responsible for building scalable APIs using Node.js and React. I also collaborated with cross-functional teams and participated in code reviews."
- "I completed my Bachelor of Computer Science degree at the University of Melbourne from 2016 to 2020. I studied various subjects including algorithms, data structures, and software engineering."

Example response:
{
  "updatedChunks": [
    { "id": "123", "category": "Education", "text": "Bachelor of Science in Computer Science from XYZ University, 2015-2019." }
  ],
  "newChunks": [
    { "category": "Skills", "text": "Proficient in JavaScript, Python, and C++." }
  ]
}
`;

export const chunkResume = async (
  resumeText: string,
  chunksText: string,
  openai: OpenAI,
): Promise<ChunkResumeResult> => {
  // Format existing chunks for the prompt
  const userPrompt = `Existing Chunks:\n${
    chunksText != "" ? chunksText : "None"
  }\n\nResume Text:\n${resumeText}`;

  const response = await openai.responses.parse({
    model: "gpt-5-mini",
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
