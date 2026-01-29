import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod.mjs";
import { SearchPlan } from "./types";
import { z } from "zod";
import { ResponseInputItem } from "openai/resources/responses/responses.mjs";
import { ThinkingEngine, ThoughtData } from "./thinking";

const MAX_THINKING_STEPS = 8;

const SearchPlanSchema = z.object({
  requiresSearch: z.boolean(),
  filterSearch: z.boolean(),
  context: z.string(),
  searches: z.object({
    user: z.string().nullable(),
    organisation: z.string().nullable(),
    events: z.string().nullable(),
  }),
});

const sequentialThinkingTool: OpenAI.Responses.Tool = {
  type: "function",
  name: "sequential_thinking",
  description:
    "Use this tool to think step-by-step about the user's query before producing a search plan. Each call represents one thinking step. You can revise previous thoughts or branch into alternative reasoning paths.",
  parameters: {
    type: "object",
    properties: {
      thought: { type: "string", description: "Your current thinking step" },
      thoughtNumber: {
        type: "integer",
        description: "Current thought number",
      },
      totalThoughts: {
        type: "integer",
        description: "Estimated total thoughts needed",
      },
      nextThoughtNeeded: {
        type: "boolean",
        description: "Whether another thinking step is needed",
      },
      isRevision: {
        type: "boolean",
        description: "Whether this revises a previous thought",
      },
      revisesThought: {
        type: "integer",
        description: "Which thought number this revises",
      },
      branchFromThought: {
        type: "integer",
        description: "Which thought to branch from",
      },
      branchId: {
        type: "string",
        description: "Identifier for this branch",
      },
      needsMoreThoughts: {
        type: "boolean",
        description:
          "Whether more thoughts are needed beyond totalThoughts estimate",
      },
    },
    required: [
      "thought",
      "thoughtNumber",
      "totalThoughts",
      "nextThoughtNeeded",
    ],
    additionalProperties: false,
  },
  strict: false,
};

const SYSTEM_PROMPT = `You are a search query planner for Connect3, a university student directory app.

Your job is to analyze the user's query step-by-step using the sequential_thinking tool, then produce a structured search plan.

FIRST, use the sequential_thinking tool to reason about the query:
1. Determine if the query requires searching the Connect3 entity database
2. If yes, determine which entity types to search and craft optimized queries
3. Consider conversation context for follow-up queries

The entity database contains:
- USERS (students): Student profiles with skills, projects, interests, experience, clubs, subjects, hobbies, languages, certifications, contact info
- ORGANISATIONS (clubs): Club profiles with descriptions, events, projects, roles/positions, recruitment info, affiliations, contact details
- EVENTS: Event listings with time, location, price, host organization, event description

ROUTING RULES - requiresSearch should be TRUE if the query asks to:
- Find/discover/search for specific students, clubs, or events by name or characteristics
- Get recommendations for students/clubs/events to connect with
- Learn about specific people/clubs/events (even if asking about themselves)
- Get contact information for any person, club, or event
- Get details about club members, event attendees, or student activities
- Browse or explore what's available on campus
- Look up information about ANY named individual (including themselves)

requiresSearch should be FALSE if the query is about:
- How Connect3 works: "How do I use Connect3?", "How do recommendations work?"
- Connect3 features/privacy: "Is my data private?", "How does Connect3 recommend clubs?"
- Editing profile: "How do I edit my profile/TLDR/chunks?"
- University information NOT in directory: "What subjects can I take?", "When's census date?"
- General advice: "How do I get internships?", "What subjects should I take?"
- Greetings/chitchat: "Hello", "How are you?", "Tell me a joke"
- General knowledge: "Who is the president?", "What is the capital of France?"

CRITICAL: If the query mentions a specific person's name (even if it's the user asking about themselves), this is a lookup request and requires search = TRUE.

SEARCH PLANNING RULES (when requiresSearch is true):
- Only search entity types explicitly relevant to the query
- Set irrelevant entity types to null
- Phrase queries for semantic search (natural language), not keyword matching
- Set filterSearch=true only for follow-up/refinement of previous results (e.g. "show me more", "what else", "tell me more about the second one")
- Set filterSearch=false for new search topics or fresh requests

After thinking, produce your final answer as structured text output matching the search_plan schema.`;

