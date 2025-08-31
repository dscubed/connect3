"use client";
import Sidebar from "@/components/Sidebar";
import HeroSection from "@/components/HeroSection";
import PeopleSection from "@/components/PeopleSection";
import React, { useState } from "react";
import AnimatedParticles from "@/components/AnimatedParticles";
import SearchSection from "@/components/SearchBar";

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
  const [query, setQuery] = useState("");
  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white relative overflow-hidden">
      <div className="grid max-w-7xl grid-cols-12 gap-6 px-4 md:px-8 relative z-10">
        <Sidebar />
        <main className="col-span-12 md:col-span-9 lg:col-span-10 pt-16 md:pt-0 relative">
          <AnimatedParticles />
          <HeroSection />
          <SearchSection
            query={query}
            setQuery={setQuery}
            suggestedQueries={SUGGESTED_QUERIES}
          />
          <PeopleSection people={SAMPLE_PEOPLE} />
        </main>
      </div>
    </div>
  );
}
