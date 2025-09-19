import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { WORD_LIMIT, getWordCount, Chunk } from "../utils/ChunkUtils";

type ChunkCardProps = {
  chunk: Chunk;
  editingChunk: string | null;
  editChunkDetails: Chunk | null;
  setEditChunkDetails: (chunk: Chunk | null) => void;
  handleChunkClick: (chunk: Chunk) => void;
  handleDeleteChunk: (chunkId: string) => void;
  handleSaveEdit: () => void;
  handleCancel: () => void;
};

function ChunkCard({
  chunk,
  editingChunk,
  editChunkDetails,
  setEditChunkDetails,
  handleChunkClick,
  handleDeleteChunk,
  handleSaveEdit,
  handleCancel,
}: ChunkCardProps) {
  const isEditing = editingChunk === chunk.chunk_id;
  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSaveEdit();
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editChunkDetails)
      setEditChunkDetails({
        ...editChunkDetails,
        category: e.target.value.slice(0, 50),
      });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (editChunkDetails)
      setEditChunkDetails({ ...editChunkDetails, content: e.target.value });
  };
  return (
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
            onChange={handleCategoryChange}
            onKeyDown={handleEditKeyDown}
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
                onChange={handleContentChange}
                onKeyDown={handleEditKeyDown}
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
                  getWordCount(editChunkDetails?.content ?? "") > WORD_LIMIT ||
                  !(editChunkDetails?.content ?? "").trim() ||
                  !(editChunkDetails?.category ?? "").trim()
                }
                className="px-3 py-1 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed rounded-lg text-xs text-white transition-all"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
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
  );
}
export default ChunkCard;
