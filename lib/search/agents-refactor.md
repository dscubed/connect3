# Connect3 Agent System Migration Guide

## 🎯 Overview

We are migrating from a custom LLM pipeline to the **OpenAI Agents SDK** (`@openai/agents`).

**Current System:** Manual prompt engineering with multiple LLM calls for routing, planning, searching, and response generation.

**New System:** Agent-based architecture where:
- **Sub-agents** are specialized searchers that find relevant entities
- **Orchestrator** is the conversational brain that reasons and responds

---

## 🏗️ Architecture

### 5 Agents Total

1. **Orchestrator Agent** - Routes queries + generates conversational responses
2. **Students Agent** - Searches student profiles
3. **Clubs Agent** - Searches club/organization profiles  
4. **Events Agent** - Searches event listings
5. **General Agent** - Searches university knowledge base

### Agent Responsibilities

#### Orchestrator (Main Agent)
**Purpose:** Route queries to specialist agents, then generate conversational responses

**Routing Logic:**
- "Find Python developers" → StudentsAgent
- "Show me robotics clubs" → ClubsAgent
- "Events this weekend" → EventsAgent
- "When is census date?" → GeneralAgent

**Response Generation:**
- Receives search results from sub-agents (raw file content)
- Has full conversation history
- Can reason, compare, and converse naturally
- Inserts entity markers: `@@@user:user_abc123@@@`

**Does NOT:** Perform searches itself

---

#### Students Agent (Sub-agent)
**Purpose:** Search student profiles in vector store

**Vector Store:** `process.env.OPENAI_USER_VECTOR_STORE_ID`

**Tool:** `file_search`

**Returns:** Array of file contents (each file contains `ENTITY_ID` and `ENTITY_TYPE`)

**Example Return:**
```typescript
{
  results: [
    {
      fileId: "file-abc123",
      content: `
ENTITY_ID: user_ian123
ENTITY_TYPE: user
---
Name: Ian Oon
Role: President of UWA Data Science Club
Skills: Python, Machine Learning, Data Analysis
Projects: Built ML chatbot, Data pipeline automation
Interests: AI, Deep Learning, NLP
Education: Master of Professional Engineering
      `
    },
    {
      fileId: "file-xyz789",
      content: "ENTITY_ID: user_sarah456\nENTITY_TYPE: user\n---\n..."
    }
  ]
}
```

**Does NOT:** Generate conversational responses, just finds and returns relevant student files

---

#### Clubs Agent (Sub-agent)
**Purpose:** Search club/organization profiles in vector store

**Vector Store:** `process.env.OPENAI_ORG_VECTOR_STORE_ID`

**Tool:** `file_search`

**Returns:** Array of file contents (each file contains `ENTITY_ID` and `ENTITY_TYPE`)

**Example Return:**
```typescript
{
  results: [
    {
      fileId: "file-def456",
      content: `
ENTITY_ID: org_dsc789
ENTITY_TYPE: organisation
---
Name: UWA Data Science Club
Description: Student-run club focused on data science, ML, and AI
Members: 150+ students
Activities: Weekly workshops, hackathons, industry talks
Recruitment: Open year-round
Contact: dsc@uwa.edu.au
Events Hosted: ML Workshop, Data Viz Competition
      `
    }
  ]
}
```

**Does NOT:** Generate conversational responses, just finds and returns relevant club files

---

#### Events Agent (Sub-agent)
**Purpose:** Search event listings in vector store

**Vector Store:** `process.env.OPENAI_EVENTS_VECTOR_STORE_ID`

**Tool:** `file_search`

**Returns:** Array of file contents (each file contains `ENTITY_ID` and `ENTITY_TYPE`)

**Example Return:**
```typescript
{
  results: [
    {
      fileId: "file-ghi789",
      content: `
ENTITY_ID: event_workshop123
ENTITY_TYPE: events
---
Name: Introduction to Machine Learning Workshop
Type: Workshop, Technical, Educational
Host: UWA Data Science Club
Date: 2024-03-15 14:00 - 16:00
Location: Engineering Building Room 2.01
City: Perth
Country: Australia
Price: Free
Description: Hands-on workshop covering ML basics, scikit-learn, model evaluation
University: University of Western Australia
Booking: https://eventbrite.com/ml-workshop
      `
    }
  ]
}
```

