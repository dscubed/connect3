"use client";

import { useEffect, useState } from "react";
import { Markdown } from "@/components/search/Messages/markdown";
import { ChevronDown, Search } from "lucide-react";
import type { ProgressEntry } from "../utils";
import { cn } from "@/lib/utils";

export function SearchProgressIndicator({
  progressEntries,
}: {
  progressEntries?: ProgressEntry[];
}) {
  const [dotCount, setDotCount] = useState(1);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prev) => (prev >= 3 ? 1 : prev + 1));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const dots = ".".repeat(dotCount);

  const iconMap: Record<string, React.ReactNode> = {
    search: <Search className="h-4 w-4 text-muted animate-pulse" />,
    reasoning: null,
  };

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-base text-muted"
      >
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            isExpanded ? "" : "-rotate-90"
          }`}
        />
        Thinking{dots}
      </button>

      {isExpanded &&
        Array.isArray(progressEntries) &&
        progressEntries.length > 0 && (
          <div className="relative pl-6">
            <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-300" />

            <div className="space-y-3">
              {progressEntries.map((entry, index) => {
                const block =
                  entry.kind === "search"
                    ? entry.queries.join(", ")
                    : entry.text.trim();

                if (!block) return null;

                return (
                  <div key={index} className="relative flex items-start gap-3">
                    <div
                      className={cn(
                        "absolute -left-6 flex h-5 w-5 items-center justify-center rounded-full",
                        iconMap[entry.kind] && "bg-white",
                      )}
                    >
                      <div className="h-4 w-4 flex items-center justify-center">
                        {iconMap[entry.kind]}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "text-sm text-muted",
                        entry.kind !== "search" && "italic",
                      )}
                    >
                      {entry.kind === "search" ? (
                        block
                      ) : entry.kind === "reasoning" ? (
                        <Markdown>{block}</Markdown>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
    </div>
  );
}
