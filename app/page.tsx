"use client";
import Sidebar from "@/components/Sidebar";
import HeroSection from "@/components/home/HeroSection";
import PeopleSection from "@/components/home/PeopleSection";
import React, { useState } from "react";
import AnimatedParticles from "@/components/AnimatedParticles";
import SearchSection from "@/components/home/SearchSection";
import { useRouter } from "next/navigation";
import { useSuggestedProfiles } from "@/components/home/hooks/useSuggestedProfiles";
import {
  createChatroom,
  triggerBackgroundSearch,
} from "@/lib/chatrooms/chatroomUtils";
import { toast } from "sonner";

const SUGGESTED_QUERIES = [
  "Who here loves generative art?",
  "Anyone building with Rust?",
  "Looking for a climate tech founder?",
  "Who can help with growth hacking?",
  "Any experts in retrieval models?",
  "Who's passionate about community building?",
  "Seeking AI musicians for a collab!",
  "Who's prototyping with LLMs?",
  "Any creative coders around?",
  "Who's into design systems?",
];

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
    } finally {
      setCreatingChatroom(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white relative overflow-hidden">
      <div className="flex relative z-10">
        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

        <main className="flex-1 relative w-full">
          <div
            className="min-h-screen overflow-y-auto overflow-x-hidden px-4 md:px-6 w-full"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255,255,255,0.3) transparent",
            }}
          >
            <div className="w-full max-w-none">
              <AnimatedParticles />
              <HeroSection />
              <SearchSection
                query={query}
                setQuery={setQuery}
                suggestedQueries={SUGGESTED_QUERIES}
                onSearch={handleSearch}
                creatingChatroom={creatingChatroom}
              />

              {/* Profiles Section */}
              <PeopleSection
                profiles={profiles}
                isLoading={profilesLoading}
                error={profilesError}
                onRetry={retryProfiles}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
