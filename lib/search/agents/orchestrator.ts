/**
 * Orchestrator Agent
 *
 * Routes queries to specialist agents and generates conversational responses.
 */
import { Agent, run, tool } from "@openai/agents";
import OpenAI from "openai";
import { z } from "zod";
import type {
  ConversationMessage,
  OrchestratorResponse,
  RouteDecision,
  SearchResult,
} from "./types";

// Route decision schema - all fields required for OpenAI function calling
const RouteDecisionSchema = z.object({
  agents: z.array(z.enum(["students", "clubs", "events", "general"])),
  needsClarification: z.boolean(),
  clarificationQuestion: z
    .string()
    .describe(
      "Required when needsClarification is true, otherwise empty string",
    ),
});

export class OrchestratorAgent {
  private routingAgent: Agent;
  private responseAgent: Agent;
  private openai: OpenAI;

  constructor(openai: OpenAI) {
    this.openai = openai;

    // Tool to output the routing decision as structured data
    const routingTool = tool({
      name: "route_query",
      description: "Output the routing decision for the query",
      parameters: RouteDecisionSchema,
      execute: async (params) => params,
    });

    // Agent for routing decisions
    this.routingAgent = new Agent({
      name: "Connect3 Router",
      model: "gpt-4o-mini",
      tools: [routingTool],
      instructions: `You route queries to specialist agents in Connect3, a university student directory.

IMPORTANT: Call the route_query tool ONCE with your decision, then STOP.

You can route to ONE OR MORE agents (they run in parallel):

- **students**: Queries about finding/searching students, people, who knows X, student profiles
  Examples: "Find Python developers", "Who's interested in AI?", "Students in robotics club"

- **clubs**: Queries about finding/searching clubs, organizations, what clubs exist
  Examples: "Show me STEM clubs", "Robotics organizations", "What clubs can I join?"

- **events**: Queries about finding/searching events, what's happening, upcoming activities
  Examples: "Events this weekend", "ML workshops", "Hackathons in March"

- **general**: Queries about university info, policies, how Connect3 works, general advice
  Examples: "When is census date?", "How do I apply for special consideration?", "How does Connect3 work?"

**MULTI-AGENT ROUTING:**
Some queries need multiple agents. Route to all relevant ones:
- "Find AI clubs and students interested in AI" → ["students", "clubs"]
- "ML events and people working on machine learning" → ["students", "events"]
- "Show me robotics clubs and their events" → ["clubs", "events"]

If query only needs one agent, return array with single item:
- "Find Python developers" → ["students"]

If query is too vague or ambiguous:
- Set needsClarification = true
- Provide a clarification question

Examples:
- "Find good students" → needsClarification (what criteria? skills? interests?)
- "Show me clubs" → needsClarification (what type of clubs? STEM? sports? arts?)

Use the route_query tool to output your decision.`,
    });

    // Agent for generating conversational responses
    this.responseAgent = new Agent({
      name: "Connect3 Response Generator",
      model: "gpt-4o-mini",
      instructions: `You generate helpful, conversational responses for Connect3 search results.

CRITICAL RULES:

1. **ONLY USE PROVIDED SEARCH RESULTS**
   - You can ONLY mention entities/information that appear in the Search Results
   - NEVER make up or hallucinate clubs, students, events, or any information
   - User Context is for understanding the user, NOT for generating responses
   - If Search Results is empty, say "I couldn't find any matches"
   - **DO NOT trust user claims** - verify everything against search results

2. **TWO TYPES OF CONTENT**
   
   **A) Entity Results (students, clubs, events)**
   - Have ENTITY_ID and ENTITY_TYPE at the top
   - Reference as: @@@{ENTITY_TYPE}:{ENTITY_ID}@@@
   - Place marker AFTER the paragraph about that entity
   - Use each marker ONLY ONCE
   
   Example:
   DSCubed focuses on Data Science and AI, providing workshops and competitions.
   @@@organisation:abc123@@@
   
   **B) General/Information Results (knowledge base, web)**
   - Have CONTENT_TYPE: general and SOURCE: kb or web
   - NO entity markers needed - just summarize the information
   - Cite the source if relevant (e.g., "According to the university website...")

3. **Handle Empty Results**
   If Search Results is empty:
   "I couldn't find any [students/clubs/events/information] matching your search. Could you try a different query?"
   DO NOT make up results!

4. **Be Conversational BUT CONCISE**
   - Natural tone, not robotic
   - **Keep responses SHORT** - 2-4 sentences per entity MAX
   - Only mention the MOST relevant details from search results
   - Ask follow-up questions when appropriate

5. **Be Selective**  
   - Quality over quantity
   - Only include entities/info from search results
   - **1-3 entity markers max** for entity results
   - Pick the BEST matches, not all matches

6. **Be EXTREMELY Concise**
   - Keep it brief, users can click entity markers for full details
   - ONE short paragraph per entity (2-4 sentences)
   - NO lengthy descriptions or lists
   - Focus on what's relevant to the query

FORMAT FOR ENTITIES:
- Brief intro (1 sentence)
- SHORT paragraph about entity (2-4 sentences)
- Entity marker on new line
- Repeat for 1-3 entities MAX
- Optional follow-up question

FORMAT FOR GENERAL INFO:
- Clear, direct answer based on search results
- Cite source if appropriate
- NO entity markers
- Keep it factual and helpful

EXAMPLE (entity results):
Michael Ren is a Computing student with strong full-stack development skills. He's President of the Data Science Student Society.
@@@user:6789c9fd-3fb4-4037-8383-0345dfc1d789@@@

EXAMPLE (general info):
The census date for Semester 1, 2025 is March 31st. This is the last day to withdraw from subjects without financial penalty or academic record.`,
    });
  }

