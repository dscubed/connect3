import React from "react";
import { motion } from "framer-motion";
import Chip from "@/components/home/Chip";

interface SuggestedQueriesProps {
  suggestedQueries: string[];
  onQuerySelect: (query: string) => void;
}

const SuggestedQueries: React.FC<SuggestedQueriesProps> = ({
  suggestedQueries,
  onQuerySelect,
}) => {
  const handleClick = (query: string) => {
    onQuerySelect(query);
  };

  return (
    <div className="mt-3 relative" style={{ maxHeight: "4.5rem", overflow: "hidden" }}>
      <div className="pointer-events-none absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-[#0B0B0C] via-[#0B0B0C]/80 to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-[#0B0B0C] via-[#0B0B0C]/80 to-transparent z-10" />
      <motion.div
        className="flex gap-2"
        style={{ 
          whiteSpace: "nowrap", 
          alignItems: "center",
          willChange: "transform"
        }}
        animate={{ x: [0, -600] }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
          duration: 16,
          ease: "linear",
        }}
      >
        {suggestedQueries.map((q, i) => (
          <Chip 
            key={`${q}-${i}`} 
            label={q} 
            onClick={() => handleClick(q)} 
          />
        ))}
      </motion.div>
    </div>
  );
};

export default SuggestedQueries;