**Does NOT:** Generate conversational responses, just finds and returns relevant event files

---

#### General Agent (Sub-agent)
**Purpose:** Search university knowledge base (scraped university info)

**Vector Store:** `process.env.OPENAI_GENERAL_KB_VECTOR_STORE_ID`

**Tool:** `file_search`

**Returns:** Text content from knowledge base (NO entity markers needed here)

**Example Return:**
```typescript
{
  results: [
    {
      fileId: "file-kb001",
      content: `
TOPIC: Census Date
SOURCE: UWA Student Services
---
Census date is the final date to withdraw from a unit without academic penalty.
- Semester 1 2024: March 22
- Semester 2 2024: August 30
Students who withdraw after census date receive a fail grade.
To withdraw, use studentConnect or contact Student Services.
      `
    }
  ]
}
```

**Does NOT:** Generate conversational responses, just finds and returns relevant KB files

**Special Note:** General agent responses have NO entity markers (no clickable entities)

---

## 📊 Data Flow

### Complete Flow Example

**User Query:** "Find Python developers interested in AI"

#### Step 1: Orchestrator Routes
```typescript
const route = await orchestrator.route(query, userContext, conversationHistory);
// Returns: "students"
```

#### Step 2: Students Agent Searches
```typescript
const searchResults = await studentsAgent.search(query, userContext);

// Returns:
{
  results: [
    {
      fileId: "file-abc",
      content: "ENTITY_ID: user_ian123\nENTITY_TYPE: user\n---\nName: Ian Oon\nSkills: Python, ML\nInterests: AI..."
    },
    {
      fileId: "file-xyz", 
      content: "ENTITY_ID: user_sarah456\nENTITY_TYPE: user\n---\nName: Sarah Chen\nSkills: Python, NLP\nInterests: AI..."
    }
  ]
}
```

#### Step 3: Orchestrator Generates Response
```typescript
const response = await orchestrator.generateResponse({
  query: "Find Python developers interested in AI",
  userContext: "Student at UWA studying CS",
  searchResults: searchResults.results,
  conversationHistory: [...]
});

// Returns markdown:
`
Here are Python developers with AI interests:

**Ian Oon** - President of Data Science Club
@@@user:user_ian123@@@
Skills: Python, Machine Learning
Projects: ML chatbot, data pipelines

**Sarah Chen** - NLP Researcher  
@@@user:user_sarah456@@@
Skills: Python, Natural Language Processing
Interests: AI, Deep Learning
`
```

#### Step 4: Return to User
User sees markdown with clickable entity markers.

---

### Complex Query Example

**User Query:** "Why is Data Science Club better than Robotics Club?"

#### Step 1: Orchestrator Routes
```typescript
// Routes to: "clubs" (both clubs mentioned)
```

#### Step 2: Clubs Agent Searches
```typescript
const searchResults = await clubsAgent.search(query, userContext);

// Returns BOTH club files:
{
  results: [
    {
      fileId: "file-dsc",
      content: "ENTITY_ID: org_dsc789\n...\nMembers: 150+\nFocus: ML, AI, Data..."
    },
    {
      fileId: "file-robo",
      content: "ENTITY_ID: org_robo456\n...\nMembers: 80+\nFocus: Hardware, Robotics..."
    }
  ]
}
```

#### Step 3: Orchestrator Generates Response
Orchestrator sees FULL content of both clubs, can reason and compare:

```typescript
const response = await orchestrator.generateResponse({
  query: "Why is Data Science Club better than Robotics Club?",
  searchResults: [dscFile, roboFile],
  conversationHistory: [...]
});

// Returns conversational comparison:
`
Both clubs are excellent! Here's how they differ:

**Data Science Club** @@@organisation:org_dsc789@@@
- Larger community (150+ members)
- Focus: Software, ML, AI, Data Analysis
- Events: Weekly workshops, hackathons

**Robotics Club** @@@organisation:org_robo456@@@  
- Hands-on hardware projects
- Focus: Embedded systems, mechanical design
- Events: Build competitions, robot battles

