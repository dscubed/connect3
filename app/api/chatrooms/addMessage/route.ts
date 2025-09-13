import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

// Async function to run search in background
async function runSearchInBackground(messageId: string) {
  try {
    console.log("🔍 Starting background search for message:", messageId);

    // Call your search API endpoint
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/api/chatrooms/query`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messageId }),
      }
    );

    const result = await response.json();

    if (result.success) {
      console.log("✅ Background search completed for message:", messageId);
    } else {
      console.error(
        "❌ Background search failed for message:",
        messageId,
        result.error
      );
    }
  } catch (error) {
    console.error("❌ Background search error for message:", messageId, error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { chatroomId, query, userId } = await request.json();

    if (!chatroomId || !query || !userId) {
      return NextResponse.json(
        { error: "Chatroom ID, query, and user ID are required" },
        { status: 400 }
      );
    }

    console.log("💬 Adding message to chatroom:", chatroomId, "Query:", query);

    // Step 1: Verify chatroom exists and user has access
    const { data: chatroom, error: chatroomError } = await supabase
      .from("chatrooms")
      .select("id, created_by")
      .eq("id", chatroomId)
      .single();

    if (chatroomError || !chatroom) {
      console.error("❌ Chatroom not found:", chatroomError);
      return NextResponse.json(
        { error: "Chatroom not found" },
        { status: 404 }
      );
    }

    // TODO: Add proper authorization check
    // if (chatroom.created_by !== userId) {
    //   return NextResponse.json(
    //     { error: "Unauthorized" },
    //     { status: 403 }
    //   );
    // }

    // Step 2: Add new message to chatroom
    const { data: message, error: messageError } = await supabase
      .from("chatmessages")
      .insert({
        chatroom_id: chatroomId,
        query: query,
        content: null, // Will be populated by background search
        user_id: userId,
        status: "pending", // Initial status
      })
      .select()
      .single();

    if (messageError) {
      console.error("❌ Error creating message:", messageError);
      return NextResponse.json(
        { error: "Failed to create message" },
        { status: 500 }
      );
    }

    console.log("✅ Created message:", message.id);

    // Step 3: Trigger search in background (don't await!)
    runSearchInBackground(message.id).catch((error) => {
      console.error("❌ Background search failed:", error);
    });

    // Step 4: Return immediately
    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        chatroom_id: message.chatroom_id,
        query: message.query,
        content: null, // Will be populated by background search
        created_at: message.created_at,
        user_id: message.user_id,
      },
    });
  } catch (error) {
    console.error("❌ API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
