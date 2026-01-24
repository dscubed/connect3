"use client";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/sidebar/Sidebar";
import { CubeLoader } from "@/components/ui/CubeLoader";
import { MessageList } from "@/components/search/Messages/MessageList";
import { ProfileSheet } from "@/components/search/ProfileSheet";
import { useChatroom } from "@/components/search/hooks/useChatroom";
import { ChatRoomSearchBar } from "@/components/search/ChatroomSearchBar";
import { EntityResult } from "@/lib/search/types";

export default function SearchPageContent() {
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);

  const searchParams = useSearchParams();
  const chatroomId = mounted ? searchParams?.get("chatroom") || null : null;
  const { messages, addNewMessage, inFlight, retryMessage, editMessage } =
    useChatroom(chatroomId);

  const handleProfileClick = useCallback((entity: EntityResult) => {
    // Skipping events for now
    if (entity.type === "events") return;
    setSelectedProfileId(entity.id);
    setProfileSheetOpen(true);
  }, []);

  // Ensure component is mounted (for Next.js SSR)
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CubeLoader size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      <div className="flex relative z-10 w-full">
        <Sidebar
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
          chatroomId={chatroomId || undefined}
        />

        <main className="flex-1 min-w-0 pt-16 md:pt-12 relative flex flex-col items-center h-screen">
          {/* Scrollable content area */}
          <div
            className="flex-1 overflow-y-auto px-4 pb-36 w-full"
            style={{
              paddingBottom: "140px",
              scrollbarWidth: "thin",
            }}
          >
            {/* All Messages Thread */}
            {messages.length > 0 && (
              <div className="w-full">
                <MessageList
                  messages={messages}
                  onRetry={retryMessage}
                  onEdit={editMessage}
                  onProfileClick={handleProfileClick}
                />
              </div>
            )}
          </div>

          {/* Fixed search bar at bottom */}
          <div className="w-full px-4 absolute bottom-0">
            <div className="bg-white h-full pb-4">
              <ChatRoomSearchBar
                chatroomId={chatroomId}
                addNewMessage={addNewMessage}
                inFlight={inFlight}
              />
            </div>
          </div>
        </main>
      </div>

      {/* ProfileSheet for viewing detailed user profiles */}
      <ProfileSheet
        profileId={selectedProfileId}
        isOpen={profileSheetOpen}
        onClose={() => setProfileSheetOpen(false)}
      />
    </div>
  );
}
