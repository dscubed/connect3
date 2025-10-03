"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CubeLoader } from "@/components/ui/CubeLoader";
import { DemoQuery } from "./types";
import DemoCompletedResponse from "./demo-ui/DemoCompletedResponse";
import { PlayIcon } from "lucide-react";

interface DemoSectionProps {
  selectedQuery: DemoQuery | null;
}

export function DemoSection({ selectedQuery }: DemoSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showResponse, setShowResponse] = useState(false);

  // Auto-trigger loading when selectedQuery changes
  useEffect(() => {
    if (selectedQuery) {
      setShowResponse(false);
      setIsLoading(true);

      // Simulate 2-second loading
      setTimeout(() => {
        setIsLoading(false);
        setShowResponse(true);
      }, 2000);
    } else {
      setIsLoading(false);
      setShowResponse(false);
    }
  }, [selectedQuery]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 py-8">
      {/* Demo Chat Interface */}
      <div className="bg-white/5 rounded-2xl p-6 min-h-[400px] space-y-6">
        {selectedQuery && (
          <div className="space-y-8">
            {/* User Query */}
            <motion.div
              className="text-right"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block">
                <div className="text-white/60 text-sm mb-1">you</div>
                <div className="text-white text-lg">{selectedQuery.query}</div>
              </div>
            </motion.div>

            {/* AI Response */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="text-white/60 text-sm mb-2">c3</div>

              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <p className="text-white/80">processing your search...</p>
                    <div className="flex justify-center py-8">
                      <CubeLoader size={48} />
                    </div>
                  </motion.div>
                ) : showResponse ? (
                  selectedQuery.response &&
                  Object.keys(selectedQuery.response).length > 0 ? (
                    <DemoCompletedResponse
                      key="response"
                      query={selectedQuery}
                    />
                  ) : (
                    <motion.div
                      key="coming-soon"
                      className="text-center py-12"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8 }}
                    >
                      <div className="text-6xl mb-4">🚧</div>
                      <h4 className="text-white font-semibold text-xl mb-2">
                        Demo Coming Soon
                      </h4>
                      <p className="text-white/60">
                        This demo experience is not available yet. Check back
                        soon!
                      </p>
                    </motion.div>
                  )
                ) : null}
              </AnimatePresence>
            </motion.div>
          </div>
        )}

        {!selectedQuery && (
          <div className="flex flex-row gap-2 items-center justify-center h-full">
            <button>
              <PlayIcon className="w-6 h-6 text-white/50 ml-2 animate-pulse" />
            </button>
            <p className="text-white/50 text-lg">
              Select a demo query to see connect3 in action!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
