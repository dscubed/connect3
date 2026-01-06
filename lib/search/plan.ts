// Planner node - matches Colab implementation
import OpenAI from "openai";
import { SearchPlan, ChatMessage } from "./types";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod.mjs";

const EntitySearchSchema = z.object({
  organisation: z.string().nullable(),
  event: z.string().nullable(),
  user: z.string().nullable(),
});

const SearchPlanSchema = z.object({
  requiresSearch: z.boolean(),
  filterSearch: z.boolean(),
  context: z.string(),
  searches: EntitySearchSchema,
});

export const planSearch = async (
  query: string,
  userInfo: string = "",
  chatHistory: ChatMessage[] = [],
  openai: OpenAI
): Promise<SearchPlan> => {
  const contexts: Array<{ role: string; content: string }> = [];
  
  if (userInfo) {
    contexts.push({ role: "system", content: `User info: ${userInfo}` });
  } else {
    contexts.push({ role: "system", content: "No additional user information provided." });
  }

  if (chatHistory.length === 0) {
    contexts.push({ role: "system", content: "No previous chat history." });
  } else {
    // Add last 3 messages for context
    chatHistory.slice(-3).forEach((msg) => {
      contexts.push({ role: msg.role, content: msg.content });
    });
  }

  const systemPrompt = `You are an expert search planner. Given a user query, you will break down the query into relevant searches across multiple vector stores.

The vector stores available are:
1. Users: Contains documents related to individual users
   - their profiles, activities, and interests
   - skills
   - experience (clubs, work experience)
   - projects
   - subjects taken
   - hobbies
   - languages
   - certifications (licenses, certificates, honors, awards)
   - contact (socials, emails)

2. Organisations: Contains documents about clubs
   - club profile (description)
   - events
   - projects
   - contact details (socials, website, emails)
   - club roles (positions, recruitment info)
   - affiliations (faculty, external, sponsors)

3. Events: Contains documents about upcoming and past events, including:
   - time
   - location
   - price
   - host
   - event description
   - host organization

You will be given context about the user and the last 3 chat messages between you and the user.
The context field is for you to extract any information from said sources that helps understand the user's query better.
Prioritize the current user query over prior context unless the query is explicitly a follow-up.

Indicate requiresSearch to false if the query can be answered without any search.
Recall what information is available in each vector store when deciding if search provides relevant information for the query.
If the query does not depend on information from any vector store, indicate requiresSearch to false.

Examples of queries that do NOT require search:
- System Capabilities: "What can you do?", "How do you work?"
- Chatting/Greeting: "Hello", "Tell me a joke", "How are you?"
- General Knowledge: "Who is the president of the USA?", "What is the capital of France?"
- Personal Questions: "What is my name?", "Where do I live?"

Examples of queries that DO require search:
- Specific Inquiries: "Tell me about the AI club", "What events are happening this weekend?"
- User/Organisation Information: "Find me users interested in robotics", "What clubs are available for students?"
- Event Details: "When is the next hackathon?", "Where is the tech talk?"
- Recommendations: "Suggest clubs for me to join", "What events should I attend?"

Mixed Cases where search may help generate response (Advice):
Accept:
- "How can I get more involved on campus?" -> true (clubs and events can help)
Reject:
- "What data science subjects should I take?"/"What subjects are there?"/"What subjects can I take?"
  -> false, clarify "Would you like to know about subjects taken by other data science students?"
- "How can I get internships?", "How do I get a job?"
  -> false, clarify "Are you looking for students who can give advice or networking opportunities?"

When in doubt flag false and ask follow-up questions in context to ask user to reword or clarify their intent.

Indicate filterSearch to true if it requires filtering previous search results.
If the query looks like a follow-up to a previous query:
- "Show me more" tells you to filter previous results -> true
- "Tell me more about X" tells you to search about X mentioned previously only -> true
- "What about Y?" tells you to search about Y mentioned previously only -> true
- IF X and Y weren't mentioned previously we need to do a new search for X and Y -> false
- "What about students" tells you to search for students
- AI: "Would you like more results?", User: "Yes, show me more" tells you to filter previous results -> true

Assume that each search will return a limited number of results (top-k).
Phrase queries to maximize semantic coverage, not exact matching.
Do not assume explicit relationships between users, organisations, or events.

"Find me STEM clubs and users in those clubs" requires searching both organisations and users separately:
-> {"organisation": "STEM clubs", "user": "users in STEM clubs", "event": null}

"Tell me more about AI club its members and upcoming events" requires searching organisations, users, and events separately:
-> {"organisation": "AI club", "user": "members of AI club", "event": "upcoming events by AI club"}

*If the query for the entity type is not needed, set it to null.*`;

  const response = await openai.responses.parse({
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: systemPrompt },
      ...(contexts as Array<{ role: "system" | "user" | "assistant"; content: string }>),
      { role: "user", content: `User query: ${query}` },
    ],
    text: {
      format: zodTextFormat(SearchPlanSchema, "search_plan"),
    },
  });

  if (!response.output_parsed) {
    throw new Error("Failed to parse search plan");
  }

  return response.output_parsed as SearchPlan;
};

