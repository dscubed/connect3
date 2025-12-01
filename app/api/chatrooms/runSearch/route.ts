import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod.mjs";
import { authenticateRequest } from "@/lib/api/auth-middleware";
import { SearchResults } from "@/components/search/types";

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

// --- User details interface ---
export interface UserDetails {
  id: string;
  full_name: string;
  avatar_url: string;
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateRequest(req);
    if (authResult instanceof NextResponse) {
      return authResult; // Return error response
    }

    const user = authResult.user;
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId } = await req.json();

    if (!messageId) {
      return NextResponse.json(
        { error: "Message ID is required" },
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

    // If already completed, return cached
    if (message.status === "completed" && message.content) {
      return NextResponse.json({
        success: true,
        content: message.content,
        status: "completed",
        cached: true,
      });
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
      .eq("status", "completed") // only finished messages
      .lte("created_at", message.created_at) // messages before this one
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
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles") // adjust table name if needed
        .select("id, first_name, last_name")
        .in("id", Array.from(allUserIds));

      if (profilesError) {
        console.error("❌ Error fetching user names:", profilesError);
      } else {
        userNameMap = Object.fromEntries(
          (profiles ?? []).map((p) => [
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

      // main answer
      if (content.result) {
        parts.push(content.result);
      }

      // previously retrieved files with user names
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

      // previous follow-up
      if (content.followUps) {
        parts.push(`Previous follow-up suggestion: ${content.followUps}`);
      }

      return parts.join("\n");
    }

    // Build history messages as proper {role, content} messages
    const historyMessages = recentHistory.flatMap((row) => {
      const msgs: { role: "user" | "assistant"; content: string }[] = [];

      if (row.query) {
        msgs.push({ role: "user", content: row.query });
      }

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

    const messagesForOpenAI = [
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
      input: messagesForOpenAI,
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

    // Check OpenAI parsing result
    if (!apiResponse.output_parsed) {
      await supabase
        .from("chatmessages")
        .update({ status: "failed" })
        .eq("id", messageId);
      return NextResponse.json(
        { error: "Failed to parse search results" },
        { status: 502 }
      );
    }

    // Validate parsed output with Zod
    const parsed = QueryResultSchema.safeParse(apiResponse.output_parsed);
    if (!parsed.success) {
      await supabase
        .from("chatmessages")
        .update({ status: "failed" })
        .eq("id", messageId);
      return NextResponse.json(
        { error: "Invalid search result format" },
        { status: 502 }
      );
    }

    // Group matches by userId and collect userIds
    const matches = parsed.data.matches;
    const userMap = new Map<
      string,
      Array<{ file_id: string; description: string }>
    >();

    for (const match of matches) {
      // Fetch from openai_files to get user_id
      const { data: fileData, error: fileError } = await supabase
        .from("user_files")
        .select("openai_file_id, user_id")
        .eq("openai_file_id", match.file_id)
        .single();
      if (fileError || !fileData) {
        console.error(
          "❌ Error fetching file data for match:",
          match,
          fileError
        );
        continue; // Skip this match if error occurs
      }
      const userId = fileData.user_id;
      if (userId) {
        const existing = userMap.get(userId) || [];
        userMap.set(userId, [
          ...existing,
          { file_id: match.file_id, description: match.description },
        ]);
      }
    }

    // Convert userMap to array format
    const userResults = Array.from(userMap.entries()).map(
      ([user_id, files]) => ({
        user_id,
        files,
      })
    );

    // Get chatroom_id fetched earlier
    const chatroom_id = message.chatroom_id;

    // Prepare user_matches rows
    const userMatchesRows = [];
    for (const match of userResults) {
      const { user_id, files } = match;
      if (user_id === user.id) continue;
      for (const file of files) {
        userMatchesRows.push({
          user_id,
          openai_file_id: file.file_id,
          chatroom_id: chatroom_id,
          chatmessage_id: messageId,
          queried_by: user.id,
        });
      }
    }

    // Bulk insert into user_matches table
    if (userMatchesRows.length > 0) {
      const { error: userMatchesError } = await supabase
        .from("user_matches")
        .insert(userMatchesRows);

      if (userMatchesError) {
        console.error("❌ Error inserting user_matches:", userMatchesError);
        // Optionally handle/log error, but don't fail the main request
      }
    }

    // Update message content and status
    const { error: updateError } = await supabase
      .from("chatmessages")
      .update({
        content: {
          result: parsed.data.result,
          matches: userResults,
          followUps: parsed.data.followUps,
        },
        status: "completed",
      })
      .eq("id", messageId);

    if (updateError) {
      await supabase
        .from("chatmessages")
        .update({ status: "failed" })
        .eq("id", messageId);
      return NextResponse.json(
        { error: "Failed to update message content" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      content: {
        result: parsed.data.result,
        matches: userResults,
        followUps: parsed.data.followUps,
      },
      status: "completed",
      cached: false,
    });
  } catch (error) {
    console.error("runSearch error:", error);
    // Mark as failed
    if (req.method === "POST") {
      const { messageId } = await req.json().catch(() => ({}));
      if (messageId) {
        await supabase
          .from("chatmessages")
          .update({ status: "failed" })
          .eq("id", messageId);
      }
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
