"use client";
import Sidebar from "@/components/sidebar/Sidebar";
import Logo from "@/components/logo/Logo";
import { HeroPanels } from "@/components/home/HeroPanels";
import React, { useState } from "react";
import { SearchBar } from "@/components/home/SearchBar";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] relative overflow-hidden bg-white">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: [
            "radial-gradient(ellipse 60% 50% at 30% 30%, hsla(270, 60%, 88%, 0.6), transparent 70%)",
            "radial-gradient(ellipse 50% 40% at 70% 50%, hsla(250, 50%, 85%, 0.5), transparent 70%)",
            "radial-gradient(ellipse 40% 35% at 50% 60%, hsla(290, 40%, 90%, 0.4), transparent 65%)",
          ].join(", "),
        }}
      />
      <div className="flex flex-col md:flex-row relative z-10 h-[100dvh]">
        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

        <div
          className="flex flex-col flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 md:px-6 w-full items-center"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.3) transparent",
          }}
        >
          <div className="flex flex-col items-center w-full gap-4 mb-8 mt-[10dvh] sm:mt-[20dvh]">
            <div className="flex flex-row gap-2 justify-center items-center">
              <Logo className="h-12 w-12 sm:h-14 sm:w-14" />
              <h1 className="text-4xl font-extrabold tracking-tight leading-[1.1]">
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
