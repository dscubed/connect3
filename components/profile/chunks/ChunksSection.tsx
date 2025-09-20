"use client";
import { motion } from "framer-motion";
import { useChunksManager } from "./hooks/useChunksManager";
import { useAuthStore } from "@/stores/authStore";
import { useProfileChunkStore } from "@/stores/profiles/profileChunkStore";
import { EmptyChunksState } from "./EmptyChunksState";
import { CubeLoader } from "@/components/ui/CubeLoader";
import { CategorySection } from "./chunk-list/CategorySection";

interface ChunksSectionProps {
  userId: string;
}

export default function ChunksSection({ userId }: ChunksSectionProps) {
  useChunksManager(userId); // Only for logic (loading, grouping, etc.)

  const chunks = useProfileChunkStore((s) => s.chunks);
  const groupedChunks = useProfileChunkStore((s) => s.groupedChunks);
  const loading = useProfileChunkStore((s) => s.loading);
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
            <CategorySection
              key={category}
              category={category}
              chunks={categoryChunks}
              index={categoryIndex}
            />
          )
        )}
      </div>
    </motion.div>
  );
}
