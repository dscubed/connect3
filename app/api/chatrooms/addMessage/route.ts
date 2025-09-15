import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api/auth-middleware";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Return error response
    }
    const { user } = authResult;

    // Parse request body
    const { chatroomId, query, userId } = await request.json();

    if (!chatroomId || !query || !userId) {
      return NextResponse.json(
        { error: "Chatroom ID, query, and user ID are required" },
        { status: 400 }
      );
    }

    // Verify the authenticated user matches the userId in request
    if (user.id !== userId) {
      return NextResponse.json({ error: "User ID mismatch" }, { status: 403 });
    }

    console.log(
      `💬 User ${user.id} adding message to chatroom:`,
      chatroomId,
      "Query:",
      query
    );
    console.log(
      `💬 User ${user.id} adding message to chatroom:`,
      chatroomId,
      "Query:",
      query
    );

    // Verify chatroom exists and user has access
    const { data: chatroom, error: chatroomError } = await supabase
      .from("chatrooms")
      .select("id, created_by")
      .eq("id", chatroomId)
      .eq("created_by", user.id) // Ensure user owns this chatroom
      .single();

    if (chatroomError || !chatroom) {
      console.error("❌ Chatroom not found or access denied:", chatroomError);
      return NextResponse.json(
        { error: "Chatroom not found or access denied" },
        { status: 404 }
      );
    }

    // Add new message to chatroom
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
    // Return immediately
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
