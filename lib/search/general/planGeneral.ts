import OpenAI from "openai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod.mjs";
import type { ResponseInput } from "openai/resources/responses/responses.mjs";

export const GeneralPlanSchema = z.object({
  uniRelated: z.boolean(),
  // Use a stable identifier you use internally (slug), or null if unknown
  university: z.string().nullable(),
  reason: z.string(),
});

export type GeneralPlan = z.infer<typeof GeneralPlanSchema>;

export async function planGeneral(
  openai: OpenAI,
  query: string,
  tldr: string,
  prevMessages: ResponseInput
): Promise<GeneralPlan> {
  const systemPrompt = `
You are a routing classifier for a chatbot.

Decide if the user is asking something that should be answered using UNIVERSITY knowledge.
University-related includes:
- university policies, enrollment, subjects, timetables, campus locations, services, clubs (uni-specific), scholarships (uni-specific)
- “at my uni…”, “on campus…”, “unimelb / monash / nus / etc.”

NOT university-related includes:
- greetings, small talk, jokes, generic life advice
- questions about Connect3 app features or product help
- general knowledge where university context is not needed

Return JSON:
{
  "uniRelated": boolean,
  "university": string | null,
  "reason": string
}

If the query is uniRelated but the specific university is unclear, set university=null.
`;

  const resp = await openai.responses.parse({
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: systemPrompt },
      ...prevMessages,
      { role: "system", content: `User TLDR: ${tldr}` },
      { role: "user", content: query },
    ],
    text: { format: zodTextFormat(GeneralPlanSchema, "general_plan") },
  });

  if (!resp.output_parsed) throw new Error("Failed to parse general plan");
  return resp.output_parsed;
}
