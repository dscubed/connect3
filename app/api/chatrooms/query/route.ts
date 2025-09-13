import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { runSearch } from "@/lib/vector-store/queryVectorStore";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

// In app/api/chatrooms/query/route.ts
export async function POST(request: NextRequest) {
  let messageId: string | undefined;
  try {
    ({ messageId } = await request.json());

    if (!messageId) {
      return NextResponse.json(
        { error: "Message ID is required" },
        { status: 400 }
      );
    }

    console.log("🔍 Running search for message:", messageId);

    // Get the message to find the query
    const { data: message, error: fetchError } = await supabase
      .from("chatmessages")
      .select("query, content, status")
      .eq("id", messageId)
      .single();

    if (fetchError || !message) {
      console.error("❌ Message not found:", fetchError);
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Check if search already completed
    if (message.status === "completed" && message.content) {
      console.log("✅ Search already completed");
      return NextResponse.json({
        success: true,
        content: message.content,
        status: "completed",
        cached: true,
      });
    }

    // Update status to processing
    await supabase
      .from("chatmessages")
      .update({ status: "processing" })
      .eq("id", messageId);

    // Run the search
    console.log("🔍 Running search for query:", message.query);
    const searchResults = await runSearch(message.query);
    console.log("✅ Search completed");

    // Update message content and status
    const { error: updateError } = await supabase
      .from("chatmessages")
      .update({
        content: searchResults,
        status: "completed",
      })
      .eq("id", messageId);

    if (updateError) {
      console.error("❌ Error updating message content:", updateError);

      // Mark as failed
      await supabase
        .from("chatmessages")
        .update({ status: "failed" })
        .eq("id", messageId);

      return NextResponse.json(
        { error: "Failed to update message content" },
        { status: 500 }
      );
    }

    console.log("✅ Updated message content");

    return NextResponse.json({
      success: true,
      content: searchResults,
      status: "completed",
      cached: false,
    });
  } catch (error) {
    console.error("❌ Search API error:", error);

    // Mark as failed
    if (messageId) {
      await supabase
        .from("chatmessages")
        .update({ status: "failed" })
        .eq("id", messageId);
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
