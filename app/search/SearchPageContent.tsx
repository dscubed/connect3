"use client";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import { CubeLoader } from "@/components/ui/CubeLoader";
import MessageList from "@/components/search/Messages/MessageList";
import SearchInput from "@/components/search/SearchInput";
import ShareButton from "@/components/search/ShareButton";
import { UserProfile } from "@/components/search/UserProfile/UserProfile";
import { useAuthStore } from "@/stores/authStore";
import { useRealtimeSubscription } from "@/components/search/hooks/useRealtimeSubscription";
import { useChatroomData } from "@/components/search/hooks/useChatroomData";
import { useSearch } from "@/components/search/hooks/useSearch";
import { ChunkData } from "@/components/profile/chunks/ChunkUtils";

interface MessageContent {
  result: string;
  matches: {
    user_id: string;
    full_name: string;
    files: { file_id: string; description: string }[];
  }[];
  followUps: string;
}

interface ChatMessage {
  id: string;
  query: string;
  chatroom_id: string;
  content: MessageContent | null;
  created_at: string;
  user_id: string;
  status: "pending" | "processing" | "completed" | "failed";
}

export default function SearchPageContent() {
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  //   const [isLoading, setIsLoading] = useState(true);
  const [, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    name: string;
    status?: string;
    location?: string;
    tldr?: string;
    avatar?: string;
    chunks?: ChunkData[];
    chunkLoading?: boolean;
  } | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [chatroomId, setChatroomId] = useState<string | null>(null);
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([]);

  const {
    user,
    loading: isAuthLoading,
    makeAuthenticatedRequest,
  } = useAuthStore();
  const searchParams = useSearchParams();
  const chatroomParam = mounted ? searchParams?.get("chatroom") || "" : "";

  // Handler for message thread users (enhanced format)
  const handleMessageUserClick = (user: {
    id: string;
    name: string;
    status?: string;
    location?: string;
    tldr?: string;
    avatar?: string;
  }) => {
    setSelectedUser({ ...user, chunkLoading: true, chunks: [] });
    setProfileOpen(true);
  };

  // Fetch chunks when selectedUser changes
  useEffect(() => {
    const fetchChunks = async () => {
      if (!selectedUser?.id) return;
      try {
        const res = await makeAuthenticatedRequest(
          `/api/chatrooms/getChunks?userId=${selectedUser.id}`
        );
        if (!res.ok) throw new Error("Failed to fetch chunks");
        const data = await res.json();
        const chunks: ChunkData[] = data.chunks || [];

        setSelectedUser((prev) =>
          prev ? { ...prev, chunks: chunks, chunkLoading: false } : prev
        );
      } catch (err) {
        console.error("Error fetching user chunks:", err);
        setSelectedUser((prev) =>
          prev ? { ...prev, chunks: [], chunkLoading: false } : prev
        );
      }
    };
    if (selectedUser?.chunkLoading) {
      fetchChunks();
    }
  }, [selectedUser?.id, selectedUser?.chunkLoading, makeAuthenticatedRequest]);

  // Custom hooks for cleaner logic separation
  const { subscribeToChatroom, unsubscribe } = useRealtimeSubscription({
    onMessageUpdate: useCallback((updatedMessage) => {
      setAllMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === updatedMessage.id
            ? { ...msg, ...(updatedMessage as ChatMessage) }
            : msg
        )
      );
    }, []),
    onNewMessage: useCallback((newMessage) => {
      setAllMessages((prevMessages) => [
        ...prevMessages,
        newMessage as ChatMessage,
      ]);
    }, []),
    onLoadingChange: setIsLoading,
  });

  const { loadChatroomData } = useChatroomData({
    onMessagesLoaded: useCallback((messages) => {
      setAllMessages(messages as ChatMessage[]);
    }, []),
    onLoadingChange: setIsLoading,
    subscribeToChatroom,
  });

  const { handleNewSearch } = useSearch({
    chatroomId,
    user,
  });

  // Ensure component is mounted (for Next.js SSR)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Main effect to handle URL parameters
  useEffect(() => {
    if (!mounted) return; // Wait until mounted to avoid SSR issues

    const initializeSearch = async () => {
      // Wait for auth to finish loading
      if (isAuthLoading) {
        console.log("⏳ Auth still loading...");
        return;
      }

      // Check if user exists after loading is done
      if (!user) {
        console.log("❌ No user found after auth loaded");
        setIsLoading(false);
        return;
      }

      console.log("✅ User authenticated:", user.id);

      if (chatroomParam) {
        console.log("📂 Using chatroom-based search:", chatroomParam);
        setChatroomId(chatroomParam);
        await loadChatroomData(chatroomParam);
      } else {
        console.log("❌ No chatroom parameter provided");
        setIsLoading(false);
      }
    };

    initializeSearch();

    // Cleanup subscription on unmount or when chatroom changes
    return () => {
      unsubscribe();
    };
  }, [
    mounted,
    chatroomParam,
    user,
    isAuthLoading,
    loadChatroomData,
    unsubscribe,
  ]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0B0B0C] text-white flex items-center justify-center">
        <CubeLoader size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0B0B0C] text-white relative overflow-hidden">
      <div className="flex relative z-10 w-full">
        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

        <main className="flex-1 min-w-0 pt-16 md:pt-0 relative flex flex-col h-screen">
          {/* Share button */}
          <ShareButton chatroomId={chatroomId} />

          {/* Scrollable content area */}
          <div
            className="flex-1 overflow-y-auto px-4 pb-30 w-full"
            style={{
              maxHeight: "calc(100vh)",
              paddingBottom: "140px",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255,255,255,0.3) transparent",
            }}
          >
            {/* All Messages Thread */}
            {allMessages.length > 0 && (
              <div className="w-full max-w-none">
                <MessageList
                  messages={allMessages}
                  onUserClick={handleMessageUserClick}
                />
              </div>
            )}
          </div>

          {/* Fixed search bar at bottom */}
          <div className="w-full px-4">
            <SearchInput onSearch={handleNewSearch} chatroomId={chatroomId} />
          </div>
        </main>
      </div>

      {/* UserProfile modal for viewing detailed user profiles */}
      <UserProfile
        user={selectedUser}
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </div>
  );
}
