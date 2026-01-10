import OpenAI from "openai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod.mjs";
import type { ResponseInput } from "openai/resources/responses/responses.mjs";
import { dbg, mkTraceId, preview } from "./debug";

export const GeneralPlanSchema = z.object({
  uniRelated: z.boolean(),
  university: z.string().nullable(),
  reason: z.string(),
});

export type GeneralPlan = z.infer<typeof GeneralPlanSchema>;

export async function planGeneral(
  openai: OpenAI,
  query: string,
  tldr: string,
  prevMessages: ResponseInput,
  emit?: (event: string, data: unknown) => void,
  traceId?: string
): Promise<GeneralPlan> {
  const tid = traceId ?? mkTraceId("planGeneral");

  dbg(emit, tid, "start", {
    queryLen: query.length,
    tldrLen: tldr.length,
    prevMessagesCount: Array.isArray(prevMessages) ? prevMessages.length : 0,
    queryPreview: preview(query, 120),
  });

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

  try {
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

    dbg(emit, tid, "openai_returned", {
      responseId: resp.id,
      hasParsed: Boolean(resp.output_parsed),
      outputTextLen: (resp.output_text ?? "").length,
      outputTextPreview: preview(resp.output_text, 120),
    });

    if (!resp.output_parsed) {
      dbg(emit, tid, "parse_failed", {
        // Often helpful: output array length to see if model returned anything
        outputItems: Array.isArray((resp as any).output) ? (resp as any).output.length : null,
      });
      throw new Error("Failed to parse general plan");
    }

    dbg(emit, tid, "parsed", resp.output_parsed);

    return resp.output_parsed;
  } catch (err: any) {
    dbg(emit, tid, "error", {
      message: err?.message ?? String(err),
      name: err?.name,
      stack: err?.stack ? preview(err.stack, 240) : undefined,
    });
    throw err;
  }
}
