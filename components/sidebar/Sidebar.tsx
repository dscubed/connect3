"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Calendar, UsersRound, Home, SidebarIcon } from "lucide-react";
import { SidebarLink } from "./SidebarLink";
import { usePathname } from "next/navigation";
import SidebarHeader from "./SidebarHeader";
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
      {/* Mobile menu button */}
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

      {/* Sidebar container - relative wrapper for positioning */}
      <div
        ref={sidebarRef}
        className={`${isDesktop ? "relative" : "fixed top-0 left-0 z-30"}`}
      >
        {/* Chatrooms panel - behind main sidebar */}
        <AnimatePresence>
          {chatroomsOpen && (
            <motion.div
              initial={{ x: -200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -200, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`absolute top-0 left-full h-[100dvh] w-64 bg-white/95 backdrop-blur-xl border-l border-black/5 pt-12 md:pt-6 px-3 z-40 shadow-lg`}
            >
              <div className="flex flex-col h-full">
                {/* Close button for chatrooms panel */}
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => setChatroomsOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-muted/15 transition-colors text-muted hover:text-black"
                  >
                    <SidebarIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Chatrooms header */}
                <div className="text-md text-black/50 px-1 mb-3 tracking-wide">
                  Your Chats
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
          className={`z-50 flex flex-col px-4 gap-2 h-[100dvh] bg-white backdrop-blur-xl shadow-md pt-12 md:pt-6 safe-area-inset-top justify-between
            ${isDesktop ? "w-fit relative" : "w-fit"}`}
        >
          {/* Mobile close button */}
          {sidebarOpen && !isDesktop && (
            <button
              onClick={() => {
                setSidebarOpen(false);
                setChatroomsOpen(false);
              }}
              className="absolute top-4 -right-10 flex items-center justify-center w-8 h-8 rounded-lg bg-white shadow-md transition-all z-50"
            >
              <X className="h-4 w-4 text-muted" />
            </button>
          )}

          <div className="flex flex-col gap-4">
            <SidebarHeader
              chatroomsOpen={chatroomsOpen}
              setChatroomsOpen={setChatroomsOpen}
            />

            <nav className="mt-2 flex flex-col gap-1.5">
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
          {/* Auth button at bottom */}
          <div className="pb-12">
            <SidebarAuthButton />
          </div>
        </motion.aside>
      </div>

      {/* Mobile overlay backdrop when sidebar is open */}
      <AnimatePresence>
        {!isDesktop && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-muted/15 backdrop-blur-sm z-20"
            onClick={() => {
              setSidebarOpen(false);
              setChatroomsOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
