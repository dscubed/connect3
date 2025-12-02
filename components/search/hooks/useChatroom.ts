"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import { ChatMessage } from "../types";

export function useChatroom(chatroomId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { user, makeAuthenticatedRequest, getSupabaseClient } = useAuthStore();

  // Run AI Search for a message
  const triggerSearch = useCallback(
    async (messageId: string) => {
      try {
        const res = await makeAuthenticatedRequest("/api/chatrooms/runSearch", {
          method: "POST",
          body: JSON.stringify({ messageId }),
        });
        const data = await res.json();

        // Update state with result
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? data.success
                ? data.message
                : { ...msg, status: "failed" }
              : msg
          )
        );
      } catch (error) {
        console.error("Search error:", error);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, status: "failed" } : msg
          )
        );
      }
    },
    [makeAuthenticatedRequest]
  );

  // Add New Message from Chatroom
  const addNewMessage = useCallback(
    async (query: string) => {
      if (!query.trim() || !chatroomId || !user) return;

      try {
        // Add message to supabase
        const supabase = getSupabaseClient();
        const addRes = await supabase
          .from("chatmessages")
          .insert({
            chatroom_id: chatroomId,
            query: query,
            content: null, // Will be populated by background search
            user_id: user.id,
            status: "pending", // Initial status
          })
          .select()
          .single();
        const addData = addRes.data;

        if (!addData) return;

        // Update local state
        const newMessage = addData as ChatMessage;
        setMessages((prev) => [...prev, newMessage]);

        // Trigger AI Search
        await triggerSearch(newMessage.id);
      } catch (error) {
        console.error("Send message error:", error);
      }
    },
    [chatroomId, user, getSupabaseClient, triggerSearch]
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

        const { data: messages, error } = await supabase
          .from("chatmessages")
          .select("*")
          .eq("chatroom_id", chatroomId)
          .order("created_at", { ascending: true });

        if (!error && messages) {
          const loadedMessages = messages as ChatMessage[];
          setMessages(loadedMessages);

          // Check first message for pending status (Fresh from Home Page)
          const firstMsg = loadedMessages[0];
          if (firstMsg?.status === "pending") {
            triggerSearch(firstMsg.id);
          }
        }
      } catch (e) {
        console.error("Failed to load chatroom:", e);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [chatroomId, user, getSupabaseClient, triggerSearch]);

  return { messages, isLoading, addNewMessage };
}
