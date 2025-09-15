import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Step {
  title: string;
  subtitle: string;
  content: React.ReactNode;
}

interface StepContentProps {
  currentStep: number;
  steps: Step[];
}

export const StepContent = ({ currentStep, steps }: StepContentProps) => {
  return (
    <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="text-center space-y-12"
        >
          <div className="space-y-4">
            <motion.h1
              className="text-4xl md:text-5xl tracking-tight font-extrabold"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {steps[currentStep].title}
            </motion.h1>
            <motion.p
              className="text-white/70 text-lg max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {steps[currentStep].subtitle}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {steps[currentStep].content}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
