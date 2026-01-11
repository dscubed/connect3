import { SupabaseClient } from "@supabase/supabase-js";
import { ResponseInput } from "openai/resources/responses/responses.mjs";

export const getContext = async (
  chatmessageId: string,
  supabase: SupabaseClient
) => {
  // Fetch message data
  const { data: messageData, error: messageError } = await supabase
    .from("chatmessages")
    .select("query, user_id, chatroom_id, created_at")
    .eq("id", chatmessageId)
    .single();

  if (messageError || !messageData) {
    throw new Error("Failed to fetch message");
  }
  const { query, user_id, chatroom_id, created_at } = messageData;

  // Fetch user TLDR
  const { data: userData, error: userError } = await supabase
    .from("profiles")
    .select("tldr, university")
    .eq("id", user_id)
    .single();

  let tldr = "";
  if (!userError && userData) {
    tldr = userData.tldr ?? "";
  }

  const userUniversity = userData?.university ?? null;

  // Fetch previous messages (excluding current)
  const CHAT_CONTEXT_LIMIT = 3;
  const { data: historyData, error: historyError } = await supabase
    .from("chatmessages")
    .select("query, content")
    .eq("chatroom_id", chatroom_id)
    .eq("status", "completed")
    .lt("created_at", created_at) // Exclude current message
    .order("created_at", { ascending: false })
    .limit(CHAT_CONTEXT_LIMIT);

  if (historyError) {
    throw new Error("Failed to fetch chat history");
  }

  // Build messages array (reverse for chronological order)
  const prevMessages: ResponseInput = [];
  for (let i = 0; i < (historyData?.length ?? 0); i++) {
    const msg = historyData![i];
    const content =
      typeof msg.content === "string" ? JSON.parse(msg.content) : msg.content;

    prevMessages.push({ role: "user", content: msg.query });
    prevMessages.push({ role: "assistant", content: contentToString(content) });
  }

  return {
    query,
    tldr,
    prevMessages,
    userUniversity,
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const contentToString = (content: any): string => {
  // TODO: Update when finished with pipeline
  console.log("contentToString content:", content);
  return "";
};
