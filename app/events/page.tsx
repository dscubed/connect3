"use client";
import { Suspense } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import DesktopLayout from "./DesktopLayout";
import MobileLayout from "./MobileLayout";
import { useBreakpointLarge } from "@/hooks/useMediaQuery";

export default function EventsPage() {
  const isDesktop = useBreakpointLarge();

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] overflow-hidden">
      <Sidebar />

      <div className="flex-1 md:ml-[68px]">
        <Suspense>{isDesktop ? <DesktopLayout /> : <MobileLayout />}</Suspense>
      </div>
    </div>
  );
}
