import OpenAI from "openai";
import { FileMap, FileResult, SearchResponse } from "./types";

export const generateResponse = async (
  searchResults: FileResult[],
  context: string,
  openai: OpenAI,
  fileMap: FileMap,
  emit?: (event: string, data: unknown) => void,
): Promise<SearchResponse> => {
  // Build a reverse map: fileId -> entity marker string
  const fileIdToMarker: Record<string, string> = {};
  for (const [fileId, entity] of Object.entries(fileMap)) {
    if (entity) {
      fileIdToMarker[fileId] = `@@@${entity.type}:${entity.id}@@@`;
    }
  }

  // Format results with fileId labels
  const results = searchResults
    .map(
      (res) =>
        `[${res.fileId}] -> (${fileIdToMarker[res.fileId] || "unknown"}) :\n${res.text}`,
    )
    .join("\n\n");

  const systemPrompt = `You are an expert search result summarizer. Given a user query and search results, generate a helpful markdown response.

## CRITICAL: Be Selective with Results
You are given search results from a semantic search system. NOT ALL results will be relevant to the user's query.

Your job is to:
1. **Read the user's query carefully** to understand what they actually want
2. **Evaluate each search result** - does it genuinely match the query intent?
3. **Only include results that are truly relevant** - ignore results that don't align with the query
4. **Quality over quantity** - it's better to show 1-2 perfect matches than 10 mediocre ones

## How to Filter Results
Ask yourself for each result:
- Does this result directly answer what the user is asking for?
- Does this match the specific criteria mentioned in the query (e.g., skills, interests, event type)?
- Is this result a close semantic match or just tangentially related?
- Would the user actually be interested in this based on their query?

If a result doesn't clearly match, **DO NOT include it** in your response.

## When There Are No Good Matches
If none or very few of the search results are actually relevant:
- Be honest - say "I couldn't find strong matches for [specific criteria]"
- Explain why (e.g., "No clubs focused specifically on quantum computing")
- Suggest alternative searches or broaden the criteria
- Don't force irrelevant results just to have something

## Output Format
Write your response in **markdown** format. When referencing specific search results, include the entity marker inline using this format:
@@@type:id@@@

For example, if a search result has fileId "user_abc123", you would write:
"Check out this person who matches your interests: @@@user:abc123@@@"

## Guidelines
- Write a concise summary (2-3 sentences max) before showing results
- **Only reference entity markers for results that genuinely match the query**
- Group related results under markdown headers (##) if helpful
- Place entity markers (@@@type:id@@@) inline where they're contextually relevant
- Each entity marker should appear on its own line for proper card rendering
- Max 3-5 entity matches total - only the most relevant ones
- End with 1-2 follow-up question suggestions if appropriate
- Be selective - empty results are better than irrelevant results

## Example Output (Good Match)
Here's what I found for Python developers interested in AI:

## Top Matches
These students have strong Python skills and AI project experience:

@@@user:abc-123@@@
@@@user:def-456@@@

Would you like to see students with specific AI specializations (NLP, computer vision, etc.)?

## Example Output (Weak Matches)
I found a few students with Python experience, but none specifically focused on AI research. The search results mostly showed students doing web development with Python.

Would you like me to:
- Search for students interested in machine learning more broadly?
- Look for AI-related clubs instead?`;

  const stream = await openai.responses.create({
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: systemPrompt },
      { role: "system", content: `Search Context: ${context}` },
      {
        role: "user",
        content: `User Query: ${context}\n\nSearch Results:\n${results}`,
      },
    ],
    stream: true,
  });

  // Accumulate streamed text
  let markdown = "";
  for await (const event of stream) {
    if (event.type === "response.output_text.delta" && "delta" in event) {
      markdown += event.delta;
      // Emit partial markdown for streaming UI updates
      if (emit) emit("response", { partial: { markdown } });
    }
  }

  return {
    markdown: markdown.trim(),
  };
};
