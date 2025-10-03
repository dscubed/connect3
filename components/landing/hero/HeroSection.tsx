import { motion } from "framer-motion";
import { SearchBar } from "@/components/home/SearchBar";
import React, { useState } from "react";

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
      className="w-full flex flex-col items-center justify-center min-h-[80vh] py-12 md:py-20"
    >
      <section className="flex flex-col items-center w-full justify-center text-center mb-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
        >
          Discover clubs and opportunities
          <br />
          <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            with Connect3
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl text-base sm:text-lg md:text-xl lg:text-2xl text-white/70 mb-10 px-4"
        >
          Connect3 helps students at Unimelb instantly find clubs and
          opportunities, and makes it effortless for clubs to reach and engage
          new members.
        </motion.p>
      </section>
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="w-full flex justify-center items-center"
      >
        <div className="relative max-w-3xl w-full px-4">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl opacity-60 animate-pulse" />
          <div className="relative rounded-full bg-gradient-to-br from-gray-800 via-gray-900 to-black p-1 shadow-2xl">
            <div className="rounded-full bg-black px-6 py-4 md:px-8 md:py-6 shadow-[inset_0_0_20px_rgba(139,92,246,0.3)]">
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
      </motion.section>
    </div>
  );
}
