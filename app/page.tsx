"use client";
import Sidebar from "@/components/sidebar/Sidebar";
import HeroSection from "@/components/home/HeroSection";
import React, { useState, Suspense } from "react";
import AnimatedParticles from "@/components/AnimatedParticles";
import QuickInfoSection from "@/components/home/QuickInfoSection";
import { AuthButton } from "@/components/auth/auth-button";
import { SearchBar } from "@/components/home/SearchBar";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function HomeContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("success") === "instagram_connected") {
      setShowSuccess(true);
      router.replace("/");
      setTimeout(() => setShowSuccess(false), 3000);
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-[#0B0B0C] text-white relative overflow-hidden">
      {showSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500/90 text-white px-6 py-2 rounded-full shadow-lg backdrop-blur-sm text-sm font-medium animate-in fade-in slide-in-from-top-4">
          Instagram account connected successfully!
        </div>
      )}
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

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