"Better" depends on your interests:
- Love coding/ML/data? → Data Science Club
- Love building physical things? → Robotics Club

Which area interests you more?
`
```

**Key:** Orchestrator can reason, compare, and converse because it has full file content + conversation history.

---

## 🔧 Technical Implementation

### File Structure
```
/agents
├── index.ts                    # Main Connect3AgentSystem class
├── orchestrator.ts             # OrchestratorAgent class
├── students-agent.ts           # StudentsAgent class
├── clubs-agent.ts              # ClubsAgent class
├── events-agent.ts             # EventsAgent class
├── general-agent.ts            # GeneralAgent class
├── types.ts                    # Shared TypeScript types
└── utils/
    └── extract-file-ids.ts     # Helper to extract file IDs from agent tool calls
```

---

### Key Types

```typescript
// types.ts

export type AgentRoute = "students" | "clubs" | "events" | "general";

export interface SearchResult {
  fileId: string;
  content: string; // File content with ENTITY_ID embedded
}

export interface AgentSearchResponse {
  results: SearchResult[];
}

export interface OrchestratorResponse {
  markdown: string; // Final response with entity markers
}

export interface RouteDecision {
  agent: AgentRoute;
  needsClarification: boolean;
  clarificationQuestion?: string;
}
```

---

### Orchestrator Implementation

```typescript
// orchestrator.ts

import { Agent } from "@openai/agents";
import OpenAI from "openai";

export class OrchestratorAgent {
  private routingAgent: Agent;
  private responseAgent: Agent;
  private openai: OpenAI;

  constructor(openai: OpenAI) {
    this.openai = openai;
    
    // Agent for routing decisions
    this.routingAgent = new Agent({
      name: "Connect3 Router",
      model: "gpt-4o-mini",
      instructions: `
You route queries to specialist agents in Connect3, a university student directory.

Route to:
- **students**: Queries about finding/searching students, people, who knows X, student profiles
  Examples: "Find Python developers", "Who's interested in AI?", "Students in robotics club"

- **clubs**: Queries about finding/searching clubs, organizations, what clubs exist
  Examples: "Show me STEM clubs", "Robotics organizations", "What clubs can I join?"

- **events**: Queries about finding/searching events, what's happening, upcoming activities
  Examples: "Events this weekend", "ML workshops", "Hackathons in March"

- **general**: Queries about university info, policies, how Connect3 works, general advice
  Examples: "When is census date?", "How do I apply for special consideration?", "How does Connect3 work?"

If query is too vague or ambiguous:
- Set needsClarification = true
- Provide a clarification question

Examples:
- "Find good students" → needsClarification (what criteria? skills? interests?)
- "Show me clubs" → needsClarification (what type of clubs? STEM? sports? arts?)

Return JSON:
{
  "agent": "students" | "clubs" | "events" | "general",
  "needsClarification": boolean,
  "clarificationQuestion": "string (if needsClarification is true)"
}
      `
    });

    // Agent for generating conversational responses
    this.responseAgent = new Agent({
      name: "Connect3 Response Generator",
      model: "gpt-4o-mini",
      instructions: `
You generate helpful, conversational responses for Connect3 search results.

CRITICAL RULES:

1. **Use Entity Markers**
   Search results contain ENTITY_ID and ENTITY_TYPE at the top of each file.
   Reference entities as: @@@{ENTITY_TYPE}:{ENTITY_ID}@@@
   
   Example:
   File contains "ENTITY_ID: user_ian123" and "ENTITY_TYPE: user"
   → Reference as: @@@user:user_ian123@@@

2. **Be Conversational**
   - Natural tone, not robotic
   - Can compare, reason, ask follow-ups
   - Helpful explanations

3. **Be Selective**  
   - Quality over quantity
   - Only include relevant matches
   - 3-5 entity markers max

4. **Correct User Mistakes**
   If user says "John is the CEO" but results show "John is CTO":
   → "Actually, John is the CTO (not CEO)..."

5. **Be Concise**
   - Keep it brief, users can click entity markers for details
   - Don't dump entire profiles

