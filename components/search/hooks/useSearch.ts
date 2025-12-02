"use client";
import { useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import { ChatMessage } from "../types";

interface UseSearchProps {
  chatroomId: string | null;
  user: { id: string } | null;
  // These are now required to update the UI directly
  onMessageAdded: (newMessage: ChatMessage) => void;
  onMessageUpdated: (updatedMessage: ChatMessage) => void;
}

export function useSearch({
  chatroomId,
  user,
  onMessageAdded,
  onMessageUpdated,
}: UseSearchProps) {
  const handleNewSearch = useCallback(
    async (searchQuery: string): Promise<void> => {
      if (!searchQuery.trim() || !chatroomId) return;

      try {
        const userId = user?.id;

        // 1. Create the message (Pending state)
        const addResponse = await useAuthStore
          .getState()
          .makeAuthenticatedRequest("/api/chatrooms/addMessage", {
            method: "POST",
            body: JSON.stringify({
              chatroomId: chatroomId,
              query: searchQuery,
              userId: userId,
            }),
          });

        const addData = await addResponse.json();

        if (!addData.success) {
          console.error("❌ Failed to add message:", addData.error);
          return;
        }

        // ✅ Update UI immediately (Pending)
        onMessageAdded(addData.message);

        // 2. Run the Search (Awaited)
        // This keeps the connection open until the AI finishes
        const searchResponse = await useAuthStore
          .getState()
          .makeAuthenticatedRequest("/api/chatrooms/runSearch", {
            method: "POST",
            body: JSON.stringify({ messageId: addData.message.id }),
          });

        const searchData = await searchResponse.json();

        if (searchData.success) {
          // ✅ Update UI with the result (Completed)
          onMessageUpdated(searchData.message);
        } else {
          console.error("❌ Search failed:", searchData.error);
          // Update UI to failed state
          onMessageUpdated({
            ...addData.message,
            status: "failed",
          });
        }
      } catch (error) {
        console.error("❌ Error in search flow:", error);
      }
    },
    [chatroomId, user, onMessageAdded, onMessageUpdated]
  );

  return {
    handleNewSearch,
  };
}
