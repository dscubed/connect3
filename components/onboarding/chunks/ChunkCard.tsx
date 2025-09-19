import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Chunk } from "./ChunksSection";

type ChunkCardProps = {
  chunk: Chunk;
  idx: number;
  editingChunk: string | null;
  editChunkDetails: Chunk | null;
  setEditChunkDetails: (chunk: Chunk | null) => void;
  handleChunkClick: (chunk: Chunk) => void;
  handleDeleteChunk: (chunkId: string) => void;
  handleSaveEdit: () => void;
  setEditingChunk: (chunkId: string | null) => void;
  getWordCount: (content: string) => number;
  WORD_LIMIT: number;
};

function ChunkCard({
  chunk,
  idx,
  editingChunk,
  editChunkDetails,
  setEditChunkDetails,
  handleChunkClick,
  handleDeleteChunk,
  handleSaveEdit,
  setEditingChunk,
  getWordCount,
  WORD_LIMIT,
}: ChunkCardProps) {
  const isEditing = editingChunk === chunk.chunk_id;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1.05 }}
        exit={{ opacity: 0, y: -30, scale: 0.95 }}
        transition={{
          duration: 0.6,
          delay: idx * 0.1,
          type: "spring",
          stiffness: 100,
        }}
        className="group relative"
      >
        <motion.div
          className="relative p-6 min-h-[180px] rounded-2xl border-2 border-white/20 bg-white/5 backdrop-blur-md hover:border-white/30 hover:bg-white/8 transition-all duration-300 cursor-pointer h-full"
          whileHover={{ scale: 1.07, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => !isEditing && handleChunkClick(chunk)}
        >
          <div className="flex items-center justify-between mb-3">
            {isEditing ? (
              <input
                type="text"
                value={editChunkDetails?.category ?? ""}
                onChange={(e) =>
                  setEditChunkDetails(
                    editChunkDetails
                      ? {
                          ...editChunkDetails,
                          category: e.target.value.slice(0, 50),
                        }
                      : null
                  )
                }
                maxLength={50}
                className="text-xs font-medium text-white/90 uppercase bg-white/10 px-2 py-1 rounded-full w-2/3 focus:outline-none focus:border-white/40 border border-white/20 z-10"
                placeholder="Category"
              />
            ) : (
              <span className="text-xs font-medium text-white/60 uppercase bg-white/10 px-2 py-1 rounded-full">
                {chunk.category}
              </span>
            )}
            <motion.button
              className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all z-10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteChunk(chunk.chunk_id);
              }}
            >
              <X className="h-3 w-3" />
            </motion.button>
          </div>
          <div className="relative z-10">
            {isEditing ? (
              <div className="space-y-3">
                <div className="relative">
                  <textarea
                    value={editChunkDetails?.content ?? ""}
                    onChange={(e) =>
                      setEditChunkDetails(
                        editChunkDetails
                          ? { ...editChunkDetails, content: e.target.value }
                          : null
                      )
                    }
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white/90 text-sm resize-none focus:outline-none focus:border-white/40"
                    rows={6}
                    autoFocus
                  />
                  <div
                    className={`absolute -bottom-6 right-0 text-xs ${
                      getWordCount(editChunkDetails?.content ?? "") > WORD_LIMIT
                        ? "text-red-400"
                        : "text-white/50"
                    }`}
                  >
                    {getWordCount(editChunkDetails?.content ?? "")}/{WORD_LIMIT}{" "}
                    words
                  </div>
                </div>
                <div className="flex gap-2 mt-8">
                  <button
                    onClick={handleSaveEdit}
                    disabled={
                      getWordCount(editChunkDetails?.content ?? "") >
                        WORD_LIMIT ||
                      !(editChunkDetails?.content ?? "").trim() ||
                      !(editChunkDetails?.category ?? "").trim()
                    }
                    className="px-3 py-1 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed rounded-lg text-xs text-white transition-all"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingChunk(null);
                      setEditChunkDetails(null);
                    }}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-white/70 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-white/90 leading-relaxed text-sm">
                {chunk.content.length > 200
                  ? chunk.content.slice(0, 200) + "..."
                  : chunk.content}
              </p>
            )}
          </div>
          <motion.div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background:
                "radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)",
            }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
export default ChunkCard;