6. **Handle No Results**
   If no matches:
   "I couldn't find [what they asked for]. Would you like me to search for [alternative]?"

FORMAT:
- Brief intro (1-2 sentences)
- Entity markers with minimal context
- Optional follow-up question

EXAMPLE OUTPUT:

Here are Python developers with AI interests:

**Ian Oon** - President of Data Science Club
@@@user:user_ian123@@@

**Sarah Chen** - ML Researcher
@@@user:user_sarah456@@@

Would you like to know more about their specific projects?
      `
    });
  }

  async route(
    query: string,
    userContext: string,
    conversationHistory: Array<{role: string; content: string}>
  ): Promise<RouteDecision> {
    const prompt = `
User Context: ${userContext}

Recent Conversation:
${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}

Current Query: ${query}

Which agent should handle this?
    `;

    const result = await this.routingAgent.run({
      messages: [{ role: "user", content: prompt }]
    });

    return result.output as RouteDecision;
  }

  async generateResponse(params: {
    query: string;
    userContext: string;
    searchResults: SearchResult[];
    conversationHistory: Array<{role: string; content: string}>;
  }): Promise<OrchestratorResponse> {
    const { query, userContext, searchResults, conversationHistory } = params;

    // Format search results
    const resultsText = searchResults
      .map(r => r.content)
      .join('\n\n---\n\n');

    const prompt = `
User Context: ${userContext}

Conversation History:
${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}

Current Query: ${query}

Search Results:
${resultsText}

Generate a conversational response with entity markers.
    `;

    const result = await this.responseAgent.run({
      messages: [{ role: "user", content: prompt }]
    });

    return {
      markdown: result.output as string
    };
  }
}
```

---

### Sub-Agent Implementation (Students Example)

```typescript
// students-agent.ts

import { Agent } from "@openai/agents";
import OpenAI from "openai";

export class StudentsAgent {
  private agent: Agent;
  private vectorStoreId: string;
  private openai: OpenAI;

  constructor(openai: OpenAI) {
    this.openai = openai;
    this.vectorStoreId = process.env.OPENAI_USER_VECTOR_STORE_ID!;

    this.agent = new Agent({
      name: "Students Search Specialist",
      model: "gpt-4o-mini",
      instructions: `
You search student profiles in the Connect3 vector store.

Your ONLY job:
1. Use the file_search tool to find relevant student profiles
2. Return the file IDs of matching students

Be selective - only return strong matches.

If the query is too vague (e.g., "find good students"), you can indicate that more information is needed.
      `,
      tools: [
        {
          type: "file_search",
          vector_store_ids: [this.vectorStoreId]
        }
      ]
    });
  }

  async search(
    query: string,
    userContext: string
  ): Promise<AgentSearchResponse> {
    const searchPrompt = `
User Context: ${userContext}

Search for students matching: ${query}

Use file_search to find relevant student profiles.
    `;

    const result = await this.agent.run({
      messages: [{ role: "user", content: searchPrompt }]
    });

    // Extract file IDs from agent's tool calls
    const fileIds = this.extractFileIds(result);

    // Fetch file contents from OpenAI
    const results: SearchResult[] = await Promise.all(
      fileIds.map(async (fileId) => {
        const content = await this.getFileContent(fileId);
        return { fileId, content };
      })
    );

    return { results };
  }

  private extractFileIds(agentResult: any): string[] {
    // Extract file IDs from agent's tool_calls
    // This depends on how @openai/agents structures responses
    // Typically: agentResult.tool_calls[].file_search.results[].file_id
    
    const fileIds: string[] = [];
    
    if (agentResult.tool_calls) {
      for (const toolCall of agentResult.tool_calls) {
        if (toolCall.type === "file_search" && toolCall.file_search?.results) {
          for (const result of toolCall.file_search.results) {
            if (result.file_id) {
              fileIds.push(result.file_id);
            }
          }
        }
      }
    }
    
    return fileIds;
  }

  private async getFileContent(fileId: string): Promise<string> {
    // Fetch file content from OpenAI
    const file = await this.openai.files.content(fileId);
    const content = await file.text();
    return content;
  }
}
```

**Note:** ClubsAgent and EventsAgent follow the EXACT same pattern, just with different vector store IDs.

