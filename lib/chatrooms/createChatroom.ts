import { SearchResult } from "../vector-store/queryVectorStoreUtils";

export interface ChatMessage {
  id: string;
  query: string;
  content: SearchResult | null;
  created_at: string;
}

export interface Chatroom {
  id: string;
  title: string;
  created_at: string;
}

export interface CreateChatroomResponse {
  success: boolean;
  chatroom: Chatroom;
  message: ChatMessage;
  searchError?: string;
}

export async function createChatroomWithQuery(
  query: string,
  userId: string
): Promise<CreateChatroomResponse | null> {
  try {
    console.log("🚀 Creating chatroom with query:", query);

    const response = await fetch("/api/chatrooms/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, userId }),
    });

    const data = await response.json();

    if (data.success) {
      console.log("✅ Chatroom created successfully");
      return data;
    }

    console.error("❌ Failed to create chatroom:", data.error);
    return null;
  } catch (error) {
    console.error("❌ Error creating chatroom:", error);
    return null;
  }
}
