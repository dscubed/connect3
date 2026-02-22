/**
 * Bare minimum test: 1 agent, 1 fileSearchTool (users only), no streaming.
 * Hit POST /api/test/agent with { "query": "find react developers" }
 */
import { NextRequest, NextResponse } from "next/server";
import { Agent, run, fileSearchTool } from "@openai/agents";

export async function POST(req: NextRequest) {
  if (process.env.NEXT_PUBLIC_SITE_URL != "localhost:3000") {
    return NextResponse.json(
      { error: "Test route not available" },
      { status: 403 },
    );
  }

  const { query } = await req.json();

  const vectorStoreId = process.env.OPENAI_USER_VECTOR_STORE_ID!;
  console.log("[test/agent] Vector store ID:", vectorStoreId);
  console.log("[test/agent] Query:", query);

  const tool = fileSearchTool([vectorStoreId], {
    maxNumResults: 5,
  });

  console.log("[test/agent] Tool created:", JSON.stringify(tool, null, 2));

  const agent = new Agent({
    name: "TestAgent",
    model: "gpt-5-mini",
    tools: [tool],
    instructions:
      "You search for students. Use file_search to find people matching the query. Describe who you found.",
  });

  console.log("[test/agent] Agent created, running...");

  try {
    const result = await run(agent, query);

    console.log("[test/agent] Run complete");
    console.log(
      "[test/agent] Final output:",
      result.finalOutput?.substring(0, 500),
    );
    console.log("[test/agent] New items count:", result.newItems.length);

    // Log every single item
    for (const item of result.newItems) {
      console.log(`[test/agent] Item type: ${item.type}`);
      const raw = item.rawItem as Record<string, unknown>;
      console.log(`[test/agent]   rawItem.type: ${raw.type}`);
      if (raw.name) console.log(`[test/agent]   rawItem.name: ${raw.name}`);
      if (raw.output) {
        const output =
          typeof raw.output === "string"
            ? raw.output
            : JSON.stringify(raw.output);
        console.log(
          `[test/agent]   rawItem.output (first 300): ${output.substring(0, 300)}`,
        );
      }
    }

    return NextResponse.json({
      output: result.finalOutput,
      itemCount: result.newItems.length,
      items: result.newItems.map((i) => ({
        type: i.type,
        rawType: (i.rawItem as Record<string, unknown>).type,
        rawName: (i.rawItem as Record<string, unknown>).name,
      })),
    });
  } catch (error) {
    console.error("[test/agent] ERROR:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