---

### Main System Class

```typescript
// index.ts

import OpenAI from "openai";
import { SupabaseClient } from "@supabase/supabase-js";
import { OrchestratorAgent } from "./orchestrator";
import { StudentsAgent } from "./students-agent";
import { ClubsAgent } from "./clubs-agent";
import { EventsAgent } from "./events-agent";
import { GeneralAgent } from "./general-agent";

export class Connect3AgentSystem {
  private orchestrator: OrchestratorAgent;
  private studentsAgent: StudentsAgent;
  private clubsAgent: ClubsAgent;
  private eventsAgent: EventsAgent;
  private generalAgent: GeneralAgent;

  constructor(openai: OpenAI, supabase: SupabaseClient) {
    this.orchestrator = new OrchestratorAgent(openai);
    this.studentsAgent = new StudentsAgent(openai);
    this.clubsAgent = new ClubsAgent(openai);
    this.eventsAgent = new EventsAgent(openai);
    this.generalAgent = new GeneralAgent(openai);
  }

  async run(
    query: string,
    userContext: string,
    conversationHistory: Array<{role: string; content: string}>
  ) {
    // Step 1: Route to appropriate agent
    const routing = await this.orchestrator.route(
      query,
      userContext,
      conversationHistory
    );

    // Step 2: If needs clarification, return early
    if (routing.needsClarification) {
      return {
        type: "clarification",
        question: routing.clarificationQuestion
      };
    }

    // Step 3: Call appropriate sub-agent
    let searchResults;
    
    switch (routing.agent) {
      case "students":
        searchResults = await this.studentsAgent.search(query, userContext);
        break;
      
      case "clubs":
        searchResults = await this.clubsAgent.search(query, userContext);
        break;
      
      case "events":
        searchResults = await this.eventsAgent.search(query, userContext);
        break;
      
      case "general":
        searchResults = await this.generalAgent.search(query, userContext);
        break;
    }

    // Step 4: Orchestrator generates conversational response
    const response = await this.orchestrator.generateResponse({
      query,
      userContext,
      searchResults: searchResults.results,
      conversationHistory
    });

    return {
      type: "response",
      markdown: response.markdown
    };
  }
}
```

---

### Usage (Replaces Current `runSearch`)

```typescript
// In your API route or wherever runSearch is called

import { Connect3AgentSystem } from "./agents";

// Old way:
// const response = await runSearch(chatmessageId, openai, supabase, emit);

// New way:
const agentSystem = new Connect3AgentSystem(openai, supabase);

// Get context from your existing getContext function
const { query, tldr, prevMessages, userUniversity } = await getContext(
  chatmessageId,
  supabase
);

const response = await agentSystem.run(
  query,
  tldr, // user context
  prevMessages // conversation history
);

if (response.type === "clarification") {
  // Show clarification question to user
  return {
    message: response.question,
    requiresUserInput: true
  };
} else {
  // Show markdown response with entity markers
  return {
    markdown: response.markdown
  };
}
```

---

## 🔄 Migration Steps

### Phase 1: Setup
1. ✅ Install `@openai/agents` package (already done)
2. Create `/agents` folder structure
3. Create `types.ts` with shared types

### Phase 2: Build Orchestrator
1. Implement `OrchestratorAgent` class
2. Implement routing logic
3. Implement response generation logic
4. Test routing with mock data

### Phase 3: Build One Sub-Agent
1. Start with `StudentsAgent` (simplest to test)
2. Implement search method
3. Implement file ID extraction
4. Implement file content fetching
5. Test end-to-end: route → search → response

### Phase 4: Clone Pattern for Other Sub-Agents
1. Copy `StudentsAgent` to `ClubsAgent`
2. Change vector store ID
3. Adjust instructions slightly
4. Repeat for `EventsAgent`
5. Implement `GeneralAgent` (slightly different - no entity markers)

### Phase 5: Integration
1. Create main `Connect3AgentSystem` class
2. Wire up all agents
3. Replace `runSearch()` calls with `agentSystem.run()`
4. Test with real queries