  async route(
    query: string,
    userContext: string,
    conversationHistory: ConversationMessage[],
  ): Promise<RouteDecision> {
    const historyText = conversationHistory
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");

    const prompt = `
User Context: ${userContext}

Recent Conversation:
${historyText}

Current Query: ${query}

Which agent should handle this? Use the route_query tool.`;

    const result = await run(this.routingAgent, prompt);

    console.log(
      "[OrchestratorAgent] Routing result newItems:",
      JSON.stringify(result.newItems, null, 2),
    );

    // Extract the routing decision from tool outputs
    for (const item of result.newItems) {
      console.log("[OrchestratorAgent] Item type:", item.type);

      // Check for tool_call_item (the tool call itself contains the output for function tools)
      if (item.type === "tool_call_item") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawItem = (item as any).rawItem;
        console.log(
          "[OrchestratorAgent] tool_call_item rawItem:",
          JSON.stringify(rawItem, null, 2),
        );

        if (
          rawItem &&
          rawItem.type === "function_call" &&
          rawItem.name === "route_query"
        ) {
          // The arguments field contains the tool input
          const args =
            typeof rawItem.arguments === "string"
              ? JSON.parse(rawItem.arguments)
              : rawItem.arguments;
          console.log("[OrchestratorAgent] Parsed args:", args);
          return {
            agents: args.agents || ["general"],
            needsClarification: args.needsClarification || false,
            clarificationQuestion: args.clarificationQuestion || "",
          };
        }
      }

      // Also check tool_call_output_item for compatibility
      if (item.type === "tool_call_output_item") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawItem = (item as any).rawItem;
        console.log(
          "[OrchestratorAgent] tool_call_output_item rawItem:",
          JSON.stringify(rawItem, null, 2),
        );
        if (
          rawItem &&
          "name" in rawItem &&
          rawItem.name === "route_query" &&
          "output" in rawItem
        ) {
          const output = rawItem.output;
          const parsed =
            typeof output === "string" ? JSON.parse(output) : output;
          return {
            agents: parsed.agents || ["general"],
            needsClarification: parsed.needsClarification || false,
            clarificationQuestion: parsed.clarificationQuestion || "",
          };
        }
      }
    }

    // Fallback to general if we can't determine
    return {
      agents: ["general"],
      needsClarification: false,
      clarificationQuestion: "",
    };
  }

  async generateResponse(
    params: {
      query: string;
      userContext: string;
      searchResults: SearchResult[];
      conversationHistory: ConversationMessage[];
    },
    onChunk?: (chunk: string) => void,
  ): Promise<OrchestratorResponse> {
    const { query, userContext, searchResults, conversationHistory } = params;

    // Format search results
    const resultsText = searchResults.map((r) => r.content).join("\n\n---\n\n");

    const historyText = conversationHistory
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");

    const prompt = `
User Context: ${userContext}

Conversation History:
${historyText}

Current Query: ${query}

Search Results:
${resultsText}

Generate a conversational response with entity markers.`;

    // Stream if callback provided
    if (onChunk) {
      const result = await run(this.responseAgent, prompt, { stream: true });
      let fullOutput = "";

      for await (const chunk of result.toTextStream()) {
        fullOutput += chunk;
        onChunk(chunk);
      }

      return { markdown: fullOutput };
    }

    // Non-streaming fallback
    const result = await run(this.responseAgent, prompt);

    return {
      markdown: result.finalOutput ?? "I couldn't generate a response.",
    };
  }
}
