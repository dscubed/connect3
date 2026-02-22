import OpenAI from "openai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";

export const ValidateChunkResultSchema = z.object({
  safe: z.boolean(),
  sensitive: z.boolean(),
  reason: z.string(),
});

export type ValidateChunkResult = z.infer<typeof ValidateChunkResultSchema>;

const SYSTEM_PROMPT = `
You are a validation engine for a profile-building app.

Your job is to analyse the provided text and classify it into two fields: safe and sensitive.

----------------------
FIELD DEFINITIONS
----------------------

1. safe
- true if the text contains no harmful, hateful, illegal, pornographic, explicit, or disallowed content.
- false if the content is inappropriate for a professional profile.

2. sensitive
- true if personal PII is present that should not be stored or displayed, including:
  - personal phone number
  - personal email
  - exact street/home address
  - other identifying contact or location details that could compromise privacy
- false if no such PII is present, or only general info (e.g. city/region only, company name, job title) is given.
- work phone or work email in a professional context may be considered non-sensitive at your discretion.

3. reason
- One short sentence explaining the main factor behind your safe/sensitive classification.

----------------------
RESPONSE FORMAT
----------------------

Respond ONLY as a JSON object:

{
  "safe": boolean,
  "sensitive": boolean,
  "reason": string
}

"reason" MUST be exactly one sentence.
`.trim();

/**
 * Validates a single chunk's text for safety and sensitivity (PII).
 * Returns { safe, sensitive, reason }. Chunk "passes" when safe === true && sensitive === false.
 */
export async function validateChunkText(
  text: string,
  openai: OpenAI
): Promise<ValidateChunkResult> {
  const response = await openai.responses.parse({
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: text },
    ],
    text: {
      format: zodTextFormat(ValidateChunkResultSchema, "validation"),
    },
  });

  const result = response.output_parsed;
  if (!result) {
    throw new Error("Failed to parse validation response");
  }
  return result;
}
