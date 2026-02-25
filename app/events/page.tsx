"use client";
import { Suspense, useState } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import DesktopLayout from "./DesktopLayout";
import MobileLayout from "./MobileLayout";
import { useBreakpointLarge } from "@/hooks/useMediaQuery";

export default function EventsPage() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const isDesktop = useBreakpointLarge();

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] overflow-hidden">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      <Suspense>{isDesktop ? <DesktopLayout /> : <MobileLayout />}</Suspense>
    </div>
  );
}
