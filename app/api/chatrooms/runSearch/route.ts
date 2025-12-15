import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { runSearch } from "@/lib/search/agent";
import { generateResponse } from "@/lib/search/response";
import { authenticateRequest } from "@/lib/api/auth-middleware";
import { SearchResults } from "@/components/search/types";

// Allow up to 5 minutes for execution (Vercel Pro/Hobby with Fluid Compute)
export const maxDuration = 300;
export const config = {
  runtime: "edge",
};

// --- Schemas ---
const QueryResultSchema = z.object({
  result: z.string(),
  matches: z.array(
    z.object({
      file_id: z.string(),
      description: z.string(),
    })
  ),
  followUps: z.string(),
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const user = authResult.user;
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

  const { messageId } = await req.json();

  if (!messageId) {
    return NextResponse.json(
      { success: false, error: "Missing messageId" },
      { status: 400 }
    );
  }

    // Fetch message row
    const { data: message, error: fetchError } = await supabase
      .from("chatmessages")
      .select("query, content, status, user_id, chatroom_id, created_at")
      .eq("id", messageId)
      .single();

    if (fetchError || !message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (message.user_id !== user.id) {
      return NextResponse.json(
        { error: "User ID does not match authenticated user" },
        { status: 403 }
      );
    }

    // Mark as processing
    await supabase
      .from("chatmessages")
      .update({ status: "processing" })
      .eq("id", messageId);

    // Fetch last 5 completed messages in this chatroom (for history)
    const RECENT_LIMIT = 5;

    const { data: historyRows, error: historyError } = await supabase
      .from("chatmessages")
      .select("query, content, created_at")
      .eq("chatroom_id", message.chatroom_id)
      .eq("status", "completed")
      .lte("created_at", message.created_at)
      .order("created_at", { ascending: true });

    if (historyError) {
      console.error("❌ Error fetching history:", historyError);
    }

    const recentHistory = (historyRows ?? []).slice(-RECENT_LIMIT);

    // collect all user_ids that appear in matches
    const allUserIds = new Set<string>();
    for (const row of recentHistory) {
      const c = row.content as SearchResults | null;
      if (c?.matches) {
        for (const group of c.matches) {
          if (group.user_id) allUserIds.add(group.user_id);
        }
      }
    }

    let userNameMap: Record<string, string> = {};
    if (allUserIds.size > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", Array.from(allUserIds));

      if (profiles) {
        userNameMap = Object.fromEntries(
          profiles.map((p) => [
            p.id,
            `${p.first_name} ${p.last_name ? p.last_name : ""}`.trim(),
          ])
        );
      }
    }

    function renderAssistantHistory(
      content: SearchResults,
      userNameMap: Record<string, string>
    ): string {
      const parts: string[] = [];
      if (content.result) parts.push(content.result);

      const fileLines: string[] = [];
      for (const group of content.matches ?? []) {
        const displayName =
          userNameMap[group.user_id] || `User ${group.user_id.slice(0, 8)}`;
        for (const file of group.files ?? []) {
          fileLines.push(`- ${displayName}: ${file.description}`);
        }
      }
      if (fileLines.length > 0) {
        parts.push("Previously retrieved files:", ...fileLines);
      }
      if (content.followUps) {
        parts.push(`Previous follow-up suggestion: ${content.followUps}`);
      }
      return parts.join("\n");
    }

    const historyMessages = recentHistory.flatMap((row) => {
      const msgs: { role: "user" | "assistant"; content: string }[] = [];
      if (row.query) msgs.push({ role: "user", content: row.query });
      const c = row.content as SearchResults | null;
      if (c && typeof c === "object") {
        const assistantText = renderAssistantHistory(c, userNameMap);
        if (assistantText.trim().length > 0) {
          msgs.push({ role: "assistant", content: assistantText });
        }
      }
      return msgs;
    });

    // Run OpenAI vector search
    const userVectorStoreId = process.env.OPENAI_USER_VECTOR_STORE_ID;
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const orgVectorStoreId = process.env.OPENAI_ORG_VECTOR_STORE_ID;

    if (!userVectorStoreId || !openaiApiKey || !orgVectorStoreId) {
      return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
    }
    const openai = new OpenAI({ apiKey: openaiApiKey });

    const llmMessages = [
      {
        role: "system" as const,
        content: `You are a vector store assistant. Rules:
1. When a user queries, always provide:
   - result: 2-3 sentence summary of relevant content.
   - matches: an array of objects containing:
       * file_id: the actual file_id from the vector store attributes. FORMAT: "file-...", NO .TXT
       * description: short description of the content and how it relates to the query (do not mention the word "document")
   - followUps: a single natural language question to continue the conversation.
2. Ignore file_name entirely.
3. Only include files actually returned by the vector store.
4. Return valid JSON strictly in this format:
{
  "result": "...",
  "matches": [
    {"file_id": "...", "description": "..."}
  ],
  "followUps": "..."
}
5. If you cannot find results, return an empty matches array but still include result and followUps.`,
      },
      ...historyMessages,
      {
        role: "user" as const,
        content: `Query: ${message.query}`,
      },
    ];

    const apiResponse = await openai.responses.parse({
      model: "gpt-4o-mini",
      input: llmMessages,
      tools: [
        {
          type: "file_search",
          vector_store_ids: [userVectorStoreId, orgVectorStoreId],
        },
      ],
      text: {
        format: zodTextFormat(QueryResultSchema, "search_results"),
      },
    });

    if (!apiResponse.output_parsed) {
      throw new Error("Failed to parse search results");
    }

    const parsed = QueryResultSchema.safeParse(apiResponse.output_parsed);
    if (!parsed.success) {
      throw new Error("Invalid search result format");
    }

    // Group matches by userId
    const matches = parsed.data.matches;
    const userMap = new Map<
      string,
      Array<{ file_id: string; description: string }>
    >();

    for (const match of matches) {
      const { data: fileData } = await supabase
        .from("user_files")
        .select("openai_file_id, user_id")
        .eq("openai_file_id", match.file_id)
        .single();

      if (fileData?.user_id) {
        const existing = userMap.get(fileData.user_id) || [];
        userMap.set(fileData.user_id, [
          ...existing,
          { file_id: match.file_id, description: match.description },
        ]);
      }
    }

    const userResults = Array.from(userMap.entries()).map(
      ([user_id, files]) => ({
        user_id,
        files,
      })
    );

    // Insert user_matches
    const userMatchesRows = [];
    for (const match of userResults) {
      const { user_id, files } = match;
      if (user_id === user.id) continue;
      for (const file of files) {
        userMatchesRows.push({
          user_id,
          openai_file_id: file.file_id,
          chatroom_id: message.chatroom_id,
          chatmessage_id: messageId,
          queried_by: user.id,
        });
      }
    }

    if (userMatchesRows.length > 0) {
      await supabase.from("user_matches").insert(userMatchesRows);
    }

    // Update message content and status
    const finalContent = {
      result: parsed.data.result,
      matches: userResults,
      followUps: parsed.data.followUps,
    };

    const { data: updatedMessage, error: updateError } = await supabase
      .from("chatmessages")
      .update({
        content: finalContent,
        status: "completed",
        content: response,
      })
      .eq("id", messageId)
      .select()
      .single();

    if (updateError) {
      throw new Error("Failed to update message content");
    }

    // Return the updated message object
    return NextResponse.json({
      success: true,
      message: updatedMessage,
    });
  } catch (error) {
    console.error("runSearch error:", error);

    // Mark as failed if we have a messageId
    try {
      const body = await req
        .clone()
        .json()
        .catch(() => ({}));
      if (body.messageId) {
        await supabase
          .from("chatmessages")
          .update({ status: "failed" })
          .eq("id", body.messageId);
      }
    } catch (e) {
      console.error("Failed to mark message as failed:", e);
    }

    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
