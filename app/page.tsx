"use client";
import Sidebar from "@/components/sidebar/Sidebar";
import HeroSection from "@/components/home/HeroSection";
import React, { useState } from "react";
import { SearchBar } from "@/components/home/SearchBar";
import { CharacterBackground } from "@/components/ui/CharacterBackground";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] relative overflow-hidden">
      <CharacterBackground />
      <div className="flex flex-col md:flex-row relative z-10 h-[100dvh]">
        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

        <div
          className="flex flex-col flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 md:px-6 w-full items-center justify-between"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.3) transparent",
          }}
        >
          
          <HeroSection />
          <div className="w-full pb-4">
            <SearchBar />
          </div>
        </div>
      </div>
    </div>
  );
}
