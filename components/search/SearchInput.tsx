"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

interface SearchInputProps {
  onSearch: (query: string) => void;
  chatroomId: string | null;
}

export default function SearchInput({
  onSearch,
  chatroomId,
}: SearchInputProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = () => {
    if (query.trim()) {
      onSearch(query);
      setQuery("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      handleSubmit();
    }
  };

  if (!chatroomId) {
    return null;
  }

  return (
    <motion.div
      className="absolute bottom-4 left-0 right-0 z-50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
    >
      <div className="max-w-2xl mx-auto relative">
        <motion.div
          className="relative flex items-center gap-2 rounded-2xl bg-white/10 border border-white/20 px-4 py-3 backdrop-blur-xl shadow-2xl"
          whileHover={{
            borderColor: "rgba(255,255,255,0.3)",
            scale: 1.01,
          }}
          transition={{ duration: 0.2 }}
        >
          <Search className="h-5 w-5 text-white/60" />
          <input
            className="w-full bg-transparent outline-none placeholder:text-white/40 text-white"
            placeholder="Ask another question or refine your search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <motion.button
            className="rounded-xl px-3 py-1.5 bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!query.trim()}
            whileHover={query.trim() ? { scale: 1.05 } : {}}
            whileTap={query.trim() ? { scale: 0.95 } : {}}
            onClick={handleSubmit}
          >
            Search
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}
