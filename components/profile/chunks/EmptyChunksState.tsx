"use client";
import { motion } from "framer-motion";

interface EmptyChunksStateProps {
  onboardingCompleted?: boolean;
}

export function EmptyChunksState({
  onboardingCompleted,
}: EmptyChunksStateProps) {
  return (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <div className="text-center py-12">
        <div className="text-white/40 text-lg mb-2">
          No highlights added yet
        </div>
        <div className="text-white/30 text-sm">
          {onboardingCompleted ? (
            "Start adding highlights to showcase your professional journey"
          ) : (
            <>
              <a href="/onboarding" className="text-blue-500 hover:underline">
                Onboarding
              </a>
              <p>
                Complete your onboarding to see your professional highlights
                here
              </p>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
