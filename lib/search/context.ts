import { SupabaseClient } from "@supabase/supabase-js";
import { ResponseInput } from "openai/resources/responses/responses.mjs";
import type { SearchResponse } from "./types";

export const getContext = async (
  chatmessageId: string,
  supabase: SupabaseClient,
) => {
  const { data: messageData, error: messageError } = await supabase
    .from("chatmessages")
    .select("query, user_id, chatroom_id, created_at")
    .eq("id", chatmessageId)
    .single();

  if (messageError || !messageData) {
    throw new Error("Failed to fetch message");
  }
  const { query, user_id, chatroom_id, created_at } = messageData;

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

  const { data: chatroomData } = await supabase
    .from("chatrooms")
    .select("universities")
    .eq("id", chatroom_id)
    .single();

  const selectedUniversities =
    typeof chatroomData?.universities === "string" &&
    chatroomData.universities.length > 0
      ? chatroomData.universities.split(",")
      : [];

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

  // Reverse to chronological order (fetched newest-first)
  const chronologicalHistory = [...(historyData ?? [])].reverse();

  const prevMessages: ResponseInput = [];
  for (const msg of chronologicalHistory) {
    const content = msg.content as SearchResponse | null;
    prevMessages.push({ role: "user", content: msg.query });
    prevMessages.push({ role: "assistant", content: content?.markdown ?? "" });
  }

  return {
    query,
    tldr,
    prevMessages,
    userUniversity,
    userId: user_id as string,
    selectedUniversities,
  };
};
