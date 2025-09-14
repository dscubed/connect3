"use client";
import { useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";

interface ChatMessage {
  id: string;
  query: string;
  chatroom_id: string;
  content: Record<string, unknown> | null;
  created_at: string;
  user_id: string;
  status: "pending" | "processing" | "completed" | "failed";
}

interface UseChatroomDataProps {
  onMessagesLoaded: (messages: ChatMessage[]) => void;
  onLoadingChange: (isLoading: boolean) => void;
  subscribeToChatroom: (chatroomId: string) => void;
}

export function useChatroomData({
  onMessagesLoaded,
  onLoadingChange,
  subscribeToChatroom,
}: UseChatroomDataProps) {
  // Load chatroom data with real-time subscription
  const loadChatroomData = useCallback(
    async (chatroomId: string): Promise<boolean> => {
      try {
        console.log("🔍 Loading chatroom data for:", chatroomId);

        const response = await useAuthStore
          .getState()
          .makeAuthenticatedRequest(
            `/api/chatrooms/getMessages?chatroomId=${chatroomId}`
          );
        const data = await response.json();

        if (!data.success) {
          console.error("❌ Failed to load chatroom:", data.error);
          return false;
        }

        const { chatroom, messages } = data;
        console.log(
          `✅ Loaded ${messages.length} messages from chatroom ${chatroom.id}`
        );

        // Store all messages
        onMessagesLoaded(messages);

        // Subscribe to real-time updates for this chatroom
        subscribeToChatroom(chatroomId);

        if (messages.length > 0) {
          // Check the latest message status
          const latestMessage = messages[messages.length - 1];

          switch (latestMessage.status) {
            case "completed":
            case "failed":
              console.log(`✅ Latest message status: ${latestMessage.status}`);
              onLoadingChange(false);
              break;

            case "pending":
            case "processing":
              console.log(
                `⏳ Search status: ${latestMessage.status}, waiting for real-time updates...`
              );
              onLoadingChange(true);
              break;
          }

          return true;
        } else {
          console.log("⚠️ No messages found in chatroom");
          onLoadingChange(false);
          return false;
        }
      } catch (error) {
        console.error("❌ Error loading chatroom data:", error);
        onLoadingChange(false);
        return false;
      }
    },
    [onMessagesLoaded, onLoadingChange, subscribeToChatroom]
  );

  return {
    loadChatroomData,
  };
}
