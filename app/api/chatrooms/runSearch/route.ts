import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod.mjs";
import { authenticateRequest } from "@/lib/api/auth-middleware";

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

// --- User details helpers ---
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export interface UserDetails {
  id: string;
  full_name: string;
  avatar_url: string;
}

async function fetchMultipleUsers(
  userIds: string[]
): Promise<Map<string, UserDetails>> {
  try {
    const { data: users, error } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, avatar_url")
      .in("id", userIds);

    if (error) {
      console.error("❌ Error fetching multiple users:", error);
      return new Map();
    }

    const userMap = new Map<string, UserDetails>();
    users?.forEach((user) => {
      userMap.set(user.id, {
        id: user.id,
        full_name: `${user.first_name} ${user.last_name}`,
        avatar_url: user.avatar_url || `https://i.pravatar.cc/120?u=${user.id}`,
      });
    });

    return userMap;
  } catch (error) {
    console.error("❌ Error in fetchMultipleUsers:", error);
    return new Map();
  }
}

// --- Handler ---
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

    // Fetch message row
    const { data: message, error: fetchError } = await supabase
      .from("chatmessages")
      .select("query, content, status, user_id")
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

    // Run OpenAI vector search
    const vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID;
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!vectorStoreId || !openaiApiKey) {
      return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
    }
    const openai = new OpenAI({ apiKey: openaiApiKey });

    const apiResponse = await openai.responses.parse({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content: `You are a vector store assistant. Rules:
1. When a user queries, always provide:
   - result: 2-3 sentence summary of relevant content.
   - matches: an array of objects containing:
       * file_id: the actual file_id from the vector store attributes. FORMAT: "file-...", NO .TXT
       * description: short description of the content and how it relates to the query and describes the user don't mention document
   - followUps: a single natural language question to continue the conversation
2. Ignore file_name. Never generate it.
3. Only include files actually returned by the vector store with attributes.
4. Return valid JSON strictly in this format:
{
  "result": "...",
  "matches": [
    {"file_id": "...", "description": "..."}
  ],
  "followUps": "..."
}
5. If you cannot find results, return an empty matches array but still include result and followUps.
`,
        },
        { role: "user", content: `Query: ${message.query}` },
      ],
      tools: [{ type: "file_search", vector_store_ids: [vectorStoreId] }],
      text: {
        format: zodTextFormat(QueryResultSchema, "search_results"),
      },
    });

    if (!apiResponse.output_parsed) {
      await supabase
        .from("chatmessages")
        .update({ status: "failed" })
        .eq("id", messageId);
      return NextResponse.json(
        { error: "Failed to parse search results" },
        { status: 500 }
      );
    }

    const parsed = QueryResultSchema.safeParse(apiResponse.output_parsed);
    if (!parsed.success) {
      await supabase
        .from("chatmessages")
        .update({ status: "failed" })
        .eq("id", messageId);
      return NextResponse.json(
        { error: "Invalid search result format" },
        { status: 500 }
      );
    }

    // Group matches by userId and collect userIds
    const matches = parsed.data.matches;
    const userMap = new Map<
      string,
      Array<{ file_id: string; description: string }>
    >();
    const userIdsSet = new Set<string>();

    for (const match of matches) {
      const fileInfo = await openai.vectorStores.files.retrieve(match.file_id, {
        vector_store_id: vectorStoreId,
      });
      const userId = String(fileInfo.attributes?.userId);
      if (userId) {
        userIdsSet.add(userId);
        const existing = userMap.get(userId) || [];
        userMap.set(userId, [
          ...existing,
          { file_id: match.file_id, description: match.description },
        ]);
      }
    }

    // Fetch user details in one go
    const userIds = Array.from(userIdsSet);
    const userDetailsMap = await fetchMultipleUsers(userIds);

    // Compose userResults with avatar and name
    const userResults = Array.from(userMap.entries()).map(
      ([user_id, files]) => {
        const user = userDetailsMap.get(user_id);
        return {
          user_id,
          full_name: user?.full_name || `User ${user_id.slice(0, 8)}`,
          avatar_url:
            user?.avatar_url || `https://i.pravatar.cc/120?u=${user_id}`,
          files,
        };
      }
    );

    // Fetch chatroom_id for user_matches entries
    const { data: chatroomRow, error: chatroomError } = await supabase
      .from("chatmessages")
      .select("chatroom_id")
      .eq("id", messageId)
      .single();

    const chatroom_id = chatroomRow?.chatroom_id ?? null;
    if (chatroomError || !chatroom_id) {
      console.error("❌ Error fetching chatroom ID:", chatroomError);
    }

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
