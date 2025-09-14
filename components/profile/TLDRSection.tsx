"use client";
import { motion } from "framer-motion";
import { Edit3 } from "lucide-react";

interface TLDRSectionProps {
  tldr: string | null;
  onEdit: () => void;
}

export default function TLDRSection({ tldr, onEdit }: TLDRSectionProps) {
  if (!tldr) return null;

  return (
    <motion.div
      className="bg-white/5 rounded-2xl p-6 md:p-8 border border-white/10 backdrop-blur-sm mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">tldr</h2>
        <motion.button
          className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onEdit}
        >
          <Edit3 className="h-4 w-4" />
        </motion.button>
      </div>

      <p className="text-white/80 leading-relaxed text-lg whitespace-pre-wrap">
        {tldr}
      </p>
    </motion.div>
  );
}
