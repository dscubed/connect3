import { SupabaseClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { ResponseInput } from "openai/resources/responses/responses.mjs";
import z from "zod";
import { zodTextFormat } from "openai/helpers/zod.mjs";

const ContextSummarySchema = z.object({
  summary: z.string(),
  queries: z.array(z.string()),
  entityTypes: z.object({
    users: z.boolean(),
    organisations: z.boolean(),
  }),
});

export type ContextSummary = z.infer<typeof ContextSummarySchema>;

export const analyseContext = async (
  chatmessageId: string,
  supabase: SupabaseClient,
  openai: OpenAI
): Promise<{ contextSummary: ContextSummary; query: string }> => {
  const { query, tldr, prevMessages } = await getContext(
    chatmessageId,
    supabase
  );

  const systemPrompt = `Analyse the user's query, provide context, and determine entity types.

ENTITY TYPE DETECTION:
- Set "users: true" if query is about: people, individuals, students, contacts, someone, who, member
- Set "organisations: true" if query is about: clubs, societies, organizations, groups, teams, companies
- BOTH can be true if query is ambiguous (e.g., "tech at unimelb" could be people OR clubs)
- DEFAULT to BOTH true if unclear - better to over-search than miss results

QUERY REWRITING:
ONLY if the user's query is vague or ambiguous/follow up, rewrite the query.
IF the query is clear, return it as is.
Queries shouldn't be questions but short phrases like "computing clubs unimelb".

Summary should be only 1-2 sentences max and describe the user's intent with any assumptions made.
If user is requesting specific entities (e.g. clubs, organisations), include that in the summary.

EXAMPLES:

Query: "Who goes to unimelb?"
- summary: The user wants to find people/students attending University of Melbourne
- queries: ["students unimelb", "people university of melbourne"]
- entityTypes: { users: true, organisations: false }

Query: "What clubs should I join at unimelb?"
- summary: The user is seeking club recommendations at University of Melbourne
- queries: ["clubs university of melbourne", "societies unimelb"]
- entityTypes: { users: false, organisations: true }

Query: "Who can I talk to about data science at unimelb?"
- summary: User wants both people in data science AND data science organizations at unimelb
- queries: ["data science unimelb", "data science students", "data science clubs"]
- entityTypes: { users: true, organisations: true }

Query: "Find me CISSA contact info"
- summary: User wants contact information for CISSA club
- queries: ["CISSA contact", "CISSA unimelb"]
- entityTypes: { users: false, organisations: true }

Query: "Connect me to data science students"
- summary: User wants to connect with other students interested in data science
- queries: ["data science students", "data science community"]
- entityTypes: { users: true, organisations: false }

Query: "Yes" -> Look at chat history to find context.
- summary: The user is confirming their interest in learning more about tech clubs at University of Melbourne based on previous discussion. Clubs previously discussed include DSCubed, HackMelbourne and CISSA.
- queries: ["DSCubed unimelb", "HackMelbourne", "CISSA"]
- entityTypes: { users: false, organisations: true }

Query: "What about tech?" -> Ambiguous without context
- summary: User is interested in tech but unclear if seeking people, organizations, or both
- queries: ["tech unimelb"]
- entityTypes: { users: true, organisations: true }

** USE SPECIFIC ENTITY NAMES IF AVAILABLE IN CHAT HISTORY **
`;

  const response = await openai.responses.parse({
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: systemPrompt },
      ...prevMessages,
      { role: "system", content: `User info: ${tldr}` },
      { role: "user", content: `Current Query: ${query}` },
    ],
    text: {
      format: zodTextFormat(ContextSummarySchema, "context_summary"),
    },
  });

  if (!response.output_parsed) {
    throw new Error("Failed to parse context summary");
  }

  return { contextSummary: response.output_parsed as ContextSummary, query };
};

const getContext = async (chatmessageId: string, supabase: SupabaseClient) => {
  // Fetch message data
  const { data: messageData, error: messageError } = await supabase
    .from("chatmessages")
    .select("query, user_id, chatroom_id, created_at")
    .eq("id", chatmessageId)
    .single();

  if (messageError || !messageData) {
    throw new Error("Failed to fetch message");
  }
  const { query, user_id, chatroom_id, created_at } = messageData;

  // Fetch user TLDR
  const { data: userData, error: userError } = await supabase
    .from("profiles")
    .select("tldr")
    .eq("id", user_id)
    .single();

  let tldr = "";
  if (!userError && userData) {
    tldr = userData.tldr ?? "";
  }

  // Fetch previous messages (excluding current)
  const CHAT_CONTEXT_LIMIT = 3;
  const { data: historyData, error: historyError } = await supabase
    .from("chatmessages")
    .select("query, content")
    .eq("chatroom_id", chatroom_id)
    .eq("status", "completed")
    .lt("created_at", created_at) // Exclude current message
    .order("created_at", { ascending: false })
    .limit(CHAT_CONTEXT_LIMIT);

  if (historyError) {
    throw new Error("Failed to fetch chat history");
  }

  // Build messages array (reverse for chronological order)
  const prevMessages: ResponseInput = [];
  for (let i = (historyData?.length ?? 0) - 1; i >= 0; i--) {
    const msg = historyData![i];
    const content =
      typeof msg.content === "string" ? JSON.parse(msg.content) : msg.content;

    prevMessages.push({ role: "user", content: msg.query });
    prevMessages.push({ role: "assistant", content: contentToString(content) });
  }

  return {
    query,
    tldr,
    prevMessages,
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const contentToString = (content: any): string => {
  // TODO: Update when SearchResponse type is finalized
  if (!content) return "";
  if (content.result && typeof content.result === "string") {
    return content.result;
  } else {
    return content.summary ?? JSON.stringify(content).slice(0, 500);
  }
};
