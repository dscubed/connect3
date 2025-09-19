import { motion } from "framer-motion";
import { Chunk } from "../utils/ChunkUtils";
import { Plus } from "lucide-react";

interface AddChunkButtonCardProps {
  currentChunks: Chunk[];
  setIsAddingNew: (isAdding: boolean) => void;
}

export default function AddChunkButtonCard({
  currentChunks,
  setIsAddingNew,
}: AddChunkButtonCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: currentChunks.length * 0.1 + 0.2 }}
      className="group relative"
    >
      <motion.div
        className="relative p-4 rounded-2xl border-2 border-dashed border-white/20 bg-white/5 backdrop-blur-md hover:border-white/30 hover:bg-white/8 transition-all duration-300 cursor-pointer h-full flex items-center justify-center min-h-[200px]"
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsAddingNew(true)}
      >
        <div className="text-center">
          <Plus className="h-8 w-8 text-white/40 mx-auto mb-2" />
          <p className="text-white/60 text-sm">Add new highlight</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
