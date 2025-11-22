import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronsRightIcon as Skip, Check } from "lucide-react";
import { useOnboardingContext } from "../context/OnboardingContext";
import { useProcessingStore } from "@/stores/processingStore";

export const OnboardingNavigation = () => {
  const {
    currentStep,
    onboardingCompleted,
    nextStep,
    canContinue,
    canSkip,
    prevStep,
    skipStep,
  } = useOnboardingContext();
  const { state } = useProcessingStore();

  const isProcessing =
    state === "parsing" ||
    state === "validating" ||
    state === "summarizing" ||
    state === "chunking";

  return (
    <motion.div
      className="flex items-center justify-center gap-4 mt-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
    >
      <AnimatePresence>
        {currentStep === 1 && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={prevStep}
            disabled={state === "chunking"}
            className="px-6 py-3 rounded-xl border border-white/20 text-white/70 hover:border-white/30 hover:text-white hover:bg-white/5 transition-all hover:scale-105 flex items-center gap-2"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Back
          </motion.button>
        )}
      </AnimatePresence>

      {canSkip() && (
        <button
          onClick={skipStep}
          disabled={isProcessing}
          className="px-6 py-3 rounded-xl border border-white/20 text-white/70 hover:border-white/30 hover:text-white hover:bg-white/5 transition-all hover:scale-105 flex items-center gap-2"
        >
          Skip for now
          <Skip className="h-4 w-4" />
        </button>
      )}

      {currentStep < 2 ? (
        <button
          onClick={nextStep}
          disabled={!canContinue()}
          className={`px-8 py-3 rounded-xl font-medium transition-all hover:scale-105 shadow-lg flex items-center gap-2 ${
            canContinue()
              ? "bg-white text-black hover:bg-white/90"
              : "bg-white/20 text-white/40 cursor-not-allowed"
          }`}
        >
          {isProcessing ? "Processing..." : "Continue"}
          <ArrowRight className="h-4 w-4" />
        </button>
      ) : (
        <button
          onClick={onboardingCompleted}
          className="px-8 py-3 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition-all hover:scale-105 shadow-lg flex items-center gap-2"
        >
          Complete Setup
          <Check className="h-4 w-4" />
        </button>
      )}
    </motion.div>
  );
};
