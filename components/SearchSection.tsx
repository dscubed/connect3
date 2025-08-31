import React from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import Chip from "@/components/Chip";

interface SearchSectionProps {
  query: string;
  setQuery: (q: string) => void;
  suggestedQueries: string[];
}

const SearchSection: React.FC<SearchSectionProps> = ({
  query,
  setQuery,
  suggestedQueries,
}) => (
  <div className="mx-auto max-w-2xl">
    <div className="flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 px-4 py-3 backdrop-blur shadow-xl shadow-white/5 hover:shadow-white/10 transition-all">
      <Search className="h-5 w-5 text-white/60" />
      <input
        className="w-full bg-transparent outline-none placeholder:text-white/40"
        placeholder="Search by skills, vibes, or ideas (e.g. 'AI enthusiasts')…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button className="rounded-xl px-3 py-1.5 bg-white text-black text-sm font-medium hover:bg-white/90 transition-all hover:scale-105 shadow-lg">
        Search
      </button>
    </div>

    <div
      className="mt-3 relative"
      style={{ maxHeight: "4.5rem", overflow: "hidden" }}
    >
      <div className="pointer-events-none absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-[#0B0B0C] via-[#0B0B0C]/80 to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-[#0B0B0C] via-[#0B0B0C]/80 to-transparent z-10" />
      <motion.div
        className="flex gap-2"
        style={{ whiteSpace: "nowrap", alignItems: "center" }}
        animate={{ x: [0, -1200] }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
          duration: 32,
          ease: "linear",
        }}
      >
        {suggestedQueries.map((q, i) => (
          <Chip key={q + i} label={q} onClick={() => setQuery(q)} />
        ))}
        {suggestedQueries.map((q, i) => (
          <Chip key={q + "dup" + i} label={q} onClick={() => setQuery(q)} />
        ))}
      </motion.div>
    </div>
  </div>
);

export default SearchSection;
