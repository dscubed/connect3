"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Box, Compass, Users, Menu, X, Bell, Clock } from "lucide-react";
import { AuthButton } from "./auth/auth-button";

interface SidebarLinkProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({
  icon: Icon,
  label,
  active = false,
}) => (
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

// ...existing code...

const Sidebar: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
        initial={false}
        animate={{
          x: isDesktop ? "0%" : sidebarOpen ? "0%" : "-100%",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`z-50 flex flex-col justify-between h-screen bg-[#0B0B0C]/95 backdrop-blur-xl border-r border-white/10 shadow-2xl
          ${
            isDesktop
              ? "relative md:col-span-3 lg:col-span-2 md:w-auto md:bg-transparent md:border-r-0 md:shadow-none md:backdrop-blur-none md:transform-none"
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
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-xl bg-white/10 grid place-items-center border border-white/10 shadow-lg shadow-white/5">
              <Box className="h-4 w-4" />
            </div>
            <span className="font-semibold tracking-tight">
              connect<sup className="pl-0.5">3</sup>
            </span>
          </div>
          <nav className="mt-2 flex flex-col gap-1.5">
            <SidebarLink icon={Compass} label="Discover" active />
            <SidebarLink icon={Bell} label="Notifications" />
            <SidebarLink icon={Users} label="People" />
            <SidebarLink icon={Clock} label="History" />
          </nav>
        </div>

        <div className="flex flex-col gap-4 pb-6 px-4 md:px-0">
          {/* Replace with logged in as email and logout button isntead of this */}
          <AuthButton />
          {/* <div className="text-white/60 text-sm leading-relaxed">
            welcome to{" "}
            <span className="text-white font-semibold">
              connect<sup className="pl-0.5">3</sup>
            </span>
            , a place to find the people your ideas need. powered by nlp
            discovery.
          </div>
          <div className="mt-4 flex gap-2">
            <a
              href="/signup"
              className="px-4 py-2 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition-all hover:scale-105 shadow-lg"
            >
              sign up
            </a>
            <a
              href="/login"
              className="px-4 py-2 rounded-xl border border-white/20 hover:border-white/30 hover:bg-white/5 transition-all hover:scale-105"
            >
              log in
            </a>
          </div> */}
        </div>
      </motion.aside>
    </>
  );
};
export default Sidebar;
