import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { ChunkList } from "./ChunkList";
import { useProfileChunkStore } from "@/stores/profiles/profileChunkStore";
import type { ChunkData } from "../ChunkUtils";

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
  const expandedCategories = useProfileChunkStore((s) => s.expandedCategories);
  const setExpandedCategories = useProfileChunkStore(
    (s) => s.setExpandedCategories
  );
  const expanded = expandedCategories.has(category);

  const handleToggle = () => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

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
            animate={{
              rotate: expanded ? 180 : 0,
            }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-5 w-5 text-white/50 group-hover:text-white/70 transition-colors" />
          </motion.div>
        </motion.button>

        {/* Category Content */}
        {expanded && <ChunkList category={category} chunks={chunks} />}
      </div>
    </motion.div>
  );
}
