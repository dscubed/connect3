import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import {
  WORD_LIMIT,
  getWordCount,
  Chunk,
  CATEGORY_LIMIT,
} from "../utils/ChunkUtils";
import {
  handleKeyDown,
  handleCategoryChange,
  handleContentChange,
} from "../utils/FormHandlers";
import { ChunkValidationResult } from "@/lib/onboarding/validation";

type ChunkCardProps = {
  chunk: Chunk;
  editingChunk: string | null;
  editChunkDetails: Chunk | null;
  setEditChunkDetails: React.Dispatch<React.SetStateAction<Chunk | null>>;
  handleChunkClick: (chunk: Chunk) => void;
  handleDeleteChunk: (chunkId: string) => void;
  validating: boolean;
  handleSaveEdit: () => void;
  handleCancel: () => void;
  validation?: ChunkValidationResult | null;
};

function ChunkCard({
  chunk,
  editingChunk,
  editChunkDetails,
  setEditChunkDetails,
  handleChunkClick,
  handleDeleteChunk,
  validating,
  handleSaveEdit,
  handleCancel,
  validation,
}: ChunkCardProps) {
  const isEditing = editingChunk === chunk.chunk_id;
  const onKeyDown = handleKeyDown(handleSaveEdit, handleCancel);
  const onCategoryChange = handleCategoryChange(setEditChunkDetails);
  const onContentChange = handleContentChange(setEditChunkDetails);
  const hasHardError =
    !!validation &&
    (!validation.safe ||
      !validation.relevant ||
      !validation.belongsToUser ||
      !validation.categoryValid ||
      !validation.categoryMatchesContent);
  const showSuggestion = validation && validation.suggestion;
  const needsAttention = !!validation && (hasHardError || showSuggestion);
  return (
    <motion.div
    className={`relative p-5 min-h-[180px] rounded-2xl border-2 backdrop-blur-md transition-all duration-300 cursor-pointer h-full
    ${
      needsAttention
        ? "border-amber-400/70 bg-amber-500/10 hover:border-amber-300 hover:bg-amber-500/15"
        : "border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/8"
    }`}
      whileHover={{ scale: 1.07, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => !isEditing && handleChunkClick(chunk)}
    >
      <div className="flex items-center justify-between mb-3">
        {isEditing ? (
          <input
            type="text"
            value={editChunkDetails?.category ?? ""}
            onChange={onCategoryChange}
            onKeyDown={onKeyDown}
            maxLength={CATEGORY_LIMIT}
            className="text-xs font-medium text-white/90 uppercase bg-white/10 px-2 py-1 rounded-full w-full focus:outline-none focus:border-white/40 border border-white/20 z-10"
            placeholder="Category"
          />
        ) : (
          <span className="inline-block text-xs font-medium text-white/60 uppercase bg-white/10 px-2 py-1 rounded-full truncate whitespace-nowrap">
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
            <div className="space-y-1">
              <textarea
                value={editChunkDetails?.content ?? ""}
                onChange={onContentChange}
                onKeyDown={onKeyDown}
                className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white/90 text-sm resize-none focus:outline-none focus:border-white/40"
                rows={6}
                autoFocus
              />
              <div
                className={`text-right text-xs ${
                  getWordCount(editChunkDetails?.content ?? "") > WORD_LIMIT
                    ? "text-red-400"
                    : "text-white/50"
                }`}
              >
                {getWordCount(editChunkDetails?.content ?? "")}/{WORD_LIMIT}{" "}
                words
              </div>
            </div>
            {showSuggestion && (
              <div className="mt-4 space-y-1">
                  <p className="text-xs text-white">
                    <span className="font-semibold">Suggestion:</span> {validation.suggestion}
                  </p>
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSaveEdit}
                disabled={
                  getWordCount(editChunkDetails?.content ?? "") > WORD_LIMIT ||
                  !(editChunkDetails?.content ?? "").trim() ||
                  !(editChunkDetails?.category ?? "").trim() ||
                  validating
                }
                className="px-3 py-1 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed rounded-lg text-xs text-white transition-all"
              >
                {validating ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Save"
                )}
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