export const runThinkingPlan = async (
  openai: OpenAI,
  query: string,
  tldr: string,
  prevMessages: ResponseInputItem[],
  emit?: (event: string, data: unknown) => void,
): Promise<SearchPlan> => {
  const engine = new ThinkingEngine();

  const input: ResponseInputItem[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...prevMessages,
    { role: "system", content: `User info: ${tldr}` },
    { role: "user", content: `Current Query: ${query}` },
  ];

  let steps = 0;
  let toolChoice: "required" | "auto" = "required";

  try {
    while (steps < MAX_THINKING_STEPS) {
      const response = await openai.responses.parse({
        model: "gpt-4o-mini",
        input,
        tools: [sequentialThinkingTool],
        tool_choice: toolChoice,
        text: {
          format: zodTextFormat(SearchPlanSchema, "search_plan"),
        },
      });

      // Check if the model produced structured text output (the search plan)
      if (response.output_parsed) {
        const plan = response.output_parsed;
        if (
          !plan.requiresSearch &&
          (plan.searches.user ||
            plan.searches.organisation ||
            plan.searches.events)
        ) {
          plan.requiresSearch = true;
        }
        return {
          requiresSearch: plan.requiresSearch,
          filterSearch: plan.filterSearch,
          context: plan.context,
          searches: plan.searches,
        };
      }

      let hadToolCall = false;

      for (const item of response.output) {
        if (
          item.type === "function_call" &&
          item.name === "sequential_thinking"
        ) {
          hadToolCall = true;
          steps++;

          let thoughtData: ThoughtData;
          try {
            thoughtData = JSON.parse(item.arguments);
          } catch {
            // Skip malformed tool calls
            continue;
          }

          const result = engine.processThought(thoughtData);

          // Emit thinking step to UI
          if (emit) {
            emit("thinking", {
              thoughtNumber: thoughtData.thoughtNumber,
              totalThoughts: thoughtData.totalThoughts,
              thought: thoughtData.thought,
              isRevision: thoughtData.isRevision ?? false,
              nextThoughtNeeded: thoughtData.nextThoughtNeeded,
            });
          }

          // Append the function call to input for next iteration
          input.push({
            type: "function_call",
            id: item.id,
            call_id: item.call_id,
            name: "sequential_thinking",
            arguments: item.arguments,
          });

          // Append the function call output
          input.push({
            type: "function_call_output",
            call_id: item.call_id,
            output: JSON.stringify(result),
          });
        }
      }

      if (!hadToolCall) {
        break;
      }

      // After first call, let the model decide whether to think more or produce output
      toolChoice = "auto";
    }

    // Fallback: force structured output without tools
    const fallback = await openai.responses.parse({
      model: "gpt-4o-mini",
      input,
      text: {
        format: zodTextFormat(SearchPlanSchema, "search_plan"),
      },
    });

    if (fallback.output_parsed) {
      const plan = fallback.output_parsed;
      if (
        !plan.requiresSearch &&
        (plan.searches.user ||
          plan.searches.organisation ||
          plan.searches.events)
      ) {
        plan.requiresSearch = true;
      }
      return {
        requiresSearch: plan.requiresSearch,
        filterSearch: plan.filterSearch,
        context: plan.context,
        searches: plan.searches,
      };
    }

    // Ultimate fallback
    return {
      requiresSearch: false,
      filterSearch: false,
      context: "Failed to plan search",
      searches: { user: null, organisation: null, events: null },
    };
  } catch (error) {
    console.error("ThinkingPlan error:", error);
    return {
      requiresSearch: false,
      filterSearch: false,
      context: "Error during planning",
      searches: { user: null, organisation: null, events: null },
    };
  }
};
