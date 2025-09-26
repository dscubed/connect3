import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";

export interface ChatroomInfo {
  id: string;
  title: string;
  last_message_at: string;
  last_query: string;
}

export interface ChatroomData {
  id: string;
  title: string | null;
  last_message_id: string | null;
  last_message_at: string;
}

export function useRecentChats() {
  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.loading);
  const getSupabaseClient = useAuthStore((state) => state.getSupabaseClient);
  const supabase = getSupabaseClient();

  const [chatrooms, setChatrooms] = useState<ChatroomInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChatrooms() {
      if (!user?.id) return;
      setLoading(true);

      const { data, error } = await supabase
        .from("chatrooms")
        .select("id, title, last_message_id, last_message_at")
        .eq("created_by", user.id)
        .order("last_message_at", { ascending: false })
        .limit(3);

      if (error || !data) {
        setChatrooms([]);
        setLoading(false);
        return;
      }

      const chatroomInfos: ChatroomInfo[] = await Promise.all(
        (data as ChatroomData[]).map(async (chatroom) => {
          let last_query = "";
          if (chatroom.last_message_id) {
            const { data: queryData } = await supabase
              .from("chatmessages")
              .select("query")
              .eq("id", chatroom.last_message_id)
              .single();
            last_query = queryData?.query || "";
          }
          return {
            id: chatroom.id,
            title: chatroom.title || "Untitled Chat",
            last_message_at: chatroom.last_message_at,
            last_query,
          };
        })
      );

      setChatrooms(chatroomInfos);
      setLoading(false);
    }
    fetchChatrooms();
  }, [user?.id, supabase, authLoading]);

  return { chatrooms, loading };
}

export function formatTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return `${diff} seconds ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  if (diff < 2592000)
    return `${Math.floor(diff / 604800)} week${
      Math.floor(diff / 604800) > 1 ? "s" : ""
    } ago`;
  if (diff < 31536000)
    return `${Math.floor(diff / 2592000)} month${
      Math.floor(diff / 2592000) > 1 ? "s" : ""
    } ago`;
  if (diff < 63072000) return `1 year ago`;
  return `>1 y ago`;
}
