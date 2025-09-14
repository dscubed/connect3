"use client";
import { useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";

interface UseSearchProps {
  chatroomId: string | null;
  user: { id: string } | null;
}

export function useSearch({ chatroomId, user }: UseSearchProps) {
  // Handle new search from the bottom search bar
  const handleNewSearch = useCallback(
    async (searchQuery: string): Promise<void> => {
      if (!searchQuery.trim()) return;

      if (!chatroomId) {
        console.log("🚀 ERROR: No chatroom, cannot add message");
        return;
      }

      // Add new message to existing chatroom
      try {
        console.log("💬 Adding new message to chatroom:", chatroomId);

        const userId = user?.id;

        const response = await useAuthStore
          .getState()
          .makeAuthenticatedRequest("/api/chatrooms/addMessage", {
            method: "POST",
            body: JSON.stringify({
              chatroomId: chatroomId,
              query: searchQuery,
              userId: userId,
            }),
          });

        const data = await response.json();

        if (data.success) {
          console.log(
            "✅ New message added (will receive real-time updates):",
            data.message.id
          );
          // Real-time subscription will handle the update!
        } else {
          console.error("❌ Failed to add message:", data.error);
        }
      } catch (error) {
        console.error("❌ Error adding message:", error);
      }
    },
    [chatroomId, user]
  );

  return {
    handleNewSearch,
  };
}
