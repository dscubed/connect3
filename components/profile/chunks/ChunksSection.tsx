"use client";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useChunksManager } from "./hooks/useChunksManager";
import { useAuthStore } from "@/stores/authStore";
import { ChunkList } from "./chunk-list/ChunkList";
import { EmptyChunksState } from "./EmptyChunksState";
import { CubeLoader } from "@/components/ui/CubeLoader";

interface ChunksSectionProps {
  userId: string;
}

export default function ChunksSection({ userId }: ChunksSectionProps) {
  const { chunks, groupedChunks, expandedCategories, toggleCategory, loading } =
    useChunksManager(userId);
  const { profile } = useAuthStore.getState();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-32">
        <CubeLoader size={60} />
        <span className="text-white/70">Loading chunks...</span>
      </div>
    );
  }

  if (chunks.length === 0) {
    return (
      <EmptyChunksState onboardingCompleted={profile?.onboarding_completed} />
    );
  }

  return (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <div className="space-y-8">
        {Object.entries(groupedChunks).map(
          ([category, categoryChunks], categoryIndex) => (
            <motion.div
              key={category}
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
            >
              <div className="relative">
                <motion.button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between py-3 hover:bg-white/5 transition-all rounded-lg group"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center gap-4">
                    <h3 className="text-xl font-semibold text-white/90">
                      {category}
                    </h3>
                    <span className="text-sm text-white/50 bg-white/10 px-3 py-1 rounded-full">
                      {categoryChunks.length}
                    </span>
                  </div>
                  <motion.div
                    animate={{
                      rotate: expandedCategories.has(category) ? 180 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-5 w-5 text-white/50 group-hover:text-white/70 transition-colors" />
                  </motion.div>
                </motion.button>

                {/* Category Content */}
                {expandedCategories.has(category) && (
                  <ChunkList category={category} chunks={categoryChunks} />
                )}
              </div>
            </motion.div>
          )
        )}
      </div>
    </motion.div>
  );
}
