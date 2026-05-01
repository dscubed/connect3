"use client";
import Sidebar from "@/components/sidebar/Sidebar";
import { HomeGreeting } from "@/components/home/HomeGreeting";
import { RecommendedEvents } from "@/components/home/RecommendedEvents";

export default function Home() {
  return (
    <div className="flex flex-col md:flex-row h-[100dvh] overflow-hidden bg-white">
      <Sidebar />
      <div
        className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden w-full md:ml-[68px] [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        <HomeGreeting />
        <RecommendedEvents />
      </div>
    </div>
  );
}
