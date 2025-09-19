import { motion } from "framer-motion";
import { Chunk } from "./ChunksSection";

interface AddChunkCardProps {
  newChunkDetails: Chunk;
  setNewChunkDetails: React.Dispatch<React.SetStateAction<Chunk>>;
  handleAddNewChunk: () => void;
  handleCancelAdd: () => void;
  getWordCount: (text: string) => number;
  WORD_LIMIT: number;
}

export default function AddChunkCard({
  newChunkDetails,
  setNewChunkDetails,
  handleAddNewChunk,
  handleCancelAdd,
  getWordCount,
  WORD_LIMIT,
}: AddChunkCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1.1 }}
      className="group relative"
    >
      <div className="relative p-4 rounded-2xl border-2 border-dashed border-white/20 bg-white/5 backdrop-blur-md min-h-[250px] flex flex-col">
        <div className="space-y-3 flex-1 flex flex-col">
          <input
            type="text"
            placeholder="Category (e.g., Skills, Experience)"
            value={newChunkDetails.category}
            onChange={(e) =>
              setNewChunkDetails((prev) => ({
                ...prev,
                category: e.target.value.slice(0, 50),
              }))
            }
            className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white/90 text-sm focus:outline-none focus:border-white/40 placeholder-white/50"
            maxLength={50}
          />
          <div className="relative flex-1 flex flex-col">
            <textarea
              placeholder="Describe your highlight..."
              value={newChunkDetails.content}
              onChange={(e) =>
                setNewChunkDetails((prev) => ({
                  ...prev,
                  content: e.target.value,
                }))
              }
              className="w-full h-full bg-white/10 border border-white/20 rounded-lg p-3 text-white/90 text-sm resize-none focus:outline-none focus:border-white/40 placeholder-white/50 flex-1"
              rows={3}
            />
            <div
              className={`absolute -bottom-6 right-0 text-xs ${
                getWordCount(newChunkDetails.content) > WORD_LIMIT
                  ? "text-red-400"
                  : "text-white/50"
              }`}
            >
              {getWordCount(newChunkDetails.content)}/{WORD_LIMIT} words
            </div>
          </div>
          <div className="flex gap-2 mt-8">
            <button
              onClick={handleAddNewChunk}
              disabled={
                getWordCount(newChunkDetails.content) > WORD_LIMIT ||
                !newChunkDetails.category.trim() ||
                !newChunkDetails.content.trim()
              }
              className="px-3 py-1 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed rounded-lg text-xs text-white transition-all"
            >
              Add
            </button>
            <button
              onClick={handleCancelAdd}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-white/70 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
