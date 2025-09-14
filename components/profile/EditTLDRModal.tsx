"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface EditTLDRModalProps {
  isOpen: boolean;
  value: string; // Changed from currentTLDR to value
  onClose: () => void;
  onSave: () => void;
  onChange: (tldr: string) => void; // Changed from setTLDR to onChange
}

export default function EditTLDRModal({
  isOpen,
  value,
  onClose,
  onSave,
  onChange,
}: EditTLDRModalProps) {
  const handleSave = () => {
    onSave();
  };

  const handleCancel = () => {
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleCancel}
        >
          <motion.div
            className="bg-[#1A1A1B] border border-white/20 rounded-2xl p-6 w-full max-w-2xl mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Edit TLDR</h3>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-white/60" />
              </button>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Tell us about yourself (TLDR)
              </label>
              <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="A brief summary about yourself, your background, interests, or what you're working on..."
                rows={6}
                maxLength={500}
                autoFocus
              />
              <p className="text-white/40 text-xs mt-2">
                {value.length}/500 characters
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
