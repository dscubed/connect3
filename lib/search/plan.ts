import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod.mjs";
import { SearchPlan } from "./types";
import { z } from "zod";
import { ResponseInput } from "openai/resources/responses/responses.mjs";

// Step 1: Check if search is required
const SearchRequiredSchema = z.object({
  requiresSearch: z.boolean(),
  reasoning: z.string(),
});

type SearchRequiredResult = z.infer<typeof SearchRequiredSchema>;

// Step 2: Plan the actual searches
const SearchQueriesSchema = z.object({
  filterSearch: z.boolean(),
  context: z.string(),
  searches: z.object({
    user: z.string().nullable(),
    organisation: z.string().nullable(),
    events: z.string().nullable(),
  }),
});

type SearchQueriesResult = z.infer<typeof SearchQueriesSchema>;

const checkSearchRequired = async (
  openai: OpenAI,
  query: string,
  tldr: string,
  prevMessages: ResponseInput,
): Promise<SearchRequiredResult> => {
  const systemPrompt = `You are a routing classifier for Connect3, a university student directory app.

Your ONLY job is to determine if a user query requires searching the Connect3 entity database (students, clubs, events).

The entity database contains:
- USERS (students): Student profiles with skills, projects, interests, experience, clubs they're in, subjects taken, hobbies, languages, certifications, and contact info
- ORGANISATIONS (clubs): Club profiles with descriptions, events, projects, roles/positions, recruitment info, affiliations, and contact details
- EVENTS: Upcoming and past events with time, location, price, host organization, and event description

Return TRUE if the query asks to:
- Find/discover/search for specific students, clubs, or events by name or characteristics
- Get recommendations for students/clubs/events to connect with
- Learn about specific people/clubs/events (even if asking about themselves)
- Get contact information for any person, club, or event
- Get details about club members, event attendees, or student activities
- Browse or explore what's available on campus
- Look up information about ANY named individual (including themselves)

Examples requiring search (TRUE):
- "Find me robotics clubs"
- "Show me events this weekend"
- "Who's interested in machine learning?"
- "Tell me about the AI club"
- "What's happening on campus?"
- "Recommend clubs for me"
- "Students who know Python"
- "What clubs are there for engineering students?"
- "Events next month"
- "Find people interested in startups"

Return FALSE if the query is about:
- How Connect3 works: "How do I use Connect3?", "How do recommendations work?", "What can Connect3 do?"
- Connect3 features/privacy: "Is my data private?", "Why can't I find clubs?", "How does Connect3 recommend clubs?"
- Editing profile: "How do I edit my profile/TLDR/chunks?"
- University information NOT in directory: "What subjects can I take?", "When's census date?", "How do I apply for special consideration?", "What are academic misconduct rules?", "When does semester 2 start?"
- General advice: "How do I get internships?", "What subjects should I take?", "How can I join clubs?" (asking for advice, not actual clubs)
- Greetings/chitchat: "Hello", "How are you?", "Tell me a joke", "What's up?"
- General knowledge: "Who is the president?", "What is the capital of France?"

IMPORTANT DISTINCTIONS:
- "How does Connect3 find clubs?" → FALSE (asking about app features)
- "Find me STEM clubs" → TRUE (asking to retrieve actual clubs from database)
- "How can I get more involved?" → FALSE (general advice, but note in reasoning they might want to search clubs/events)
- "What data science subjects should I take?" → FALSE (asking for advice, not about students)
- "What subjects have other data science students taken?" → TRUE (asking about student profiles in database)
- "How do I join clubs on campus?" → FALSE (asking for general advice)
- "What clubs can I join?" → TRUE (asking to see actual clubs from database)
- "How can I contact [any person's name]?" → TRUE (looking up contact info from database)
- "Who is [any person's name]?" → TRUE (looking up person in database, even if they're asking about themselves)

CRITICAL: If the query mentions a specific person's name (even if it's the user asking about themselves), this is a lookup request and requires search = TRUE.

When ambiguous or unclear, return FALSE and explain in reasoning that clarification is needed.

You will receive the user's query, their profile info, and recent conversation history.

Output ONLY a JSON object in this exact format:
{
  "requiresSearch": boolean,
  "reasoning": "brief 1-2 sentence explanation"
}`;

  const response = await openai.responses.parse({
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: systemPrompt },
      ...prevMessages,
      { role: "system", content: `User info: ${tldr}` },
      { role: "user", content: `Current Query: ${query}` },
    ],
    text: {
      format: zodTextFormat(SearchRequiredSchema, "search_required"),
    },
  });

  if (!response.output_parsed) {
    throw new Error("Failed to parse search required check");
  }

  return response.output_parsed;
};

