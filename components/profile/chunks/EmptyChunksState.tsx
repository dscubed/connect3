"use client";
import { motion } from "framer-motion";
import { ChevronsRight } from "lucide-react";
import { AddCategoryButton } from "./chunk-list/AddCategoryButton";

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
        {onboardingCompleted && <AddCategoryButton />}
        <div className="text-muted text-lg mb-2">No highlights added yet</div>
        <div className="text-muted text-sm">
          {onboardingCompleted ? (
            <>
              <div className="mb-8">Start adding your chunks</div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <p>
                Complete your onboarding to see your professional highlights
                here
              </p>
              <motion.a
                href="/onboarding"
                initial={{ scale: 0.95, boxShadow: "0 0 0px #fff" }}
                animate={{ scale: 1, boxShadow: "0 0 16px #fff3" }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 24px #fff4",
                  backgroundColor: "rgba(255,255,255,0.12)",
                  opacity: 0.7,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="inline-flex min-w-[110px] px-4 py-2 rounded-xl border border-white/30 bg-white/10 text-white/90 text-base font-semibold backdrop-blur-md shadow-lg justify-center items-center"
              >
                <span className="drop-shadow flex items-center gap-1">
                  Onboarding <ChevronsRight />
                </span>
              </motion.a>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
