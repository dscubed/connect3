"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Compass,
  Menu,
  X,
  Clock,
  Calendar,
  UsersRound,
} from "lucide-react";
import { AuthButton } from "./auth/auth-button";
import Link from "next/link";

interface SidebarLinkProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  href?: string;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({
  icon: Icon,
  label,
  active = false,
  href,
}) => {
  const content = (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer select-none transition-all duration-200 ${
        active
          ? "bg-white/10 text-white shadow-lg shadow-white/5"
          : "text-white/80 hover:bg-white/5 hover:text-white hover:scale-105"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span className="text-sm">{label}</span>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
};

interface SidebarProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onOpenChange }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  // Use controlled state if provided, otherwise use internal state
  const sidebarOpen = open !== undefined ? open : internalOpen;
  const setSidebarOpen = onOpenChange || setInternalOpen;

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
        animate={{
          x: isDesktop ? "0%" : sidebarOpen ? "0%" : "-100%",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`z-50 flex flex-col justify-between h-screen bg-[#0B0B0C]/95 backdrop-blur-xl border-r border-white/10 shadow-2xl
    ${
      isDesktop
        ? "w-64 px-8 relative md:bg-transparent md:border-r-0 md:shadow-none md:backdrop-blur-none md:transform-none"
        : "fixed top-0 left-0 w-64"
    }
  `}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 border border-white/10 hover:bg-white/15 transition-all md:hidden"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col gap-4 pt-6 px-4 md:px-0">
          <Link
            href="/"
            className="flex items-center gap-2 hover:scale-105 transition-transform duration-200 cursor-pointer"
          >
            <div className="h-7 w-7 rounded-xl bg-white/10 grid place-items-center border border-white/10 shadow-lg shadow-white/5">
              <Box className="h-4 w-4" />
            </div>
            <span className="font-semibold tracking-tight">
              connect<sup className="pl-0.5">3</sup>
            </span>
          </Link>
          <nav className="mt-2 flex flex-col gap-1.5">
            <SidebarLink icon={Compass} label="Discover" active />
            <SidebarLink icon={Calendar} label="Events" />
            <SidebarLink icon={UsersRound} label="Clubs" href="/clubs-page" />
            <SidebarLink icon={Clock} label="History" />
          </nav>
        </div>

        <div className="flex flex-col gap-4 pb-6 px-4 md:px-0">
          <AuthButton />
        </div>
      </motion.aside>
    </>
  );
};
export default Sidebar;
