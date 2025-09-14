import { Chunk } from "./ChunksSection";
import { motion } from "framer-motion";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Trash2,
  FileText,
} from "lucide-react";

interface ChunkCardProps {
  chunk: Chunk;
  index: number;
  expandedChunk: string | null;
  onToggleExpansion: (id: string) => void;
  onDelete: (id: string) => void;
  formatDate: (date: string) => string;
  truncateContent: (content: string, maxLength?: number) => string;
}

// Chunk Card Component
export const ChunkCard = ({
  chunk,
  index,
  expandedChunk,
  onToggleExpansion,
  onDelete,
  formatDate,
  truncateContent,
}: ChunkCardProps) => {
  const isExpanded = expandedChunk === chunk.id;
  const hasLongContent = chunk.summary_text.length > 100;

  return (
    <motion.div
      className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer relative"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      onClick={() => onToggleExpansion(chunk.id)}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="text-white/80 mt-1">
            <FileText className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <motion.div initial={false} transition={{ duration: 0.3 }}>
              <p className="text-white/70 text-sm mb-2 leading-relaxed">
                {isExpanded
                  ? chunk.summary_text
                  : truncateContent(chunk.summary_text)}
              </p>
            </motion.div>

            <div className="flex items-center gap-4 text-xs text-white/50">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(chunk.created_at)}
              </div>
              {hasLongContent && (
                <div className="flex items-center gap-1 text-white/80">
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-3 w-3" />
                      <span>Show less</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3" />
                      <span>Show more</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(chunk.id);
            }}
            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-white/60 hover:text-red-400"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
