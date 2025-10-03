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
      className="w-full flex flex-col items-center justify-center min-h-[80vh] py-12"
    >
      <section className="flex flex-col items-center w-full justify-center text-center mb-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl text-4xl sm:text-5xl md:text-6xl lg:text-6xl font-bold mb-6 leading-tight"
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
          className="max-w-3xl text-base sm:text-lg md:text-xl lg:text-xl text-white/70 mb-6 px-4"
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
        className="w-full flex flex-col items-center justify-center gap-4"
      >
        {/* Search Bar */}
        <div className="relative max-w-3xl w-full px-4">
          {/* Background Glow */}
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

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-4"
        >
          {/* Go to Home Button */}
          <Link href="/" className="w-full sm:w-auto">
            <motion.div
              className="relative group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Subtle glow effect */}
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-white/5 via-gray-500/5 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

              <Button
                className="relative rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/20 hover:border-white/30 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] hover:bg-white/[0.12] group overflow-hidden"
                disabled
              >
                {/* Inner glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 via-transparent to-gray-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative flex items-center gap-3 px-6 py-3 md:px-8 md:py-4">
                  <Home className="w-4 h-4 md:w-5 md:h-5 text-white/80 group-hover:text-white transition-colors" />
                  <span className="text-sm md:text-base font-medium text-white/90 group-hover:text-white transition-colors">
                    Go to Home
                  </span>
                </div>
              </Button>
            </motion.div>
          </Link>

          {/* Sign Up Button - Primary Style */}
          <Link href="/auth/sign-up" className="w-full">
            <motion.div
              className="relative group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Subtle glow effect */}
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-white/10 via-gray-300/10 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />

              <Button
                className="relative rounded-2xl bg-white text-black hover:bg-gray-100 transition-all duration-300 shadow-[0_8px_32px_rgba(255,255,255,0.1)] hover:shadow-[0_12px_40px_rgba(255,255,255,0.15)] group overflow-hidden border border-white/10"
                disabled
              >
                {/* Inner shine effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 via-transparent to-gray-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center gap-3 px-6 py-3 md:px-8 md:py-4">
                  <span className="text-sm md:text-base font-medium">
                    Sign up now!
                  </span>
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </motion.section>
    </div>
  );
}
