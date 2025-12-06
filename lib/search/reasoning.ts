import OpenAI from "openai";
import { AgentState, ReasoningOutput } from "./type";
import z from "zod";
import { zodTextFormat } from "openai/helpers/zod.mjs";

const ReasoningSchema = z.object({
  reasoning: z.string(),
  newQueries: z.array(z.string().max(100)),
});

export const reasonAndPlan = async (
  state: AgentState,
  query: string,
  openai: OpenAI
): Promise<ReasoningOutput> => {
  const prompt = `You are deciding whether to continue searching or stop.

    WHEN TO STOP (return empty newQueries):
    ✓ You already searched and found nothing new
    ✓ You've done 2-3 iterations already
    ✓ The query is too vague - let the user clarify
    ✓ You found 5-10 relevant entities - that's more than enough
    ✓ Some queries will give you less than 5 matches - that's okay STOP THERE.
    
    CONTINUE SEARCH IF:
    - The query has multiple parts and you only answered one

    ** DO NOT CONTINUE IN ORDER TO REACH 5-10 ENTITIES, STOP WHEN YOU HAVE ENOUGH TO GENERATE A GOOD ANSWER. **
    
    NEW QUERY RULES:
    - Keep queries SHORT (2-5 words max)
    - Be direct: "CISSA contact info" not "Who can I contact at CISSA for more information?"
    - Max 1-2 new queries per iteration
    - Don't target previously found entities as they are already discovered
    - You can keep asking the same questions to find more candidates (but don't overuse)
    
    GOOD QUERIES: "CISSA president", "UniMelb data science club", "John Smith contact"
    BAD QUERIES: "What are some clubs at UniMelb that focus on computing and technology?"

    Return JSON:
    {
        "reasoning": "One sentence explaining your decision.",
        "newQueries": []  // Empty if done, or 1-2 short queries
    }`;

  // Add summary contexts
  const queries_summary = `Past queries: ${state.pastQueries.join(", ")}`;
  const entities_summary = `Entities found so far: ${state.entities.length}`;
  for (const entity of state.entities) {
    entities_summary.concat(` - ${entity.name} (${entity.type})\n`);
  }
  let discovery_summary = "";

  // Merge summaries
  if (state.entities.length >= 10) {
    discovery_summary = "** Already found 10+ entities. Time to stop. **";
  } else {
    discovery_summary = `Iteration ${state.iteration}/${state.maxIterations}.
      ${queries_summary}
      ${entities_summary}`;
  }

  const response = await openai.responses.parse({
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: prompt },
      { role: "system", content: discovery_summary },
      { role: "user", content: `Current query: ${query}` },
    ],
    text: {
      format: zodTextFormat(ReasoningSchema, "reasoning_output"),
    },
  });

  if (!response.output_parsed) {
    throw new Error("Failed to parse reasoning output");
  }
  return response.output_parsed;
};
