"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Calendar, UsersRound, Home } from "lucide-react";
import { SidebarLink } from "./SidebarLink";
import { usePathname } from "next/navigation";
import SidebarHeader from "./SidebarHeader";
import { useAuthStore } from "@/stores/authStore";

// ✅ adjust this import path to wherever your RecentChatrooms component is:
import RecentChatrooms from "../home/QuickInfo/RecentChatrooms";

interface SidebarProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const sidebarLinks = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Calendar, label: "Events", href: undefined },
  { icon: UsersRound, label: "Clubs", href: "/clubs" },
];

const Sidebar: React.FC<SidebarProps> = ({ open, onOpenChange }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const pathName = usePathname();

  const user = useAuthStore((s) => s.user);

  const sidebarOpen = open !== undefined ? open : internalOpen;
  const setSidebarOpen = onOpenChange || setInternalOpen;

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !isDesktop &&
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest("[data-menu-button]")
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen, isDesktop, setSidebarOpen]);

  return (
    <>
      {!sidebarOpen && (
        <button
          data-menu-button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-4 left-4 z-50 flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md hover:bg-white/15 transition-all hover:scale-105 md:hidden"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={sidebarOpen ? "close" : "menu"}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="h-5 w-5" />
            </motion.div>
          </AnimatePresence>
        </button>
      )}

      <motion.aside
        ref={sidebarRef}
        initial={false}
        animate={{ x: isDesktop ? "0%" : sidebarOpen ? "0%" : "-100%" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`z-50 flex flex-col h-screen bg-white backdrop-blur-xl shadow-2xl
          ${
            isDesktop
              ? "w-64 px-8 relative md:shadow-none md:backdrop-blur-none md:transform-none"
              : "fixed top-0 left-0 w-64"
          }
        `}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-6 right-4 flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 border border-white/10 hover:bg-white/15 transition-all md:hidden safe-area-inset-top"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col gap-4 pt-8 px-4 md:px-0 md:pt-6 safe-area-inset-top">
          <SidebarHeader />

          <nav className="mt-2 flex flex-col gap-1.5">
            {sidebarLinks.map((link) => (
              <SidebarLink
                key={link.label}
                icon={link.icon}
                label={link.label}
                href={link.href}
                pathName={pathName}
              />
            ))}
          </nav>

          {/* Chatrooms */}
          <div className="mt-4">
            <div className="text-xs font-semibold text-black/50 px-1 mb-2">
              Chatrooms
            </div>

            <div className="max-h-[42vh] overflow-y-auto pr-1">
              <RecentChatrooms userId={user?.id ?? null} />
            </div>
          </div>
        </div>

        <div />
      </motion.aside>
    </>
  );
};

export default Sidebar;
