'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X } from 'lucide-react';

interface FileListProps {
  files: File[];
  onRemove: (index: number) => void;
}

export const FileList: React.FC<FileListProps> = ({ files, onRemove }) => {
  return (
    <motion.div
      className="w-64 ml-4 flex-shrink-0"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            <h3 className="text-white/80 text-sm font-medium mb-2">Files</h3>
            {files.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, scale: 0.8 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm group hover:bg-white/8 transition-all"
              >
                <FileText className="h-3 w-3 text-white/60 flex-shrink-0" />
                <span className="text-white/80 text-xs truncate flex-1">
                  {file.name}
                </span>
                <span className="text-white/40 text-xs">
                  {Math.round(file.size / 1024)}KB
                </span>
                <motion.button
                  onClick={() => onRemove(index)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-2 w-2" />
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
