import { motion } from "framer-motion";
import { X, Plus, Upload } from "lucide-react";

interface AddChunkCardProps {
  isAdding: boolean;
  onAdd: () => void;
  onCancel: () => void;
  onUpload: () => void;
  newChunkText: string;
  setNewChunkText: (text: string) => void;
  isUploading: boolean;
}

// Add Chunk Card Component
export const AddChunkCard = ({
  isAdding,
  onAdd,
  onCancel,
  onUpload,
  newChunkText,
  setNewChunkText,
  isUploading,
}: AddChunkCardProps) => {
  const cardAnimation = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  };

  if (isAdding) {
    return (
      <motion.div
        className="bg-white/5 rounded-xl p-4 border border-white/20"
        {...cardAnimation}
      >
        <div className="space-y-4">
          <textarea
            value={newChunkText}
            onChange={(e) => setNewChunkText(e.target.value)}
            placeholder="Enter your text content here..."
            className="w-full h-32 p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 resize-none focus:outline-none focus:border-white/40 transition-colors"
            autoFocus
            disabled={isUploading}
          />
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={onCancel}
              disabled={isUploading}
              className="px-4 py-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              onClick={onUpload}
              disabled={!newChunkText.trim() || isUploading}
              className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white/5 rounded-xl p-3 border border-dashed border-white/20 hover:border-white/40 transition-colors cursor-pointer"
      onClick={onAdd}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      {...cardAnimation}
    >
      <div className="flex items-center justify-center py-4">
        <div className="flex items-center gap-3">
          <div className="text-white/80">
            <Plus className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-medium text-white text-sm">Add New Chunk</h3>
            <p className="text-white/60 text-xs">Upload a document</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
