"use client";
import Sidebar from "@/components/Sidebar";
import HeroSection from "@/components/home/HeroSection";
import React, { useState } from "react";
import AnimatedParticles from "@/components/AnimatedParticles";
import { useRouter } from "next/navigation";
import { useSuggestedProfiles } from "@/components/home/hooks/useSuggestedProfiles";
import {
  createChatroom,
  triggerBackgroundSearch,
} from "@/lib/chatrooms/chatroomUtils";
import { toast } from "sonner";
import QuickInfoSection from "@/components/home/QuickInfoSection";
import { SearchBar } from "@/components/home/SearchBar";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [creatingChatroom, setCreatingChatroom] = useState(false);
  const router = useRouter();

  // Fetch suggested profiles
  const {
    profiles,
    loading: profilesLoading,
    error: profilesError,
    refetch: retryProfiles,
  } = useSuggestedProfiles();

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query.");
      return;
    }

    setCreatingChatroom(true);
    try {
      console.log("🚀 Creating chatroom for query:", searchQuery);

      const { chatroomId, messageId } = await createChatroom(searchQuery);

      // Navigate immediately
      router.push(`/search?chatroom=${chatroomId}`);

      // Trigger background search (fire and forget)
      triggerBackgroundSearch(messageId);
    } catch (error) {
      console.error("❌ Error creating chatroom:", error);
      toast.error("Failed to create chatroom. Please try again.");
      setCreatingChatroom(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white relative overflow-hidden">
      <div className="flex relative z-10">
        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

        <main className="flex-1 relative w-full">
          <div
            className="flex flex-col h-screen overflow-y-auto overflow-x-hidden px-4 md:px-6 w-full"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255,255,255,0.3) transparent",
            }}
          >
            <AnimatedParticles />

            {/* Top Section */}
            <div className="flex-[1] flex flex-col items-center justify-end w-full">
              <HeroSection />
              <SearchBar
                query={query}
                setQuery={setQuery}
                onSubmit={handleSearch}
                placeholder="Search by skills, vibes, or ideas (e.g. 'Ex amazon intern')…"
                disabled={creatingChatroom}
              />
            </div>

            {/* Bottom Section */}
            <div className="flex-[1] flex flex-col items-start w-full justify-end mb-12">
              <QuickInfoSection />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
