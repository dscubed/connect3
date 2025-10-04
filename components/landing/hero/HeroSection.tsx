import { motion } from "framer-motion";
import { SearchBar } from "@/components/home/SearchBar";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Home } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setCreating(true);
    // Simulate query creation (replace with your logic)
    setTimeout(() => setCreating(false), 1000);
    // You can navigate or trigger actions here
    // router.push(`/search?chatroom=demo`);
  };

  return (
    <div
      id="home"
      className="text-center py-8 relative"
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/3 rounded-full blur-3xl" />
      </div>
      
      {/* Main content */}
      <div className="relative z-10">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight px-4"
      >
        Discover clubs and opportunities
        <br />
        <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          with Connect3
        </span>
      </motion.h2>
      
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-white/70 mb-6 px-4"
      >
        Connect3 helps students at Unimelb instantly find clubs and
        opportunities, and makes it effortless for clubs to reach and engage
        new members.
      </motion.p>

      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center gap-4 px-4"
      >
        {/* Search Bar */}
        <div className="relative w-full max-w-2xl mx-auto">
          {/* Background Glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl opacity-60 animate-pulse" />
          <div className="relative rounded-full bg-gradient-to-br from-gray-800 via-gray-900 to-black p-1 shadow-2xl">
            <div className="rounded-full bg-black px-4 py-3 md:px-6 md:py-4 shadow-[inset_0_0_20px_rgba(139,92,246,0.3)]">
              <SearchBar
                query={query}
                setQuery={setQuery}
                disabled={creating}
                placeholder="Search for clubs, opportunities, or keywords..."
                onSubmit={handleSearch}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-row gap-2 items-center justify-center mt-2"
        >
          {/* Go to Home Button */}
          <Link href="/">
            <button className="px-4 md:px-5 py-2 rounded-lg bg-black/40 hover:bg-black/60 text-white font-medium transition-all text-xs whitespace-nowrap border border-white/20 hover:border-white/30">
              Go to Home
            </button>
          </Link>

          {/* Sign Up Button */}
          <Link href="/auth/sign-up">
            <button className="px-4 md:px-5 py-2 rounded-lg bg-white text-black font-semibold hover:bg-white/90 transition-all text-xs whitespace-nowrap shadow-lg">
              Sign up
            </button>
          </Link>
        </motion.div>
      </motion.section>
      
      {/* Floating interactive elements */}
      <div className="absolute top-10 left-10 opacity-30">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
      </div>
      <div className="absolute top-1/3 right-10 opacity-20">
        <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
      </div>
      <div className="absolute bottom-20 left-1/4 opacity-25">
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>
      </div>
    </div>
  );
}
