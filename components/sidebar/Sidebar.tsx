"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Calendar, UsersRound, Home, SidebarIcon } from "lucide-react";
import { SidebarLink } from "./SidebarLink";
import { usePathname } from "next/navigation";
import Link from "next/link";
import SidebarHeader from "./SidebarHeader";
import LogoAnimated from "@/components/logo/LogoAnimated";
import RecentChatrooms from "./chatrooms/RecentChatrooms";
import { SidebarAuthButton } from "./authbutton/SidebarAuthButton";

interface SidebarProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  chatroomId?: string;
}

const sidebarLinks = [
  { icon: Home, href: "/" },
  { icon: Calendar, href: "/events" },
  { icon: UsersRound, href: "/clubs" },
];

const Sidebar: React.FC<SidebarProps> = ({
  open,
  onOpenChange,
  chatroomId,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const pathName = usePathname();
  const [chatroomsOpen, setChatroomsOpen] = useState(false);

  const sidebarOpen = open !== undefined ? open : internalOpen;
  const setSidebarOpen = onOpenChange || setInternalOpen;

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize();
    // Delay hasMounted so the initial isDesktop correction doesn't animate
    requestAnimationFrame(() => setHasMounted(true));
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
        setChatroomsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen, isDesktop, setSidebarOpen]);

  useEffect(() => {
    if (!isDesktop) {
      setSidebarOpen(false);
      setChatroomsOpen(false);
    }
  }, [isDesktop, setSidebarOpen]);

  return (
    <>
      {/* Mobile sticky navbar - logo left, collapse button right */}
      <nav
        data-menu-button
        className="sticky top-0 z-40 w-full md:hidden flex items-center justify-between px-4 py-3 safe-area-inset-top bg-white border-b border-neutral-200 shrink-0"
      >
        <Link href="/" className="flex items-center p-1">
          <LogoAnimated width={20} height={20} onHover={false} />
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 border border-white/10 hover:bg-white/15 transition-all hover:scale-105"
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={sidebarOpen ? "close" : "menu"}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </motion.div>
          </AnimatePresence>
        </button>
      </nav>

      {/* Sidebar container - z-[100] above navbar (z-40) and chat popups (z-50) */}
      <div
        ref={sidebarRef}
        className={`${isDesktop ? "relative" : "fixed top-0 left-0 z-[100]"}`}
      >
        {/* Chatrooms panel - behind main sidebar. On mobile, show with sidebar (no extra click) */}
        <AnimatePresence>
          {(isDesktop ? chatroomsOpen : sidebarOpen) && (
            <motion.div
              initial={{ x: -200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -200, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`absolute top-0 left-full h-[100dvh] w-64 bg-white/95 backdrop-blur-xl border-l border-black/5 pt-6 px-3 z-30 shadow-lg`}
            >
              <div className="flex flex-col h-full">
                {/* Chatrooms header with collapse button */}
                <div className="flex items-center justify-between mb-3">
                  <div className="text-md text-black/50 px-1 tracking-wide leading-5 flex items-center">
                    Your Chats
                  </div>
                  {isDesktop && (
                    <button
                      onClick={() => setChatroomsOpen(false)}
                      className="p-1.5 rounded-lg hover:bg-muted/15 transition-colors text-muted hover:text-black"
                      aria-label="Close chatrooms"
                    >
                      <SidebarIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>

                {/* Chatrooms list - uncomment RecentChatrooms when ready */}
                <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide">
                  <RecentChatrooms chatroomId={chatroomId} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main sidebar */}
        <motion.aside
          initial={false}
          animate={{ x: isDesktop ? "0%" : sidebarOpen ? "0%" : "-100%" }}
          transition={hasMounted ? { duration: 0.3, ease: "easeInOut" } : { duration: 0 }}
          className={`relative z-50 flex flex-col px-3 gap-2 h-[100dvh] bg-white backdrop-blur-xl pt-4 pb-4 safe-area-inset-top justify-between rounded-r-lg
            ${isDesktop ? "w-fit relative" : "w-fit"}`}
        >
          <div className="flex flex-col gap-4 items-center">
            <SidebarHeader />

            <nav className="mt-2 flex flex-col gap-3 items-center w-full">
              {sidebarLinks.map((link) => (
                <SidebarLink
                  key={link.href}
                  icon={link.icon}
                  href={link.href}
                  pathName={pathName}
                />
              ))}
            </nav>
          </div>
          {/* Expand button (desktop only - on mobile sidebar and chat show together) and auth at bottom */}
          <div className="flex flex-col items-center gap-3">
            {isDesktop && (
              <button
                onClick={() => setChatroomsOpen(!chatroomsOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-lg text-muted hover:text-black hover:bg-muted/15 transition-colors"
                aria-label={chatroomsOpen ? "Close chatrooms" : "Open chatrooms"}
              >
                <SidebarIcon className="h-5 w-5" />
              </button>
            )}
            <SidebarAuthButton />
          </div>
        </motion.aside>
      </div>

      {/* No overlay on mobile - users can still interact with page when sidebar is open */}
    </>
  );
};

export default Sidebar;
