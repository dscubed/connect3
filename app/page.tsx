"use client";
import Sidebar from "@/components/sidebar/Sidebar";
import HeroSection from "@/components/home/HeroSection";
import React, { useState } from "react";
import AnimatedParticles from "@/components/AnimatedParticles";
import QuickInfoSection from "@/components/home/QuickInfoSection";
import { AuthButton } from "@/components/auth/auth-button";
import { SearchBar } from "@/components/home/SearchBar";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white relative overflow-hidden">
      <div className="flex relative z-10">
        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

        <main className="flex-1 relative w-full">
          {/* Top Navigation Bar */}
          <div className="fixed top-2 right-2 z-40 p-4 safe-area-inset-top">
            <div className="flex justify-end">
              <AuthButton />
            </div>
          </div>

          <div
            className="flex flex-col h-screen overflow-y-auto overflow-x-hidden px-4 md:px-6 w-full"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255,255,255,0.3) transparent",
            }}
          >
            <AnimatedParticles />

            {/* Top Section */}
            <div className="flex-[1] h-1/2 flex flex-col items-center justify-center w-full">
              <HeroSection />
              <SearchBar />
            </div>

            {/* Bottom Section */}
            <div className="flex-[1] h-1/2 flex flex-col items-start w-full justify-end mb-12">
              <QuickInfoSection />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
