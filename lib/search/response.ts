import OpenAI from "openai";
import { FileMap, FileResult, SearchResponse } from "./types";
import { parseMarkdownEntities } from "./markdownParser";

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
    .map((res) => `[${res.fileId}]:\n${res.text}`)
    .join("\n\n");

  const systemPrompt = `You are an expert search result summarizer. Given a user query and search results, generate a helpful markdown response.

## Output Format
Write your response in **markdown** format. When referencing specific search results, include the entity marker inline using this format:
@@@type:id@@@

For example, if a search result has fileId "user_abc123", you would write:
"Check out this person who matches your interests: @@@user:abc123@@@"

## File ID to Entity Mapping
${Object.entries(fileIdToMarker)
  .map(([fileId, marker]) => `- ${fileId} → ${marker}`)
  .join("\n")}

## Guidelines
- Write a concise summary (2-3 sentences max)
- Group related results under markdown headers (##) if helpful
- Place entity markers (@@@type:id@@@) inline where they're contextually relevant
- Each entity marker should appear on its own line for proper card rendering
- Max 3-5 entity matches total - only pick the most relevant ones
- End with 1-2 follow-up question suggestions if appropriate
- If no good matches, explain that briefly

## Example Output
Here's what I found based on your interests:

## Recommended Connections
These people share your interest in AI and machine learning:

@@@user:abc-123@@@
@@@user:def-456@@@

## Relevant Clubs
@@@organisation:org-789@@@

Would you like me to find more specific matches?`;

  const stream = await openai.responses.create({
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: systemPrompt },
      { role: "system", content: `Search Context: ${context}` },
      { role: "user", content: `Search Results:\n${results}` },
    ],
    stream: true,
  });

  // Accumulate streamed text
  let markdown = "";
  for await (const event of stream) {
    if (event.type === "response.output_text.delta" && "delta" in event) {
      markdown += event.delta;
      // Emit partial markdown for streaming UI updates
      const partial = parseMarkdownEntities(markdown);
      if (emit) emit("response", { partial });
    }
  }

  // Parse final response
  const { entities } = parseMarkdownEntities(markdown);

  return {
    markdown: markdown.trim(),
    entities,
  };
};
