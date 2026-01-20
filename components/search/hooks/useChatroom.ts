"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthStore } from "@/stores/authStore";
import { ChatMessage } from "../types";
import { useSearchStream } from "./useStreamSearch";
import { normalizeToMarkdownResponse } from "@/lib/search/markdownParser";
import type { SearchResponse } from "@/lib/search/types";

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
  const [inFlight, setInFlight] = useState(false); // Request-in-flight lock
  const messagesRef = useRef<ChatMessage[]>([]); // Keep ref in sync for visibility handler

  const { user, getSupabaseClient, makeAuthenticatedRequest } = useAuthStore();
  const { connectStream, closeStream, isConnected, getCurrentMessageId } =
    useSearchStream(setMessages);

  // Keep messagesRef in sync
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Cleanup only on real unmount (prevents killing the websocket on rerenders)
  useEffect(() => {
    return () => {
      console.log("[useChatroom] unmount -> closeStream()");
      closeStream();
    };
  }, [closeStream]);

  // Reconnect to stream for pending/processing messages when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        console.log(
          "[useChatroom] page became visible, checking for reconnect...",
        );

        // Find last message that needs streaming
        const msgs = messagesRef.current;
        const lastMsg = msgs[msgs.length - 1];

        if (
          lastMsg &&
          (lastMsg.status === "pending" || lastMsg.status === "processing")
        ) {
          // Check if we're already connected to this message
          const currentId = getCurrentMessageId();
          const connected = isConnected();

          console.log("[useChatroom] visibility check", {
            lastMsgId: lastMsg.id,
            lastMsgStatus: lastMsg.status,
            currentId,
            connected,
          });

          if (!connected || currentId !== lastMsg.id) {
            console.log(
              "[useChatroom] reconnecting stream for message",
              lastMsg.id,
            );
            await connectStream(lastMsg.id);
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [connectStream, isConnected, getCurrentMessageId]);

  // Run AI Search for a message
  const triggerSearch = useCallback(
    async (messageId: string) => {
      if (inFlight) {
        console.log("[useChatroom] already in flight");
        return;
      }

      setInFlight(true);
      try {
        // Connect to realtime stream first
        console.log("[useChatroom] connecting stream", messageId);
        await connectStream(messageId);

        // Then trigger the search API
        console.log("[useChatroom] calling runSearch API", messageId);
        const response = await makeAuthenticatedRequest(
          "/api/chatrooms/runSearch",
          {
            method: "POST",
            body: JSON.stringify({ messageId }),
          },
        );

        // Always check HTTP response as backup
        // In case realtime missed the "done" event
        if (response.ok) {
          const data = await response.json();
          console.log("[useChatroom] HTTP response", data);

          if (data.success && data.response) {
            // Only update if message isn't already completed
            setMessages((prev) => {
              const msg = prev.find((m) => m.id === messageId);
              if (msg?.status !== "completed") {
                console.log("[useChatroom] updating from HTTP fallback");
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
      }
    },
    [connectStream, makeAuthenticatedRequest, inFlight],
  );

  // Add New Message to Chatroom
  const addNewMessage = useCallback(
    async (query: string) => {
      if (!query.trim() || !chatroomId || !user || inFlight) return;

      try {
        const supabase = getSupabaseClient();

        console.log("[useChatroom] inserting message", { chatroomId, query });
        const addRes = await supabase
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

        const addData = addRes.data;
        if (!addData) return;

        const newMessage = normalizeMessage(addData) as ChatMessage;

        setMessages((prev) => [...prev, newMessage]);

        console.log("[useChatroom] triggerSearch ->", newMessage.id);
        await triggerSearch(newMessage.id);
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

  // Load Chatroom Messages
  useEffect(() => {
    if (!chatroomId || !user) {
      setIsLoading(false);
      return;
    }

    const load = async () => {
      setIsLoading(true);
      try {
        const supabase = getSupabaseClient();

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

  return { messages, isLoading, addNewMessage, retryMessage, inFlight };
}
