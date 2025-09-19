import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ChunkPaginationProps {
  currentPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
}

export default function ChunkPagination({
  currentPage,
  totalPages,
  handlePageChange,
}: ChunkPaginationProps) {
  return (
    <motion.div
      className="flex items-center justify-center gap-4 mt-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <button
        onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
        disabled={currentPage === 0}
        className="p-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft className="h-4 w-4 text-white" />
      </button>
      <div className="flex gap-2">
        {Array.from({ length: totalPages }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => handlePageChange(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentPage ? "bg-white" : "bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
      <button
        onClick={() =>
          handlePageChange(Math.min(totalPages - 1, currentPage + 1))
        }
        disabled={currentPage === totalPages - 1}
        className="p-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <ChevronRight className="h-4 w-4 text-white" />
      </button>
    </motion.div>
  );
}
