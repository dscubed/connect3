import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import type { ChunkData } from "../ChunkUtils";

interface CategoryChunkListProps {
  chunks: ChunkData[];
  category: string;
}

export function ChunkList({ chunks }: CategoryChunkListProps) {
  return (
    <motion.div
      initial={false}
      animate={{
        height: "auto",
        opacity: 1,
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="overflow-hidden"
    >
      <div className="pt-4 space-y-4">
        {chunks.map((chunk, index) => (
          <motion.p
            key={chunk.id}
            className="pl-6 border-l-2 border-white/10 hover:border-gray-200/30 text-white/70 leading-relaxed group-hover/chunk:text-white/90 transition-colors cursor-pointer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            {chunk.summary_text}
          </motion.p>
        ))}
        <motion.p
          className="flex items-center gap-2 pl-6 border-l-2 border-white/10 hover:border-gray-200/30 text-white/70 leading-relaxed group-hover/chunk:text-white/90 transition-colors cursor-pointer"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: chunks.length * 0.05 }}
        >
          <Plus className="w-4 h-4" /> Add Chunk
        </motion.p>
      </div>
    </motion.div>
  );
}
