"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthStore } from "@/stores/authStore";
import { ChatMessage } from "../utils";
import { useSearchStream } from "./useStreamSearch";
import { normalizeToMarkdownResponse } from "@/lib/search/markdownParser";
import type { SearchResponse } from "@/lib/search/types";
import { toast } from "sonner";
import { mutate } from "swr";

type PartialSearchResponse = Partial<SearchResponse>;

/**
 * Robustly normalizes chatmessages.content from Supabase into:
 *   Partial<SearchResponse> | null
 *
 * Handles legacy and new formats using the centralized normalizer.
 */
function toSearchResponse(content: unknown): PartialSearchResponse | null {
  if (content == null) return null;
  return normalizeToMarkdownResponse(content);
}

function normalizeMessage(m: Record<string, unknown>): ChatMessage {
  return {
    ...m,
    content: toSearchResponse(m.content),
  } as ChatMessage;
}

export function useChatroom(chatroomId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inFlight, setInFlight] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const messagesRef = useRef<ChatMessage[]>([]);

  const { user, getSupabaseClient, makeAuthenticatedRequest } = useAuthStore();
  const { connectStream, closeStream, isConnected, getCurrentMessageId } =
    useSearchStream(setMessages);

  // Keep messagesRef in sync
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Cleanup only on real unmount (prevents killing the websocket on rerenders)
  useEffect(() => {
    return () => closeStream();
  }, [closeStream]);

  // Reconnect to stream for pending/processing messages when page becomes visible
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState !== "visible") return;

      const msgs = messagesRef.current;
      const lastMsg = msgs[msgs.length - 1];
      if (
        !lastMsg ||
        (lastMsg.status !== "pending" && lastMsg.status !== "processing")
      )
        return;

      if (!isConnected() || getCurrentMessageId() !== lastMsg.id) {
        connectStream(lastMsg.id);
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [connectStream, isConnected, getCurrentMessageId]);

  const triggerSearch = useCallback(
    async (messageId: string, universities?: string[]) => {
      if (inFlight) return;

      setInFlight(true);
      try {
        await connectStream(messageId);

        const response = await makeAuthenticatedRequest(
          "/api/chatrooms/runSearch",
          {
            method: "POST",
            body: JSON.stringify({ messageId, universities }),
          },
        );

        if (response.status === 413) {
          toast.error(
            "Your message is too long. Please shorten it and try again.",
          );
          setMessages((prev) =>
            prev.map((m) =>
              m.id === messageId
                ? { ...m, status: "failed" as const }
                : m,
            ),
          );
          return;
        }

        if (response.status === 429) {
          const data = await response.json().catch(() => ({}));
          toast.error(
            data.resetsAt
              ? `You've reached your daily limit. Try again at ${new Date(data.resetsAt).toLocaleTimeString()}.`
              : "You've reached your daily limit. Please try again later.",
          );
          setMessages((prev) =>
            prev.map((m) =>
              m.id === messageId
                ? { ...m, status: "failed" as const }
                : m,
            ),
          );
          return;
        }

        // HTTP fallback in case realtime missed the "done" event
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.response) {
            // Only update if message isn't already completed
            setMessages((prev) => {
              const msg = prev.find((m) => m.id === messageId);
              if (msg?.status !== "completed") {
                return prev.map((m) =>
                  m.id === messageId
                    ? {
                        ...m,
                        status: "completed" as const,
                        content: data.response,
                      }
                    : m,
                );
              }
              return prev;
            });
          }
        }
      } catch (err) {
        console.error("[useChatroom] triggerSearch error", err);
      } finally {
        setInFlight(false);
        mutate("/api/token-usage");
      }
    },
    [connectStream, makeAuthenticatedRequest, inFlight],
  );

  const addNewMessage = useCallback(
    async (query: string, universities?: string[]) => {
      if (!query.trim() || !chatroomId || !user || inFlight) return;

      try {
        const supabase = getSupabaseClient();
        const { data } = await supabase
          .from("chatmessages")
          .insert({
            chatroom_id: chatroomId,
            query,
            content: null, // populated later
            user_id: user.id,
            status: "pending",
          })
          .select()
          .single();

        if (!data) return;

        const newMessage = normalizeMessage(data) as ChatMessage;
        setMessages((prev) => [...prev, newMessage]);
        await triggerSearch(newMessage.id, universities);
      } catch (error) {
        console.error("[useChatroom] Send message error:", error);
      }
    },
    [chatroomId, user, getSupabaseClient, triggerSearch, inFlight],
  );

  // Retry a failed message
  const retryMessage = useCallback(
    async (messageId: string) => {
      if (inFlight) {
        console.log("[useChatroom] already in flight, can't retry");
        return;
      }

      // Reset message status to pending
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                status: "pending" as const,
                content: null,
                progress: undefined,
              }
            : m,
        ),
      );

      // Also update in database
      const supabase = getSupabaseClient();
      await supabase
        .from("chatmessages")
        .update({ status: "pending", content: null })
        .eq("id", messageId);

      // Trigger the search again
      await triggerSearch(messageId);
    },
    [inFlight, getSupabaseClient, triggerSearch],
  );

  // Edit Message: Edit and re-run a previous message
  const editMessage = useCallback(
    async (messageId: string, newQuery: string) => {
      if (inFlight) {
        console.log("[useChatroom] already in flight, can't edit");
        return;
      }
      // Update message query and reset status
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                query: newQuery,
                status: "pending" as const,
                content: null,
                progress: undefined,
              }
            : m,
        ),
      );
      // Also update in database
      const supabase = getSupabaseClient();
      await supabase
        .from("chatmessages")
        .update({ query: newQuery, status: "pending", content: null })
        .eq("id", messageId);
      // Trigger the search again
      await triggerSearch(messageId);
    },
    [inFlight, getSupabaseClient, triggerSearch],
  );

  // Load Chatroom Messages
  useEffect(() => {
    if (!chatroomId || !user) {
      setIsLoading(false);
      return;
    }

    const load = async () => {
      setIsLoading(true);
      setNotFound(false);
      try {
        const supabase = getSupabaseClient();

        const { data: chatroom, error: chatroomError } = await supabase
          .from("chatrooms")
          .select("id")
          .eq("id", chatroomId!)
          .single();

        if (chatroomError || !chatroom) {
          console.warn("[useChatroom] chatroom not found or not owned by user");
          setNotFound(true);
          return;
        }

        console.log("[useChatroom] loading messages", { chatroomId });
        const { data, error } = await supabase
          .from("chatmessages")
          .select("*")
          .eq("chatroom_id", chatroomId)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("[useChatroom] load error:", error);
          return;
        }

        const loaded = ((data ?? []) as Record<string, unknown>[]).map(
          normalizeMessage,
        );
        console.log("[useChatroom] loaded messages:", loaded.length);

        setMessages(loaded);

        // Check if any message is pending/processing and set inFlight accordingly
        const hasPending = loaded.some(
          (m) => m.status === "pending" || m.status === "processing",
        );
        if (hasPending) {
          setInFlight(true);
        }

        // If first message is pending, trigger it
        const firstMsg = loaded[0];
        if (firstMsg?.status === "pending") {
          console.log(
            "[useChatroom] first message pending -> triggerSearch",
            firstMsg.id,
          );
          triggerSearch(firstMsg.id);
        }

        // If last message is processing, reconnect stream
        const lastMsg = loaded[loaded.length - 1];
        if (lastMsg?.status === "processing") {
          console.log(
            "[useChatroom] last message processing -> reconnect stream",
            lastMsg.id,
          );
          await connectStream(lastMsg.id);
        }
      } catch (e) {
        console.error("[useChatroom] Failed to load chatroom:", e);
      } finally {
        setIsLoading(false);
      }
    };

    load();
    // Keep deps minimal to avoid rerun/teardown loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatroomId, user]); // intentionally minimal

  return {
    messages,
    isLoading,
    addNewMessage,
    retryMessage,
    editMessage,
    inFlight,
    notFound,
  };
}
