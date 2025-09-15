import { useAuthStore } from "@/stores/authStore";

export const triggerBackgroundSearch = (messageId: string) => {
  useAuthStore
    .getState()
    .makeAuthenticatedRequest("/api/chatrooms/runSearch", {
      method: "POST",
      body: JSON.stringify({ messageId }),
    })
    .catch((error: unknown) => {
      console.error("❌ Background search failed:", error);
      // Don't show user error since this is background
    });
};

export const createChatroom = async (query: string) => {
  const userId = useAuthStore.getState().user?.id;

  const response = await useAuthStore
    .getState()
    .makeAuthenticatedRequest("/api/chatrooms/create", {
      method: "POST",
      body: JSON.stringify({ query, userId }),
    });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to create chatroom");
  }

  return {
    chatroomId: data.chatroom.id,
    messageId: data.message.id,
  };
};
