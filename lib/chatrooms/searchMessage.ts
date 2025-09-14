import { createClient } from "@supabase/supabase-js";
import { runSearch } from "@/lib/vector-store/queryVectorStore";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function searchMessage(messageId: string) {
  try {
    console.log("🔍 Running search for message:", messageId);

    // Get the message to find the query
    const { data: message, error: fetchError } = await supabase
      .from("chatmessages")
      .select("query, content, status")
      .eq("id", messageId)
      .single();

    if (fetchError || !message) {
      console.error("❌ Message not found:", fetchError);
      throw new Error("Message not found");
    }

    // Check if search already completed
    if (message.status === "completed" && message.content) {
      console.log("✅ Search already completed");
      return {
        success: true,
        content: message.content,
        status: "completed",
        cached: true,
      };
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
      await supabase
        .from("chatmessages")
        .update({ status: "failed" })
        .eq("id", messageId);
      throw new Error("Failed to update message content");
    }

    console.log("✅ Updated message content");

    return {
      success: true,
      content: searchResults,
      status: "completed",
      cached: false,
    };
  } catch (error) {
    console.error("❌ Search error:", error);

    // Mark as failed
    await supabase
      .from("chatmessages")
      .update({ status: "failed" })
      .eq("id", messageId);

    throw error;
  }
}
