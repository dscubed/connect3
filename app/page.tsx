"use client";
import Sidebar from "@/components/Sidebar";
import HeroSection from "@/components/home/HeroSection";
import PeopleSection from "@/components/home/PeopleSection";
import React, { useState } from "react";
import AnimatedParticles from "@/components/AnimatedParticles";
import SearchSection from "@/components/home/SearchSection";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

// --- Demo data (replace with your API results) ---
const SAMPLE_PEOPLE = [
  {
    id: "1",
    name: "Ava Patel",
    role: "AI researcher → creative coder",
    avatar: "https://i.pravatar.cc/120?img=1",
    tags: ["foundation models", "music", "gen art"],
    blurb:
      "Prototyping LLM-driven synths. Looking for a frontend partner who vibes with audio UX.",
  },
  {
    id: "2",
    name: "Noah Kim",
    role: "Product designer",
    avatar: "https://i.pravatar.cc/120?img=3",
    tags: ["design systems", "ai tooling", "prototyping"],
    blurb:
      "Designing interfaces for AI copilots. Love motion, micro-interactions, and clarity.",
  },
  {
    id: "3",
    name: "Maya López",
    role: "Founder, climate tech",
    avatar: "https://i.pravatar.cc/120?img=10",
    tags: ["sustainability", "nlp", "policy"],
    blurb:
      "Using NLP to summarize impact reports. Seeking civic partners + data folks.",
  },
  {
    id: "4",
    name: "Leo Zhang",
    role: "Full‑stack + infra",
    avatar: "https://i.pravatar.cc/120?img=12",
    tags: ["rust", "vector DBs", "retrieval"],
    blurb:
      "Obsessed with fast embeddings. Building a semantic search layer for teams.",
  },
  {
    id: "5",
    name: "Imani Wright",
    role: "Creative producer",
    avatar: "https://i.pravatar.cc/120?img=15",
    tags: ["short form", "growth", "community"],
    blurb:
      "Making technical founders camera‑confident. Can help script, shoot, and ship.",
  },
  {
    id: "6",
    name: "Arjun Rao",
    role: "Applied ML",
    avatar: "https://i.pravatar.cc/120?img=16",
    tags: ["RAG", "safety", "evals"],
    blurb:
      "Shipping pragmatic evals for small teams. Happy to pair on your eval suite.",
  },
];

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

  const handleSearch = async (searchQuery: string) => {
    setCreatingChatroom(true);

    try {
      console.log("🚀 Creating chatroom for query:", searchQuery);

      const userId = useAuthStore.getState().user?.id;

      // Use authenticated request from auth store
      const response = await useAuthStore
        .getState()
        .makeAuthenticatedRequest("/api/chatrooms/create", {
          method: "POST",
          body: JSON.stringify({
            query: searchQuery,
            userId: userId,
          }),
        });

      const data = await response.json();

      if (data.success) {
        console.log(
          "✅ Chatroom created, routing to search page with chatroom ID:",
          data.chatroom.id
        );
        // Route to search page with chatroom ID as parameter
        router.push(`/search?chatroom=${data.chatroom.id}`);
      } else {
        console.error("❌ Failed to create chatroom:", data.error);
        // Fallback to search page with query
        const encodedQuery = encodeURIComponent(searchQuery);
        router.push(`/search?q=${encodedQuery}`);
      }
    } catch (error) {
      console.error("❌ Error creating chatroom:", error);
      // Fallback to search page with query
      const encodedQuery = encodeURIComponent(searchQuery);
      router.push(`/search?q=${encodedQuery}`);
    } finally {
      setCreatingChatroom(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white relative overflow-hidden">
      <div className="flex relative z-10">
        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

        <main className="flex-1 pt-16 md:pt-0 relative">
          <div
            className="h-screen overflow-y-auto pr-4"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255,255,255,0.3) transparent",
            }}
          >
            <AnimatedParticles />
            <HeroSection />
            <SearchSection
              query={query}
              setQuery={setQuery}
              suggestedQueries={SUGGESTED_QUERIES}
              onSearch={handleSearch}
              creatingChatroom={creatingChatroom}
            />
            <PeopleSection people={SAMPLE_PEOPLE} />
          </div>
        </main>
      </div>
    </div>
  );
}
