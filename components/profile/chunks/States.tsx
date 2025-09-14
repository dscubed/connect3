import { motion } from "framer-motion";
import { CubeLoader } from "@/components/ui/CubeLoader";
import { FileText } from "lucide-react";

// Loading State Component
export const LoadingState = ({
  message = "Loading chunks...",
}: {
  message?: string;
}) => (
  <motion.div
    className="bg-white/5 rounded-2xl p-6 md:p-8 border border-white/10 backdrop-blur-sm mb-8"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 1.2 }}
  >
    <h2 className="text-2xl font-bold mb-6">Chunks</h2>
    <div className="text-white/60 text-center py-12">
      <CubeLoader size={48} />
      <p>{message}</p>
    </div>
  </motion.div>
);

// Error State Component
export const ErrorState = ({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) => (
  <motion.div
    className="bg-white/5 rounded-2xl p-6 md:p-8 border border-white/10 backdrop-blur-sm mb-8"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 1.2 }}
  >
    <h2 className="text-2xl font-bold mb-6">Chunks</h2>
    <div className="text-red-400 text-center py-12">
      <p>{error}</p>
      <button
        onClick={onRetry}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  </motion.div>
);

// Empty State Component
export const EmptyState = () => (
  <div className="text-white/60 text-center py-8 mb-4">
    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
    <p className="text-lg mb-2">No chunks uploaded yet</p>
    <p className="text-sm mb-4">Upload documents to see them here</p>
  </div>
);
