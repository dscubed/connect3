"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Box, Menu, X, Clock, Calendar, UsersRound, Home, Play, Star, Eye } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SharedSidebarProps {
  sections?: Array<{ id: string; label: string; onClick?: () => void; href?: string }>;
  activeSection?: string;
  isLandingPage?: boolean;
}

const homeNavigation = [
  { id: "home", label: "Home", href: "/", icon: Home },
  { id: "events", label: "Events", href: undefined, icon: Calendar },
  { id: "clubs", label: "Clubs", href: "/clubs", icon: UsersRound },
  { id: "history", label: "History", href: undefined, icon: Clock },
];

const landingNavigation = [
  { id: "home", label: "Overview", icon: Eye },
  { id: "collaborations", label: "Partners", icon: UsersRound },
  { id: "use-cases", label: "Demo", icon: Play },
  { id: "benefits", label: "Features", icon: Star },
];

export function SharedSidebar({ 
  sections = [], 
  activeSection, 
  isLandingPage = false 
}: SharedSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !isDesktop &&
        mobileOpen &&
        !(event.target as HTMLElement).closest("[data-sidebar]") &&
        !(event.target as HTMLElement).closest("[data-menu-button]")
      ) {
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileOpen, isDesktop]);

  return (
    <>
      {/* Mobile Menu Button - Bottom Left */}
      {!mobileOpen && (
        <button
          data-menu-button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden fixed bottom-4 left-4 z-40 flex items-center justify-center w-12 h-12 rounded-full bg-white/10 border border-white/10 backdrop-blur-md hover:bg-white/15 transition-all hover:scale-105 shadow-lg"
        >
          <Menu className="h-5 w-5 text-white" />
        </button>
      )}

      {/* Sidebar */}
      <motion.aside
        data-sidebar
        initial={false}
        animate={{
          x: isDesktop ? "0%" : mobileOpen ? "0%" : "-100%",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed left-0 top-0 w-64 h-screen z-50 bg-[#0B0B0C]/95 backdrop-blur-xl border-r border-white/10 shadow-2xl flex flex-col"
      >
        {/* Close button (mobile only) */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden absolute top-6 right-4 flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 border border-white/10 hover:bg-white/15 transition-all"
        >
          <X className="h-4 w-4 text-white" />
        </button>

        {/* Logo at top */}
        <div className="flex flex-col gap-4 pt-8 px-6">
          <Link
            href="/"
            className="flex items-center gap-2 hover:scale-105 transition-transform duration-200 cursor-pointer"
            onClick={() => setMobileOpen(false)}
          >
            <div className="h-7 w-7 rounded-xl bg-white/10 grid place-items-center border border-white/10 shadow-lg shadow-white/5">
              <Box className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold tracking-tight text-white">
              connect<sup className="pl-0.5">3</sup>
            </span>
          </Link>
        </div>

        {/* Spacer to push navigation to bottom */}
        <div className="flex-1" />

        {/* Navigation at bottom */}
        <div className="px-6 pb-8">
          {/* Landing Page Navigation */}
          {isLandingPage && (
            <nav className="flex flex-col gap-1.5">
              {(sections.length > 0 ? sections : landingNavigation).map((section) => {
                const Icon = 'icon' in section ? section.icon : Eye;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      if ('onClick' in section) {
                        section.onClick?.();
                      }
                      setMobileOpen(false);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer select-none transition-all duration-200 ${
                      isActive
                        ? "bg-white/10 text-white shadow-lg shadow-white/5"
                        : "text-white/80 hover:bg-white/5 hover:text-white hover:scale-105"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{section.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Home Page Navigation */}
          {!isLandingPage && (
            <nav className="flex flex-col gap-1.5">
              {homeNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const content = (
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer select-none transition-all duration-200 ${
                      isActive
                        ? "bg-white/10 text-white shadow-lg shadow-white/5"
                        : "text-white/80 hover:bg-white/5 hover:text-white hover:scale-105"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{item.label}</span>
                  </div>
                );

                if (item.href) {
                  return (
                    <Link key={item.id} href={item.href} onClick={() => setMobileOpen(false)}>
                      {content}
                    </Link>
                  );
                }

                return <div key={item.id}>{content}</div>;
              })}
            </nav>
          )}
        </div>
      </motion.aside>
    </>
  );
}
