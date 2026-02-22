"use client";

import { useTokenUsage } from "@/hooks/useTokenUsage";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

const SIZE = 36;
const STROKE = 3.5;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const MIN_ARC = CIRCUMFERENCE * 0.03;

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return String(n);
}

export function TokenUsageIndicator() {
  const { tokensUsed, percentUsed, resetsAt, isLoading, maxTokens, tier } =
    useTokenUsage();

  if (isLoading || !maxTokens) return null;

  const clamped = Math.min(100, Math.max(0, percentUsed));
  const usedArc = (clamped / 100) * CIRCUMFERENCE;
  const visibleArc = tokensUsed > 0 ? Math.max(usedArc, MIN_ARC) : 0;
  const offset = CIRCUMFERENCE - visibleArc;

  let strokeColor = "stroke-purple-500";
  let textColor = "text-purple-600";
  let barColor = "bg-purple-500";
  if (clamped >= 100) {
    strokeColor = "stroke-red-500";
    textColor = "text-red-600";
    barColor = "bg-red-500";
  } else if (clamped > 80) {
    strokeColor = "stroke-amber-500";
    textColor = "text-amber-600";
    barColor = "bg-amber-500";
  }

  const resetsAtStr = resetsAt
    ? new Date(resetsAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative flex items-center justify-center animate-in fade-in duration-300 cursor-pointer hover:scale-110 transition-transform"
        >
          <svg
            width={SIZE}
            height={SIZE}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="-rotate-90"
          >
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              strokeWidth={STROKE}
              className="stroke-neutral-200"
            />
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              className={`${strokeColor} transition-[stroke-dashoffset] duration-500`}
            />
          </svg>
          <span
            className={`absolute text-[9px] font-semibold ${textColor}`}
          >
            {Math.round(clamped)}%
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        className="w-56 p-3 text-sm"
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Usage</span>
            <span className="font-medium whitespace-nowrap">{formatTokens(tokensUsed)} / {formatTokens(maxTokens)}</span>
          </div>
          <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
              style={{ width: `${clamped}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground whitespace-nowrap">
            <span className="capitalize">{tier} tier</span>
            {resetsAtStr && <span>Resets {resetsAtStr}</span>}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
