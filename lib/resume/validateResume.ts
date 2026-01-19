import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod.mjs";
import z from "zod";

// Validation schema
const ValidationSchema = z.object({
  safe: z.boolean(),
  relevant: z.boolean(),
  belongsToUser: z.boolean(),
  reason: z.string(),
});

export const validateResume = async (
  resumeText: string,
  fullName: string,
  openai: OpenAI
): Promise<z.infer<typeof ValidationSchema>> => {
  const systemPrompt = `
You are a validation engine for a profile-building app. 
The user's legal full name is: "${fullName || "..."}".

Your job is to analyse the user-uploaded resume text (provided in the user message) 
and fill in the following fields:

- "safe": whether the text avoids harmful, illegal, NSFW, or disallowed content.
- "relevant": whether the text contains information that could help describe a personal or professional profile
  (e.g. work experience, education, skills, interests, biography, portfolio description).
- "belongsToUser": whether the text appears to be primarily about this user ("${fullName}"), and not another person.
- "reason": a single short sentence explaining why you set "belongsToUser" / "safe" / "relevant" the way you did.

Rules for "belongsToUser":
- If the main person described in the text has a different name from "${fullName}", set "belongsToUser": false.
- If the text clearly describes "${fullName}" (or a very close variant like including a middle name or initials), set "belongsToUser": true.
- If you are uncertain who the text is about, set "belongsToUser": false.
- Do NOT guess that a different full name refers to the same user.
- Standard resume-style statements ("Led a team...", "Developed...") count as describing the user.

Note: The resume text has already been sanitized to remove sensitive information like phone numbers, 
email addresses, physical addresses, and academic marks (WAM/GPA). Focus on validating the content 
structure and relevance, not on detecting sensitive information.

Respond ONLY as a single JSON object matching this schema:
{
  "safe": boolean,
  "relevant": boolean,
  "belongsToUser": boolean,
  "reason": string
}

"reason" MUST be exactly one sentence.`.trim();

  const response = await openai.responses.parse({
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: systemPrompt },
      { role: "user", content: resumeText },
    ],
    text: { format: zodTextFormat(ValidationSchema, "validation") },
  });

  if (!response.output_parsed) {
    throw new Error("Failed to parse validation response");
  }

  return response.output_parsed;
};
