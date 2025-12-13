import { SupabaseClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { ResponseInput } from "openai/resources/responses/responses.mjs";
import z from "zod";
import { zodTextFormat } from "openai/helpers/zod.mjs";
import { SearchResponse } from "./type";

const EntityReferenceSchema = z.object({
  id: z.string(),
  type: z.enum(["user", "organisation"]),
  name: z.string().nullable(),
});

const EntityIntentSchema = z.object({
  action: z.enum(["include", "exclude"]),
  reason: z.string(),
  entities: z.array(EntityReferenceSchema),
});

const ContextSummarySchema = z.object({
  summary: z.string(),
  queries: z.array(z.string()),
  entityTypes: z.object({
    users: z.boolean(),
    organisations: z.boolean(),
  }),
  entityIntents: z.array(EntityIntentSchema).nullable(),
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

  const systemPrompt = `Analyse the user's query, provide context, and determine what entity types to search.

ENTITY TYPE DETECTION (CRITICAL):
- Set "users: true" if the query is about PEOPLE: students, individuals, contacts, someone, who, person, people, find someone
- Set "organisations: true" if the query is about GROUPS: clubs, societies, organizations, groups, teams, club, society, organization
- BOTH can be true if ambiguous or if the query could benefit from both (e.g., "tech at unimelb", "who can I contact about X")
- DEFAULT: When unclear, prefer BOTH true - it's better to search widely than miss results

ENTITY INTENT DETECTION:
When the user references entities from chat history, detect their intent:
- "include" action: User wants MORE info about specific entities ("tell me more about X", "what about X", "details on X")
- "exclude" action: User wants DIFFERENT entities, NOT the ones mentioned ("find other", "find more like", "similar to", "alternatives to")
Use entity IDs from chat history when available. Format: [type:id] name

QUERY REWRITING:
ONLY if the user's query is vague or ambiguous/follow up, rewrite the query.
IF the query is clear, return it as is.
Queries shouldn't be questions but short phrases like "computing clubs unimelb".
Summary should be only 1-2 sentences max and describe the user's intent with any assumptions made.
If user is requesting specific entities (e.g. clubs, organisations), include that in the summary.

EXAMPLES:

Query: "find data science students in unimelb"
- summary: The user is searching for individuals/students studying data science at University of Melbourne.
- queries: ["data science students unimelb", "data science university of melbourne"]
- entityTypes: { users: true, organisations: false }

Query: "what clubs should I join"
- summary: The user is seeking recommendations for clubs to join at University of Melbourne.
- queries: ["tech clubs university of melbourne", "sports clubs university of melbourne"]
- entityTypes: { users: false, organisations: true }

Query: "who can I contact about machine learning?"
- summary: User wants both ML experts/people AND ML organizations/clubs that could provide ML contacts.
- queries: ["machine learning contact unimelb", "machine learning experts", "ML clubs"]
- entityTypes: { users: true, organisations: true }

Query: "CISSA"
- summary: User is asking about CISSA, which is a computing club/organization at university.
- queries: ["CISSA", "CISSA unimelb"]
- entityTypes: { users: false, organisations: true }

Query: "tech people at unimelb"
- summary: User explicitly wants people involved in technology at University of Melbourne.
- queries: ["tech unimelb", "technology students university of melbourne"]
- entityTypes: { users: true, organisations: false }

Query: "find founder clubs in unimelb"
- summary: User is looking for founder/entrepreneurship clubs at University of Melbourne.
- queries: ["founders clubs unimelb", "entrepreneurship clubs university of melbourne"]
- entityTypes: { users: false, organisations: true }

Query: "Yes" -> Look at chat history to find context.
- summary: The user is confirming their interest in learning more about tech clubs at University of Melbourne based on previous discussion. Clubs previously discussed include DSCubed, HackMelbourne and CISSA.
- queries: ["DSCubed unimelb", "HackMelbourne", "CISSA"]
- entityTypes: { users: false, organisations: true }

Query: "tell me more about CISSA" (with [organisation:abc123] CISSA in history)
- entityIntents: [{ action: "include", reason: "User wants more details", entities: [{ id: "abc123", type: "organisation", name: "CISSA" }] }]

Query: "find other clubs" (with entities in history)
- entityIntents: [{ action: "exclude", reason: "User wants different results", entities: [...all from history] }]

** USE SPECIFIC ENTITY NAMES AND IDs IF AVAILABLE **
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

const contentToString = (content: SearchResponse | null): string => {
  if (!content) return "";

  let output = content.summary ?? "";

  // Append entity info for AI to reference by ID
  if (content.results) {
    const entities: string[] = [];
    for (const result of content.results) {
      for (const match of result.matches ?? []) {
        entities.push(`[${match.type}:${match.id}] ${match.name}`);
      }
    }
    if (entities.length > 0) {
      output += "\n\nEntities mentioned:\n" + entities.join("\n");
    }
  }

  return output;
};
