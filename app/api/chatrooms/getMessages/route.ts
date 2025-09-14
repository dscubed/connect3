import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api/auth-middleware";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // 1. Extract and validate auth token
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Return error response
    }
    const { user } = authResult;

    // 3. Get chatroom ID from query params
    const { searchParams } = new URL(request.url);
    const chatroomId = searchParams.get("chatroomId");

    if (!chatroomId) {
      return NextResponse.json(
        { error: "Chatroom ID is required" },
        { status: 400 }
      );
    }

    console.log(
      `🔍 User ${user.id} fetching messages for chatroom:`,
      chatroomId
    );

    // 4. Verify chatroom exists and user has access to it
    const { data: chatroom, error: chatroomError } = await supabase
      .from("chatrooms")
      .select("id, title, created_at, created_by")
      .eq("id", chatroomId)
      .eq("created_by", user.id) // Ensure user owns this chatroom
      .single();

    // Let's also check if the chatroom exists at all (without user filter)
    const { data: chatroomCheck, error: chatroomCheckError } = await supabase
      .from("chatrooms")
      .select("id, title, created_at, created_by")
      .eq("id", chatroomId)
      .single();

    console.log("- Chatroom exists check:", chatroomCheck);
    console.log("- Chatroom exists error:", chatroomCheckError);

    if (chatroomError || !chatroom) {
      console.error("❌ Chatroom not found or access denied:", chatroomError);
      return NextResponse.json(
        { error: "Chatroom not found or access denied" },
        { status: 404 }
      );
    }

    // 5. Get all messages for this chatroom
    const { data: messages, error: messagesError } = await supabase
      .from("chatmessages")
      .select("*")
      .eq("chatroom_id", chatroomId)
      .order("created_at", { ascending: true }); // Oldest first

    if (messagesError) {
      console.error("❌ Error fetching messages:", messagesError);
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: 500 }
      );
    }

    console.log(
      `✅ Found ${messages?.length || 0} messages for user ${user.id}`
    );

    return NextResponse.json({
      success: true,
      chatroom,
      messages: messages || [],
      count: messages?.length || 0,
    });
  } catch (error) {
    console.error("❌ API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
