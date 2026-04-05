"use client";
import Sidebar from "@/components/sidebar/Sidebar";
import React, { useState } from "react";
import { HomeHero } from "@/components/home/HomeHero";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] relative overflow-hidden bg-white">
      <div className="flex flex-col md:flex-row relative z-10 h-[100dvh]">
        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

        <div
          className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-4 md:px-6 w-full"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.3) transparent",
          }}
        >
          <div className="flex min-h-[100dvh] flex-col items-center">
            <div className="my-auto mx-auto w-full max-w-7xl">
              <HomeHero />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
