import { motion } from "framer-motion";
import type { ChunkData } from "@/components/profile/chunks/ChunkUtils";

interface CategoryChunksProps {
  chunks: ChunkData[];
}

export function CategoryChunks({ chunks }: CategoryChunksProps) {
  const orderedChunks = [...chunks].sort((a, b) => a.order - b.order);
  return (
    <div className="pt-4 space-y-4">
      {orderedChunks.map((chunk, idx) => (
        <motion.div
          key={chunk.id}
          className="pl-6 border-l-2 border-white/10 text-white/70 leading-relaxed transition-colors"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: idx * 0.05 }}
        >
          <span className="flex-1">{chunk.text}</span>
        </motion.div>
      ))}
    </div>
  );
}
