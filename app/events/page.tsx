"use client";
import { useState } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import DesktopLayout from "./DesktopLayout";
import MobileLayout from "./MobileLayout";
import { breakpointLarge } from "@/hooks/useMediaQuery";

export default function EventsPage() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const isDesktop = breakpointLarge();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      {isDesktop ? <DesktopLayout /> : <MobileLayout />}
    </div>
  );
}
