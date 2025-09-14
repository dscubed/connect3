import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { runSearchInBackground } from "@/lib/chatrooms/runSearchInBackground";
import { authenticateRequest } from "@/lib/api/auth-middleware";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Return error response
    }
    const { user } = authResult;

    const { query, userId } = await request.json();

    if (user.id !== userId) {
      return NextResponse.json(
        { error: "User ID does not match authenticated user" },
        { status: 403 }
      );
    }

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