const planSearchQueries = async (
  openai: OpenAI,
  query: string,
  tldr: string,
  prevMessages: ResponseInput,
): Promise<SearchQueriesResult> => {
  const systemPrompt = `You are a search query planner for Connect3's directory database.

You will receive a query that has ALREADY been confirmed to require directory search.

Your job is to:
1. Determine if this is filtering previous results (filterSearch)
2. Generate optimized search queries for each relevant entity type
3. Provide brief context to help interpret results

Entity types available:
- USERS (students): Student profiles including skills, experience, projects, interests, clubs they're in, subjects taken, hobbies, languages, certifications, and contact info
- ORGANISATIONS (clubs): Club profiles including description, events they host, projects, roles/positions, recruitment info, affiliations, and contact details
- EVENTS: Event listings including time, location, price, host organization, and event description

IMPORTANT: Only search entity types that are explicitly relevant to the query.
- If user asks only about students/people → search ONLY users (set organisation and events to null)
- If user asks only about clubs/organisations → search ONLY organisations (set users and events to null)
- If user asks only about events → search ONLY events (set users and organisation to null)
- Only search multiple types if the query clearly needs information from multiple entities

Examples of single entity searches:
- "Find me Python developers" → users only
- "Show me STEM clubs" → organisations only
- "What events are this weekend?" → events only
- "Students interested in AI" → users only
- "Tell me about the robotics club" → organisations only

Examples of multi-entity searches:
- "Find STEM clubs and their members" → organisations + users
- "AI club events and members" → organisations + users + events
- "Hackathons and people attending" → events + users

Set filterSearch = TRUE only when:
- User says "show me more", "what else", "more results", "next" after seeing results
- User asks follow-up about previously mentioned specific entity (e.g., "Tell me more about that AI club")
- User says "yes" or confirms when asked if they want more results
- Examples: "Show me more", "What about the second one?", "Tell me more about X" (where X was just mentioned)

Set filterSearch = FALSE when:
- This is a new search topic
- User mentions new entities not in previous conversation
- User pivots to different search criteria
- This is the first query or a fresh request

For searches object:
- Set to null if that entity type is NOT relevant to the query
- Only include entity types that are explicitly needed
- Phrase queries for semantic search (natural language), not keyword matching
- Each entity search is independent - do not assume relationships
- Be specific but concise in search queries

Examples with correct null handling:

Query: "Find Python developers"
→ {
  "filterSearch": false,
  "context": "Searching for students with Python skills",
  "searches": {
    "user": "students with Python programming skills",
    "organisation": null,
    "events": null
  }
}

Query: "Show me robotics clubs"
→ {
  "filterSearch": false,
  "context": "Searching for robotics-related clubs",
  "searches": {
    "user": null,
    "organisation": "robotics clubs",
    "events": null
  }
}

Query: "Events this weekend"
→ {
  "filterSearch": false,
  "context": "Searching for upcoming weekend events",
  "searches": {
    "user": null,
    "organisation": null,
    "events": "events happening this weekend"
  }
}

Query: "Find STEM clubs and their members"
→ {
  "filterSearch": false,
  "context": "Searching for STEM clubs and students involved in them",
  "searches": {
    "user": "students in STEM clubs",
    "organisation": "STEM clubs",
    "events": null
  }
}

Query: "AI club events and members"
→ {
  "filterSearch": false,
  "context": "Searching for AI club information including events and members",
  "searches": {
    "user": "AI club members",
    "organisation": "AI club",
    "events": "AI club events"
  }
}

Query: "Show me more" (after previous results were shown)
→ {
  "filterSearch": true,
  "context": "Filtering to show additional results from previous search",
  "searches": {
    "user": null,
    "organisation": null,
    "events": null
  }
}

Query: "What about data science students?" (after talking about ML clubs)
→ {
  "filterSearch": false,
  "context": "New search for data science students",
  "searches": {
    "user": "data science students",
    "organisation": null,
    "events": null
  }
}

You will receive the user's query, their profile info, and recent conversation history.
Use the conversation history to determine if this is a follow-up or filter request.

Output ONLY a JSON object in this exact format:
{
  "filterSearch": boolean,
  "context": "brief context about search intent",
  "searches": {
    "user": string | null,
    "organisation": string | null,
    "events": string | null
  }
}`;

  const response = await openai.responses.parse({
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: systemPrompt },
      ...prevMessages,
      { role: "system", content: `User info: ${tldr}` },
      { role: "user", content: `Current Query: ${query}` },
    ],
    text: {
      format: zodTextFormat(SearchQueriesSchema, "search_queries"),
    },
  });

  if (!response.output_parsed) {
    throw new Error("Failed to parse search queries");
  }

  return response.output_parsed;
};

export const planSearch = async (
  openai: OpenAI,
  query: string,
  tldr: string,
  prevMessages: ResponseInput,
): Promise<SearchPlan> => {
  // Step 1: Check if search is required
  const searchCheck = await checkSearchRequired(
    openai,
    query,
    tldr,
    prevMessages,
  );

  // If search is not required, return early
  if (!searchCheck.requiresSearch) {
    return {
      requiresSearch: false,
      filterSearch: false,
      context: searchCheck.reasoning,
      searches: {
        user: null,
        organisation: null,
        events: null,
      },
    };
  }

  // Step 2: Plan the actual search queries
  const searchPlan = await planSearchQueries(openai, query, tldr, prevMessages);

  return {
    requiresSearch: true,
    filterSearch: searchPlan.filterSearch,
    context: searchPlan.context,
    searches: searchPlan.searches,
  };
};