### Phase 6: Cleanup
1. Delete old files: `plan.ts`, `search.ts`, `filter.ts`
2. Update imports across codebase
3. Remove unused dependencies

---

## 📝 Important Notes

### Vector Store File Format

All vector store files MUST have this format:

```
ENTITY_ID: {entity_id}
ENTITY_TYPE: {entity_type}
---
{actual content}
```

**Example - Student:**
```
ENTITY_ID: user_ian123
ENTITY_TYPE: user
---
Name: Ian Oon
Skills: Python, Machine Learning
...
```

**Example - Club:**
```
ENTITY_ID: org_dsc789
ENTITY_TYPE: organisation
---
Name: UWA Data Science Club
Description: ...
```

**Example - Event:**
```
ENTITY_ID: event_workshop123
ENTITY_TYPE: events
---
Name: ML Workshop
Date: 2024-03-15
...
```

### Entity Marker Format

In the final markdown response:
```
@@@{ENTITY_TYPE}:{ENTITY_ID}@@@
```

Examples:
- `@@@user:user_ian123@@@`
- `@@@organisation:org_dsc789@@@`
- `@@@events:event_workshop123@@@`

These markers are clickable in the UI and show full entity details.

---

## 🐛 Common Issues & Solutions

### Issue 1: File IDs not extracting correctly
**Solution:** Check how `@openai/agents` structures tool call responses. May need to adjust `extractFileIds()` method.

### Issue 2: Agent not using file_search tool
**Solution:** Ensure tool is properly configured in agent initialization and instructions mention using it.

### Issue 3: Response missing entity markers
**Solution:** Check that:
1. File content has ENTITY_ID embedded
2. Response agent instructions mention using @@@type:id@@@ format
3. Orchestrator is passing file content to response agent

### Issue 4: Routing always goes to same agent
**Solution:** Check routing agent instructions, ensure examples cover all agent types clearly.

---

## ✅ Testing Checklist

- [ ] Orchestrator routes "Find Python developers" to StudentsAgent
- [ ] Orchestrator routes "Show me STEM clubs" to ClubsAgent
- [ ] Orchestrator routes "Events this weekend" to EventsAgent
- [ ] Orchestrator routes "When is census date?" to GeneralAgent
- [ ] Orchestrator asks for clarification on vague queries
- [ ] StudentsAgent returns file IDs with content
- [ ] File content includes ENTITY_ID and ENTITY_TYPE
- [ ] Response includes entity markers: @@@user:user_123@@@
- [ ] Complex queries (comparisons) work correctly
- [ ] Conversation history flows through agents
- [ ] No results handled gracefully

---

## 🚀 What Gets Better

**Before (Current System):**
- 200+ lines of routing prompts in `plan.ts`
- Manual tool orchestration in `search.ts`
- Complex filtering logic
- Hard to reason about multi-step conversations

**After (New Agent System):**
- Agents SDK handles tool use automatically
- Clean separation: searchers vs. conversationalist
- Orchestrator can reason with full context
- Easy to add new agent types
- Built-in conversation state management

---

## 📚 Reference

- OpenAI Agents SDK: https://github.com/openai/openai-agents-sdk
- Your existing code to preserve: `generateResponse` logic, entity marker parsing, UI components
- Your existing code to delete: `plan.ts`, `search.ts`, `filter.ts`, manual LLM calls

---

## 🎯 Success Criteria

Migration is successful when:
1. ✅ User asks "Find Python developers" → gets markdown with @@@user:id@@@ markers
2. ✅ User asks "Why is club X better than Y?" → gets conversational comparison
3. ✅ User asks vague question → gets clarification request
4. ✅ All 4 agent types (students/clubs/events/general) work
5. ✅ Response quality is same or better than current system
6. ✅ Code is cleaner and more maintainable

---

## 💡 Pro Tips for Copilot

1. **Start small:** Build orchestrator + one sub-agent first
2. **Test incrementally:** Don't build everything then test
3. **Copy patterns:** ClubsAgent is 99% same as StudentsAgent
4. **Keep file format consistent:** Always ENTITY_ID at top
5. **Log everything:** Add console.logs to debug agent decisions
6. **Use TypeScript:** Strong types prevent errors

Good luck! 🚀