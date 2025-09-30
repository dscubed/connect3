import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CategoryChunks } from "./CategoryChunks";
import { motion } from "framer-motion";
import type { ChunkData } from "@/components/profile/chunks/ChunkUtils";

interface CategorySectionProps {
  category: string;
  index?: number;
  chunks: ChunkData[];
}

export function CategorySection({
  category,
  index,
  chunks,
}: CategorySectionProps) {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => setExpanded((prev) => !prev);

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index ? index * 0.25 : 0 }}
    >
      <div className="relative">
        <motion.button
          onClick={handleToggle}
          className="w-full flex items-center justify-between py-2 hover:bg-white/5 transition-all rounded-lg group"
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-semibold text-white/90">{category}</h3>
            <span className="text-sm text-white/50 bg-white/10 px-3 py-1 rounded-full">
              {chunks.length}
            </span>
          </div>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-5 w-5 text-white/50 group-hover:text-white/70 transition-colors" />
          </motion.div>
        </motion.button>
        {expanded && <CategoryChunks chunks={chunks} />}
      </div>
    </motion.div>
  );
}
