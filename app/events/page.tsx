"use client";
import { useState } from "react";
import Sidebar from "@/components/sidebar/Sidebar";
import DesktopLayout from "./DesktopLayout";
import MobileLayout from "./MobileLayout";
import { breakpointLarge } from "@/hooks/useMediaQuery";

export default function EventsPage() {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [ loading, setLoading ] = useState<boolean>(true);
  const isDesktop = breakpointLarge();

  return (
    <div className="flex h-screen  bg-black overflow-hidden">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      <div>
        {isDesktop ? 
          <DesktopLayout />  :
          <MobileLayout />
        }
      </div>
      
    </div>
  );
}