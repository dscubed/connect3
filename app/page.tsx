"use client";
import Sidebar from "@/components/sidebar/Sidebar";
import Logo from "@/components/logo/Logo";
import { HeroPanels } from "@/components/home/HeroPanels";
import { QuizBanner } from "@/components/home/QuizBanner";
import React, { useState } from "react";
import { SearchBar } from "@/components/home/SearchBar";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] relative overflow-hidden bg-white">
      <div className="flex flex-col md:flex-row relative z-10 h-[100dvh]">
        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

        <div
          className="flex flex-col flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 md:px-6 w-full items-center"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.3) transparent",
          }}
        >
          <div className="flex flex-col items-center w-full gap-4 mb-8 mt-4 sm:mt-8">
            <QuizBanner />
            <div className="mb-6 flex flex-row gap-2 justify-center items-center">
              <Logo className="h-12 w-12 sm:h-14 sm:w-14" />
              <h1 className="font-fredoka text-4xl font-semibold tracking-[0.01em] leading-[1.1]">
                Connect3
              </h1>
            </div>
            <div className="w-full">
              <SearchBar />
            </div>
          </div>
          <div className="w-full pb-12">
            <HeroPanels />
          </div>
        </div>
      </div>
    </div>
  );
}
