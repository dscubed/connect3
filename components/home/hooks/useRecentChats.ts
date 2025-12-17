import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/stores/authStore";

export interface ChatroomInfo {
  id: string;
  title: string;
  last_message_at: string | null;
  last_query: string;
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
  const authLoading = useAuthStore((state) => state.loading);
  const getSupabaseClient = useAuthStore((state) => state.getSupabaseClient);
  const supabase = useMemo(() => getSupabaseClient(), [getSupabaseClient]);

  const [chatrooms, setChatrooms] = useState<ChatroomInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);

    let q = supabase
      .from("chatrooms")
      .select("id, title, last_message_id, last_message_at")
      .eq("created_by", user.id)
      // SQL ordering (PostgREST order by)
      .order("last_message_at", { ascending: false, nullsFirst: false });

    if (typeof options.limit === "number") q = q.limit(options.limit);

    const { data, error } = await q;

    if (error || !data) {
      setChatrooms([]);
      setLoading(false);
      return;
    }

    const rooms = data as ChatroomData[];

    // Batch fetch last queries (avoid N+1 queries)
    const lastIds = rooms
      .map((r) => r.last_message_id)
      .filter((id): id is string => Boolean(id));

    const idToQuery = new Map<string, string>();

    if (lastIds.length > 0) {
      const { data: msgData } = await supabase
        .from("chatmessages")
        .select("id, query")
        .in("id", lastIds);

      if (msgData) {
        for (const m of msgData as { id: string; query: string | null }[]) {
          idToQuery.set(m.id, m.query ?? "");
        }
      }
    }

    const chatroomInfos: ChatroomInfo[] = rooms.map((room) => ({
      id: room.id,
      title: room.title || "Untitled Chat",
      last_message_at: room.last_message_at ?? null,
      last_query: room.last_message_id
        ? idToQuery.get(room.last_message_id) ?? ""
        : "",
    }));

    setChatrooms(chatroomInfos);
    setLoading(false);
  }, [options.limit, supabase, user?.id]);

  useEffect(() => {
    if (authLoading) return;

    if (!user?.id) {
      setChatrooms([]);
      setLoading(false);
      return;
    }

    refetch();
  }, [user?.id, authLoading, refetch]);

  const renameChatroom = useCallback(
    async (chatroomId: string, title: string) => {
      if (!user?.id) return { ok: false as const, error: "Not logged in" };

      const trimmed = title.trim();
      if (!trimmed) return { ok: false as const, error: "Title required" };

      const { error } = await supabase
        .from("chatrooms")
        .update({ title: trimmed })
        .eq("id", chatroomId)
        .eq("created_by", user.id);

      if (error) return { ok: false as const, error: error.message };

      // optimistic update
      setChatrooms((prev) =>
        prev.map((c) => (c.id === chatroomId ? { ...c, title: trimmed } : c))
      );

      return { ok: true as const };
    },
    [supabase, user?.id]
  );

  const deleteChatroom = useCallback(
    async (chatroomId: string) => {
      if (!user?.id) return { ok: false as const, error: "Not logged in" };

      const { error } = await supabase
        .from("chatrooms")
        .delete()
        .eq("id", chatroomId)
        .eq("created_by", user.id);

      if (error) return { ok: false as const, error: error.message };

      // optimistic update
      setChatrooms((prev) => prev.filter((c) => c.id !== chatroomId));

      return { ok: true as const };
    },
    [supabase, user?.id]
  );

  return { chatrooms, loading, refetch, renameChatroom, deleteChatroom };
}
