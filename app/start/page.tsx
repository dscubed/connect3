"use client";

import Sidebar from "@/components/sidebar/Sidebar";
import { HomeHero } from "@/components/home/hero/HomeHero";
import { MobileHomeHero } from "@/components/home/hero/MobileHomeHero";
import { TrendingCarousel } from "@/components/home/TrendingCarousel";

export default function StartPage() {
  return (
    <div className="min-h-[100dvh] relative overflow-hidden bg-white">
      <div className="flex flex-col md:flex-row relative h-[100dvh]">
        <Sidebar />

        <div
          className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden w-full md:ml-[68px] [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none" }}
        >
          <div className="h-[100dvh] shrink-0 flex flex-col">
            <div className="sm:hidden">
              <MobileHomeHero />
            </div>
            <div className="flex-1 min-h-0">
              <HomeHero />
            </div>
          </div>
          <TrendingCarousel />
        </div>
      </div>
    </div>
  );
}
