"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import { ChatMessage } from "../types";
import { useSearchStream } from "./useStreamSearch";

// If you have a central SearchResponse type, import it.
// Otherwise this local type matches your backend shape.
type SearchResponse = {
  summary: string;
  results: any[];
  followUps: string;
};

type PartialSearchResponse = Partial<SearchResponse>;

/**
 * Robustly normalizes chatmessages.content from Supabase into:
 *   Partial<SearchResponse> | null
 *
 * Handles these persisted formats:
 *  1) {"summary":"...","results":[],"followUps":""}
 *  2) {"result":{"summary":"...","results":[],"followUps":""}}
 *  3) "\"{\\\"result\\\":{...}}\""   (double-stringified)
 *  4) {"result":"{\"summary\":\"...\"}"} (result is stringified JSON)
 *  5) Plain text string (fallback => {summary:text, results:[], followUps:""})
 */
function toSearchResponse(content: unknown): PartialSearchResponse | null {
  if (content == null) return null;

  // Already an object (e.g., from stream in-memory)
  if (typeof content === "object") {
    const obj: any = content;
    const unwrapped = obj?.result ?? obj;
    if (unwrapped && typeof unwrapped === "object") return unwrapped;
    return null;
  }

  if (typeof content !== "string") return null;

  let s = content.trim();
  if (!s) return null;

  // Try up to 2 parses to handle double-stringified JSON
  for (let i = 0; i < 2; i++) {
    try {
      const parsed: any = JSON.parse(s);

      // If parsed becomes a string, it was double-stringified; loop again
      if (typeof parsed === "string") {
        s = parsed.trim();
        continue;
      }

      if (parsed && typeof parsed === "object") {
        let unwrapped: any = parsed?.result ?? parsed;

        // If result itself is a JSON string, parse it
        if (typeof unwrapped === "string") {
          try {
            unwrapped = JSON.parse(unwrapped);
          } catch {
            return { summary: unwrapped, results: [], followUps: "" };
          }
        }

        if (unwrapped && typeof unwrapped === "object") return unwrapped;
      }

      return null;
    } catch {
      // Not JSON => treat as plain text
      return { summary: s, results: [], followUps: "" };
    }
  }

  // Fallback
  return { summary: s, results: [], followUps: "" };
}

function normalizeMessage(m: any): any {
  return {
    ...m,
    content: toSearchResponse(m.content),
  };
}

export function useChatroom(chatroomId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inFlight, setInFlight] = useState(false); // Request-in-flight lock

  const { user, getSupabaseClient, makeAuthenticatedRequest } = useAuthStore();
  const { connectStream, closeStream } = useSearchStream(setMessages);

  // Cleanup only on real unmount (prevents killing the websocket on rerenders)
  useEffect(() => {
    return () => {
      console.log("[useChatroom] unmount -> closeStream()");
      closeStream();
    };
  }, [closeStream]);

  // Run AI Search for a message
  const triggerSearch = useCallback(
    async (messageId: string) => {
      if (inFlight) {
        console.log("[useChatroom] Search already in flight, ignoring request");
        return;
      }

      setInFlight(true);
      try {
        console.log("[useChatroom] connectStream ->", messageId);
        await connectStream(messageId);

        console.log("[useChatroom] POST /api/chatrooms/runSearch ->", messageId);
        await makeAuthenticatedRequest("/api/chatrooms/runSearch", {
          method: "POST",
          body: JSON.stringify({ messageId }),
        });
      } finally {
        setInFlight(false);
      }
    },
    [connectStream, makeAuthenticatedRequest, inFlight]
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
    [chatroomId, user, getSupabaseClient, triggerSearch, inFlight]
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

        const loaded = ((data ?? []) as any[]).map(normalizeMessage) as ChatMessage[];
        console.log("[useChatroom] loaded messages:", loaded.length);

        setMessages(loaded);

        // If first message is pending, trigger it
        const firstMsg = loaded[0];
        if (firstMsg?.status === "pending") {
          console.log("[useChatroom] first message pending -> triggerSearch", firstMsg.id);
          triggerSearch(firstMsg.id);
        }

        // If last message is processing, reconnect stream
        const lastMsg = loaded[loaded.length - 1];
        if (lastMsg?.status === "processing") {
          console.log("[useChatroom] last message processing -> reconnect stream", lastMsg.id);
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
  }, [chatroomId, user]); // intentionally minimal

  return { messages, isLoading, addNewMessage, inFlight };
}
