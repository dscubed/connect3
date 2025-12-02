"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import { CubeLoader } from "@/components/ui/CubeLoader";
import MessageList from "@/components/search/Messages/MessageList";
import SearchInput from "@/components/search/SearchInput";
import ShareButton from "@/components/search/ShareButton";
import { UserProfile } from "@/components/search/UserProfile/UserProfile";
import { useAuthStore } from "@/stores/authStore";
import { ChunkData } from "@/components/profile/chunks/ChunkUtils";
import { useChatroom } from "@/components/search/hooks/useChatroom";

export default function SearchPageContent() {
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const { makeAuthenticatedRequest } = useAuthStore();

  const searchParams = useSearchParams();
  const chatroomId = mounted ? searchParams?.get("chatroom") || null : null;
  const { messages, addNewMessage } = useChatroom(chatroomId);

  // Handler for message thread users
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

  // Ensure component is mounted (for Next.js SSR)
  useEffect(() => {
    setMounted(true);
  }, []);

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
            {messages.length > 0 && (
              <div className="w-full max-w-none">
                <MessageList
                  messages={messages}
                  onUserClick={handleMessageUserClick}
                />
              </div>
            )}
          </div>

          {/* Fixed search bar at bottom */}
          <div className="w-full px-4">
            <SearchInput onSearch={addNewMessage} chatroomId={chatroomId} />
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
