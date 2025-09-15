import React from "react";
import { motion } from "framer-motion";

interface ProgressIndicatorProps {
  totalSteps: number;
  currentStep: number;
}

export const ProgressIndicator = ({
  totalSteps,
  currentStep,
}: ProgressIndicatorProps) => {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <motion.div
          key={index}
          className={`h-2 w-8 rounded-full transition-all duration-300 ${
            index <= currentStep ? "bg-white" : "bg-white/20"
          }`}
          animate={{
            scale: index === currentStep ? 1.2 : 1,
          }}
        />
      ))}
    </div>
  );
};
