import { useCallback, useMemo } from "react";
import useSWR from "swr";
import { useAuthStore } from "@/stores/authStore";

export interface ChatroomInfo {
  id: string;
  title: string;
  last_message_at: string | null;
}

export interface ChatroomData {
  id: string;
  title: string | null;
  last_message_id: string | null;
  last_message_at: string | null;
}

type UseRecentChatsOptions = {
  limit?: number;
};

export function useRecentChats(options: UseRecentChatsOptions = {}) {
  const user = useAuthStore((state) => state.user);
  const getSupabaseClient = useAuthStore((state) => state.getSupabaseClient);
  const supabase = useMemo(() => getSupabaseClient(), [getSupabaseClient]);

  const swrKey = user?.id ? ["chatrooms", user.id, options.limit] : null;

  const fetchChatrooms = useCallback(async (): Promise<ChatroomInfo[]> => {
    if (!user?.id) return [];

    let q = supabase
      .from("chatrooms")
      .select("id, title, last_message_id, last_message_at")
      .eq("created_by", user.id)
      .order("last_message_at", { ascending: false, nullsFirst: false });

    if (typeof options.limit === "number") q = q.limit(options.limit);

    const { data, error } = await q;
    if (error || !data) return [];

    const rooms = data as ChatroomData[];

    return rooms.map((room) => ({
      id: room.id,
      title: room.title || "Untitled Chat",
      last_message_at: room.last_message_at ?? null,
    }));
  }, [options.limit, supabase, user?.id]);

  const {
    data: chatrooms = [],
    isLoading: loading,
    mutate,
  } = useSWR(swrKey, fetchChatrooms, {
    revalidateOnFocus: false,
  });

  const refetch = useCallback(() => {
    mutate();
  }, [mutate]);

  const renameChatroom = useCallback(
    async (chatroomId: string, title: string) => {
      if (!user?.id) return { ok: false as const, error: "Not logged in" };

      const trimmed = title.trim();
      if (!trimmed) return { ok: false as const, error: "Title required" };

      // optimistic update
      mutate(
        (prev) =>
          prev?.map((c) =>
            c.id === chatroomId ? { ...c, title: trimmed } : c
          ),
        { revalidate: false }
      );

      const { error } = await supabase
        .from("chatrooms")
        .update({ title: trimmed })
        .eq("id", chatroomId)
        .eq("created_by", user.id);

      if (error) {
        mutate(); // rollback
        return { ok: false as const, error: error.message };
      }

      return { ok: true as const };
    },
    [mutate, supabase, user?.id]
  );

  const deleteChatroom = useCallback(
    async (chatroomId: string) => {
      if (!user?.id) return { ok: false as const, error: "Not logged in" };

      // optimistic update
      mutate((prev) => prev?.filter((c) => c.id !== chatroomId), {
        revalidate: false,
      });

      const { error } = await supabase
        .from("chatrooms")
        .delete()
        .eq("id", chatroomId)
        .eq("created_by", user.id);

      if (error) {
        mutate(); // rollback
        return { ok: false as const, error: error.message };
      }

      return { ok: true as const };
    },
    [mutate, supabase, user?.id]
  );

  return {
    chatrooms,
    loading,
    refetch,
    renameChatroom,
    deleteChatroom,
  };
}
