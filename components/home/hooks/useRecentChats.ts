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
