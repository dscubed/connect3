import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chatroomId = searchParams.get("chatroomId");

    if (!chatroomId) {
      return NextResponse.json(
        { error: "Chatroom ID is required" },
        { status: 400 }
      );
    }

    console.log("🔍 Fetching messages for chatroom:", chatroomId);

    // Verify chatroom exists
    const { data: chatroom, error: chatroomError } = await supabase
      .from("chatrooms")
      .select("id, title, created_at")
      .eq("id", chatroomId)
      .single();

    if (chatroomError || !chatroom) {
      console.error("❌ Chatroom not found:", chatroomError);
      return NextResponse.json(
        { error: "Chatroom not found" },
        { status: 404 }
      );
    }

    // Get all messages for this chatroom
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

    console.log(`✅ Found ${messages?.length || 0} messages`);

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
