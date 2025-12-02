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
}

export function useChatroomData({
  onMessagesLoaded,
  onLoadingChange,
}: UseChatroomDataProps) {
  const loadChatroomData = useCallback(
    async (chatroomId: string): Promise<boolean> => {
      try {
        onLoadingChange(true);
        console.log("🔍 Loading chatroom data for:", chatroomId);

        const response = await useAuthStore
          .getState()
          .makeAuthenticatedRequest(
            `/api/chatrooms/getMessages?chatroomId=${chatroomId}`
          );
        const data = await response.json();

        if (!data.success) {
          console.error("❌ Failed to load chatroom:", data.error);
          onLoadingChange(false);
          return false;
        }

        const { messages } = data;

        // Store all messages
        onMessagesLoaded(messages);
        onLoadingChange(false);

        return true;
      } catch (error) {
        console.error("❌ Error loading chatroom data:", error);
        onLoadingChange(false);
        return false;
      }
    },
    [onMessagesLoaded, onLoadingChange]
  );

  return {
    loadChatroomData,
  };
}
