import { AnimatePresence, motion } from "framer-motion";
import { Brain, CheckCircle2, Loader } from "lucide-react";
import { ThinkingStep } from "../utils";

export function ThinkingProgress({ steps }: { steps: ThinkingStep[] }) {
  if (steps.length === 0) return null;

  const latest = steps[steps.length - 1];
  const isComplete = !latest.nextThoughtNeeded;

  return (
    <div className="flex flex-col space-y-3 mb-4">
      <div className="flex items-center space-x-2">
        <Brain className="w-4 h-4 text-muted" />
        <span className="text-sm font-medium text-muted">
          {isComplete
            ? `Thought through ${steps.length} steps`
            : `Thinking... ${latest.thoughtNumber}/${latest.totalThoughts} steps`}
        </span>
      </div>

      <div className="border-l-2 border-muted/30 pl-4 space-y-2">
        <AnimatePresence mode="popLayout">
          {steps.map((step, i) => {
            const isLast = i === steps.length - 1;
            const isActive = isLast && step.nextThoughtNeeded;

            return (
              <motion.div
                key={`thought-${step.thoughtNumber}-${i}`}
                className="flex items-start space-x-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {isActive ? (
                  <Loader className="w-4 h-4 mt-0.5 animate-spin flex-shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-muted flex-shrink-0" />
                )}
                <span
                  className={`text-sm ${isActive ? "animate-pulse" : "text-muted"}`}
                >
                  {step.isRevision ? "Revising: " : ""}
                  {step.thought}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
