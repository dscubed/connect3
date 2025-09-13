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
    const { query, userId } = await request.json();

    if (!query || !userId) {
      return NextResponse.json(
        { error: "Query and user ID are required" },
        { status: 400 }
      );
    }

    console.log("🔄 Creating chatroom for query:", query);

    // Step 1: Generate UUID for initial query
    const initialQueryId = crypto.randomUUID();

    // Step 2: Create chatroom with reference to initial query ID
    const title = query.length > 50 ? query.substring(0, 50) + "..." : query;

    const { data: chatroom, error: chatroomError } = await supabase
      .from("chatrooms")
      .insert({
        initial_query_id: initialQueryId,
        title: title,
        created_by: userId,
      })
      .select()
      .single();

    if (chatroomError) {
      console.error("❌ Error creating chatroom:", chatroomError);
      return NextResponse.json(
        { error: "Failed to create chatroom" },
        { status: 500 }
      );
    }

    console.log("✅ Created chatroom:", chatroom.id);

    // Step 3: Add user query to chatmessages (content will be null)
    const { data: message, error: messageError } = await supabase
      .from("chatmessages")
      .insert({
        id: initialQueryId,
        chatroom_id: chatroom.id,
        query: query,
        content: null, // Will be populated later by search
        status: "pending", // Initial status
        user_id: userId,
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

    // Step 4: Trigger search in background (don't await!)
    runSearchInBackground(message.id).catch((error) => {
      console.error("❌ Background search failed:", error);
    });

    // Return immediately - no search yet!
    return NextResponse.json({
      success: true,
      chatroom: {
        id: chatroom.id,
        title: chatroom.title,
        created_at: chatroom.created_at,
      },
      message: {
        id: message.id,
        query: message.query,
        content: null, // Will be populated by separate API call
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
