"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import { ChatMessage } from "../types";

export function useChatroom(chatroomId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { user, makeAuthenticatedRequest } = useAuthStore();

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
        // Add message and update state to pending
        const addRes = await makeAuthenticatedRequest(
          "/api/chatrooms/addMessage",
          {
            method: "POST",
            body: JSON.stringify({ chatroomId, query, userId: user.id }),
          }
        );
        const addData = await addRes.json();

        if (!addData.success) return;

        const newMessage = addData.message;
        setMessages((prev) => [...prev, newMessage]);

        // Trigger AI Search
        await triggerSearch(newMessage.id);
      } catch (error) {
        console.error("Send message error:", error);
      }
    },
    [chatroomId, user, makeAuthenticatedRequest, triggerSearch]
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
        const res = await makeAuthenticatedRequest(
          `/api/chatrooms/getMessages?chatroomId=${chatroomId}`
        );
        const data = await res.json();

        if (data.success) {
          const loadedMessages = data.messages as ChatMessage[];
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
  }, [chatroomId, user, makeAuthenticatedRequest, triggerSearch]);

  return { messages, isLoading, addNewMessage };
}
