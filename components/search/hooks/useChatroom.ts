"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import { ChatMessage } from "../types";
import { useSearchStream } from "./useStreamSearch";
import { EntityFilterOptions } from "@/components/home/hooks/useSearch";

export function useChatroom(chatroomId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { user, getSupabaseClient } = useAuthStore();
  const { connectStream, closeStream } = useSearchStream(setMessages);

  // For testing: log message progress updates
  useEffect(() => {
    console.log("Chatroom Messages :", messages);
  }, [messages]);

  // Run AI Search for a message
  const triggerSearch = useCallback(
    (messageId: string) => {
      // Just connect to the stream - all handling is in useSearchStream
      connectStream(messageId);
    },
    [connectStream]
  );

  // Add New Message from Chatroom
  const addNewMessage = useCallback(
    async (query: string, selectedEntityFilters: EntityFilterOptions) => {
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
            users: selectedEntityFilters.users,
            organisations: selectedEntityFilters.organisations,
            // events: selectedEntityFilters.events, TODO: Once finished
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
    // Cleanup on unmount
    return () => {
      closeStream();
    };
  }, [chatroomId, user, getSupabaseClient, triggerSearch, closeStream]);

  return { messages, isLoading, addNewMessage };
}
